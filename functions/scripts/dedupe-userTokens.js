#!/usr/bin/env node

"use strict";

/* eslint-disable require-jsdoc */

const admin = require("firebase-admin");

const PROJECT_ID = "tarrot-590ee";
const DEFAULT_PAGE_SIZE = 500;
const MAX_BATCH_OPERATIONS = 450;
const MERGE_FIELDS = ["language", "isIos", "projectId"];

function printUsage() {
  console.log(`
Usage:
  node scripts/dedupe-userTokens.js [--apply] [--token <expoToken>] [--limit <n>] [--page-size <n>]

Options:
  --apply              Apply updates and delete duplicate documents.
  --dry-run            Preview mode. This is the default.
  --token <expoToken>  Process only one normalized token value.
  --limit <n>          Limit how many duplicate groups are processed.
  --page-size <n>      Firestore page size for scanning. Default: ${DEFAULT_PAGE_SIZE}.
  --help               Show this help message.
`);
}

function parsePositiveInteger(value, flagName) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Invalid value for ${flagName}: ${value}`);
  }
  return parsed;
}

function parseArgs(argv) {
  const options = {
    apply: false,
    token: null,
    limit: null,
    pageSize: DEFAULT_PAGE_SIZE,
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--help" || arg === "-h") {
      options.help = true;
      continue;
    }

    if (arg === "--apply") {
      options.apply = true;
      continue;
    }

    if (arg === "--dry-run") {
      options.apply = false;
      continue;
    }

    if (arg === "--token") {
      const nextValue = argv[i + 1];
      if (!nextValue) {
        throw new Error("Missing value for --token");
      }
      options.token = nextValue;
      i += 1;
      continue;
    }

    if (arg === "--limit") {
      const nextValue = argv[i + 1];
      if (!nextValue) {
        throw new Error("Missing value for --limit");
      }
      options.limit = parsePositiveInteger(nextValue, "--limit");
      i += 1;
      continue;
    }

    if (arg === "--page-size") {
      const nextValue = argv[i + 1];
      if (!nextValue) {
        throw new Error("Missing value for --page-size");
      }
      options.pageSize = parsePositiveInteger(nextValue, "--page-size");
      i += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function normalizeToken(token) {
  return token.trim();
}

function hasMeaningfulValue(fieldName, value) {
  if (fieldName === "isIos") {
    return typeof value === "boolean";
  }

  return typeof value === "string" && value.trim().length > 0;
}

function getDocQualityScore(docInfo) {
  return MERGE_FIELDS.reduce((score, fieldName) => {
    return score + (hasMeaningfulValue(fieldName, docInfo.data[fieldName]) ? 1 : 0);
  }, 0);
}

function getCreateTimeMillis(docInfo) {
  if (docInfo.createTime && typeof docInfo.createTime.toMillis === "function") {
    return docInfo.createTime.toMillis();
  }
  return Number.POSITIVE_INFINITY;
}

function compareDocPriority(left, right) {
  const scoreDiff = getDocQualityScore(right) - getDocQualityScore(left);
  if (scoreDiff !== 0) {
    return scoreDiff;
  }

  const createTimeDiff = getCreateTimeMillis(left) - getCreateTimeMillis(right);
  if (createTimeDiff !== 0) {
    return createTimeDiff;
  }

  return left.id.localeCompare(right.id);
}

function buildMergedData(sortedDocs, normalizedToken) {
  const canonical = sortedDocs[0];
  const mergedData = Object.assign({}, canonical.data, {token: normalizedToken});

  MERGE_FIELDS.forEach((fieldName) => {
    if (hasMeaningfulValue(fieldName, mergedData[fieldName])) {
      return;
    }

    for (let i = 1; i < sortedDocs.length; i += 1) {
      const candidateValue = sortedDocs[i].data[fieldName];
      if (hasMeaningfulValue(fieldName, candidateValue)) {
        mergedData[fieldName] = candidateValue;
        return;
      }
    }
  });

  return mergedData;
}

function diffMergedFields(originalData, mergedData) {
  const update = {};

  if (originalData.token !== mergedData.token) {
    update.token = mergedData.token;
  }

  MERGE_FIELDS.forEach((fieldName) => {
    if (Object.prototype.hasOwnProperty.call(mergedData, fieldName) &&
      !Object.is(originalData[fieldName], mergedData[fieldName])) {
      update[fieldName] = mergedData[fieldName];
    }
  });

  return update;
}

async function scanUserTokens(db, options) {
  const groupedByToken = new Map();
  const invalidDocs = [];
  let scannedDocs = 0;
  let validTokenDocs = 0;
  let lastDoc = null;
  let hasMore = true;

  while (hasMore) {
    let query = db.collection("userTokens")
        .orderBy(admin.firestore.FieldPath.documentId())
        .limit(options.pageSize);

    if (lastDoc) {
      query = query.startAfter(lastDoc);
    }

    const snapshot = await query.get();
    if (snapshot.empty) {
      break;
    }

    snapshot.docs.forEach((docSnap) => {
      scannedDocs += 1;

      const data = docSnap.data() || {};
      if (typeof data.token !== "string") {
        invalidDocs.push({
          id: docSnap.id,
          reason: "token is missing or not a string",
        });
        return;
      }

      const normalizedToken = normalizeToken(data.token);
      if (!normalizedToken) {
        invalidDocs.push({
          id: docSnap.id,
          reason: "token is empty after trim",
        });
        return;
      }

      validTokenDocs += 1;

      if (options.token && normalizedToken !== options.token) {
        return;
      }

      const docInfo = {
        id: docSnap.id,
        ref: docSnap.ref,
        createTime: docSnap.createTime || null,
        data,
      };

      if (!groupedByToken.has(normalizedToken)) {
        groupedByToken.set(normalizedToken, []);
      }
      groupedByToken.get(normalizedToken).push(docInfo);
    });

    lastDoc = snapshot.docs[snapshot.docs.length - 1];
    hasMore = snapshot.size === options.pageSize;
  }

  return {
    groupedByToken,
    invalidDocs,
    scannedDocs,
    validTokenDocs,
  };
}

function buildDuplicatePlan(groupedByToken, limit) {
  const duplicateGroups = [];

  Array.from(groupedByToken.keys())
      .sort()
      .forEach((normalizedToken) => {
        const docs = groupedByToken.get(normalizedToken);
        if (!docs || docs.length <= 1) {
          return;
        }

        const sortedDocs = docs.slice().sort(compareDocPriority);
        duplicateGroups.push({
          normalizedToken,
          docs: sortedDocs,
        });
      });

  const processedGroups = limit ? duplicateGroups.slice(0, limit) : duplicateGroups;
  return {
    duplicateGroupsFound: duplicateGroups.length,
    processedGroups,
  };
}

async function applyDuplicatePlan(processedGroups, applyChanges) {
  const summary = {
    docsKept: 0,
    docsUpdated: 0,
    docsDeleted: 0,
    duplicateGroupsProcessed: processedGroups.length,
  };

  let batch = null;
  let batchOpCount = 0;

  async function commitBatchIfNeeded(force) {
    if (!applyChanges || !batch || batchOpCount === 0) {
      return;
    }

    if (!force && batchOpCount < MAX_BATCH_OPERATIONS) {
      return;
    }

    await batch.commit();
    batch = null;
    batchOpCount = 0;
  }

  function ensureBatch() {
    if (!batch) {
      batch = admin.firestore().batch();
    }
    return batch;
  }

  for (const group of processedGroups) {
    const normalizedToken = group.normalizedToken;
    const sortedDocs = group.docs;
    const canonical = sortedDocs[0];
    const duplicates = sortedDocs.slice(1);
    const mergedData = buildMergedData(sortedDocs, normalizedToken);
    const updatePayload = diffMergedFields(canonical.data, mergedData);

    summary.docsKept += 1;

    console.log("");
    console.log(`Token: ${normalizedToken}`);
    console.log(`Keep: ${canonical.id}`);
    console.log(`Delete: ${duplicates.map((docInfo) => docInfo.id).join(", ")}`);

    if (Object.keys(updatePayload).length > 0) {
      summary.docsUpdated += 1;
      console.log(`Update keep doc with: ${JSON.stringify(updatePayload)}`);
    } else {
      console.log("Update keep doc with: none");
    }

    if (!applyChanges) {
      summary.docsDeleted += duplicates.length;
      continue;
    }

    if (Object.keys(updatePayload).length > 0) {
      ensureBatch().update(canonical.ref, updatePayload);
      batchOpCount += 1;
      await commitBatchIfNeeded(false);
    }

    for (const docInfo of duplicates) {
      ensureBatch().delete(docInfo.ref);
      batchOpCount += 1;
      summary.docsDeleted += 1;
      await commitBatchIfNeeded(false);
    }
  }

  await commitBatchIfNeeded(true);
  return summary;
}

function printInvalidDocs(invalidDocs) {
  if (invalidDocs.length === 0) {
    return;
  }

  console.log("");
  console.log("Skipped invalid docs:");
  invalidDocs.forEach((item) => {
    console.log(`- ${item.id}: ${item.reason}`);
  });
}

function printSummary(context) {
  console.log("");
  console.log("Summary:");
  console.log(`- mode: ${context.applyChanges ? "apply" : "dry-run"}`);
  console.log(`- scanned docs: ${context.scannedDocs}`);
  console.log(`- valid token docs: ${context.validTokenDocs}`);
  console.log(`- duplicate groups found: ${context.duplicateGroupsFound}`);
  console.log(`- duplicate groups processed: ${context.duplicateGroupsProcessed}`);
  console.log(`- docs kept: ${context.docsKept}`);
  console.log(`- docs updated: ${context.docsUpdated}`);
  console.log(`- docs deleted: ${context.docsDeleted}`);
  console.log(`- skipped invalid docs: ${context.skippedInvalidDocs}`);
  if (context.tokenFilter) {
    console.log(`- token filter: ${context.tokenFilter}`);
  }
  if (context.limit) {
    console.log(`- group limit: ${context.limit}`);
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printUsage();
    return;
  }

  const normalizedTokenFilter = options.token ? normalizeToken(options.token) : null;
  if (options.token && !normalizedTokenFilter) {
    throw new Error("The provided --token value is empty after trim");
  }

  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: PROJECT_ID,
  });

  const db = admin.firestore();
  const scanResult = await scanUserTokens(db, {
    token: normalizedTokenFilter,
    pageSize: options.pageSize,
  });
  const duplicatePlan = buildDuplicatePlan(
      scanResult.groupedByToken,
      options.limit,
  );
  const actionSummary = await applyDuplicatePlan(
      duplicatePlan.processedGroups,
      options.apply,
  );

  printInvalidDocs(scanResult.invalidDocs);
  printSummary({
    applyChanges: options.apply,
    scannedDocs: scanResult.scannedDocs,
    validTokenDocs: scanResult.validTokenDocs,
    duplicateGroupsFound: duplicatePlan.duplicateGroupsFound,
    duplicateGroupsProcessed: actionSummary.duplicateGroupsProcessed,
    docsKept: actionSummary.docsKept,
    docsUpdated: actionSummary.docsUpdated,
    docsDeleted: actionSummary.docsDeleted,
    skippedInvalidDocs: scanResult.invalidDocs.length,
    tokenFilter: normalizedTokenFilter,
    limit: options.limit,
  });
}

main()
    .catch((error) => {
      console.error("dedupe-userTokens failed:", error);
      process.exitCode = 1;
    });

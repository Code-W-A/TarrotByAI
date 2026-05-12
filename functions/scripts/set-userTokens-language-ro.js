#!/usr/bin/env node

"use strict";

/* eslint-disable require-jsdoc */

// Node 20+ a eliminat `buffer.SlowBuffer`; transitive deps (ex. buffer-equal-constant-time via
// firebase-admin) îl folosesc încă. Trebuie înainte de `require("firebase-admin")`.
const buffer = require("buffer");
if (!buffer.SlowBuffer) {
  buffer.SlowBuffer = buffer.Buffer;
}

/**
 * Setează câmpul `language: "ro"` pe toate documentele din colecția `userTokens`.
 *
 * Cerințe: `gcloud auth application-default login` sau variabilă de mediu pentru
 * service account (același tip ca la `dedupe-userTokens.js`).
 *
 * Usage:
 *   node scripts/set-userTokens-language-ro.js --dry-run
 *   node scripts/set-userTokens-language-ro.js --apply
 *   node scripts/set-userTokens-language-ro.js --apply --page-size 300
 *
 * Dacă lipești din documentație și apare `# comentariu`, include-l după un spațiu:
 * shell-ul îl poate trimite ca argument separat; tot ce începe cu `#` este ignorat aici.
 */

const admin = require("firebase-admin");

const PROJECT_ID =
  process.env.GOOGLE_CLOUD_PROJECT ||
  process.env.GCLOUD_PROJECT ||
  process.env.FIREBASE_PROJECT_ID ||
  "tarrot-590ee";
const DEFAULT_PAGE_SIZE = 500;
const BATCH_LIMIT = 450;

function normalizeLanguage(language) {
  if (typeof language !== "string") {
    return "";
  }
  const normalized = language.trim().toLowerCase();
  if (!normalized) {
    return "";
  }
  return normalized.split(/[-_]/)[0];
}

function printUsage() {
  console.log(`
Usage:
  node scripts/set-userTokens-language-ro.js [--apply] [--dry-run] [--page-size <n>]

  --dry-run   Numără documentele care ar fi actualizate (implicit).
  --apply     Scrie în Firestore language=ro unde lipsește sau nu e ro.
  --page-size Dimensiune pagină la scanare (default ${DEFAULT_PAGE_SIZE}).
  --help      Afișează acest mesaj.
`);
}

function parseArgs(argv) {
  let apply = false;
  let pageSize = DEFAULT_PAGE_SIZE;
  let help = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      help = true;
      continue;
    }
    if (arg === "--apply") {
      apply = true;
      continue;
    }
    if (arg === "--dry-run") {
      apply = false;
      continue;
    }
    if (arg === "--page-size") {
      const n = parseInt(argv[i + 1], 10);
      if (!Number.isFinite(n) || n <= 0) {
        throw new Error("Invalid --page-size");
      }
      pageSize = Math.min(n, 1000);
      i += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return {apply, pageSize, help};
}

function stripArgvAfterHash(argv) {
  const idx = argv.findIndex(
      (a) => a === "#" || (typeof a === "string" && a.startsWith("#")),
  );
  return idx === -1 ? argv : argv.slice(0, idx);
}

async function main() {
  const options = parseArgs(stripArgvAfterHash(process.argv.slice(2)));
  if (options.help) {
    printUsage();
    return;
  }

  console.log(`Project: ${PROJECT_ID}`);
  if (!options.apply) {
    console.log("Mod dry-run (fără scrieri). Pentru a scrie în Firestore: adaugă --apply\n");
  }

  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: PROJECT_ID,
  });

  const db = admin.firestore();
  let cursor = null;
  let totalExamined = 0;
  let totalAlreadyRo = 0;
  let totalUpdated = 0;
  let totalWouldUpdate = 0;
  let pages = 0;
  let done = false;

  while (!done) {
    pages += 1;
    let q = db
        .collection("userTokens")
        .orderBy(admin.firestore.FieldPath.documentId())
        .limit(options.pageSize);
    if (cursor) {
      const cursorSnap = await db.collection("userTokens").doc(cursor).get();
      if (!cursorSnap.exists) {
        throw new Error(`Invalid cursor doc: ${cursor}`);
      }
      q = q.startAfter(cursorSnap);
    }

    const snap = await q.get();
    if (snap.empty) {
      done = true;
      break;
    }

    const refsToUpdate = [];
    let pageWouldUpdate = 0;
    for (const docSnap of snap.docs) {
      cursor = docSnap.id;
      totalExamined++;
      const data = docSnap.data() || {};
      if (normalizeLanguage(data.language) === "ro") {
        totalAlreadyRo++;
        continue;
      }
      pageWouldUpdate++;
      totalWouldUpdate++;
      if (options.apply) {
        refsToUpdate.push(docSnap.ref);
      }
    }

    if (options.apply && refsToUpdate.length > 0) {
      for (let i = 0; i < refsToUpdate.length; i += BATCH_LIMIT) {
        const batch = db.batch();
        const slice = refsToUpdate.slice(i, i + BATCH_LIMIT);
        slice.forEach((ref) => batch.update(ref, {language: "ro"}));
        await batch.commit();
        totalUpdated += slice.length;
      }
    }

    console.log(
        `[page ${pages}] docs=${snap.size} wouldUpdateThisPage=${pageWouldUpdate} cumulativeExamined=${totalExamined}`,
    );

    done = snap.size < options.pageSize;
  }

  console.log("---");
  console.log(
      options.apply ?
        `Done (apply). examined=${totalExamined} alreadyRo=${totalAlreadyRo} updated=${totalUpdated}` :
        `Done (dry-run). examined=${totalExamined} alreadyRo=${totalAlreadyRo} wouldUpdate=${totalWouldUpdate}`,
  );
}

main().catch((err) => {
  console.error("set-userTokens-language-ro failed:", err);
  process.exitCode = 1;
});

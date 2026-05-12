import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { AppState, Platform } from "react-native";
import {
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  getDocsFromServer,
  increment,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { authentication, db } from "../../firebase";

const READ_TELEMETRY_COLLECTION = "ReadTelemetryDaily";
const READ_TELEMETRY_CONFIG_PATH = "AppConfig/ReadTelemetry";
const READ_TELEMETRY_BUFFER_KEY = "@firestoreReadTelemetryBuffer:v1";
const READ_TELEMETRY_CONFIG_TTL_MS = 60 * 1000;
const DEFAULT_FLUSH_INTERVAL_SEC = 60;
const MAX_PRECONFIG_EVENTS = 300;
const MAX_PERSISTED_AGGREGATES = 500;

let currentTelemetryScreen = "unknown";
let currentTelemetryUid = authentication.currentUser?.uid || "";
let isGuestTelemetrySession = false;
let telemetryAggregates = new Map();
let queuedReadEvents = [];
let telemetryConfig = {
  loaded: false,
  fetchedAt: 0,
  enabled: false,
  allowedUids: [],
  flushIntervalSec: DEFAULT_FLUSH_INTERVAL_SEC,
  includeRealtimeSubscriptions: true,
};
let configPromise = null;
let hydratePromise = null;
let flushPromise = null;
let persistTimeout = null;
let flushInterval = null;
let lifecycleInitialized = false;
let lastAppState = AppState.currentState;

const normalizeTelemetryText = (value) =>
  typeof value === "string" ? value.trim() : "";

const getTodayKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const hashTelemetryValue = (value) => {
  let hash = 5381;
  const normalizedValue = String(value || "");
  for (let index = 0; index < normalizedValue.length; index += 1) {
    hash = (hash * 33) ^ normalizedValue.charCodeAt(index);
  }
  return Math.abs(hash >>> 0).toString(36);
};

const sanitizeDocIdPart = (value, fallback = "unknown") => {
  const normalizedValue = normalizeTelemetryText(String(value || fallback));
  const sanitizedValue = normalizedValue.replace(/[^a-zA-Z0-9_-]/g, "_");
  return sanitizedValue.slice(0, 80) || fallback;
};

const getAppVersion = () =>
  normalizeTelemetryText(
    Constants.expoConfig?.version ||
      Constants.manifest2?.extra?.expoClient?.version ||
      ""
  ) || "unknown";

const isExcludedTelemetryPath = (pattern, rawPath, collectionName) => {
  const normalizedPattern = normalizeTelemetryText(pattern);
  const normalizedRawPath = normalizeTelemetryText(rawPath);
  const normalizedCollectionName = normalizeTelemetryText(collectionName);

  if (!normalizedPattern && !normalizedRawPath && !normalizedCollectionName) {
    return true;
  }

  return (
    normalizedCollectionName === READ_TELEMETRY_COLLECTION ||
    normalizedPattern === READ_TELEMETRY_CONFIG_PATH ||
    normalizedRawPath === READ_TELEMETRY_CONFIG_PATH ||
    normalizedPattern.startsWith(`${READ_TELEMETRY_COLLECTION}/`) ||
    normalizedRawPath.startsWith(`${READ_TELEMETRY_COLLECTION}/`)
  );
};

const getQueryCollectionGroup = (target) => {
  const internalQuery = target?._query || target?._delegate?._query || null;
  return normalizeTelemetryText(internalQuery?.collectionGroup || "");
};

const getTargetPath = (target) => {
  if (!target) {
    return "";
  }

  if (typeof target === "string") {
    return normalizeTelemetryText(target);
  }

  if (typeof target.path === "string") {
    return normalizeTelemetryText(target.path);
  }

  const internalQuery = target?._query || target?._delegate?._query || null;
  const path =
    internalQuery?.path?.canonicalString?.() ||
    internalQuery?.path?.canonicalString ||
    internalQuery?.path?.toString?.() ||
    internalQuery?.path?.toString ||
    "";

  return normalizeTelemetryText(path);
};

const getCollectionMetadata = (target) => {
  const collectionGroup = getQueryCollectionGroup(target);
  if (collectionGroup) {
    return {
      collectionName: collectionGroup,
      collectionPathPattern: `**/${collectionGroup}`,
      rawPath: `**/${collectionGroup}`,
    };
  }

  const rawPath = getTargetPath(target);
  if (!rawPath) {
    return {
      collectionName: "unknown",
      collectionPathPattern: "unknown",
      rawPath: "",
    };
  }

  const segments = rawPath.split("/").filter(Boolean);
  if (segments.length === 0) {
    return {
      collectionName: "unknown",
      collectionPathPattern: "unknown",
      rawPath,
    };
  }

  const collectionName =
    segments.length % 2 === 0
      ? segments[segments.length - 2]
      : segments[segments.length - 1];
  const collectionPathPattern = segments
    .map((segment, index) => (index % 2 === 1 ? "{doc}" : segment))
    .join("/");

  return {
    collectionName: collectionName || "unknown",
    collectionPathPattern: collectionPathPattern || "unknown",
    rawPath,
  };
};

const buildAggregateKey = ({ date, uid, screenName, collectionPathPattern }) =>
  [date, uid || "no_uid", screenName || "unknown", collectionPathPattern || "unknown"].join(
    "__"
  );

const buildAggregateDocId = (aggregate) => {
  const screenPart = sanitizeDocIdPart(aggregate.screenName, "unknown");
  const uidPart = sanitizeDocIdPart(aggregate.uid, "no_uid");
  const patternHash = hashTelemetryValue(
    `${aggregate.screenName}|${aggregate.collectionPathPattern}`
  );
  return `${aggregate.date}__${uidPart}__${screenPart}__${patternHash}`;
};

const mergeAggregateValues = (baseAggregate, nextAggregate) => ({
  ...baseAggregate,
  logicalReadCalls:
    Number(baseAggregate.logicalReadCalls || 0) +
    Number(nextAggregate.logicalReadCalls || 0),
  docReadCalls:
    Number(baseAggregate.docReadCalls || 0) +
    Number(nextAggregate.docReadCalls || 0),
  queryReadCalls:
    Number(baseAggregate.queryReadCalls || 0) +
    Number(nextAggregate.queryReadCalls || 0),
  serverReadCalls:
    Number(baseAggregate.serverReadCalls || 0) +
    Number(nextAggregate.serverReadCalls || 0),
  estimatedServerDocReads:
    Number(baseAggregate.estimatedServerDocReads || 0) +
    Number(nextAggregate.estimatedServerDocReads || 0),
  cacheHits:
    Number(baseAggregate.cacheHits || 0) + Number(nextAggregate.cacheHits || 0),
  realtimeSubscriptions:
    Number(baseAggregate.realtimeSubscriptions || 0) +
    Number(nextAggregate.realtimeSubscriptions || 0),
  lastUpdatedMs: Math.max(
    Number(baseAggregate.lastUpdatedMs || 0),
    Number(nextAggregate.lastUpdatedMs || 0)
  ),
});

const clearFlushInterval = () => {
  if (flushInterval) {
    clearInterval(flushInterval);
    flushInterval = null;
  }
};

const ensureFlushInterval = () => {
  clearFlushInterval();

  if (!isTelemetryAllowedFromConfig()) {
    return;
  }

  const intervalSeconds =
    Number.isFinite(Number(telemetryConfig.flushIntervalSec)) &&
    Number(telemetryConfig.flushIntervalSec) > 0
      ? Math.floor(Number(telemetryConfig.flushIntervalSec))
      : DEFAULT_FLUSH_INTERVAL_SEC;

  flushInterval = setInterval(() => {
    void flushReadTelemetry("interval");
  }, intervalSeconds * 1000);
};

const persistTelemetryAggregatesNow = async () => {
  const payload = Array.from(telemetryAggregates.values())
    .sort((left, right) => Number(right.lastUpdatedMs || 0) - Number(left.lastUpdatedMs || 0))
    .slice(0, MAX_PERSISTED_AGGREGATES);

  if (payload.length === 0) {
    await AsyncStorage.removeItem(READ_TELEMETRY_BUFFER_KEY);
    return;
  }

  await AsyncStorage.setItem(READ_TELEMETRY_BUFFER_KEY, JSON.stringify(payload));
};

const scheduleTelemetryPersist = () => {
  if (persistTimeout) {
    clearTimeout(persistTimeout);
  }

  persistTimeout = setTimeout(() => {
    persistTimeout = null;
    void persistTelemetryAggregatesNow().catch((error) => {
      console.warn("[FirestoreReadTelemetry] Failed to persist buffer", error);
    });
  }, 1500);
};

const ensureTelemetryHydrated = async () => {
  if (hydratePromise) {
    return hydratePromise;
  }

  hydratePromise = (async () => {
    try {
      const rawBuffer = await AsyncStorage.getItem(READ_TELEMETRY_BUFFER_KEY);
      if (!rawBuffer) {
        return;
      }

      const parsedBuffer = JSON.parse(rawBuffer);
      if (!Array.isArray(parsedBuffer)) {
        return;
      }

      parsedBuffer.forEach((aggregate) => {
        if (!aggregate || typeof aggregate !== "object") {
          return;
        }

        const aggregateKey = buildAggregateKey({
          date: aggregate.date,
          uid: aggregate.uid,
          screenName: aggregate.screenName,
          collectionPathPattern: aggregate.collectionPathPattern,
        });

        const existingAggregate = telemetryAggregates.get(aggregateKey);
        telemetryAggregates.set(
          aggregateKey,
          existingAggregate
            ? mergeAggregateValues(existingAggregate, aggregate)
            : aggregate
        );
      });
    } catch (error) {
      console.warn("[FirestoreReadTelemetry] Failed to hydrate buffer", error);
    }
  })();

  return hydratePromise;
};

const enqueuePreconfigEvent = (event) => {
  if (queuedReadEvents.length >= MAX_PRECONFIG_EVENTS) {
    queuedReadEvents.shift();
  }
  queuedReadEvents.push(event);
};

const normalizeTelemetryConfig = (snapshotData) => {
  const allowedUids = Array.isArray(snapshotData?.allowedUids)
    ? snapshotData.allowedUids
        .map((uid) => normalizeTelemetryText(uid))
        .filter(Boolean)
    : [];

  const flushIntervalSec =
    Number.isFinite(Number(snapshotData?.flushIntervalSec)) &&
    Number(snapshotData?.flushIntervalSec) > 0
      ? Math.floor(Number(snapshotData.flushIntervalSec))
      : DEFAULT_FLUSH_INTERVAL_SEC;

  return {
    loaded: true,
    fetchedAt: Date.now(),
    enabled: snapshotData?.enabled === true,
    allowedUids,
    flushIntervalSec,
    includeRealtimeSubscriptions:
      snapshotData?.includeRealtimeSubscriptions !== false,
  };
};

const isTelemetryAllowedFromConfig = () => {
  if (!currentTelemetryUid || isGuestTelemetrySession) {
    return false;
  }

  return (
    telemetryConfig.enabled &&
    Array.isArray(telemetryConfig.allowedUids) &&
    telemetryConfig.allowedUids.includes(currentTelemetryUid)
  );
};

const applyReadEvent = (event) => {
  const metadata = event?.target
    ? getCollectionMetadata(event.target)
    : {
        collectionName: normalizeTelemetryText(event?.collectionName) || "unknown",
        collectionPathPattern:
          normalizeTelemetryText(event?.collectionPathPattern) || "unknown",
        rawPath: normalizeTelemetryText(event?.rawPath),
      };

  if (
    isExcludedTelemetryPath(
      metadata.collectionPathPattern,
      metadata.rawPath,
      metadata.collectionName
    )
  ) {
    return;
  }

  if (
    Number(event?.realtimeSubscriptions || 0) > 0 &&
    telemetryConfig.includeRealtimeSubscriptions === false
  ) {
    return;
  }

  const aggregate = {
    date: getTodayKey(),
    uid: currentTelemetryUid,
    screenName:
      normalizeTelemetryText(event?.screenName) || currentTelemetryScreen || "unknown",
    collectionName: metadata.collectionName || "unknown",
    collectionPathPattern: metadata.collectionPathPattern || "unknown",
    logicalReadCalls: Number(event?.logicalReadCalls || 0),
    docReadCalls: Number(event?.docReadCalls || 0),
    queryReadCalls: Number(event?.queryReadCalls || 0),
    serverReadCalls: Number(event?.serverReadCalls || 0),
    estimatedServerDocReads: Number(event?.estimatedServerDocReads || 0),
    cacheHits: Number(event?.cacheHits || 0),
    realtimeSubscriptions: Number(event?.realtimeSubscriptions || 0),
    platform: Platform.OS,
    appVersion: getAppVersion(),
    lastUpdatedMs: Date.now(),
  };

  const aggregateKey = buildAggregateKey(aggregate);
  const existingAggregate = telemetryAggregates.get(aggregateKey);
  telemetryAggregates.set(
    aggregateKey,
    existingAggregate
      ? mergeAggregateValues(existingAggregate, aggregate)
      : aggregate
  );
  scheduleTelemetryPersist();
};

const drainQueuedEvents = () => {
  if (!isTelemetryAllowedFromConfig() || queuedReadEvents.length === 0) {
    queuedReadEvents = [];
    return;
  }

  const pendingEvents = [...queuedReadEvents];
  queuedReadEvents = [];
  pendingEvents.forEach((event) => applyReadEvent(event));
};

const refreshTelemetryConfig = async (force = false) => {
  if (!currentTelemetryUid || isGuestTelemetrySession) {
    telemetryConfig = {
      ...telemetryConfig,
      loaded: true,
      fetchedAt: Date.now(),
      enabled: false,
      allowedUids: [],
      flushIntervalSec: DEFAULT_FLUSH_INTERVAL_SEC,
      includeRealtimeSubscriptions: true,
    };
    queuedReadEvents = [];
    clearFlushInterval();
    return telemetryConfig;
  }

  const isFresh =
    telemetryConfig.loaded &&
    !force &&
    Date.now() - telemetryConfig.fetchedAt < READ_TELEMETRY_CONFIG_TTL_MS;

  if (isFresh) {
    return telemetryConfig;
  }

  if (configPromise) {
    return configPromise;
  }

  configPromise = (async () => {
    try {
      const configRef = doc(db, "AppConfig", "ReadTelemetry");
      const configSnapshot = await getDoc(configRef);
      telemetryConfig = configSnapshot.exists()
        ? normalizeTelemetryConfig(configSnapshot.data())
        : normalizeTelemetryConfig({});
    } catch (error) {
      console.warn("[FirestoreReadTelemetry] Failed to refresh config", error);
      telemetryConfig = {
        ...telemetryConfig,
        loaded: true,
        fetchedAt: Date.now(),
        enabled: false,
        allowedUids: [],
      };
    } finally {
      ensureFlushInterval();
      drainQueuedEvents();
      configPromise = null;
    }

    return telemetryConfig;
  })();

  return configPromise;
};

export const initializeFirestoreReadTelemetry = () => {
  if (lifecycleInitialized) {
    return;
  }

  lifecycleInitialized = true;
  void ensureTelemetryHydrated();

  AppState.addEventListener("change", (nextState) => {
    const movedToBackground =
      lastAppState === "active" &&
      (nextState === "background" || nextState === "inactive");
    lastAppState = nextState;

    if (movedToBackground) {
      void flushReadTelemetry("app-background", { ignoreEnabled: true });
    }
  });
};

export const setCurrentTelemetryScreen = (screenName) => {
  initializeFirestoreReadTelemetry();
  currentTelemetryScreen = normalizeTelemetryText(screenName) || "unknown";
};

export const setCurrentTelemetryUser = (uid, { isGuestUser = false } = {}) => {
  initializeFirestoreReadTelemetry();

  const nextUid = normalizeTelemetryText(uid);
  const hadTrackedUser = Boolean(currentTelemetryUid);
  const userChanged = currentTelemetryUid !== nextUid;
  const guestChanged = isGuestTelemetrySession !== Boolean(isGuestUser);

  if ((userChanged || guestChanged) && hadTrackedUser) {
    void flushReadTelemetry("user-change", { ignoreEnabled: true });
  }

  currentTelemetryUid = nextUid;
  isGuestTelemetrySession = Boolean(isGuestUser);
  queuedReadEvents = [];

  if (!currentTelemetryUid || isGuestTelemetrySession) {
    telemetryConfig = {
      ...telemetryConfig,
      loaded: true,
      fetchedAt: Date.now(),
      enabled: false,
      allowedUids: [],
    };
    clearFlushInterval();
    return;
  }

  telemetryConfig = {
    ...telemetryConfig,
    loaded: false,
    fetchedAt: 0,
  };
  void refreshTelemetryConfig(true);
};

export const isReadTelemetryEnabledForCurrentUser = async () => {
  initializeFirestoreReadTelemetry();
  await ensureTelemetryHydrated();
  await refreshTelemetryConfig(false);
  return isTelemetryAllowedFromConfig();
};

export const trackFirestoreRead = (event) => {
  try {
    initializeFirestoreReadTelemetry();
    void ensureTelemetryHydrated();

    if (!currentTelemetryUid || isGuestTelemetrySession) {
      return;
    }

    if (!telemetryConfig.loaded) {
      enqueuePreconfigEvent(event);
      void refreshTelemetryConfig(false);
      return;
    }

    if (!isTelemetryAllowedFromConfig()) {
      if (Date.now() - telemetryConfig.fetchedAt >= READ_TELEMETRY_CONFIG_TTL_MS) {
        void refreshTelemetryConfig(false);
      }
      return;
    }

    if (Date.now() - telemetryConfig.fetchedAt >= READ_TELEMETRY_CONFIG_TTL_MS) {
      void refreshTelemetryConfig(false);
    }

    applyReadEvent(event);
  } catch (error) {
    console.warn("[FirestoreReadTelemetry] Failed to track read", error);
  }
};

export const flushReadTelemetry = async (
  reason = "manual",
  { ignoreEnabled = false } = {}
) => {
  initializeFirestoreReadTelemetry();
  await ensureTelemetryHydrated();

  if (flushPromise) {
    return flushPromise;
  }

  const shouldFlush =
    telemetryAggregates.size > 0 &&
    (ignoreEnabled || (await isReadTelemetryEnabledForCurrentUser()));

  if (!shouldFlush) {
    return { flushed: 0, skipped: true, reason };
  }

  const aggregatesToFlush = Array.from(telemetryAggregates.values());
  telemetryAggregates = new Map();
  await persistTelemetryAggregatesNow().catch(() => {});

  flushPromise = (async () => {
    try {
      await Promise.all(
        aggregatesToFlush.map((aggregate) => {
          const telemetryDocRef = doc(
            db,
            READ_TELEMETRY_COLLECTION,
            buildAggregateDocId(aggregate)
          );

          return setDoc(
            telemetryDocRef,
            {
              date: aggregate.date,
              uid: aggregate.uid,
              screenName: aggregate.screenName,
              collectionName: aggregate.collectionName,
              collectionPathPattern: aggregate.collectionPathPattern,
              logicalReadCalls: increment(Number(aggregate.logicalReadCalls || 0)),
              docReadCalls: increment(Number(aggregate.docReadCalls || 0)),
              queryReadCalls: increment(Number(aggregate.queryReadCalls || 0)),
              serverReadCalls: increment(Number(aggregate.serverReadCalls || 0)),
              estimatedServerDocReads: increment(
                Number(aggregate.estimatedServerDocReads || 0)
              ),
              cacheHits: increment(Number(aggregate.cacheHits || 0)),
              realtimeSubscriptions: increment(
                Number(aggregate.realtimeSubscriptions || 0)
              ),
              platform: aggregate.platform || Platform.OS,
              appVersion: aggregate.appVersion || getAppVersion(),
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );
        })
      );

      await persistTelemetryAggregatesNow().catch(() => {});
      return { flushed: aggregatesToFlush.length, skipped: false, reason };
    } catch (error) {
      console.warn("[FirestoreReadTelemetry] Flush failed", error);
      aggregatesToFlush.forEach((aggregate) => {
        const aggregateKey = buildAggregateKey(aggregate);
        const existingAggregate = telemetryAggregates.get(aggregateKey);
        telemetryAggregates.set(
          aggregateKey,
          existingAggregate
            ? mergeAggregateValues(existingAggregate, aggregate)
            : aggregate
        );
      });
      await persistTelemetryAggregatesNow().catch(() => {});
      return { flushed: 0, skipped: false, reason, error };
    } finally {
      flushPromise = null;
    }
  })();

  return flushPromise;
};

export const trackedGetDoc = async (ref) => {
  trackFirestoreRead({
    target: ref,
    logicalReadCalls: 1,
    docReadCalls: 1,
  });

  const snapshot = await getDoc(ref);
  trackFirestoreRead({
    target: ref,
    serverReadCalls: 1,
    estimatedServerDocReads: 1,
  });
  return snapshot;
};

export const trackedGetDocs = async (queryLike) => {
  trackFirestoreRead({
    target: queryLike,
    logicalReadCalls: 1,
    queryReadCalls: 1,
  });

  const snapshot = await getDocs(queryLike);
  trackFirestoreRead({
    target: queryLike,
    serverReadCalls: 1,
    estimatedServerDocReads: snapshot?.size || 0,
  });
  return snapshot;
};

export const trackedGetDocFromServer = async (ref) => {
  trackFirestoreRead({
    target: ref,
    logicalReadCalls: 1,
    docReadCalls: 1,
  });

  const snapshot = await getDocFromServer(ref);
  trackFirestoreRead({
    target: ref,
    serverReadCalls: 1,
    estimatedServerDocReads: 1,
  });
  return snapshot;
};

export const trackedGetDocsFromServer = async (queryLike) => {
  trackFirestoreRead({
    target: queryLike,
    logicalReadCalls: 1,
    queryReadCalls: 1,
  });

  const snapshot = await getDocsFromServer(queryLike);
  trackFirestoreRead({
    target: queryLike,
    serverReadCalls: 1,
    estimatedServerDocReads: snapshot?.size || 0,
  });
  return snapshot;
};

export const trackedOnSnapshotAttach = (
  queryLike,
  onNext,
  onError,
  onCompletion
) => {
  trackFirestoreRead({
    target: queryLike,
    realtimeSubscriptions: 1,
  });

  if (onCompletion) {
    return onSnapshot(queryLike, onNext, onError, onCompletion);
  }

  return onSnapshot(queryLike, onNext, onError);
};

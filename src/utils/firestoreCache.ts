import type {
  DocumentReference,
  Query,
  QuerySnapshot,
  DocumentSnapshot,
} from "firebase/firestore";
import {
  getDocFromServer,
  getDocsFromServer,
  Timestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "../../firebase";

/**
 * Cache-first Firestore reads (no real-time).
 * - Uses AsyncStorage cache with refresh modulo
 * - Falls back to server on cache miss
 * - SDK cache is not used
 */
export async function getDocPreferCache<T = unknown>(
  ref: DocumentReference<T>
): Promise<DocumentSnapshot<T>> {
  const LOCAL_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
  const LOCAL_CACHE_MAX_READS = await getRefreshModulo();
  const cacheKey = `fs:v2:doc:${ref.path}`;

  const cached = await getLocalCache<any>(
    cacheKey,
    LOCAL_CACHE_TTL_MS,
    LOCAL_CACHE_MAX_READS
  );
  if (cached) {
    return {
      id: ref.id,
      ref,
      exists: () => true,
      data: () => deserializeValue(cached) as T,
    } as DocumentSnapshot<T>;
  }

  const serverSnapshot = await getDocFromServer(ref);
  const data = serverSnapshot.data?.();
  if (data) {
    await setLocalCache(cacheKey, serializeValue(data));
  }
  return serverSnapshot;
}

export async function getDocsPreferCache<T = unknown>(
  q: Query<T>
): Promise<QuerySnapshot<T>> {
  const LOCAL_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
  const LOCAL_CACHE_MAX_READS = await getRefreshModulo();
  const queryKey = getQueryCacheKey(q);

  // If we can't compute a stable cache key, don't cache this query.
  // This avoids cache collisions that can show wrong data across screens.
  if (!queryKey) {
    return await getDocsFromServer(q);
  }

  // Safety cleanup for an older bug where many queries shared `fs:query:unknown`
  // (and would overwrite each other). Remove it so an app update self-heals.
  if (queryKey === "fs:query:unknown") {
    try {
      await AsyncStorage.removeItem(queryKey);
    } catch {
      // ignore
    }
    return await getDocsFromServer(q);
  }

  const cached = await getLocalCache<any[]>(
    queryKey,
    LOCAL_CACHE_TTL_MS,
    LOCAL_CACHE_MAX_READS
  );
  if (Array.isArray(cached) && cached.length > 0) {
    const docs = cached.map((item) => ({
      id: item.id,
      data: () => deserializeValue(item.data),
    }));
    return {
      docs,
      empty: docs.length === 0,
      size: docs.length,
      forEach: (cb: (doc: any) => void) => docs.forEach(cb),
    } as QuerySnapshot<T>;
  }

  const serverSnapshot = await getDocsFromServer(q);
  if (!serverSnapshot.empty) {
    const payload = serverSnapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      data: serializeValue(docSnap.data()),
    }));
    await setLocalCache(queryKey, payload);
  }
  return serverSnapshot;
}

const serializeValue = (value: any): any => {
  if (value instanceof Timestamp) {
    return { __ts: value.toMillis() };
  }
  if (Array.isArray(value)) {
    return value.map(serializeValue);
  }
  if (value && typeof value === "object") {
    const result: Record<string, any> = {};
    Object.keys(value).forEach((key) => {
      result[key] = serializeValue(value[key]);
    });
    return result;
  }
  return value;
};

const getQueryCacheKey = (q: Query<any>): string | null => {
  // Firebase modular SDK doesn't guarantee a public, stable `toString()` for Query.
  // We build a best-effort stable key from internal fields, and if we can't,
  // we refuse to cache to avoid collisions.
  try {
    const anyQ: any = q as any;
    const internal = anyQ?._query;
    const path =
      internal?.path?.canonicalString?.() ??
      internal?.path?.canonicalString ??
      internal?.path?.toString?.() ??
      internal?.path?.toString ??
      null;

    const filters = internal?.filters ?? null;
    const explicitOrderBy = internal?.explicitOrderBy ?? null;
    const limit = internal?.limit ?? null;
    const limitType = internal?.limitType ?? null;
    const startAt = internal?.startAt ?? null;
    const endAt = internal?.endAt ?? null;

    if (!path) {
      return null;
    }

    const signature = JSON.stringify({
      path,
      filters,
      explicitOrderBy,
      limit,
      limitType,
      startAt,
      endAt,
    });

    return `fs:v2:query:${signature}`;
  } catch {
    return null;
  }
};

const deserializeValue = (value: any): any => {
  if (value && typeof value === "object" && "__ts" in value) {
    return Timestamp.fromMillis(value.__ts);
  }
  if (Array.isArray(value)) {
    return value.map(deserializeValue);
  }
  if (value && typeof value === "object") {
    const result: Record<string, any> = {};
    Object.keys(value).forEach((key) => {
      result[key] = deserializeValue(value[key]);
    });
    return result;
  }
  return value;
};

const REFRESH_MODULO_KEY = "appCache:refreshModulo";
const REFRESH_MODULO_AT_KEY = "appCache:refreshModuloAt";
const REFRESH_MODULO_TTL_MS = 10 * 60 * 1000;
let refreshModuloPromise: Promise<number> | null = null;

const getRefreshModulo = async (): Promise<number> => {
  const DEFAULT_MODULO = 20;
  try {
    const cachedValueRaw = await AsyncStorage.getItem(REFRESH_MODULO_KEY);
    const cachedAtRaw = await AsyncStorage.getItem(REFRESH_MODULO_AT_KEY);
    const cachedValue = cachedValueRaw ? Number(cachedValueRaw) : NaN;
    const cachedAt = cachedAtRaw ? Number(cachedAtRaw) : NaN;
    const isFresh =
      Number.isFinite(cachedValue) &&
      Number.isFinite(cachedAt) &&
      Date.now() - cachedAt < REFRESH_MODULO_TTL_MS;
    if (isFresh) {
      return normalizeModulo(cachedValue);
    }
  } catch {
    // ignore and try fetching
  }

  if (refreshModuloPromise) {
    return refreshModuloPromise;
  }

  refreshModuloPromise = (async () => {
    try {
      const configRef = doc(db, "AppConfig", "DataRefresh");
      const snapshot = await getDoc(configRef);
      if (snapshot.exists()) {
        const data = snapshot.data() || {};
        const rawCandidate =
          data.refreshModulo ?? data.accessModulo ?? data.updateEveryNAccesses;
        const candidate = Number(rawCandidate);
        const normalized = normalizeModulo(candidate);
        await AsyncStorage.setItem(REFRESH_MODULO_KEY, String(normalized));
        await AsyncStorage.setItem(
          REFRESH_MODULO_AT_KEY,
          String(Date.now())
        );
        return normalized;
      }
    } catch {
      // ignore and use default
    }
    return DEFAULT_MODULO;
  })();

  try {
    return await refreshModuloPromise;
  } finally {
    refreshModuloPromise = null;
  }
};

const normalizeModulo = (value: number): number => {
  if (!Number.isFinite(value)) {
    return 20;
  }
  if (value <= 1) {
    return 0;
  }
  return Math.floor(value);
};

const getLocalCache = async <T>(
  key: string,
  maxAgeMs: number,
  maxReads = 20
): Promise<T | null> => {
  try {
    if (!Number.isFinite(maxReads) || maxReads <= 0) {
      return null;
    }
    const raw = await AsyncStorage.getItem(key);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as { t: number; data: T; hits?: number };
    if (!parsed || typeof parsed.t !== "number") {
      return null;
    }
    if (Date.now() - parsed.t > maxAgeMs) {
      return null;
    }
    const hits = typeof parsed.hits === "number" ? parsed.hits : 0;
    if (hits >= maxReads) {
      await AsyncStorage.removeItem(key);
      return null;
    }
    await AsyncStorage.setItem(
      key,
      JSON.stringify({ ...parsed, hits: hits + 1 })
    );
    return parsed.data ?? null;
  } catch {
    return null;
  }
};

const setLocalCache = async <T>(key: string, data: T): Promise<void> => {
  try {
    const payload = { t: Date.now(), data, hits: 0 };
    await AsyncStorage.setItem(key, JSON.stringify(payload));
  } catch {
    // ignore
  }
};

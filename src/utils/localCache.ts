import AsyncStorage from "@react-native-async-storage/async-storage";

const CACHE_VERSION = 1;
const CACHE_PREFIX = `appCache:v${CACHE_VERSION}:`;

type CacheEnvelope<T> = {
  v: number;
  t: number;
  data: T;
};

const hitsKeyFor = (key: string) => `${CACHE_PREFIX}${key}:hits`;

export const getLocalCache = async <T>(
  key: string,
  maxAgeMs: number,
  maxReads = 20
): Promise<T | null> => {
  try {
    if (!Number.isFinite(maxReads) || maxReads <= 0) {
      return null;
    }
    const raw = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as CacheEnvelope<T>;
    if (!parsed || parsed.v !== CACHE_VERSION || typeof parsed.t !== "number") {
      return null;
    }
    if (Date.now() - parsed.t > maxAgeMs) {
      return null;
    }
    const hitsRaw = await AsyncStorage.getItem(hitsKeyFor(key));
    const hits = hitsRaw ? Number(hitsRaw) : 0;
    if (Number.isFinite(hits) && hits >= maxReads) {
      await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
      await AsyncStorage.removeItem(hitsKeyFor(key));
      return null;
    }
    await AsyncStorage.setItem(hitsKeyFor(key), String(hits + 1));
    return parsed.data ?? null;
  } catch {
    return null;
  }
};

export const setLocalCache = async <T>(key: string, data: T): Promise<void> => {
  try {
    const payload: CacheEnvelope<T> = { v: CACHE_VERSION, t: Date.now(), data };
    await AsyncStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(payload));
    await AsyncStorage.setItem(hitsKeyFor(key), "0");
  } catch {
    // ignore cache write errors
  }
};

export const clearLocalCache = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
    await AsyncStorage.removeItem(hitsKeyFor(key));
  } catch {
    // ignore
  }
};

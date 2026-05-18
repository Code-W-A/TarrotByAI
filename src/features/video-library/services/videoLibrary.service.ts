import {
  collection,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Unsubscribe } from "firebase/firestore";
import { db } from "../../../../firebase";
import type { Video } from "../types/video";
import type { VideoCategory } from "../types/videoCategory";
import { logWarn } from "../../../utils/Logger";
import i18n from "../../../../i18n";
import {
  trackedGetDocsFromServer,
} from "../../../utils/firestoreReadTelemetry";
import {
  getPremiumVideoDetail,
  getPremiumVideoLibrary,
  type PremiumVideoDetailResponse,
} from "./premiumVideoApi";

const COLLECTION_NAME = "videosVideoModule";
const CATEGORY_COLLECTION_NAME = "videoCategories";
const VIDEO_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const CATEGORY_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const VIDEO_CACHE_KEY_PREFIX = "videoLibrary:publishedVideos";
const CATEGORY_CACHE_KEY = "videoLibrary:categories";

type CacheEntry<T> = {
  data: T;
  fresh: boolean;
};

const getTimestampMs = (value: any): number | null => {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value?.toMillis === "function") {
    return value.toMillis();
  }

  if (typeof value?._seconds === "number") {
    return value._seconds * 1000;
  }

  if (typeof value?.seconds === "number") {
    return value.seconds * 1000;
  }

  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const readCache = async <T,>(key: string, ttlMs: number): Promise<CacheEntry<T> | null> => {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.timestamp !== "number" || parsed.data === undefined) {
      return null;
    }

    return {
      data: parsed.data as T,
      fresh: Date.now() - parsed.timestamp <= ttlMs,
    };
  } catch (error) {
    logWarn("[VideoLibrary] Failed to read local cache.", { key, error });
    return null;
  }
};

const writeCache = async <T,>(key: string, data: T): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      key,
      JSON.stringify({
        timestamp: Date.now(),
        data,
      })
    );
  } catch (error) {
    logWarn("[VideoLibrary] Failed to write local cache.", { key, error });
  }
};

const getVideoSortTimestamp = (video: Video): number => {
  const publishMs = getTimestampMs(video.publishAt);
  if (typeof publishMs === "number") {
    return publishMs;
  }

  const createdMs = getTimestampMs(video.createdAt);
  if (typeof createdMs === "number") {
    return createdMs;
  }

  const updatedMs = getTimestampMs(video.updatedAt);
  if (typeof updatedMs === "number") {
    return updatedMs;
  }

  return 0;
};

const sortVideosNewestFirst = (videos: Video[]): Video[] => {
  return [...videos].sort((a, b) => {
    const timeA = getVideoSortTimestamp(a);
    const timeB = getVideoSortTimestamp(b);
    return timeB - timeA;
  });
};

const isVideoVisible = (video: Video, nowMs = Date.now()): boolean => {
  if (!video.publishAt) {
    return true;
  }
  const publishMs = getTimestampMs(video.publishAt);
  if (!publishMs) {
    return true;
  }
  return publishMs <= nowMs;
};

const mapVideos = (docs: any[]): Video[] => {
  return docs.map((docSnap) => ({
    ...(docSnap.data() as Omit<Video, "id">),
    id: docSnap.id,
  }));
};

const mapCategories = (docs: any[]): VideoCategory[] => {
  return docs.map((docSnap) => ({
    ...(docSnap.data() as Omit<VideoCategory, "id">),
    id: docSnap.id,
  }));
};

const buildCategoriesQuery = () =>
  query(collection(db, CATEGORY_COLLECTION_NAME), orderBy("name", "asc"));

const buildPrimaryQuery = () =>
  query(
    collection(db, COLLECTION_NAME),
    where("isPublished", "==", true),
    orderBy("createdAt", "desc")
  );

const buildFallbackQuery = () =>
  query(collection(db, COLLECTION_NAME), where("isPublished", "==", true));

const getCurrentLocale = (): string => i18n.locale?.split("-")[0] ?? "ro";

const logFirestoreFallback = (
  stage: "api_failed" | "primary_query_failed" | "secondary_query_failed" | "primary_query_used" | "secondary_query_used",
  details?: Record<string, unknown>
) => {
  logWarn("[VideoLibrary] Firestore fallback event", {
    stage,
    locale: getCurrentLocale(),
    ...details,
  });
};

export const getPublishedVideos = async (): Promise<Video[]> => {
  const locale = getCurrentLocale();
  const cacheKey = `${VIDEO_CACHE_KEY_PREFIX}:${locale}`;
  let cachedVideos = await readCache<Video[]>(cacheKey, VIDEO_CACHE_TTL_MS);

  try {
    const response = await getPremiumVideoLibrary(locale);
    await writeCache(cacheKey, response.videos);
    return response.videos;
  } catch (error) {
    logFirestoreFallback("api_failed", {
      reason: "premium_api_error",
      error,
    });
  }

  if (cachedVideos?.fresh) {
    return sortVideosNewestFirst(cachedVideos.data);
  }

  // Fallback only keeps the old public Firestore behavior available when the API is unreachable.
  try {
    const fallbackSnapshot = await trackedGetDocsFromServer(buildPrimaryQuery());
    if (!fallbackSnapshot.empty) {
      const nowMs = Date.now();
      const visibleVideos = sortVideosNewestFirst(
        mapVideos(fallbackSnapshot.docs).filter((video) => isVideoVisible(video, nowMs))
      );
      logFirestoreFallback("primary_query_used", {
        docsCount: fallbackSnapshot.size,
        visibleCount: visibleVideos.length,
      });
      await writeCache(cacheKey, visibleVideos);
      return visibleVideos;
    }
  } catch (error) {
    logFirestoreFallback("primary_query_failed", {
      reason: "primary_query_error",
      error,
    });
  }

  try {
    const fallbackSnapshot = await trackedGetDocsFromServer(buildFallbackQuery());
    if (!fallbackSnapshot.empty) {
      const nowMs = Date.now();
      const visibleVideos = sortVideosNewestFirst(
        mapVideos(fallbackSnapshot.docs).filter((video) => isVideoVisible(video, nowMs))
      );
      logFirestoreFallback("secondary_query_used", {
        docsCount: fallbackSnapshot.size,
        visibleCount: visibleVideos.length,
      });
      await writeCache(cacheKey, visibleVideos);
      return visibleVideos;
    }
  } catch (error) {
    logFirestoreFallback("secondary_query_failed", {
      reason: "secondary_query_error",
      error,
    });
  }

  if (cachedVideos?.data?.length) {
    return sortVideosNewestFirst(cachedVideos.data);
  }

  return [];
};

export const getVideoCategories = async (): Promise<VideoCategory[]> => {
  const cachedCategories = await readCache<VideoCategory[]>(CATEGORY_CACHE_KEY, CATEGORY_CACHE_TTL_MS);
  if (cachedCategories?.fresh) {
    return cachedCategories.data;
  }

  try {
    const snapshot = await trackedGetDocsFromServer(buildCategoriesQuery());
    if (!snapshot.empty) {
      const categories = mapCategories(snapshot.docs);
      await writeCache(CATEGORY_CACHE_KEY, categories);
      return categories;
    }
  } catch (error) {
    logWarn("[VideoLibrary] Categories query failed, falling back.", error);
  }

  try {
    const fallbackSnapshot = await trackedGetDocsFromServer(
      collection(db, CATEGORY_COLLECTION_NAME) as any
    );
    if (!fallbackSnapshot.empty) {
      const categories = mapCategories(fallbackSnapshot.docs);
      await writeCache(CATEGORY_CACHE_KEY, categories);
      return categories;
    }
  } catch (error) {
    logWarn("[VideoLibrary] Categories fallback failed.", error);
  }

  if (cachedCategories?.data?.length) {
    return cachedCategories.data;
  }

  return [];
};

export const subscribePublishedVideos = (
  onUpdate: (videos: Video[]) => void,
  onError?: (error: unknown) => void
): Unsubscribe => {
  let active = true;
  const load = async () => {
    try {
      const videos = await getPublishedVideos();
      if (active) {
        onUpdate(videos);
      }
    } catch (error) {
      onError?.(error);
    }
  };

  void load();
  return () => {
    active = false;
  };
};

export const getVideoById = async (
  videoId: string,
  locale?: string | null
): Promise<Video | null> => {
  if (!videoId) {
    return null;
  }

  const resolvedLocale =
    typeof locale === "string" && locale.trim() ? locale : getCurrentLocale();

  try {
    const response = await getPremiumVideoDetail(videoId, resolvedLocale);
    return response?.video || null;
  } catch (error) {
    logWarn("[VideoLibrary] Premium detail API failed.", error);
    return null;
  }
};

/** Full detail payload (video + availableLocales) for a given playback locale — mirrors web `/videouri/[id]?locale=`. */
export const fetchVideoLibraryDetail = async (
  videoId: string,
  locale: string
): Promise<PremiumVideoDetailResponse | null> => {
  const id = typeof videoId === "string" ? videoId.trim() : "";
  if (!id) {
    return null;
  }
  try {
    return await getPremiumVideoDetail(id, locale);
  } catch (error) {
    logWarn("[VideoLibrary] Premium detail API failed.", error);
    return null;
  }
};

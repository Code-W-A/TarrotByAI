import {
  collection,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  getDocsFromServer,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import type { Unsubscribe } from "firebase/firestore";
import { db } from "../../../../firebase";
import type { Video } from "../types/video";
import type { VideoCategory } from "../types/videoCategory";
import { getDocPreferCache } from "../../../utils/firestoreCache";
import { logWarn } from "../../../utils/Logger";

const COLLECTION_NAME = "videosVideoModule";
const CATEGORY_COLLECTION_NAME = "videoCategories";

const getVideoSortTimestamp = (video: Video): number => {
  const publishMs = video.publishAt?.toMillis?.();
  if (typeof publishMs === "number") {
    return publishMs;
  }

  const createdMs = video.createdAt?.toMillis?.();
  if (typeof createdMs === "number") {
    return createdMs;
  }

  const updatedMs = video.updatedAt?.toMillis?.();
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
  const publishMs = video.publishAt?.toMillis?.();
  if (!publishMs) {
    return true;
  }
  return publishMs <= nowMs;
};

const mapVideos = (docs: Awaited<ReturnType<typeof getDocs>>["docs"]): Video[] => {
  return docs.map((docSnap) => ({
    ...(docSnap.data() as Omit<Video, "id">),
    id: docSnap.id,
  }));
};

const mapCategories = (
  docs: Awaited<ReturnType<typeof getDocs>>["docs"]
): VideoCategory[] => {
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

export const getPublishedVideos = async (): Promise<Video[]> => {
  try {
    const snapshot = await getDocsFromServer(buildPrimaryQuery());
    if (!snapshot.empty) {
      const nowMs = Date.now();
      return sortVideosNewestFirst(
        mapVideos(snapshot.docs).filter((video) =>
          isVideoVisible(video, nowMs)
        )
      );
    }
  } catch (error) {
    logWarn("[VideoLibrary] Primary query failed, falling back.", error);
  }

  try {
    const fallbackSnapshot = await getDocsFromServer(buildFallbackQuery());
    if (!fallbackSnapshot.empty) {
      const nowMs = Date.now();
      return sortVideosNewestFirst(
        mapVideos(fallbackSnapshot.docs).filter((video) =>
          isVideoVisible(video, nowMs)
        )
      );
    }
  } catch (error) {
    logWarn("[VideoLibrary] Fallback query failed.", error);
  }

  return [];
};

export const getVideoCategories = async (): Promise<VideoCategory[]> => {
  try {
    const snapshot = await getDocsFromServer(buildCategoriesQuery());
    if (!snapshot.empty) {
      return mapCategories(snapshot.docs);
    }
  } catch (error) {
    logWarn("[VideoLibrary] Categories query failed, falling back.", error);
  }

  try {
    const fallbackSnapshot = await getDocsFromServer(
      collection(db, CATEGORY_COLLECTION_NAME) as any
    );
    if (!fallbackSnapshot.empty) {
      return mapCategories(fallbackSnapshot.docs);
    }
  } catch (error) {
    logWarn("[VideoLibrary] Categories fallback failed.", error);
  }

  return [];
};

export const subscribePublishedVideos = (
  onUpdate: (videos: Video[]) => void,
  onError?: (error: unknown) => void
): Unsubscribe => {
  let primaryUnsubscribe: Unsubscribe | null = null;
  let fallbackUnsubscribe: Unsubscribe | null = null;

  const attachFallback = () => {
    if (fallbackUnsubscribe) {
      return;
    }

    fallbackUnsubscribe = onSnapshot(
      buildFallbackQuery(),
      (snapshot) => {
        const nowMs = Date.now();
        onUpdate(
          sortVideosNewestFirst(
            mapVideos(snapshot.docs).filter((video) =>
              isVideoVisible(video, nowMs)
            )
          )
        );
      },
      (error) => {
        onError?.(error);
      }
    );
  };

  primaryUnsubscribe = onSnapshot(
    buildPrimaryQuery(),
    (snapshot) => {
      const nowMs = Date.now();
      onUpdate(
        sortVideosNewestFirst(
          mapVideos(snapshot.docs).filter((video) =>
            isVideoVisible(video, nowMs)
          )
        )
      );
    },
    (error) => {
      onError?.(error);
      attachFallback();
    }
  );

  return () => {
    primaryUnsubscribe?.();
    fallbackUnsubscribe?.();
  };
};

export const getVideoById = async (videoId: string): Promise<Video | null> => {
  if (!videoId) {
    return null;
  }

  const ref = doc(db, COLLECTION_NAME, videoId);
  const snap = await getDocFromServer(ref);
  if (!snap.exists()) {
    return null;
  }

  const data = snap.data() as Omit<Video, "id">;
  if (!data.isPublished) {
    return null;
  }
  if (!isVideoVisible({ id: snap.id, ...data })) {
    return null;
  }

  return { id: snap.id, ...data };
};

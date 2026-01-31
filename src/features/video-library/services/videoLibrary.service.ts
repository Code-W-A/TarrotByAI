import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import type { Unsubscribe } from "firebase/firestore";
import { db } from "../../../../firebase";
import type { Video } from "../types/video";
import type { VideoCategory } from "../types/videoCategory";

const COLLECTION_NAME = "videosVideoModule";
const CATEGORY_COLLECTION_NAME = "videoCategories";

const sortVideos = (videos: Video[]): Video[] => {
  return [...videos].sort((a, b) => {
    const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.order ?? Number.MAX_SAFE_INTEGER;

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    const timeA = a.createdAt?.toMillis?.() ?? 0;
    const timeB = b.createdAt?.toMillis?.() ?? 0;
    return timeB - timeA;
  });
};

const mapVideos = (docs: Awaited<ReturnType<typeof getDocs>>["docs"]): Video[] => {
  return docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<Video, "id">) }));
};

const mapCategories = (
  docs: Awaited<ReturnType<typeof getDocs>>["docs"]
): VideoCategory[] => {
  return docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<VideoCategory, "id">),
  }));
};

const buildCategoriesQuery = () =>
  query(collection(db, CATEGORY_COLLECTION_NAME), orderBy("name", "asc"));

const buildPrimaryQuery = () =>
  query(
    collection(db, COLLECTION_NAME),
    where("isPublished", "==", true),
    orderBy("order", "asc"),
    orderBy("createdAt", "desc")
  );

const buildFallbackQuery = () =>
  query(
    collection(db, COLLECTION_NAME),
    where("isPublished", "==", true),
    orderBy("createdAt", "desc")
  );

export const getPublishedVideos = async (): Promise<Video[]> => {
  try {
    const snapshot = await getDocs(buildPrimaryQuery());
    return mapVideos(snapshot.docs);
  } catch (error) {
    const fallbackSnapshot = await getDocs(buildFallbackQuery());
    return sortVideos(mapVideos(fallbackSnapshot.docs));
  }
};

export const getVideoCategories = async (): Promise<VideoCategory[]> => {
  try {
    const snapshot = await getDocs(buildCategoriesQuery());
    return mapCategories(snapshot.docs);
  } catch (error) {
    const fallbackSnapshot = await getDocs(collection(db, CATEGORY_COLLECTION_NAME));
    return mapCategories(fallbackSnapshot.docs);
  }
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
        onUpdate(sortVideos(mapVideos(snapshot.docs)));
      },
      (error) => {
        onError?.(error);
      }
    );
  };

  primaryUnsubscribe = onSnapshot(
    buildPrimaryQuery(),
    (snapshot) => {
      onUpdate(mapVideos(snapshot.docs));
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
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    return null;
  }

  const data = snap.data() as Omit<Video, "id">;
  if (!data.isPublished) {
    return null;
  }

  return { id: snap.id, ...data };
};

import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "../../../../i18n";
import type { Video } from "../types/video";
import { getPublishedVideos } from "../services/videoLibrary.service";
import { prepareVideoForPlayback } from "./videoPlayback";

const FAVORITES_KEY = "favoriteVideos";

const normalizeFavorites = (items: Video[]): Video[] => {
  const byId = new Map<string, Video>();
  items.forEach((item) => {
    if (item?.id) {
      byId.set(item.id, item);
    }
  });
  return Array.from(byId.values());
};

const extractFavoriteIds = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const ids = value
    .map((item) => {
      if (typeof item === "string") return item.trim();
      if (item && typeof item === "object") {
        const maybeId = (item as { id?: unknown }).id;
        return typeof maybeId === "string" ? maybeId.trim() : "";
      }
      return "";
    })
    .filter(Boolean);

  return Array.from(new Set(ids));
};

export const getFavoriteVideoIds = async (): Promise<string[]> => {
  try {
    const raw = await AsyncStorage.getItem(FAVORITES_KEY);
    if (!raw) {
      return [];
    }
    return extractFavoriteIds(JSON.parse(raw));
  } catch {
    return [];
  }
};

export const getFavoriteVideos = async (): Promise<Video[]> => {
  try {
    const ids = await getFavoriteVideoIds();
    if (ids.length === 0) {
      return [];
    }

    const allVideos = await getPublishedVideos();
    const byId = new Map(allVideos.map((video) => [video.id, video]));
    return ids
      .map((id) => byId.get(id))
      .filter((video): video is Video => Boolean(video))
      .map((video) => prepareVideoForPlayback(video, i18n.locale) || video);
  } catch {
    return [];
  }
};

const setFavoriteVideoIds = async (ids: string[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(new Set(ids))));
  } catch {
    // ignore
  }
};

export const isFavoriteVideo = async (videoId: string): Promise<boolean> => {
  if (!videoId) {
    return false;
  }
  const favoriteIds = await getFavoriteVideoIds();
  return favoriteIds.includes(videoId);
};

export const toggleFavoriteVideo = async (
  video: Video
): Promise<{ favorites: Video[]; isFavorite: boolean }> => {
  if (!video?.id) {
    return { favorites: [], isFavorite: false };
  }
  const favoriteIds = await getFavoriteVideoIds();
  const playableVideo = prepareVideoForPlayback(video, i18n.locale);
  if (!playableVideo) {
    const favorites = await getFavoriteVideos();
    return { favorites, isFavorite: false };
  }
  const exists = favoriteIds.includes(video.id);
  const updatedIds = exists
    ? favoriteIds.filter((id) => id !== video.id)
    : [...favoriteIds, video.id];
  await setFavoriteVideoIds(updatedIds);
  const favorites = await getFavoriteVideos();
  return { favorites: exists ? favorites : normalizeFavorites([...favorites, playableVideo]), isFavorite: !exists };
};

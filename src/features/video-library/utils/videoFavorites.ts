import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Video } from "../types/video";

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

export const getFavoriteVideos = async (): Promise<Video[]> => {
  try {
    const raw = await AsyncStorage.getItem(FAVORITES_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return normalizeFavorites(parsed as Video[]);
  } catch {
    return [];
  }
};

const setFavoriteVideos = async (videos: Video[]): Promise<void> => {
  try {
    const normalized = normalizeFavorites(videos);
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(normalized));
  } catch {
    // ignore
  }
};

export const isFavoriteVideo = async (videoId: string): Promise<boolean> => {
  if (!videoId) {
    return false;
  }
  const favorites = await getFavoriteVideos();
  return favorites.some((item) => item.id === videoId);
};

export const toggleFavoriteVideo = async (
  video: Video
): Promise<{ favorites: Video[]; isFavorite: boolean }> => {
  if (!video?.id) {
    return { favorites: [], isFavorite: false };
  }
  const favorites = await getFavoriteVideos();
  const exists = favorites.some((item) => item.id === video.id);
  const updated = exists
    ? favorites.filter((item) => item.id !== video.id)
    : [...favorites, video];
  await setFavoriteVideos(updated);
  return { favorites: updated, isFavorite: !exists };
};

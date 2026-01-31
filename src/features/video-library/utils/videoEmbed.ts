import type { VideoPlatform } from "../types/video";

const getYoutubeInfoFromUrl = (
  value: string
): { id?: string; listId?: string } | null => {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (!trimmed.includes("http") && !trimmed.includes("/")) {
    return { id: trimmed };
  }

  try {
    const url = new URL(trimmed);
    const listId = url.searchParams.get("list") || undefined;
    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id ? { id, listId } : listId ? { listId } : null;
    }

    if (url.pathname.includes("/embed/")) {
      const parts = url.pathname.split("/embed/");
      const id = parts[1]?.split("/")[0];
      return id ? { id, listId } : listId ? { listId } : null;
    }

    if (url.pathname.includes("/shorts/")) {
      const parts = url.pathname.split("/shorts/");
      const id = parts[1]?.split("/")[0];
      return id ? { id, listId } : listId ? { listId } : null;
    }

    if (url.pathname.includes("/live/")) {
      const parts = url.pathname.split("/live/");
      const id = parts[1]?.split("/")[0];
      return id ? { id, listId } : listId ? { listId } : null;
    }

    const id = url.searchParams.get("v");
    if (id) {
      return { id, listId };
    }

    if (listId) {
      return { listId };
    }
  } catch (error) {
    return null;
  }

  return null;
};

const getVimeoIdFromUrl = (value: string): string | null => {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (!trimmed.includes("http") && /^\d+$/.test(trimmed)) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    const parts = url.pathname.split("/").filter(Boolean);
    const id = parts[parts.length - 1];
    return id && /^\d+$/.test(id) ? id : null;
  } catch (error) {
    return null;
  }
};

export const getEmbedUrl = (
  platform: VideoPlatform,
  videoUrl: string
): string | null => {
  if (!videoUrl) {
    return null;
  }

  if (platform === "youtube") {
    const info = getYoutubeInfoFromUrl(videoUrl);
    if (!info) {
      return null;
    }
    if (info.listId && !info.id) {
      return `https://www.youtube.com/embed/videoseries?list=${info.listId}`;
    }
    return info.id ? `https://www.youtube.com/embed/${info.id}` : null;
  }

  const id = getVimeoIdFromUrl(videoUrl);
  return id ? `https://player.vimeo.com/video/${id}` : null;
};

export const getWatchUrl = (
  platform: VideoPlatform,
  videoUrl: string
): string | null => {
  if (!videoUrl) {
    return null;
  }

  if (platform === "youtube") {
    const info = getYoutubeInfoFromUrl(videoUrl);
    if (!info) {
      return null;
    }
    if (info.id && info.listId) {
      return `https://www.youtube.com/watch?v=${info.id}&list=${info.listId}`;
    }
    if (info.id) {
      return `https://www.youtube.com/watch?v=${info.id}`;
    }
    if (info.listId) {
      return `https://www.youtube.com/playlist?list=${info.listId}`;
    }
    return null;
  }

  const id = getVimeoIdFromUrl(videoUrl);
  return id ? `https://vimeo.com/${id}` : null;
};

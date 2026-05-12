import Constants from "expo-constants";
import type { ImageURISource } from "react-native";
import type { VideoPlatform } from "../types/video";

/** Match VideoPlayerScreen / WebView referer so Bunny CDN allows thumbnail images. */
const THUMBNAIL_REFERER = "https://cristinazurba.com/";

const thumbnailHostNeedsReferer = (hostname: string): boolean => {
  const h = hostname.toLowerCase();
  return (
    h === "video.bunnycdn.com" ||
    h.includes("b-cdn.net") ||
    h.endsWith(".mediadelivery.net") ||
    h === "mediadelivery.net" ||
    h === "thumbnail.mediadelivery.net" ||
    h === "player.mediadelivery.net" ||
    h === "iframe.mediadelivery.net"
  );
};

/**
 * Image/ImageBackground source for remote thumbnails (Bunny pull zone often requires Referer).
 */
export const getRemoteThumbnailSource = (uri: string): ImageURISource => {
  const trimmed = typeof uri === "string" ? uri.trim() : "";
  if (!trimmed) {
    return { uri: "" };
  }
  try {
    const url = trimmed.startsWith("//")
      ? new URL(`https:${trimmed}`)
      : new URL(trimmed);
    if (thumbnailHostNeedsReferer(url.hostname)) {
      return { uri: trimmed, headers: { Referer: THUMBNAIL_REFERER } };
    }
  } catch {
    /* invalid URL — still try plain uri */
  }
  return { uri: trimmed };
};

const BUNNY_VIDEO_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type BunnyEmbedParts = {
  libraryId: string;
  videoId: string;
};

const getExpoExtra = (): Record<string, any> => {
  const constants = Constants as any;
  return (
    Constants.expoConfig?.extra ||
    constants.manifest2?.extra?.expoClient?.extra ||
    constants.manifest?.extra ||
    {}
  );
};

const getConfiguredBunnyLibraryId = (): string | null => {
  const extra = getExpoExtra();
  const fromExtra =
    extra?.bunnyStreamLibraryId ||
    extra?.BUNNY_STREAM_LIBRARY_ID ||
    extra?.NEXT_PUBLIC_BUNNY_STREAM_LIBRARY_ID;
  if (typeof fromExtra === "string" && fromExtra.trim()) {
    return fromExtra.trim();
  }
  const fromEnv =
    typeof process !== "undefined"
      ? process.env.EXPO_PUBLIC_BUNNY_STREAM_LIBRARY_ID
      : undefined;
  return typeof fromEnv === "string" && fromEnv.trim() ? fromEnv.trim() : null;
};

const getConfiguredBunnyCdnHostname = (): string => {
  const extra = getExpoExtra();
  const fromExtra =
    extra?.bunnyStreamCdnHostname ||
    extra?.BUNNY_STREAM_CDN_HOSTNAME ||
    extra?.NEXT_PUBLIC_BUNNY_STREAM_CDN_HOSTNAME;
  if (typeof fromExtra === "string" && fromExtra.trim()) {
    return fromExtra.trim().replace(/^https?:\/\//i, "").replace(/\/$/, "");
  }
  const fromEnv =
    typeof process !== "undefined"
      ? process.env.EXPO_PUBLIC_BUNNY_STREAM_CDN_HOSTNAME
      : undefined;
  if (typeof fromEnv !== "string" || !fromEnv.trim()) {
    return "";
  }
  return fromEnv.trim().replace(/^https?:\/\//i, "").replace(/\/$/, "");
};

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

export const normalizeVideoPlatform = (platform?: string): VideoPlatform => {
  return platform === "bunny" || platform === "vimeo" || platform === "youtube"
    ? platform
    : "youtube";
};

export const extractBunnyEmbedParts = (
  videoUrl: string
): BunnyEmbedParts | null => {
  if (!videoUrl) {
    return null;
  }

  const trimmed = videoUrl.trim();
  if (!trimmed) {
    return null;
  }

  const slashOnly = trimmed.match(
    /^([^/\s]+)\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\/?$/i
  );
  if (slashOnly) {
    return { libraryId: slashOnly[1], videoId: slashOnly[2] };
  }

  if (BUNNY_VIDEO_UUID_RE.test(trimmed)) {
    const libraryId = getConfiguredBunnyLibraryId();
    return libraryId ? { libraryId, videoId: trimmed } : null;
  }

  let url: URL;
  try {
    if (trimmed.startsWith("//")) {
      url = new URL(`https:${trimmed}`);
    } else {
      url = new URL(trimmed);
    }
  } catch (error) {
    try {
      url = new URL(`https://${trimmed}`);
    } catch {
      return null;
    }
  }

  const host = url.hostname.toLowerCase();
  if (host === "player.mediadelivery.net" || host === "iframe.mediadelivery.net") {
    const embedMatch = url.pathname.match(/^\/embed\/([^/]+)\/([^/?#]+)\/?$/);
    if (embedMatch) {
      return { libraryId: embedMatch[1], videoId: embedMatch[2] };
    }

    const playMatch = url.pathname.match(/^\/play\/([^/]+)\/([^/?#]+)\/?$/);
    if (playMatch) {
      return { libraryId: playMatch[1], videoId: playMatch[2] };
    }
  }

  if (host === "video.bunnycdn.com") {
    const playMatch = url.pathname.match(/^\/play\/([^/]+)\/([^/?#]+)\/?$/);
    if (playMatch) {
      return { libraryId: playMatch[1], videoId: playMatch[2] };
    }
  }

  return null;
};

/**
 * Returns an array of possible thumbnail URLs for a Bunny video.
 * Multiple URLs are returned because Bunny's thumbnail availability varies by configuration.
 * Configure EXPO_PUBLIC_BUNNY_STREAM_CDN_HOSTNAME for best results.
 */
export const resolveBunnyThumbnailUrls = (
  platform: VideoPlatform,
  videoUrl: string
): string[] => {
  if (platform !== "bunny") {
    return [];
  }

  const parts = extractBunnyEmbedParts(videoUrl);
  if (!parts) {
    return [];
  }

  const urls: string[] = [];
  const cdnHost = getConfiguredBunnyCdnHostname();
  
  if (cdnHost) {
    urls.push(`https://${cdnHost}/${parts.videoId}/thumbnail.jpg`);
  }
  
  urls.push(`https://vz-${parts.libraryId}.b-cdn.net/${parts.videoId}/thumbnail.jpg`);
  urls.push(`https://thumbnail.mediadelivery.net/${parts.libraryId}/${parts.videoId}/thumbnail.jpg`);
  
  return urls;
};

export const resolveBunnyThumbnailFromVideoUrl = (
  platform: VideoPlatform,
  videoUrl: string
): string | null => {
  const urls = resolveBunnyThumbnailUrls(platform, videoUrl);
  return urls.length > 0 ? urls[0] : null;
};

/**
 * When Firestore/API omits thumbnailUrl, derive a static image from the video URL.
 * (List cards no longer use WebView previews — thumbnails must come from URLs.)
 */
export const resolveAutoThumbnailFromVideoUrl = (
  platform: VideoPlatform,
  videoUrl: string
): string | null => {
  if (!videoUrl || typeof videoUrl !== "string" || !videoUrl.trim()) {
    return null;
  }
  const normalizedPlatform = normalizeVideoPlatform(platform);
  if (normalizedPlatform === "bunny") {
    return resolveBunnyThumbnailFromVideoUrl("bunny", videoUrl);
  }
  if (normalizedPlatform === "youtube") {
    const info = getYoutubeInfoFromUrl(videoUrl);
    if (info?.id) {
      return `https://img.youtube.com/vi/${info.id}/hqdefault.jpg`;
    }
    return null;
  }
  if (normalizedPlatform === "vimeo") {
    const id = getVimeoIdFromUrl(videoUrl);
    if (!id) {
      return null;
    }
    return `https://vumbnail.com/${id}.jpg`;
  }
  return null;
};

/**
 * Returns all possible thumbnail URLs for a video, in order of preference.
 * Used by VideoCard to try alternatives when primary thumbnail fails.
 */
export const resolveAllThumbnailUrls = (
  platform: VideoPlatform,
  videoUrl: string
): string[] => {
  if (!videoUrl || typeof videoUrl !== "string" || !videoUrl.trim()) {
    return [];
  }
  const normalizedPlatform = normalizeVideoPlatform(platform);
  
  if (normalizedPlatform === "bunny") {
    return resolveBunnyThumbnailUrls("bunny", videoUrl);
  }
  
  if (normalizedPlatform === "youtube") {
    const info = getYoutubeInfoFromUrl(videoUrl);
    if (info?.id) {
      return [
        `https://img.youtube.com/vi/${info.id}/hqdefault.jpg`,
        `https://img.youtube.com/vi/${info.id}/mqdefault.jpg`,
        `https://img.youtube.com/vi/${info.id}/sddefault.jpg`,
        `https://img.youtube.com/vi/${info.id}/default.jpg`,
      ];
    }
    return [];
  }
  
  if (normalizedPlatform === "vimeo") {
    const id = getVimeoIdFromUrl(videoUrl);
    if (!id) {
      return [];
    }
    return [`https://vumbnail.com/${id}.jpg`];
  }
  
  return [];
};

export const getEmbedUrl = (
  platform: VideoPlatform,
  videoUrl: string
): string | null => {
  if (!videoUrl) {
    return null;
  }

  const normalizedPlatform = normalizeVideoPlatform(platform);

  if (normalizedPlatform === "youtube") {
    const info = getYoutubeInfoFromUrl(videoUrl);
    if (!info) {
      return null;
    }
    if (info.listId && !info.id) {
      return `https://www.youtube.com/embed/videoseries?list=${info.listId}`;
    }
    return info.id ? `https://www.youtube.com/embed/${info.id}` : null;
  }

  if (normalizedPlatform === "vimeo") {
    const id = getVimeoIdFromUrl(videoUrl);
    return id ? `https://player.vimeo.com/video/${id}` : null;
  }

  const parts = extractBunnyEmbedParts(videoUrl);
  return parts
    ? `https://player.mediadelivery.net/embed/${parts.libraryId}/${parts.videoId}`
    : null;
};

export const getWatchUrl = (
  platform: VideoPlatform,
  videoUrl: string
): string | null => {
  if (!videoUrl) {
    return null;
  }

  const normalizedPlatform = normalizeVideoPlatform(platform);

  if (normalizedPlatform === "youtube") {
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

  if (normalizedPlatform === "vimeo") {
    const id = getVimeoIdFromUrl(videoUrl);
    return id ? `https://vimeo.com/${id}` : null;
  }

  const parts = extractBunnyEmbedParts(videoUrl);
  return parts
    ? `https://player.mediadelivery.net/play/${parts.libraryId}/${parts.videoId}`
    : null;
};

import type { Video } from "../types/video";
import {
  getEmbedUrl,
  normalizeVideoPlatform,
  resolveAllThumbnailUrls,
  resolveAutoThumbnailFromVideoUrl,
} from "./videoEmbed";

export const normalizeVideoLocale = (localeRaw?: string | null): string => {
  if (typeof localeRaw !== "string" || !localeRaw.trim()) {
    return "ro";
  }
  return localeRaw.trim().toLowerCase().replace("_", "-").split("-")[0] || "ro";
};

export const isFreeVideo = (video?: Pick<Video, "isPremium"> | null): boolean => {
  return video?.isPremium !== true;
};

const hasAnyLocalizedVideoUrl = (video: Video): boolean => {
  const locales = video.locales;
  if (!locales || typeof locales !== "object") {
    return false;
  }
  return Object.values(locales).some((entry) => {
    return typeof entry?.videoUrl === "string" && entry.videoUrl.trim().length > 0;
  });
};

export const resolveVideoSource = (
  video: Video,
  localeRaw?: string | null
): string => {
  const root = typeof video.videoUrl === "string" ? video.videoUrl.trim() : "";
  if (!hasAnyLocalizedVideoUrl(video)) {
    return root;
  }

  const locale = normalizeVideoLocale(localeRaw);
  const localizedUrl = video.locales?.[locale]?.videoUrl;
  if (typeof localizedUrl === "string" && localizedUrl.trim()) {
    return localizedUrl.trim();
  }
  // Firestore fallback: device locale may have no URL while another locale does (web cache filters per locale; raw fetch does not).
  if (root) {
    return root;
  }
  const locales = video.locales;
  if (locales && typeof locales === "object") {
    for (const key of Object.keys(locales)) {
      const u = locales[key]?.videoUrl;
      if (typeof u === "string" && u.trim()) {
        return u.trim();
      }
    }
  }
  return "";
};

export const getLocalizedVideoForDisplay = (
  video: Video,
  localeRaw?: string | null
): Video => {
  const locale = normalizeVideoLocale(localeRaw);
  const localizedFields = video.locales?.[locale];
  const localizedTitle = localizedFields?.title?.trim();
  const localizedDescription = localizedFields?.description?.trim();
  const platform = normalizeVideoPlatform(video.platform);
  const videoUrl = video.embedSrc || resolveVideoSource(video, locale);
  const explicitThumb =
    typeof video.thumbnailUrl === "string" && video.thumbnailUrl.trim()
      ? video.thumbnailUrl.trim()
      : "";

  const thumbSourceUrls: string[] = [];
  const pushUrl = (u: unknown) => {
    if (typeof u === "string" && u.trim()) {
      thumbSourceUrls.push(u.trim());
    }
  };
  pushUrl(video.embedSrc);
  pushUrl(videoUrl);
  pushUrl(resolveVideoSource(video, locale));
  pushUrl(video.videoUrl);
  const locs = video.locales;
  if (locs && typeof locs === "object") {
    for (const key of Object.keys(locs)) {
      pushUrl(locs[key]?.videoUrl);
    }
  }
  const uniqueSources = Array.from(new Set(thumbSourceUrls));

  let thumbnailUrl: string | undefined = explicitThumb || undefined;
  if (!thumbnailUrl) {
    for (const u of uniqueSources) {
      const derived = resolveAutoThumbnailFromVideoUrl(platform, u);
      if (derived) {
        thumbnailUrl = derived;
        break;
      }
    }
  }

  return {
    ...video,
    platform,
    videoUrl,
    thumbnailUrl,
    title: localizedTitle || video.title,
    description: localizedDescription || video.description,
  };
};

export const getVideoThumbnailUrl = (
  video: Video,
  localeRaw?: string | null
): string | undefined => {
  const localizedVideo = getLocalizedVideoForDisplay(video, localeRaw);
  return typeof localizedVideo.thumbnailUrl === "string" &&
    localizedVideo.thumbnailUrl.trim()
    ? localizedVideo.thumbnailUrl.trim()
    : undefined;
};

/**
 * Returns all possible thumbnail URLs for a video, in order of preference.
 * Includes explicit thumbnailUrl and all auto-generated alternatives.
 */
export const getAllVideoThumbnailUrls = (
  video: Video,
  localeRaw?: string | null
): string[] => {
  const urls: string[] = [];
  const locale = normalizeVideoLocale(localeRaw);
  const platform = normalizeVideoPlatform(video.platform);
  
  const explicitThumb = typeof video.thumbnailUrl === "string" && video.thumbnailUrl.trim()
    ? video.thumbnailUrl.trim()
    : null;
  if (explicitThumb) {
    urls.push(explicitThumb);
  }
  
  const videoUrl = video.embedSrc || resolveVideoSource(video, locale);
  if (videoUrl) {
    const autoUrls = resolveAllThumbnailUrls(platform, videoUrl);
    for (const u of autoUrls) {
      if (!urls.includes(u)) {
        urls.push(u);
      }
    }
  }
  
  if (video.videoUrl && video.videoUrl !== videoUrl) {
    const rootUrls = resolveAllThumbnailUrls(platform, video.videoUrl);
    for (const u of rootUrls) {
      if (!urls.includes(u)) {
        urls.push(u);
      }
    }
  }
  
  return urls;
};

export const prepareVideoForPlayback = (
  video: Video,
  localeRaw?: string | null
): Video | null => {
  const localizedVideo = getLocalizedVideoForDisplay(video, localeRaw);

  if (localizedVideo.canPlay === false) {
    return localizedVideo;
  }

  if (localizedVideo.embedSrc) {
    return localizedVideo;
  }

  if (!localizedVideo.videoUrl) {
    return null;
  }

  const embedSrc = getEmbedUrl(localizedVideo.platform, localizedVideo.videoUrl);
  return embedSrc ? { ...localizedVideo, embedSrc, videoUrl: embedSrc } : null;
};

export const filterFreePlayableVideos = (
  videos: Video[],
  localeRaw?: string | null
): Video[] => {
  return videos
    .map((video) => prepareVideoForPlayback(video, localeRaw))
    .filter((video): video is Video => Boolean(video));
};

/**
 * Locales for the playback language picker.
 * When `apiLocales` is set (GET detail — same as Next.js `availableLocales`), those codes are used
 * for every platform (YouTube, Vimeo, Bunny): one stream can be listed for all site locales.
 * Otherwise uses `locales.*.videoUrl` keys on the document.
 * Keeps only locales where `resolveVideoSource` + `getEmbedUrl` yields a playable embed.
 */
export const getPlaybackPickerLocales = (
  video: Video,
  apiLocales?: string[] | null
): string[] => {
  const platform = normalizeVideoPlatform(video.platform);
  const embedOkForLocale = (lc: string): boolean => {
    const raw = resolveVideoSource(video, lc);
    if (typeof raw !== "string" || !raw.trim()) return false;
    return getEmbedUrl(platform, raw.trim()) !== null;
  };

  const locales = video.locales;
  const explicitKeys =
    locales && typeof locales === "object"
      ? Object.keys(locales).filter((lc) => {
          const u = locales[lc]?.videoUrl;
          return typeof u === "string" && u.trim().length > 0;
        })
      : [];

  const candidates =
    Array.isArray(apiLocales) && apiLocales.length > 0 ? apiLocales : explicitKeys;

  const out = candidates.filter((lc) => embedOkForLocale(lc));

  return out.sort((a, b) => {
    if (a === "ro") return -1;
    if (b === "ro") return 1;
    return a.localeCompare(b);
  });
};

export const getAvailableVideoLocales = (video: Video): string[] =>
  getPlaybackPickerLocales(video, null);

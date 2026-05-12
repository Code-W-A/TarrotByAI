import type { Timestamp } from "firebase/firestore";

export type VideoPlatform = "bunny" | "vimeo" | "youtube";

export type VideoLocaleFields = {
  title: string;
  description?: string;
  videoUrl?: string;
};

export type VideoLocales = Record<string, VideoLocaleFields>;

export interface VideoDoc {
  title: string;
  description?: string;
  platform: VideoPlatform;
  videoUrl: string;
  thumbnailUrl?: string;
  category?: string;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp;
  publishAt?: Timestamp | null;
  notificationSentAt?: Timestamp | null;
  isPublished: boolean;
  isPremium?: boolean;
  order?: number | null;
  durationSeconds?: number | null;
  locales?: VideoLocales;
  canPlay?: boolean;
  embedSrc?: string | null;
  lockedReason?: "premium_required" | "source_invalid" | string | null;
}

export interface Video extends VideoDoc {
  id: string;
}

export type VideoCreateInput = {
  title: string;
  description?: string;
  platform: VideoPlatform;
  videoUrl: string;
  thumbnailUrl?: string;
  category?: string;
  isPublished?: boolean;
  isPremium?: boolean;
  order?: number;
  durationSeconds?: number;
  locales?: VideoLocales;
};

export type VideoUpdateInput = Partial<VideoCreateInput>;

import type { Timestamp } from "firebase/firestore";

export type VideoPlatform = "vimeo" | "youtube";

export type VideoLocaleFields = {
  title: string;
  description?: string;
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
  isPublished: boolean;
  isPremium?: boolean;
  order?: number | null;
  durationSeconds?: number | null;
  locales?: VideoLocales;
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

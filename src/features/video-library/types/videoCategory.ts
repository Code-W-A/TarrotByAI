import type { Timestamp } from "firebase/firestore";

export type VideoCategoryLocales = Record<string, string>;

export interface VideoCategoryDoc {
  name: string;
  createdAt?: Timestamp | null;
  locales?: VideoCategoryLocales;
}

export interface VideoCategory extends VideoCategoryDoc {
  id: string;
}

export type VideoCategoryCreateInput = {
  name: string;
  locales?: VideoCategoryLocales;
};

export type VideoCategoryUpdateInput = Partial<VideoCategoryCreateInput>;

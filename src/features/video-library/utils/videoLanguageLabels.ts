/**
 * Native language names for the video playback language picker.
 * Matches LANGUAGE_LABELS from next-js/data/constants.js
 */
export const VIDEO_LANGUAGE_LABELS: Record<string, string> = {
  ar: "العربية",
  bg: "Български",
  bs: "Bosanski",
  cs: "Čeština",
  de: "Deutsch",
  el: "Ελληνικά",
  en: "English",
  es: "Español",
  fr: "Français",
  he: "עברית",
  hi: "हिन्दी",
  hr: "Hrvatski",
  hu: "Magyar",
  id: "Indonesia",
  it: "Italiano",
  ja: "日本語",
  ko: "한국어",
  mn: "Монгол",
  pl: "Polski",
  pt: "Português",
  ro: "Română",
  ru: "Русский",
  sk: "Slovenčina",
  sq: "Shqip",
  tr: "Türkçe",
  uk: "Українська",
  zh: "中文",
};

export const getLanguageLabel = (localeCode: string): string => {
  return VIDEO_LANGUAGE_LABELS[localeCode] || localeCode.toUpperCase();
};

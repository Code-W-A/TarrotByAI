import AsyncStorage from "@react-native-async-storage/async-storage";

const CACHE_NAMESPACE = "@analysis_translation_patch_v1";

const SYNASTRY_CATEGORIES = [
  "harmoniousAspectReading",
  "conflictingAspectReading",
  "contrastingAspectReading",
  "intenseCompatibility",
  "physicalCompatibility",
  "emotionalCompatibility",
  "sexualCompatibility",
  "spiritualCompatibility",
  "financialCompatibility",
];

const ROMANIAN_DIACRITICS = /[ăâîșşțţ]/i;
const ENGLISH_LONG_TEXT_MARKERS =
  /\b(the|and|with|your|you|relationship|compatibility|partner|partners|emotional|spiritual|financial|physical|sexual|aspect|aspects|connection|between|energy|love|intense|conflict|contrast)\b/i;

const isString = (value) => typeof value === "string";
const shortCacheKey = (cacheKey) => {
  const value = String(cacheKey || "");
  return value.length > 60 ? value.slice(-60) : value;
};

export const normalizeLanguageCode = (lang) =>
  String(lang || "")
    .trim()
    .toLowerCase()
    .split("-")[0];

const stableStringify = (value) => {
  if (value === null || value === undefined) {
    return "null";
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }
  if (typeof value === "object") {
    const keys = Object.keys(value).sort();
    return `{${keys
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
};

const hashString = (input) => {
  const text = String(input || "");
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
};

export const buildAnalysisCacheKey = (analysisType, fingerprintInput) => {
  const type = String(analysisType || "generic");
  const fingerprint = stableStringify(fingerprintInput || {});
  const hash = hashString(`${type}:${fingerprint}`);
  return `${CACHE_NAMESPACE}:${type}:${hash}`;
};

const buildLanguageCacheKey = (baseKey, targetLang) => {
  const lang = normalizeLanguageCode(targetLang);
  if (!baseKey || !lang) {
    return null;
  }
  return `${baseKey}:${lang}`;
};

export const getCachedTranslationPatch = async (baseKey, targetLang) => {
  try {
    const cacheKey = buildLanguageCacheKey(baseKey, targetLang);
    if (!cacheKey) {
      console.log("[TR_CACHE] skip_read_invalid_key", {
        hasBaseKey: Boolean(baseKey),
        lang: normalizeLanguageCode(targetLang),
      });
      return null;
    }
    const raw = await AsyncStorage.getItem(cacheKey);
    if (!raw) {
      console.log("[TR_CACHE] miss", {
        lang: normalizeLanguageCode(targetLang),
        key: shortCacheKey(cacheKey),
      });
      return null;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      console.warn("[TR_CACHE] invalid_payload", {
        lang: normalizeLanguageCode(targetLang),
        key: shortCacheKey(cacheKey),
      });
      return null;
    }
    console.log("[TR_CACHE] hit", {
      lang: normalizeLanguageCode(targetLang),
      key: shortCacheKey(cacheKey),
    });
    return parsed;
  } catch (error) {
    console.warn("[analysisTranslationCache] cache read failed", error);
    return null;
  }
};

export const setCachedTranslationPatch = async (baseKey, targetLang, patch) => {
  try {
    const cacheKey = buildLanguageCacheKey(baseKey, targetLang);
    if (!cacheKey || !patch || typeof patch !== "object") {
      console.log("[TR_CACHE] skip_write_invalid_payload", {
        hasBaseKey: Boolean(baseKey),
        lang: normalizeLanguageCode(targetLang),
        hasPatch: Boolean(patch && typeof patch === "object"),
      });
      return false;
    }
    const serializedPatch = JSON.stringify(patch);
    await AsyncStorage.setItem(cacheKey, serializedPatch);
    console.log("[TR_CACHE] saved", {
      lang: normalizeLanguageCode(targetLang),
      key: shortCacheKey(cacheKey),
      bytes: serializedPatch.length,
    });
    return true;
  } catch (error) {
    console.warn("[analysisTranslationCache] cache write failed", error);
    return false;
  }
};

export const removeCachedTranslationPatch = async (baseKey, targetLang) => {
  try {
    const cacheKey = buildLanguageCacheKey(baseKey, targetLang);
    if (!cacheKey) {
      return false;
    }
    await AsyncStorage.removeItem(cacheKey);
    console.log("[TR_CACHE] removed", {
      lang: normalizeLanguageCode(targetLang),
      key: shortCacheKey(cacheKey),
    });
    return true;
  } catch (error) {
    console.warn("[analysisTranslationCache] cache remove failed", error);
    return false;
  }
};

const normalizeComparableText = (text) =>
  String(text || "")
    .replace(/\s+/g, " ")
    .trim();

export const isLikelyFailedTranslationResult = ({
  sourceText,
  translatedText,
  sourceLang,
  targetLang,
  minLength = 40,
} = {}) => {
  const source = normalizeLanguageCode(sourceLang);
  const target = normalizeLanguageCode(targetLang);
  if (!source || !target || source === target) {
    return false;
  }

  const original = normalizeComparableText(sourceText);
  const translated = normalizeComparableText(translatedText);
  if (!original || !translated) {
    return false;
  }

  return original.length >= minLength && original === translated;
};

const looksLikeEnglishLongText = (text) => {
  const normalized = normalizeComparableText(text);
  if (normalized.length < 40) {
    return false;
  }
  return (
    ENGLISH_LONG_TEXT_MARKERS.test(normalized) &&
    !ROMANIAN_DIACRITICS.test(normalized)
  );
};

export const countLikelyWrongLanguageSinastrieContent = (
  analysis,
  targetLang
) => {
  const target = normalizeLanguageCode(targetLang);
  if (!analysis || target !== "ro") {
    return 0;
  }

  let count = 0;
  SYNASTRY_CATEGORIES.forEach((category) => {
    const categoryData = analysis?.synastry?.[category]?.data;
    if (!Array.isArray(categoryData)) {
      return;
    }

    categoryData.forEach((item) => {
      const readings = Array.isArray(item?.reading) ? item.reading : [];
      readings.forEach((reading) => {
        if (looksLikeEnglishLongText(reading?.description)) {
          count += 1;
        }
      });
    });
  });

  return count;
};

export const hasLikelyWrongLanguageSinastrieContent = (
  analysis,
  targetLang
) => countLikelyWrongLanguageSinastrieContent(analysis, targetLang) > 0;

export const extractAstrogramaTranslationPatch = (analysis, targetLang) => {
  const lang = normalizeLanguageCode(
    targetLang || analysis?.actualLanguageAstrograma
  );
  if (!analysis || !lang) {
    return null;
  }

  const signPatch = {};
  Object.keys(analysis.generalSignTextData || {}).forEach((key) => {
    const data = analysis.generalSignTextData?.[key]?.data;
    if (!data || typeof data !== "object") {
      return;
    }
    const itemPatch = {};
    if (isString(data.report)) {
      itemPatch.report = data.report;
    }
    if (isString(data.title)) {
      itemPatch.title = data.title;
    }
    if (Object.keys(itemPatch).length > 0) {
      signPatch[key] = itemPatch;
    }
  });

  const housePatch = {};
  Object.keys(analysis.generalHouseTextData || {}).forEach((key) => {
    const data = analysis.generalHouseTextData?.[key]?.data;
    if (!data || typeof data !== "object") {
      return;
    }
    const itemPatch = {};
    if (isString(data.report)) {
      itemPatch.report = data.report;
    }
    if (isString(data.title)) {
      itemPatch.title = data.title;
    }
    if (Object.keys(itemPatch).length > 0) {
      housePatch[key] = itemPatch;
    }
  });

  return {
    type: "astrograma",
    version: 1,
    targetLang: lang,
    actualLanguageAstrograma: lang,
    ascendantResult: isString(analysis?.ascendantData?.data?.result)
      ? analysis.ascendantData.data.result
      : undefined,
    generalSignTextData: signPatch,
    generalHouseTextData: housePatch,
  };
};

export const applyAstrogramaTranslationPatch = (baseAnalysis, patch) => {
  try {
    if (!baseAnalysis || !patch || patch.type !== "astrograma") {
      return null;
    }
    const merged = JSON.parse(JSON.stringify(baseAnalysis));

    if (
      merged?.ascendantData?.data &&
      Object.prototype.hasOwnProperty.call(patch, "ascendantResult") &&
      isString(patch.ascendantResult)
    ) {
      merged.ascendantData.data.result = patch.ascendantResult;
    }

    Object.keys(patch.generalSignTextData || {}).forEach((key) => {
      const target = merged?.generalSignTextData?.[key]?.data;
      if (!target) {
        return;
      }
      const source = patch.generalSignTextData[key] || {};
      if (
        Object.prototype.hasOwnProperty.call(source, "report") &&
        isString(source.report)
      ) {
        target.report = source.report;
      }
      if (
        Object.prototype.hasOwnProperty.call(source, "title") &&
        isString(source.title)
      ) {
        target.title = source.title;
      }
    });

    Object.keys(patch.generalHouseTextData || {}).forEach((key) => {
      const target = merged?.generalHouseTextData?.[key]?.data;
      if (!target) {
        return;
      }
      const source = patch.generalHouseTextData[key] || {};
      if (
        Object.prototype.hasOwnProperty.call(source, "report") &&
        isString(source.report)
      ) {
        target.report = source.report;
      }
      if (
        Object.prototype.hasOwnProperty.call(source, "title") &&
        isString(source.title)
      ) {
        target.title = source.title;
      }
    });

    if (patch.actualLanguageAstrograma || patch.targetLang) {
      merged.actualLanguageAstrograma =
        patch.actualLanguageAstrograma || patch.targetLang;
    }
    return merged;
  } catch (error) {
    console.warn("[analysisTranslationCache] apply astrograma patch failed", error);
    return null;
  }
};

export const extractSinastrieTranslationPatch = (analysis, targetLang) => {
  const lang = normalizeLanguageCode(
    targetLang || analysis?.actualLanguageSinastrie
  );
  if (!analysis || !lang) {
    return null;
  }

  const synastryReadings = {};
  SYNASTRY_CATEGORIES.forEach((category) => {
    const categoryData = analysis?.synastry?.[category]?.data;
    if (!Array.isArray(categoryData)) {
      return;
    }
    synastryReadings[category] = categoryData.map((item) => ({
      reading: Array.isArray(item?.reading)
        ? item.reading.map((reading) => ({
            ...(isString(reading?.title) ? { title: reading.title } : {}),
            ...(isString(reading?.description)
              ? { description: reading.description }
              : {}),
          }))
        : [],
    }));
  });

  return {
    type: "sinastrie",
    version: 1,
    targetLang: lang,
    actualLanguageSinastrie: lang,
    synastryReadings,
  };
};

export const applySinastrieTranslationPatch = (baseAnalysis, patch) => {
  try {
    if (!baseAnalysis || !patch || patch.type !== "sinastrie") {
      return null;
    }
    const merged = JSON.parse(JSON.stringify(baseAnalysis));

    Object.keys(patch.synastryReadings || {}).forEach((category) => {
      const baseCategory = merged?.synastry?.[category]?.data;
      const patchCategory = patch.synastryReadings[category];
      if (!Array.isArray(baseCategory) || !Array.isArray(patchCategory)) {
        return;
      }

      patchCategory.forEach((patchItem, itemIndex) => {
        const baseItem = baseCategory[itemIndex];
        if (!baseItem || !Array.isArray(baseItem.reading)) {
          return;
        }
        const patchReadings = Array.isArray(patchItem?.reading)
          ? patchItem.reading
          : [];
        patchReadings.forEach((patchReading, readingIndex) => {
          const baseReading = baseItem.reading[readingIndex];
          if (!baseReading) {
            return;
          }
          if (
            Object.prototype.hasOwnProperty.call(patchReading, "title") &&
            isString(patchReading.title)
          ) {
            baseReading.title = patchReading.title;
          }
          if (
            Object.prototype.hasOwnProperty.call(patchReading, "description") &&
            isString(patchReading.description)
          ) {
            baseReading.description = patchReading.description;
          }
        });
      });
    });

    if (patch.actualLanguageSinastrie || patch.targetLang) {
      merged.actualLanguageSinastrie =
        patch.actualLanguageSinastrie || patch.targetLang;
    }
    return merged;
  } catch (error) {
    console.warn("[analysisTranslationCache] apply sinastrie patch failed", error);
    return null;
  }
};

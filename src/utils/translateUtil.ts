import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TRANSLATE_TIMEOUT_MS = 12000;
const TRANSIENT_HTTP_STATUSES = new Set([408, 429, 500, 502, 503, 504]);

const normalizeLanguageCode = (lang) =>
  String(lang || "")
    .trim()
    .toLowerCase()
    .split("-")[0];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchWithTimeout = async (
  url,
  options,
  timeoutMs = TRANSLATE_TIMEOUT_MS
): Promise<any> =>
  new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      const timeoutError: any = new Error(`Translation request timeout after ${timeoutMs}ms`);
      timeoutError.code = "ETIMEDOUT";
      reject(timeoutError);
    }, timeoutMs);

    fetch(url, options)
      .then((response) => {
        clearTimeout(timeoutId);
        resolve(response);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });

// Funcția pentru apelarea API-ului de traducere
const translateTextFallback = async (text, targetLang, sourceLang) => {
  const safeText = typeof text === "string" ? text : String(text ?? "");
  const target = normalizeLanguageCode(targetLang);
  const source = normalizeLanguageCode(sourceLang);
  if (!safeText || !target || (source && source === target)) {
    return safeText;
  }

  const fallbackUrl = "https://ai-translate.p.rapidapi.com/translate";
  const fallbackOptions = {
    method: "POST",
    headers: {
      "x-rapidapi-key": "fdb30fac7dmshee22c632d48569ap1d9819jsna577a39fffd6",
      "x-rapidapi-host": "ai-translate.p.rapidapi.com",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      texts: [safeText],
      tl: target,
      sl: source || "auto",
    }),
  };

  try {
    const response = await fetchWithTimeout(fallbackUrl, fallbackOptions, TRANSLATE_TIMEOUT_MS);
    if (!response.ok) {
      return safeText;
    }
    const data = await response.json();
    if (data?.code === 200 && data?.texts?.[0]) {
      return data.texts[0];
    }
    return safeText;
  } catch (error) {
    return safeText;
  }
};

const translateText = async (text, targetLang, sourceLang = "") => {
  const safeText = typeof text === "string" ? text : String(text ?? "");
  const target = normalizeLanguageCode(targetLang);
  const source = normalizeLanguageCode(sourceLang);
  if (!safeText || !target || (source && source === target)) {
    return safeText;
  }

  const url =
    "https://google-translate113.p.rapidapi.com/api/v1/translator/text";

  let lastError = null;
  for (let attempt = 1; attempt <= 2; attempt++) {
    const options = {
      method: "POST",
      headers: {
        "x-rapidapi-key": "fdb30fac7dmshee22c632d48569ap1d9819jsna577a39fffd6",
        "x-rapidapi-host": "google-translate113.p.rapidapi.com",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: source || "auto",
        to: target,
        text: safeText,
      }),
    };

    try {
      const response = await fetchWithTimeout(url, options, TRANSLATE_TIMEOUT_MS);

      if (!response.ok) {
        const requestError: any = new Error(`Eroare API: ${response.status}`);
        requestError.status = response.status;
        throw requestError;
      }

      const data = await response.json();

      if (!data || !data.trans) {
        throw new Error("Format răspuns neașteptat de la RapidAPI");
      }

      return data.trans;
    } catch (error) {
      lastError = error;
      const err: any = error;
      const shouldRetry =
        attempt === 1 &&
        (err?.code === "ETIMEDOUT" ||
          TRANSIENT_HTTP_STATUSES.has(err?.status));
      if (shouldRetry) {
        await sleep(250);
        continue;
      }
      break;
    }
  }

  const fallback = await translateTextFallback(safeText, target, source);
  if (fallback !== safeText) {
    return fallback;
  }

  console.warn("[translateUtil] primary+fallback failed, returning original", {
    target,
    source: source || "auto",
    error: lastError?.message || String(lastError || "unknown"),
  });
  return safeText;
};

// const translateText = async (text, targetLang) => {
//   const url = "https://translate281.p.rapidapi.com/";
//   const data = new FormData();
//   data.append("text", text);
//   data.append("from", "auto");
//   data.append("to", targetLang);

//   const options = {
//     method: "POST",
//     headers: {
//       "x-rapidapi-key": "fdb30fac7dmshee22c632d48569ap1d9819jsna577a39fffd6",
//       "x-rapidapi-host": "translate281.p.rapidapi.com",
//     },
//     body: data,
//   };

//   try {
//     const response = await fetch(url, options);
//     const result = await response.json();
//     return result.response || text; // Fallback la textul original
//   } catch (error) {
//     console.error("Eroare la traducere:", error);
//     return text;
//   }
// };

// Funcția de generare a hash-ului
const generateHash = (input) => {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString();
};

// Generare cacheKey
const createCacheKey = (text, targetLang, context = "global") => {
  const textHash = generateHash(text);
  return `translation_${context}_${targetLang}_${textHash}`;
};

// Hook-ul pentru traducere
export const useTranslation = (text, targetLang, context = "global") => {
  const [translatedText, setTranslatedText] = useState(text);

  useEffect(() => {
    const fetchTranslation = async () => {
      const cacheKey = createCacheKey(text, targetLang, context);
      try {
        // Verifică traducerea în cache
        const cachedTranslation = await AsyncStorage.getItem(cacheKey);
        if (cachedTranslation) {
          setTranslatedText(cachedTranslation);
          return;
        }

        // Dacă nu există, traduce textul și îl salvează în cache
        const translation = await translateText(text, targetLang);
        const normalizedTarget = normalizeLanguageCode(targetLang);
        const shouldCache = translation !== text || normalizedTarget === "ro";
        if (shouldCache) {
          await AsyncStorage.setItem(cacheKey, translation);
        }
        setTranslatedText(translation);
      } catch (error) {
        console.error("Eroare la gestionarea traducerii:", error);
        setTranslatedText(text); // Fallback la textul original
      }
    };

    fetchTranslation();
  }, [text, targetLang, context]);

  return translatedText;
};

import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Funcția pentru apelarea API-ului de traducere
const translateText = async (text, targetLang) => {
  const url = "https://translate281.p.rapidapi.com/";
  const data = new FormData();
  data.append("text", text);
  data.append("from", "auto");
  data.append("to", targetLang);

  const options = {
    method: "POST",
    headers: {
      "x-rapidapi-key": "fdb30fac7dmshee22c632d48569ap1d9819jsna577a39fffd6",
      "x-rapidapi-host": "translate281.p.rapidapi.com",
    },
    body: data,
  };

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    return result.response || text; // Fallback la textul original
  } catch (error) {
    console.error("Eroare la traducere:", error);
    return text;
  }
};

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
        await AsyncStorage.setItem(cacheKey, translation);
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

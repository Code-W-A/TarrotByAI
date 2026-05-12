import AsyncStorage from "@react-native-async-storage/async-storage";
import { handleLanguagei18n } from "./handleLanguageGeneral"; // Adjust path if needed
import {
  syncUserProfileAppLanguageForNotifications,
  upsertUserTokenMetadata,
} from "./firestoreUtils";

/**
 * Actualizează limba utilizatorului în aplicație.
 * @param {string} langCode - Codul limbii (ex. "en", "ro").
 * @param {function} changeLanguage - Funcția pentru schimbarea limbii din context.
 * @param {object} expoPushToken - Token-ul notificărilor push.
 * @returns {object} - Obiectul cu numele limbii și steagul.
 */

export const languages = [
  {
    name: "Romanian",
    code: "ro",
    flag: require("../../assets/flags/romania.png"),
  },
  {
    name: "English",
    code: "en",
    flag: require("../../assets/flags/english.png"),
  },
  {
    name: "Spanish",
    code: "es",
    flag: require("../../assets/flags/spanish.png"),
  },
  {
    name: "Bulgarian",
    code: "bg",
    flag: require("../../assets/flags/bulgaria.png"),
  },
  {
    name: "Czech",
    code: "cs",
    flag: require("../../assets/flags/czech.png"),
  },
  {
    name: "German",
    code: "de",
    flag: require("../../assets/flags/germany.png"),
  },
  {
    name: "Greek",
    code: "el",
    flag: require("../../assets/flags/greece.png"),
  },
  {
    name: "French",
    code: "fr",
    flag: require("../../assets/flags/france.png"),
  },
  {
    name: "Croatian",
    code: "hr",
    flag: require("../../assets/flags/croatia.png"),
  },
  {
    name: "Hindi",
    code: "hi",
    flag: require("../../assets/flags/india.png"),
  },
  {
    name: "Italian",
    code: "it",
    flag: require("../../assets/flags/italy.png"),
  },
  {
    name: "Polish",
    code: "pl",
    flag: require("../../assets/flags/poland.png"),
  },
  {
    name: "Indonesian",
    code: "id",
    flag: require("../../assets/flags/indonesia.png"),
  },
  {
    name: "Slovak",
    code: "sk",
    flag: require("../../assets/flags/slovakia.png"),
  },
  // Adăugați aici alte limbi și steaguri, dacă este necesar
];

export const updateLanguage = async (
  langCode,
  changeLanguage,
  expoPushToken
) => {
  try {
    console.log("[LanguageUtils] updateLanguage start", { langCode });

    // Actualizează limba în i18n
    const newLangCode = await handleLanguagei18n(langCode);
    changeLanguage(newLangCode);

    // Salvează limba în AsyncStorage
    await AsyncStorage.setItem("@userLanguage", langCode);

    // Obține informațiile despre limbă (nume și steag)
    const foundLanguage = languages.find((l) => l.code === langCode);
    const languageInfo = {
      name: foundLanguage ? foundLanguage.name : "English",
      flag: foundLanguage ? foundLanguage.flag : null,
    };

    // Actualizează limba în Firestore
    if (expoPushToken && expoPushToken.data) {
      const result = await upsertUserTokenMetadata(expoPushToken.data, {
        language: langCode,
        source: "LanguageUtils.updateLanguage",
      });
      console.log("[LanguageUtils] synced userTokens language", {
        langCode,
        result,
      });
    } else {
      console.log("[LanguageUtils] skip userTokens language sync - missing expoPushToken");
    }

    void syncUserProfileAppLanguageForNotifications(
      langCode,
      "LanguageUtils.updateLanguage"
    );

    return languageInfo;
  } catch (error) {
    console.error("Eroare la actualizarea limbii:", error);
    throw error;
  }
};

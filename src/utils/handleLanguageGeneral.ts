import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "../../i18n";

// ... codul existent ...

export const handleLanguagei18n = async (language) => {
  console.log(`${language} Selected in i18n`);

  // Setează locale-ul i18n
  let newLocale;
  console.log(language);
  switch (language) {
    case "ro":
      newLocale = "ro";
      break;
    case "en":
      newLocale = "en";
      break;
    case "es":
      newLocale = "es";
      break;
    case "bg":
      newLocale = "bg";
      break;
    case "cs":
      newLocale = "cs";
      break;
    case "de":
      newLocale = "de";
      break;
    case "el":
      newLocale = "el";
      break;
    case "fr":
      newLocale = "fr";
      break;
    case "hr":
      newLocale = "hr";
      break;
    case "hi":
      newLocale = "hi";
      break;
    case "it":
      newLocale = "it";
      break;
    case "pl":
      newLocale = "pl";
      break;
    case "id":
      newLocale = "id";
      break;
    case "sk":
      newLocale = "sk";
      break;
    // Adăugați aici alte limbi și codurile lor, dacă este cazul
    default:
      newLocale = "en"; // O valoare implicită în cazul în care nu se găsește limba selectată
  }

  i18n.locale = newLocale;

  // Salvarea preferinței în AsyncStorage pentru persistență
  try {
    await AsyncStorage.setItem("@userLanguage", newLocale);
  } catch (e) {
    console.error("Failed to save the language to storage");
  }
  return newLocale;
};

// ... restul codului LanguageSelectScreen ...

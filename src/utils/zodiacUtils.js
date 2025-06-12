import i18n from "../../i18n";

// Fallback zodiac sign translations if main i18n doesn't have them
const zodiacTranslations = {
  ro: {
    // Capitalized format
    Aries: "Berbec",
    Taurus: "Taur", 
    Gemini: "Gemeni",
    Cancer: "Rac",
    Leo: "Leu",
    Virgo: "Fecioară",
    Libra: "Balanță",
    Scorpio: "Scorpion",
    Sagittarius: "Săgetător",
    Capricorn: "Capricorn",
    Aquarius: "Vărsător",
    Pisces: "Pești",
    // Uppercase format
    ARIES: "Berbec",
    TAURUS: "Taur", 
    GEMINI: "Gemeni",
    CANCER: "Rac",
    LEO: "Leu",
    VIRGO: "Fecioară",
    LIBRA: "Balanță",
    SCORPIO: "Scorpion",
    SAGITTARIUS: "Săgetător",
    CAPRICORN: "Capricorn",
    AQUARIUS: "Vărsător",
    PISCES: "Pești",
  },
  en: {
    // Capitalized format
    Aries: "Aries",
    Taurus: "Taurus", 
    Gemini: "Gemini",
    Cancer: "Cancer",
    Leo: "Leo",
    Virgo: "Virgo",
    Libra: "Libra",
    Scorpio: "Scorpio",
    Sagittarius: "Sagittarius",
    Capricorn: "Capricorn",
    Aquarius: "Aquarius",
    Pisces: "Pisces",
    // Uppercase format
    ARIES: "Aries",
    TAURUS: "Taurus", 
    GEMINI: "Gemini",
    CANCER: "Cancer",
    LEO: "Leo",
    VIRGO: "Virgo",
    LIBRA: "Libra",
    SCORPIO: "Scorpio",
    SAGITTARIUS: "Sagittarius",
    CAPRICORN: "Capricorn",
    AQUARIUS: "Aquarius",
    PISCES: "Pisces",
  },
  es: {
    // Capitalized format
    Aries: "Aries",
    Taurus: "Tauro", 
    Gemini: "Géminis",
    Cancer: "Cáncer",
    Leo: "Leo",
    Virgo: "Virgo",
    Libra: "Libra",
    Scorpio: "Escorpio",
    Sagittarius: "Sagitario",
    Capricorn: "Capricornio",
    Aquarius: "Acuario",
    Pisces: "Piscis",
    // Uppercase format
    ARIES: "Aries",
    TAURUS: "Tauro", 
    GEMINI: "Géminis",
    CANCER: "Cáncer",
    LEO: "Leo",
    VIRGO: "Virgo",
    LIBRA: "Libra",
    SCORPIO: "Escorpio",
    SAGITTARIUS: "Sagitario",
    CAPRICORN: "Capricornio",
    AQUARIUS: "Acuario",
    PISCES: "Piscis",
  },
  it: {
    // Capitalized format
    Aries: "Ariete",
    Taurus: "Toro", 
    Gemini: "Gemelli",
    Cancer: "Cancro",
    Leo: "Leone",
    Virgo: "Vergine",
    Libra: "Bilancia",
    Scorpio: "Scorpione",
    Sagittarius: "Sagittario",
    Capricorn: "Capricorno",
    Aquarius: "Acquario",
    Pisces: "Pesci",
    // Uppercase format
    ARIES: "Ariete",
    TAURUS: "Toro", 
    GEMINI: "Gemelli",
    CANCER: "Cancro",
    LEO: "Leone",
    VIRGO: "Vergine",
    LIBRA: "Bilancia",
    SCORPIO: "Scorpione",
    SAGITTARIUS: "Sagittario",
    CAPRICORN: "Capricorno",
    AQUARIUS: "Acquario",
    PISCES: "Pesci",
  },
  pl: {
    // Capitalized format
    Aries: "Baran",
    Taurus: "Byk", 
    Gemini: "Bliźnięta",
    Cancer: "Rak",
    Leo: "Lew",
    Virgo: "Panna",
    Libra: "Waga",
    Scorpio: "Skorpion",
    Sagittarius: "Strzelec",
    Capricorn: "Koziorożec",
    Aquarius: "Wodnik",
    Pisces: "Ryby",
    // Uppercase format
    ARIES: "Baran",
    TAURUS: "Byk", 
    GEMINI: "Bliźnięta",
    CANCER: "Rak",
    LEO: "Lew",
    VIRGO: "Panna",
    LIBRA: "Waga",
    SCORPIO: "Skorpion",
    SAGITTARIUS: "Strzelec",
    CAPRICORN: "Koziorożec",
    AQUARIUS: "Wodnik",
    PISCES: "Ryby",
  }
};

/**
 * Translate zodiac sign to user's language
 * @param {string} zodiacSign - The zodiac sign in English (e.g., "Aries", "Leo", "CANCER", "LEO")
 * @param {string} language - The target language code (e.g., "ro", "en", "es")
 * @returns {string} - The translated zodiac sign name
 */
export const translateZodiacSign = (zodiacSign, language = 'en') => {
  if (!zodiacSign) return '';
  
  // First try the main i18n system with the exact format
  let mainTranslation = i18n.translate(zodiacSign);
  if (mainTranslation && mainTranslation !== zodiacSign) {
    return mainTranslation;
  }
  
  // Try with uppercase format
  const uppercaseSign = zodiacSign.toUpperCase();
  mainTranslation = i18n.translate(uppercaseSign);
  if (mainTranslation && mainTranslation !== uppercaseSign) {
    return mainTranslation;
  }
  
  // Try with capitalized format
  const capitalizedSign = zodiacSign.charAt(0).toUpperCase() + zodiacSign.slice(1).toLowerCase();
  mainTranslation = i18n.translate(capitalizedSign);
  if (mainTranslation && mainTranslation !== capitalizedSign) {
    return mainTranslation;
  }
  
  // Fallback to our local translations
  if (zodiacTranslations[language] && zodiacTranslations[language][zodiacSign]) {
    return zodiacTranslations[language][zodiacSign];
  }
  
  // Try local translations with uppercase
  if (zodiacTranslations[language] && zodiacTranslations[language][uppercaseSign]) {
    return zodiacTranslations[language][uppercaseSign];
  }
  
  // Try local translations with capitalized
  if (zodiacTranslations[language] && zodiacTranslations[language][capitalizedSign]) {
    return zodiacTranslations[language][capitalizedSign];
  }
  
  // Final fallback to English if available
  if (zodiacTranslations.en[zodiacSign] || zodiacTranslations.en[uppercaseSign] || zodiacTranslations.en[capitalizedSign]) {
    return zodiacTranslations.en[zodiacSign] || zodiacTranslations.en[uppercaseSign] || zodiacTranslations.en[capitalizedSign];
  }
  
  // Ultimate fallback to original sign name
  return zodiacSign;
};

/**
 * Get current app language from i18n
 * @returns {string} - The current language code
 */
export const getCurrentLanguage = () => {
  try {
    // Try multiple ways to get the current language
    const locale = i18n.locale || i18n.currentLocale || i18n.language || 'en';
    return locale.toLowerCase().split('-')[0]; // Extract main language code (e.g., 'en' from 'en-US')
  } catch (error) {
    console.log('Error getting current language, defaulting to en:', error);
    return 'en';
  }
};

/**
 * Translate zodiac sign using current app language
 * @param {string} zodiacSign - The zodiac sign in English
 * @returns {string} - The translated zodiac sign name
 */
export const translateZodiacSignAuto = (zodiacSign) => {
  const currentLang = getCurrentLanguage();
  const result = translateZodiacSign(zodiacSign, currentLang);
  
  // Debug logging
  console.log('🌟 Zodiac Translation Debug:', {
    input: zodiacSign,
    currentLang,
    result,
    i18nDirectTest: i18n.translate ? i18n.translate(zodiacSign) : 'i18n.translate not available'
  });
  
  return result;
};

/**
 * Test function for zodiac translations
 * @param {string} zodiacSign - The zodiac sign to test
 */
export const testZodiacTranslation = (zodiacSign = 'CANCER') => {
  console.log('🧪 Testing zodiac translation for:', zodiacSign);
  const currentLang = getCurrentLanguage();
  console.log('Current language:', currentLang);
  
  // Test all variants
  const variants = [
    zodiacSign,
    zodiacSign.toUpperCase(),
    zodiacSign.charAt(0).toUpperCase() + zodiacSign.slice(1).toLowerCase()
  ];
  
  variants.forEach(variant => {
    console.log(`Testing variant "${variant}":`, translateZodiacSign(variant, currentLang));
  });
}; 
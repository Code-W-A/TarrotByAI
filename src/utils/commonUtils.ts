import moment from "moment";

// Funcție pentru a converti stringurile de dată în obiecte Date
export function parseDate(dateStr) {
  let parts = dateStr.split(".");
  // Notă: luna este 0-indexată în JavaScript
  return new Date(parts[2], parts[1] - 1, parts[0]);
}

export const toUrlSlug = (string) => {
  return string
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-"); // Replace multiple - with single -
};

export const filterArticlesBeforeCurrentTime = (articlesData) => {
  const now = new Date();

  return articlesData.filter((article) => {
    const scheduledDate = article?.dataProgramata || article?.firstUploadDate;
    const scheduledTime = article?.timpProgramat || article?.firstUploadtime || "00:00";

    if (!scheduledDate) {
      return true; // dacă nu există dată programată, nu filtrăm articolul
    }

    // Încercăm parsare robustă cu moment pe formatele uzuale
    const dateTimeStr = `${scheduledDate} ${scheduledTime}`.trim();
    const m = moment(dateTimeStr, [
      "DD-MM-YYYY HH:mm",
      "YYYY-MM-DD HH:mm",
      "DD.MM.YYYY HH:mm",
      "DD/MM/YYYY HH:mm",
      "DD-MM-YYYY",
      "YYYY-MM-DD",
    ], true);

    let scheduledDateTime: Date | null = null;
    if (m.isValid()) {
      scheduledDateTime = m.toDate();
    } else {
      // Fallback: vechea logică bazată pe inversarea zilei-lunii-anului pentru formatul DD-MM-YYYY
      try {
        const parts = scheduledDate.split("-");
        const isYearFirst = parts?.[0]?.length === 4;
        const normalizedDate = isYearFirst
          ? scheduledDate
          : parts.reverse().join("-");
        scheduledDateTime = new Date(`${normalizedDate}T${scheduledTime}:00`);
      } catch (e) {
        scheduledDateTime = null;
      }
    }

    if (!scheduledDateTime || isNaN(scheduledDateTime.getTime())) {
      return true; // dacă nu putem parsa, nu ascundem articolul ca să evităm dispariții accidentale
    }

    return scheduledDateTime <= now;
  });
};

export const getRandomElements = (array, numberOfElements) => {
  const shuffledArray = array.sort(() => Math.random() - 0.5); // Amestecă array-ul
  return shuffledArray.slice(0, numberOfElements); // Returnează primele numberOfElements elemente
};

export function decimalToSexagesimal(decimalDegree: any) {
  // Calculam indexul semnului (0 pentru Berbec, 1 pentru Taur, etc.)
  const signIndex = Math.floor(decimalDegree / 30);
  // Calculam gradul în semnul specific
  const degreeInSign = decimalDegree % 30;

  // Calculam minutele și secundele
  const degrees = Math.floor(degreeInSign);
  const remainingMinutes = (degreeInSign - degrees) * 60;
  const minutes = Math.floor(remainingMinutes);
  const seconds = Math.floor((remainingMinutes - minutes) * 60);

  // return `${degrees}° ${minutes}' ${seconds}"`;
  return `${degrees}° ${minutes}'`;
}

export function convertSpeedToSexagesimal(speed) {
  // Verificăm dacă speed este un șir de caractere valid sau dacă este gol sau conține "--"
  if (!speed || speed === "--" || isNaN(Number(speed))) {
    return "--"; // Sau orice altă valoare sau mesaj consideri adecvat
  }

  const numericSpeed = Number(speed); // Convertim input-ul într-un număr
  const totalSeconds = Math.abs(numericSpeed) * 3600; // Convertim viteza în secunde totale
  const hours = Math.floor(totalSeconds / 3600); // Obținem orele
  const remainingSeconds = totalSeconds % 3600;
  const minutes = Math.floor(remainingSeconds / 60); // Obținem minutele
  const seconds = Math.floor(remainingSeconds % 60); // Obținem secundele

  // Formatăm rezultatul similar cu o oră, indicând viteza
  return `${hours}° ${minutes}' ${seconds}"`;
}

export function getAspectAngle(aspect) {
  switch (aspect) {
    case "Conjunction":
      return 0;
    case "Sextile":
      return 60;
    case "Square":
      return 90;
    case "Trine":
      return 120;
    case "Opposition":
      return 180;
    case "Quincunx":
      return 150;
    case "Semisextile":
      return 30;
    default:
      return null; // Sau orice valoare consideri potrivită pentru cazuri necunoscute
  }
}

export const formatDate = (day, month, year) => {
  const date = moment(`${year}-${month}-${day}`, "YYYY-MM-DD");
  return date.format("YYYY-MM-DD");
};

export const getCurrentDateFormatted = () => {
  return moment().format("YYYY-MM-DD");
};

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
    const hasScheduledDate = !!article?.dataProgramata;
    const hasScheduledTime = !!article?.timpProgramat;

    // Dacă nu avem niciun câmp de programare, cădem pe firstUpload* (comportament existent)
    const fallbackDate = article?.firstUploadDate || moment(now).format("YYYY-MM-DD");
    const fallbackTime = article?.firstUploadtime || "00:00";

    // Regula: dacă există oricare din câmpurile de programare, le respectăm strict.
    // - dacă avem doar timp: folosim data de azi + timpProgramat
    // - dacă avem doar dată: folosim ora 00:00 pentru data respectivă
    // - dacă avem ambele: le concatenăm
    // - dacă nu avem nimic: folosim firstUploadDate/time (comportament vechi)
    const dateStr = hasScheduledDate
      ? String(article.dataProgramata)
      : hasScheduledTime
        ? moment(now).format("YYYY-MM-DD")
        : String(fallbackDate);

    const timeStr = hasScheduledTime
      ? String(article.timpProgramat)
      : hasScheduledDate
        ? "00:00"
        : String(fallbackTime);

    // Încercăm parsare robustă cu moment pe formatele uzuale
    const dateTimeStr = `${dateStr} ${timeStr}`.trim();
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
      // Fallback: încercăm un ISO aproximativ pentru formatele tipice
      try {
        // Normalizăm data dacă vine ca DD-MM-YYYY
        const partsDash = dateStr.split("-");
        const isYearFirst = partsDash?.[0]?.length === 4;
        const normalizedDate = isYearFirst
          ? dateStr
          : partsDash.reverse().join("-");
        scheduledDateTime = new Date(`${normalizedDate}T${timeStr}:00`);
      } catch (e) {
        scheduledDateTime = null;
      }
    }

    if (!scheduledDateTime || isNaN(scheduledDateTime.getTime())) {
      // Dacă există câmpuri de programare dar nu putem parsa => nu afișăm pentru a nu încălca programarea
      if (hasScheduledDate || hasScheduledTime) {
        return false;
      }
      // Altfel, păstrăm comportamentul vechi (afișăm)
      return true;
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

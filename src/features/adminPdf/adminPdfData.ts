import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";

import {
  fetchAstroData,
  fetchTimeZone,
  generateTimestampFromDateTime,
} from "../../utils/AstralUtils/fetchNatalWheelChart";
import { fetchSinastrieData } from "../../utils/AstralUtils/fetchSinastrieDate";
import {
  gTranslateFallbackFetch,
  handleToTranslate,
} from "../../utils/AstralUtils/fetchGPTData";

type GenericObject = Record<string, any>;

type SavedDataBundle = {
  userData: GenericObject | null;
  personsDataAstrograma: GenericObject[];
  personsData: GenericObject[];
  personsDataOthers: GenericObject[];
};

type SavedAnalysisOption = {
  id: string;
  label: string;
  emailPrefill: string;
  analysis: GenericObject;
  sourceType: "saved";
};

type ManualPersonInput = {
  full_name: string;
  day: string;
  month: string;
  year: string;
  selectedTime: string;
  gender: string;
  place: string;
  adress: string;
  lat: string;
  lon: string;
};

const ASTRO_CELESTIAL_BODIES = [
  "Sun",
  "Moon",
  "Mars",
  "Mercury",
  "Venus",
  "Jupiter",
  "Saturn",
  "NorthNode",
  "SouthNode",
  "Uranus",
  "Neptune",
  "Pluto",
  "MC",
  "Chiron",
];

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

const ASTRO_ENDPOINTS = {
  natalWheelChart:
    "https://astroapi-4.divineapi.com/western-api/v1/natal-wheel-chart",
  aspectTable: "https://astroapi-4.divineapi.com/western-api/v2/aspect-table",
  planetaryPositions:
    "https://astroapi-4.divineapi.com/western-api/v1/planetary-positions",
  houseCusps: "https://astroapi-4.divineapi.com/western-api/v1/house-cusps",
  moonPhases: "https://astroapi-4.divineapi.com/western-api/v2/moon-phases",
  ascendantReport:
    "https://astroapi-4.divineapi.com/western-api/v1/ascendant-report",
  generalHouseReports: ASTRO_CELESTIAL_BODIES.map(
    (body) =>
      `https://astroapi-4.divineapi.com/western-api/v1/general-house-report/${body}`
  ),
  generalSignReports: ASTRO_CELESTIAL_BODIES.map(
    (body) =>
      `https://astroapi-4.divineapi.com/western-api/v1/general-sign-report/${body}`
  ),
};

const SYNASTRY_ENDPOINTS = {
  natalWheelChart:
    "https://astroapi-4.divineapi.com/western-api/v1/synastry/natal-wheel-chart",
  houseCusps:
    "https://astroapi-4.divineapi.com/western-api/v1/synastry/house-cusps",
  planetaryPositions:
    "https://astroapi-4.divineapi.com/western-api/v1/synastry/planetary-positions",
  aspect: "https://astroapi-4.divineapi.com/western-api/v1/synastry/aspect",
  harmoniousAspectReading:
    "https://astroapi-4.divineapi.com/western-api/v1/synastry/harmonious-aspect-reading",
  conflictingAspectReading:
    "https://astroapi-4.divineapi.com/western-api/v1/synastry/conflicting-aspect-reading",
  contrastingAspectReading:
    "https://astroapi-4.divineapi.com/western-api/v1/synastry/contrasting-aspect-reading",
  intenseCompatibility:
    "https://astroapi-4.divineapi.com/western-api/v1/synastry/intense-aspect-reading",
  physicalCompatibility:
    "https://astroapi-4.divineapi.com/western-api/v1/synastry/physical-compatibility",
  emotionalCompatibility:
    "https://astroapi-4.divineapi.com/western-api/v1/synastry/emotional-compatibility",
  sexualCompatibility:
    "https://astroapi-4.divineapi.com/western-api/v1/synastry/sexual-compatibility",
  spiritualCompatibility:
    "https://astroapi-4.divineapi.com/western-api/v1/synastry/spiritual-compatibility",
  financialCompatibility:
    "https://astroapi-4.divineapi.com/western-api/v1/synastry/financial-compatibility",
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const safeJsonParse = <T>(value: string | null, fallback: T): T => {
  if (!value) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

const normalizeLanguageCode = (language?: string): string => {
  if (!language || typeof language !== "string") {
    return "en";
  }

  return language.split("-")[0].toLowerCase();
};

const ensureStringNumber = (value: string): string => {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    return "0";
  }

  return String(parsed);
};

const parseTime = (value?: string) => {
  const timeMoment = value
    ? moment(value, ["HH:mm", "H:mm"], true)
    : moment("00:00", "HH:mm");

  if (!timeMoment.isValid()) {
    const fallback = moment("00:00", "HH:mm");
    return {
      selectedTime: "00:00",
      hour: fallback.hour(),
      min: fallback.minute(),
      sec: fallback.second(),
    };
  }

  return {
    selectedTime: timeMoment.format("HH:mm"),
    hour: timeMoment.hour(),
    min: timeMoment.minute(),
    sec: timeMoment.second(),
  };
};

const normalizeEmailFromAnalysis = (
  analysis: GenericObject | null | undefined,
  fallbackEmail: string
) => {
  if (!analysis) {
    return fallbackEmail;
  }

  const rawEmail = analysis.email || analysis.userEmail || analysis.mail;
  if (!rawEmail || typeof rawEmail !== "string") {
    return fallbackEmail;
  }

  return rawEmail.trim();
};

const translateTextWithFallback = async (
  text: string,
  targetLanguage: string,
  sourceLanguage: string
) => {
  if (!text || typeof text !== "string") {
    return text;
  }

  let translatedText = text;
  try {
    const result = await handleToTranslate(text, targetLanguage, sourceLanguage);
    if (typeof result === "string" && result.length > 0) {
      translatedText = result;
    }
  } catch {
    translatedText = text;
  }

  const didNotChange =
    translatedText.trim().toLowerCase() === text.trim().toLowerCase();

  if (
    targetLanguage !== sourceLanguage &&
    didNotChange
  ) {
    try {
      const fallbackResult = await gTranslateFallbackFetch(text, targetLanguage);
      if (
        typeof fallbackResult === "string" &&
        fallbackResult.trim().length > 0
      ) {
        translatedText = fallbackResult;
      }
    } catch {
      translatedText = translatedText || text;
    }
  }

  return translatedText || text;
};

const buildPersonDataWithTimezone = async (
  personInput: ManualPersonInput
): Promise<GenericObject> => {
  const day = ensureStringNumber(personInput.day);
  const month = ensureStringNumber(personInput.month);
  const year = ensureStringNumber(personInput.year);
  const timeData = parseTime(personInput.selectedTime);

  const timestamp = generateTimestampFromDateTime(
    `${day}-${month}-${year}`,
    timeData.selectedTime
  );
  const timezoneData = await fetchTimeZone(
    Number(personInput.lat),
    Number(personInput.lon),
    timestamp
  );

  const timezoneOffset =
    typeof timezoneData?.offset === "number" ? timezoneData.offset : 0;

  return {
    full_name: personInput.full_name?.trim() || "",
    day,
    month,
    year,
    hour: timeData.hour,
    min: timeData.min,
    sec: timeData.sec,
    selectedTime: timeData.selectedTime,
    gender: personInput.gender || "male",
    place: personInput.place || "",
    adress: personInput.adress || "",
    lat: personInput.lat,
    lon: personInput.lon,
    tzone: timezoneOffset,
    actualLanguage: "en",
    actualLanguageAstrograma: "en",
    actualLanguageSinastrie: "en",
  };
};

export const loadAdminSavedData = async (): Promise<SavedDataBundle> => {
  const [userDataRaw, personsDataAstrogramaRaw, personsDataRaw, personsDataOthersRaw] =
    await Promise.all([
      AsyncStorage.getItem("userData"),
      AsyncStorage.getItem("personsDataAstrograma"),
      AsyncStorage.getItem("personsData"),
      AsyncStorage.getItem("personsDataOthers"),
    ]);

  return {
    userData: safeJsonParse(userDataRaw, null),
    personsDataAstrograma: safeJsonParse(personsDataAstrogramaRaw, []),
    personsData: safeJsonParse(personsDataRaw, []),
    personsDataOthers: safeJsonParse(personsDataOthersRaw, []),
  };
};

export const getAstrologySavedOptions = (
  savedData: SavedDataBundle,
  fallbackEmail: string
): SavedAnalysisOption[] => {
  const options: SavedAnalysisOption[] = [];

  if (savedData.userData?.natalData?.data) {
    options.push({
      id: "astrology_userData",
      label: `${savedData.userData.full_name || "Personal"} (personal)`,
      emailPrefill: normalizeEmailFromAnalysis(savedData.userData, fallbackEmail),
      analysis: savedData.userData,
      sourceType: "saved",
    });
  }

  savedData.personsDataAstrograma
    .filter((item) => item?.natalData?.data)
    .forEach((item, index) => {
      options.push({
        id: `astrology_other_${item?.id || index}`,
        label: `${item?.full_name || `Persoana ${index + 1}`} (others)`,
        emailPrefill: normalizeEmailFromAnalysis(item, fallbackEmail),
        analysis: item,
        sourceType: "saved",
      });
    });

  return options;
};

export const getSynastrySavedOptions = (
  savedData: SavedDataBundle,
  fallbackEmail: string
): SavedAnalysisOption[] => {
  const options: SavedAnalysisOption[] = [];

  if (savedData.userData) {
    savedData.personsData
      .filter((item) => item?.synastry?.natalWheelChart)
      .forEach((item, index) => {
        const derivedAnalysis = {
          ...item,
          person1: savedData.userData,
          person2: item,
          actualLanguageSinastrie: item?.actualLanguageSinastrie || "en",
        };

        options.push({
          id: `synastry_personal_${item?.id || index}`,
          label: `${savedData.userData?.full_name || "Eu"} + ${
            item?.full_name || `Persoana ${index + 1}`
          }`,
          emailPrefill: normalizeEmailFromAnalysis(item, fallbackEmail),
          analysis: derivedAnalysis,
          sourceType: "saved",
        });
      });
  }

  savedData.personsDataOthers
    .filter((item) => item?.synastry?.natalWheelChart)
    .forEach((item, index) => {
      options.push({
        id: `synastry_others_${item?.id || index}`,
        label: `${item?.person1?.full_name || "Persoana 1"} + ${
          item?.person2?.full_name || "Persoana 2"
        }`,
        emailPrefill: normalizeEmailFromAnalysis(item, fallbackEmail),
        analysis: item,
        sourceType: "saved",
      });
    });

  return options;
};

export const translateAstrologyAnalysis = async (
  analysisInput: GenericObject,
  language: string
) => {
  const targetLanguage = normalizeLanguageCode(language);
  const sourceLanguage = normalizeLanguageCode(
    analysisInput?.actualLanguageAstrograma || "en"
  );

  if (targetLanguage === sourceLanguage) {
    return analysisInput;
  }

  const analysis = JSON.parse(JSON.stringify(analysisInput));
  const signData = analysis?.generalSignTextData || {};
  const houseData = analysis?.generalHouseTextData || {};

  if (analysis?.ascendantData?.data?.result) {
    analysis.ascendantData.data.result = await translateTextWithFallback(
      analysis.ascendantData.data.result,
      targetLanguage,
      sourceLanguage
    );
  }

  for (const key of Object.keys(signData)) {
    const planetData = signData?.[key]?.data;
    if (!planetData) {
      continue;
    }

    if (planetData.report) {
      planetData.report = await translateTextWithFallback(
        planetData.report,
        targetLanguage,
        sourceLanguage
      );
    }

    const dynamicTitle =
      planetData.title || `${planetData.planet_name} is in ${planetData.sign_name}`;
    planetData.title = await translateTextWithFallback(
      dynamicTitle,
      targetLanguage,
      sourceLanguage
    );

    await sleep(200);
  }

  for (const key of Object.keys(houseData)) {
    const data = houseData?.[key]?.data;
    if (!data) {
      continue;
    }

    if (data.report) {
      data.report = await translateTextWithFallback(
        data.report,
        targetLanguage,
        sourceLanguage
      );
    }

    const dynamicTitle =
      data.title || `${data.planet_name} is in the ${data.house}th house`;
    data.title = await translateTextWithFallback(
      dynamicTitle,
      targetLanguage,
      sourceLanguage
    );

    await sleep(200);
  }

  analysis.actualLanguageAstrograma = targetLanguage;
  return analysis;
};

export const translateSynastryAnalysis = async (
  analysisInput: GenericObject,
  language: string
) => {
  const targetLanguage = normalizeLanguageCode(language);
  const sourceLanguage = normalizeLanguageCode(
    analysisInput?.actualLanguageSinastrie || "en"
  );

  if (targetLanguage === sourceLanguage) {
    return analysisInput;
  }

  const analysis = JSON.parse(JSON.stringify(analysisInput));
  const synastry = analysis?.synastry || {};

  for (const category of SYNASTRY_CATEGORIES) {
    const entries = synastry?.[category]?.data;
    if (!Array.isArray(entries)) {
      continue;
    }

    for (const entry of entries) {
      const readings = Array.isArray(entry?.reading) ? entry.reading : [];
      for (const reading of readings) {
        if (reading?.description) {
          reading.description = await translateTextWithFallback(
            reading.description,
            targetLanguage,
            sourceLanguage
          );
        }

        if (reading?.title) {
          reading.title = await translateTextWithFallback(
            reading.title,
            targetLanguage,
            sourceLanguage
          );
        }

        await sleep(120);
      }
    }
  }

  analysis.actualLanguageSinastrie = targetLanguage;
  return analysis;
};

export const buildManualAstrologyAnalysis = async (
  personInput: ManualPersonInput
) => {
  const personData = await buildPersonDataWithTimezone(personInput);

  const baseResults = await Promise.all(
    Object.keys(ASTRO_ENDPOINTS)
      .filter((key) => key !== "generalSignReports" && key !== "generalHouseReports")
      .map((endpointKey) =>
        fetchAstroData(
          (ASTRO_ENDPOINTS as GenericObject)[endpointKey],
          personData.full_name,
          personData.day,
          personData.month,
          personData.year,
          personData.hour,
          personData.min,
          personData.sec,
          personData.gender,
          personData.place,
          personData.lat,
          personData.lon,
          personData.tzone
        )
      )
  );

  const signReports = await Promise.all(
    ASTRO_ENDPOINTS.generalSignReports.map((endpoint) =>
      fetchAstroData(
        endpoint,
        personData.full_name,
        personData.day,
        personData.month,
        personData.year,
        personData.hour,
        personData.min,
        personData.sec,
        personData.gender,
        personData.place,
        personData.lat,
        personData.lon,
        personData.tzone
      )
    )
  );

  const houseReports = await Promise.all(
    ASTRO_ENDPOINTS.generalHouseReports.map((endpoint) =>
      fetchAstroData(
        endpoint,
        personData.full_name,
        personData.day,
        personData.month,
        personData.year,
        personData.hour,
        personData.min,
        personData.sec,
        personData.gender,
        personData.place,
        personData.lat,
        personData.lon,
        personData.tzone
      )
    )
  );

  const [
    natalData,
    aspectsData,
    planetaryData,
    cuspsData,
    moonPhaseData,
    ascendantData,
  ] = baseResults;

  const generalSignTextData: GenericObject = {};
  ASTRO_CELESTIAL_BODIES.forEach((body, index) => {
    generalSignTextData[body] = signReports[index];
  });

  const generalHouseTextData: GenericObject = {};
  ASTRO_CELESTIAL_BODIES.forEach((body, index) => {
    generalHouseTextData[body] = houseReports[index];
  });

  return {
    ...personData,
    natalData,
    aspectsData,
    planetaryData,
    cuspsData,
    moonPhaseData,
    ascendantData,
    generalSignTextData,
    generalHouseTextData,
    type: "adminManualAstrology",
  };
};

export const buildManualSynastryAnalysis = async (
  person1Input: ManualPersonInput,
  person2Input: ManualPersonInput
) => {
  const person1 = await buildPersonDataWithTimezone(person1Input);
  const person2 = await buildPersonDataWithTimezone(person2Input);

  const synastryResults = await Promise.all(
    Object.keys(SYNASTRY_ENDPOINTS).map((key) =>
      fetchSinastrieData(
        (SYNASTRY_ENDPOINTS as GenericObject)[key],
        person1.full_name,
        person1.day,
        person1.month,
        person1.year,
        person1.hour,
        person1.min,
        person1.sec,
        person1.gender,
        person1.place,
        person1.lat,
        person1.lon,
        person1.tzone,
        person2
      )
    )
  );

  const [
    natalWheelChart,
    houseCusps,
    planetaryPositions,
    aspect,
    harmoniousAspectReading,
    conflictingAspectReading,
    contrastingAspectReading,
    intenseCompatibility,
    physicalCompatibility,
    emotionalCompatibility,
    sexualCompatibility,
    spiritualCompatibility,
    financialCompatibility,
  ] = synastryResults;

  const synastry = {
    natalWheelChart,
    houseCusps,
    planetaryPositions,
    aspect,
    harmoniousAspectReading,
    conflictingAspectReading,
    contrastingAspectReading,
    intenseCompatibility,
    physicalCompatibility,
    emotionalCompatibility,
    sexualCompatibility,
    spiritualCompatibility,
    financialCompatibility,
  };

  return {
    type: "adminManualSynastry",
    person1,
    person2,
    synastry,
    actualLanguage: "en",
    actualLanguageAstrograma: "en",
    actualLanguageSinastrie: "en",
  };
};

import { MaterialCommunityIcons } from "@expo/vector-icons";

import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Platform,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
  ImageBackground,
} from "react-native";
import {
  Divider,
  Modal,
  Portal,
  ProgressBar,
  Subheading,
  Text,
  useTheme,
} from "react-native-paper";

import ShowFromTop from "../../../components/Astral/components/show-from-top";
import ScrollViewFadeFirst from "../../../components/Astral/components/scroll-view-fade-first";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { StorageAccessFramework } from "expo-file-system";
import { daily } from "../../../utils/daily";
import AstroChart from "../../../components/Astral/components/AstroChart";
import {
  H18fontMediumBlack,
  H6fontBoldPrimary,
  H6fontBoldWhite,
  H6fontBoldYellow,
  H7fontBoldWhite,
  H8fontBoldWhite,
  H8fontBoldYellow,
  H8fontRegularWhite,
  H9fontMediumLightBlack,
} from "../../../components/commonText";
import { LinearGradient } from "expo-linear-gradient";

import { colors } from "../../../utils/colors";
import { MainContainer } from "../../../components/commonViews";
import { StatusBar } from "react-native";
import ChatComponent from "../../../components/Astral/components/ChatBox";

import AstrogramaSvg from "../../../components/Astral/components/AstrogramaSvg";
import {
  ConvertToImageFormat,
  fetchAspectTable,
  fetchAstroData,
  fetchNatalWheelChart,
  fetchPlanetaryPositions,
  parseSVG,
} from "../../../utils/AstralUtils/fetchNatalWheelChart";
import AstrogramaImage from "../../../components/Astral/components/AstrogramaImage";
import AstrologyAspectsView from "../../../components/Astral/components/AstrologyAspectsView";
import { SvgUri, SvgXml } from "react-native-svg";
import base64 from "react-native-base64";
import TestSvg from "../../../../assets/base64.svg";

import { Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MyTopBar from "../../../components/Astral/components/TopBar";
import AspectTable from "../../../components/Astral/components/AspectTable";
import i18n from "../../../../i18n";
import { useLanguage } from "../../../context/LanguageContext";
import { handleToTranslate, gTranslateFallbackFetch } from "../../../utils/AstralUtils/fetchGPTData";
import LoadingOverlay from "../../../components/Astral/components/zodiac/LoadingOverlay";
import PurchaseModal from "../../../components/Astral/components/PurchaseModal ";

import { Button } from "../../../components/commonButton";
import { useRoute } from "@react-navigation/native";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useStripe } from "@stripe/stripe-react-native";
import { useTranslation } from "../../../utils/translateUtil";
import { capturePaymentIntentTest, createPaymentIntentTest, sendPdfEmail } from "../../../utils/constant";
// Oblio invoice via Firebase Functions (no Next.js)
import { textStyles } from '../../../utils/colors';
import { useAnalysisBackNavigation } from "../../../hooks/useAnalysisBackNavigation";
import {
  applyAstrogramaTranslationPatch,
  buildAnalysisCacheKey,
  extractAstrogramaTranslationPatch,
  getCachedTranslationPatch,
  setCachedTranslationPatch,
} from "../../../utils/analysisTranslationCache";
import {
  refreshLocalAnalysisAccessFromEntitlements,
} from "../../../utils/backupAnalysisUtils";
import {
  appendPurchaseSupportMessage,
  getLocalizedSupportCopy,
  showLocalizedSupportErrorAlert,
} from "../../../utils/supportErrorReporter";
import {
  findMatchingAnalysisByIdentity,
  markAnalysisPaidInCollection,
} from "../../../utils/analysisIdentityUtils";

// --- DEBUG HELPERS (new logging for translation diagnostics) ---
const preview = (t) =>
  String(t || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
const logNatalOther = (msg, payload) => {
  try {
    console.log(`[NATAL_OTHER] ${msg}`, payload !== undefined ? payload : "");
  } catch {}
};
// const LuckyNumber = ({ number }) => {
//   return (
//     <View
//       style={[LuckyNumberStyles.circle, { backgroundColor: colors.primary1 }]}
//     >
//       <Text style={{ fontSize: 16, marginTop: 3 }}>{number}</Text>
//     </View>
//   );
// };

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const TRANSLATION_ITEM_DELAY_MS = 120;
const TRANSLATION_SECTION_DELAY_MS = 250;
const normalizeLanguageCode = (lang) =>
  String(lang || "")
    .trim()
    .toLowerCase()
    .split("-")[0];

const zodiacSigns = {
  Aries: { color: "blue", top: "20%", right: "79%" },
  Taurus: { color: "orange", top: "39.5%", right: "88.9%" },
  Gemini: { color: "green", top: "61.5%", right: "87.4%" },
  Cancer: { color: "blue", top: "80.3%", right: "73.9%" },
  Leo: { color: "orange", top: "89.8%", right: "52%" },
  Virgo: { color: "green", top: "87.5%", right: "30%" },
  Libra: { color: "blue", top: "74%", right: "11%" },
  Scorpio: { color: "orange", top: "54.5%", right: "1.8%" },
  Sagittarius: { color: "green", top: "32.4%", right: "4.2%" },
  Capricorn: { color: "blue", top: "16%", right: "16.2%" },
  Aquarius: { color: "orange", top: "6%", right: "36.5%" },
  Pisces: { color: "green", top: "7.5%", right: "60%" },
};

const { width } = Dimensions.get("window");

const zodiacSignToDegrees = {
  Aries: 0,
  Taurus: 30,
  Gemini: 60,
  Cancer: 90,
  Leo: 120,
  Virgo: 150,
  Libra: 180,
  Scorpio: 210,
  Sagittarius: 240,
  Capricorn: 270,
  Aquarius: 300,
  Pisces: 330,
};

// Converteste semnul zodiacal și gradul într-un unghi absolut
const signAndDegreeToPosition = (sign, degree) => {
  return zodiacSignToDegrees[sign] + degree;
};

/**
 * @param text {text}
 * @param percent {number}
 * @param style {object}
 * @returns {*}
 * @constructor
 */
// const ProgressItem = ({ text, percent, style }) => {
//   const { colors } = useTheme();
//   return (
//     <View style={[{ flex: 1 }, style]}>
//       <Text style={ProgressItemStyles.text}>{text}</Text>
//       <ProgressBar style={ProgressItemStyles.bar} progress={percent / 100} />
//       <Text theme={{ colors: { text: colors.primary } }}>{percent}%</Text>
//     </View>
//   );
// };

const ProgressItemStyles = StyleSheet.create({
  text: {
    fontSize: 16,
  },
  bar: {
    marginVertical: 5,
    borderRadius: 5,
  },
});

/**
 * @param navigation {object}
 * @returns {*}
 * @constructor
 */
function AstrogramaNatalaOtherPerson({ navigation }) {
  useAnalysisBackNavigation(navigation, "PersonsListAstrograma");
  const dataIndex = daily.findIndex(
    (item) =>
      item.day.split("-")[2].toString() === new Date().getDate().toString()
  );
  const data = daily[dataIndex !== -1 ? dataIndex : 0];
  const d = new Date();

  const [svgData, setSvgData] = useState(null);
  const [aspectsData, setAspectsData] = useState(null);
  const [wheelImage, setWheelImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [planetaryData, setPlanetaryData] = useState(null);
  const [houseCusps, setHouseCusps] = useState(null);
  const [generalSignReport, setGeneralSignReport] = useState(null);
  const [generalHouseReport, setGeneralHouseReport] = useState(null);
  const [moonPhase, setMoonPhase] = useState(null);
  const [ascendantReport, setAscendantReport] = useState(null);
  const [selectedTab, setSelectedTab] = useState("natal");
  const [isLoadingBuy, setIsLoadingBuy] = useState(false);
  const [visible, setVisible] = useState(false);
  const [timezone, setTimezone] = useState(0); // Inițializat cu 0

  const { language, changeLanguage, userData, setUserData } = useLanguage();
  const route = useRoute();
  const { personData } = route.params; // Primește datele despre persoană

  const [userD, setUserD] = useState(personData || {}); // Inițializează cu datele primite
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [line1, setLine1] = useState("");
  const [city, setCity] = useState("");
  const [stateCounty, setStateCounty] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState(""); // sau un dropdown
  const [couponCode, setCouponCode] = useState("");
  const [couponPercent, setCouponPercent] = useState(0);
  const [couponAllowed, setCouponAllowed] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem("userDetails");
        if (storedUserData) {
          const parsedData = JSON.parse(storedUserData);
          console.log("parsed data....", parsedData);
          setFirstName(parsedData.firstName || "");
          setLastName(parsedData.lastName || "");
          setEmail(parsedData.email || "");
          setPhone(parsedData.phone || "");
        }
      } catch (error) {
        console.error("Eroare la citirea datelor din AsyncStorage:", error);
      }
    };

    fetchUserData();
  }, []);
  useEffect(() => {
    if (personData) {
      setUserD(personData); // Actualizează starea cu datele persoanei
    }
  }, [personData]);

  // plata stripe sistem
  const [isPaid, setIsPaid] = useState(personData.isPaid || false); // Starea pentru achiziție

  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en"); // Limba implicită

  const [partialContent, setPartialContent] = useState(
    "Aceasta este o secțiune limitată din interpretarea astrogramei tale. Pentru a accesa interpretarea completă, finalizează achiziția."
  );
  const [fullContent, setFullContent] = useState(
    "Aceasta este interpretarea completă a astrogramei tale. Include toate detaliile despre aspectele astrologice, case și planete relevante."
  );

  const getValidSectionEntries = (sections, sectionName) =>
    Object.keys(sections || {}).reduce((entries, key) => {
      const data = sections?.[key]?.data;
      if (!data || typeof data !== "object") {
        console.warn("[AstrogramaNatalaOtherPerson] skipped invalid section", {
          sectionName,
          key,
        });
        return entries;
      }

      entries.push({ key, data });
      return entries;
    }, []);

  const getSafeSignTitle = (planetData) =>
    planetData?.title ||
    (planetData?.planet_name && planetData?.sign_name
      ? `${planetData.planet_name} is in ${planetData.sign_name}`
      : "General Sign Report");

  const getSafeHouseTitle = (houseData) =>
    houseData?.title ||
    (houseData?.planet_name && houseData?.house
      ? `${houseData.planet_name} is in the ${houseData.house}th house`
      : "General House Report");

  const handleDismissModal = () => {
    setModalVisible(false);
  };

  const handleConfirmPurchase = async () => {
    console.log("is paying...");
    setIsPaid(!isPaid);
  };

  const generatePDFContent = () => {
    const natalWheelChart = userD.natalData?.data?.svg; // Obține SVG-ul natal wheel
    const signEntries = getValidSectionEntries(
      userD?.generalSignTextData,
      "generalSignTextData"
    );
    const houseEntries = getValidSectionEntries(
      userD?.generalHouseTextData,
      "generalHouseTextData"
    );
    // Funcție de generare a secțiunilor bazată pe `userD.generalSignTextData`
    const generateSignSections = () => {
      if (!signEntries.length) {
        return `
          <p style="color: #333;">
            General sign report is not available right now.
          </p>
        `;
      }

      return signEntries
        .map(({ key, data: planetData }) => {
          return `
            <div key="${key}" style="margin-bottom: 20px;">
              <h3 style="color: #4CAF50; margin-top: 20px;">
                ${getSafeSignTitle(planetData)}
              </h3>
              <p style="color: #333;">
                ${planetData.report || ""}
              </p>
            </div>
          `;
        })
        .join("");
    };

    // Funcție de generare a secțiunilor bazată pe `userD.generalHouseTextData`
    const generateHouseSections = () => {
      if (!houseEntries.length) {
        return `
          <p style="color: #333;">
            General house report is not available right now.
          </p>
        `;
      }

      return houseEntries
        .map(({ key, data: houseData }) => {
          return `
            <div key="${key}" style="margin-bottom: 20px;">
              <h3 style="color: #4CAF50;; margin-top: 20px;">
                ${getSafeHouseTitle(houseData)}
              </h3>
              <p style="color: #333;">
                ${houseData.report || ""}
              </p>
            </div>
          `;
        })
        .join("");
    };

    // HTML final combinat
    // Conținut final HTML
    return `
  <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          line-height: 1.6;
        }
        h1, h2 {
          text-align: center;
          color: #4CAF50;
        }
        p {
          margin-bottom: 10px;
        }
        .chart-container {
          text-align: center;
          margin: 20px 0;
        }
        .chart-container img, .chart-container svg {
          max-width: 100%;
          height: auto;
        }
      </style>
    </head>
    <body>
      <h1>Interpretare Astrogramă</h1>
      <h2>${userD.full_name}</h2>
      <p>Data nașterii: ${userD.day}-${userD.month}-${userD.year}</p>
      <p>Ora nașterii: ${userD.selectedTime}</p>
      <p>Locul nașterii: ${userD.place}</p>

      <div class="chart-container">
        <h2>Astrogramă Natală</h2>
        ${
          natalWheelChart
            ? natalWheelChart
            : "<p>Astrogramă natală nu este disponibilă.</p>"
        }
      </div>

      <div>
        <h2 style="margin-top: 40px; color: #4CAF50;">General Sign Report</h2>
        ${generateSignSections()}
      </div>

      <div>
        <h2 style="margin-top: 40px; color: #4CAF50;">General House Report</h2>
        ${generateHouseSections()}
      </div>
    </body>
  </html>
`;
  };

  const handleDownloadPDF = async () => {
    try {
      console.log("Generare PDF în curs...");
      const htmlContent = generatePDFContent();

      // Generează PDF-ul
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      console.log("PDF generat:", uri);

      if (Platform.OS === "android") {
        if (Platform.Version < 29) {
          // Pentru Android 10 și mai vechi
          const fileUri = `${FileSystem.documentDirectory}RaportAnaliza.pdf`;
          await FileSystem.copyAsync({ from: uri, to: fileUri });
          Alert.alert(
            "Fișier salvat",
            `PDF-ul a fost salvat cu succes la: ${fileUri}`
          );
          console.log("Fișier salvat cu succes:", fileUri);
        } else {
          // Pentru Android 11 și mai nou
          const permissions =
            await StorageAccessFramework.requestDirectoryPermissionsAsync();
          if (!permissions.granted) {
            Alert.alert(
              "Permisiune refuzată",
              "Trebuie să acorzi permisiunea pentru a salva fișierul."
            );
            return;
          }

          const directoryUri = permissions.directoryUri;
          console.log("Director selectat:", directoryUri);

          const fileName = "RaportAnaliza.pdf";
          const base64Content = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          const fileUri = await StorageAccessFramework.createFileAsync(
            directoryUri,
            fileName,
            "application/pdf"
          );

          await FileSystem.writeAsStringAsync(fileUri, base64Content, {
            encoding: FileSystem.EncodingType.Base64,
          });

          Alert.alert(
            "Fișier salvat",
            `PDF-ul a fost salvat cu succes la: ${fileUri}`
          );
          console.log("Fișier salvat cu succes:", fileUri);
        }
      } else if (Platform.OS === "ios") {
        // Pe iOS, folosim share sheet pentru ca utilizatorul să aleagă ce face cu fișierul
        await Sharing.shareAsync(uri, {
          dialogTitle: 'Salvează sau distribuie PDF-ul',
          mimeType: 'application/pdf',
          UTI: 'com.adobe.pdf'
        });
        console.log("iOS share sheet prezentat pentru PDF");
      }
    } catch (error) {
      console.error("Eroare la salvarea fișierului:", error);
      Alert.alert("Eroare", "Nu s-a putut salva fișierul.");
    }
  };

  // plata stripe sistem

  const isValidBase64 = (base64) => {
    const regex = /^[A-Za-z0-9+/]+={0,2}$/;
    return regex.test(base64);
  };

  // const translatePersonByIndex = async (index, targetLanguage) => {
  //   try {
  //     // Obține toate persoanele din AsyncStorage
  //     const personsDataString = await AsyncStorage.getItem(
  //       "personsDataAstrograma"
  //     );
  //     const personsData = personsDataString
  //       ? JSON.parse(personsDataString)
  //       : [];

  //     // Verifică dacă indexul este valid
  //     if (index < 0 || index >= personsData.length) {
  //       console.error("Index invalid pentru traducere.");
  //       return;
  //     }

  //     // Preia persoana curentă
  //     const personToTranslate = personsData[index];

  //     // Verifică dacă traducerea este necesară
  //     if (personToTranslate.actualLanguageAstrograma === targetLanguage) {
  //       console.log("Persoana este deja în limba țintă.");
  //       return;
  //     }

  //     // Listează categoriile care necesită traducere
  //     const categories = [
  //       "generalCategory",
  //       "dragosteCategory",
  //       "familieCategory",
  //       "baniCategory",
  //       "muncaStudiiCategory",
  //       "prieteniCategory",
  //       "sanatateCategory",
  //       "spiritualitateCategory",
  //     ];

  //     // Traduce fiecare categorie pentru persoana curentă
  //     for (const category of categories) {
  //       if (personToTranslate[category]) {
  //         personToTranslate[category] = await handleToTranslate(
  //           personToTranslate[category],
  //           targetLanguage,
  //           personToTranslate.actualLanguageAstrograma || "ro"
  //         );
  //       }
  //     }

  //     // Actualizează limba curentă
  //     personToTranslate.actualLanguageAstrograma = targetLanguage;

  //     // Înlocuiește persoana tradusă în lista principală
  //     personsData[index] = personToTranslate;

  //     // Salvează lista actualizată în AsyncStorage
  //     await AsyncStorage.setItem(
  //       "personsDataAstrograma",
  //       JSON.stringify(personsData)
  //     );

  //     // Actualizează state-ul local
  //     setPersons([...personsData]);

  //     console.log(
  //       "Traducerea a fost realizată pentru persoana la indexul:",
  //       index
  //     );
  //   } catch (error) {
  //     console.error("Eroare la traducerea persoanei:", error);
  //   }
  // };

  const translatePersonData = async (person, targetLanguage) => {
    try {
      const ascendantData = await handleToTranslate(
        person.ascendantData.data.result,
        language,
        person.actualLanguageAstrograma
      );
      person.ascendantData.data.result = ascendantData;
      await delay(TRANSLATION_SECTION_DELAY_MS); // delay redus pentru performanță

      const translatedData = await Promise.all(
        getValidSectionEntries(
          person.generalSignTextData,
          "generalSignTextData"
        ).map(async ({ key, data: planetData }) => {

          // Traducem  și raportul
          const translatedReport = await handleToTranslate(
            planetData.report,
            language,
            person.actualLanguageAstrograma
          );

          // Introducem textele traduse în structura de date
          return {
            key,
            data: {
              ...planetData,
              report: translatedReport,
            },
          };
        })
      );

      // Actualizăm person cu datele traduse
      translatedData.forEach(({ key, data }) => {
        person.generalSignTextData[key].data = data;
      });
      console.log("Traducere finalizată pentru translateGeneralSignTextData.");

      await delay(TRANSLATION_SECTION_DELAY_MS); // delay redus pentru performanță

      const translatedDataGeneralHouseReport = await Promise.all(
        getValidSectionEntries(
          person.generalHouseTextData,
          "generalHouseTextData"
        ).map(async ({ key, data: houseData }) => {

          // Traducem raportul

          const translatedReport = await handleToTranslate(
            houseData.report,
            language,
            person.actualLanguageAstrograma
          );

          // Introducem textele traduse în structura de date
          return {
            key,
            data: {
              ...houseData,
              report: translatedReport,
            },
          };
        })
      );

      // Actualizăm person cu datele traduse
      translatedDataGeneralHouseReport.forEach(({ key, data }) => {
        person.generalHouseTextData[key].data = data;
      });

      console.log("Traducere finalizată pentru generalHouseTextData.");

      await delay(TRANSLATION_SECTION_DELAY_MS); // delay redus pentru performanță

      // Actualizează limba curentă
      person.actualLanguageAstrograma = targetLanguage;

      return person;
    } catch (error) {
      console.error("Eroare la traducerea persoanei:", error);
      throw error;
    }
  };

  const handleNatalChart = async () => {
    try {
      await refreshLocalAnalysisAccessFromEntitlements();
      const personsDataString = await AsyncStorage.getItem(
        "personsDataAstrograma"
      );
      const storedPersons = personsDataString
        ? JSON.parse(personsDataString)
        : [];
      const resolvedUserData =
        findMatchingAnalysisByIdentity(storedPersons, personData || userD) ||
        personData ||
        userD;

      // Verifică dacă persoana există
      if (!resolvedUserData) {
        console.log("Nu există date despre persoană.");
        return;
      }
      setIsPaid(Boolean(resolvedUserData?.isPaid));
      setUserD(resolvedUserData);
      let dataToUse = resolvedUserData;

      // console.log("userData.aspectsData...", userD.generalSignTextData);
      // console.log(
      //   "userD.aspectsData...",
      //   userD.generalSignTextData.Chiron.data.planet_name
      // );
      // console.log(
      //   "userD.aspectsData...",
      //   userD.generalSignTextData.Chiron.data.sign_name
      // );
      // console.log(
      //   "userD.aspectsData...",
      //   userData.generalSignTextData.Chiron.data.report
      // );

      // Verifică dacă limba curentă este diferită

      const targetLang = normalizeLanguageCode(language);
      const sourceLang = normalizeLanguageCode(
        resolvedUserData.actualLanguageAstrograma
      );
      if (targetLang && targetLang !== sourceLang) {
        setIsLoading(true);

        logNatalOther("translate_needed", {
          full_name: resolvedUserData.full_name,
          from: sourceLang || resolvedUserData.actualLanguageAstrograma,
          to: targetLang,
        });

        const analysisCacheKey = buildAnalysisCacheKey("astrograma_other", {
          id: resolvedUserData?.id || "",
          full_name: resolvedUserData?.full_name || "",
          day: resolvedUserData?.day || "",
          month: resolvedUserData?.month || "",
          year: resolvedUserData?.year || "",
          selectedTime: resolvedUserData?.selectedTime || "",
          place: resolvedUserData?.place || "",
          lat: resolvedUserData?.lat || "",
          lon: resolvedUserData?.lon || "",
        });

        let usedCache = false;
        const cachedPatch = await getCachedTranslationPatch(
          analysisCacheKey,
          targetLang
        );
        if (cachedPatch) {
          const cachedPerson = applyAstrogramaTranslationPatch(
            resolvedUserData,
            cachedPatch
          );
          if (cachedPerson) {
            usedCache = true;
            dataToUse = cachedPerson;
            setUserD(cachedPerson);
            const personsDataString = await AsyncStorage.getItem(
              "personsDataAstrograma"
            );
            const personsData = personsDataString
              ? JSON.parse(personsDataString)
              : [];
            const updatedPersons = personsData.map((person) =>
              person.full_name === resolvedUserData.full_name ? cachedPerson : person
            );
            await AsyncStorage.setItem(
              "personsDataAstrograma",
              JSON.stringify(updatedPersons)
            );
            logNatalOther("cache_hit", {
              full_name: cachedPerson.full_name,
              to: targetLang,
            });
          }
        }

        if (!usedCache) {
          logNatalOther("cache_miss_retranslate", {
            to: targetLang,
            full_name: resolvedUserData?.full_name,
          });
          let translationFailed = false; // Flag pentru a urmări dacă traducerea a eșuat
          const tempUserData = JSON.parse(JSON.stringify(resolvedUserData)); // Copie temporară a datelor

          try {
            let ascendantData = await handleToTranslate(
              tempUserData.ascendantData.data.result,
              targetLang,
              sourceLang || tempUserData.actualLanguageAstrograma
            );
            if (
              typeof ascendantData === "string" &&
              typeof resolvedUserData.ascendantData?.data?.result === "string" &&
              ascendantData.trim() === resolvedUserData.ascendantData.data.result.trim()
            ) {
              try {
                const fb = await gTranslateFallbackFetch(
                  resolvedUserData.ascendantData.data.result,
                  targetLang
                );
                if (typeof fb === "string" && fb.trim().length > 0) {
                  ascendantData = fb;
                }
              } catch {}
            }
            tempUserData.ascendantData.data.result = ascendantData;
            logNatalOther("ascendant_translated", {
              before: preview(resolvedUserData.ascendantData?.data?.result),
              after: preview(tempUserData.ascendantData?.data?.result),
            });
            await delay(TRANSLATION_SECTION_DELAY_MS); // delay redus pentru performanță

            const translatedSignData = [];
            for (const {
              key,
              data: planetData,
            } of getValidSectionEntries(
              tempUserData.generalSignTextData,
              "generalSignTextData"
            )) {
              const translatedReport = await handleToTranslate(
                planetData.report,
                targetLang,
                sourceLang || tempUserData.actualLanguageAstrograma
              );
              const originalTitle = getSafeSignTitle(planetData);
              const translatedTitle = await handleToTranslate(
                originalTitle,
                targetLang,
                sourceLang || tempUserData.actualLanguageAstrograma
              );
              translatedSignData.push({
                key,
                data: { ...planetData, report: translatedReport, title: translatedTitle },
              });
              await delay(TRANSLATION_ITEM_DELAY_MS);
            }
            try {
              const fk = Object.keys(tempUserData.generalSignTextData || {})[0];
              if (fk) {
                const d = translatedSignData.find((x) => x.key === fk)?.data || tempUserData.generalSignTextData[fk].data;
                logNatalOther("planets_sample", { key: fk, title: preview(d.title), report: preview(d.report) });
              }
            } catch {}

            translatedSignData.forEach(({ key, data }) => {
              tempUserData.generalSignTextData[key].data = data;
            });
            await delay(TRANSLATION_SECTION_DELAY_MS); // delay redus pentru performanță

            const translatedHouseData = [];
            for (const {
              key,
              data: houseData,
            } of getValidSectionEntries(
              tempUserData.generalHouseTextData,
              "generalHouseTextData"
            )) {
              const translatedReport = await handleToTranslate(
                houseData.report,
                targetLang,
                sourceLang || tempUserData.actualLanguageAstrograma
              );
              const originalTitle = getSafeHouseTitle(houseData);
              const translatedTitle = await handleToTranslate(
                originalTitle,
                targetLang,
                sourceLang || tempUserData.actualLanguageAstrograma
              );
              translatedHouseData.push({
                key,
                data: { ...houseData, report: translatedReport, title: translatedTitle },
              });
              await delay(TRANSLATION_ITEM_DELAY_MS);
            }
            try {
              const fk = Object.keys(tempUserData.generalHouseTextData || {})[0];
              if (fk) {
                const d = translatedHouseData.find((x) => x.key === fk)?.data || tempUserData.generalHouseTextData[fk].data;
                logNatalOther("houses_sample", { key: fk, title: preview(d.title), report: preview(d.report) });
              }
            } catch {}

            translatedHouseData.forEach(({ key, data }) => {
              tempUserData.generalHouseTextData[key].data = data;
            });

            tempUserData.actualLanguageAstrograma = targetLang;
          } catch (error) {
            console.error("Eroare în procesul de traducere:", error);
            translationFailed = true;
          }

          if (!translationFailed) {
            const translationPatch = extractAstrogramaTranslationPatch(
              tempUserData,
              targetLang
            );
            await setCachedTranslationPatch(
              analysisCacheKey,
              targetLang,
              translationPatch
            );
            logNatalOther("cache_saved", {
              to: targetLang,
              full_name: tempUserData?.full_name,
            });

            // Aplicăm modificările doar dacă traducerea a avut succes
            dataToUse = tempUserData;
            setUserD(tempUserData);
            const personsDataString = await AsyncStorage.getItem(
              "personsDataAstrograma"
            );
            const personsData = personsDataString
              ? JSON.parse(personsDataString)
              : [];
            const updatedPersons = personsData.map((person) =>
              person.full_name === resolvedUserData.full_name ? tempUserData : person
            );
            await AsyncStorage.setItem(
              "personsDataAstrograma",
              JSON.stringify(updatedPersons)
            );
          }
        }
      } else {
        logNatalOther("translate_skipped_same_language", {
          lang:
            targetLang || sourceLang || resolvedUserData?.actualLanguageAstrograma,
          full_name: resolvedUserData?.full_name,
        });
      }

      //VARIANTA INITIALA A TRADUCERILOR FARA HANDLE DE EROARE
      // if (language !== userD.actualLanguageAstrograma) {
      //   setIsLoading(true);

      //   console.log(
      //     `Traducere necesară pentru ${userD.full_name} din ${userD.actualLanguageAstrograma} în ${language}`
      //   );

      //   // Traduce datele persoanei
      //   const translatedPerson = await translatePersonData(userD, language);

      //   // Actualizează datele în AsyncStorage
      //   const personsDataString = await AsyncStorage.getItem(
      //     "personsDataAstrograma"
      //   );
      //   const personsData = personsDataString
      //     ? JSON.parse(personsDataString)
      //     : [];

      //   const updatedPersons = personsData.map((person) =>
      //     person.full_name === userD.full_name ? translatedPerson : person
      //   );

      //   await AsyncStorage.setItem(
      //     "personsDataAstrograma",
      //     JSON.stringify(updatedPersons)
      //   );

      //   console.log("userD...", userD.aspectsData.data);

      //   // Actualizează starea locală
      //   setUserD(translatedPerson);
      // }

      if (dataToUse.natalData && dataToUse.natalData.data) {
        const svgElements = parseSVG(dataToUse.natalData.data.svg);
        setSvgData(svgElements);
        const base64Image = dataToUse.natalData.data.base64_image.replace(
          "data:image/svg+xml;base64,",
          ""
        );
        setWheelImage(base64.decode(base64Image));
      }

      setAspectsData(dataToUse.aspectsData ? dataToUse.aspectsData.data : null);
      setPlanetaryData(dataToUse.planetaryData ? dataToUse.planetaryData.data : null);
      setHouseCusps(dataToUse.cuspsData ? dataToUse.cuspsData.data : null);
      setMoonPhase(dataToUse.moonPhaseData ? dataToUse.moonPhaseData.data : null);
      setAscendantReport(dataToUse.ascendantData ? dataToUse.ascendantData.data : null);
    } catch (error) {
      console.error("Eroare la actualizarea astrogramei:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleNatalChart();
  }, [language]);

  // const svgContent = atob(wheelImage);
  const htmlContent = `
    <html>
      <body>
        <div><img src={${wheelImage}}  /></div>
      </body>
    </html>
  `;
  const Header = (
    <View>
      <View style={[styles.headerContainer]}></View>
      {/* <Divider /> */}
      {/* {svgData && <AstrogramaSvg svgXml={svgData} />} */}
      {/* <AstrogramaImage svgImage={wheelImage} /> */}
      {/* <SvgUri width="200" height="200" svgXmlData={testSvg} /> */}
      {/* <TestSvg width={300} height={300} /> */}
      {/* {wheelImage && (
        <WebView
          originWhitelist={["*"]}
          source={{ html: wheelImage }}
          style={{ width: 400, height: 400 }}
        />
      )} */}
      <View style={{ width: "100%", height: "100%", overflow: "hidden" }}>
        {wheelImage && (
          <SvgXml
            xml={wheelImage}
            width="100%"
            height="100%"
            preserveAspectRatio="xMidYMid meet"
          />
        )}
        {/* {Object.entries(zodiacSigns).map(([sign, { color, top, right }]) => (
          <View style={[styles.iconContainer, { top, right }]}>
            <MaterialCommunityIcons
              name={`zodiac-${sign.toLowerCase()}`}
              size={17}
              color={color}
            />
          </View>
        ))} */}
      </View>
    </View>
  );
  const { initPaymentSheet, presentPaymentSheet } = useStripe();


  const achizitieCompleta1 = useTranslation(
    "Achizitie finalizata!",
    language,
    "SinastrieRelatieOthers"
  );
  const achizitieCompleta2 = useTranslation(
    "Va rugam descarcati pdf-ul analizei dvs",
    language,
    "SinastrieRelatieOthers"
  );
  const supportCopy = getLocalizedSupportCopy(language);

  // const handlePayment = async () => {
  //   try {
  //     if (!line1 || !city || !country) {
  //       Alert.alert(
  //         "Eroare",
  //         "Te rugăm să completezi toate câmpurile de adresă."
  //       );
  //       return;
  //     }

  //     setIsLoadingBuy(true);

  //     setIsPaid(true);

  //     const functions = getFunctions();

  //     // 1) Creează PaymentIntent prin Firebase

  //     const createPaymentIntentFn = httpsCallable(
  //       functions,
  //       // "createPaymentIntentTest"
  //       "createPaymentIntent"
  //     );

  //     const resp = await createPaymentIntentFn({
  //       amount: 1500, // 3.00 RON
  //       currency: "eur",
  //       firstName,
  //       lastName,
  //       email,
  //       phone,
  //     });

  //     const { clientSecret, transactionId } = resp.data;
  //     if (!clientSecret || !transactionId) {
  //       throw new Error("Lipsesc datele PaymentIntent. Verifică serverul.");
  //     }

  //     // 2) Inițializează Payment Sheet
  //     const { error: initError } = await initPaymentSheet({
  //       paymentIntentClientSecret: clientSecret,
  //       merchantDisplayName: "Cristina Zurba tarot",
  //       billingDetailsCollectionConfiguration: {
  //         name: "required",
  //         phone: "required",
  //         email: "required",
  //         address: "never",
  //       },
  //     });

  //     if (initError) {
  //       console.error("Eroare initPaymentSheet:", initError);
  //       Alert.alert("Eroare", initError.message);
  //       return;
  //     }

  //     // 3) Afișează Payment Sheet
  //     const { error: presentError } = await presentPaymentSheet();
  //     if (presentError) {
  //       console.error("Eroare la prezentarea Payment Sheet:", presentError);
  //       return;
  //     }

  //     console.log("Plată finalizată! Generăm factura...");

  //     // 5) **Actualizează doar analiza cumpărată cu `isPaid: true` în `personsDataAstrograma`**
  //     const personsDataAstrogramaJson = await AsyncStorage.getItem(
  //       "personsDataAstrograma"
  //     );
  //     let updatedPersonsDataAstrograma = personsDataAstrogramaJson
  //       ? JSON.parse(personsDataAstrogramaJson)
  //       : [];

  //     if (Array.isArray(updatedPersonsDataAstrograma)) {
  //       updatedPersonsDataAstrograma = updatedPersonsDataAstrograma.map(
  //         (analysis) =>
  //           analysis.full_name === userD.full_name
  //             ? { ...analysis, isPaid: true }
  //             : analysis
  //       );
  //     } else if (updatedPersonsDataAstrograma.full_name === userD.full_name) {
  //       updatedPersonsDataAstrograma.isPaid = true;
  //     }

  //     // **Salvează modificările în AsyncStorage**
  //     await AsyncStorage.setItem(
  //       "personsDataAstrograma",
  //       JSON.stringify(updatedPersonsDataAstrograma)
  //     );
     

  //     console.log(
  //       "✅ AsyncStorage updated: isPaid setat la true pentru analiza curentă."
  //     );

  //     // 5) După finalizarea plății, generează conținutul HTML pentru PDF
  //     const pdfHtmlContent = generatePDFContent();
  //     console.log("📝 Generated PDF HTML content.");
  //     // 6) Apelează funcția backend pentru a trimite emailul cu PDF-ul
  //     console.log("📧 Calling sendPdfEmail function...");
  //     const sendPdfEmailFn = httpsCallable(functions, "sendPdfEmail");
  //     console.log("📧 sendPdfEmailFn:", sendPdfEmailFn);
  //     const emailResponse = await sendPdfEmailFn({
  //       email: email, // sau userD.email, în funcție de sursa datelor
  //       pdfHtml: pdfHtmlContent,
  //       fullName: "dear user!",
  //     });
  //     console.log("📧 Email function response:", emailResponse);

  //     // 4) Creează factura pe server și marchează-o ca plătită
  //     const createInvoiceFn = httpsCallable(
  //       functions,
  //       // "createInvoiceAfterPaymentTest"
  //       "createInvoiceAfterPayment"
  //     );
  //     const invoiceResp = await createInvoiceFn({
  //       transactionId,
  //       firstName,
  //       lastName,
  //       email,
  //       phone,
  //       address: {
  //         line1,
  //         city,
  //         postal_code: postalCode,
  //         country,
  //       },
  //       analysisData: userD,
  //     });

  //     console.log("Factura creată:", invoiceResp.data);
  //     Alert.alert(achizitieCompleta1, achizitieCompleta2);
  //   } catch (error) {
  //     console.error("Eroare handlePayment:", error);
  //     Alert.alert("Eroare", "Nu s-a putut procesa plata sau factura.");
  //   } finally {
  //     setIsLoadingBuy(false);
  //   }
  // };

  const handlePayment = async (purchaseDetails = null) => {
    const runId = `pay_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    const pfx = `[PAYMENT][AstrogramaNatalaOtherPerson][${runId}]`;
    const pLog = (...args) => console.log(pfx, ...args);
    const pErr = (...args) => console.error(pfx, ...args);
    let transactionId = "";
    const resolvedFirstName = purchaseDetails?.firstName || firstName;
    const resolvedLastName = purchaseDetails?.lastName || lastName;
    const resolvedEmail = purchaseDetails?.email || email;
    const resolvedPhone = purchaseDetails?.phone || phone;
    const resolvedLine1 = purchaseDetails?.line1 || line1;
    const resolvedCity = purchaseDetails?.city || city;
    const resolvedStateCounty = purchaseDetails?.state || stateCounty;
    const resolvedPostalCode = purchaseDetails?.postalCode || postalCode;
    const resolvedCountry = purchaseDetails?.country || country;
    const resolvedCouponAllowed =
      typeof purchaseDetails?.coupon?.allowed === "boolean" ?
        Boolean(purchaseDetails.coupon.allowed) :
        Boolean(couponAllowed);
    const resolvedCouponCode = resolvedCouponAllowed ?
      purchaseDetails?.coupon?.code || couponCode :
      "";
    const resolvedCouponPercent = resolvedCouponAllowed ?
      Number(
          purchaseDetails?.coupon?.percent ??
          couponPercent ??
          0,
      ) :
      0;
    const legalAcceptance = purchaseDetails?.legalAcceptance || null;
    try {
      // Verifică câmpurile de adresă
      if (!resolvedLine1 || !resolvedCity || !resolvedStateCounty || !resolvedPostalCode || !resolvedCountry) {
        Alert.alert("Eroare", "Te rugăm să completezi toate câmpurile de adresă.");
        return;
      }
  
      setIsLoadingBuy(true);
      const functions = getFunctions();
      const purchaseContext = {
        analysisId: userD?.id || personData?.id || "",
        analysisType: userD?.type || personData?.type || "othersAstrograma",
        ownerUid: userData?.owner_uid || "",
      };
  
      // 1) Creează PaymentIntent cu capture_method: "manual" (folosind funcția test)
      const createPaymentIntentFn = httpsCallable(functions, createPaymentIntentTest);
      pLog("calling createPaymentIntent", {
        productCode: "astrogama_natala_other_person",
        currency: "eur",
        couponCode: resolvedCouponAllowed ? resolvedCouponCode : "",
      });
      const resp = await createPaymentIntentFn({
        currency: "eur",
        firstName: resolvedFirstName,
        lastName: resolvedLastName,
        email: resolvedEmail,
        phone: resolvedPhone,
        productCode: "astrogama_natala_other_person",
        couponCode: resolvedCouponAllowed ? resolvedCouponCode : "",
        termsVersion: legalAcceptance?.termsVersion || "",
        privacyVersion: legalAcceptance?.privacyVersion || "",
        digitalContentWaiverAccepted: Boolean(
          legalAcceptance?.digitalContentWaiverAccepted
        ),
        legalAcceptedAt: legalAcceptance?.legalAcceptedAt || "",
        immediateExecutionAcceptedAt:
          legalAcceptance?.immediateExecutionAcceptedAt || "",
        withdrawalWaiverAcceptedAt:
          legalAcceptance?.withdrawalWaiverAcceptedAt || "",
        ...purchaseContext,
      });
      pLog("createPaymentIntent response", resp?.data);
      const { clientSecret, transactionId: createdTransactionId } = resp.data;
      transactionId = String(createdTransactionId || "");
      if (!clientSecret || !transactionId) {
        throw new Error("Lipsesc datele PaymentIntent. Verifică serverul.");
      }
      pLog("paymentIntent ready", { transactionId });
  
      // 2) Inițializează Payment Sheet
      pLog("initPaymentSheet");
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: "Cristina Zurba tarot",
        billingDetailsCollectionConfiguration: {
          name: "required",
          phone: "required",
          email: "required",
          address: "never",
        },
      });
      if (initError) {
        pErr("initPaymentSheet error", initError);
        showLocalizedSupportErrorAlert({
          language,
          screenName: "AstrogramaNatalaOtherPerson",
          error: initError,
          publicMessage: supportCopy.paymentInitPublicMessage,
          technicalMessage: initError?.message || "initPaymentSheet failed",
          transactionId,
          productCode: "astrogama_natala_other_person",
          analysisId: purchaseContext.analysisId,
          analysisType: purchaseContext.analysisType,
          contactEmail: resolvedEmail,
          contactPhone: resolvedPhone,
          fullName:
            userD?.full_name ||
            personData?.full_name ||
            `${resolvedFirstName} ${resolvedLastName}`.trim(),
          extraContext: {
            phase: "initPaymentSheet",
          },
        });
        return;
      }
      pLog("paymentSheet initialized");
  
      // 3) Afișează Payment Sheet
      pLog("presentPaymentSheet");
      const { error: presentError } = await presentPaymentSheet();
      if (presentError) {
        pErr("presentPaymentSheet error", presentError);
        if (String(presentError?.code || "").toLowerCase() === "canceled") {
          pLog("presentPaymentSheet canceled by user");
          return;
        }
        showLocalizedSupportErrorAlert({
          language,
          screenName: "AstrogramaNatalaOtherPerson",
          error: presentError,
          publicMessage: supportCopy.paymentFlowPublicMessage,
          technicalMessage: presentError?.message || "presentPaymentSheet failed",
          transactionId,
          productCode: "astrogama_natala_other_person",
          analysisId: purchaseContext.analysisId,
          analysisType: purchaseContext.analysisType,
          contactEmail: resolvedEmail,
          contactPhone: resolvedPhone,
          fullName:
            userD?.full_name ||
            personData?.full_name ||
            `${resolvedFirstName} ${resolvedLastName}`.trim(),
          extraContext: {
            phase: "presentPaymentSheet",
          },
        });
        return;
      }
      pLog("paymentSheet presented OK (authorized)");
      // La acest punct, plata este autorizată (status "requires_capture"), dar nu este capturată.
  
      // 4) Generează conținutul PDF
      const pdfHtmlContent = generatePDFContent();
      console.log("📝 Generated PDF HTML content.");
  
      // 5) Trimite emailul cu PDF-ul
      pLog("calling sendPdfEmail");
      const sendPdfEmailFn = httpsCallable(functions, sendPdfEmail);
      const emailResponse = await sendPdfEmailFn({
        email: resolvedEmail, // sau userD.email, după caz
        pdfHtml: pdfHtmlContent,
        fullName: userD.full_name, // folosește numele real al utilizatorului
      });
      pLog("sendPdfEmail response", emailResponse?.data);
  
// Pentru test: simulează o eroare după trimiterea emailului
// DECOMENTEAZĂ LINIA DE MAI JOS PENTRU TESTARE:
// throw new Error("Test error: Simulated failure after email sent");


      if (emailResponse.data && emailResponse.data.success) {
        // 6) Capturează PaymentIntent (folosind funcția test)
        pLog("capturing PaymentIntent", { transactionId });
        const capturePaymentFn = httpsCallable(functions, capturePaymentIntentTest);
        const captureResp = await capturePaymentFn({
          transactionId,
          productCode: "astrogama_natala_other_person",
          firstName: resolvedFirstName,
          lastName: resolvedLastName,
          email: resolvedEmail,
          phone: resolvedPhone,
          ...purchaseContext,
        });
        if (captureResp.data && captureResp.data.captured) {
          pLog("payment captured OK");
          // 7) Actualizează analiza în personsDataAstrograma din AsyncStorage
          const personsDataAstrogramaJson = await AsyncStorage.getItem("personsDataAstrograma");
          let updatedPersonsDataAstrograma = personsDataAstrogramaJson ? JSON.parse(personsDataAstrogramaJson) : [];
          updatedPersonsDataAstrograma = markAnalysisPaidInCollection(
            updatedPersonsDataAstrograma,
            userD || personData
          );
          setIsPaid(true)
          await AsyncStorage.setItem("personsDataAstrograma", JSON.stringify(updatedPersonsDataAstrograma));
          console.log("✅ AsyncStorage updated: isPaid setat la true pentru analiza curentă.");

          // 8) Creează factura în Oblio via Firebase Functions
          pLog("calling Firebase Oblio invoice function", { transactionId });
          const createOblioInvoiceFn = httpsCallable(functions, "createOblioInvoiceAfterPayment");
          const invoiceResp = await createOblioInvoiceFn({
            transactionId,
            productCode: "astrogama_natala_other_person",
            ...purchaseContext,
            customer: {
            firstName: resolvedFirstName,
            lastName: resolvedLastName,
            email: resolvedEmail,
            phone: resolvedPhone,
              address: {
                line1: resolvedLine1,
                city: resolvedCity,
                state: resolvedStateCounty,
                postal_code: resolvedPostalCode,
                country: resolvedCountry,
              },
            },
            coupon: {
              couponAllowed: resolvedCouponAllowed,
              couponCode: resolvedCouponAllowed ? resolvedCouponCode : "",
              discountPercent: resolvedCouponAllowed ? resolvedCouponPercent : 0,
            },
          });
          pLog("Firebase Oblio invoice response", invoiceResp?.data);
          Alert.alert(
            achizitieCompleta1,
            appendPurchaseSupportMessage(achizitieCompleta2, language)
          );
        } else {
          throw new Error("Capturarea plății a eșuat.");
        }
      } else {
        // Dacă trimiterea emailului nu a fost reușită, nu capturează plata
        showLocalizedSupportErrorAlert({
          language,
          screenName: "AstrogramaNatalaOtherPerson",
          publicMessage: supportCopy.pdfEmailFailedPublicMessage,
          technicalMessage:
            emailResponse?.data?.message || "sendPdfEmail returned success=false",
          error: emailResponse?.data || null,
          transactionId,
          productCode: "astrogama_natala_other_person",
          analysisId: purchaseContext.analysisId,
          analysisType: purchaseContext.analysisType,
          contactEmail: resolvedEmail,
          contactPhone: resolvedPhone,
          fullName:
            userD?.full_name ||
            personData?.full_name ||
            `${resolvedFirstName} ${resolvedLastName}`.trim(),
          extraContext: {
            phase: "sendPdfEmail",
            emailSuccess: Boolean(emailResponse?.data?.success),
          },
        });
        // Opțional, poți apela o funcție backend pentru a anula PaymentIntent
      }
    } catch (error) {
      pErr("handlePayment error", error);
      const msg =
        (error && typeof error === "object" && error.message ? String(error.message) : "") ||
        "Nu s-a putut procesa plata sau factura.";
      showLocalizedSupportErrorAlert({
        language,
        screenName: "AstrogramaNatalaOtherPerson",
        error,
        publicMessage: supportCopy.paymentFlowPublicMessage,
        technicalMessage: msg,
        transactionId,
        productCode: "astrogama_natala_other_person",
        analysisId: userD?.id || personData?.id || "",
        analysisType: userD?.type || personData?.type || "othersAstrograma",
        contactEmail: resolvedEmail,
        contactPhone: resolvedPhone,
        fullName:
          userD?.full_name ||
          personData?.full_name ||
          `${resolvedFirstName} ${resolvedLastName}`.trim(),
        extraContext: {
          phase: "handlePaymentCatch",
        },
        showTransactionRetryWarning: Boolean(transactionId),
      });
    } finally {
      setIsLoadingBuy(false);
      pLog("done (isLoadingBuy=false)");
    }
  };
  

  const personalitateText = useTranslation(
    "Personalitate",
    language,
    "AstrogramaNatalScreen"
  );
  const signReportText = useTranslation(
    "Sign Report",
    language,
    "AstrogramaNatalScreen"
  );
  const houseReportText = useTranslation(
    "House Report",
    language,
    "AstrogramaNatalScreen"
  );

  const achizitioneazaInterpretareCompletaText2 = useTranslation(
    "Aceasta este o secțiune limitată din interpretarea sinastriei tale. Pentru a accesa interpretarea completă, finalizează achiziția.",
    language,
    "SinastrieRelatieOthers"
  );
  const achizitioneazaInterpretareCompletaText = useTranslation(
    "Achiziționează Interpretarea Completă",
    language,
    "SinastrieRelatieOthers"
  );
  const descarcaPdfText = useTranslation(
    "Descarcă PDF-ul Interpretării",
    language,
    "SinastrieRelatieOthers"
  );

  //Traducere inline text

  if (isLoading) {
    return <LoadingOverlay />;
  }

  if (isLoadingBuy) {
    return <LoadingOverlay isLoadingBuy={isLoadingBuy} />;
  }

  return (
    <>
      <MainContainer>
        <ImageBackground
          source={require('../../../../assets/dashboardbg.jpg')}
          style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}
          imageStyle={{ opacity: 1 }}
        >
          <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.72)', zIndex: 1 }} pointerEvents="none" />
          <View style={{ flex: 1, zIndex: 2 }}>
          
            <MyTopBar onChangeTab={setSelectedTab} />
            {selectedTab === "natal" ? (
              <ScrollViewFadeFirst element={Header} height={400}>
                <ShowFromTop>
                  <View style={[styles.defaultContainer]}>
                    <Divider style={{ marginTop: "5%" }} />
                    <View style={styles.horoscopeTodayContainer}>
                      <Text style={[styles.textTitles, textStyles.goldenTextBold, { fontSize: 22 }]}>
                        {userD.full_name}
                      </Text>
                    </View>
                    <View style={styles.horoscopeTodayContainer}>
                      <Text style={[styles.textDescription, textStyles.goldenText, { marginTop: 0 }]}>{userD.day} - {userD.month} - {userD.year}</Text>
                    </View>
                    <View style={styles.horoscopeTodayContainer}>
                      <Text style={[styles.textDescription, textStyles.goldenText, { marginTop: 0 }]}>{userD.selectedTime}</Text>
                    </View>
                    <View style={styles.horoscopeTodayContainer}>
                      <Text style={[styles.textDescription, textStyles.goldenText, { marginTop: 0 }]}>{userD.place}</Text>
                    </View>
                    <View style={styles.horoscopeTodayContainer}>
                      <Text style={[styles.textDescription, textStyles.goldenText, { marginTop: 0 }]}>{userD.gender}</Text>
                    </View>
                    {/* Interpretează următoarea diagramă natală: Născut pe 10 martie 1994, la 14:05, în București, România. Soarele în Pești, Luna în Capricorn, Mercur în Vărsător, Venus în Berbec, și Marte în Pești. Ascendentul este în Scorpion. Soarele formează o conjuncție cu Venus, Luna este în opoziție cu Marte, iar Mercur formează un trigon cu Saturn. */}
                    {/* Interpretează următoarea diagramă natală si sa fie pe categorii General, Personalitate, Dragoste, Cariera, Bani:  */}
                    {/* {aspectsData && (
          <AstrologyAspectsView aspectsData={aspectsData} />
        )} */}
                  </View>
                  {/* <ChatComponent /> */}

                  <View style={{ paddingVertical: 10 }} />
                </ShowFromTop>
              </ScrollViewFadeFirst>
            ) : selectedTab === "interpretation" ? (
              <ScrollViewFadeFirst height={10}>
                <ShowFromTop>
                  <View style={[styles.defaultContainer]}>
                    <View style={styles.horoscopeTodayContainer}>
                      <Text style={[styles.textTitles, textStyles.goldenTextBold, { fontSize: 18, marginTop: '7%' }]}>
                        {personalitateText}
                      </Text>
                    </View>
                    <Divider style={{ marginTop: "5%" }} />
                    {/* Interpretează următoarea diagramă natală: Născut pe 10 martie 1994, la 14:05, în București, România. Soarele în Pești, Luna în Capricorn, Mercur în Vărsător, Venus în Berbec, și Marte în Pești. Ascendentul este în Scorpion. Soarele formează o conjuncție cu Venus, Luna este în opoziție cu Marte, iar Mercur formează un trigon cu Saturn. */}
                    <View
                      style={[
                        styles.horoscopeTodayContainer,
                        {
                          marginBottom: "10%",
                          flexDirection: "column",
                          justifyContent: "flex-start",
                          alignItems: "flex-start",
                        },
                      ]}
                    >
                      {!isPaid ? (
                        <>
                          <Text style={[styles.textDescription, textStyles.goldenText, { textAlign: 'justify', width: '100%' }]}>
                            {achizitioneazaInterpretareCompletaText2}
                          </Text>
                          <Button
                            disabled={false}
                            funCallback={() => setModalVisible(true)}
                            label={achizitioneazaInterpretareCompletaText}
                            success={true}
                            bgColor={colors.gradientLogin11}
                            borderColor={colors.white}
                            borderWidth={0.2}
                            txtColor={colors.white}
                            style={{ marginTop: "10%", marginBottom: "10%" }}
                          />
                        </>
                      ) : (
                        <>
                          <Button
                            disabled={false}
                            funCallback={handleDownloadPDF}
                            label={descarcaPdfText}
                            success={true}
                            bgColor={colors.gradientLogin11}
                            borderColor={colors.white}
                            borderWidth={0.2}
                            txtColor={colors.white}
                            style={{ marginTop: "10%", marginBottom: "10%" }}
                          />
                        </>
                      )}
                      <Text style={[styles.textDescription, textStyles.goldenText, { marginTop: 0 }]}>
                        {userD.ascendantData.data.result}
                      </Text>

                      {isPaid && (
                        <View>
                          <Text style={[styles.textTitles, textStyles.goldenTextBold, { fontSize: 18, marginTop: '7%' }]}>
                            {signReportText}
                          </Text>
                          {getValidSectionEntries(
                            userD?.generalSignTextData,
                            "generalSignTextData"
                          ).map(({ key, data: planetData }) => {
                            return (
                              <View key={key} style={{ marginBottom: 20 }}>
                                {/* Titlul planetă + semn zodiacal */}
                                <Text style={[styles.textTitles, textStyles.goldenTextBold, { fontSize: 18, marginTop: '7%' }]}> 
                                  {getSafeSignTitle(planetData)}
                                </Text>
                                {/* Text descriptiv */}
                                <Text style={[styles.textDescription, textStyles.goldenText, {color:"#bfa76a"}]}>
                                  {planetData.report || ""}
                                </Text>
                              </View>
                            );
                          })}
                        </View>
                      )}

                      {isPaid && (
                        <View>
                          <Text style={[styles.textTitles, textStyles.goldenTextBold, { fontSize: 18, marginTop: '7%' }]}>
                            {houseReportText}
                          </Text>
                          {getValidSectionEntries(
                            userD?.generalHouseTextData,
                            "generalHouseTextData"
                          ).map(({ key, data: houseData }) => {
                            return (
                              <View key={key} style={{ marginBottom: 20 }}>
                                {/* Titlul planetă + casă astrologică */}
                                <Text style={[styles.textTitles, textStyles.goldenTextBold, { fontSize: 18, marginTop: '7%' }]}> 
                                  {getSafeHouseTitle(houseData)}
                                </Text>
                                {/* Text descriptiv */}
                                <Text style={[styles.textDescription, textStyles.goldenText, {color:"#bfa76a"}]}>
                                  {houseData.report || ""}
                                </Text>
                              </View>
                            );
                          })}
                        </View>
                      )}
                    </View>
                    {/* {aspectsData && (
        <AstrologyAspectsView aspectsData={aspectsData} />
      )} */}
                  </View>
                  {/* <ChatComponent /> */}

                  <View style={{ paddingVertical: 10 }} />
                </ShowFromTop>
              </ScrollViewFadeFirst>
            ) : (
              <ShowFromTop>
                <AspectTable
                  houseCusps={houseCusps}
                  planetaryData={planetaryData}
                  aspects={aspectsData}
                />
              </ShowFromTop>
            )}
          </View>
        </ImageBackground>
      </MainContainer>
      {/* Modal pentru selecția limbii */}
      <PurchaseModal
        visible={isModalVisible}
        onDismiss={() => setModalVisible(false)}
        baseAmountBani={1000}
        setEmail={setEmail}
        setPhone={setPhone}
        phone={phone}
        email={email}
        firstName={firstName}
        lastName={lastName}
        setLastName={setLastName}
        setFirstName={setFirstName}
        setCountry={setCountry}
        setCity={setCity}
        setLine1={setLine1}
        setStateCounty={setStateCounty}
        line1={line1}
        city={city}
        stateCounty={stateCounty}
        country={country}
        postalCode={postalCode}
        setPostalCode={setPostalCode}
        couponCode={couponCode}
        setCouponCode={setCouponCode}
        couponPercent={couponPercent}
        setCouponPercent={setCouponPercent}
        couponAllowed={couponAllowed}
        setCouponAllowed={setCouponAllowed}
        onConfirm={async (updatedUserDetails) => {
          setIsLoadingBuy(true);
          setModalVisible(false);

          try {
            await handlePayment(updatedUserDetails);
          } catch (error) {
            console.error("Eroare la procesarea plății:", error);
            Alert.alert(
              "Eroare",
              "A apărut o problemă la procesarea plății. Te rugăm să încerci din nou."
            );
          } finally {
            setIsLoadingBuy(false);
          }
        }}
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={setSelectedLanguage}
      />
    </>
  );
}

const styles = StyleSheet.create({
  partialContent: {
    fontSize: 14,
    color: "black",
    textAlign: "center",
    marginVertical: 15,
    marginHorizontal: 20,
    lineHeight: 20,
  },
  languageSelector: {
    marginBottom: 20,
    width: "80%",
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  picker: {
    height: 50,
    width: "100%",
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  content: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 30,
  },
  purchaseButton: {
    backgroundColor: "#4285F4",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 20,
  },
  purchaseButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  downloadButton: {
    backgroundColor: "#34A853",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  downloadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  backgroundConstellation: {
    zIndex: 1,
    position: "absolute",
    top: 300,
    left: 20,
    opacity: 0.05,
  },
  headerContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginTop: 0,
    // paddingBottom: "10%",
    backgroundColor: "red",
  },
  headerHeadline: {
    fontWeight: "bold",
    fontSize: 30,
    lineHeight: 34,
    marginTop: 20,
  },
  defaultContainer: {
    marginLeft: 20,
    marginTop: 20,
    paddingBottom: "15%",
  },
  textTitles: {
    fontSize: 18,
    fontWeight: "bold",
  },
  textDescription: {
    fontSize: 18,
    lineHeight: 26,
    color: "#F0F0F0",
    marginTop: "5%",
    marginLeft: "3%",
    textAlign: 'justify',
    paddingRight: "8%"
  },
  horoscopeTodayContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // marginTop: "25%",
  },
  iconsHoroscopeToday: {
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  loveContainer: {
    flexDirection: "row",
    marginTop: 15,
    marginHorizontal: 20,
    justifyContent: "space-between",
    borderWidth: 2,
    borderRadius: 10,
  },
  heartLoveContainer: {
    flex: 0.2,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  loveSignsContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    flex: 1,
    marginTop: 10,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: width / 1.5, // Setează lățimea la jumătatea ecranului
    alignSelf: "center",
  },
  text: {
    marginBottom: 20,
    textAlign: "center",
    fontSize: 16,
    color: "white",
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: "contain",
  },
  iconContainer: {
    position: "absolute",
    top: "89.7%",
    right: "52%",
    width: "auto",
    height: "auto",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 50,
  },
});

export default AstrogramaNatalaOtherPerson;

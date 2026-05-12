import { MaterialCommunityIcons } from "@expo/vector-icons";

import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  ImageBackground,
  StatusBar,
} from "react-native";
import {
  Divider,
  ProgressBar,
  Subheading,
  Text,
  useTheme,
} from "react-native-paper";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { StorageAccessFramework } from "expo-file-system";
import ShowFromTop from "../../../components/Astral/components/show-from-top";
import ScrollViewFadeFirst from "../../../components/Astral/components/scroll-view-fade-first";

import { daily } from "../../../utils/daily";
import AstroChart from "../../../components/Astral/components/AstroChart";
import {
  H18fontMediumBlack,
  H4fontBoldYellow,
  H6fontBoldPrimary,
  H6fontBoldWhite,
  H6fontBoldYellow,
  H7fontBoldWhite,
  H8fontBoldPrimary,
  H8fontMediumWhite,
  H8fontRegularWhite,
  H9fontMediumLightBlack,
  H9fontMediumWhite,
} from "../../../components/commonText";
import { LinearGradient } from "expo-linear-gradient";

import { colors } from "../../../utils/colors";
import { MainContainer } from "../../../components/commonViews";
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
import { handleToTranslate } from "../../../utils/AstralUtils/fetchGPTData";
import LoadingOverlay from "../../../components/Astral/components/zodiac/LoadingOverlay";
import AspectTableSinastrie from "../../../components/Astral/components/AspectTableSinastrie";
import HorizontalTabSelector from "../../../components/Astral/components/HorizontalTabSelector";
import SvgComponent from "../../../components/Astral/components/SvgComponent";
import PurchaseModal from "../../../components/Astral/components/PurchaseModal ";
import { Button } from "../../../components/commonButton";
import { useAuth } from "../../../context/AuthContext";
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { handleLanguagei18n } from "../../../utils/handleLanguageGeneral";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useStripe } from "@stripe/stripe-react-native";
import { useTranslation } from "../../../utils/translateUtil";
import { capturePaymentIntentTest, createPaymentIntentTest, sendPdfEmail } from "../../../utils/constant";
// Oblio invoice via Firebase Functions (no Next.js)
import { textStyles } from '../../../utils/colors';
import { useAnalysisBackNavigation } from "../../../hooks/useAnalysisBackNavigation";
import {
  applySinastrieTranslationPatch,
  buildAnalysisCacheKey,
  countLikelyWrongLanguageSinastrieContent,
  extractSinastrieTranslationPatch,
  getCachedTranslationPatch,
  hasLikelyWrongLanguageSinastrieContent,
  isLikelyFailedTranslationResult,
  removeCachedTranslationPatch,
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

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const TRANSLATION_ITEM_DELAY_MS = 120;
const SINASTRY_TRANSLATION_TIMEOUT_MS = 6000;
const SINASTRY_TRANSLATION_MAX_ATTEMPTS = 1;
const SINASTRY_TRANSLATION_ABORT_AFTER_FAILED_DESCRIPTIONS = 2;
const SINASTRY_TRANSLATION_MAX_SESSION_MS = 20000;
const normalizeLanguageCode = (lang) =>
  String(lang || "")
    .trim()
    .toLowerCase()
    .split("-")[0];

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

/**
 * @param navigation {object}
 * @returns {*}
 * @constructor
 */
function SinastrieRelatie({ navigation, route }) {
  useAnalysisBackNavigation(navigation, "PersonsList");
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
  const [isLoadingBuy, setIsLoadingBuy] = useState(false);
  const [activeTab, setActiveTab] = useState("Harmony"); // Starea pentru tabul activ

  const [planetaryData, setPlanetaryData] = useState(null);
  const [houseCusps, setHouseCusps] = useState(null);
  const [harmoniousAspectReading, setHarmoniousAspectReading] = useState(null);
  const [conflictingAspectReading, setConflictingAspectReading] =
    useState(null);
  const [contrastingAspectReading, setContrastingAspectReading] =
    useState(null);
  const [physicalCompatibility, setPhysicalCompatibility] = useState(null);
  const [emotionalCompatibility, setEmotionalCompatibility] = useState(null);
  const [sexualCompatibility, setSexualCompatibility] = useState(null);
  const [spiritualCompatibility, setSpiritualCompatibility] = useState(null);
  const [financialCompatibility, setFinancialCompatibility] = useState(null);
  const [generalSignReport, setGeneralSignReport] = useState(null);
  const [generalHouseReport, setGeneralHouseReport] = useState(null);
  const [moonPhase, setMoonPhase] = useState(null);
  const [ascendantReport, setAscendantReport] = useState(null);
  const [selectedTab, setSelectedTab] = useState("natal");
  const { personData } = route.params || {}; // Extrage datele persoanei din navigare
  const [userD, setUserD] = useState(personData || {});
  const [currentUserData, setCurrentUserData] = useState({});
  const [UData, setUData] = useState({});
  const { language, changeLanguage } = useLanguage();
  const { currentUser, userData, isGuestUser, setUserData } = useAuth();
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

  //ACHIZITIONARE SINASTRIE
  const [isPaid, setIsPaid] = useState(personData.isPaid || false); // Starea pentru achiziție
  const [isModalVisible, setModalVisible] = useState(false); // Starea pentru afișarea modalului
  const [selectedLanguage, setSelectedLanguage] = useState("ro"); // Limba implicită

  const generatePDFContent = () => {
    const wheelImageP1 = wheelImage?.base64ImageP1 || null; // Natal Wheel Chart pentru P1
    const wheelImageP2 = wheelImage?.base64ImageP2 || null; // Natal Wheel Chart pentru P2

    const generalDetailsP1 = `
      <p><strong>Nume:</strong> ${UData.full_name}</p>
      <p><strong>Data nașterii:</strong> ${UData.day}-${UData.month}-${UData.year}</p>
      <p><strong>Ora nașterii:</strong> ${UData.hour}:${UData.min}</p>
      <p><strong>Locul nașterii:</strong> ${UData.place}</p>
      <p><strong>Gen:</strong> ${UData.gender}</p>
    `;

    const natalWheelChartP1 = `
      <div>
        ${
          wheelImageP1
            ? `<img src="data:image/svg+xml;base64,${base64.encode(
                wheelImageP1
              )}" style="width: 500px; height: 500px; display: block; margin: 0 auto; border: 1px solid #ddd; border-radius: 10px;" />`
            : "<p>Astrogramă Natală pentru P1 nu este disponibilă.</p>"
        }
      </div>
    `;

    const generalDetailsP2 = `
      <p><strong>Nume:</strong> ${userD.full_name}</p>
      <p><strong>Data nașterii:</strong> ${userD.day}-${userD.month}-${userD.year}</p>
      <p><strong>Ora nașterii:</strong> ${userD.selectedTime}</p>
      <p><strong>Locul nașterii:</strong> ${userD.place}</p>
      <p><strong>Gen:</strong> ${userD.gender}</p>
    `;

    const natalWheelChartP2 = `
      <div style="margin-top: 20px;">
        ${
          wheelImageP2
            ? `<img src="data:image/svg+xml;base64,${base64.encode(
                wheelImageP2
              )}" style="width: 500px; height: 500px; display: block; margin: 0 auto; border: 1px solid #ddd; border-radius: 10px;" />`
            : "<p>Astrogramă Natală pentru P2 nu este disponibilă.</p>"
        }
      </div>
    `;

    const categories = [
      {
        title: "Aspecte Armonioase",
        data: userD?.synastry?.harmoniousAspectReading?.data,
      },
      {
        title: "Aspecte Conflictuante",
        data: userD?.synastry?.conflictingAspectReading?.data,
      },
      {
        title: "Aspecte Contrastante",
        data: userD?.synastry?.contrastingAspectReading?.data,
      },
      {
        title: "Aspecte Intense",
        data: userD?.synastry?.intenseCompatibility?.data,
      },
      {
        title: "Compatibilitate Fizică",
        data: userD?.synastry?.physicalCompatibility?.data,
      },
      {
        title: "Compatibilitate Emoțională",
        data: userD?.synastry?.emotionalCompatibility?.data,
      },
      {
        title: "Compatibilitate Sexuală",
        data: userD?.synastry?.sexualCompatibility?.data,
      },
      {
        title: "Compatibilitate Spirituală",
        data: userD?.synastry?.spiritualCompatibility?.data,
      },
      {
        title: "Compatibilitate Financiară",
        data: userD?.synastry?.financialCompatibility?.data,
      },
    ];

    const formattedCategories = categories
      .map((category) => {
        if (!category.data || category.data.length === 0) return ""; // Dacă nu există date, sărim peste categoria respectivă

        const formattedData = category.data
          .map((aspect) => {
            const readings = aspect.reading
              .map(
                (reading) => `
                  <div>
                    <h4 class="aspect-title">${reading.title}</h4>
                    <p>${reading.description}</p>
                  </div>
                `
              )
              .join("");
            return `<div>${readings}</div>`;
          })
          .join("");

        return `
          <div class="section">
            <h2 class="category-title">${category.title}</h2>
            ${formattedData}
          </div>
        `;
      })
      .join("");

    return `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              line-height: 1.6;
              color: #333;
            }
            h1 {
              color: #4CAF50;
              font-size: 24px;
              text-align: center;
              margin-bottom: 20px;
            }
            h2 {
              font-size: 20px;
              color: #4CAF50;
              font-weight: bold;
            }
            .category-title {
              font-size: 18px;
              font-weight: bold;
              color: #333;
              margin-bottom: 10px;
            }
            .aspect-title {
              font-size: 16px;
              font-weight: bold;
              margin: 10px 0;
              color: #555;
            }
            p {
              margin: 10px 0;
              font-size: 14px;
            }
            .divider {
              border-top: 1px solid #ddd;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <h1>Raport Sinastrie</h1>
          ${generalDetailsP1}
          ${natalWheelChartP1}
          <div class="divider"></div>
          ${generalDetailsP2}
          ${natalWheelChartP2}
          <div class="divider"></div>
          ${formattedCategories}
        </body>
      </html>
    `;
  };

  // const handleDownloadPDF = async () => {
  //   try {
  //     console.log("Generare PDF în curs...");
  //     const htmlContent = generatePDFContent();

  //     // Generează PDF-ul
  //     const { uri } = await Print.printToFileAsync({ html: htmlContent });
  //     console.log("PDF generat:", uri);

  //     if (Platform.OS === "android" && Platform.Version < 29) {
  //       // Pentru Android 10 și mai vechi
  //       const fileUri = `${FileSystem.documentDirectory}RaportAnaliza.pdf`;
  //       await FileSystem.copyAsync({ from: uri, to: fileUri });

  //       Alert.alert(
  //         "Fișier salvat",
  //         `PDF-ul a fost salvat cu succes la: ${fileUri}`
  //       );
  //       console.log("Fișier salvat cu succes:", fileUri);
  //     } else {
  //       // Pentru Android 11 și mai nou
  //       const permissions =
  //         await StorageAccessFramework.requestDirectoryPermissionsAsync();
  //       if (!permissions.granted) {
  //         Alert.alert(
  //           "Permisiune refuzată",
  //           "Trebuie să acorzi permisiunea pentru a salva fișierul."
  //         );
  //         return;
  //       }

  //       const directoryUri = permissions.directoryUri;
  //       console.log("Director selectat:", directoryUri);

  //       const fileName = "RaportAnaliza.pdf";
  //       const base64Content = await FileSystem.readAsStringAsync(uri, {
  //         encoding: FileSystem.EncodingType.Base64,
  //       });
  //       const fileUri = await StorageAccessFramework.createFileAsync(
  //         directoryUri,
  //         fileName,
  //         "application/pdf"
  //       );

  //       await FileSystem.writeAsStringAsync(fileUri, base64Content, {
  //         encoding: FileSystem.EncodingType.Base64,
  //       });

  //       Alert.alert(
  //         "Fișier salvat",
  //         `PDF-ul a fost salvat cu succes la: ${fileUri}`
  //       );
  //       console.log("Fișier salvat cu succes:", fileUri);
  //     }
  //   } catch (error) {
  //     console.error("Eroare la salvarea fișierului:", error);
  //     Alert.alert("Eroare", "Nu s-a putut salva fișierul.");
  //   }
  // };

  //ACHIZITIONARE SINASTRIE

  const handleDownloadPDF = async () => {
    try {
      console.log("Generare PDF în curs...");
      const htmlContent = generatePDFContent();
    
      // Generează PDF-ul
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      console.log("PDF generat:", uri);
    
      if (Platform.OS === "android") {
        if (Platform.Version < 29) {
          // Pentru Android 10 și mai vechi, nu se cere alegerea directorului
          const fileUri = `${FileSystem.documentDirectory}RaportAnaliza.pdf`;
          await FileSystem.copyAsync({ from: uri, to: fileUri });
          Alert.alert("Fișier salvat", `PDF-ul a fost salvat cu succes la: ${fileUri}`);
          console.log("Fișier salvat cu succes:", fileUri);
        } else {
          // Pentru Android 11 și mai nou, solicită utilizatorului să aleagă un director
          const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();
          if (!permissions.granted) {
            Alert.alert("Permisiune refuzată", "Trebuie să acorzi permisiunea pentru a salva fișierul.");
            return;
          }
          const directoryUri = permissions.directoryUri;
          console.log("Director selectat:", directoryUri);
    
          const fileName = "RaportAnaliza.pdf";
          const base64Content = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          const fileUri = await StorageAccessFramework.createFileAsync(directoryUri, fileName, "application/pdf");
          await FileSystem.writeAsStringAsync(fileUri, base64Content, {
            encoding: FileSystem.EncodingType.Base64,
          });
    
          Alert.alert("Fișier salvat", `PDF-ul a fost salvat cu succes la: ${fileUri}`);
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
  

  const isValidBase64 = (base64) => {
    const regex = /^[A-Za-z0-9+/]+={0,2}$/;
    return regex.test(base64);
  };

  const getActiveTabData = () => {
    switch (activeTab) {
      case "Harmony":
        return userD?.synastry?.harmoniousAspectReading?.data;
      case "Conflict":
        return userD?.synastry?.conflictingAspectReading?.data;
      case "Contrast":
        return userD?.synastry?.contrastingAspectReading?.data;
      case "Intense_Aspect":
        return userD?.synastry?.intenseCompatibility?.data;
      case "Physical_Compatibility":
        return userD?.synastry?.physicalCompatibility?.data;
      case "Emotional_Compatibility":
        return userD?.synastry?.emotionalCompatibility?.data;
      case "Sexual_Compatibility":
        return userD?.synastry?.sexualCompatibility?.data;
      case "Spiritual_Compatibility":
        return userD?.synastry?.spiritualCompatibility?.data;
      case "Financial_Compatibility":
        return userD?.synastry?.financialCompatibility?.data;
      default:
        return []; // sau returnează un set de date implicit dacă este necesar
    }
  };

  const handleNatalChart = async () => {
    try {
      console.log("tesdasdasdsadsads");
      await refreshLocalAnalysisAccessFromEntitlements();
      // Extrage datele persoanei din route.params sau fallback la AsyncStorage
      const personIndex = route.params?.personIndex;

      // Încarcă datele utilizatorului curent (pentru "Sinastria mea")
      const userJson = await AsyncStorage.getItem("userData");
      const currentUserData = userJson ? JSON.parse(userJson) : null;

      // Încarcă datele persoanelor salvate
      const userDataJson = await AsyncStorage.getItem("personsData");
      let personsData = userDataJson ? JSON.parse(userDataJson) : null;
      
      // Determină persoana selectată pentru sinastrie
      let selectedPerson = null;
      const matchedStoredPerson = findMatchingAnalysisByIdentity(
        personsData,
        personData
      );
      if (matchedStoredPerson) {
        selectedPerson = matchedStoredPerson;
      } else if (personData) {
        // Dacă avem personData din route.params, folosește-l
        selectedPerson = personData;
      } else if (personsData && personIndex !== undefined) {
        // Altfel, încearcă să găsești persoana din lista salvată
        selectedPerson = personsData[personIndex];
      }

      if (!currentUserData || !selectedPerson) {
        console.error(
          "Nu există date de utilizator disponibile sau persoana selectată nu există."
        );
        setIsLoading(false);
        return;
      }

      // Setează datele utilizatorului curent (pentru prima persoană în sinastrie)
      setUData(currentUserData);
      setCurrentUserData(currentUserData);
      setIsPaid(Boolean(selectedPerson?.isPaid || personData?.isPaid));
      
      // Setează datele persoanei selectate (pentru a doua persoană în sinastrie)
      setUserD(selectedPerson);

      // Verifică dacă există date de sinastrie pentru persoana selectată
      if(!selectedPerson.synastry?.natalWheelChart){
        console.error("Nu există date de sinastrie pentru persoana selectată");
        setIsLoading(false);
        return;
      }

      // Verifică dacă traducerea este necesară
      const targetLang = normalizeLanguageCode(language);
      const sourceLang = normalizeLanguageCode(selectedPerson.actualLanguageSinastrie);
      const needsLanguageRepair = hasLikelyWrongLanguageSinastrieContent(
        selectedPerson,
        targetLang
      );
      const forceAutoDetectSource = needsLanguageRepair && targetLang === sourceLang;
      if (targetLang && (targetLang !== sourceLang || needsLanguageRepair)) {
        if (needsLanguageRepair && targetLang === sourceLang) {
          console.warn("[Sinastrie] retranslate_due_to_wrong_language_content", {
            person: selectedPerson?.full_name,
            lang: targetLang,
            wrongLanguageCount: countLikelyWrongLanguageSinastrieContent(
              selectedPerson,
              targetLang
            ),
          });
        }
        setIsLoading(true);
        const analysisCacheKey = buildAnalysisCacheKey("sinastrie_personal", {
          id: selectedPerson?.id || "",
          owner_uid: selectedPerson?.owner_uid || "",
          full_name: selectedPerson?.full_name || "",
          day: selectedPerson?.day || "",
          month: selectedPerson?.month || "",
          year: selectedPerson?.year || "",
          selectedTime: selectedPerson?.selectedTime || "",
          place: selectedPerson?.place || "",
        });

        let usedCache = false;
        const cachedPatch = await getCachedTranslationPatch(
          analysisCacheKey,
          targetLang
        );
        if (cachedPatch) {
          const cachedTranslatedPerson = applySinastrieTranslationPatch(
            selectedPerson,
            cachedPatch
          );
          if (cachedTranslatedPerson) {
            const cacheLooksInvalid = hasLikelyWrongLanguageSinastrieContent(
              cachedTranslatedPerson,
              targetLang
            );
            if (cacheLooksInvalid) {
              console.warn("[Sinastrie] invalid translation cache detected", {
                person: cachedTranslatedPerson?.full_name,
                to: targetLang,
              });
              await removeCachedTranslationPatch(analysisCacheKey, targetLang);
            } else {
              usedCache = true;
              selectedPerson = cachedTranslatedPerson;
              setUserD(cachedTranslatedPerson);
              if (personsData && personIndex !== undefined) {
                personsData[personIndex] = cachedTranslatedPerson;
                await AsyncStorage.setItem("personsData", JSON.stringify(personsData));
              }
              console.log("[Sinastrie] translation cache hit", {
                person: cachedTranslatedPerson.full_name,
                to: targetLang,
              });
            }
          }
        }

        if (!usedCache) {
          console.log("[Sinastrie] translation cache miss -> retranslate", {
            person: selectedPerson?.full_name,
            to: targetLang,
          });
          try {
          // Creează o copie profundă pentru a evita mutații parțiale la fallback/error
          const translatedPerson = JSON.parse(JSON.stringify(selectedPerson));

          const categories = [
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

          const translationSourceLang = forceAutoDetectSource ?
            "" :
            sourceLang || translatedPerson.actualLanguageSinastrie;
          const translationDiagnosticsSourceLang =
            translationSourceLang || "auto";
          const translationRequestOptions = {
            timeoutMs: SINASTRY_TRANSLATION_TIMEOUT_MS,
            maxAttempts: SINASTRY_TRANSLATION_MAX_ATTEMPTS,
          };
          const translationStartedAt = Date.now();
          let failedDescriptionCount = 0;
          let attemptedDescriptionCount = 0;

          // Parcurge și traduce fiecare categorie cu debit redus pentru a evita timeout/rate limit
          for (const category of categories) {
            const categoryData = translatedPerson.synastry?.[category]?.data;
            if (!Array.isArray(categoryData)) {
              continue;
            }

            for (const item of categoryData) {
              const readings = Array.isArray(item?.reading) ? item.reading : [];
              for (const reading of readings) {
                try {
                  if (reading.description) {
                    const originalDescription = reading.description;
                    const translatedDescription = await handleToTranslate(
                      originalDescription,
                      targetLang,
                      translationSourceLang,
                      translationRequestOptions
                    );
                    reading.description = translatedDescription;
                    attemptedDescriptionCount += 1;
                    if (
                      isLikelyFailedTranslationResult({
                        sourceText: originalDescription,
                        translatedText: translatedDescription,
                        sourceLang: translationDiagnosticsSourceLang,
                        targetLang,
                      })
                    ) {
                      failedDescriptionCount += 1;
                    }
                    if (attemptedDescriptionCount % 5 === 0) {
                      console.log("[Sinastrie] translation progress", {
                        person: translatedPerson?.full_name,
                        to: targetLang,
                        attemptedDescriptionCount,
                        failedDescriptionCount,
                        elapsedMs: Date.now() - translationStartedAt,
                      });
                    }
                    if (
                      failedDescriptionCount >=
                        SINASTRY_TRANSLATION_ABORT_AFTER_FAILED_DESCRIPTIONS ||
                      Date.now() - translationStartedAt >=
                        SINASTRY_TRANSLATION_MAX_SESSION_MS
                    ) {
                      const abortError = new Error(
                        "Translation session aborted due to degraded translation service."
                      );
                      abortError.code = "TRANSLATION_ABORTED_DEGRADED";
                      throw abortError;
                    }
                    await delay(TRANSLATION_ITEM_DELAY_MS);
                  }
                  if (reading.title) {
                    reading.title = await handleToTranslate(
                      reading.title,
                      targetLang,
                      translationSourceLang,
                      translationRequestOptions
                    );
                    await delay(TRANSLATION_ITEM_DELAY_MS);
                  }
                } catch (error) {
                  if (error?.code === "TRANSLATION_ABORTED_DEGRADED") {
                    throw error;
                  }
                  reading.description =
                    reading.description || "Traducerea nu este disponibilă.";
                  reading.title =
                    reading.title || "Titlul nu este disponibil.";
                }
              }
            }
          }

          const hasWrongLanguageAfterTranslation =
            hasLikelyWrongLanguageSinastrieContent(translatedPerson, targetLang);
          const canPersistTranslation =
            failedDescriptionCount === 0 && !hasWrongLanguageAfterTranslation;

          if (!canPersistTranslation) {
            console.warn("[Sinastrie] translation incomplete, keeping source", {
              person: translatedPerson?.full_name,
              to: targetLang,
              attemptedDescriptionCount,
              failedDescriptionCount,
              hasWrongLanguageAfterTranslation,
            });
            setUserD(selectedPerson);
          } else {
            // Actualizează limba curentă pentru persoană doar când traducerea pare completă
            translatedPerson.actualLanguageSinastrie = targetLang;

            const translationPatch = extractSinastrieTranslationPatch(
              translatedPerson,
              targetLang
            );
            await setCachedTranslationPatch(
              analysisCacheKey,
              targetLang,
              translationPatch
            );
            console.log("[Sinastrie] translation cache saved", {
              person: translatedPerson?.full_name,
              to: targetLang,
            });

            // Actualizează persoana tradusă în lista persoanelor (dacă există)
            if (personsData && personIndex !== undefined) {
              personsData[personIndex] = translatedPerson;
              await AsyncStorage.setItem("personsData", JSON.stringify(personsData));
            }

            // Setează persoana tradusă în starea locală
            selectedPerson = translatedPerson;
            setUserD(translatedPerson);
          }
          } catch (error) {
          console.warn("[Sinastrie] translation aborted/fallback", {
            person: selectedPerson?.full_name,
            to: targetLang,
            code: error?.code || "",
            message: error?.message || String(error),
          });
          if (error?.code !== "TRANSLATION_ABORTED_DEGRADED") {
            Alert.alert("Eroare", "A apărut o problemă la traducerea datelor.");
          }
          setUserD(selectedPerson);
          } finally {
          setIsLoading(false);
          }
        }
      } else {
        console.log("[Sinastrie] translation skipped (same language)", {
          person: selectedPerson?.full_name,
          lang: targetLang || sourceLang || selectedPerson?.actualLanguageSinastrie,
        });
        setUserD(selectedPerson); // Folosește datele existente dacă traducerea nu este necesară
      }

      
      if (selectedPerson.synastry?.natalWheelChart?.data) {
        const svgElementsP1 = parseSVG(
          selectedPerson.synastry.natalWheelChart.data.p1.svg
        );
        const svgElementsP2 = parseSVG(
          selectedPerson.synastry.natalWheelChart.data.p2.svg
        );
        setSvgData({ svgElementsP1, svgElementsP2 });

        const base64ImageP1 = base64.decode(
          selectedPerson.synastry.natalWheelChart.data.p1.base64_image.replace(
            "data:image/svg+xml;base64,",
            ""
          )
        );
        const base64ImageP2 = base64.decode(
          selectedPerson.synastry.natalWheelChart.data.p2.base64_image.replace(
            "data:image/svg+xml;base64,",
            ""
          )
        );

        setWheelImage({ base64ImageP1, base64ImageP2 });
      }

      // Procesează aspectele astrogramei
      const aspectsP1 = selectedPerson.synastry?.aspect?.data?.p1_p2_aspect?.aspects;
      const aspectsP2 = selectedPerson.synastry?.aspect?.data?.p2_p1_aspect?.aspects;
      setAspectsData(selectedPerson.synastry?.aspect ? { aspectsP1, aspectsP2 } : null);

      // Procesează pozițiile planetare
      const planetaryP1 = selectedPerson.synastry?.planetaryPositions?.data?.p1_data;
      const planetaryP2 = selectedPerson.synastry?.planetaryPositions?.data?.p2_data;
      setPlanetaryData(
        selectedPerson.synastry?.planetaryPositions
          ? { planetaryP1, planetaryP2 }
          : null
      );

      // Procesează cuspidele caselor
      const housesP1 = selectedPerson.synastry?.houseCusps?.data?.p1_data;
      const housesP2 = selectedPerson.synastry?.houseCusps?.data?.p2_data;
      setHouseCusps(
        selectedPerson.synastry?.houseCusps ? { housesP1, housesP2 } : null
      );

      console.log("Date procesate cu succes pentru sinastria între:", currentUserData.full_name, "și", selectedPerson.full_name);

      setIsLoading(false);
    } catch (error) {
      console.error("Eroare la prelucrarea datelor astrogramei:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleNatalChart();
    // fetchNatalWheelChart().then((data) => {
    //   console.log("data.svg...", data.svg);
    //   setSvgData(data.svg);
    // });
  }, []);
  // const svgContent = atob(wheelImage);

  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  //traducere inline text
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


  const handlePayment = async (purchaseDetails = null) => {
    const runId = `pay_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    const pfx = `[PAYMENT][SinastrieRelatie][${runId}]`;
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
      // 1. Verifică câmpurile de adresă
      if (!resolvedLine1 || !resolvedCity || !resolvedStateCounty || !resolvedPostalCode || !resolvedCountry) {
        Alert.alert("Eroare", "Te rugăm să completezi toate câmpurile de adresă.");
        return;
      }
  
      setIsLoadingBuy(true);
      const functions = getFunctions();
      const purchaseContext = {
        analysisId: userD?.id || personData?.id || "",
        analysisType: userD?.type || personData?.type || "personalSinastry",
        ownerUid: currentUser?.uid || userData?.owner_uid || "",
      };
  
      // 2. Creează PaymentIntent cu capture_method: "manual"
      const createPaymentIntentFn = httpsCallable(functions, createPaymentIntentTest);
      pLog("calling createPaymentIntent", {
        productCode: "sinastrie_relatie",
        currency: "eur",
        couponCode: resolvedCouponAllowed ? resolvedCouponCode : "",
      });
      const resp = await createPaymentIntentFn({
        currency: "eur",
        firstName: resolvedFirstName,
        lastName: resolvedLastName,
        email: resolvedEmail,
        phone: resolvedPhone,
        productCode: "sinastrie_relatie",
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
  
      // 3. Inițializează Payment Sheet
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
          screenName: "SinastrieRelatie",
          error: initError,
          publicMessage: supportCopy.paymentInitPublicMessage,
          technicalMessage: initError?.message || "initPaymentSheet failed",
          transactionId,
          productCode: "sinastrie_relatie",
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
  
      // 4. Prezintă Payment Sheet
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
          screenName: "SinastrieRelatie",
          error: presentError,
          publicMessage: supportCopy.paymentFlowPublicMessage,
          technicalMessage: presentError?.message || "presentPaymentSheet failed",
          transactionId,
          productCode: "sinastrie_relatie",
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
      // Plata este autorizată (status: "requires_capture"), dar nu este capturată încă.
  
      // 5. Generează conținutul PDF
      const pdfHtmlContent = generatePDFContent();
      pLog("generated PDF HTML");
  
      // 6. Trimite emailul cu PDF-ul
      pLog("calling sendPdfEmail");
      const sendPdfEmailFn = httpsCallable(functions, sendPdfEmail);
      const emailResponse = await sendPdfEmailFn({
        email: resolvedEmail, // sau userD.email, după caz
        pdfHtml: pdfHtmlContent,
        fullName: userD.full_name,
      });
      pLog("sendPdfEmail response", emailResponse?.data);
  
      if (emailResponse.data && emailResponse.data.success) {
        // 7. Capturează PaymentIntent (fondurile vor fi reținute definitiv)
        pLog("capturing PaymentIntent", { transactionId });
        const capturePaymentFn = httpsCallable(functions, capturePaymentIntentTest);
        const captureResp = await capturePaymentFn({
          transactionId,
          productCode: "sinastrie_relatie",
          firstName: resolvedFirstName,
          lastName: resolvedLastName,
          email: resolvedEmail,
          phone: resolvedPhone,
          ...purchaseContext,
        });
        if (captureResp.data && captureResp.data.captured) {
          pLog("payment captured OK");
  
          // 8. Actualizează analiza în AsyncStorage (personsData) – identic ca în componenta originală
          // Marchează sinastria ca plătită în starea locală
          setIsPaid(true);
          // Obține datele salvate
          const personsDataString = await AsyncStorage.getItem("personsData");
          let personsData = personsDataString ? JSON.parse(personsDataString) : [];
          const updatedPersons = markAnalysisPaidInCollection(
            personsData,
            userD || personData
          );
          // Salvează lista actualizată în AsyncStorage
          await AsyncStorage.setItem("personsData", JSON.stringify(updatedPersons));
          // Verifică în consolă dacă s-a salvat corect:
          const verifyPersonsData = await AsyncStorage.getItem("personsData");
          const parsedData = JSON.parse(verifyPersonsData);
          const specificPerson = findMatchingAnalysisByIdentity(
            parsedData,
            userD || personData
          );
          console.log("📝 Element actualizat din AsyncStorage:", specificPerson);
  
          // 9. Creează factura în Oblio via Firebase Functions
          pLog("calling Firebase Oblio invoice function", { transactionId });
          const createOblioInvoiceFn = httpsCallable(functions, "createOblioInvoiceAfterPayment");
          const invoiceResp = await createOblioInvoiceFn({
            transactionId,
            productCode: "sinastrie_relatie",
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
        // Dacă trimiterea emailului a eșuat, nu se capturează plata
        showLocalizedSupportErrorAlert({
          language,
          screenName: "SinastrieRelatie",
          publicMessage: supportCopy.pdfEmailFailedPublicMessage,
          technicalMessage:
            emailResponse?.data?.message || "sendPdfEmail returned success=false",
          error: emailResponse?.data || null,
          transactionId,
          productCode: "sinastrie_relatie",
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
        // (Opțional: poți anula PaymentIntent printr-o funcție backend dedicată.)
      }
    } catch (error) {
      pErr("handlePayment error", error);
      const msg =
        (error && typeof error === "object" && error.message ? String(error.message) : "") ||
        "Nu s-a putut procesa plata sau factura.";
      showLocalizedSupportErrorAlert({
        language,
        screenName: "SinastrieRelatie",
        error,
        publicMessage: supportCopy.paymentFlowPublicMessage,
        technicalMessage: msg,
        transactionId,
        productCode: "sinastrie_relatie",
        analysisId: userD?.id || personData?.id || "",
        analysisType: userD?.type || personData?.type || "personalSinastry",
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
  
  

  useEffect(() => {
    let timeoutId;
    if (isLoading) {
      timeoutId = setTimeout(() => {
        Alert.alert(
          i18n.translate("slowLoading"),
          i18n.translate("slowLoadingText")
        );
      }, 10000); // 10 secunde timeout
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isLoading]);

  //traducere inline text
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
  //traducere inline text

  if (isLoading) {
    return <LoadingOverlay />;
  }
  if (isLoadingBuy) {
    return <LoadingOverlay isLoadingBuy={isLoadingBuy} />;
  }

  const activeData = getActiveTabData(); // Obține datele pentru tabul activ

  return (
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
            <ScrollView>
              <View style={[styles.defaultContainer]}>
                <View>
                  {wheelImage && (
                    <SvgComponent
                      svgBase64={wheelImage.base64ImageP1}
                      width="460"
                      height="460"
                    />
                  )}
                  
                </View>
                <Divider style={{ marginTop: "0%" }} />
                <View style={{ flex: 1, flexDirection: "row" }}>
                  <View style={{ flexDirection: "column", width: "55%" }}>
                    <View style={styles.horoscopeTodayContainer}>
                      <Text style={[styles.textTitles, textStyles.goldenTextBold, { fontSize: 22 }]}>{UData.full_name}</Text>
                    </View>
                    <View style={styles.horoscopeTodayContainer}>
                      <Text style={[styles.textDescription, textStyles.goldenText, { marginTop: 0 }]}>{UData.day} - {UData.month} - {UData.year}</Text>
                    </View>
                    <View style={styles.horoscopeTodayContainer}>
                      <Text style={[styles.textDescription, textStyles.goldenText, { marginTop: 0 }]}>{UData.hour}:{UData.min}</Text>
                    </View>
                    <View style={styles.horoscopeTodayContainer}>
                      <Text style={[styles.textDescription, textStyles.goldenText, { marginTop: 0 }]}>{UData.place}</Text>
                    </View>
                    <View style={styles.horoscopeTodayContainer}>
                      <Text style={[styles.textDescription, textStyles.goldenText, { marginTop: 0 }]}>{UData.gender}</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: "column", width: "55%" }}>
                    <View style={styles.horoscopeTodayContainer}>
                      <Text style={[styles.textTitles, textStyles.goldenTextBold, { fontSize: 22 }]}>{userD?.full_name}</Text>
                    </View>
                    <View style={styles.horoscopeTodayContainer}>
                      <Text style={[styles.textDescription, textStyles.goldenText, { marginTop: 0 }]}>{userD?.day} - {userD?.month} - {userD?.year}</Text>
                    </View>
                    <View style={styles.horoscopeTodayContainer}>
                      <Text style={[styles.textDescription, textStyles.goldenText, { marginTop: 0 }]}>{userD?.selectedTime}</Text>
                    </View>
                    <View style={styles.horoscopeTodayContainer}>
                      <Text style={[styles.textDescription, textStyles.goldenText, { marginTop: 0 }]}>{userD?.place}</Text>
                    </View>
                    <View style={styles.horoscopeTodayContainer}>
                      <Text style={[styles.textDescription, textStyles.goldenText, { marginTop: 0 }]}>{userD?.gender}</Text>
                    </View>
                  </View>
                </View>

                {/* Interpretează următoarea diagramă natală: Născut pe 10 martie 1994, la 14:05, în București, România. Soarele în Pești, Luna în Capricorn, Mercur în Vărsător, Venus în Berbec, și Marte în Pești. Ascendentul este în Scorpion. Soarele formează o conjuncție cu Venus, Luna este în opoziție cu Marte, iar Mercur formează un trigon cu Saturn. */}
                {/* Interpretează următoarea diagramă natală si sa fie pe categorii General, Personalitate, Dragoste, Cariera, Bani:  */}
                {/* {aspectsData && (
          <AstrologyAspectsView aspectsData={aspectsData} />
        )} */}
              </View>

              {/* <ChatComponent /> */}

              {/* <View style={{ paddingVertical: 10 }} /> */}
            </ScrollView>
          ) : selectedTab === "interpretation" ? (
            <ScrollViewFadeFirst height={10}>
              <ShowFromTop>
                <View style={[styles.defaultContainer]}>
                  <HorizontalTabSelector
                    isLoading={isLoading}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                  />
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
                    <View>
                      {isPaid ? (
                        // Afișează conținutul complet dacă este achiziționat
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
                            style={{ marginTop: "10%" }}
                          />
                          {activeData.map((aspect, index) => (
                            <View key={index}>
                              {aspect.reading.map((read, readIndex) => (
                                <View key={readIndex} style={{ marginTop: 20 }}>
                                  <Text style={[styles.textTitles, textStyles.goldenTextBold, { fontSize: 20, marginBottom:"5%" }]}>
                                    {read?.title}
                                  </Text>
                                  <Text style={[styles.textDescription, textStyles.goldenText, { marginTop: 0 }]}>
                                    {read?.description}
                                  </Text>
                                </View>
                              ))}
                            </View>
                          ))}
                        </>
                      ) : (
                        // Afișează conținut limitat dacă nu este achiziționat
                        <>
                          {activeData.length > 0 &&
                            activeData[0]?.reading?.length > 0 && (
                              <View>
                                <Text style={[styles.textTitles, textStyles.goldenTextBold, { fontSize: 16 }]}>
                                  {activeData[0].reading[0]?.title}
                                </Text>
                                <Text style={[styles.textDescription, textStyles.goldenText, { marginTop: 0 }]}>
                                  {activeData[0].reading[0]?.description}
                                </Text>
                              </View>
                            )}
                          <Text style={[styles.textDescription, textStyles.goldenText, { marginTop: 0 }]}>
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
                            style={{ marginTop: "10%" }}
                          />
                        </>
                      )}
                    </View>
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
              <AspectTableSinastrie
                houseCusps={houseCusps}
                planetaryData={planetaryData}
                aspects={aspectsData}
                userD={userD}
                currentUserData={currentUserData}
              />
            </ShowFromTop>
          )}
        </View>
      </ImageBackground>
      <PurchaseModal
        visible={isModalVisible}
        onDismiss={() => setModalVisible(false)}
        baseAmountBani={1500}
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
    </MainContainer>
  );
}

const styles = StyleSheet.create({
  // Stil pentru textul de conținut parțial
  partialContent: {
    fontSize: 14,
    color: "black",
    textAlign: "center",
    marginVertical: 15,
    marginHorizontal: 20,
    lineHeight: 20,
  },
  purchaseButton: {
    backgroundColor: "#4285F4",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
    alignSelf: "center",
  },
  purchaseButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },

  // Stil pentru selectorul de limbă (dacă nu este deja complet)
  languageSelector: {
    marginBottom: 20,
    width: "100%",
    alignItems: "center",
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    color: "#FFFFFF",
  },
  picker: {
    height: 50,
    width: "90%",
    backgroundColor: "#303030",
    borderRadius: 5,
    color: "#FFFFFF",
  },

  downloadButton: {
    backgroundColor: "#34A853",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
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
    paddingRight: "8%",
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
    marginBottom: 20, // Spațiu între text și imagine
    textAlign: "center",
    fontSize: 16,
    color: "white",
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: "contain", // Asigură-te că GIF-ul se încadrează în dimensiunile specificate
  },
  iconContainer: {
    position: "absolute", // Poziționează iconița absolut peste imagine
    top: "89.7%",
    right: "52%",
    width: "auto",
    height: "auto",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white", // Îndepărtează fundalul pentru a lăsa imaginea vizibilă
    borderRadius: 50,
  },
});

export default SinastrieRelatie;

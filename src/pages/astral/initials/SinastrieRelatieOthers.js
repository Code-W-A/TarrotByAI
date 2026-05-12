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
import { useStripe } from "@stripe/stripe-react-native";

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
import { handleToTranslate } from "../../../utils/AstralUtils/fetchGPTData";
import LoadingOverlay from "../../../components/Astral/components/zodiac/LoadingOverlay";
import AspectTableSinastrie from "../../../components/Astral/components/AspectTableSinastrie";
import HorizontalTabSelector from "../../../components/Astral/components/HorizontalTabSelector";
import SvgComponent from "../../../components/Astral/components/SvgComponent";
import PurchaseModal from "../../../components/Astral/components/PurchaseModal ";
import { Button } from "../../../components/commonButton";
import AspectTableSinastrieOthers from "../../../components/Astral/components/AspectTableSinastrieOthers";
import { getFunctions, httpsCallable } from "firebase/functions";
import { StorageAccessFramework } from "expo-file-system";
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

// const LuckyNumber = ({ number }) => {
//   return (
//     <View
//       style={[LuckyNumberStyles.circle, { backgroundColor: colors.primary1 }]}
//     >
//       <Text style={{ fontSize: 16, marginTop: 3 }}>{number}</Text>
//     </View>
//   );
// };

export async function translateAndUpdate(
  userD,
  path,
  language,
  actualLanguage
) {
  console.log("userD?....data....", userD);
  let element = path.reduce((obj, key) => (obj || {})[key], userD);
  if (element && element.description) {
    const translatedDescription = await handleToTranslate(
      element.description,
      language,
      actualLanguage
    );
    element.description = translatedDescription;
  }
  if (element && element.title) {
    const translatedTitle = await handleToTranslate(
      element.title,
      language,
      actualLanguage
    );
    element.title = translatedTitle;
  }
}

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

const planets = [
  { name: "Sun", position: signAndDegreeToPosition("Aries", 10), symbol: "☉" },
  {
    name: "Mercury",
    position: signAndDegreeToPosition("Leo", 12),
    symbol: "☿",
  },
  {
    name: "Venus",
    position: signAndDegreeToPosition("Libra", 14),
    symbol: "♀",
  },
  {
    name: "Mars",
    position: signAndDegreeToPosition("Scorpio", 10),
    symbol: "♂",
  },
  {
    name: "Jupiter",
    position: signAndDegreeToPosition("Capricorn", 5),
    symbol: "♃",
  },
  {
    name: "Saturn",
    position: signAndDegreeToPosition("Pisces", 3),
    symbol: "♄",
  },
  {
    name: "Uranus",
    position: signAndDegreeToPosition("Cancer", 2),
    symbol: "♅",
  },
  {
    name: "Neptune",
    position: signAndDegreeToPosition("Aquarius", 15),
    symbol: "♆",
  },
  {
    name: "Pluto",
    position: signAndDegreeToPosition("Aries", 10),
    symbol: "♇",
  },
];

const aspects = [
  { planet1: "Sun", planet2: "Mercury", type: "conjunction" },
  { planet1: "Venus", planet2: "Mars", type: "opposition" },
  { planet1: "Jupiter", planet2: "Saturn", type: "square" },
  { planet1: "Uranus", planet2: "Neptune", type: "trine" },
];

const LuckyNumberStyles = StyleSheet.create({
  circle: {
    borderRadius: 50,
    height: 30,
    width: 30,
    justifyContent: "center",
    alignItems: "center",
  },
});

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
function SinastrieRelatieOthers({ navigation, route }) {
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
  const { analysisData, analysisIndex } = route.params || {}; // Extrage datele persoanei din navigare
  const [userD, setUserD] = useState(analysisData || {});
  const [personOne, setPersonOne] = useState(analysisData?.person1 || {});
  const [personTwo, setPersonTwo] = useState(analysisData?.person2 || {});
  const [currentUserData, setCurrentUserData] = useState({});
  const [UData, setUData] = useState({});
  const { language, changeLanguage } = useLanguage();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoadingBuy, setIsLoadingBuy] = useState(false);

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
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [isPaid, setIsPaid] = useState(analysisData.isPaid || false); // Starea pentru achiziție
  const [isModalVisible, setModalVisible] = useState(false); // Starea pentru afișarea modalului
  const [selectedLanguage, setSelectedLanguage] = useState("ro"); // Limba implicită

  const generatePDFContent = () => {
    const tabs = [
      "Harmony",
      "Conflict",
      "Contrast",
      "Intense_Aspect",
      "Physical_Compatibility",
      "Emotional_Compatibility",
      "Sexual_Compatibility",
      "Spiritual_Compatibility",
      "Financial_Compatibility",
    ];

    const tabTitles = {
      Harmony: "Aspecte Armonioase",
      Conflict: "Aspecte Conflictuale",
      Contrast: "Aspecte Contrastante",
      Intense_Aspect: "Aspecte Intense",
      Physical_Compatibility: "Compatibilitate Fizică",
      Emotional_Compatibility: "Compatibilitate Emoțională",
      Sexual_Compatibility: "Compatibilitate Sexuală",
      Spiritual_Compatibility: "Compatibilitate Spirituală",
      Financial_Compatibility: "Compatibilitate Financiară",
    };

    const sections = tabs
      .map((tab) => {
        const data = getTabDataForPDF(tab); // Folosește funcția pentru a obține datele pentru fiecare tab
        if (!data || data.length === 0) return ""; // Dacă nu există date, trece peste

        const sectionContent = data
          .map(
            (item) =>
              `<div class="aspect">
                 <h3>${item.reading?.[0]?.title || "Titlu indisponibil"}</h3>
                 <p>${
                   item.reading?.[0]?.description || "Descriere indisponibilă"
                 }</p>
               </div>`
          )
          .join("");

        return `
          <div class="section">
            <h1>${tabTitles[tab] || tab}</h1>
            ${sectionContent}
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
              line-height: 1.6;
              padding: 20px;
            }
            h1, h2, h3, h4 {
              color: #4CAF50;
              text-align: center;
            }
            .section {
              margin: 20px 0;
            }
            .aspect {
              margin: 10px 0;
            }
            img {
              display: block;
              margin: 20px auto;
              border: 1px solid #ddd;
              border-radius: 10px;
              max-width: 300px;
            }
          </style>
        </head>
        <body>
          <h1>Raport de Compatibilitate</h1>
          <div class="person-info">
            <div class="person">
              <h3>${personOne?.full_name || "Nume persoană 1"}</h3>
              <p>Data nașterii: ${personOne?.day}-${personOne?.month}-${
      personOne?.year
    }</p>
              <p>Ora nașterii: ${personOne?.hour}:${personOne?.min}</p>
              <p>Locul nașterii: ${personOne?.place}</p>
              <p>Gen: ${personOne?.gender}</p>
              ${
                wheelImage?.base64ImageP1
                  ? `<img src="data:image/svg+xml;base64,${base64.encode(
                      wheelImage.base64ImageP1
                    )}" alt="Astrogramă Natală - P1" />`
                  : "<p>Astrogramă natală nu este disponibilă.</p>"
              }
            </div>
            <div class="person">
              <h3>${personTwo?.full_name || "Nume persoană 2"}</h3>
              <p>Data nașterii: ${personTwo?.day}-${personTwo?.month}-${
      personTwo?.year
    }</p>
              <p>Ora nașterii: ${personTwo?.selectedTime}</p>
              <p>Locul nașterii: ${personTwo?.place}</p>
              <p>Gen: ${personTwo?.gender}</p>
              ${
                wheelImage?.base64ImageP2
                  ? `<img src="data:image/svg+xml;base64,${base64.encode(
                      wheelImage.base64ImageP2
                    )}" alt="Astrogramă Natală - P2" />`
                  : "<p>Astrogramă natală nu este disponibilă.</p>"
              }
            </div>
          </div>
          ${sections}
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


  const handleDownloadPDF = async () => {
    try {
      console.log("Generare PDF în curs...");
      const htmlContent = generatePDFContent();
  
      // Generează PDF-ul
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      console.log("PDF generat:", uri);
  
      if (Platform.OS === "android") {
        if (Platform.Version < 29) {
          // Pentru Android 10 și mai vechi: salvare automată în documentDirectory
          const fileUri = `${FileSystem.documentDirectory}RaportAnaliza.pdf`;
          await FileSystem.copyAsync({ from: uri, to: fileUri });
          Alert.alert("Fișier salvat", `PDF-ul a fost salvat cu succes la: ${fileUri}`);
          console.log("Fișier salvat cu succes:", fileUri);
        } else {
          // Pentru Android 11 și mai nou: solicită permisiuni și permite alegerea directorului
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
        // Pe iOS: deschidem share sheet pentru ca utilizatorul să aleagă ce face cu fișierul
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

  //ACHIZITIONARE SINASTRIE

  const handlePayment = async (purchaseDetails = null) => {
    const runId = `pay_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    const pfx = `[PAYMENT][SinastrieRelatieOthers][${runId}]`;
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
        analysisId: analysisData?.id || userD?.id || "",
        analysisType: analysisData?.type || userD?.type || "othersSinastry",
      };
  
      // 1) Creează PaymentIntent cu capture_method: "manual"
      const createPaymentIntentFn = httpsCallable(functions, createPaymentIntentTest);
      console.log("📡 Trimitere către Firebase createPaymentIntent:", {
        currency: "eur",
        productCode: "sinastrie_relatie_others",
        couponCode: resolvedCouponAllowed ? resolvedCouponCode : "",
        firstName: resolvedFirstName,
        lastName: resolvedLastName,
        email: resolvedEmail,
        phone: resolvedPhone,
      });
  
      pLog("calling createPaymentIntent", {
        productCode: "sinastrie_relatie_others",
        currency: "eur",
        couponCode: resolvedCouponAllowed ? resolvedCouponCode : "",
      });
      const resp = await createPaymentIntentFn({
        currency: "eur",
        firstName: resolvedFirstName,
        lastName: resolvedLastName,
        email: resolvedEmail,
        phone: resolvedPhone,
        productCode: "sinastrie_relatie_others",
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
  
      const { clientSecret, transactionId: createdTransactionId } = resp.data;
      transactionId = String(createdTransactionId || "");
      if (!clientSecret || !transactionId) {
        console.error("❌ Lipsesc datele PaymentIntent:", resp.data);
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
          screenName: "SinastrieRelatieOthers",
          error: initError,
          publicMessage: supportCopy.paymentInitPublicMessage,
          technicalMessage: initError?.message || "initPaymentSheet failed",
          transactionId,
          productCode: "sinastrie_relatie_others",
          analysisId: purchaseContext.analysisId,
          analysisType: purchaseContext.analysisType,
          contactEmail: resolvedEmail,
          contactPhone: resolvedPhone,
          fullName:
            userD?.full_name ||
            analysisData?.full_name ||
            `${resolvedFirstName} ${resolvedLastName}`.trim(),
          extraContext: {
            phase: "initPaymentSheet",
          },
        });
        return;
      }
  
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
          screenName: "SinastrieRelatieOthers",
          error: presentError,
          publicMessage: supportCopy.paymentFlowPublicMessage,
          technicalMessage: presentError?.message || "presentPaymentSheet failed",
          transactionId,
          productCode: "sinastrie_relatie_others",
          analysisId: purchaseContext.analysisId,
          analysisType: purchaseContext.analysisType,
          contactEmail: resolvedEmail,
          contactPhone: resolvedPhone,
          fullName:
            userD?.full_name ||
            analysisData?.full_name ||
            `${resolvedFirstName} ${resolvedLastName}`.trim(),
          extraContext: {
            phase: "presentPaymentSheet",
          },
        });
        return;
      }
      pLog("paymentSheet presented OK (authorized)");
  
      // 4) Generează conținutul PDF
      const pdfHtmlContent = generatePDFContent();
      console.log("📝 Generated PDF HTML content.");
  
      // 5) Trimite emailul cu PDF-ul
      pLog("calling sendPdfEmail");
      const sendPdfEmailFn = httpsCallable(functions, sendPdfEmail);
      const emailResponse = await sendPdfEmailFn({
        email: resolvedEmail, // sau userD.email, după caz
        pdfHtml: pdfHtmlContent,
        fullName: userD.full_name,
      });
      pLog("sendPdfEmail response", emailResponse?.data);
  
      if (emailResponse.data && emailResponse.data.success) {
        // 6) Capturează PaymentIntent (fondurile vor fi reținute definitiv)
        pLog("capturing PaymentIntent", { transactionId });
        const capturePaymentFn = httpsCallable(functions, capturePaymentIntentTest);
        const captureResp = await capturePaymentFn({
          transactionId,
          productCode: "sinastrie_relatie_others",
          firstName: resolvedFirstName,
          lastName: resolvedLastName,
          email: resolvedEmail,
          phone: resolvedPhone,
          ...purchaseContext,
        });
        if (captureResp.data && captureResp.data.captured) {
          pLog("payment captured OK");
  
          // 7) Actualizează analiza ca plătită în personsDataOthers din AsyncStorage
          setIsPaid(true);
          
          // Actualizează și analysisData local pentru afișarea imediată
          const updatedAnalysisData = { ...(analysisData || userD), isPaid: true };
          setUserD(updatedAnalysisData);
          
          const existingOtherDataString = await AsyncStorage.getItem("personsDataOthers");
          let existingOtherData = existingOtherDataString ? JSON.parse(existingOtherDataString) : [];

          const updatedOtherData = markAnalysisPaidInCollection(
            existingOtherData,
            analysisData || userD
          );
          await AsyncStorage.setItem("personsDataOthers", JSON.stringify(updatedOtherData));
          console.log("✅ Analiza din personsDataOthers marcată ca plătită și starea locală actualizată.");
  
          // 8) Creează factura în Oblio via Firebase Functions
          pLog("calling Firebase Oblio invoice function", { transactionId });
          const createOblioInvoiceFn = httpsCallable(functions, "createOblioInvoiceAfterPayment");
          const invoiceResp = await createOblioInvoiceFn({
            transactionId,
            productCode: "sinastrie_relatie_others",
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
        // Dacă trimiterea emailului eșuează, plata nu se capturează
        showLocalizedSupportErrorAlert({
          language,
          screenName: "SinastrieRelatieOthers",
          publicMessage: supportCopy.pdfEmailFailedPublicMessage,
          technicalMessage:
            emailResponse?.data?.message || "sendPdfEmail returned success=false",
          error: emailResponse?.data || null,
          transactionId,
          productCode: "sinastrie_relatie_others",
          analysisId: purchaseContext.analysisId,
          analysisType: purchaseContext.analysisType,
          contactEmail: resolvedEmail,
          contactPhone: resolvedPhone,
          fullName:
            userD?.full_name ||
            analysisData?.full_name ||
            `${resolvedFirstName} ${resolvedLastName}`.trim(),
          extraContext: {
            phase: "sendPdfEmail",
            emailSuccess: Boolean(emailResponse?.data?.success),
          },
        });
        // Opțional, se poate apela o funcție backend pentru a anula PaymentIntent
      }
    } catch (error) {
      pErr("handlePayment error", error);
      const msg =
        (error && typeof error === "object" && error.message ? String(error.message) : "") ||
        "Nu s-a putut procesa plata sau factura.";
      showLocalizedSupportErrorAlert({
        language,
        screenName: "SinastrieRelatieOthers",
        error,
        publicMessage: supportCopy.paymentFlowPublicMessage,
        technicalMessage: msg,
        transactionId,
        productCode: "sinastrie_relatie_others",
        analysisId: analysisData?.id || userD?.id || "",
        analysisType: analysisData?.type || userD?.type || "othersSinastry",
        contactEmail: resolvedEmail,
        contactPhone: resolvedPhone,
        fullName:
          userD?.full_name ||
          analysisData?.full_name ||
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
  
  
  
  const isValidBase64 = (base64) => {
    const regex = /^[A-Za-z0-9+/]+={0,2}$/;
    return regex.test(base64);
  };

  const getActiveTabData = () => {
    switch (activeTab) {
      case "Harmony":
        return userD?.synastry?.harmoniousAspectReading?.data || [];
      case "Conflict":
        return userD?.synastry?.conflictingAspectReading?.data || [];
      case "Contrast":
        return userD?.synastry?.contrastingAspectReading?.data || [];
      case "Intense_Aspect":
        return userD?.synastry?.intenseCompatibility?.data || [];
      case "Physical_Compatibility":
        return userD?.synastry?.physicalCompatibility?.data || [];
      case "Emotional_Compatibility":
        return userD?.synastry?.emotionalCompatibility?.data || [];
      case "Sexual_Compatibility":
        return userD?.synastry?.sexualCompatibility?.data || [];
      case "Spiritual_Compatibility":
        return userD?.synastry?.spiritualCompatibility?.data || [];
      case "Financial_Compatibility":
        return userD?.synastry?.financialCompatibility?.data || [];
      default:
        return []; // sau returnează un set de date implicit dacă este necesar
    }
  };

  const getTabDataForPDF = (tab) => {
    switch (tab) {
      case "Harmony":
        return userD?.synastry?.harmoniousAspectReading?.data || [];
      case "Conflict":
        return userD?.synastry?.conflictingAspectReading?.data || [];
      case "Contrast":
        return userD?.synastry?.contrastingAspectReading?.data || [];
      case "Intense_Aspect":
        return userD?.synastry?.intenseCompatibility?.data || [];
      case "Physical_Compatibility":
        return userD?.synastry?.physicalCompatibility?.data || [];
      case "Emotional_Compatibility":
        return userD?.synastry?.emotionalCompatibility?.data || [];
      case "Sexual_Compatibility":
        return userD?.synastry?.sexualCompatibility?.data || [];
      case "Spiritual_Compatibility":
        return userD?.synastry?.spiritualCompatibility?.data || [];
      case "Financial_Compatibility":
        return userD?.synastry?.financialCompatibility?.data || [];
      default:
        return []; // sau returnează un set de date implicit dacă este necesar
    }
  };

  const handleNatalChart = async () => {
    try {
      await refreshLocalAnalysisAccessFromEntitlements();
      // Extrage datele persoanei din route.params sau fallback la AsyncStorage
      const personIndex = route.params?.analysisIndex;
      const userDataJson = await AsyncStorage.getItem("personsDataOthers");
      let userData = userDataJson ? JSON.parse(userDataJson) : null;
      
      // Folosește analysisData din route.params dacă este disponibil
      let analiza =
        findMatchingAnalysisByIdentity(userData, analysisData) ||
        analysisData ||
        userData;

      if (!analiza) {
        console.error(
          "Nu există date de analiză disponibile."
        );
        setIsLoading(false);
        return;
      }

      setIsPaid(Boolean(analiza?.isPaid || analysisData?.isPaid));
      setUserD(analiza);

      // Setează datele pentru cele două persoane din sinastrie
      if (analiza.person1 && analiza.person2) {
        setPersonOne(analiza.person1);
        setPersonTwo(analiza.person2);
      }

      const targetLang = normalizeLanguageCode(language);
      const sourceLang = normalizeLanguageCode(analiza.actualLanguageSinastrie);
      const needsLanguageRepair = hasLikelyWrongLanguageSinastrieContent(
        analiza,
        targetLang
      );
      const forceAutoDetectSource = needsLanguageRepair && targetLang === sourceLang;
      if (targetLang && (targetLang !== sourceLang || needsLanguageRepair)) {
        setIsLoading(true);
        if (needsLanguageRepair && targetLang === sourceLang) {
          console.warn("[SinastrieOthers] retranslate_due_to_wrong_language_content", {
            lang: targetLang,
            analysisId: analiza?.id || null,
            wrongLanguageCount: countLikelyWrongLanguageSinastrieContent(
              analiza,
              targetLang
            ),
          });
        }
        const analysisCacheKey = buildAnalysisCacheKey("sinastrie_others", {
          id: analiza?.id || "",
          owner_uid: analiza?.owner_uid || "",
          person1_name: analiza?.person1?.full_name || "",
          person1_day: analiza?.person1?.day || "",
          person1_month: analiza?.person1?.month || "",
          person1_year: analiza?.person1?.year || "",
          person2_name: analiza?.person2?.full_name || "",
          person2_day: analiza?.person2?.day || "",
          person2_month: analiza?.person2?.month || "",
          person2_year: analiza?.person2?.year || "",
        });

        let usedCache = false;
        const cachedPatch = await getCachedTranslationPatch(
          analysisCacheKey,
          targetLang
        );
        if (cachedPatch) {
          const cachedAnaliza = applySinastrieTranslationPatch(analiza, cachedPatch);
          if (cachedAnaliza) {
            const cacheLooksInvalid = hasLikelyWrongLanguageSinastrieContent(
              cachedAnaliza,
              targetLang
            );
            if (cacheLooksInvalid) {
              console.warn("[SinastrieOthers] invalid translation cache detected", {
                to: targetLang,
                analysisId: cachedAnaliza?.id || null,
              });
              await removeCachedTranslationPatch(analysisCacheKey, targetLang);
            } else {
              usedCache = true;
              analiza = cachedAnaliza;
              setUserD(cachedAnaliza);
              if (cachedAnaliza.person1 && cachedAnaliza.person2) {
                setPersonOne(cachedAnaliza.person1);
                setPersonTwo(cachedAnaliza.person2);
              }
              if (userData && personIndex !== undefined) {
                userData = cachedAnaliza;
                await AsyncStorage.setItem(
                  "personsDataOthers",
                  JSON.stringify(userData)
                );
              }
              console.log("[SinastrieOthers] translation cache hit", {
                to: targetLang,
              });
            }
          }
        }

        if (!usedCache) {
          console.log("[SinastrieOthers] translation cache miss -> retranslate", {
            to: targetLang,
            analysisId: analiza?.id || null,
          });
          try {
          // Creează o copie profundă pentru a evita mutații parțiale la fallback/error
          const translatedAnaliza = JSON.parse(JSON.stringify(analiza));

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
            sourceLang || translatedAnaliza.actualLanguageSinastrie;
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
            const categoryData = translatedAnaliza.synastry?.[category]?.data;
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
                      console.log("[SinastrieOthers] translation progress", {
                        to: targetLang,
                        analysisId: translatedAnaliza?.id || null,
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
            hasLikelyWrongLanguageSinastrieContent(translatedAnaliza, targetLang);
          const canPersistTranslation =
            failedDescriptionCount === 0 && !hasWrongLanguageAfterTranslation;

          if (!canPersistTranslation) {
            console.warn("[SinastrieOthers] translation incomplete, keeping source", {
              to: targetLang,
              analysisId: translatedAnaliza?.id || null,
              attemptedDescriptionCount,
              failedDescriptionCount,
              hasWrongLanguageAfterTranslation,
            });
            setUserD(analiza);
          } else {
            // Actualizează limba curentă pentru persoană doar când traducerea pare completă
            translatedAnaliza.actualLanguageSinastrie = targetLang;

            const translationPatch = extractSinastrieTranslationPatch(
              translatedAnaliza,
              targetLang
            );
            await setCachedTranslationPatch(
              analysisCacheKey,
              targetLang,
              translationPatch
            );
            console.log("[SinastrieOthers] translation cache saved", {
              to: targetLang,
              analysisId: translatedAnaliza?.id || null,
            });

            // Actualizează analiza tradusă în AsyncStorage dacă este cazul
            if (userData && personIndex !== undefined) {
              userData = translatedAnaliza;
              await AsyncStorage.setItem(
                "personsDataOthers",
                JSON.stringify(userData)
              );
            }

            // Setează analiza tradusă în starea locală
            analiza = translatedAnaliza;
            setUserD(translatedAnaliza);
            
            // Actualizează și persoanele traduse
            if (translatedAnaliza.person1 && translatedAnaliza.person2) {
              setPersonOne(translatedAnaliza.person1);
              setPersonTwo(translatedAnaliza.person2);
            }
          }
          } catch (translationError) {
          console.warn("[SinastrieOthers] translation aborted/fallback", {
            to: targetLang,
            analysisId: analiza?.id || null,
            code: translationError?.code || "",
            message:
              translationError?.message || String(translationError || "unknown"),
          });
          if (translationError?.code !== "TRANSLATION_ABORTED_DEGRADED") {
            Alert.alert("Eroare", "A apărut o problemă la traducerea datelor.");
          }
          setUserD(analiza); // Fallback la datele existente
          } finally {
          setIsLoading(false);
          }
        }
      } else {
        console.log("[SinastrieOthers] translation skipped (same language)", {
          lang: targetLang || sourceLang || analiza?.actualLanguageSinastrie,
          analysisId: analiza?.id || null,
        });
        setUserD(analiza); // Folosește datele existente dacă traducerea nu este necesară
      }

      // Procesează graficele natale
      if (analiza.synastry?.natalWheelChart?.data) {
        const svgElementsP1 = parseSVG(
          analiza.synastry.natalWheelChart.data.p1.svg
        );
        const svgElementsP2 = parseSVG(
          analiza.synastry.natalWheelChart.data.p2.svg
        );
        setSvgData({ svgElementsP1, svgElementsP2 });

        const base64ImageP1 = base64.decode(
          analiza.synastry.natalWheelChart.data.p1.base64_image.replace(
            "data:image/svg+xml;base64,",
            ""
          )
        );
        const base64ImageP2 = base64.decode(
          analiza.synastry.natalWheelChart.data.p2.base64_image.replace(
            "data:image/svg+xml;base64,",
            ""
          )
        );

        setWheelImage({ base64ImageP1, base64ImageP2 });
      }

      // Procesează aspectele astrogramei
      const aspectsP1 = analiza.synastry?.aspect?.data?.p1_p2_aspect?.aspects;
      const aspectsP2 = analiza.synastry?.aspect?.data?.p2_p1_aspect?.aspects;
      console.log("aspectsP1", aspectsP1);
      console.log("aspectsP2", aspectsP2);
      setAspectsData(
        analiza.synastry?.aspect ? { aspectsP1, aspectsP2 } : null
      );

      // Procesează pozițiile planetare
      const planetaryP1 = analiza.synastry?.planetaryPositions?.data?.p1_data;
      const planetaryP2 = analiza.synastry?.planetaryPositions?.data?.p2_data;
      setPlanetaryData(
        analiza.synastry?.planetaryPositions
          ? { planetaryP1, planetaryP2 }
          : null
      );

      // Procesează cuspidele caselor
      const housesP1 = analiza.synastry?.houseCusps?.data?.p1_data;
      const housesP2 = analiza.synastry?.houseCusps?.data?.p2_data;
      setHouseCusps(
        analiza.synastry?.houseCusps ? { housesP1, housesP2 } : null
      );

      console.log("Date procesate cu succes pentru sinastria între:", analiza.person1?.full_name, "și", analiza.person2?.full_name);

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
  const htmlContent = `
    <html>
      <body>
        <div><img src={${wheelImage}}  /></div>
      </body>
    </html>
  `;

  const Header1 = (
    <View>
      <View style={[styles.headerContainer]}></View>

      {wheelImage && (
        <SvgComponent
          svgBase64={wheelImage.base64ImageP2}
          width="480"
          height="480"
        />
      )}
    </View>
  );

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

  //Traducere inline text

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

  const activeData = getActiveTabData(); // Obține datele pentru tabul activ
  console.log("Active Tab:", activeTab);
  console.log("Active Data:", activeData);
  console.log("UserD synastry:", userD?.synastry);

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
              <ScrollView>
                <View style={[styles.defaultContainer]}>
                  <View>
                    {wheelImage && (
                      <SvgComponent
                        svgBase64={wheelImage.base64ImageP1}
                        width="430"
                        height="430"
                      />
                    )}
                  </View>
                  <Divider style={{ marginTop: "0%" }} />
                  <View style={{ flex: 1, flexDirection: "row" }}>
                    <View style={{ flexDirection: "column", width: "55%" }}>
                      <View style={styles.horoscopeTodayContainer}>
                        <Text style={[styles.textTitles, textStyles.goldenTextBold, { fontSize: 22 }]}>{personOne?.full_name}</Text>
                      </View>
                      <View style={styles.horoscopeTodayContainer}>
                        <Text style={[styles.textDescription, textStyles.goldenText, { marginTop: 0 }]}>{personOne?.day} - {personOne?.month} - {personOne?.year}</Text>
                      </View>
                      <View style={styles.horoscopeTodayContainer}>
                        <Text style={[styles.textDescription, textStyles.goldenText, { marginTop: 0 }]}>{personOne?.hour}:{personOne?.min}</Text>
                      </View>
                      <View style={styles.horoscopeTodayContainer}>
                        <Text style={[styles.textDescription, textStyles.goldenText, { marginTop: 0 }]}>{personOne?.place}</Text>
                      </View>
                      <View style={styles.horoscopeTodayContainer}>
                        <Text style={[styles.textDescription, textStyles.goldenText, { marginTop: 0 }]}>{personOne?.gender}</Text>
                      </View>
                    </View>
                    <View style={{ flexDirection: "column", width: "55%" }}>
                      <View style={styles.horoscopeTodayContainer}>
                        <Text style={[styles.textTitles, textStyles.goldenTextBold, { fontSize: 22 }]}>{personTwo?.full_name}</Text>
                      </View>
                      <View style={styles.horoscopeTodayContainer}>
                        <Text style={[styles.textDescription, textStyles.goldenText, { marginTop: 0 }]}>{personTwo?.day} - {personTwo?.month} - {personTwo?.year}</Text>
                      </View>
                      <View style={styles.horoscopeTodayContainer}>
                        <Text style={[styles.textDescription, textStyles.goldenText, { marginTop: 0 }]}>{personTwo?.selectedTime}</Text>
                      </View>
                      <View style={styles.horoscopeTodayContainer}>
                        <Text style={[styles.textDescription, textStyles.goldenText, { marginTop: 0 }]}>{personTwo?.place}</Text>
                      </View>
                      <View style={styles.horoscopeTodayContainer}>
                        <Text style={[styles.textDescription, textStyles.goldenText, { marginTop: 0 }]}>{personTwo?.gender}</Text>
                      </View>
                    </View>
                  </View>
                </View>
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
                            {activeData && Array.isArray(activeData) && activeData.map((aspect, index) => (
                              <View key={index}>
                                {aspect.reading && Array.isArray(aspect.reading) && aspect.reading.map((read, readIndex) => (
                                  <View key={readIndex} style={{ marginTop: 20 }}>
                                    <Text style={[styles.textTitles, textStyles.goldenTextBold, { fontSize: 20, marginBottom:"5%" }]}>
                                      {read?.title}
                                    </Text>
                                    <Text style={[styles.textDescription, textStyles.goldenText, { marginTop: 0, color:"#bfa76a" }]}>
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
                            {activeData && Array.isArray(activeData) && activeData.length > 0 &&
                              activeData[0]?.reading && Array.isArray(activeData[0]?.reading) && activeData[0]?.reading?.length > 0 && (
                                <View>
                                  <Text style={[styles.textTitles, textStyles.goldenTextBold, { fontSize: 16 }]}>
                                    {activeData[0].reading[0]?.title}
                                  </Text>
                                  <Text style={[styles.textDescription, textStyles.goldenText, { marginTop: 0, color:"#bfa76a" }]}>
                                    {activeData[0].reading[0]?.description}
                                  </Text>
                                </View>
                              )}
                            <Text style={[styles.textDescription, textStyles.goldenText, { marginTop: 0, color:"#bfa76a" }]}>
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
                  </View>
                  <View style={{ paddingVertical: 10 }} />
                </ShowFromTop>
              </ScrollViewFadeFirst>
            ) : (
              <ShowFromTop>
                <AspectTableSinastrieOthers
                  houseCusps={houseCusps}
                  planetaryData={planetaryData}
                  aspects={aspectsData}
                  userD={personOne}
                  currentUserData={personTwo}
                />
              </ShowFromTop>
            )}
          </View>
        </ImageBackground>
      </MainContainer>
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
    </>
  );
}

const styles = StyleSheet.create({
  // Stil pentru textul de conținut parțial
  partialContent: {
    fontSize: 14,
    color: "#F0F0F0",
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

export default SinastrieRelatieOthers;

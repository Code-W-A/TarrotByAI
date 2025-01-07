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

import { daily } from "../../../utils/daily";
import AstroChart from "../../../components/Astral/components/AstroChart";
import SpaceSky from "../../../components/Astral/components/space-sky";
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
import { btoa, atob } from "react-native-quick-base64";
import base64 from "react-native-base64";
import TestSvg from "../../../../assets/base64.svg";

import localGif from "../../../../assets/constelatii.gif";
import { Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MyTopBar from "../../../components/Astral/components/TopBar";
import AspectTable from "../../../components/Astral/components/AspectTable";
import i18n from "../../../../i18n";
import { useLanguage } from "../../../context/LanguageContext";
import { handleToTranslate } from "../../../utils/AstralUtils/fetchGPTData";
import LoadingOverlay from "../../../components/Astral/components/zodiac/LoadingOverlay";
import PurchaseModal from "../../../components/Astral/components/PurchaseModal ";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { StorageAccessFramework } from "expo-file-system";
import { Button } from "../../../components/commonButton";
import { useStripe } from "@stripe/stripe-react-native";
import { getFunctions, httpsCallable } from "firebase/functions";
import {
  handleTranslateJSXText,
  useTranslate,
  useTranslation,
} from "../../../utils/translateUtil";

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

/**
 * @param navigation {object}
 * @returns {*}
 * @constructor
 */
function AstrogramaNatala({ navigation, route }) {
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
  const [userD, setUserD] = useState({});
  const [visible, setVisible] = useState(false);
  const { language, changeLanguage, userData, setUserData } = useLanguage();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoadingBuy, setIsLoadingBuy] = useState(false);
  const { isPaid: paidIs } = route.params || {}; // Extrage datele persoanei din navigare

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

  // plata stripe sistem

  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en"); // Limba implicită

  const [isPaid, setIsPaid] = useState(paidIs || false); // Simulează starea de plată
  const [partialContent, setPartialContent] = useState(
    "Aceasta este o secțiune limitată din interpretarea astrogramei tale. Pentru a accesa interpretarea completă, finalizează achiziția."
  );
  const [fullContent, setFullContent] = useState(
    "Aceasta este interpretarea completă a astrogramei tale. Include toate detaliile despre aspectele astrologice, case și planete relevante."
  );
  // const generateFullInterpretation = async (selectedLanguage, userData) => {
  //   try {
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

  //     for (const category of categories) {
  //       userData[category] = await handleToTranslate(
  //         userData[category],
  //         selectedLanguage,
  //         userData.actualLanguageAstrograma
  //       );
  //     }

  //     setUserData(userData);

  //     const content = categories
  //       .map((category) => `${category}: ${userData[category]}`)
  //       .join("\n\n");
  //     setFullContent(content);

  //     await AsyncStorage.setItem("userData", JSON.stringify(userData));
  //   } catch (error) {
  //     console.error("Eroare la generarea interpretării complete:", error);
  //   }
  // };

  // const handleDismissModal = () => {
  //   setModalVisible(false);
  // };

  // const handleConfirmPurchase = async () => {
  //   console.log("is paying...");
  //   setIsPaid(!isPaid);
  // };

  const generatePDFContent = () => {
    const natalWheelChart = userD.natalData?.data?.svg; // Obține SVG-ul natal wheel
    // Funcție de generare a secțiunilor bazată pe `userD.generalSignTextData`
    const generateSignSections = () => {
      return Object.keys(userD.generalSignTextData)
        .map((key) => {
          const planetData = userD.generalSignTextData[key].data; // Accesăm obiectul "data"
          return `
            <div style="margin-bottom: 20px;">
              <h3 style="color: #4CAF50; margin-top: 20px;">
                ${planetData.planet_name} is in ${planetData.sign_name}
              </h3>
              <p style="color: #333;">
                ${planetData.report}
              </p>
            </div>
          `;
        })
        .join("");
    };

    // Funcție de generare a secțiunilor bazată pe `userD.generalHouseTextData`
    const generateHouseSections = () => {
      return Object.keys(userD.generalHouseTextData)
        .map((key) => {
          const houseData = userD.generalHouseTextData[key].data; // Accesăm obiectul "data"
          return `
            <div style="margin-bottom: 20px;">
              <h3 style="color: #4CAF50;; margin-top: 20px;">
                ${houseData.planet_name} is in the ${houseData.house}th house
              </h3>
              <p style="color: #333;">
                ${houseData.report}
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
        <h2>Diagrama Natală</h2>
        ${
          natalWheelChart
            ? natalWheelChart
            : "<p>Diagrama natală nu este disponibilă.</p>"
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

      if (Platform.OS === "android" && Platform.Version < 29) {
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
    } catch (error) {
      console.error("Eroare la salvarea fișierului:", error);
      Alert.alert("Eroare", "Nu s-a putut salva fișierul.");
    }
  };

  // plata stripe sistem

  // const isValidBase64 = (base64) => {
  //   const regex = /^[A-Za-z0-9+/]+={0,2}$/;
  //   return regex.test(base64);
  // };

  const translateGeneralSignTextData = async (userData, language) => {
    try {
      // Iterăm prin toate cheile din generalSignTextData
      const translatedData = await Promise.all(
        Object.keys(userData.generalSignTextData).map(async (key) => {
          const planetData = userData.generalSignTextData[key].data;

          // Traducem  și raportul
          const translatedReport = await handleToTranslate(
            planetData.report,
            language,
            userData.actualLanguageAstrograma
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

      // Actualizăm userData cu datele traduse
      translatedData.forEach(({ key, data }) => {
        userData.generalSignTextData[key].data = data;
      });

      console.log("Traducere finalizată pentru generalSignTextData.");
    } catch (error) {
      console.error("Eroare la traducerea generalSignTextData:", error);
    }
  };

  const translateGeneralHouseTextData = async (userData, language) => {
    try {
      // Iterăm prin toate cheile din generalHouseTextData
      const translatedData = await Promise.all(
        Object.keys(userData.generalHouseTextData).map(async (key) => {
          const houseData = userData.generalHouseTextData[key].data;

          // Traducem raportul

          const translatedReport = await handleToTranslate(
            houseData.report,
            language,
            userData.actualLanguageAstrograma
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

      // Actualizăm userData cu datele traduse
      translatedData.forEach(({ key, data }) => {
        userData.generalHouseTextData[key].data = data;
      });

      console.log("Traducere finalizată pentru generalHouseTextData.");
    } catch (error) {
      console.error("Eroare la traducerea generalHouseTextData:", error);
    }
  };

  const handleNatalChart = async () => {
    try {
      const userDataJson = await AsyncStorage.getItem("userData");
      const userData = userDataJson ? JSON.parse(userDataJson) : null;

      console.log("userData.aspectsData...", userData.generalSignTextData);
      console.log(
        "userData.aspectsData...",
        userData.generalSignTextData.Chiron.data.planet_name
      );
      console.log(
        "userData.aspectsData...",
        userData.generalSignTextData.Chiron.data.sign_name
      );
      console.log(
        "userData.aspectsData...",
        userData.generalSignTextData.Chiron.data.report
      );

      if (!userData) {
        console.log(
          "Nu există date de utilizator disponibile în AsyncStorage."
        );
        setIsLoading(false);
        return;
      }
      console.log("data....here", language);
      console.log("data....here", userData.actualLanguageAstrograma);

      if (language !== userData.actualLanguageAstrograma) {
        setIsLoading(true);
        console.log("language is not in userData....", language);
        console.log(
          "language is not in userData....",
          userData.actualLanguageAstrograma
        );

        let translationFailed = false; // Flag pentru a urmări dacă traducerea a eșuat
        const translatedUserData = JSON.parse(JSON.stringify(userData)); // Creează o copie profundă a datelor

        try {
          translatedUserData.actualLanguageAstrograma = language;

          const ascendantData = await handleToTranslate(
            translatedUserData.ascendantData.data.result,
            language,
            translatedUserData.actualLanguageAstrograma
          );
          translatedUserData.ascendantData.data.result = ascendantData;
          await delay(2000); // delay de 2 secunde

          await translateGeneralSignTextData(translatedUserData, language);
          await delay(2000); // delay de 2 secunde

          // Simulăm o eroare la ultima traducere

          await translateGeneralHouseTextData(translatedUserData, language);
          await delay(2000); // delay de 2 secunde

          console.log(
            "after translate user data....",
            translatedUserData.actualLanguageAstrograma
          );

          // Salvăm doar dacă traducerea este completă
          await AsyncStorage.setItem(
            "userData",
            JSON.stringify(translatedUserData)
          );
        } catch (error) {
          console.error("Eroare în procesul de traducere:", error);
          translationFailed = true;
        }

        if (translationFailed) {
          console.log(
            "Traducerea a eșuat. Datele originale sunt păstrate și nemodificate."
          );
          // Datele originale rămân neschimbate, iar traducerea incompletă nu se aplică
        }
      }

      // traducere INITIALA FARA HANDLE ERROR
      // if (language != userData.actualLanguageAstrograma) {
      //   setIsLoading(true);
      //   console.log("language is not in userData....", language);
      //   console.log(
      //     "language is not in userData....",
      //     userData.actualLanguageAstrograma
      //   );
      //   userData.actualLanguageAstrograma = language;

      //   const ascendantData = await handleToTranslate(
      //     userData.ascendantData.data.result,
      //     language,
      //     userData.actualLanguageAstrograma
      //   );
      //   userData.ascendantData.data.result = ascendantData;
      //   await delay(2000); // delay de 1 secundă

      //   await translateGeneralSignTextData(userData, language);
      //   await delay(2000); // delay de 1 secundă
      //   await translateGeneralHouseTextData(userData, language);
      //   await delay(2000); // delay de 1 secundă

      //   // console.log(
      //   //   "after translate user data....",
      //   //   userData.spiritualitateCategory
      //   // );
      //   // console.log(
      //   //   "after translate user data....",
      //   //   userData.horoscopeResultsDaily
      //   // );
      //   console.log(
      //     "after translate user data....",
      //     userData.actualLanguageAstrograma
      //   );

      //   await AsyncStorage.setItem("userData", JSON.stringify(userData));
      // }

      setUserD(userData);
      // const {
      //   full_name,
      //   day,
      //   month,
      //   year,
      //   hour,
      //   min,
      //   sec,
      //   gender,
      //   place,
      //   lat,
      //   lon,
      //   tzone,
      // } = userData;

      // const urls = {
      //   natalWheelChart:
      //     "https://astroapi-4.divineapi.com/western-api/v1/natal-wheel-chart",
      //   aspectTable:
      //     "https://astroapi-4.divineapi.com/western-api/v2/aspect-table",
      //   planetaryPositions:
      //     "https://astroapi-4.divineapi.com/western-api/v1/planetary-positions",
      //   houseCusps:
      //     "https://astroapi-4.divineapi.com/western-api/v1/house-cusps",
      //   moonPhases:
      //     "https://astroapi-4.divineapi.com/western-api/v1/moon-phases",
      //   ascendantReport:
      //     "https://astroapi-4.divineapi.com/western-api/v1/ascendant-report",
      // };

      // const results = await Promise.all(
      //   Object.keys(urls).map((key) =>
      //     fetchAstroData(
      //       urls[key],
      //       full_name,
      //       day,
      //       month,
      //       year,
      //       hour,
      //       min,
      //       sec,
      //       gender,
      //       place,
      //       lat,
      //       lon,
      //       tzone
      //     )
      //   )
      // );

      // const [
      //   natalData,
      //   aspectsData,
      //   planetaryData,
      //   cuspsData,
      //   moonPhaseData,
      //   ascendantData,
      // ] = results;

      if (userData.natalData && userData.natalData.data) {
        const svgElements = parseSVG(userData.natalData.data.svg);
        setSvgData(svgElements);
        const base64Image = userData.natalData.data.base64_image.replace(
          "data:image/svg+xml;base64,",
          ""
        );
        setWheelImage(base64.decode(base64Image));
      }

      setAspectsData(userData.aspectsData ? userData.aspectsData.data : null);
      setPlanetaryData(
        userData.planetaryData ? userData.planetaryData.data : null
      );
      setHouseCusps(userData.cuspsData ? userData.cuspsData.data : null);
      setMoonPhase(userData.moonPhaseData ? userData.moonPhaseData.data : null);
      setAscendantReport(
        userData.ascendantData ? userData.ascendantData.data : null
      );
      console.log("test...", userData.cuspsData.data);
      setIsLoading(false);
    } catch (error) {
      console.error(
        "Eroare la preluarea și procesarea astrogramei natale:",
        error
      );
    } finally {
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

  const handlePayment = async () => {
    try {
      const functions = getFunctions();
      const createPaymentIntentAndSave = httpsCallable(
        functions,
        "createPaymentIntentAndSave"
      );

      const response = await createPaymentIntentAndSave({
        amount: 1000, // exemplu: 10.00 USD
        currency: "usd",
        firstName,
        lastName,
        email,
        phone,
        analysisData: userD,
      });

      const { clientSecret, transactionId, docId } = response.data;

      console.log("ClientSecret primit:", clientSecret);
      console.log("ID tranzacție:", transactionId);
      console.log("ID document Firestore:", docId);

      // Inițializăm Payment Sheet
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: "Cristina Zurba tarot", // Adaugă un nume de magazin
      });

      if (!initError) {
        console.log("Payment Sheet inițializat cu succes.");

        // Afișăm Payment Sheet
        const { error: presentError } = await presentPaymentSheet();

        if (!presentError) {
          console.log("Plată procesată. Verificăm statusul...");

          // Verificăm statusul PaymentIntent
          const verifyPaymentIntent = httpsCallable(
            functions,
            "verifyPaymentIntentStatus"
          );

          const statusResponse = await verifyPaymentIntent({ transactionId });

          if (statusResponse.data.status === "succeeded") {
            console.log("Plată confirmată cu succes.");
            Alert.alert(
              "Plată reușită",
              "Achiziția ta a fost procesată cu succes!"
            );

            // Actualizăm isPaid în Firestore
            const updateIsPaid = httpsCallable(
              functions,
              "updateAnalysisIsPaid"
            );

            await updateIsPaid({ docId });

            console.log(
              "Documentul din Firestore actualizat cu isPaid = true."
            );
            setIsPaid(true); // Marchează local achiziția ca plătită
          } else {
            console.error(
              "Plata nu este confirmată. Status:",
              statusResponse.data.status
            );
            Alert.alert(
              "Eroare",
              "Plata nu a fost confirmată. Te rugăm să încerci din nou."
            );
          }
        } else {
          console.error("Eroare la afișarea Payment Sheet:", presentError);
          Alert.alert("Eroare", presentError.message);
        }
      } else {
        console.error("Eroare la inițializarea Payment Sheet:", initError);
        Alert.alert("Eroare", initError.message);
      }
    } catch (error) {
      console.error("Eroare la inițializarea plății:", error);
      Alert.alert("Eroare", "Nu s-a putut procesa achiziția.");
    }
  };

  //Traducere inline text

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
        <LinearGradient
          colors={[
            colors.gradientLogin1,
            colors.gradientLogin1,
            colors.gradientLogin1,
            colors.gradientLogin1,
            colors.gradientLogin1,
            colors.gradientLogin1,
            colors.gradientLogin1,
            colors.gradientLogin1,
            colors.gradientLogin11,
          ]} // Înlocuiește cu culorile gradientului tău
          style={{
            flex: 1,
            paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
          }}
        >
          <SpaceSky />
          <MyTopBar onChangeTab={setSelectedTab} />
          {selectedTab === "natal" ? (
            <ScrollViewFadeFirst element={Header} height={400}>
              <ShowFromTop>
                <View style={[styles.defaultContainer]}>
                  <Divider style={{ marginTop: "5%" }} />
                  <View style={styles.horoscopeTodayContainer}>
                    <H7fontBoldWhite style={styles.textTitles}>
                      {userD.full_name}
                    </H7fontBoldWhite>
                  </View>
                  <View style={styles.horoscopeTodayContainer}>
                    <H8fontBoldWhite
                      style={[styles.textDescription, { marginTop: 0 }]}
                    >
                      {userD.day} - {userD.month} - {userD.year}
                    </H8fontBoldWhite>
                  </View>
                  <View style={styles.horoscopeTodayContainer}>
                    <H8fontBoldWhite
                      style={[styles.textDescription, { marginTop: 0 }]}
                    >
                      {userD.selectedTime}
                    </H8fontBoldWhite>
                  </View>
                  <View style={styles.horoscopeTodayContainer}>
                    <H8fontBoldWhite
                      style={[
                        styles.textDescription,
                        { marginTop: 0, maxWidth: "80%" },
                      ]}
                    >
                      {userD.place}
                    </H8fontBoldWhite>
                  </View>
                  <View style={styles.horoscopeTodayContainer}>
                    <H8fontBoldWhite
                      style={[styles.textDescription, { marginTop: 0 }]}
                    >
                      {userD.gender}
                    </H8fontBoldWhite>
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
                    <H6fontBoldWhite style={styles.textTitles}>
                      {isLoading ? (
                        <ActivityIndicator />
                      ) : (
                        i18n.translate("InterpretareAstrograma")
                      )}
                    </H6fontBoldWhite>
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
                    <H6fontBoldYellow
                      style={[styles.textTitles, { marginTop: "7%" }]}
                    >
                      {personalitateText}
                    </H6fontBoldYellow>
                    <H9fontMediumLightBlack style={styles.textDescription}>
                      {userD.ascendantData.data.result}
                    </H9fontMediumLightBlack>

                    {isPaid && (
                      <View>
                        <H6fontBoldYellow
                          style={[styles.textTitles, { marginTop: "7%" }]}
                        >
                          {signReportText}
                        </H6fontBoldYellow>
                        {Object.keys(userD.generalSignTextData).map((key) => {
                          const planetData =
                            userD.generalSignTextData[key].data; // Accesăm obiectul "data"
                          return (
                            <View key={key} style={{ marginBottom: 20 }}>
                              {/* Titlul planetă + semn zodiacal */}
                              <H8fontBoldYellow
                                style={[styles.textTitles, { marginTop: "7%" }]}
                              >
                                {`${planetData.planet_name} is in ${planetData.sign_name}`}
                              </H8fontBoldYellow>
                              {/* Text descriptiv */}
                              <H9fontMediumLightBlack
                                style={styles.textDescription}
                              >
                                {planetData.report}
                              </H9fontMediumLightBlack>
                            </View>
                          );
                        })}
                      </View>
                    )}
                    {isPaid && (
                      <View>
                        <H6fontBoldYellow
                          style={[styles.textTitles, { marginTop: "7%" }]}
                        >
                          {houseReportText}
                        </H6fontBoldYellow>
                        {Object.keys(userD.generalHouseTextData).map((key) => {
                          const houseData =
                            userD.generalHouseTextData[key].data; // Accesăm obiectul "data"
                          return (
                            <View key={key} style={{ marginBottom: 20 }}>
                              {/* Titlul planetă + casă astrologică */}
                              <H8fontBoldYellow
                                style={[styles.textTitles, { marginTop: "7%" }]}
                              >
                                {`${houseData.planet_name} is in the ${houseData.house}th house`}
                              </H8fontBoldYellow>
                              {/* Text descriptiv */}
                              <H9fontMediumLightBlack
                                style={styles.textDescription}
                              >
                                {houseData.report}
                              </H9fontMediumLightBlack>
                            </View>
                          );
                        })}
                      </View>
                    )}

                    {!isPaid ? (
                      <>
                        <Text style={styles.partialContent}>
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
                          style={{ marginTop: "10%" }}
                        />
                      </>
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
        </LinearGradient>
      </MainContainer>
      {/* Modal pentru selecția limbii */}
      <PurchaseModal
        visible={isModalVisible}
        onDismiss={() => setModalVisible(false)}
        setEmail={setEmail}
        setPhone={setPhone}
        phone={phone}
        email={email}
        firstName={firstName}
        lastName={lastName}
        setLastName={setLastName}
        setFirstName={setFirstName}
        onConfirm={async () => {
          setIsLoadingBuy(true);
          setModalVisible(false);

          try {
            await handlePayment(); // Apelează funcția `handlePayment`
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
    color: "#F0F0F0",
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
    fontSize: 14,
    color: "#F0F0F0",
    marginTop: "5%",
    marginLeft: "3%",
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

export default AstrogramaNatala;

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
import SpaceSky from "../../../components/Astral/components/space-sky";
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
import AspectTableSinastrie from "../../../components/Astral/components/AspectTableSinastrie";
import HorizontalTabSelector from "../../../components/Astral/components/HorizontalTabSelector";
import SvgComponent from "../../../components/Astral/components/SvgComponent";
import PurchaseModal from "../../../components/Astral/components/PurchaseModal ";
import { Button } from "../../../components/commonButton";
import AspectTableSinastrieOthers from "../../../components/Astral/components/AspectTableSinastrieOthers";
import { getFunctions, httpsCallable } from "firebase/functions";
import { StorageAccessFramework } from "expo-file-system";

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
  const [isPaid, setIsPaid] = useState(false); // Starea pentru achiziție
  const [isModalVisible, setModalVisible] = useState(false); // Starea pentru afișarea modalului
  const [selectedLanguage, setSelectedLanguage] = useState("ro"); // Limba implicită
  // const translateSinastryCategories = async (userData, language) => {
  //   const categories = [
  //     "harmoniousAspectReading",
  //     "conflictingAspectReading",
  //     "contrastingAspectReading",
  //     "intenseCompatibility",
  //     "physicalCompatibility",
  //     "emotionalCompatibility",
  //     "sexualCompatibility",
  //     "spiritualCompatibility",
  //     "financialCompatibility",
  //   ];

  //   const translatedData = { ...userData }; // Creează o copie a userData

  //   await Promise.all(
  //     categories.map(async (category) => {
  //       const categoryData = translatedData?.synastry?.[category]?.data;
  //       if (categoryData && Array.isArray(categoryData)) {
  //         await Promise.all(
  //           categoryData.map(async (item) => {
  //             if (item.reading) {
  //               await Promise.all(
  //                 item.reading.map(async (reading) => {
  //                   if (reading.description) {
  //                     reading.description = await handleToTranslate(
  //                       reading.description,
  //                       language,
  //                       userData.actualLanguageSinastrie
  //                     );
  //                   }
  //                   if (reading.title) {
  //                     reading.title = await handleToTranslate(
  //                       reading.title,
  //                       language,
  //                       userData.actualLanguageSinastrie
  //                     );
  //                   }
  //                 })
  //               );
  //             }
  //           })
  //         );
  //       }
  //     })
  //   );

  //   translatedData.actualLanguageSinastrie = language;
  //   return translatedData; // Returnează datele traduse
  // };

  const generatePDFContent = () => {
    const activeDataHtml = isPaid
      ? activeData
          .map(
            (aspect) =>
              `<div class="aspect">
                ${aspect.reading
                  .map(
                    (read) => `
                  <h4>${read.title}</h4>
                  <p>${read.description}</p>
                `
                  )
                  .join("")}
              </div>`
          )
          .join("")
      : `
        <div class="limited-content">
          <h4>${
            activeData?.[0]?.reading?.[0]?.title || "Titlu indisponibil"
          }</h4>
          <p>${
            activeData?.[0]?.reading?.[0]?.description ||
            "Descriere indisponibilă"
          }</p>
          <p class="note">Aceasta este o secțiune limitată din interpretarea sinastriei tale. Achiziționează interpretarea completă pentru a vedea toate informațiile.</p>
        </div>
      `;

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
            .section img {
              display: block;
              margin: 10px auto;
              max-width: 100%;
            }
            .person-info {
              display: flex;
              justify-content: space-between;
              margin-top: 20px;
            }
            .person {
              flex: 1;
              margin: 10px;
              border: 1px solid #ccc;
              padding: 10px;
              border-radius: 5px;
            }
            .person h3 {
              margin-bottom: 10px;
            }
            .aspect {
              margin: 10px 0;
            }
            .note {
              font-style: italic;
              color: red;
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
            </div>
            <div class="person">
              <h3>${personTwo?.full_name || "Nume persoană 2"}</h3>
              <p>Data nașterii: ${personTwo?.day}-${personTwo?.month}-${
      personTwo?.year
    }</p>
              <p>Ora nașterii: ${personTwo?.selectedTime}</p>
              <p>Locul nașterii: ${personTwo?.place}</p>
              <p>Gen: ${personTwo?.gender}</p>
            </div>
          </div>
  
          <div class="section">
            <h2>Astrogramă Natală</h2>
            <img src="data:image/svg+xml;base64,${
              wheelImage?.base64ImageP1
            }" alt="Astrogramă Persoana 1" />
            <img src="data:image/svg+xml;base64,${
              wheelImage?.base64ImageP2
            }" alt="Astrogramă Persoana 2" />
          </div>
  
          <div class="section">
            <h2>Interpretări</h2>
            ${activeDataHtml}
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

      // Verifică dacă permisiunea a fost deja acordată
      const savedPermission = await AsyncStorage.getItem("directoryPermission");
      let directoryUri;

      if (savedPermission) {
        // Folosește permisiunea salvată
        console.log("Permisiunea salvată este utilizată.");
        directoryUri = savedPermission;
      } else {
        // Cere permisiunea utilizatorului
        const permissions =
          await StorageAccessFramework.requestDirectoryPermissionsAsync();

        if (!permissions.granted) {
          Alert.alert(
            "Permisiune refuzată",
            "Trebuie să acorzi permisiunea pentru a salva fișierul în folderul Downloads."
          );
          return;
        }

        // Salvează permisiunea pentru utilizări viitoare
        directoryUri = permissions.directoryUri;
        await AsyncStorage.setItem("directoryPermission", directoryUri);
      }

      // Specifică numele fișierului
      const fileName = "RaportSinastrie.pdf";

      // Citește conținutul PDF-ului generat ca base64
      const base64Content = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Creează fișierul în folderul selectat
      await StorageAccessFramework.createFileAsync(
        directoryUri,
        fileName,
        "application/pdf"
      )
        .then(async (fileUri) => {
          console.log("Fișier creat:", fileUri);

          // Scrie conținutul în fișier
          await FileSystem.writeAsStringAsync(fileUri, base64Content, {
            encoding: FileSystem.EncodingType.Base64,
          });

          Alert.alert(
            "Descărcare completă",
            "PDF-ul a fost salvat cu succes în folderul selectat."
          );
        })
        .catch((error) => {
          console.error("Eroare la crearea fișierului:", error);
          Alert.alert("Eroare", "Nu s-a putut salva fișierul.");
        });
    } catch (error) {
      console.error("Eroare la generarea sau salvarea PDF-ului:", error);
      Alert.alert("Eroare", "A apărut o problemă la generarea fișierului PDF.");
    }
  };

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
        analysisData,
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

  //ACHIZITIONARE SINASTRIE

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
      // Extrage datele persoanei din route.params sau fallback la AsyncStorage
      const personIndex = route.params?.analysisIndex;
      const userDataJson = await AsyncStorage.getItem("personsDataOthers");
      const userData = userDataJson ? JSON.parse(userDataJson) : null;
      console.log("Data....", userData);

      if (!userData || !userData || personIndex === undefined) {
        console.error(
          "Nu există date de utilizator disponibile sau index invalid."
        );
        setIsLoading(false);
        return;
      }

      const analiza = userData[personIndex];

      if (language !== analiza.actualLanguageSinastrie) {
        console.log("Traducere necesară, limbă curentă:", language);
        setIsLoading(true);

        // Creează o copie temporară a datelor persoanei
        const translatedAnaliza = { ...analiza };

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

        // Parcurge și traduce fiecare categorie
        await Promise.all(
          categories.map(async (category) => {
            const categoryData = translatedAnaliza.synastry?.[category]?.data;
            if (categoryData && Array.isArray(categoryData)) {
              await Promise.all(
                categoryData.map(async (item) => {
                  if (item.reading) {
                    await Promise.all(
                      item.reading.map(async (reading) => {
                        if (reading.description) {
                          reading.description = await handleToTranslate(
                            reading.description,
                            language,
                            translatedAnaliza.actualLanguageSinastrie
                          );
                        }
                        if (reading.title) {
                          reading.title = await handleToTranslate(
                            reading.title,
                            language,
                            translatedAnaliza.actualLanguageSinastrie
                          );
                        }
                      })
                    );
                  }
                })
              );
            }
          })
        );

        // Actualizează limba curentă pentru persoană
        translatedAnaliza.actualLanguageSinastrie = language;

        // Actualizează persoana tradusă în `userData`
        userData[personIndex] = translatedAnaliza;

        // Salvează datele actualizate în AsyncStorage
        await AsyncStorage.setItem(
          "personsDataOthers",
          JSON.stringify(userData)
        );

        // Setează persoana tradusă în starea locală
        setUserD(translatedAnaliza);
      } else {
        console.log("analiza....alta", analiza);
        console.log("analiza....alta", analiza.person2);
        console.log("analiza....alta", analiza.synastry);

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

      console.log("Date procesate cu succes pentru persoana:", person);

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

  if (isLoading) {
    return <LoadingOverlay />;
  }

  if (isLoadingBuy) {
    return <LoadingOverlay isLoadingBuy={isLoadingBuy} />;
  }

  const activeData = getActiveTabData(); // Obține datele pentru tabul activ

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
                      <H8fontMediumWhite style={styles.textTitles}>
                        {personOne?.full_name}
                      </H8fontMediumWhite>
                    </View>
                    <View style={styles.horoscopeTodayContainer}>
                      <H8fontMediumWhite
                        style={[styles.textDescription, { marginTop: 0 }]}
                      >
                        {personOne?.day} - {personOne?.month} -{" "}
                        {personOne?.year}
                      </H8fontMediumWhite>
                    </View>
                    <View style={styles.horoscopeTodayContainer}>
                      <H8fontMediumWhite
                        style={[styles.textDescription, { marginTop: 0 }]}
                      >
                        {personOne?.hour}:{personOne?.min}
                      </H8fontMediumWhite>
                    </View>
                    <View style={styles.horoscopeTodayContainer}>
                      <H8fontMediumWhite
                        style={[
                          styles.textDescription,
                          { marginTop: 0, maxWidth: "80%" },
                        ]}
                      >
                        {personOne?.place}
                      </H8fontMediumWhite>
                    </View>
                    <View style={styles.horoscopeTodayContainer}>
                      <H8fontMediumWhite
                        style={[styles.textDescription, { marginTop: 0 }]}
                      >
                        {personOne?.gender}
                      </H8fontMediumWhite>
                    </View>
                  </View>
                  <View style={{ flexDirection: "column", width: "55%" }}>
                    <View style={styles.horoscopeTodayContainer}>
                      <H7fontBoldWhite style={styles.textTitles}>
                        {personTwo?.full_name}
                      </H7fontBoldWhite>
                    </View>
                    <View style={styles.horoscopeTodayContainer}>
                      <H8fontMediumWhite
                        style={[styles.textDescription, { marginTop: 0 }]}
                      >
                        {personTwo?.day} - {personTwo?.month} -{" "}
                        {personTwo?.year}
                      </H8fontMediumWhite>
                    </View>
                    <View style={styles.horoscopeTodayContainer}>
                      <H8fontMediumWhite
                        style={[styles.textDescription, { marginTop: 0 }]}
                      >
                        {personTwo?.selectedTime}
                      </H8fontMediumWhite>
                    </View>
                    <View style={styles.horoscopeTodayContainer}>
                      <H8fontMediumWhite
                        style={[
                          styles.textDescription,
                          { marginTop: 0, maxWidth: "80%" },
                        ]}
                      >
                        {personTwo?.place}
                      </H8fontMediumWhite>
                    </View>
                    <View style={styles.horoscopeTodayContainer}>
                      <H8fontMediumWhite
                        style={[styles.textDescription, { marginTop: 0 }]}
                      >
                        {personTwo?.gender}
                      </H8fontMediumWhite>
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
                          {activeData.map((aspect, index) => (
                            <View key={index}>
                              {aspect.reading.map((read, readIndex) => (
                                <View key={readIndex} style={{ marginTop: 20 }}>
                                  <H7fontBoldWhite style={[styles.textTitles]}>
                                    {read?.title}
                                  </H7fontBoldWhite>
                                  <H9fontMediumLightBlack
                                    style={styles.textDescription}
                                  >
                                    {read?.description}
                                  </H9fontMediumLightBlack>
                                </View>
                              ))}
                            </View>
                          ))}
                          <Button
                            disabled={false}
                            funCallback={handleDownloadPDF}
                            label={" Descarcă PDF-ul Interpretării"}
                            success={true}
                            bgColor={colors.gradientLogin11}
                            borderColor={colors.white}
                            borderWidth={0.2}
                            txtColor={colors.white}
                            style={{ marginTop: "10%" }}
                          />
                        </>
                      ) : (
                        // Afișează conținut limitat dacă nu este achiziționat
                        <>
                          {activeData.length > 0 &&
                            activeData[0]?.reading?.length > 0 && (
                              <View>
                                <H7fontBoldWhite style={[styles.textTitles]}>
                                  {activeData[0].reading[0]?.title}
                                </H7fontBoldWhite>
                                <H9fontMediumLightBlack
                                  style={styles.textDescription}
                                >
                                  {activeData[0].reading[0]?.description}
                                </H9fontMediumLightBlack>
                              </View>
                            )}
                          <Text style={styles.partialContent}>
                            Aceasta este o secțiune limitată din interpretarea
                            sinastriei tale. Pentru a accesa interpretarea
                            completă, finalizează achiziția.
                          </Text>
                          <Button
                            disabled={false}
                            funCallback={() => setModalVisible(true)}
                            label={"Achiziționează Interpretarea Completă"}
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
              <AspectTableSinastrieOthers
                houseCusps={houseCusps}
                planetaryData={planetaryData}
                aspects={aspectsData}
                userD={personOne}
                currentUserData={personTwo}
              />
            </ShowFromTop>
          )}
        </LinearGradient>
      </MainContainer>
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
    fontSize: 15,
    fontWeight: "bold",
  },
  textDescription: {
    fontSize: 12,
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

export default SinastrieRelatieOthers;

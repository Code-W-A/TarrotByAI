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
import { Button } from "../../../components/commonButton";

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
function AstrogramaNatala({ navigation }) {
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

  // plata stripe sistem
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en"); // Limba implicită

  const [isPaid, setIsPaid] = useState(false); // Simulează starea de plată
  const [partialContent, setPartialContent] = useState(
    "Aceasta este o secțiune limitată din interpretarea astrogramei tale. Pentru a accesa interpretarea completă, finalizează achiziția."
  );
  const [fullContent, setFullContent] = useState(
    "Aceasta este interpretarea completă a astrogramei tale. Include toate detaliile despre aspectele astrologice, case și planete relevante."
  );
  const generateFullInterpretation = async (selectedLanguage, userData) => {
    try {
      const categories = [
        "generalCategory",
        "dragosteCategory",
        "familieCategory",
        "baniCategory",
        "muncaStudiiCategory",
        "prieteniCategory",
        "sanatateCategory",
        "spiritualitateCategory",
      ];

      for (const category of categories) {
        userData[category] = await handleToTranslate(
          userData[category],
          selectedLanguage,
          userData.actualLanguageAstrograma
        );
      }

      setUserData(userData);

      const content = categories
        .map((category) => `${category}: ${userData[category]}`)
        .join("\n\n");
      setFullContent(content);

      await AsyncStorage.setItem("userData", JSON.stringify(userData));
    } catch (error) {
      console.error("Eroare la generarea interpretării complete:", error);
    }
  };

  const handleDismissModal = () => {
    setModalVisible(false);
  };

  const handleConfirmPurchase = async () => {
    console.log("is paying...");
    setIsPaid(!isPaid);
  };

  const generatePDFContent = () => {
    return `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              line-height: 1.6;
            }
            h1, h2, h3 {
              text-align: center;
              color: #4CAF50;
            }
            p {
              margin-bottom: 10px;
            }
            .section {
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <h1>Interpretare Astrogramă</h1>
          <h2>${userD.full_name}</h2>
          <p>Data nașterii: ${userD.day}-${userD.month}-${userD.year}</p>
          <p>Ora nașterii: ${userD.selectedTime}</p>
          <p>Locul nașterii: ${userD.place}</p>
          <div class="section">
            <h3>General</h3>
            <p>${userD.generalCategory}</p>
          </div>
          <div class="section">
            <h3>Dragoste</h3>
            <p>${userD.dragosteCategory}</p>
          </div>
          <div class="section">
            <h3>Familie</h3>
            <p>${userD.familieCategory}</p>
          </div>
          <div class="section">
            <h3>Bani</h3>
            <p>${userD.baniCategory}</p>
          </div>
          <div class="section">
            <h3>Muncă și Studii</h3>
            <p>${userD.muncaStudiiCategory}</p>
          </div>
          <div class="section">
            <h3>Prieteni</h3>
            <p>${userD.prieteniCategory}</p>
          </div>
          <div class="section">
            <h3>Sănătate</h3>
            <p>${userD.sanatateCategory}</p>
          </div>
          <div class="section">
            <h3>Spiritualitate</h3>
            <p>${userD.spiritualitateCategory}</p>
          </div>
        </body>
      </html>
    `;
  };

  const handleDownloadPDF = async () => {
    if (!isPaid) {
      Alert.alert(
        "Acces restricționat",
        "Trebuie să achiziționezi interpretarea completă pentru a descărca PDF-ul."
      );
      return;
    }

    try {
      const htmlContent = generatePDFContent();

      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
      });

      Alert.alert("PDF generat", `Fișier salvat la: ${uri}`);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert(
          "Partajare indisponibilă",
          "PDF-ul a fost generat, dar partajarea nu este disponibilă."
        );
      }
    } catch (error) {
      Alert.alert("Eroare", "Nu s-a putut genera PDF-ul.");
      console.error(error);
    }
  };
  // plata stripe sistem

  const isValidBase64 = (base64) => {
    const regex = /^[A-Za-z0-9+/]+={0,2}$/;
    return regex.test(base64);
  };

  const handleNatalChart = async () => {
    try {
      const userDataJson = await AsyncStorage.getItem("userData");
      const userData = userDataJson ? JSON.parse(userDataJson) : null;
      console.log("user lang...", userData.actualLanguageAstrograma);

      if (!userData) {
        console.log(
          "Nu există date de utilizator disponibile în AsyncStorage."
        );
        setIsLoading(false);
        return;
      }
      console.log("data....here", language);
      console.log("data....here", userData.actualLanguageAstrograma);
      if (language != userData.actualLanguageAstrograma) {
        setIsLoading(true);
        console.log("language is not in userData....", language);
        console.log(
          "language is not in userData....",
          userData.actualLanguageAstrograma
        );
        userData.actualLanguageAstrograma = language;

        const generalCategory = await handleToTranslate(
          userData.generalCategory,
          language,
          userData.actualLanguageAstrograma
        );
        userData.generalCategory = generalCategory;
        await delay(2000); // delay de 1 secundă

        const dragosteCategory = await handleToTranslate(
          userData.dragosteCategory,
          language,
          userData.actualLanguageAstrograma
        );
        userData.dragosteCategory = dragosteCategory;
        await delay(2000); // delay de 1 secundă

        const familieCategory = await handleToTranslate(
          userData.familieCategory,
          language,
          userData.actualLanguageAstrograma
        );
        userData.familieCategory = familieCategory;
        await delay(2000); // delay de 1 secundă

        const baniCategory = await handleToTranslate(
          userData.baniCategory,
          language,
          userData.actualLanguageAstrograma
        );
        userData.baniCategory = baniCategory;
        await delay(2000); // delay de 1 secundă

        const muncaStudiiCategory = await handleToTranslate(
          userData.muncaStudiiCategory,
          language,
          userData.actualLanguageAstrograma
        );
        userData.muncaStudiiCategory = muncaStudiiCategory;
        await delay(2000); // delay de 1 secundă

        const prieteniCategory = await handleToTranslate(
          userData.prieteniCategory,
          language,
          userData.actualLanguageAstrograma
        );
        userData.prieteniCategory = prieteniCategory;
        await delay(2000); // delay de 1 secundă

        const sanatateCategory = await handleToTranslate(
          userData.sanatateCategory,
          language,
          userData.actualLanguageAstrograma
        );
        userData.sanatateCategory = sanatateCategory;
        await delay(2000); // delay de 1 secundă

        const spiritualitateCategory = await handleToTranslate(
          userData.spiritualitateCategory,
          language,
          userData.actualLanguageAstrograma
        );
        userData.spiritualitateCategory = spiritualitateCategory;
        await delay(2000); // delay de 1 secundă

        // console.log(
        //   "after translate user data....",
        //   userData.spiritualitateCategory
        // );
        // console.log(
        //   "after translate user data....",
        //   userData.horoscopeResultsDaily
        // );
        console.log(
          "after translate user data....",
          userData.actualLanguageAstrograma
        );

        await AsyncStorage.setItem("userData", JSON.stringify(userData));
      }

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

  if (isLoading) {
    return <LoadingOverlay />;
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
                      {i18n.translate("General")}
                    </H6fontBoldYellow>
                    <H9fontMediumLightBlack style={styles.textDescription}>
                      {userD.generalCategory}
                    </H9fontMediumLightBlack>

                    {!isPaid ? (
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
                    ) : (
                      <>
                        <H6fontBoldYellow
                          style={[styles.textTitles, { marginTop: "7%" }]}
                        >
                          {i18n.translate("General")}
                        </H6fontBoldYellow>
                        <H9fontMediumLightBlack style={styles.textDescription}>
                          {userD.generalCategory}
                        </H9fontMediumLightBlack>
                        <H6fontBoldYellow
                          style={[styles.textTitles, { marginTop: "7%" }]}
                        >
                          {i18n.translate("Dragoste")}
                        </H6fontBoldYellow>

                        <H9fontMediumLightBlack style={styles.textDescription}>
                          {userD.dragosteCategory}
                        </H9fontMediumLightBlack>
                        <H6fontBoldYellow
                          style={[styles.textTitles, { marginTop: "7%" }]}
                        >
                          {i18n.translate("Familie")}
                        </H6fontBoldYellow>

                        <H9fontMediumLightBlack style={styles.textDescription}>
                          {userD.familieCategory}
                        </H9fontMediumLightBlack>
                        {/* <H6fontBoldYellow
                      style={[styles.textTitles, { marginTop: "7%" }]}
                    >
                      Cariera
                    </H6fontBoldYellow>

                    <H9fontMediumLightBlack style={styles.textDescription}>
                      {userD.carieraCategory}
                    </H9fontMediumLightBlack> */}

                        <H6fontBoldYellow
                          style={[styles.textTitles, { marginTop: "7%" }]}
                        >
                          {i18n.translate("Bani")}
                        </H6fontBoldYellow>

                        <H9fontMediumLightBlack style={styles.textDescription}>
                          {userD.baniCategory}
                        </H9fontMediumLightBlack>

                        <H6fontBoldYellow
                          style={[styles.textTitles, { marginTop: "7%" }]}
                        >
                          {i18n.translate("MuncaSiStudii")}
                        </H6fontBoldYellow>

                        <H9fontMediumLightBlack style={styles.textDescription}>
                          {userD.muncaStudiiCategory}
                        </H9fontMediumLightBlack>

                        <H6fontBoldYellow
                          style={[styles.textTitles, { marginTop: "7%" }]}
                        >
                          {i18n.translate("Prieteni")}
                        </H6fontBoldYellow>

                        <H9fontMediumLightBlack style={styles.textDescription}>
                          {userD.prieteniCategory}
                        </H9fontMediumLightBlack>

                        <H6fontBoldYellow
                          style={[styles.textTitles, { marginTop: "7%" }]}
                        >
                          {i18n.translate("Sanatate")}
                        </H6fontBoldYellow>

                        <H9fontMediumLightBlack style={styles.textDescription}>
                          {userD.sanatateCategory}
                        </H9fontMediumLightBlack>

                        <H6fontBoldYellow
                          style={[styles.textTitles, { marginTop: "7%" }]}
                        >
                          {i18n.translate("Spiritualitate")}
                        </H6fontBoldYellow>

                        <H9fontMediumLightBlack style={styles.textDescription}>
                          {userD.spiritualitateCategory}
                        </H9fontMediumLightBlack>

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
        onDismiss={handleDismissModal}
        onConfirm={handleConfirmPurchase}
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={setSelectedLanguage}
      />
    </>
  );
}

const styles = StyleSheet.create({
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

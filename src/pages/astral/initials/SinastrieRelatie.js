import { MaterialCommunityIcons } from "@expo/vector-icons";

import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  Divider,
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
import WebView from "react-native-webview";
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
function SinastrieRelatie({ navigation }) {
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
  const [userD, setUserD] = useState({});
  const { language, changeLanguage } = useLanguage();

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
      case "Physical Compatibility":
        return userD?.synastry?.physicalCompatibility?.data;
      case "Emotional Compatibility":
        return userD?.synastry?.emotionalCompatibility?.data;
      case "Sexual Compatibility":
        return userD?.synastry?.sexualCompatibility?.data;
      case "Spiritual Compatibility":
        return userD?.synastry?.spiritualCompatibility?.data;
      case "Financial Compatibility":
        return userD?.synastry?.financialCompatibility?.data;
      default:
        return []; // sau returnează un set de date implicit dacă este necesar
    }
  };

  const handleNatalChart = async () => {
    setIsLoading(true);

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
      // if (language != userData.actualLanguageAstrograma) {
      //   console.log("data....no", language);
      //   userData.actualLanguageAstrograma === language;

      //   const generalCategory = await handleToTranslate(
      //     userData.generalCategory,
      //     language,
      //     userData.actualLanguageAstrograma
      //   );
      //   userData.generalCategory = generalCategory;
      //   await delay(2000); // delay de 1 secundă

      //   const dragosteCategory = await handleToTranslate(
      //     userData.dragosteCategory,
      //     language,
      //     userData.actualLanguageAstrograma
      //   );
      //   userData.dragosteCategory = dragosteCategory;
      //   await delay(2000); // delay de 1 secundă

      //   const familieCategory = await handleToTranslate(
      //     userData.familieCategory,
      //     language,
      //     userData.actualLanguageAstrograma
      //   );
      //   userData.familieCategory = familieCategory;
      //   await delay(2000); // delay de 1 secundă

      //   const baniCategory = await handleToTranslate(
      //     userData.baniCategory,
      //     language,
      //     userData.actualLanguageAstrograma
      //   );
      //   userData.baniCategory = baniCategory;
      //   await delay(2000); // delay de 1 secundă

      //   const muncaStudiiCategory = await handleToTranslate(
      //     userData.muncaStudiiCategory,
      //     language,
      //     userData.actualLanguageAstrograma
      //   );
      //   userData.muncaStudiiCategory = muncaStudiiCategory;
      //   await delay(2000); // delay de 1 secundă

      //   const prieteniCategory = await handleToTranslate(
      //     userData.prieteniCategory,
      //     language,
      //     userData.actualLanguageAstrograma
      //   );
      //   userData.prieteniCategory = prieteniCategory;
      //   await delay(2000); // delay de 1 secundă

      //   const sanatateCategory = await handleToTranslate(
      //     userData.sanatateCategory,
      //     language,
      //     userData.actualLanguageAstrograma
      //   );
      //   userData.sanatateCategory = sanatateCategory;
      //   await delay(2000); // delay de 1 secundă

      //   const spiritualitateCategory = await handleToTranslate(
      //     userData.spiritualitateCategory,
      //     language,
      //     userData.actualLanguageAstrograma
      //   );
      //   userData.spiritualitateCategory = spiritualitateCategory;
      //   await delay(2000); // delay de 1 secundă

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

      console.log(
        "wheel chart....sinastrie....",
        userData.synastry.harmoniousAspectReading
      );
      if (
        userData.synastry.natalWheelChart &&
        userData.synastry.natalWheelChart.data
      ) {
        const svgElementsP1 = parseSVG(
          userData.synastry.natalWheelChart.data.p1.svg
        );
        const svgElementsP2 = parseSVG(
          userData.synastry.natalWheelChart.data.p2.svg
        );
        setSvgData({ svgElementsP1, svgElementsP2 });

        let base64ImageP1 =
          userData.synastry.natalWheelChart.data.p1.base64_image.replace(
            "data:image/svg+xml;base64,",
            ""
          );
        base64ImageP1 = base64.decode(base64ImageP1);

        let base64ImageP2 =
          userData.synastry.natalWheelChart.data.p2.base64_image.replace(
            "data:image/svg+xml;base64,",
            ""
          );
        base64ImageP2 = base64.decode(base64ImageP2);

        setWheelImage({ base64ImageP1, base64ImageP2 });
      }

      // // Set aspects data
      let aspectsP1 = userData?.synastry?.aspect?.data?.p1_p2_aspect?.aspects;
      let aspectsP2 = userData?.synastry?.aspect?.data?.p2_p1_aspect?.aspects;
      setAspectsData(
        userData.synastry.aspect ? { aspectsP1, aspectsP2 } : null
      );

      // // Set planetary data
      let planetaryP1 = userData?.synastry?.planetaryPositions?.data?.p1_data;
      let planetaryP2 = userData?.synastry?.planetaryPositions?.data?.p2_data;

      setPlanetaryData(
        userData.synastry.planetaryPositions
          ? { planetaryP1, planetaryP2 }
          : null
      );

      // Set house cusps data
      let housesP1 = userData?.synastry?.houseCusps?.data?.p1_data;
      let housesP2 = userData?.synastry?.houseCusps?.data?.p2_data;
      setHouseCusps(
        userData.synastry.houseCusps ? { housesP1, housesP2 } : null
      );

      // // Set harmonious aspects data
      setHarmoniousAspectReading(
        userData.synastry.harmoniousAspectReading
          ? userData.synastry.harmoniousAspectReading.data
          : null
      );

      // // Set conflicting aspects data
      setConflictingAspectReading(
        userData.synastry.conflictingAspectReading
          ? userData.synastry.conflictingAspectReading.data
          : null
      );

      // // Set contrasting aspects data
      setContrastingAspectReading(
        userData.synastry.contrastingAspectReading
          ? userData.synastry.contrastingAspectReading.data
          : null
      );

      // // Set physical compatibility data
      setPhysicalCompatibility(
        userData.synastry.physicalCompatibility
          ? userData.synastry.physicalCompatibility.data
          : null
      );

      // // Set emotional compatibility data
      setEmotionalCompatibility(
        userData.synastry.emotionalCompatibility
          ? userData.synastry.emotionalCompatibility.data
          : null
      );

      // // Set sexual compatibility data
      setSexualCompatibility(
        userData.synastry.sexualCompatibility
          ? userData.synastry.sexualCompatibility.data
          : null
      );

      // // Set spiritual compatibility data
      setSpiritualCompatibility(
        userData.synastry.spiritualCompatibility
          ? userData.synastry.spiritualCompatibility.data
          : null
      );

      // // Set financial compatibility data
      setFinancialCompatibility(
        userData.synastry.financialCompatibility
          ? userData.synastry.financialCompatibility.data
          : null
      );

      console.log("test...", userData.synastry.cuspsData.data);
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
                      <H6fontBoldWhite style={styles.textTitles}>
                        {userD?.full_name}
                      </H6fontBoldWhite>
                    </View>
                    <View style={styles.horoscopeTodayContainer}>
                      <H6fontBoldWhite
                        style={[styles.textDescription, { marginTop: 0 }]}
                      >
                        {userD?.day} - {userD?.month} - {userD?.year}
                      </H6fontBoldWhite>
                    </View>
                    <View style={styles.horoscopeTodayContainer}>
                      <H6fontBoldWhite
                        style={[styles.textDescription, { marginTop: 0 }]}
                      >
                        {userD?.selectedTime}
                      </H6fontBoldWhite>
                    </View>
                    <View style={styles.horoscopeTodayContainer}>
                      <H6fontBoldWhite
                        style={[
                          styles.textDescription,
                          { marginTop: 0, maxWidth: "80%" },
                        ]}
                      >
                        {userD?.place}
                      </H6fontBoldWhite>
                    </View>
                    <View style={styles.horoscopeTodayContainer}>
                      <H6fontBoldWhite
                        style={[styles.textDescription, { marginTop: 0 }]}
                      >
                        {userD?.gender}
                      </H6fontBoldWhite>
                    </View>
                  </View>
                  <View style={{ flexDirection: "column", width: "55%" }}>
                    <View style={styles.horoscopeTodayContainer}>
                      <H6fontBoldWhite style={styles.textTitles}>
                        {userD?.p2?.full_name}
                      </H6fontBoldWhite>
                    </View>
                    <View style={styles.horoscopeTodayContainer}>
                      <H6fontBoldWhite
                        style={[styles.textDescription, { marginTop: 0 }]}
                      >
                        {userD?.p2?.day} - {userD?.p2?.month} -{" "}
                        {userD?.p2?.year}
                      </H6fontBoldWhite>
                    </View>
                    <View style={styles.horoscopeTodayContainer}>
                      <H6fontBoldWhite
                        style={[styles.textDescription, { marginTop: 0 }]}
                      >
                        {userD?.p2?.selectedTime}
                      </H6fontBoldWhite>
                    </View>
                    <View style={styles.horoscopeTodayContainer}>
                      <H6fontBoldWhite
                        style={[
                          styles.textDescription,
                          { marginTop: 0, maxWidth: "80%" },
                        ]}
                      >
                        {userD?.p2?.place}
                      </H6fontBoldWhite>
                    </View>
                    <View style={styles.horoscopeTodayContainer}>
                      <H6fontBoldWhite
                        style={[styles.textDescription, { marginTop: 0 }]}
                      >
                        {userD?.p2?.gender}
                      </H6fontBoldWhite>
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
                    {activeData.map((aspect, index) => (
                      <View key={index}>
                        {aspect.reading.map((read, readIndex) => (
                          <View key={readIndex}>
                            <H9fontMediumWhite
                              style={[styles.textTitles, { marginTop: "7%" }]}
                            >
                              {read?.title}
                            </H9fontMediumWhite>
                            <H9fontMediumLightBlack
                              style={styles.textDescription}
                            >
                              {read?.description}
                            </H9fontMediumLightBlack>
                          </View>
                        ))}
                      </View>
                    ))}
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
              />
            </ShowFromTop>
          )}
        </LinearGradient>
      </MainContainer>
    </>
  );
}

const styles = StyleSheet.create({
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

export default SinastrieRelatie;

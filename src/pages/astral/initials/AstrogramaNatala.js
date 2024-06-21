import { MaterialCommunityIcons } from "@expo/vector-icons";
import i18n from "i18n-js";
import React, { useEffect, useState } from "react";
import { Dimensions, SafeAreaView, StyleSheet, View } from "react-native";
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
  H6fontBoldPrimary,
  H6fontBoldWhite,
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
  fetchNatalWheelChart,
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

// const LuckyNumber = ({ number }) => {
//   return (
//     <View
//       style={[LuckyNumberStyles.circle, { backgroundColor: colors.primary1 }]}
//     >
//       <Text style={{ fontSize: 16, marginTop: 3 }}>{number}</Text>
//     </View>
//   );
// };

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

  const isValidBase64 = (base64) => {
    const regex = /^[A-Za-z0-9+/]+={0,2}$/;
    return regex.test(base64);
  };

  const handleNatalChart = async () => {
    try {
      setIsLoading(true);
      const data = await fetchNatalWheelChart();
      // const dataAspects = await fetchAspectTable();
      const svgElements = parseSVG(data.data.svg); // Presupunem că `parseSVG` este o funcție care parsează SVG-ul într-un format utilizabil
      setSvgData(svgElements);
      // setAspectsData(dataAspects.data);

      // Funcția care curăță string-ul Base64 de prefixul specific
      const removePrefix = (base64) =>
        base64.replace("data:image/svg+xml;base64,", "");

      // Elimină prefixul și apoi decodifică
      const base64Image = removePrefix(data.data.base64_image);
      const iconData = base64.decode(base64Image);
      setWheelImage(iconData);
    } catch (err) {
      console.log("eroare la handle natal chart...", err);
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
      </View>
    </View>
  );

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
          {isLoading ? (
            <View style={styles.container}>
              <Image source={localGif} style={styles.image} />
              <H8fontRegularWhite style={styles.text}>
                Vă analizăm informațiile pentru a vă crea astrograma natală...
              </H8fontRegularWhite>
            </View>
          ) : (
            <ScrollViewFadeFirst element={Header} height={400}>
              <ShowFromTop>
                <View style={[styles.defaultContainer]}>
                  <View style={styles.horoscopeTodayContainer}>
                    <H6fontBoldWhite style={styles.textTitles}>
                      Interpretare astrograma
                    </H6fontBoldWhite>
                  </View>
                  {/* Interpretează următoarea diagramă natală: Născut pe 10 martie 1994, la 14:05, în București, România. Soarele în Pești, Luna în Capricorn, Mercur în Vărsător, Venus în Berbec, și Marte în Pești. Ascendentul este în Scorpion. Soarele formează o conjuncție cu Venus, Luna este în opoziție cu Marte, iar Mercur formează un trigon cu Saturn. */}
                  <View
                    style={[
                      styles.horoscopeTodayContainer,
                      { marginBottom: "10%" },
                    ]}
                  >
                    <H9fontMediumLightBlack style={styles.textDescription}>
                      Această diagramă natală sugerează o personalitate complexă
                      și profundă, cu multe influențe diverse care se
                      intersectează pentru a forma un caracter unic. Iată cum
                      fiecare element contribuie la întreaga structură a
                      personalității: Soarele în Pești conferă o natură
                      empatică, sensibilă și intuitivă. Persoanele născute sub
                      semnul Peștilor sunt adesea creativi și visători, având o
                      conexiune puternică cu lumea emoțională și spirituală.
                      Luna în Capricorn aduce un contrast față de Soarele în
                      Pești, indicând o latură responsabilă, practică și
                      ambițioasă. Capricornul este un semn de pământ, orientat
                      spre realizări și stabilitate, ceea ce poate tempera
                      tendințele mai evazive ale Peștilor. Mercur în Vărsător
                      sugerează o minte agilă, inovativă și originală.
                      Persoanele cu Mercur în Vărsător se gândesc adesea în
                      afara cutiei, aducând idei noi și perspective unice în
                      conversații. Venus în Berbec indică o abordare directă și
                      energică în relații. Aceasta poziție sugerează pasiune și
                      spontaneitate în iubire, dar și o tendință de a fi uneori
                      impulsiv în afecțiuni. Marte în Pești arată că energia și
                      acțiunea sunt canalizate prin emoții. Persoanele cu Marte
                      în Pești pot prefera să acționeze în moduri mai subtile
                      sau indirecte, fiind adesea motivate de sentimentul de
                      compasiune sau de nevoia de a ajuta. Ascendentul în
                      Scorpion aduce intensitate, magnetism și o puternică
                      voință. Scorpionul este asociat cu transformarea și cu
                      profunzimile psihice, conferind o capacitate remarcabilă
                      de a se regenera și de a se reinventa. Aspectele: Soarele
                      în conjuncție cu Venus amplifică calitățile venusiene
                      (dragoste, frumusețe, armonie) în manifestarea
                      personalității, aducând un accent pe relații și pe
                      valorile estetice. Luna în opoziție cu Marte poate crea
                      tensiuni interioare între nevoile emoționale și modul de
                      acțiune, uneori ducând la conflicte între dorința de
                      securitate emoțională și impulsurile instinctive. Mercur
                      în trigon cu Saturn conferă o minte structurată, capabilă
                      de concentrare profundă și de înțelegere a detaliilor
                      complexe. Acest aspect favorizează gândirea strategică și
                      capacitatea de planificare pe termen lung. În concluzie,
                      această diagramă natală descrie o persoană cu un amestec
                      de sensibilitate și practicitate, creativitate și
                      structură, indicând o persoană capabilă să navigheze și să
                      integreze diversele sale laturi într-un mod efectiv și
                      original.
                    </H9fontMediumLightBlack>
                  </View>
                  {/* {aspectsData && (
        <AstrologyAspectsView aspectsData={aspectsData} />
      )} */}
                  <Divider style={{ marginTop: "5%" }} />
                </View>
                {/* <ChatComponent /> */}

                <View style={{ paddingVertical: 10 }} />
              </ShowFromTop>
            </ScrollViewFadeFirst>
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
    paddingBottom: "5%",
  },
  textTitles: {
    fontSize: 18,
    fontWeight: "bold",
  },
  textDescription: {
    fontSize: 14,
    color: "#F0F0F0",
    marginTop: "5%",
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
});

export default AstrogramaNatala;

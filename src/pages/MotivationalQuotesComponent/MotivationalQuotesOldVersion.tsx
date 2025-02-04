import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Platform,
  StatusBar,
  ImageBackground,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MainContainer } from "../../components/commonViews";
import GreetingBar from "../../components/UpperGreetingBar/GreetingBar";
import { colors } from "../../utils/colors";
import { TouchableWithoutFeedback } from "react-native";
import {
  H15fontMediumWhite,
  H6fontBoldPrimary,
  H6fontMediumWhite,
  H7fontBoldPrimary,
  H7fontBoldWhite,
  H7fontMediumPrimary,
  H8fontMediumPrimary,
  H8fontMediumWhite,
} from "../../components/commonText";
import { useNavBarVisibility } from "../../context/NavbarVisibilityContext";
import axios from "axios";
import { useApiData } from "../../context/ApiContext";
import { useLanguage } from "../../context/LanguageContext";
import i18n from "../../../i18n";
import { handleQueryRandom } from "../../utils/firestoreUtils";
import { collection, getCountFromServer } from "firebase/firestore";
import { db } from "../../../firebase";

const MotivationalQuotes = () => {
  const {
    zilnicNumereNorocoase,
    zilnicCuloriNorocoase,
    zilnicCategoriiViitor,
    numereNorocoase,
    citateMotivationale,
    culoriNorocoase,

    oreNorocoase,
  } = useApiData();
  const { language, changeLanguage } = useLanguage();
  const onPressHandler = () => {
    console.log("Pressed");
  };

  const { setIsNavBarVisible } = useNavBarVisibility();
  const [luck, setLuck] = React.useState(null);

  const [zilnicCitateMotivationale, setZilnicCitateMotivationale] =
    React.useState({});

  const getRandomDocumentFirestore = async () => {
    // Presupunem că deja ai definit `collection` și `db`
    const coll = collection(db, "CitateMotivationale");
    const snapshot = await getCountFromServer(coll);
    const count = snapshot.data().count;
    console.log("count: ", count);

    const randomIndex = Math.floor(Math.random() * count) + 1;

    console.log(randomIndex);
    const obj = await handleQueryRandom("CitateMotivationale", randomIndex);
    setZilnicCitateMotivationale(obj);
  };

  React.useEffect(() => {
    getRandomDocumentFirestore();
  }, []);

  // React.useEffect(() => {
  //   if (citateMotivationale && citateMotivationale.length > 0) {
  //     const randomIndex = Math.floor(
  //       Math.random() * citateMotivationale.length
  //     );
  //     setZilnicCitateMotivationale(citateMotivationale[randomIndex]);
  //   }
  // }, [citateMotivationale]);

  React.useEffect(() => {
    setIsNavBarVisible(false);
    return () => setIsNavBarVisible(true); // Restabilește vizibilitatea la ieșirea din componentă
  }, []);
  return (
    <View style={{ flex: 1 }}>
      <MainContainer style={{ flex: 1 }}>
        <LinearGradient
          colors={[
            colors.gradientLogin1,
            colors.gradientLogin2,
            colors.gradientLogin2,
          ]}
          style={styles.gradient}
        >
          <ImageBackground
            source={require("../../../assets/shadowBg.png")}
            resizeMode="cover"
            style={{
              flex: 1,
              width: null,
              height: null,
              // alignItems: 'flex-end',
            }}
          >
            <GreetingBar isGoBack={true} />
            <View style={styles.overlay}>
              <View style={styles.secondImageContainer}>
                <Image
                  source={require("../../../assets/headerIcon.png")}
                  style={styles.secondImage}
                  resizeMode="contain"
                />
              </View>
              <H6fontBoldPrimary
                style={{ alignSelf: "center", textAlign: "center" }}
              >
                {i18n.translate("motivationalQuoteOfTheDay")}
              </H6fontBoldPrimary>

              <View style={{ height: "auto" }}>
                <ScrollView contentContainerStyle={styles.scrollViewContainer}>
                  {zilnicCitateMotivationale.info ? (
                    <H7fontMediumPrimary style={{ textAlign: "justify" }}>
                      {language === "hi"
                        ? zilnicCitateMotivationale.info.hu?.descriere
                        : language === "id"
                        ? zilnicCitateMotivationale.info.ru?.descriere
                        : language === "ru"
                        ? zilnicCitateMotivationale.info.rusa?.descriere
                        : zilnicCitateMotivationale.info[language]?.descriere}
                    </H7fontMediumPrimary>
                  ) : null}
                </ScrollView>
              </View>
            </View>
          </ImageBackground>
        </LinearGradient>
      </MainContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollViewContainer: {
    // flexGrow: 1, // Asigură că ScrollView se extinde pe tot spațiul disponibil
    justifyContent: "flex-start",
    alignItems: "center",
    // backgroundColor: "red",

    padding: 10,

    // paddingBottom: 20, // Ajustați această valoare după cum este necesar
  },
  imageContainer: {
    alignSelf: "center",
    marginTop: 20,
    marginBottom: 20,
    width: "auto",
    height: "auto",
  },
  image: {
    width: 300,
    height: 300,
    resizeMode: "contain",
    borderWidth: 3,
    borderColor: colors.primary2,
    borderRadius: 10,
  },
  secondImageContainer: {
    alignSelf: "center",

    position: "relative",
    bottom: "3%",
    height: "auto",
    width: "auto",
  },
  secondImage: {
    width: 250,
    height: 100,
  },

  gradient: {
    flex: 1,
    width: "100%",
    height: "100%",
    paddingBottom: 100,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    // Alte stiluri necesare pentru a pozitiona gradientul după cum este necesar
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    backgroundColor: "transparent", // Adaugă un overlay pentru a spori lizibilitatea textului
    borderRadius: 10, // Rotunjirea colțurilor
    padding: 20, // Spațiu în interiorul containerului
    paddingTop: "15%",
  },
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10, // Spațiu sub titlu
  },
  colorName: {
    color: "white",
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 10, // Spațiu sub numele culorii
  },
  description: {
    color: "white",
    fontSize: 18,
    textAlign: "center", // Aliniere text la centru
  },
});

export default MotivationalQuotes;

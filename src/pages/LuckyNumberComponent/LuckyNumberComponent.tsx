import React, { useState } from "react";
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
import { useApiData } from "../../context/ApiContext";
import { useLanguage } from "../../context/LanguageContext";
import { handleQueryRandom } from "../../utils/firestoreUtils";
import { collection, getCountFromServer } from "firebase/firestore";
import { db } from "../../../firebase";

const LuckyNumber = () => {
  const {
    zilnicCitateMotivationale,
    zilnicCuloriNorocoase,
    zilnicCategoriiViitor,
    numereNorocoase,
    citateMotivationale,
    culoriNorocoase,

    oreNorocoase,
  } = useApiData();
  const { language, changeLanguage } = useLanguage();
  const [zilnicNumereNorocoase, setZilnicNumereNorocoase] = useState({});
  const onPressHandler = () => {
    console.log("Pressed");
  };

  const { setIsNavBarVisible } = useNavBarVisibility();

  const getRandomDocumentFirestore = async () => {
    // Presupunem că deja ai definit `collection` și `db`
    const coll = collection(db, "NumereNorocoase");
    const snapshot = await getCountFromServer(coll);
    const count = snapshot.data().count;
    console.log("count: ", count);

    const randomIndex = Math.floor(Math.random() * count) + 1;

    console.log(randomIndex);
    const obj = await handleQueryRandom("NumereNorocoase", randomIndex);
    setZilnicNumereNorocoase(obj);
  };

  // const uploadToFirestore = async (data) => {
  //   await handleUploadFirestore(data, "NumereNorocoase");
  // };

  React.useEffect(() => {
    // for (let i = 0; i < numereNorocoase.arr.length; i++) {
    //   uploadToFirestore(numereNorocoase.arr[i]);
    // }

    getRandomDocumentFirestore();
  }, []);

  // React.useEffect(() => {
  //   if (numereNorocoase && numereNorocoase.length > 0) {
  //     const randomIndex = Math.floor(Math.random() * numereNorocoase.length);
  //     setZilnicNumereNorocoase(numereNorocoase[randomIndex]);
  //   }
  // }, [numereNorocoase]);

  // Restul codului tău rămâne neschimbat

  React.useEffect(() => {
    console.log(numereNorocoase);
    setIsNavBarVisible(false);
    return () => setIsNavBarVisible(true); // Restabilește vizibilitatea la ieșirea din componentă
  }, []);

  // React.useEffect(() => {
  //   let adShown = false;

  //   const eventListener = interstitial.addAdEventListener(
  //     AdEventType.LOADED,
  //     () => {
  //       if (!adShown) {
  //         interstitial.show();
  //         adShown = true; // Setează flag-ul pentru a preveni afișări repetate
  //       }
  //     }
  //   );

  //   interstitial.load(); // Începe încărcarea anunțului

  //   return () => {
  //     // Curăță listener-ul atunci când componenta este demontată
  //     eventListener();
  //   };
  // }, []);

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
              <View style={styles.numberContainer}>
                <Text style={styles.number}>
                  {zilnicNumereNorocoase.number
                    ? zilnicNumereNorocoase.number
                    : ""}
                </Text>
              </View>
              <View style={styles.secondImageContainer}>
                <Image
                  source={require("../../../assets/headerIcon.png")}
                  style={styles.secondImage}
                  resizeMode="contain"
                />
              </View>
            </View>
            <View style={{ height: "auto", padding: 10 }}>
              <ScrollView contentContainerStyle={styles.scrollViewContainer}>
                {/* <H7fontBoldWhite style={{ alignSelf: "center" }}>
                {zilnicNumereNorocoase.info[language].nume}
              </H7fontBoldWhite> */}
                {zilnicNumereNorocoase.info ? (
                  <H7fontMediumPrimary style={{ textAlign: "justify" }}>
                    {language === "hi"
                      ? zilnicNumereNorocoase.info.hu.descriere
                      : language === "id"
                        ? zilnicNumereNorocoase.info.ru.descriere
                        : zilnicNumereNorocoase.info[language].descriere}
                  </H7fontMediumPrimary>
                ) : null}
              </ScrollView>
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
  numberContainer: {
    alignSelf: "center",
    marginTop: 20,
    marginBottom: 20,
    width: 130, // Dimensiunea containerului
    height: 130, // Dimensiunea containerului
    borderRadius: 65, // Jumătate din width/height pentru a face cerc perfect
    backgroundColor: colors.primary3, // Culoarea de fundal
    justifyContent: "center", // Centrează conținutul vertical
    alignItems: "center", // Centrează conținutul orizontal
    // Stiluri pentru efect 3D
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  number: {
    fontSize: 70, // Mărimea fontului pentru număr
    color: "white", // Culoarea textului
    // Adaugă alte stiluri pentru text dacă este necesar
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
    bottom: 60,
    height: "auto",
    width: "auto",
  },
  secondImage: {
    width: 250,
    height: 150,
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
    borderRadius: 10, // Rotunjirea colțurilor
    padding: 20, // Spațiu în interiorul containerului
    height: "35%",
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

export default LuckyNumber;

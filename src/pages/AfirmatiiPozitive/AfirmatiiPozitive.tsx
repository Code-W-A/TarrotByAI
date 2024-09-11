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
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MainContainer } from "../../components/commonViews";
import GreetingBar from "../../components/UpperGreetingBar/GreetingBar";
import { colors } from "../../utils/colors";
import { TouchableWithoutFeedback } from "react-native";
import {
  H15fontMediumWhite,
  H2fontBoldPrimary,
  H3fontBoldPrimary,
  H3fontBoldWhite,
  H6fontBoldPrimary,
  H6fontMediumPrimary,
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
import { RouteProp, useRoute } from "@react-navigation/native";

const AfirmatiiPozitive = () => {
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

  const [afirmatiiPozitive, setAfirmatiiPozitive] = React.useState(null);

  const getRandomDocumentFirestore = async () => {
    // Presupunem că deja ai definit `collection` și `db`
    const coll = collection(db, "AfirmatiiPozitive");
    const snapshot = await getCountFromServer(coll);
    const count = snapshot.data().count;
    console.log("count: ", count);

    const randomIndex = Math.floor(Math.random() * count) + 1;

    console.log(randomIndex);
    const obj = await handleQueryRandom("AfirmatiiPozitive", randomIndex);
    setAfirmatiiPozitive(obj);
  };

  React.useEffect(() => {
    getRandomDocumentFirestore();
  }, []);

  // React.useEffect(() => {
  //   setIsNavBarVisible(false);
  //   return () => setIsNavBarVisible(true); // Restabilește vizibilitatea la ieșirea din componentă
  // }, []);

  // Array cu sursele imaginilor
  const images = [
    require("../../../assets/afirmatiipoze/var1.png"),
    require("../../../assets/afirmatiipoze/var2.png"),
    require("../../../assets/afirmatiipoze/var3.png"),
    require("../../../assets/afirmatiipoze/var4.png"),
    require("../../../assets/afirmatiipoze/var5.png"),
    require("../../../assets/afirmatiipoze/var6.png"),
    require("../../../assets/afirmatiipoze/var7.png"),
    require("../../../assets/afirmatiipoze/var8.png"),
    require("../../../assets/afirmatiipoze/var9.png"),
    require("../../../assets/afirmatiipoze/var10.png"),
  ];

  // Alege o imagine aleatorie din array
  const randomImage = images[Math.floor(Math.random() * images.length)];

  React.useEffect(() => {
    getRandomDocumentFirestore();
  }, []);

  if (!afirmatiiPozitive) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!afirmatiiPozitive.info) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }
  console.log("test....", afirmatiiPozitive.info);
  return (
    <View style={{ flex: 1 }}>
      <MainContainer style={{ flex: 1 }}>
        <ImageBackground
          source={randomImage}
          resizeMode="cover"
          style={styles.imageBackground}
        >
          <View style={styles.overlay}>
            <GreetingBar isGoBack={true} />
            <View style={styles.secondImageContainer}>
              <Image
                source={require("../../../assets/headerIcon.png")}
                style={styles.secondImage}
                resizeMode="contain"
              />
            </View>
            {afirmatiiPozitive?.info ? (
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <H3fontBoldWhite
                  style={{
                    alignSelf: "center",
                    textAlign: "center",
                    color: "white",
                  }}
                >
                  {language === "hi"
                    ? afirmatiiPozitive?.info.hu.nume
                    : language === "id"
                    ? afirmatiiPozitive?.info.ru.nume
                    : afirmatiiPozitive?.info[language].nume}
                </H3fontBoldWhite>
              </View>
            ) : null}
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                paddingBottom: "30%",
              }}
            >
              <ScrollView contentContainerStyle={styles.scrollViewContainer}>
                {afirmatiiPozitive?.info ? (
                  <View
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <H6fontMediumWhite
                      style={{
                        textAlign: "center",
                        color: "white",
                      }}
                    >
                      {language === "hi"
                        ? afirmatiiPozitive?.info.hu.descriere
                        : language === "id"
                        ? afirmatiiPozitive?.info.ru.descriere
                        : afirmatiiPozitive?.info[language].descriere}
                    </H6fontMediumWhite>
                  </View>
                ) : null}
              </ScrollView>
            </View>
          </View>
        </ImageBackground>
      </MainContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollViewContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    flexGrow: 1,
    textAlign: "center",
  },
  imageBackground: {
    flex: 1,
    width: "100%",
    height: "100%",
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
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Adaugă un overlay transparent negru
    padding: 20,
  },
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  colorName: {
    color: "white",
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 10,
  },
  description: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
  },
});

export default AfirmatiiPozitive;

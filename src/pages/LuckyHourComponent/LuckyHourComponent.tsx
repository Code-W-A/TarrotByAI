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
import { useApiData } from "../../context/ApiContext";
import { useLanguage } from "../../context/LanguageContext";
import { collection, getCountFromServer } from "firebase/firestore";
import { handleQueryRandom } from "../../utils/firestoreUtils";
import { db } from "../../../firebase";

const LuckyHour = () => {
  const {
    zilnicCitateMotivationale,
    zilnicCuloriNorocoase,

    citateMotivationale,
    culoriNorocoase,

    oreNorocoase,
  } = useApiData();
  const { language, changeLanguage } = useLanguage();
  const onPressHandler = () => {
    console.log("Pressed");
  };
  const [zilnicOreNorocoase, setZilnicOreNorocoase] = React.useState({});

  const { setIsNavBarVisible } = useNavBarVisibility();

  const getRandomDocumentFirestore = async () => {
    // Presupunem că deja ai definit `collection` și `db`
    const coll = collection(db, "OreNorocoase");
    const snapshot = await getCountFromServer(coll);
    const count = snapshot.data().count;
    console.log("count: ", count);

    const randomIndex = Math.floor(Math.random() * count) + 1;

    console.log(randomIndex);
    const obj = await handleQueryRandom("OreNorocoase", randomIndex);
    setZilnicOreNorocoase(obj);
  };

  // const uploadToFirestore = async (data) => {
  //   await handleUploadFirestore(data, "OreNorocoase");
  // };

  React.useEffect(() => {
    // for (let i = 0; i < oreNorocoase.arr.length; i++) {
    //   uploadToFirestore(oreNorocoase.arr[i]);
    // }

    getRandomDocumentFirestore();
  }, []);

  // React.useEffect(() => {
  //   if (oreNorocoase && oreNorocoase.length > 0) {
  //     const randomIndex = Math.floor(Math.random() * oreNorocoase.length);
  //     setZilnicOreNorocoase(oreNorocoase[randomIndex]);
  //   }
  // }, [oreNorocoase]);

  React.useEffect(() => {
    console.log(zilnicOreNorocoase);
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
            <View>
              <View style={styles.overlay}>
                <View>
                  <View style={styles.numberContainer}>
                    <Text style={styles.number}>
                      {" "}
                      {zilnicOreNorocoase.ora ? zilnicOreNorocoase.ora : ""}
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
              </View>
              <View
                style={{
                  height: "75%",

                  padding: 10,
                }}
              >
                {/* <H7fontBoldWhite style={{ alignSelf: "center" }}>
                {zilnicOreNorocoase.info[language].nume}
              </H7fontBoldWhite> */}
                <ScrollView contentContainerStyle={styles.scrollViewContainer}>
                  {zilnicOreNorocoase.info ? (
                    <H7fontMediumPrimary style={{ textAlign: "justify" }}>
                      {language === "hi"
                        ? zilnicOreNorocoase.info.hu.descriere
                        : language === "id"
                          ? zilnicOreNorocoase.info.ru.descriere
                          : zilnicOreNorocoase.info[language].descriere}
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
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: "5%",
    paddingBottom: "20%",
  },
  numberContainer: {
    alignSelf: "center",
    marginTop: 20,
    marginBottom: 20,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: colors.primary3,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  number: {
    fontSize: 40,
    color: "white",
    textAlign: "center",
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
    marginTop: 20,
    marginBottom: 20,

    position: "relative",
    bottom: "20%",
  },
  secondImage: {
    width: 250,
    height: 150,
    resizeMode: "contain",
  },

  gradient: {
    flex: 1,
    width: "100%",
    height: "100%",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    borderRadius: 10,
    padding: 20,

    height: "30%",
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

export default LuckyHour;

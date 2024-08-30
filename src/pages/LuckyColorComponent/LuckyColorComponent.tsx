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
  H8fontBoldPrimary,
  H8fontMediumPrimary,
  H8fontMediumWhite,
} from "../../components/commonText";
import { useNavBarVisibility } from "../../context/NavbarVisibilityContext";
import axios from "axios";
import { useApiData } from "../../context/ApiContext";
import { useLanguage } from "../../context/LanguageContext";
import i18n from "../../../i18n";
import { ActivityIndicator } from "react-native-paper";
import { handleQueryRandom } from "../../utils/firestoreUtils";
import { collection, getCountFromServer } from "firebase/firestore";
import { db } from "../../../firebase";

const LuckyColor = () => {
  const {
    zinicNumereNorocoase,
    zilnicCitateMotivationale,

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
  const [zilnicCuloriNorocoase, setZilnicCuloriNorocoase] = React.useState({});
  const [isImageLoading, setIsImageLoading] = React.useState(true);

  const getRandomDocumentFirestore = async () => {
    // Presupunem că deja ai definit `collection` și `db`
    const coll = collection(db, "CuloriNorocoase");
    const snapshot = await getCountFromServer(coll);
    const count = snapshot.data().count;
    console.log("count: ", count);

    const randomIndex = Math.floor(Math.random() * count) + 1;

    console.log(randomIndex);
    const obj = await handleQueryRandom("CuloriNorocoase", randomIndex);
    setZilnicCuloriNorocoase(obj);
  };

  // const uploadToFirestore = async (data) => {
  //   handleUploadFirestore(data, "CuloriNorocoase");
  // };

  React.useEffect(() => {
    // for (let i = 0; i < culoriNorocoase.arr.length; i++) {
    //   uploadToFirestore(culoriNorocoase.arr[i]);
    // }

    getRandomDocumentFirestore();
  }, []);

  // React.useEffect(() => {
  //   if (culoriNorocoase && culoriNorocoase.length > 0) {
  //     const randomIndex = Math.floor(Math.random() * culoriNorocoase.length);
  //     setZilnicCuloriNorocoase(culoriNorocoase[randomIndex]);
  //   }
  // }, [culoriNorocoase]);

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
              <View style={styles.imageContainer}>
                {isImageLoading && (
                  <ActivityIndicator
                    size="large"
                    color={colors.primary3}
                    style={{ position: "relative", top: 150 }}
                  />
                )}
                <Image
                  style={styles.image}
                  source={{
                    uri: zilnicCuloriNorocoase.image
                      ? zilnicCuloriNorocoase.image.finalUri
                      : "",
                  }}
                  onLoad={() => setIsImageLoading(false)} // Ascunde spinner-ul după încărcare
                  onError={() => setIsImageLoading(false)} // Ascunde spinner-ul în caz de eroare
                />
              </View>
            </View>
            {/* <View style={styles.secondImageContainer}>
                <Image
                  source={require("../../../assets/headerIcon.png")}
                  style={styles.secondImage}
                  resizeMode="contain"
                />
              </View> */}

            <View
              style={{
                height: "54%",

                paddingBottom: 10,
                paddingLeft: 10,
                paddingRight: 10,
              }}
            >
              <H6fontBoldPrimary
                style={{
                  alignSelf: "center",
                  marginTop: "5%",
                  textAlign: "center",
                }}
              >
                {i18n.translate("luckyColorOfTheDay")}
              </H6fontBoldPrimary>
              <ScrollView contentContainerStyle={styles.scrollViewContainer}>
                {zilnicCuloriNorocoase.info ? (
                  <>
                    <H8fontBoldPrimary
                      style={{
                        alignSelf: "center",
                        marginTop: "5%",
                        textAlign: "center",
                      }}
                    >
                      {language === "hi"
                        ? zilnicCuloriNorocoase.info.hu.nume
                        : language === "id"
                          ? zilnicCuloriNorocoase.info.ru.nume
                          : zilnicCuloriNorocoase.info[language].nume}
                    </H8fontBoldPrimary>

                    <H7fontMediumPrimary
                      style={{ textAlign: "justify", marginTop: "5%" }}
                    >
                      {language === "hi"
                        ? zilnicCuloriNorocoase.info.hu.descriere
                        : language === "id"
                          ? zilnicCuloriNorocoase.info.ru.descriere
                          : zilnicCuloriNorocoase.info[language].descriere}
                    </H7fontMediumPrimary>
                  </>
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
    bottom: "8%",
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
    backgroundColor: "transparent", // Adaugă un overlay pentru a spori lizibilitatea textului
    borderRadius: 10, // Rotunjirea colțurilor
    paddingTop: 10, // Spațiu în interiorul containerului
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

export default LuckyColor;

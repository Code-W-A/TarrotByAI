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
import ShareScreenshot from '../../components/common/ShareScreenshot';

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
  const [zilnicCuloriNorocoase, setZilnicCuloriNorocoase] = React.useState<any>({});
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
    <ShareScreenshot fabPosition={{ bottom: 24, right: 24 }}>
      <MainContainer secondary={false} style={{ flex: 1 }}>
        <ImageBackground
          source={require("../../../assets/dashboardbg.jpg")}
          style={{ flex: 1, paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 }}
          imageStyle={{ opacity: 1 }}
        >
          <ImageBackground
            source={require("../../../assets/shadowBg.png")}
            resizeMode="cover"
            style={{ flex: 1 }}
          >
            <GreetingBar isGoBack={true} isPersonalGoBack={true} />
            <View style={styles.overlay}>
              <View style={{ alignItems: 'center', marginTop: 32 }}>
                <View style={[styles.imageContainer, { borderColor: '#FFD700', borderWidth: 3, backgroundColor: '#FFFBEA', borderRadius: 18, shadowOpacity: 0.08, shadowRadius: 8, marginBottom: 8 }]}>
                  {isImageLoading && (
                    <ActivityIndicator
                      size="large"
                      color={colors.primary3}
                      style={{ position: "relative", top: 80 }}
                    />
                  )}
                  <Image
                    style={[styles.image, { borderColor: '#FFD700', borderWidth: 2, borderRadius: 14 }]}
                    source={{
                      uri: zilnicCuloriNorocoase.image
                        ? zilnicCuloriNorocoase.image.finalUri
                        : "",
                    }}
                    onLoad={() => setIsImageLoading(false)}
                    onError={() => setIsImageLoading(false)}
                  />
                </View>
                <Text
                  style={{
                    alignSelf: "center",
                    marginTop: 8,
                    textAlign: "center",
                    color: '#FFD700',
                    fontFamily: 'Lora',
                    fontWeight: '700',
                    fontSize: 26,
                    marginVertical: 8,
                    backgroundColor: 'transparent',
                  }}
                >
                  {i18n.translate("luckyColorOfTheDay")}
                </Text>
                <Text
              style={{
                color: '#FFD700',
                fontWeight: '700',
                fontSize: 16,
                textAlign: 'center',
                textShadowColor: '#fffbeae0',
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 6,
                letterSpacing: 1.1,
                fontFamily: 'LoraBold',
                marginTop: 0,
                position:"relative",
                bottom:"0%"
              }}
            >
              @CristinaZurba.App
            </Text>
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
              <ScrollView contentContainerStyle={[styles.scrollViewContainer, {flexGrow: 1}]} style={{flex: 1}}>
                {zilnicCuloriNorocoase && zilnicCuloriNorocoase.info ? (
                  <>
                    <Text
                      style={{
                        alignSelf: "center",
                        marginTop: 8,
                        textAlign: "center",
                        fontFamily: 'Lora',
                        fontWeight: '700',
                        fontSize: 22,
                        color: colors.primary3,
                      }}
                    >
                      {language === "hi"
                        ? zilnicCuloriNorocoase.info?.hu?.nume
                        : language === "id"
                        ? zilnicCuloriNorocoase.info?.ru?.nume
                        : language === "ru"
                        ? zilnicCuloriNorocoase.info?.rusa?.nume
                        : zilnicCuloriNorocoase.info[language]?.nume}
                    </Text>

                    <Text
                      style={{
                        textAlign: 'justify',
                        color: '#7c6f57',
                        fontFamily: 'Lora',
                        fontWeight: '400',
                        fontSize: 19,
                        lineHeight: 28,
                        marginTop: 16,
                        backgroundColor: 'transparent',
                      }}
                    >
                      {language === "hi"
                        ? zilnicCuloriNorocoase.info.hu?.descriere
                        : language === "id"
                        ? zilnicCuloriNorocoase.info.ru?.descriere
                        : language === "ru"
                        ? zilnicCuloriNorocoase.info.rusa?.descriere
                        : zilnicCuloriNorocoase.info[language]?.descriere}
                    </Text>
                  </>
                ) : null}
              </ScrollView>
            </View>
          </ImageBackground>
        </ImageBackground>
      </MainContainer>
    </ShareScreenshot>
  );
};

const styles = StyleSheet.create({
  scrollViewContainer: {
    // flexGrow: 1, // Asigură că ScrollView se extinde pe tot spațiul disponibil
    justifyContent: "flex-start",
    alignItems: "center",
    // backgroundColor: "red",

    padding: 10,
    paddingBottom:"30%"

    // paddingBottom: 20, // Ajustați această valoare după cum este necesar
  },
  imageContainer: {
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 8,
    width: "auto",
    height: "auto",
  },
  image: {
    width: 260,
    height: 260,
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
    textAlign: "justify", // Aliniere text la centru
  },
});

export default LuckyColor;

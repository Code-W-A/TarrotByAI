import React, {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  View,
  ScrollView,
  Dimensions,
  Animated,
  ActivityIndicator,
  StatusBar,
  Platform,
  ImageBackground,
  Text,
  Button,
} from "react-native";
import { Provider as PaperProvider } from "react-native-paper";
import { useSelector, useDispatch } from "react-redux";
import { useFocusEffect, useRoute } from "@react-navigation/native";

import NavBarBottom from "../../components/Navbar";
import FlipCard from "../../components/FlipCard/FlipCard";
import { styles } from "./DashboardStyle";
import { MainContainer } from "../../components/commonViews";
import { LinearGradient } from "expo-linear-gradient";
import Card from "../../components/MenuCard/Card";
import GreetingBar from "../../components/UpperGreetingBar/GreetingBar";
import { screenName } from "../../utils/screenName";
import { useNavigationState } from "../../context/NavigationContext";
import i18n from "../../../i18n";
import { useLanguage } from "../../context/LanguageContext";
import { useApiData } from "../../context/ApiContext";
import { colors } from "../../utils/colors";

//---ADS---
import {
  InterstitialAd,
  TestIds,
  AdEventType,
} from "react-native-google-mobile-ads";

import { usePushNotifications } from "../../hooks/usePushNotifications";
import { useAuth } from "../../context/AuthContext";
import {
  handleQueryRandom,
  handleQueryToken,
  handleUploadFirestore,
} from "../../utils/firestoreUtils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RattingDialog from "../../components/RattingDialog/RattingDialog";

//---ADS---
const adUnitId = __DEV__
  ? TestIds.INTERSTITIAL
  : "ca-app-pub-9577714849380446/7080054250";
// const adUnitId = "ca-app-pub-9577714849380446/7080054250";

const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
  keywords: ["spiritualitate", "bunăstare"],
});

// const interstitial = "";

const ClinicDashboard = () => {
  const [loaded, setLoaded] = useState(false);
  const [cardAnimations, setCardAnimations] = useState([]);
  const initialAnimations = useRef(Array(4).fill(null)).current; // Utilizarea useRef pentru a păstra starea inițială
  const { language, changeLanguage } = useLanguage();
  const { userData, currentUser, isGuestUser } = useAuth();
  const [visible, setVisible] = useState(false);

  const { expoPushToken } = usePushNotifications();

  useEffect(() => {
    const handleUploadToken = async () => {
      if (expoPushToken) {
        console.log("Expo Push Token.........: ", expoPushToken.data);

        const timestamp = Date.now().toString(36);
        const randomPart = Math.random().toString(36).substring(2, 8);
        let uniqueId = timestamp + randomPart;
        let tokenExists = await handleQueryToken(
          "userTokens",
          expoPushToken.data
        );
        // Logica pentru utilizatori autentificați
        if (!tokenExists) {
          await handleUploadFirestore(
            { token: expoPushToken.data, language },
            `userTokens/${uniqueId}`
          );
        }
      }
    };
    if (expoPushToken) {
      handleUploadToken(); // Apelarea funcției
    }
  }, [expoPushToken, isGuestUser, userData]);

  const {
    oreNorocoase,
    numereNorocoase,
    culoriNorocoase,
    citateMotivationale,
    categoriiViitor,
    cartiViitor,
    varianteCarti,
    categoriiPersonalizate,
    cartiPersonalizate,
    loading,
    error,
    fetchData,
    zilnicCitateMotivationale,
  } = useApiData();

  const cardData = [
    {
      text: i18n.translate("personalReading"),
      screen: screenName.PersonalReadingDashboard,
    },
    {
      text: i18n.translate("futureReading"),
      screen: screenName.FutureReadingDashboard,
    },
    {
      text: i18n.translate("luckyNumber"),
      screen: screenName.luckyNumber,
    },
    {
      text: i18n.translate("luckyColor"),
      screen: screenName.luckyColor,
    },
    {
      text: i18n.translate("luckyHours"),
      screen: screenName.luckyHour,
    },
    {
      text: i18n.translate("motivationalQuotes"),
      screen: screenName.motivationalQuotes,
    },
    {
      text: i18n.translate("carteaTa"),
      screen: "CarteaTa",
    },
    {
      text: i18n.translate("ceGandeste"),
      screen: "CeGandeste",
    },
    {
      text: i18n.translate("ceSimte"),
      screen: "CeSimte",
    },
    {
      text: i18n.translate("EnergiaDinRelație"),
      screen: "EnergiaDinRelație",
    },
    {
      text: i18n.translate("ViitorApropiat"),
      screen: "ViitorApropiat",
    },
    {
      text: i18n.translate("AfirmatiiPozitive"),
      screen: "AfirmatiiPozitive",
    },
  ];

  useEffect(() => {
    console.log("asdsa");
    console.log(zilnicCitateMotivationale);
    // console.log("asdsa");
    const screenWidth = Dimensions.get("window").width;

    // Inițializarea animațiilor doar dacă nu au fost setate anterior
    if (initialAnimations.every((elem) => elem === null)) {
      initialAnimations.forEach((_, index) => {
        initialAnimations[index] = new Animated.Value(screenWidth);
      });

      setCardAnimations(initialAnimations);

      animateCard(0); // Începe animația pentru primul card
    }
  }, []);

  const animateCard = (index) => {
    if (index < initialAnimations.length) {
      Animated.timing(initialAnimations[index], {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => animateCard(index + 1));
    }
  };

  const renderCard = (card, index, interstitial, interstitialAdLoaded) => {
    return (
      <Card
        key={index}
        text={card.text}
        screen={card.screen}
        image={require("../../../assets/dash-frame.png")}
        interstitial={interstitial}
        interstitialAdLoaded={interstitialAdLoaded}
      />
    );
  };

  // Restul logicii și a codului specific aplicației...

  const screenHeight = Dimensions.get("window").height;

  //---ADS---
  useEffect(() => {
    const loadListener = interstitial.addAdEventListener(
      AdEventType.LOADED,
      () => {
        setLoaded(true);
      }
    );
    const closeListener = interstitial.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        setLoaded(false);
        interstitial.load(); // Reîncarcă reclama pentru o utilizare ulterioară
      }
    );
    const errorListener = interstitial.addAdEventListener(
      AdEventType.ERROR,
      (error) => {
        console.error(error);
      }
    );

    interstitial.load(); // Începe încărcarea anunțului

    return () => {
      loadListener();
      closeListener();
      errorListener();
    };
  }, []);

  // // No advert ready to show yet
  // if (!loaded) {
  //   return null;
  // }

  useFocusEffect(
    useCallback(() => {
      const manageVisibility = async () => {
        const userRating = await AsyncStorage.getItem("userRating");
        console.log("useRating...", userRating);
        const entryCount = parseInt(
          (await AsyncStorage.getItem("entryCount")) || "0",
          10
        );
        await AsyncStorage.setItem("entryCount", (entryCount + 1).toString());

        // if ((entryCount + 1) % 5 === 0 && userRating === null) {
        if ((entryCount + 1) % 5 === 0) {
          console.log("true....");
          setVisible(true);
        } else {
          console.log("false....");
          setVisible(false);
        }
      };

      manageVisibility();
    }, [])
  );

  return (
    <Fragment>
      <MainContainer>
        <LinearGradient
          colors={[
            colors.gradientLogin1,
            colors.gradientLogin2,
            colors.gradientLogin2,
          ]} // Înlocuiește cu culorile gradientului tău
          style={{
            flex: 1,
            paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
          }}
        >
          <ImageBackground
            source={require("../../../assets/bg-horizontalLines.png")}
            resizeMode="cover"
            style={{
              flex: 1,
              width: null,
              height: null,
              // alignItems: 'flex-end',
            }}
          >
            <GreetingBar />
            <ScrollView
              style={{
                paddingTop: "3%",
              }}
              contentContainerStyle={{
                flexGrow: 1,
                justifyContent: "flex-start",
                alignItems: "center",
                paddingBottom: "23%",
              }}
            >
              {/* <View style={styles.cardRow}>
                <Text>{expoPushToken?.data}</Text>
              </View> */}
              <View style={styles.cardRow}>
                {cardData.map((card, index) =>
                  renderCard(card, index, interstitial, loaded)
                )}
              </View>
            </ScrollView>
          </ImageBackground>
          {visible && (
            <RattingDialog setVisible={setVisible} visible={visible} />
          )}
        </LinearGradient>
      </MainContainer>
    </Fragment>
  );
};

export default ClinicDashboard;

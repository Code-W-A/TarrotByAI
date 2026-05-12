import { LinearGradient } from "expo-linear-gradient";
import { ImageBackground, TouchableOpacity, Image, Modal, ScrollView, StyleSheet as RNStyleSheet } from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';

import React, { useCallback, useEffect, useState } from "react";
import { Platform, SafeAreaView, StyleSheet, View, BackHandler } from "react-native";
import {
  Button,
  Caption,
  Subheading,
  Surface,
  Text,
  Title,
  useTheme,
} from "react-native-paper";

import Leo from "../../../svgs/Leo";
import Constellation from "../../../svgs/backgrounds/Constellation";
import ConstellationSimple from "../../../svgs/backgrounds/ConstellationSimple";
import ShadowHeadline from "../../../components/Astral/components/shadow-headline";
import ScrollViewFadeFirst from "../../../components/Astral/components/scroll-view-fade-first";
import { colors } from "../../../utils/colors";
import { StatusBar } from "react-native";
import {
  H10fontRegularWhite,
  H6fontBoldPurple,
  H6fontBoldWhite,
  H6fontBoldYellow,
  H7fontBoldWhite,
  H8fontBoldPrimary,
  H8fontMediumWhite,
  H9fontMediumBlack,
  H9fontMediumBlue,
  H9fontMediumWhite,
  H9fontRegularGray,
} from "../../../components/commonText";
import i18n from "../../../../i18n";

// ADS COMPLETELY REMOVED FOR DEBUGGING
// import {
//   InterstitialAd,
//   TestIds,
//   AdEventType,
// } from "react-native-google-mobile-ads";
import { useNavigationState } from "../../../context/NavigationContext";
import InLove from "../../../svgs/InLove";
import Palmistry from "../../../svgs/Palmistry";
import SolarSystem from "../../../svgs/SolarSystem";
import Married from "../../../svgs/Married";
import Male from "../../../svgs/Male";
import Dices from "../../../svgs/Dices";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../../context/AuthContext";
import MoreInfoModal from "../../../components/Astral/components/MoreInfoModal";
import PurchaseSupportModal from "../../../components/Astral/components/PurchaseSupportModal";
import { doc, getFirestore, updateDoc } from "firebase/firestore";
import { screenName } from "../../../utils/screenName";

const SubHeading = () => {
  return (
    <View
      style={{
        marginHorizontal: 20,
        alignItems: "center",
      }}
    >
      <Text
        style={{
          color: "black", // gold
          fontSize: 22,
          fontWeight: "700",
          fontFamily: "LoraBold",
          textAlign: "center",
          marginBottom: 4,
          letterSpacing: 1.1,
          textShadowColor: '#fffbeae0',
          textShadowOffset: { width: 0, height: 2 },
          textShadowRadius: 6,
        }}
      >
        {i18n.translate("digitalAstrology")}
      </Text>
      <View style={{ height: 10 }} />
      <Text
        style={{
          color: "#2D2A22", // dark elegant
          fontSize: 16,
          fontFamily: "Lora",
          textAlign: "center",
          opacity: 1,
          maxWidth: 340,
          letterSpacing: 0.2,
        }}
      >
        {i18n.translate(
          "exploreTheNatalChartAnalyzeRelationshipsThroughSynastryAndDiscoverDailyHoroscopeForecasts"
        )}
      </Text>
    </View>
  );
};

/**
 * @param navigation
 * @returns {*}
 * @constructor
 */
//----ADS----
// const adUnitId = __DEV__
//   ? TestIds.INTERSTITIAL
//   : Platform.OS === "android"
//     ? "ca-app-pub-9577714849380446/7080054250"
//     : "ca-app-pub-9577714849380446/5660268593";
// const adUnitId = "ca-app-pub-9577714849380446/7080054250";

// const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
//   keywords: ["spiritualitate", "bunăstare"],
// });

function LearnScreen({ navigation }) {
  const { setCurrentScreen } = useNavigationState();
  const [loaded, setLoaded] = useState(false);
  const [userD, setUserD] = useState({});
  // Stări pentru informațiile utilizatorului
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isModalVisible, setModalVisible] = useState(false);
  const [supportModalVisible, setSupportModalVisible] = useState(false);
  const { currentUser, userData, isGuestUser, setUserData } = useAuth();

  useEffect(() => {
    const checkAndLoadData = async () => {
      try {
        const storedData = await AsyncStorage.getItem("userDetails");
        const parsedData = storedData ? JSON.parse(storedData) : null;
        console.log("parsedData.....", parsedData);

        if (parsedData) {
          setFirstName(parsedData.firstName);
          setLastName(parsedData.lastName);
          setEmail(parsedData.email);
          setPhone(parsedData.phone);
        }
      } catch (error) {
        console.error("Eroare la încărcarea datelor din AsyncStorage:", error);
      }
    };

    checkAndLoadData(); // Apelează funcția în cadrul useEffect
  }, []); // Array-ul gol asigură rularea doar la montarea componentului

  // ADS COMPLETELY REMOVED - useEffect commented out
  // useEffect(() => {
  //   const loadListener = interstitial.addAdEventListener(
  //     AdEventType.LOADED,
  //     () => {
  //       setLoaded(true);
  //     }
  //   );
  //   const closeListener = interstitial.addAdEventListener(
  //     AdEventType.CLOSED,
  //     () => {
  //       setLoaded(false);
  //       interstitial.load(); // Reîncarcă reclama pentru o utilizare ulterioară
  //     }
  //   );
  //   const errorListener = interstitial.addAdEventListener(
  //     AdEventType.ERROR,
  //     (error) => {
  //       console.error(error);
  //     }
  //   );

  //   interstitial.load(); // Începe încărcarea anunțului

  //   return () => {
  //     loadListener();
  //     closeListener();
  //     errorListener();
  //   };
  // }, []);

  useFocusEffect(
    useCallback(() => {
      const fetchUserData = async () => {
        const userDataJson = await AsyncStorage.getItem("userData");
        const userData = userDataJson ? JSON.parse(userDataJson) : null;
        if (!userData.actualLanguage) {
          userData.actualLanguage = "en";
          await AsyncStorage.setItem("userData", JSON.stringify(userData));
        }
        if (!userData.actualLanguageAstrograma) {
          userData.actualLanguageAstrograma = "en";
          await AsyncStorage.setItem("userData", JSON.stringify(userData));
        }
        if (!userData.actualLanguageSinastrie) {
          userData.actualLanguageSinastrie = "en";
          await AsyncStorage.setItem("userData", JSON.stringify(userData));
        }
        setUserD(userData);
      };

      fetchUserData();

      // Funcția de curățare opțională
      return () => {
        // Cod pentru curățare, dacă este necesar
      };
    }, []) // Dependențele sunt opționale și pot fi omise dacă datele trebuie reîncărcate la fiecare focalizare
  );

  // Gestionează butonul de back al telefonului
  useEffect(() => {
    const backAction = () => {
      // Navighează către ClinicDashBoard în loc să meargă înapoi în stack
      navigation.navigate(screenName.ClinicDashBoard);
      return true; // Previne comportamentul default de back
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [navigation]);

  const handleViewLesson = async (lesson) => {
    console.log("lesson....", lesson);
    if (loaded) {
      try {
        // await interstitial.show();
        navigation.navigate(lesson);
        setCurrentScreen(screen);
      } catch (error) {
        console.error("InterstitialAd.show() error:", error);
        navigation.navigate(lesson);
        setCurrentScreen(screen);
      }
    } else {
      navigation.navigate(lesson);
      setCurrentScreen(screen);
    }
  };

  const handleConfirm = async (firstName, lastName, email, phone) => {
    const userDetails = { firstName, lastName, email, phone };

    try {
      // Salvează datele local în AsyncStorage
      await AsyncStorage.setItem("userDetails", JSON.stringify(userDetails));

      // // Șterge datele din cheile specificate
      // const keysToRemove = [
      //   "userData",
      //   "personsDataAstrograma",
      //   "personsData",
      //   "personsDataOthers",
      // ];
      // await Promise.all(
      //   keysToRemove.map((key) => AsyncStorage.removeItem(key))
      // );

      // Actualizează state-ul local
      setFirstName(firstName);
      setLastName(lastName);
      setEmail(email);
      setPhone(phone);

      // Dacă există `owner_uid`, trimite telefonul în Firestore
      if (userData?.owner_uid) {
        const db = getFirestore();
        const userDocRef = doc(db, "Users", userData.owner_uid);

        await updateDoc(userDocRef, {
          phone,
        });

        console.log(
          `Numărul de telefon ${phone} a fost actualizat în Firestore.`
        );
      }

      setModalVisible(false);
      console.log("Datele au fost actualizate cu succes.");
    } catch (error) {
      console.error(
        "Eroare la salvarea datelor în AsyncStorage sau Firestore:",
        error
      );
    } finally {
      navigation.navigate(screenName.ClinicDashBoard);
    }
  };

  return (
    <ImageBackground source={require('../../../../assets/dashboardbg.jpg')} style={{ flex: 1 }}>
      {/* Overlay alb translucid */}
      <View style={learnScreenStyles.overlay} pointerEvents="none" />
      <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 }}>
        {/* Header compact, ca pe TarotMainScreen */}
        <View style={learnScreenStyles.fixedHeader}>
          <View style={learnScreenStyles.headerRow}>
            <Image source={require("../../../../assets/LogoPngTransparent.png")} style={learnScreenStyles.logo} resizeMode="contain" />
            <View style={learnScreenStyles.headerTextBlock}>
              <Text style={learnScreenStyles.headerSalute}>{i18n.translate('digitalAstrology')}</Text>
            </View>
          </View>
        </View>
        <ScrollView contentContainerStyle={learnScreenStyles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={learnScreenStyles.sectionContainer}>
            <View style={learnScreenStyles.subSectionGrid}>
              {/* Card 1: Natal Astrogram */}
              <View style={{
                backgroundColor: 'rgba(255,255,255,0.97)',
                borderRadius: 18,
                paddingVertical: 24,
                paddingHorizontal: 24,
                marginBottom: 18,
                shadowColor: '#bfa76a',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.13,
                shadowRadius: 16,
                elevation: 7,
                width: '100%',
              }}>
                <TouchableOpacity onPress={() => handleViewLesson("PersonsListAstrograma")} activeOpacity={0.85} style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                  <MaterialCommunityIcons name="account-circle-outline" size={48} color="#FFD700" style={{ marginRight: 18 }} />
                  <Text style={{ fontSize: 28, fontWeight: '700', color: '#FFD700', flex: 1 }}>{i18n.translate("natalAstrogram")}</Text>
                </TouchableOpacity>
              </View>
              {/* Card 2: Daily Horoscope */}
              <View style={{
                backgroundColor: 'rgba(255,255,255,0.97)',
                borderRadius: 18,
                paddingVertical: 24,
                paddingHorizontal: 24,
                marginBottom: 18,
                shadowColor: '#bfa76a',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.13,
                shadowRadius: 16,
                elevation: 7,
                width: '100%',
              }}>
                <TouchableOpacity onPress={() => handleViewLesson("Horoscop")} activeOpacity={0.85} style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                  <MaterialCommunityIcons name="calendar-star" size={48} color="#FFD700" style={{ marginRight: 18 }} />
                  <Text style={{ fontSize: 28, fontWeight: '700', color: '#FFD700', flex: 1 }}>{i18n.translate("dailyHoroscope")}</Text>
                </TouchableOpacity>
              </View>
              {/* Card 3: Sinastrie Partener */}
              <View style={{
                backgroundColor: 'rgba(255,255,255,0.97)',
                borderRadius: 18,
                paddingVertical: 24,
                paddingHorizontal: 24,
                marginBottom: 18,
                shadowColor: '#bfa76a',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.13,
                shadowRadius: 16,
                elevation: 7,
                width: '100%',
              }}>
                <TouchableOpacity onPress={() => handleViewLesson("PersonsList")} activeOpacity={0.85} style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                  <MaterialCommunityIcons name="account-group-outline" size={48} color="#FFD700" style={{ marginRight: 18 }} />
                  <Text style={{ fontSize: 28, fontWeight: '700', color: '#FFD700', flex: 1 }}>{i18n.translate("sinastriePartener")}</Text>
                </TouchableOpacity>
              </View>
              {/* Card 4: Reintrodu date */}
              <View style={{
                backgroundColor: 'rgba(255,255,255,0.97)',
                borderRadius: 18,
                paddingVertical: 24,
                paddingHorizontal: 24,
                marginBottom: 18,
                shadowColor: '#bfa76a',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.13,
                shadowRadius: 16,
                elevation: 7,
                width: '100%',
              }}>
                <TouchableOpacity onPress={() => setModalVisible(true)} activeOpacity={0.85} style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                  <MaterialCommunityIcons name="account-edit-outline" size={48} color="#FFD700" style={{ marginRight: 18 }} />
                  <Text style={{ fontSize: 28, fontWeight: '700', color: '#FFD700', flex: 1 }}>{i18n.translate("sinasUpdate") || "Update Info"}</Text>
                </TouchableOpacity>
              </View>
              {/* Card 5: Contact support */}
              <View style={{
                backgroundColor: 'rgba(255,255,255,0.97)',
                borderRadius: 18,
                paddingVertical: 24,
                paddingHorizontal: 24,
                marginBottom: 18,
                shadowColor: '#bfa76a',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.13,
                shadowRadius: 16,
                elevation: 7,
                width: '100%',
              }}>
                <TouchableOpacity onPress={() => setSupportModalVisible(true)} activeOpacity={0.85} style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                  <MaterialCommunityIcons name="lifebuoy" size={48} color="#FFD700" style={{ marginRight: 18 }} />
                  <Text style={{ fontSize: 28, fontWeight: '700', color: '#FFD700', flex: 1 }}>{i18n.translate("contactSupportCta")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
        {isModalVisible && (
          <MoreInfoModal
            visible={isModalVisible}
            onDismiss={() => setModalVisible(false)}
            onConfirm={handleConfirm}
            email={email}
            setEmail={setEmail}
            phone={phone}
            setPhone={setPhone}
            firstName={firstName}
            setFirstName={setFirstName}
            lastName={lastName}
            setLastName={setLastName}
          />
        )}
        <PurchaseSupportModal
          visible={supportModalVisible}
          onDismiss={() => setSupportModalVisible(false)}
          defaultProductCode="natal_astrogram"
          language={userD?.actualLanguage || i18n.locale || "ro"}
        />
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginTop: 10,
  },
  adviceContainer: {
    marginTop: 20,
    marginHorizontal: 20,
    borderWidth: 1,
    borderRadius: 25,
    padding: 20,
  },
  adviceClose: { position: "absolute", top: 20, right: 20, zIndex: 2 },
  surfaceRight: {
    elevation: 3,
    height: "auto",
    flexDirection: "row",

    borderRadius: 25,
    marginHorizontal: 20,
    overflow: "hidden",
  },
  surfaceLeft: {
    elevation: 3,
    height: 170,
    flexDirection: "row-reverse",
    borderRadius: 25,
    marginHorizontal: 20,
    overflow: "hidden",
  },
  gradientRight: {
    padding: 15,
    borderTopRightRadius: 25,
    borderBottomRightRadius: 25,
    flex: 1,
    flexDirection: "row",
  },
  gradientLeft: {
    padding: 15,
    borderTopRightRadius: 25,
    borderBottomRightRadius: 25,
    flex: 1,
    flexDirection: "row",
  },
});

// Stiluri pentru cardurile LearnScreen
const learnCardStyles = StyleSheet.create({
  cardBox: {
    width: '90%',
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 18,
    alignItems: 'center',
    marginBottom: 18,
    paddingVertical: 24,
    paddingHorizontal: 8,
    shadowColor: '#bfa76a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1.5,
    borderColor: '#FFD700',
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#fffbe6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#FFD700',
    shadowColor: '#bfa76a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
  },
  cardLabel: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: '#FFD700',
    textShadowColor: '#B8860B',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
    fontFamily: 'LoraBold',
  },
});

// Stiluri pentru layout LearnScreen ca pe TarotMainScreen
const learnScreenStyles = RNStyleSheet.create({
  overlay: {
    ...RNStyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0)',
    zIndex: 2,
  },
  fixedHeader: {
    backgroundColor: 'rgba(255,255,255,1)',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingBottom: 4,
    paddingTop: 6,
    paddingHorizontal: 10,
    shadowColor: '#bfa76a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 6,
    zIndex: 10,
    borderBottomWidth: 1,
    borderColor: '#e7c585',
    minHeight: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 0,
    justifyContent: 'space-between',
    gap: 8,
    width: '100%',
  },
  logo: {
    width: 38,
    height: 38,
    marginRight: 8,
    borderRadius: 12,
    backgroundColor: '#fffbe6',
    borderWidth: 1.5,
    borderColor: '#e7c585',
    shadowColor: '#bfa76a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTextBlock: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    minHeight: 0,
    paddingTop: 2,
  },
  headerSalute: {
    fontSize: 19,
    fontWeight: 'bold',
    letterSpacing: 0.2,
    marginBottom: 0,
    color: '#FFD700',
    textShadowColor: '#B8860B',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
    fontFamily: 'LoraBold',
  },
  scrollContent: {
    paddingBottom: 100,
    paddingTop: 16,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  sectionContainer: {
    width: '100%',
    marginBottom: 6,
    paddingHorizontal: 10,
  },
  subSectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 8,
  },
  subSectionCardBox: {
    width: '48%',
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 16,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    shadowColor: '#bfa76a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1.5,
    borderColor: '#FFD700',
  },
  functionalCardContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  functionalCardLabel: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    color: '#FFD700',
    textShadowColor: '#B8860B',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
    fontFamily: 'LoraBold',
  },
});

// === START: Copiat din TarotMainScreen ===
const tarotCardStyles = RNStyleSheet.create({
  subSectionCardBox: {
    width: '48%',
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  functionalCardContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  functionalCardLabel: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    color: '#FFD700',
    textShadowColor: '#B8860B',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
    fontFamily: 'LoraBold',
  },
});
// === END: Copiat din TarotMainScreen ===

export default LearnScreen;

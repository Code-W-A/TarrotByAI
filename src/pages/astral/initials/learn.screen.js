import { LinearGradient } from "expo-linear-gradient";

import React, { useCallback, useEffect, useState } from "react";
import { Platform, SafeAreaView, StyleSheet, View } from "react-native";
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
import SpaceSky from "../../../components/Astral/components/space-sky";
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

//---ADS---
import {
  InterstitialAd,
  TestIds,
  AdEventType,
} from "react-native-google-mobile-ads";
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
          color: "#C9A14A", // gold
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
          opacity: 0.85,
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
const adUnitId = __DEV__
  ? TestIds.INTERSTITIAL
  : "ca-app-pub-9577714849380446/7080054250";
// const adUnitId = "ca-app-pub-9577714849380446/7080054250";

const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
  keywords: ["spiritualitate", "bunăstare"],
});

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
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient
        colors={[
          '#F7E7B4', // Aurie pastel, foarte soft, sus
          '#F9EFD6CC', // Crem-auriu luminos, semi-transparent
          '#FAF7F2',   // Crem foarte deschis
          '#FFFBEA00'  // Complet transparent jos
        ]}
        style={{
          flex: 1,
          paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
        }}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      >
        <SpaceSky />
        <View style={{ marginBottom: 10 }}>
          <View style={styles.headerContainer}>
            <ShadowHeadline>{""}</ShadowHeadline>
          </View>
        </View>
        <ScrollViewFadeFirst element={<SubHeading />} height={140}>
          <Surface
            style={[
              styles.surfaceRight,
              { backgroundColor: "#fffbeae0", marginTop: 10, borderColor: "#C9A14A", borderWidth: 1.2 },
            ]}
          >
            <View style={[StyleSheet.absoluteFill, { top: -10, left: -10, opacity: 0.32 }]}>
              <Constellation
                color={'#C9A14A99'}
                dotColor={'#C9A14A'}
                width={280}
                height={340}
              />
            </View>
            <LinearGradient
              colors={["#FFFBEA99", "#FAF7F299", "#F7E7B499"]}
              start={[0, 0]}
              end={[1, 0]}
              style={styles.gradientRight}
            >
              <View style={{ flex: 0.8 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#C9A14A', fontFamily: 'LoraBold', fontSize: 18, marginBottom: 2 }}>{i18n.translate("natalAstrogram")}</Text>
                <Text style={{ color: '#2D2A22', fontFamily: 'Lora', fontSize: 15, marginBottom: 0 }}>{i18n.translate("exploreTheAstralProfile")}</Text>
                <Text style={{ color: '#2D2A22', fontFamily: 'Lora', fontSize: 15, marginTop: -3 }}>{i18n.translate("withTheNatalAstrogram")}</Text>
                <View style={{ heigt: 200, justifyContent: "flex-start" }}>
                  <Button
                    mode="contained"
                    style={{ borderRadius: 25, marginTop: 5 }}
                    theme={{
                      colors: {
                        primary: '#C9A14A',
                        text: "#2D2A22",
                      },
                    }}
                    labelStyle={{ fontSize: 12, letterSpacing: 0 }}
                    onPress={() => handleViewLesson("PersonsListAstrograma")}
                  >
                    {i18n.translate("seeTheAstrogram")}
                  </Button>
                </View>
              </View>
            </LinearGradient>
          </Surface>
          <View style={{ height: 20 }} />

          <Surface
            style={[styles.surfaceRight, { backgroundColor: "#fffbeae0", borderColor: "#C9A14A", borderWidth: 1.2 }]}
          >
            <View style={[StyleSheet.absoluteFill, { top: -10, left: -10, opacity: 0.28 }]}>
              <Leo color={'#C9A14A'} width={220} height={220} />
            </View>
            <LinearGradient
              colors={["#FFFBEA99", "#FAF7F299", "#F7E7B499"]}
              start={[0, 0]}
              end={[1, 0]}
              style={styles.gradientRight}
            >
              <View style={{ flex: 0.8 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#C9A14A', fontFamily: 'LoraBold', fontSize: 18, marginBottom: 2 }}>{i18n.translate("dailyHoroscope")}</Text>
                <Text style={{ color: '#2D2A22', fontFamily: 'Lora', fontSize: 15 }}>{i18n.translate("personalizedHoroscope")}</Text>
                <View style={{ flex: 1, justifyContent: "flex-end" }}>
                  <Button
                    mode="contained"
                    style={{ borderRadius: 25, marginTop: 5 }}
                    theme={{
                      colors: {
                        primary: '#C9A14A',
                        text: "#2D2A22",
                      },
                    }}
                    labelStyle={{ fontSize: 12, letterSpacing: 0 }}
                    onPress={() => handleViewLesson("Horoscop")}
                  >
                    {i18n.translate("seeTheHoroscope")}
                  </Button>
                </View>
              </View>
            </LinearGradient>
          </Surface>
          <View style={{ height: 20 }} />

          <Surface
            style={[styles.surfaceRight, { backgroundColor: "#fffbeae0", borderColor: "#C9A14A", borderWidth: 1.2 }]}
          >
            <View style={[StyleSheet.absoluteFill, { top: -10, left: -10, opacity: 0.28 }]}>
              <Married color={'#C9A14A'} width={170} height={170} />
            </View>
            <LinearGradient
              colors={["#FFFBEA99", "#FAF7F299", "#F7E7B499"]}
              start={[0, 0]}
              end={[1, 0]}
              style={styles.gradientRight}
            >
              <View style={{ flex: 0.8 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#C9A14A', fontFamily: 'LoraBold', fontSize: 18, marginBottom: 2 }}>{i18n.translate("sinastriePartener")}</Text>
                <Text style={{ color: '#2D2A22', fontFamily: 'Lora', fontSize: 15 }}>Lista Persoane</Text>
                <View style={{ flex: 1, justifyContent: "flex-end" }}>
                  <Button
                    mode="contained"
                    style={{ borderRadius: 25, marginTop: 5 }}
                    theme={{
                      colors: {
                        primary: '#C9A14A',
                        text: "#2D2A22",
                      },
                    }}
                    labelStyle={{ fontSize: 12, letterSpacing: 0 }}
                    onPress={() => handleViewLesson("PersonsList")}
                  >
                    {i18n.translate("clinicLoginRedirect")}
                  </Button>
                </View>
              </View>
            </LinearGradient>
          </Surface>
          <View style={{ height: 20 }} />

          <Surface
            style={[
              styles.surfaceLeft,
              { backgroundColor: "#fffbeae0", height: 140, borderColor: "#C9A14A", borderWidth: 1.2 },
            ]}
          >
            <View
              style={[StyleSheet.absoluteFill, { right: 120, opacity: 0.22 }]}
            >
              <ConstellationSimple
                color={'#C9A14A99'}
                dotColor={'#C9A14A'}
                width={220}
                height={170}
              />
            </View>
            <LinearGradient
              colors={["#FFFBEA99", "#FAF7F299", "#F7E7B499"]}
              start={[0, 0]}
              end={[1, 0]}
              style={styles.gradientLeft}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#2D2A22', fontFamily: 'Lora', fontSize: 15 }}>
                  {i18n.translate(
                    "updateYourInformationToReceiveTheMostAccurateAnalyses"
                  )}
                </Text>
                <View style={{ flex: 1, justifyContent: "flex-start" }}>
                  <Button
                    mode="contained"
                    style={{ borderRadius: 25, marginTop: 5 }}
                    theme={{
                      colors: {
                        primary: '#C9A14A',
                        text: "#2D2A22",
                      },
                    }}
                    labelStyle={{ fontSize: 12, letterSpacing: 0 }}
                    onPress={() => {
                      setModalVisible(true);
                      navigation.navigate("Learn");
                    }}
                  >
                    {i18n.translate("update")}
                  </Button>
                </View>
              </View>
              <View style={{ flex: 0.6 }} />
            </LinearGradient>
          </Surface>
          <View style={{ height: 20 }} />
        </ScrollViewFadeFirst>
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
      </LinearGradient>
    </SafeAreaView>
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

export default LearnScreen;

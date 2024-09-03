import { LinearGradient } from "expo-linear-gradient";

import React, { useEffect, useState } from "react";
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
  H8fontBoldWhite,
  H8fontBoldYellow,
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
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Aquarius from "../../../svgs/Aquarius";
import Aries from "../../../svgs/zodiac/Aries";
import Cancer from "../../../svgs/zodiac/Cancer";
import Capricorn from "../../../svgs/zodiac/Capricorn";
import Gemini from "../../../svgs/zodiac/Gemini";
import Libra from "../../../svgs/zodiac/Libra";
import Pisces from "../../../svgs/zodiac/Pisces";
import Sagittarius from "../../../svgs/zodiac/Sagittarius";
import Scorpio from "../../../svgs/zodiac/Scorpio";
import Taurus from "../../../svgs/zodiac/Taurus";
import Virgo from "../../../svgs/zodiac/Virgo";
import ZodiacComponent from "../../../components/Astral/components/ZodiacComponent";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SubHeading = () => {
  const { colors } = useTheme();
  return (
    <View
      style={{
        marginHorizontal: 20,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <H6fontBoldYellow style={{ textAlign: "center" }}>
        {i18n.translate("digitalAstrology")}
      </H6fontBoldYellow>
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

function PersonsScreen({ navigation }) {
  const { setCurrentScreen } = useNavigationState();

  const [loaded, setLoaded] = useState(false);
  const [userD, setUserD] = useState({});
  const route = useNavigation();

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

  useEffect(() => {
    const checkUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        const parsedData = JSON.parse(userData);
        console.log("parsedData....", parsedData.zodiacSign);
        setUserD(parsedData);
        // console.log("Retrieved user data:", userData);
        // if (userData) {
        //   navigation.navigate("Learn");
        // }
      } catch (error) {
        console.error("Error checking user data:", error);
      }
    };
    checkUserData();
  }, []);

  const handleViewLesson = async (lesson) => {
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

  return (
    <SafeAreaView style={{ flex: 1 }}>
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
          colors.gradientLogin1,
          colors.gradientLogin11,
        ]} // Înlocuiește cu culorile gradientului tău
        style={{
          flex: 1,
          paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
        }}
      >
        <SpaceSky />
        <View style={{ marginBottom: 10 }}>
          <View style={styles.headerContainer}>
            <ShadowHeadline>{""}</ShadowHeadline>
          </View>
        </View>
        <ScrollViewFadeFirst element={<SubHeading />} height={70}>
          <View style={{ height: 20 }} />
          <Surface
            style={[
              styles.surfaceLeft,
              { backgroundColor: "transparent", height: 140 },
            ]}
          >
            <View
              style={[StyleSheet.absoluteFill, { right: 150, opacity: 0.4 }]}
            >
              {userD?.zodiacSign && <ZodiacComponent userD={userD} />}
            </View>
            <LinearGradient
              colors={["#4c4c4c" + "E6", "#4c4c4c" + "E6", "transparent"]}
              start={[0, 0]}
              end={[1, 0]}
              style={styles.gradientLeft}
            >
              <View style={{ flex: 1 }}>
                {/* <H7fontBoldWhite>{"Sinastrie "}</H7fontBoldWhite> */}
                <H9fontMediumWhite>
                  {i18n.translate(
                    "updateYourInformationToReceiveTheMostAccurateAnalyses"
                  )}
                </H9fontMediumWhite>
                <View style={{ flex: 1, justifyContent: "flex-start" }}>
                  <Button
                    mode="contained"
                    // icon="lock-outline"
                    style={{ borderRadius: 25, marginTop: 5 }}
                    theme={{
                      colors: {
                        primary: colors.gradientLogin1,
                        text: "#FFFFFF",
                      },
                    }}
                    labelStyle={{ fontSize: 12, letterSpacing: 0 }}
                    onPress={() =>
                      navigation.navigate("Name", { editMode: true })
                    }
                  >
                    {i18n.translate("update")}
                  </Button>
                </View>
              </View>
              <View style={{ flex: 0.6 }} />
            </LinearGradient>
          </Surface>
          <View style={{ height: 20 }} />
          <Surface
            style={[styles.surfaceRight, { backgroundColor: "transparent" }]}
          >
            <View style={[StyleSheet.absoluteFill, { top: -25, opacity: 0.3 }]}>
              <InLove color={colors.white} width={160} height={160} />
            </View>
            <LinearGradient
              colors={["transparent", "#81411a3D", "#81411aE6", "#81411a"]}
              start={[0, 0]}
              end={[1, 0]}
              style={styles.gradientRight}
            >
              <View style={{ flex: 0.8 }} />
              <View style={{ flex: 1 }}>
                <H7fontBoldWhite>
                  {i18n.translate("sinastriePartener")}
                </H7fontBoldWhite>
                <H9fontMediumWhite>
                  {i18n.translate("sinasAdaugare")}
                </H9fontMediumWhite>
                <View style={{ flex: 1, justifyContent: "flex-end" }}>
                  <Button
                    mode="contained"
                    // icon="lock-outline"
                    style={{ borderRadius: 25, marginTop: 5 }}
                    theme={{
                      colors: {
                        primary: colors.gradientLogin1,
                        text: "#FFFFFF",
                      },
                    }}
                    labelStyle={{ fontSize: 12, letterSpacing: 0 }}
                    onPress={() =>
                      navigation.navigate("NewPerson", {
                        editMode: userD?.p2?.full_name ? true : false,
                      })
                    }
                  >
                    {userD?.p2?.full_name
                      ? i18n.translate("update")
                      : i18n.translate("clinicLoginRedirect")}
                  </Button>
                </View>
              </View>
            </LinearGradient>
          </Surface>
          <View style={{ height: 20 }} />
        </ScrollViewFadeFirst>
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

export default PersonsScreen;

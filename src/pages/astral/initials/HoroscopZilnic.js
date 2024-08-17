import { MaterialCommunityIcons } from "@expo/vector-icons";

import React, { Fragment, useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Divider, ProgressBar, Subheading } from "react-native-paper";
import { Sign } from "../../../components/Astral/components/zodiac";
import ShadowHeadline from "../../../components/Astral/components/shadow-headline";
import SpaceSky from "../../../components/Astral/components/space-sky";
import ScrollViewFadeFirst from "../../../components/Astral/components/scroll-view-fade-first";
import ShowFromTop from "../../../components/Astral/components/show-from-top";
import {
  H15fontMediumWhite,
  H8fontRegularWhite,
} from "../../../components/commonText";
import { colors } from "../../../utils/colors";
import { daily } from "../../../utils/daily";
import { MainContainer } from "../../../components/commonViews";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useLanguage } from "../../../context/LanguageContext";
import { handleToTranslate } from "../../../utils/AstralUtils/fetchGPTData";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { capitalizeFirstLetter } from "../../../utils/stringUtils";
import MyTopBar from "../../../components/Astral/components/TopBar";
import MyTopBarHoroscope from "../../../components/Astral/components/TopBarHoroscope";
import i18n from "../../../../i18n";
import LoadingOverlay from "../../../components/Astral/components/zodiac/LoadingOverlay";
import {
  fetchHoroscopeData,
  fetchHoroscopeDataMonth,
  fetchHoroscopeDataWeek,
  fetchHoroscopeDataYear,
} from "../../../utils/AstralUtils/fetchNatalWheelChart";
import localGif from "../../../../assets/constelatii.gif";

/**
 * @param number {number}
 * @returns {*}
 * @constructor
 */
const LuckyNumber = ({ number }) => {
  return (
    <View
      style={[
        LuckyNumberStyles.circle,
        { backgroundColor: colors.gradientLogin11 },
      ]}
    >
      <Text style={{ fontSize: 16, marginTop: 3, color: "white" }}>
        {number}
      </Text>
    </View>
  );
};

const LuckyNumberStyles = StyleSheet.create({
  circle: {
    borderRadius: 50,
    height: 30,
    width: 30,
    justifyContent: "center",
    alignItems: "center",
  },
});

/**
 * @param text {text}
 * @param percent {number}
 * @param style {object}
 * @returns {*}
 * @constructor
 */
const ProgressItem = ({ text, percent, style }) => {
  return (
    <View style={[{ flex: 1 }, style]}>
      <Text style={ProgressItemStyles.text}>{text}</Text>
      <ProgressBar style={ProgressItemStyles.bar} progress={percent / 100} />
      <Text style={{ color: "white" }}>{percent}%</Text>
    </View>
  );
};

const ProgressItemStyles = StyleSheet.create({
  text: {
    fontSize: 16,
    color: "white",
  },
  bar: {
    marginVertical: 5,
    borderRadius: 5,
  },
});

/**
 * @param navigation {object}
 * @returns {*}
 * @constructor
 */
const { width } = Dimensions.get("window");
function HoroscopZilnic({ navigation }) {
  const { language, changeLanguage, userData } = useLanguage();
  const [userD, setUserD] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isReloadingH, setIsReloadingH] = useState(false);
  const [selectedTab, setSelectedTab] = useState("zilnic");
  const [loadingMessage, setLoadingMessage] = useState(
    "Vă analizăm informațiile pentru a vă crea astrograma natală..."
  );
  const dataIndex = daily.findIndex(
    (item) =>
      item.day.split("-")[2].toString() === new Date().getDate().toString()
  );
  const data = daily[dataIndex !== -1 ? dataIndex : 0];
  const d = new Date();

  const Header = (
    <View>
      <MaterialCommunityIcons
        onPress={() => navigation.navigate("Learn")}
        name="arrow-left"
        color={colors.white}
        size={30}
        style={{ opacity: 1, top: "14%", left: "5%" }}
      />
      <View style={[styles.headerContainer]}>
        <Sign
          sign={
            userD.zodiacSign ? capitalizeFirstLetter(userD.zodiacSign) : "Leo"
          }
          showTitle={false}
          signWidth={70}
          signHeight={70}
        />
        <ShadowHeadline style={styles.headerHeadline}>
          {userD.zodiacSign}
        </ShadowHeadline>
        <Subheading style={{ color: "white" }}>
          {" "}
          {userD.day} - {userD.month} - {userD.year}
        </Subheading>
      </View>
      <Divider />
    </View>
  );

  const handleHoroscopReset = async () => {
    console.log("Start....");
    // const birthTime = selectedTime ? moment(selectedTime, "HH:mm") : moment(); // Presupunem ora curentă dacă timpul nu este selectat
    try {
      const userData = await AsyncStorage.getItem("userData");
      const userD = JSON.parse(userData);
      setIsReloadingH(true);
      console.log("user...data...", userD.dataHoroscop);

      const currentDate = new Date();
      const formattedDate = currentDate.toISOString().split("T")[0];

      userD.dataHoroscop = formattedDate;
      console.log("user...data...2", userD.dataHoroscop);

      // ------HOROSCOPE-----
      const horoscopeUrls = {
        dailyHoroscopePrediction:
          "https://divineapi.com/api/1.0/get_daily_horoscope.php",
        weeklyHoroscopePrediction:
          "https://divineapi.com/api/1.0/get_weekly_horoscope.php",
        monthlyHoroscopePrediction:
          "https://divineapi.com/api/1.0/get_monthly_horoscope.php",
        anualHoroscopePrediction:
          "https://divineapi.com/api/1.0/get_yearly_horoscope.php",
      };

      let horoscopeResultsDaily = await fetchHoroscopeData(
        horoscopeUrls.dailyHoroscopePrediction,
        userD.day,
        userD.month,
        userD.year,
        userD.zodiacSign,
        userD.tzone
      );
      let horoscopeResultsWeekly = await fetchHoroscopeDataWeek(
        horoscopeUrls.weeklyHoroscopePrediction,
        userD.day,
        userD.month,
        userD.year,
        userD.zodiacSign,
        userD.tzone
      );
      let horoscopeResultsMonthly = await fetchHoroscopeDataMonth(
        horoscopeUrls.monthlyHoroscopePrediction,
        userD.day,
        userD.month,
        userD.year,
        userD.zodiacSign,
        userD.tzone
      );
      let horoscopeResultsYearly = await fetchHoroscopeDataYear(
        horoscopeUrls.anualHoroscopePrediction,
        userD.day,
        userD.month,
        userD.year,
        userD.zodiacSign,
        userD.tzone
      );
      userD.horoscopeResultsDaily = horoscopeResultsDaily;
      userD.horoscopeResultsWeekly = horoscopeResultsWeekly;
      userD.horoscopeResultsMonthly = horoscopeResultsMonthly;
      userD.horoscopeResultsYearly = horoscopeResultsYearly;
      // ------HOROSCOPE-----

      await AsyncStorage.setItem("userData", JSON.stringify(userD));
      navigation.navigate("Learn");
      setIsReloadingH(false);
    } catch (error) {
      setIsReloadingH(false);
      console.error("Error saving user data:", error);
    }
  };

  const handleGetHoroscopeData = async () => {
    try {
      const currentDate = new Date();
      const formattedDate = currentDate.toISOString().split("T")[0];
      const userDataJson = await AsyncStorage.getItem("userData");
      const userData = userDataJson ? JSON.parse(userDataJson) : null;
      if (!userData.horoscopeResultsDaily) {
        navigation.navigate("Name", { editMode: true });
      }
      if (userData.dataHoroscop !== formattedDate) {
        await handleHoroscopReset();
        return;
      }
      setIsLoading(true);
      console.log("user lang...", userData.actualLanguage);
      console.log("userData...d...zilnic", userData.horoscopeResultsDaily.data);
      console.log(
        "userData...d...saptamanal",
        userData.horoscopeResultsWeekly.data
      );
      console.log(
        "userData...d...lunar",
        userData.horoscopeResultsMonthly.data
      );
      console.log("userData...d...anual", userData.horoscopeResultsYearly.data);

      if (!userData) {
        console.log(
          "Nu există date de utilizator disponibile în AsyncStorage."
        );
        setIsLoading(false);
        return;
      }
      console.log("data....here", language);
      console.log("data....here", userData.actualLanguage);
      if (language !== userData.actualLanguage) {
        console.log("data....no", language);
        userData.actualLanguage = language;

        // DAILY TRANSLATIONS
        let dEmotions = await handleToTranslate(
          userData.horoscopeResultsDaily?.data?.prediction?.emotions,
          language,
          userData.actualLanguage
        );
        userData.horoscopeResultsDaily.data.prediction.emotions = dEmotions;

        let dHealth = await handleToTranslate(
          userData.horoscopeResultsDaily?.data?.prediction?.health,
          language,
          userData.actualLanguage
        );
        userData.horoscopeResultsDaily.data.prediction.health = dHealth;

        let dPersonal = await handleToTranslate(
          userData.horoscopeResultsDaily?.data?.prediction?.personal,
          language,
          userData.actualLanguage
        );
        userData.horoscopeResultsDaily.data.prediction.personal = dPersonal;

        let dProfession = await handleToTranslate(
          userData.horoscopeResultsDaily?.data?.prediction?.profession,
          language,
          userData.actualLanguage
        );
        userData.horoscopeResultsDaily.data.prediction.profession = dProfession;

        let dTravel = await handleToTranslate(
          userData.horoscopeResultsDaily?.data?.prediction?.travel,
          language,
          userData.actualLanguage
        );
        userData.horoscopeResultsDaily.data.prediction.travel = dTravel;

        // DAILY LUCK TRANSLATIONS
        let dColors = await handleToTranslate(
          userData.horoscopeResultsDaily?.data?.prediction?.luck[0],
          language,
          userData.actualLanguage
        );
        userData.horoscopeResultsDaily.data.prediction.luck[0] = dColors;

        let dAlphabets = await handleToTranslate(
          userData.horoscopeResultsDaily?.data?.prediction?.luck[2],
          language,
          userData.actualLanguage
        );
        userData.horoscopeResultsDaily.data.prediction.luck[2] = dAlphabets;

        let dCosmic = await handleToTranslate(
          userData.horoscopeResultsDaily?.data?.prediction?.luck[3],
          language,
          userData.actualLanguage
        );
        userData.horoscopeResultsDaily.data.prediction.luck[3] = dCosmic;

        let dTipsSingles = await handleToTranslate(
          userData.horoscopeResultsDaily?.data?.prediction?.luck[4],
          language,
          userData.actualLanguage
        );
        userData.horoscopeResultsDaily.data.prediction.luck[4] = dTipsSingles;

        let dTipsCouples = await handleToTranslate(
          userData.horoscopeResultsDaily?.data?.prediction?.luck[5],
          language,
          userData.actualLanguage
        );
        userData.horoscopeResultsDaily.data.prediction.luck[5] = dTipsCouples;

        // WEEKLY TRANSLATIONS
        let wEmotions = await handleToTranslate(
          userData.horoscopeResultsWeekly?.data?.weekly_horoscope?.emotions,
          language,
          userData.actualLanguage
        );
        userData.horoscopeResultsWeekly.data.weekly_horoscope.emotions =
          wEmotions;

        let wHealth = await handleToTranslate(
          userData.horoscopeResultsWeekly?.data?.weekly_horoscope?.health,
          language,
          userData.actualLanguage
        );
        userData.horoscopeResultsWeekly.data.weekly_horoscope.health = wHealth;

        let wPersonal = await handleToTranslate(
          userData.horoscopeResultsWeekly?.data?.weekly_horoscope?.personal,
          language,
          userData.actualLanguage
        );
        userData.horoscopeResultsWeekly.data.weekly_horoscope.personal =
          wPersonal;

        let wProfession = await handleToTranslate(
          userData.horoscopeResultsWeekly?.data?.weekly_horoscope?.profession,
          language,
          userData.actualLanguage
        );
        userData.horoscopeResultsWeekly.data.weekly_horoscope.profession =
          wProfession;

        let wTravel = await handleToTranslate(
          userData.horoscopeResultsWeekly?.data?.weekly_horoscope?.travel,
          language,
          userData.actualLanguage
        );
        userData.horoscopeResultsWeekly.data.weekly_horoscope.travel = wTravel;

        // WEEKLY LUCK TRANSLATIONS
        let wColors = await handleToTranslate(
          userData.horoscopeResultsWeekly?.data?.weekly_horoscope?.luck[0],
          language,
          userData.actualLanguage
        );
        userData.horoscopeResultsWeekly.data.weekly_horoscope.luck[0] = wColors;

        let wAlphabets = await handleToTranslate(
          userData.horoscopeResultsWeekly?.data?.weekly_horoscope?.luck[2],
          language,
          userData.actualLanguage
        );
        userData.horoscopeResultsWeekly.data.weekly_horoscope.luck[2] =
          wAlphabets;

        let wCosmic = await handleToTranslate(
          userData.horoscopeResultsWeekly?.data?.weekly_horoscope?.luck[3],
          language,
          userData.actualLanguage
        );
        userData.horoscopeResultsWeekly.data.weekly_horoscope.luck[3] = wCosmic;

        let wTipsSingles = await handleToTranslate(
          userData.horoscopeResultsWeekly?.data?.weekly_horoscope?.luck[4],
          language,
          userData.actualLanguage
        );
        userData.horoscopeResultsWeekly.data.weekly_horoscope.luck[4] =
          wTipsSingles;

        let wTipsCouples = await handleToTranslate(
          userData.horoscopeResultsWeekly?.data?.weekly_horoscope?.luck[5],
          language,
          userData.actualLanguage
        );
        userData.horoscopeResultsWeekly.data.weekly_horoscope.luck[5] =
          wTipsCouples;

        // MONTHLY TRANSLATIONS
        let mEmotions = await handleToTranslate(
          userData.horoscopeResultsMonthly?.data?.monthly_horoscope?.emotions,
          language,
          userData.actualLanguage
        );
        userData.horoscopeResultsMonthly.data.monthly_horoscope.emotions =
          mEmotions;

        let mHealth = await handleToTranslate(
          userData.horoscopeResultsMonthly?.data?.monthly_horoscope?.health,
          language,
          userData.actualLanguage
        );
        userData.horoscopeResultsMonthly.data.monthly_horoscope.health =
          mHealth;

        let mPersonal = await handleToTranslate(
          userData.horoscopeResultsMonthly?.data?.monthly_horoscope?.personal,
          language,
          userData.actualLanguage
        );
        userData.horoscopeResultsMonthly.data.monthly_horoscope.personal =
          mPersonal;

        let mProfession = await handleToTranslate(
          userData.horoscopeResultsMonthly?.data?.monthly_horoscope?.profession,
          language,
          userData.actualLanguage
        );
        userData.horoscopeResultsMonthly.data.monthly_horoscope.profession =
          mProfession;

        let mTravel = await handleToTranslate(
          userData.horoscopeResultsMonthly?.data?.monthly_horoscope?.travel,
          language,
          userData.actualLanguage
        );
        userData.horoscopeResultsMonthly.data.monthly_horoscope.travel =
          mTravel;

        // MONTHLY LUCK TRANSLATIONS
        let mColors = await handleToTranslate(
          userData.horoscopeResultsMonthly?.data?.monthly_horoscope?.luck[0],
          language,
          userData.actualLanguage
        );
        userData.horoscopeResultsMonthly.data.monthly_horoscope.luck[0] =
          mColors;

        let mAlphabets = await handleToTranslate(
          userData.horoscopeResultsMonthly?.data?.monthly_horoscope?.luck[2],
          language,
          userData.actualLanguage
        );
        userData.horoscopeResultsMonthly.data.monthly_horoscope.luck[2] =
          mAlphabets;

        let mCosmic = await handleToTranslate(
          userData.horoscopeResultsMonthly?.data?.monthly_horoscope?.luck[3],
          language,
          userData.actualLanguage
        );
        userData.horoscopeResultsMonthly.data.monthly_horoscope.luck[3] =
          mCosmic;

        let mTipsSingles = await handleToTranslate(
          userData.horoscopeResultsMonthly?.data?.monthly_horoscope?.luck[4],
          language,
          userData.actualLanguage
        );
        userData.horoscopeResultsMonthly.data.monthly_horoscope.luck[4] =
          mTipsSingles;

        let mTipsCouples = await handleToTranslate(
          userData.horoscopeResultsMonthly?.data?.monthly_horoscope?.luck[5],
          language,
          userData.actualLanguage
        );
        userData.horoscopeResultsMonthly.data.monthly_horoscope.luck[5] =
          mTipsCouples;

        // YEARLY TRANSLATIONS
        let yEmotions = await handleToTranslate(
          userData.horoscopeResultsYearly?.data?.yearly_horoscope?.emotions,
          language,
          userData.actualLanguage
        );
        userData.horoscopeResultsYearly.data.yearly_horoscope.emotions =
          yEmotions;

        let yHealth = await handleToTranslate(
          userData.horoscopeResultsYearly?.data?.yearly_horoscope?.health,
          language,
          userData.actualLanguage
        );
        userData.horoscopeResultsYearly.data.yearly_horoscope.health = yHealth;

        let yPersonal = await handleToTranslate(
          userData.horoscopeResultsYearly?.data?.yearly_horoscope?.personal,
          language,
          userData.actualLanguage
        );
        userData.horoscopeResultsYearly.data.yearly_horoscope.personal =
          yPersonal;

        let yProfession = await handleToTranslate(
          userData.horoscopeResultsYearly?.data?.yearly_horoscope?.profession,
          language,
          userData.actualLanguage
        );
        userData.horoscopeResultsYearly.data.yearly_horoscope.profession =
          yProfession;

        let yTravel = await handleToTranslate(
          userData.horoscopeResultsYearly?.data?.yearly_horoscope?.travel,
          language,
          userData.actualLanguage
        );
        userData.horoscopeResultsYearly.data.yearly_horoscope.travel = yTravel;

        // YEARLY LUCK TRANSLATIONS
        let yColors = await handleToTranslate(
          userData.horoscopeResultsYearly?.data?.yearly_horoscope?.luck[0],
          language,
          userData.actualLanguage
        );
        userData.horoscopeResultsYearly.data.yearly_horoscope.luck[0] = yColors;

        let yAlphabets = await handleToTranslate(
          userData.horoscopeResultsYearly?.data?.yearly_horoscope?.luck[2],
          language,
          userData.actualLanguage
        );
        userData.horoscopeResultsYearly.data.yearly_horoscope.luck[2] =
          yAlphabets;

        let yCosmic = await handleToTranslate(
          userData.horoscopeResultsYearly?.data?.yearly_horoscope?.luck[3],
          language,
          userData.actualLanguage
        );
        userData.horoscopeResultsYearly.data.yearly_horoscope.luck[3] = yCosmic;

        let yTipsSingles = await handleToTranslate(
          userData.horoscopeResultsYearly?.data?.yearly_horoscope?.luck[4],
          language,
          userData.actualLanguage
        );
        userData.horoscopeResultsYearly.data.yearly_horoscope.luck[4] =
          yTipsSingles;

        let yTipsCouples = await handleToTranslate(
          userData.horoscopeResultsYearly?.data?.yearly_horoscope?.luck[5],
          language,
          userData.actualLanguage
        );
        userData.horoscopeResultsYearly.data.yearly_horoscope.luck[5] =
          yTipsCouples;

        await AsyncStorage.setItem("userData", JSON.stringify(userData));
      }

      setUserD(userData);

      setIsLoading(false);
    } catch (error) {
      console.error(
        "Eroare la preluarea și procesarea datelor din user data async storage pt horoscop:",
        error
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleGetHoroscopeData();
    // fetchNatalWheelChart().then((data) => {
    //   console.log("data.svg...", data.svg);
    //   setSvgData(data.svg);
    // });
  }, []);

  if (isLoading) {
    return <LoadingOverlay />;
  }

  return (
    <>
      <MainContainer>
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
            colors.gradientLogin11,
          ]} // Înlocuiește cu culorile gradientului tău
          style={{
            flex: 1,
            paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
            paddingBottom: "49%",
          }}
        >
          <SpaceSky />
          {isReloadingH ? (
            <View style={styles.container}>
              <Image source={localGif} style={styles.image} />
            </View>
          ) : (
            <>
              <MyTopBarHoroscope onChangeTab={setSelectedTab} />
              <SafeAreaView>
                <ScrollViewFadeFirst element={Header} height={200}>
                  <View style={{ height: 20 }} />
                  {selectedTab === "zilnic" ? (
                    <ShowFromTop>
                      <View
                        style={[
                          styles.defaultContainer,
                          {
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                          },
                        ]}
                      >
                        <H15fontMediumWhite
                          style={[
                            styles.textTitles,
                            { color: colors.gradientLogin2, fontSize: 23 },
                          ]}
                        >
                          {i18n.translate("hAstazi")}
                        </H15fontMediumWhite>
                      </View>
                      <View style={styles.defaultContainer}>
                        <H15fontMediumWhite style={styles.textTitles}>
                          {i18n.translate("hNumbers")}
                        </H15fontMediumWhite>
                      </View>
                      <View
                        style={[
                          styles.defaultContainer,
                          {
                            flexDirection: "row",
                            justifyContent: "space-evenly",
                          },
                        ]}
                      >
                        {userD.horoscopeResultsDaily?.data?.prediction
                          ?.luck[1] &&
                          userD.horoscopeResultsDaily.data.prediction.luck[1]
                            .match(/\d+/g)
                            ?.map((numberStr, i) => (
                              <LuckyNumber
                                key={i}
                                number={parseInt(numberStr, 10)}
                              />
                            ))}
                      </View>
                      {/* <View style={{ paddingVertical: 10 }} /> */}
                      <View style={styles.defaultContainer}>
                        <H15fontMediumWhite style={styles.textTitles}>
                          {
                            userD.horoscopeResultsDaily?.data?.prediction
                              ?.luck[0]
                          }
                        </H15fontMediumWhite>
                      </View>
                      <View style={styles.defaultContainer}>
                        <H15fontMediumWhite style={styles.textTitles}>
                          {
                            userD.horoscopeResultsDaily?.data?.prediction
                              ?.luck[2]
                          }
                        </H15fontMediumWhite>
                      </View>
                      <View style={styles.defaultContainer}>
                        <H15fontMediumWhite style={styles.textTitles}>
                          {
                            userD.horoscopeResultsDaily?.data?.prediction
                              ?.luck[3]
                          }
                        </H15fontMediumWhite>
                      </View>
                      <View style={styles.defaultContainer}>
                        <H15fontMediumWhite style={styles.textTitles}>
                          {
                            userD.horoscopeResultsDaily?.data?.prediction
                              ?.luck[4]
                          }
                        </H15fontMediumWhite>
                      </View>
                      <View style={styles.defaultContainer}>
                        <H15fontMediumWhite style={styles.textTitles}>
                          {
                            userD.horoscopeResultsDaily?.data?.prediction
                              ?.luck[5]
                          }
                        </H15fontMediumWhite>
                      </View>
                      <Divider style={{ marginTop: 20 }} />
                      <View style={[styles.defaultContainer]}>
                        <View style={styles.horoscopeTodayContainer}>
                          <H15fontMediumWhite
                            style={[
                              styles.textTitles,
                              { fontSize: 20, color: colors.gradientLogin2 },
                            ]}
                          >
                            {i18n.translate("hPredictions")}
                          </H15fontMediumWhite>
                          <View style={styles.iconsHoroscopeToday}>
                            <MaterialCommunityIcons
                              name="heart"
                              size={20}
                              color={colors.gradientLogin2}
                              style={{ marginLeft: 5 }}
                            />
                            <MaterialCommunityIcons
                              name="briefcase"
                              size={20}
                              color={colors.gradientLogin2}
                              style={{ marginLeft: 5 }}
                            />
                            <MaterialCommunityIcons
                              name="food-apple"
                              size={20}
                              color={colors.gradientLogin2}
                              style={{ marginLeft: 5 }}
                            />
                          </View>
                        </View>
                      </View>
                      <View style={styles.defaultContainer}>
                        <H15fontMediumWhite style={styles.textTitles}>
                          {i18n.translate("hEmotions")}
                        </H15fontMediumWhite>
                        <H15fontMediumWhite style={{ marginTop: 15 }}>
                          {
                            userD.horoscopeResultsDaily?.data?.prediction
                              ?.emotions
                          }
                        </H15fontMediumWhite>
                      </View>
                      <View style={styles.defaultContainer}>
                        <H15fontMediumWhite style={styles.textTitles}>
                          {i18n.translate("hHealth")}
                        </H15fontMediumWhite>
                        <H15fontMediumWhite style={{ marginTop: 15 }}>
                          {
                            userD.horoscopeResultsDaily?.data?.prediction
                              ?.health
                          }
                        </H15fontMediumWhite>
                      </View>
                      <View style={styles.defaultContainer}>
                        <H15fontMediumWhite style={styles.textTitles}>
                          {i18n.translate("hPersonal")}
                        </H15fontMediumWhite>
                        <H15fontMediumWhite style={{ marginTop: 15 }}>
                          {
                            userD.horoscopeResultsDaily?.data?.prediction
                              ?.personal
                          }
                        </H15fontMediumWhite>
                      </View>
                      <View style={styles.defaultContainer}>
                        <H15fontMediumWhite style={styles.textTitles}>
                          {i18n.translate("hProfession")}
                        </H15fontMediumWhite>
                        <H15fontMediumWhite style={{ marginTop: 15 }}>
                          {
                            userD.horoscopeResultsDaily?.data?.prediction
                              ?.profession
                          }
                        </H15fontMediumWhite>
                      </View>
                      <View style={styles.defaultContainer}>
                        <H15fontMediumWhite style={styles.textTitles}>
                          {i18n.translate("hTravel")}
                        </H15fontMediumWhite>
                        <H15fontMediumWhite style={{ marginTop: 15 }}>
                          {
                            userD.horoscopeResultsDaily?.data?.prediction
                              ?.travel
                          }
                        </H15fontMediumWhite>
                      </View>
                    </ShowFromTop>
                  ) : selectedTab === "saptamanal" ? (
                    <ShowFromTop>
                      <View
                        style={[
                          styles.defaultContainer,
                          {
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                          },
                        ]}
                      >
                        <H15fontMediumWhite
                          style={[
                            styles.textTitles,
                            { color: colors.gradientLogin2, fontSize: 23 },
                          ]}
                        >
                          {i18n.translate("hSaptamana")}{" "}
                        </H15fontMediumWhite>
                      </View>
                      <View style={styles.defaultContainer}>
                        <H15fontMediumWhite style={styles.textTitles}>
                          {i18n.translate("hNumbers")}{" "}
                        </H15fontMediumWhite>
                      </View>
                      <View
                        style={[
                          styles.defaultContainer,
                          {
                            flexDirection: "row",
                            justifyContent: "space-evenly",
                          },
                        ]}
                      >
                        {userD.horoscopeResultsWeekly?.data?.weekly_horoscope
                          ?.luck[1] &&
                          userD.horoscopeResultsWeekly.data.weekly_horoscope.luck[1]
                            .match(/\d+/g)
                            ?.map((numberStr, i) => (
                              <LuckyNumber
                                key={i}
                                number={parseInt(numberStr, 10)}
                              />
                            ))}
                      </View>
                      {/* <View style={{ paddingVertical: 10 }} /> */}
                      <View style={styles.defaultContainer}>
                        <H15fontMediumWhite style={styles.textTitles}>
                          {
                            userD.horoscopeResultsWeekly?.data?.weekly_horoscope
                              ?.luck[0]
                          }
                        </H15fontMediumWhite>
                      </View>
                      <View style={styles.defaultContainer}>
                        <H15fontMediumWhite style={styles.textTitles}>
                          {
                            userD.horoscopeResultsWeekly?.data?.weekly_horoscope
                              ?.luck[2]
                          }
                        </H15fontMediumWhite>
                      </View>
                      <View style={styles.defaultContainer}>
                        <H15fontMediumWhite style={styles.textTitles}>
                          {
                            userD.horoscopeResultsWeekly?.data?.weekly_horoscope
                              ?.luck[3]
                          }
                        </H15fontMediumWhite>
                      </View>
                      <View style={styles.defaultContainer}>
                        <H15fontMediumWhite style={styles.textTitles}>
                          {
                            userD.horoscopeResultsWeekly?.data?.weekly_horoscope
                              ?.luck[4]
                          }
                        </H15fontMediumWhite>
                      </View>
                      <View style={styles.defaultContainer}>
                        <H15fontMediumWhite style={styles.textTitles}>
                          {
                            userD.horoscopeResultsWeekly?.data?.weekly_horoscope
                              ?.luck[5]
                          }
                        </H15fontMediumWhite>
                      </View>
                      <Divider style={{ marginTop: 20 }} />
                      <View style={[styles.defaultContainer]}>
                        <View style={styles.horoscopeTodayContainer}>
                          <H15fontMediumWhite
                            style={[
                              styles.textTitles,
                              { fontSize: 20, color: colors.gradientLogin2 },
                            ]}
                          >
                            {i18n.translate("hPredictions")}
                          </H15fontMediumWhite>
                          <View style={styles.iconsHoroscopeToday}>
                            <MaterialCommunityIcons
                              name="heart"
                              size={20}
                              color={colors.gradientLogin2}
                              style={{ marginLeft: 5 }}
                            />
                            <MaterialCommunityIcons
                              name="briefcase"
                              size={20}
                              color={colors.gradientLogin2}
                              style={{ marginLeft: 5 }}
                            />
                            <MaterialCommunityIcons
                              name="food-apple"
                              size={20}
                              color={colors.gradientLogin2}
                              style={{ marginLeft: 5 }}
                            />
                          </View>
                        </View>
                      </View>
                      <View style={styles.defaultContainer}>
                        <H15fontMediumWhite style={styles.textTitles}>
                          {i18n.translate("hEmotions")}
                        </H15fontMediumWhite>
                        <H15fontMediumWhite style={{ marginTop: 15 }}>
                          {
                            userD.horoscopeResultsWeekly?.data?.weekly_horoscope
                              ?.emotions
                          }
                        </H15fontMediumWhite>
                      </View>
                      <View style={styles.defaultContainer}>
                        <H15fontMediumWhite style={styles.textTitles}>
                          {i18n.translate("hHealth")}
                        </H15fontMediumWhite>
                        <H15fontMediumWhite style={{ marginTop: 15 }}>
                          {
                            userD.horoscopeResultsWeekly?.data?.weekly_horoscope
                              ?.health
                          }
                        </H15fontMediumWhite>
                      </View>
                      <View style={styles.defaultContainer}>
                        <H15fontMediumWhite style={styles.textTitles}>
                          {i18n.translate("hPersonal")}
                        </H15fontMediumWhite>
                        <H15fontMediumWhite style={{ marginTop: 15 }}>
                          {
                            userD.horoscopeResultsWeekly?.data?.weekly_horoscope
                              ?.personal
                          }
                        </H15fontMediumWhite>
                      </View>
                      <View style={styles.defaultContainer}>
                        <H15fontMediumWhite style={styles.textTitles}>
                          {i18n.translate("hProfession")}
                        </H15fontMediumWhite>
                        <H15fontMediumWhite style={{ marginTop: 15 }}>
                          {
                            userD.horoscopeResultsWeekly?.data?.weekly_horoscope
                              ?.profession
                          }
                        </H15fontMediumWhite>
                      </View>
                      <View style={styles.defaultContainer}>
                        <H15fontMediumWhite style={styles.textTitles}>
                          {i18n.translate("hTravel")}
                        </H15fontMediumWhite>
                        <H15fontMediumWhite style={{ marginTop: 15 }}>
                          {
                            userD.horoscopeResultsWeekly?.data?.weekly_horoscope
                              ?.travel
                          }
                        </H15fontMediumWhite>
                      </View>
                    </ShowFromTop>
                  ) : selectedTab === "lunar" ? (
                    <ShowFromTop>
                      <View
                        style={[
                          styles.defaultContainer,
                          {
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                          },
                        ]}
                      >
                        <H15fontMediumWhite
                          style={[
                            styles.textTitles,
                            { color: colors.gradientLogin2, fontSize: 23 },
                          ]}
                        >
                          {i18n.translate("hMonth")}{" "}
                        </H15fontMediumWhite>
                      </View>
                      <View style={styles.defaultContainer}>
                        <H15fontMediumWhite style={styles.textTitles}>
                          {i18n.translate("hNumbers")}{" "}
                        </H15fontMediumWhite>
                      </View>
                      <View
                        style={[
                          styles.defaultContainer,
                          {
                            flexDirection: "row",
                            justifyContent: "space-evenly",
                          },
                        ]}
                      >
                        {userD.horoscopeResultsMonthly?.data?.monthly_horoscope
                          ?.luck[1] &&
                          userD.horoscopeResultsMonthly.data.monthly_horoscope.luck[1]
                            .match(/\d+/g)
                            ?.map((numberStr, i) => (
                              <LuckyNumber
                                key={i}
                                number={parseInt(numberStr, 10)}
                              />
                            ))}
                      </View>
                      {/* <View style={{ paddingVertical: 10 }} /> */}
                      <View style={styles.defaultContainer}>
                        <H15fontMediumWhite style={styles.textTitles}>
                          {
                            userD.horoscopeResultsMonthly?.data
                              ?.monthly_horoscope?.luck[0]
                          }
                        </H15fontMediumWhite>
                      </View>
                      <View style={styles.defaultContainer}>
                        <H15fontMediumWhite style={styles.textTitles}>
                          {
                            userD.horoscopeResultsMonthly?.data
                              ?.monthly_horoscope?.luck[2]
                          }
                        </H15fontMediumWhite>
                      </View>
                      <View style={styles.defaultContainer}>
                        <H15fontMediumWhite style={styles.textTitles}>
                          {
                            userD.horoscopeResultsMonthly?.data
                              ?.monthly_horoscope?.luck[3]
                          }
                        </H15fontMediumWhite>
                      </View>
                      <View style={styles.defaultContainer}>
                        <H15fontMediumWhite style={styles.textTitles}>
                          {
                            userD.horoscopeResultsMonthly?.data
                              ?.monthly_horoscope?.luck[4]
                          }
                        </H15fontMediumWhite>
                      </View>
                      <View style={styles.defaultContainer}>
                        <H15fontMediumWhite style={styles.textTitles}>
                          {
                            userD.horoscopeResultsMonthly?.data
                              ?.monthly_horoscope?.luck[5]
                          }
                        </H15fontMediumWhite>
                      </View>
                      <Divider style={{ marginTop: 20 }} />
                      <View style={[styles.defaultContainer]}>
                        <View style={styles.horoscopeTodayContainer}>
                          <H15fontMediumWhite
                            style={[
                              styles.textTitles,
                              { fontSize: 20, color: colors.gradientLogin2 },
                            ]}
                          >
                            {i18n.translate("hPredictions")}
                          </H15fontMediumWhite>
                          <View style={styles.iconsHoroscopeToday}>
                            <MaterialCommunityIcons
                              name="heart"
                              size={20}
                              color={colors.gradientLogin2}
                              style={{ marginLeft: 5 }}
                            />
                            <MaterialCommunityIcons
                              name="briefcase"
                              size={20}
                              color={colors.gradientLogin2}
                              style={{ marginLeft: 5 }}
                            />
                            <MaterialCommunityIcons
                              name="food-apple"
                              size={20}
                              color={colors.gradientLogin2}
                              style={{ marginLeft: 5 }}
                            />
                          </View>
                        </View>
                      </View>
                      <View style={styles.defaultContainer}>
                        <H15fontMediumWhite style={styles.textTitles}>
                          {i18n.translate("hEmotions")}
                        </H15fontMediumWhite>
                        <H15fontMediumWhite style={{ marginTop: 15 }}>
                          {
                            userD.horoscopeResultsMonthly?.data
                              ?.monthly_horoscope?.emotions
                          }
                        </H15fontMediumWhite>
                      </View>
                      <View style={styles.defaultContainer}>
                        <H15fontMediumWhite style={styles.textTitles}>
                          {i18n.translate("hHealth")}
                        </H15fontMediumWhite>
                        <H15fontMediumWhite style={{ marginTop: 15 }}>
                          {
                            userD.horoscopeResultsMonthly?.data
                              ?.monthly_horoscope?.health
                          }
                        </H15fontMediumWhite>
                      </View>
                      <View style={styles.defaultContainer}>
                        <H15fontMediumWhite style={styles.textTitles}>
                          {i18n.translate("hPersonal")}
                        </H15fontMediumWhite>
                        <H15fontMediumWhite style={{ marginTop: 15 }}>
                          {
                            userD.horoscopeResultsMonthly?.data
                              ?.monthly_horoscope?.personal
                          }
                        </H15fontMediumWhite>
                      </View>
                      <View style={styles.defaultContainer}>
                        <H15fontMediumWhite style={styles.textTitles}>
                          {i18n.translate("hProfession")}
                        </H15fontMediumWhite>
                        <H15fontMediumWhite style={{ marginTop: 15 }}>
                          {
                            userD.horoscopeResultsMonthly?.data
                              ?.monthly_horoscope?.profession
                          }
                        </H15fontMediumWhite>
                      </View>
                      <View style={styles.defaultContainer}>
                        <H15fontMediumWhite style={styles.textTitles}>
                          {i18n.translate("hTravel")}
                        </H15fontMediumWhite>
                        <H15fontMediumWhite style={{ marginTop: 15 }}>
                          {
                            userD.horoscopeResultsMonthly?.data
                              ?.monthly_horoscope?.travel
                          }
                        </H15fontMediumWhite>
                      </View>
                    </ShowFromTop>
                  ) : selectedTab === "anual" ? (
                    <ShowFromTop>
                      <View
                        style={[
                          styles.defaultContainer,
                          {
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                          },
                        ]}
                      >
                        <H15fontMediumWhite
                          style={[
                            styles.textTitles,
                            { color: colors.gradientLogin2, fontSize: 23 },
                          ]}
                        >
                          Anul acesta{" "}
                        </H15fontMediumWhite>
                      </View>
                      <View style={styles.defaultContainer}>
                        <H15fontMediumWhite style={styles.textTitles}>
                          {i18n.translate("hNumbers")}{" "}
                        </H15fontMediumWhite>
                      </View>
                      <View
                        style={[
                          styles.defaultContainer,
                          {
                            flexDirection: "row",
                            justifyContent: "space-evenly",
                          },
                        ]}
                      >
                        {userD.horoscopeResultsYearly?.data?.yearly_horoscope
                          ?.luck[1] &&
                          userD.horoscopeResultsYearly.data.yearly_horoscope.luck[1]
                            .match(/\d+/g)
                            ?.map((numberStr, i) => (
                              <LuckyNumber
                                key={i}
                                number={parseInt(numberStr, 10)}
                              />
                            ))}
                      </View>
                      {/* <View style={{ paddingVertical: 10 }} /> */}
                      <View style={styles.defaultContainer}>
                        <H15fontMediumWhite style={styles.textTitles}>
                          {
                            userD.horoscopeResultsYearly?.data?.yearly_horoscope
                              ?.luck[0]
                          }
                        </H15fontMediumWhite>
                      </View>
                      <View style={styles.defaultContainer}>
                        <H15fontMediumWhite style={styles.textTitles}>
                          {
                            userD.horoscopeResultsYearly?.data?.yearly_horoscope
                              ?.luck[2]
                          }
                        </H15fontMediumWhite>
                      </View>
                      <View style={styles.defaultContainer}>
                        <H15fontMediumWhite style={styles.textTitles}>
                          {
                            userD.horoscopeResultsYearly?.data?.yearly_horoscope
                              ?.luck[3]
                          }
                        </H15fontMediumWhite>
                      </View>
                      <View style={styles.defaultContainer}>
                        <H15fontMediumWhite style={styles.textTitles}>
                          {
                            userD.horoscopeResultsYearly?.data?.yearly_horoscope
                              ?.luck[4]
                          }
                        </H15fontMediumWhite>
                      </View>
                      <View style={styles.defaultContainer}>
                        <H15fontMediumWhite style={styles.textTitles}>
                          {
                            userD.horoscopeResultsYearly?.data?.yearly_horoscope
                              ?.luck[5]
                          }
                        </H15fontMediumWhite>
                      </View>
                      <Divider style={{ marginTop: 20 }} />
                      <View style={[styles.defaultContainer]}>
                        <View style={styles.horoscopeTodayContainer}>
                          <H15fontMediumWhite
                            style={[
                              styles.textTitles,
                              { fontSize: 20, color: colors.gradientLogin2 },
                            ]}
                          >
                            {i18n.translate("hPredictions")}
                          </H15fontMediumWhite>
                          <View style={styles.iconsHoroscopeToday}>
                            <MaterialCommunityIcons
                              name="heart"
                              size={20}
                              color={colors.gradientLogin2}
                              style={{ marginLeft: 5 }}
                            />
                            <MaterialCommunityIcons
                              name="briefcase"
                              size={20}
                              color={colors.gradientLogin2}
                              style={{ marginLeft: 5 }}
                            />
                            <MaterialCommunityIcons
                              name="food-apple"
                              size={20}
                              color={colors.gradientLogin2}
                              style={{ marginLeft: 5 }}
                            />
                          </View>
                        </View>
                      </View>
                      <View style={styles.defaultContainer}>
                        <H15fontMediumWhite style={styles.textTitles}>
                          {i18n.translate("hEmotions")}
                        </H15fontMediumWhite>
                        <H15fontMediumWhite style={{ marginTop: 15 }}>
                          {
                            userD.horoscopeResultsYearly?.data?.yearly_horoscope
                              ?.emotions
                          }
                        </H15fontMediumWhite>
                      </View>
                      <View style={styles.defaultContainer}>
                        <H15fontMediumWhite style={styles.textTitles}>
                          {i18n.translate("hHealth")}
                        </H15fontMediumWhite>
                        <H15fontMediumWhite style={{ marginTop: 15 }}>
                          {
                            userD.horoscopeResultsYearly?.data?.yearly_horoscope
                              ?.health
                          }
                        </H15fontMediumWhite>
                      </View>
                      <View style={styles.defaultContainer}>
                        <H15fontMediumWhite style={styles.textTitles}>
                          {i18n.translate("hPersonal")}
                        </H15fontMediumWhite>
                        <H15fontMediumWhite style={{ marginTop: 15 }}>
                          {
                            userD.horoscopeResultsYearly?.data?.yearly_horoscope
                              ?.personal
                          }
                        </H15fontMediumWhite>
                      </View>
                      <View style={styles.defaultContainer}>
                        <H15fontMediumWhite style={styles.textTitles}>
                          {i18n.translate("hProfession")}
                        </H15fontMediumWhite>
                        <H15fontMediumWhite style={{ marginTop: 15 }}>
                          {
                            userD.horoscopeResultsYearly?.data?.yearly_horoscope
                              ?.profession
                          }
                        </H15fontMediumWhite>
                      </View>
                      <View style={styles.defaultContainer}>
                        <H15fontMediumWhite style={styles.textTitles}>
                          {i18n.translate("hTravel")}
                        </H15fontMediumWhite>
                        <H15fontMediumWhite style={{ marginTop: 15 }}>
                          {
                            userD.horoscopeResultsYearly?.data?.yearly_horoscope
                              ?.travel
                          }
                        </H15fontMediumWhite>
                      </View>
                    </ShowFromTop>
                  ) : null}
                </ScrollViewFadeFirst>
              </SafeAreaView>
            </>
          )}
        </LinearGradient>
      </MainContainer>
    </>
  );
}

const styles = StyleSheet.create({
  image: {
    width: 200,
    height: 200,
    resizeMode: "contain", // Asigură-te că GIF-ul se încadrează în dimensiunile specificate
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: width / 1.5,
    alignSelf: "center",
  },
  backgroundConstellation: {
    zIndex: 1,
    position: "absolute",
    top: 300,
    left: 20,
    opacity: 0.05,
  },
  headerContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginVertical: 20,
  },
  headerHeadline: {
    fontWeight: "bold",
    fontSize: 30,
    lineHeight: 34,
    marginTop: 20,
    color: "white",
  },
  defaultContainer: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  textTitles: {
    fontSize: 16,
  },
  horoscopeTodayContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconsHoroscopeToday: {
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  loveContainer: {
    flexDirection: "row",
    marginTop: 15,
    marginHorizontal: 20,
    justifyContent: "space-between",
    borderWidth: 2,
    borderRadius: 10,
  },
  heartLoveContainer: {
    flex: 0.2,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  loveSignsContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    flex: 1,
    marginTop: 10,
  },
});

export default HoroscopZilnic;

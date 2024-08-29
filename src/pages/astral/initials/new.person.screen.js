import React, { Fragment, useEffect, useState } from "react";
import { StyleSheet, View, Platform, Image, Dimensions } from "react-native";
import { Button, Headline, Menu, Provider, Text } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MainContainer } from "../../../components/commonViews";
import { LinearGradient } from "expo-linear-gradient";

import { InputFields } from "../../../components/commonInputFields";
import { DatePicker, TimePicker } from "../../../components/dateAndTimePicker";
import moment from "moment";
import GenderSelector from "../../../components/Astral/components/GenderSelector";
import RelationshipScreen from "../../../components/Astral/components/RelationshipScreen";
import { Button as CommonButton } from "../../../components/commonButton";
import { colors } from "../../../utils/colors";
import SpaceSky from "../../../components/Astral/components/space-sky";
import Aquarius from "../../../svgs/Aquarius";
import { useFocusEffect } from "@react-navigation/native";
import { StatusBar } from "react-native";
import {
  fetchAstroData,
  fetchHoroscopeData,
  fetchHoroscopeDataMonth,
  fetchHoroscopeDataWeek,
  fetchHoroscopeDataYear,
  fetchTimeZone,
  getZodiacSign,
} from "../../../utils/AstralUtils/fetchNatalWheelChart";
import localGif from "../../../../assets/constelatii.gif";
import {
  H6fontBoldPrimary,
  H7fontBoldWhite,
  H8fontBoldPrimary,
  H8fontMediumWhite,
  H8fontRegularWhite,
} from "../../../components/commonText";
import {
  fetchChatResponse,
  formatAstrologyReport,
  prepareAstroData,
} from "../../../utils/AstralUtils/fetchGPTData";
import MapInputPatientDash from "../../../components/Astral/components/MapInputPatientDash";
import i18n from "../../../../i18n";
import { useLanguage } from "../../../context/LanguageContext";
import { capitalizeFirstLetter } from "../../../utils/stringUtils";
import { fetchSinastrieData } from "../../../utils/AstralUtils/fetchSinastrieDate";

const { width } = Dimensions.get("window");

function NewPersonScreen({ navigation, route }) {
  const today = moment(new Date()).format("DD-MM-YYYY");
  const { language, changeLanguage } = useLanguage();
  const [name, setName] = useState("");
  const [localitate, setLocalitate] = useState("");
  const [place, setPlace] = useState("");
  const [adress, setAdress] = useState("");
  const [lat, setLat] = useState("");
  const [long, setLong] = useState("");
  const [tara, setTara] = useState("");
  const [numarNorocos, setNumarNorocos] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(null); // Asigură-te că inițializezi cu un obiect Date
  const [loadingMessage, setLoadingMessage] = useState(
    "Vă analizăm informațiile pentru a vă crea astrograma natală..."
  );
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [gender, setGender] = useState("male");
  const [relationshipStatus, setRelationshipStatus] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [day, setDay] = useState("Zi");
  const [month, setMonth] = useState("Lună");
  const [year, setYear] = useState("An");
  const [isDayMenuVisible, setDayMenuVisible] = useState(false);
  const [isMonthMenuVisible, setMonthMenuVisible] = useState(false);
  const [isYearMenuVisible, setYearMenuVisible] = useState(false);

  const inputRef = React.useRef(null);

  useEffect(() => {
    console.log("selectedTime.......", selectedTime);
  }, []);

  useEffect(() => {
    // Check if we're in edit mode
    if (route.params?.editMode) {
      setIsEditMode(true);
      loadUserData();
    }
  }, [route.params]);

  useFocusEffect(
    React.useCallback(() => {
      if (!route.params?.editMode) {
        const checkUserData = async () => {
          try {
            const userData = await AsyncStorage.getItem("userData");
            const parsedData = JSON.parse(userData);
            // console.log("Retrieved user data:", userData);
            if (parsedData.p2 && !isEditMode) {
              navigation.navigate("Learn");
            }
          } catch (error) {
            console.error("Error checking user data:", error);
          }
        };
        checkUserData();
      }
    }, [navigation, isEditMode])
  );

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      // console.log("loaded user data...", userData);
      if (userData) {
        const parsedData = JSON.parse(userData);
        if (parsedData.p2) {
          setName(parsedData.p2.full_name);
          setSelectedDate(parsedData.p2.selectedDate);
          setSelectedTime(parsedData.p2.selectedTime);
          setGender(parsedData.p2.gender);
          setRelationshipStatus(parsedData.p2.relationshipStatus);
          setNumarNorocos(parsedData.p2.numarNorocos);
          setPlace(parsedData.p2.place);
          setAdress(parsedData.p2.place);
          setTara(parsedData.p2.tara);
          setDay(parsedData.p2.day);
          setYear(parsedData.p2.year);
          setMonth(parsedData.p2.month);
          setLong(parsedData.p2.lon);
          setLat(parsedData.p2.lat);
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const handleContinue = async () => {
    try {
      setIsLoading(true);
      const userD = await AsyncStorage.getItem("userData");
      const parsedData = JSON.parse(userD);

      const birthDate = moment(selectedDate, "DD-MM-YYYY");
      const birthTime = selectedTime ? moment(selectedTime, "HH:mm") : moment();
      const timezoneOffset = await fetchTimeZone(lat, long);

      const zodiacSign = getZodiacSign(day, month);
      const zodiacSignFristUpperCase = capitalizeFirstLetter(
        zodiacSign.toLowerCase()
      );
      const currentDate = new Date();
      const formattedDate = currentDate.toISOString().split("T")[0];

      const pOneData = {
        // datele pentru primul utilizator
        full_name: parsedData.full_name,
        day: parsedData.day,
        month: parsedData.month,
        year: parsedData.year,
        hour: parsedData.hour,
        min: parsedData.min,
        sec: parsedData.sec,
        selectedDate: "--",
        selectedTime: parsedData.selectedTime,
        gender: parsedData.gender,
        place: parsedData.place,
        adress: parsedData.adress,
        localitate: parsedData.localitate,
        tara: parsedData.tara,
        lat: parsedData.lat,
        lon: parsedData.lon,
        tzone: parsedData.tzone,
        actualLanguage: parsedData.actualLanguage,
        actualLanguageAstrograma: parsedData.actualLanguage,
        zodiacSign: parsedData.zodiacSign,
        zodiacSignFristUpperCase: parsedData.zodiacSignFristUpperCase,
        dataHoroscop: parsedData.dataHoroscop,
      };

      const userData = {
        ...pOneData,
        p2: {
          // datele pentru al doilea utilizator
          full_name: name,
          day: day,
          month: month,
          year: year,
          hour: birthTime.hour(),
          min: birthTime.minute(),
          sec: birthTime.second(),
          selectedDate: "--",
          selectedTime: selectedTime,
          gender,
          place,
          adress,
          localitate,
          tara,
          lat: lat,
          lon: long,
          tzone: timezoneOffset,
          actualLanguage: "aba",
          actualLanguageAstrograma: "aba",
          zodiacSign,
          zodiacSignFristUpperCase,
          dataHoroscop: formattedDate,
        },
        // Inițializăm obiectul synastry pentru a evita eroarea de undefined
        synastry: {},
      };
      // console.log("p2....", userData.p2);
      const sinastrieUrls = {
        natalWheelChart:
          "https://astroapi-4.divineapi.com/western-api/v1/synastry/natal-wheel-chart",
        houseCusps:
          "https://astroapi-4.divineapi.com/western-api/v1/synastry/house-cusps",
        planetaryPositions:
          "https://astroapi-4.divineapi.com/western-api/v1/synastry/planetary-positions",
        aspect:
          "https://astroapi-4.divineapi.com/western-api/v1/synastry/aspect",
        harmoniousAspectReading:
          "https://astroapi-4.divineapi.com/western-api/v1/synastry/harmonious-aspect-reading",
        conflictingAspectReading:
          "https://astroapi-4.divineapi.com/western-api/v1/synastry/conflicting-aspect-reading",
        contrastingAspectReading:
          "https://astroapi-4.divineapi.com/western-api/v1/synastry/contrasting-aspect-reading",
        physicalCompatibility:
          "https://astroapi-4.divineapi.com/western-api/v1/synastry/physical-compatibility",
        emotionalCompatibility:
          "https://astroapi-4.divineapi.com/western-api/v1/synastry/emotional-compatibility",
        sexualCompatibility:
          "https://astroapi-4.divineapi.com/western-api/v1/synastry/sexual-compatibility",
        spiritualCompatibility:
          "https://astroapi-4.divineapi.com/western-api/v1/synastry/spiritual-compatibility",
        financialCompatibility:
          "https://astroapi-4.divineapi.com/western-api/v1/synastry/financial-compatibility",
      };

      const results = await Promise.all(
        Object.keys(sinastrieUrls).map((key) =>
          fetchSinastrieData(
            sinastrieUrls[key],
            userData.full_name,
            userData.day,
            userData.month,
            userData.year,
            userData.hour,
            userData.min,
            userData.sec,
            userData.gender,
            userData.place,
            userData.lat,
            userData.lon,
            userData.tzone,
            userData.p2
          )
        )
      );

      const [
        natalWheelChart,
        houseCusps,
        planetaryPositions,
        aspect,
        harmoniousAspectReading,
        conflictingAspectReading,
        contrastingAspectReading,
        physicalCompatibility,
        emotionalCompatibility,
        sexualCompatibility,
        spiritualCompatibility,
        financialCompatibility,
      ] = results;

      // console.log("sianstryData....data....", aspect);
      // console.log("sianstryData....data....", aspect.data.p2_data);

      userData.synastry.natalWheelChart = natalWheelChart;
      userData.synastry.houseCusps = houseCusps;
      userData.synastry.planetaryPositions = planetaryPositions;
      userData.synastry.aspect = aspect;
      userData.synastry.harmoniousAspectReading = harmoniousAspectReading;
      userData.synastry.conflictingAspectReading = conflictingAspectReading;
      userData.synastry.contrastingAspectReading = contrastingAspectReading;
      userData.synastry.physicalCompatibility = physicalCompatibility;
      userData.synastry.emotionalCompatibility = emotionalCompatibility;
      userData.synastry.sexualCompatibility = sexualCompatibility;
      userData.synastry.spiritualCompatibility = spiritualCompatibility;
      userData.synastry.financialCompatibility = financialCompatibility;

      console.log(
        "astrologyData....data....",
        userData.synastry.natalWheelChart
      );

      // const { houses, planets, aspectsD } = prepareAstroData(userData);

      await AsyncStorage.setItem("userData", JSON.stringify(userData));
      navigation.navigate("Learn");
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error("Error saving user data:", error);
    }
  };

  const getHeadlineText = (step) => {
    switch (step) {
      case 1:
        return "Care este numele tău?";
      case 2:
        return "Înscrie locul nasterii:";
      case 3:
        return "Selectează data ta de naștere:";
      case 4:
        return "Selectează genul:";
      case 5:
        return "Ce status ai în relație?";
      case 6:
        return "Alege un număr norocos:";
      default:
        return "Completează informațiile:";
    }
  };

  return (
    <Provider>
      <Fragment>
        <MainContainer>
          <LinearGradient
            colors={[
              colors.gradientLogin1,
              colors.gradientLogin11,
              colors.gradientLogin2,
            ]}
            style={{
              flex: 1,
              paddingTop:
                Platform.OS === "android" ? StatusBar.currentHeight : 0,
            }}
          >
            <SpaceSky />
            <Aquarius width={60} height={60} style={styles.aquarius} />
            {!isLoading && (
              <View style={styles.textContainer}>
                <Text style={styles.textText}>
                  {i18n.translate("informatiiCalcule")}
                </Text>
              </View>
            )}

            {isLoading ? (
              <View style={styles.container}>
                <Image source={localGif} style={styles.image} />
                <H8fontRegularWhite style={styles.text}>
                  {loadingMessage}
                </H8fontRegularWhite>
              </View>
            ) : (
              <View style={[styles.inputContainer]}>
                <View>
                  <InputFields
                    value={name}
                    onChangeText={setName}
                    placeholder={`${i18n.translate(
                      "lastName"
                    )} - ${i18n.translate("firstName")}`}
                    image={"person"}
                  />
                  {/* <InputFields
                    value={localitate}
                    onChangeText={setLocalitate}
                    placeholder={"Localitate"}
                    image={"location-city"}
                  />
                  <InputFields
                    value={tara}
                    onChangeText={setTara}
                    placeholder={"Tara"}
                    image={"flag"}
                  /> */}
                </View>
                <MapInputPatientDash
                  setLocation={(location) => setPlace(location)}
                  setAdress={(location) => setAdress(location)}
                  setLong={(location) => setLong(location)}
                  setLat={(location) => setLat(location)}
                  adress={adress}
                  ref={inputRef}
                  value={localitate}
                />

                <View
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-around",
                    alignItems: "flex-start",
                    paddingTop: 20,
                  }}
                >
                  <H8fontMediumWhite>
                    {" "}
                    {i18n.translate("Adresa")}: {place || "-"}
                  </H8fontMediumWhite>

                  <H8fontMediumWhite>
                    {i18n.translate("Longitudine")}: {long || "-"}
                  </H8fontMediumWhite>
                  <H8fontMediumWhite>
                    {i18n.translate("Latitudine")}: {lat || "-"}
                  </H8fontMediumWhite>
                </View>

                {showDatePicker && (
                  <DatePicker
                    date={selectedDate || today}
                    selectedDate={(selectedDate) => {
                      setSelectedDate(selectedDate);
                      setShowDatePicker(false);
                    }}
                  />
                )}

                {showTimePicker && (
                  <TimePicker
                    time={
                      selectedTime
                        ? new Date(
                            moment(selectedTime, "HH:mm:ss").toISOString()
                          )
                        : new Date()
                    } // Convertește timpul selectat înapoi într-un Date
                    selectedTime={(time) => {
                      console.log("time....", time);
                      setSelectedTime(time); // Aici păstrează doar timpul selectat
                      setShowTimePicker(false);
                    }}
                    minTime="00:00"
                    maxTime="23:59"
                  />
                )}

                <View
                  style={{
                    marginTop: "5%",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <H7fontBoldWhite>
                    {i18n.translate("IntroduDataOraNasterii")}
                  </H7fontBoldWhite>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-around",
                      width: "100%",
                      marginTop: "3%",
                      paddingHorizontal: "10%",
                    }}
                  >
                    <Menu
                      visible={isDayMenuVisible}
                      onDismiss={() => setDay(false)}
                      anchor={
                        <Button
                          mode="outlined"
                          style={styles.timeButton}
                          onPress={() => setDayMenuVisible(true)}
                          theme={{
                            colors: {
                              primary: "white", // Folosește o culoare din gradient pentru selectare
                              onSurface: "white", // O culoare închisă pentru text
                            },
                          }}
                        >
                          {day}
                        </Button>
                      }
                    >
                      {Array.from({ length: 31 }, (_, i) => (
                        <Menu.Item
                          key={i}
                          onPress={() => {
                            setDay(`${i + 1}`);
                            setDayMenuVisible(false);
                          }}
                          title={`${i + 1}`}
                        />
                      ))}
                    </Menu>
                    <Menu
                      visible={isMonthMenuVisible}
                      onDismiss={() => setMonthMenuVisible(false)}
                      anchor={
                        <Button
                          mode="outlined"
                          style={styles.timeButton}
                          onPress={() => setMonthMenuVisible(true)}
                          theme={{
                            colors: {
                              primary: "white", // Folosește o culoare din gradient pentru selectare
                              onSurface: "white", // O culoare închisă pentru text
                            },
                          }}
                        >
                          {month}
                        </Button>
                      }
                    >
                      {[
                        "1",
                        "2",
                        "3",
                        "4",
                        "5",
                        "6",
                        "7",
                        "8",
                        "9",
                        "10",
                        "11",
                        "12",
                      ].map((month, index) => (
                        <Menu.Item
                          key={index}
                          onPress={() => {
                            setMonth(month);
                            setMonthMenuVisible(false);
                          }}
                          title={month}
                        />
                      ))}
                    </Menu>
                    <Menu
                      visible={isYearMenuVisible}
                      onDismiss={() => setYearMenuVisible(false)}
                      anchor={
                        <Button
                          mode="outlined"
                          style={styles.timeButton}
                          theme={{
                            colors: {
                              primary: "white", // Folosește o culoare din gradient pentru selectare
                              onSurface: "white", // O culoare închisă pentru text
                            },
                          }}
                          onPress={() => setYearMenuVisible(true)}
                        >
                          {year}
                        </Button>
                      }
                    >
                      {Array.from(
                        { length: new Date().getFullYear() - 1500 + 1 },
                        (_, i) => (
                          <Menu.Item
                            key={i}
                            onPress={() => {
                              setYear(`${new Date().getFullYear() - i}`);
                              setYearMenuVisible(false);
                            }}
                            title={`${new Date().getFullYear() - i}`}
                          />
                        )
                      )}
                    </Menu>
                  </View>
                  <Button
                    mode="outlined"
                    onPress={() => setShowTimePicker(true)}
                    style={styles.timeButton}
                    color="#6200ee"
                    theme={{
                      colors: {
                        primary: colors.white,
                        onSurface: "red",
                      },
                    }}
                    labelStyle={{ fontSize: 18 }}
                  >
                    {selectedTime || i18n.translate("SelecteazaOraNasterii")}
                  </Button>
                </View>

                <GenderSelector setGender={setGender} gender={gender} />
                {/* {currentStep === 5 && (
              <RelationshipScreen
                setRelationshipStatus={setRelationshipStatus}
              />
            )} */}
                {/* {currentStep === 6 && (
              <InputFields
                value={numarNorocos}
                onChangeText={setNumarNorocos}
                placeholder={"Număr norocos"}
                image={"star"}
              />
            )} */}
                <View style={styles.buttonContainer}>
                  <CommonButton
                    disabled={false}
                    funCallback={handleContinue}
                    borderWidth={0.2}
                    bgColor={colors.gradientLogin1}
                    label={i18n.translate("clinicLoginRedirect")}
                    borderColor={colors.white}
                    success={true}
                    style={{ marginTop: "0%", width: "70%" }}
                    txtColor={colors.white}
                  />
                </View>
              </View>
            )}
          </LinearGradient>
        </MainContainer>
      </Fragment>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: width / 1.5, // Setează lățimea la jumătatea ecranului
    alignSelf: "center",
  },
  aquarius: {
    zIndex: 0,
    position: "absolute",
    top: 20,
    right: 20,
    opacity: 0.2,
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: "contain", // Asigură-te că GIF-ul se încadrează în dimensiunile specificate
  },
  text: {
    marginBottom: 20, // Spațiu între text și imagine
    textAlign: "center",
    fontSize: 16,
    color: "white",
  },
  dateButton: {
    color: colors.white,
    marginTop: "2%",
    backgroundColor: colors.primary3,
    width: "100%",
  },
  timeButton: {
    width: "100%",
    marginTop: "3%",
    color: colors.white,
    backgroundColor: colors.primary3,
  },
  textContainer: {
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingTop: "10%",
    height: "12%",
  },
  textText: {
    textAlign: "center",
    paddingVertical: 5,
    color: "white",
  },
  inputContainer: {
    paddingHorizontal: 20,
    opacity: 0.9,
    height: "94%",
    justifyContent: "flex-start",
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingTop: 35,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: "35%",
  },
});

export default NewPersonScreen;

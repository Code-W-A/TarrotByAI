import React, { Fragment, useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Platform,
  Image,
  Dimensions,
  Alert,
} from "react-native";
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
  generateTimestampFromDateTime,
  getZodiacSign,
} from "../../../utils/AstralUtils/fetchNatalWheelChart";
import localGif from "../../../../assets/constelatii.gif";
import {
  H6fontBoldPrimary,
  H7fontBoldWhite,
  H8fontBoldPrimary,
  H8fontMediumWhite,
  H8fontRegularWhite,
  H9fontMediumWhite,
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
import { useTranslation } from "../../../utils/translateUtil";

const { width } = Dimensions.get("window");

function NewTwoSyanstryPersons({ navigation, route }) {
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
  const [selectedTime, setSelectedTime] = useState(null); // Asigură-te că inițializezi cu un obiect Date
  const [loadingMessage, setLoadingMessage] = useState(
    "Vă analizăm informațiile pentru a vă crea astrograma natală..."
  );
  const [timeZoneData, setTimeZoneData] = useState({});

  const [gender, setGender] = useState("male");
  const [relationshipStatus, setRelationshipStatus] = useState("");

  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [day, setDay] = useState("Zi");
  const [month, setMonth] = useState("Lună");
  const [year, setYear] = useState("An");
  const [isDayMenuVisible, setDayMenuVisible] = useState(false);
  const [isMonthMenuVisible, setMonthMenuVisible] = useState(false);
  const [isYearMenuVisible, setYearMenuVisible] = useState(false);

  // COD PENTRU ANALIZA A 2 PERSOANE
  const [currentStep, setCurrentStep] = useState(1); // 1 pentru persoana 1, 2 pentru persoana 2
  const [person1Data, setPerson1Data] = useState({
    name: "",
    place: "",
    lat: "",
    long: "",
    dateOfBirth: null,
    timeOfBirth: null,
    gender: "male",
  });
  const [person2Data, setPerson2Data] = useState({
    name: "",
    place: "",
    lat: "",
    long: "",
    dateOfBirth: null,
    timeOfBirth: null,
    gender: "male",
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleDateChange = (date) => {
    if (currentStep === 1) {
      setPerson1Data({ ...person1Data, dateOfBirth: date });
    } else {
      setPerson2Data({ ...person2Data, dateOfBirth: date });
    }
    setShowDatePicker(false);
  };

  const handleTimeChange = (time) => {
    if (currentStep === 1) {
      setPerson1Data({ ...person1Data, timeOfBirth: time });
    } else {
      setPerson2Data({ ...person2Data, timeOfBirth: time });
    }
    setShowTimePicker(false);
  };

  const [clearInput, setClearInput] = useState(null);

  const handleNext = () => {
    if (currentStep === 1) {
      // Copiază doar valorile legate de locație din person1Data în person2Data
      setPerson2Data((prev) => ({
        ...prev,
        adress: person1Data.adress,
        place: person1Data.place,
        long: person1Data.long,
        lat: person1Data.lat,
      }));

      setCurrentStep(2); // Treci la pasul 2
    }
  };

  const handleFinalize = () => {
    console.log("Person 1 Data:", person1Data);
    console.log("Person 2 Data:", person2Data);
    handleContinue();
    // navigation.navigate("ResultsScreen", { person1Data, person2Data });
  };
  // COD PENTRU ANALIZA A 2 PERSOANE

  const inputRef = React.useRef(null);

  useEffect(() => {
    console.log("selectedTime.......", selectedTime);
  }, []);

  useEffect(() => {
    if (route.params?.editMode) {
      setIsEditMode(true);

      if (route.params?.analysisData) {
        const { person1, person2 } = route.params.analysisData;

        // Date pentru Persoana 1
        setPerson1Data({
          name: person1.full_name || "",
          place: person1.place || "",
          adress: person1.adress || "",
          lat: person1.lat || "",
          long: person1.lon || "",
          day: person1.day || moment(person1.dateOfBirth).date(),
          month: person1.month || moment(person1.dateOfBirth).month() + 1,
          year: person1.year || moment(person1.dateOfBirth).year(),
          timeOfBirth: person1.timeOfBirth || `${person1.hour}:${person1.min}`,
          gender: person1.gender || "male",
          selectedTime: person1.timeOfBirth
            ? moment(`${person1.hour}:${person1.min}`, "HH:mm").toDate()
            : null,
        });

        // Date pentru Persoana 2
        setPerson2Data({
          name: person2.full_name || "",
          place: person2.place || "",
          adress: person2.adress || "",
          lat: person2.lat || "",
          long: person2.lon || "",
          day: person2.day || moment(person2.dateOfBirth).date(),
          month: person2.month || moment(person2.dateOfBirth).month() + 1,
          year: person2.year || moment(person2.dateOfBirth).year(),
          timeOfBirth: person2.timeOfBirth || `${person2.hour}:${person2.min}`,
          gender: person2.gender || "male",
          selectedTime: person2.timeOfBirth
            ? moment(`${person2.hour}:${person2.min}`, "HH:mm").toDate()
            : null,
        });
      }
    }
  }, [route.params]);

  const handleContinue = async () => {
    // if (!lat || !long || !adress || !place) {
    //   console.error("Adresa nu este completată!");
    //   Alert.alert(
    //     "Selectati cel putin o adresa", // Titlul alertei
    //     "Va rugam selectati cel putin o adresa din lista!", // Mesajul alertei
    //     [
    //       {
    //         text: "Anulează",
    //         onPress: () => console.log("Anulează apăsat"),
    //         style: "cancel",
    //       },
    //       { text: "OK", onPress: () => console.log("OK apăsat") },
    //     ],
    //     { cancelable: true } // Opțional: închide alerta dacă se apasă în afara acesteia
    //   );
    //   return;
    // }
    try {
      setIsLoading(true);

      // Obține datele existente din AsyncStorage
      const personsD = await AsyncStorage.getItem("personsDataOthers");
      const parsedDataPersons = personsD ? JSON.parse(personsD) : [];

      // Helper pentru construirea datelor pentru o persoană
      const buildPersonData = async (person, selectedTime) => {
        const birthTime = selectedTime
          ? moment(selectedTime, "HH:mm")
          : moment();

        const timestamp = generateTimestampFromDateTime(
          `${day}-${month}-${year}`,
          selectedTime
        );
        console.log("time zone....selectedDate", `${day}-${month}-${year}`);
        console.log("time zone....selectedTime", selectedTime);
        console.log("time zone....timestamp", timestamp);
        const data = await fetchTimeZone(person.lat, person.long, timestamp);
        // const data = await fetchTimeZone(person.lat, person.long);
        const timezoneOffset = data.offset;
        const zodiacSign = getZodiacSign(person.day, person.month);

        return {
          full_name: person.name || "",
          day: person.day || "Zi",
          month: person.month || "Lună",
          year: person.year || "An",
          hour: birthTime.hour(),
          min: birthTime.minute(),
          sec: birthTime.second(),
          gender: person.gender || "male",
          place: person.place || "",
          adress: person.adress || "",
          localitate: person.localitate || "",
          tara: person.tara || "",
          lat: person.lat || "",
          lon: person.long || "",
          tzone: timezoneOffset,
          // timeZoneData.data.timeZoneId === "Europe/Bucharest"
          //   ? timezoneOffset + 1
          //   : timezoneOffset,
          zodiacSign,
          zodiacSignFristUpperCase: capitalizeFirstLetter(
            zodiacSign.toLowerCase()
          ),
          dataHoroscop: new Date().toISOString().split("T")[0],
        };
      };

      // Construim datele pentru persoana 1 și persoana 2
      const person1FinalData = await buildPersonData(
        person1Data,
        person1Data.selectedTime
      );
      const person2FinalData = await buildPersonData(
        person2Data,
        person2Data.selectedTime
      );

      // Creăm un nou obiect pentru analiza curentă

      const generateUniqueId = () =>
        "_" + Math.random().toString(36).substr(2, 9);
      const newAnalysis = {
        type: "othersSinastry",
        id: generateUniqueId(), // Adaugă un ID unic
        person1: person1FinalData,
        person2: person2FinalData,
        synastry: {}, // Rezultatele sinastriei vor fi adăugate ulterior
        createdAt: new Date().toISOString(),
        actualLanguage: "naan",
        actualLanguageAstrograma: "naan",
        actualLanguageSinastrie: "naan",
      };

      if (isEditMode && route.params?.analysisIndex !== undefined) {
        // Dacă suntem în modul de editare, actualizăm analiza existentă
        parsedDataPersons[route.params.analysisIndex] = newAnalysis;
      } else {
        // Dacă suntem în modul de adăugare, adăugăm analiza la lista existentă
        parsedDataPersons.push(newAnalysis);
      }

      // Configurați URL-urile pentru analizele de sinastrie
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
        intenseCompatibility:
          "https://astroapi-4.divineapi.com/western-api/v1/synastry/intense-aspect-reading",
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

      // Efectuăm analizele de sinastrie folosind datele ambelor persoane
      const results = await Promise.all(
        Object.keys(sinastrieUrls).map((key) =>
          fetchSinastrieData(
            sinastrieUrls[key],
            person1FinalData.full_name,
            person1FinalData.day,
            person1FinalData.month,
            person1FinalData.year,
            person1FinalData.hour,
            person1FinalData.min,
            person1FinalData.sec,
            person1FinalData.gender,
            person1FinalData.place,
            person1FinalData.lat,
            person1FinalData.lon,
            person1FinalData.tzone,
            person2FinalData // Transmitem datele persoanei 2
          )
        )
      );

      // Salvăm rezultatele sinastriei în noua analiză
      const [
        natalWheelChart,
        houseCusps,
        planetaryPositions,
        aspect,
        harmoniousAspectReading,
        conflictingAspectReading,
        contrastingAspectReading,
        intenseCompatibility,
        physicalCompatibility,
        emotionalCompatibility,
        sexualCompatibility,
        spiritualCompatibility,
        financialCompatibility,
      ] = results;

      newAnalysis.synastry = {
        natalWheelChart,
        houseCusps,
        planetaryPositions,
        aspect,
        harmoniousAspectReading,
        conflictingAspectReading,
        contrastingAspectReading,
        intenseCompatibility,
        physicalCompatibility,
        emotionalCompatibility,
        sexualCompatibility,
        spiritualCompatibility,
        financialCompatibility,
      };

      // Salvăm array-ul actualizat în AsyncStorage
      await AsyncStorage.setItem(
        "personsDataOthers",
        JSON.stringify(parsedDataPersons)
      );

      console.log("Date salvate cu succes:", parsedDataPersons);

      // Navigăm către ecranul de rezultate
      setIsLoading(false);
      navigation.navigate("Learn");
    } catch (error) {
      setIsLoading(false);
      console.error("Error saving persons data:", error);
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

  calculateTimeZone = async (lat, long) => {
    const data = await fetchTimeZone(lat, long);
    console.log("data...timezone...", data);
    setTimeZoneData(data);
  };

  useEffect(() => {
    if (currentStep === 1) {
      setPerson1Data((prev) => ({ ...prev, adress: "" }));
    } else {
      setPerson2Data((prev) => ({ ...prev, adress: "" }));
    }
  }, [currentStep]);

  //traducere inline text
  const primaPersonaText = useTranslation(
    "Informatii prima persoana.",
    language,
    "MoreInfoModal"
  );
  const douaPersonaText = useTranslation(
    "Informatii a doua persoana.",
    language,
    "MoreInfoModal"
  );
  //traducere inline text

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
                  {currentStep === 1 ? primaPersonaText : douaPersonaText}
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
              <View
                style={[
                  styles.inputContainer,
                  { height: timeZoneData?.offset ? "92%" : "88%" },
                ]}
              >
                <View>
                  <InputFields
                    value={
                      currentStep === 1 ? person1Data.name : person2Data.name
                    }
                    onChangeText={(text) =>
                      currentStep === 1
                        ? setPerson1Data({ ...person1Data, name: text })
                        : setPerson2Data({ ...person2Data, name: text })
                    }
                    placeholder={`${i18n.translate(
                      "lastName"
                    )} - ${i18n.translate("firstName")}`}
                    image={"person"}
                  />
                </View>

                {}
                <MapInputPatientDash
                  setLocation={(location) =>
                    currentStep === 1
                      ? setPerson1Data((prev) => ({ ...prev, place: location }))
                      : setPerson2Data((prev) => ({ ...prev, place: location }))
                  }
                  setAdress={(address) =>
                    currentStep === 1
                      ? setPerson1Data((prev) => ({ ...prev, adress: address }))
                      : setPerson2Data((prev) => ({ ...prev, adress: address }))
                  }
                  setLong={(longitude) =>
                    currentStep === 1
                      ? setPerson1Data((prev) => ({ ...prev, long: longitude }))
                      : setPerson2Data((prev) => ({ ...prev, long: longitude }))
                  }
                  setLat={(latitude) =>
                    currentStep === 1
                      ? setPerson1Data((prev) => ({ ...prev, lat: latitude }))
                      : setPerson2Data((prev) => ({ ...prev, lat: latitude }))
                  }
                  adress={
                    currentStep === 1 ? person1Data.adress : person2Data.adress
                  }
                  calculateTimeZone={(lat, long) =>
                    calculateTimeZone(lat, long)
                  }
                  currentStep={currentStep}
                />

                <View
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-around",
                    alignItems: "flex-start",
                    paddingTop: timeZoneData?.offset ? 15 : 0,
                    paddingLeft: 10,
                  }}
                >
                  <H9fontMediumWhite>
                    {i18n.translate("Adresa")}:{" "}
                    {currentStep === 1
                      ? person1Data.place || "-"
                      : person2Data.place || "-"}
                  </H9fontMediumWhite>
                  {timeZoneData?.offset && (
                    <H9fontMediumWhite>
                      {timeZoneData?.data?.timeZoneName}, UTC/GMT +
                      {timeZoneData?.offset} hours
                    </H9fontMediumWhite>
                  )}
                  <H9fontMediumWhite>
                    Long/Lat:{" "}
                    {currentStep === 1
                      ? `${person1Data.long || "-"} / ${person1Data.lat || "-"}`
                      : `${person2Data.long || "-"} / ${
                          person2Data.lat || "-"
                        }`}
                  </H9fontMediumWhite>
                </View>

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
                    onDismiss={() => setDayMenuVisible(false)}
                    anchor={
                      <Button
                        mode="outlined"
                        style={styles.timeButton}
                        onPress={() => setDayMenuVisible(true)}
                        theme={{
                          colors: {
                            primary: "white",
                            onSurface: "white",
                          },
                        }}
                      >
                        {currentStep === 1
                          ? person1Data.day || "Zi"
                          : person2Data.day || "Zi"}
                      </Button>
                    }
                  >
                    {Array.from({ length: 31 }, (_, i) => (
                      <Menu.Item
                        key={i}
                        onPress={() => {
                          const dayValue = `${i + 1}`;
                          if (currentStep === 1) {
                            setPerson1Data({ ...person1Data, day: dayValue });
                          } else {
                            setPerson2Data({ ...person2Data, day: dayValue });
                          }
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
                            primary: "white",
                            onSurface: "white",
                          },
                        }}
                      >
                        {currentStep === 1
                          ? person1Data.month || "Lună"
                          : person2Data.month || "Lună"}
                      </Button>
                    }
                  >
                    {[...Array(12).keys()].map((month) => (
                      <Menu.Item
                        key={month}
                        onPress={() => {
                          const monthValue = `${month + 1}`;
                          if (currentStep === 1) {
                            setPerson1Data({
                              ...person1Data,
                              month: monthValue,
                            });
                          } else {
                            setPerson2Data({
                              ...person2Data,
                              month: monthValue,
                            });
                          }
                          setMonthMenuVisible(false);
                        }}
                        title={`${month + 1}`}
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
                        onPress={() => setYearMenuVisible(true)}
                        theme={{
                          colors: {
                            primary: "white",
                            onSurface: "white",
                          },
                        }}
                      >
                        {currentStep === 1
                          ? person1Data.year || "An"
                          : person2Data.year || "An"}
                      </Button>
                    }
                  >
                    {Array.from(
                      { length: new Date().getFullYear() - 1500 + 1 },
                      (_, i) => (
                        <Menu.Item
                          key={i}
                          onPress={() => {
                            const yearValue = `${new Date().getFullYear() - i}`;
                            if (currentStep === 1) {
                              setPerson1Data({
                                ...person1Data,
                                year: yearValue,
                              });
                            } else {
                              setPerson2Data({
                                ...person2Data,
                                year: yearValue,
                              });
                            }
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
                  color="white"
                  theme={{
                    colors: {
                      primary: colors.white,
                      onSurface: "red",
                    },
                  }}
                  labelStyle={{ fontSize: 18 }}
                >
                  {currentStep === 1
                    ? person1Data.timeOfBirth ||
                      i18n.translate("SelecteazaOraNasterii")
                    : person2Data.timeOfBirth ||
                      i18n.translate("SelecteazaOraNasterii")}
                </Button>

                {showTimePicker && (
                  <TimePicker
                    time={
                      currentStep === 1
                        ? new Date(
                            moment(
                              person1Data.timeOfBirth || "00:00:00",
                              "HH:mm:ss"
                            )
                          )
                        : new Date(
                            moment(
                              person2Data.timeOfBirth || "00:00:00",
                              "HH:mm:ss"
                            )
                          )
                    }
                    selectedTime={(time) => {
                      if (currentStep === 1) {
                        setPerson1Data({
                          ...person1Data,
                          timeOfBirth: time,
                        });
                      } else {
                        setPerson2Data({
                          ...person2Data,
                          timeOfBirth: time,
                        });
                      }
                      setShowTimePicker(false);
                    }}
                    minTime="00:00"
                    maxTime="23:59"
                  />
                )}

                <GenderSelector
                  setGender={(gender) =>
                    currentStep === 1
                      ? setPerson1Data({ ...person1Data, gender })
                      : setPerson2Data({ ...person2Data, gender })
                  }
                  gender={
                    currentStep === 1 ? person1Data.gender : person2Data.gender
                  }
                />

                <View style={styles.buttonContainer}>
                  {currentStep === 1 ? (
                    <CommonButton
                      disabled={false}
                      funCallback={() => {
                        handleNext();
                      }}
                      borderWidth={0.2}
                      bgColor={colors.gradientLogin1}
                      label={"Următoarea persoană"}
                      borderColor={colors.white}
                      success={true}
                      style={{ marginTop: "0%", width: "70%" }}
                      txtColor={colors.white}
                    />
                  ) : (
                    <CommonButton
                      disabled={false}
                      funCallback={handleFinalize}
                      borderWidth={0.2}
                      bgColor={colors.gradientLogin1}
                      label={"Finalizare"}
                      borderColor={colors.white}
                      success={true}
                      style={{ marginTop: "0%", width: "70%" }}
                      txtColor={colors.white}
                    />
                  )}
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

export default NewTwoSyanstryPersons;

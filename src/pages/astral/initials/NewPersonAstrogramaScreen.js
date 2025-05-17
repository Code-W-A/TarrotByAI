import React, { Fragment, useCallback, useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Platform,
  Image,
  Dimensions,
  Alert,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  StyleSheet as StyleSheetRN,
} from "react-native";
import { Button, Headline, Menu, Provider, Text } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MainContainer } from "../../../components/commonViews";
import { LinearGradient } from "expo-linear-gradient";
import { Video } from 'expo-av';

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
import { TextInput } from "react-native";

const { width } = Dimensions.get("window");

function NewPersonAstrograma({ navigation, route }) {
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
  const [timeZoneData, setTimeZoneData] = useState({});
  const [timezone, setTimezone] = useState(0);

  const [persons, setPersons] = useState([]);

  const inputRef = React.useRef(null);

  const handleSavePerson = () => {
    const newPerson = {
      name,
      localitate,
      place,
      adress,
      lat,
      long,
      tara,
      selectedDate,
      selectedTime,
      gender,
      relationshipStatus,
      day,
      month,
      year,
    };

    if (isEditMode) {
      // Update persoana curentă
      setPersons((prevPersons) =>
        prevPersons.map((p, index) =>
          index === route.params.editIndex ? newPerson : p
        )
      );
    } else {
      // Adaugă o persoană nouă
      setPersons((prevPersons) => [...prevPersons, newPerson]);
    }

    // Resetează câmpurile
    resetFields();
    navigation.goBack();
  };

  const resetFields = () => {
    setName("");
    setLocalitate("");
    setPlace("");
    setAdress("");
    setLat("");
    setLong("");
    setTara("");
    setSelectedDate(null);
    setSelectedTime(null);
    setGender("male");
    setRelationshipStatus("");
    setDay("Zi");
    setMonth("Lună");
    setYear("An");
    setIsEditMode(false);
  };

  useEffect(() => {
    // console.log("selectedTime.......", selectedTime);
  }, []);

  useEffect(() => {
    if (route.params?.editMode && route.params?.personData) {
      const personData = route.params.personData;

      // Populează state-urile cu datele primite
      setName(personData.full_name || "");
      setSelectedDate(personData.selectedDate || null);
      setSelectedTime(personData.selectedTime || null);
      setGender(personData.gender || "male");
      setRelationshipStatus(personData.relationshipStatus || "");
      setPlace(personData.place || "");
      setAdress(personData.adress || "");
      setTara(personData.tara || "");
      setDay(personData.day || "Zi");
      setMonth(personData.month || "Lună");
      setYear(personData.year || "An");
      setLat(personData.lat || "");
      setLong(personData.lon || "");
      setIsEditMode(true); // Marchează că suntem în modul editare
    }
  }, [route.params]);

  // useFocusEffect(
  //   useCallback(() => {
  //     if (!route.params?.editMode) {
  //       const checkUserData = async () => {
  //         try {
  //           // Verificăm dacă aplicația a fost accesată prima dată
  //           const isFirstLaunch = await AsyncStorage.getItem("isFirstLaunch");

  //           // Dacă este prima lansare, setăm flag-ul și continuăm fără redirecționare
  //           if (isFirstLaunch === null) {
  //             await AsyncStorage.setItem("isFirstLaunch", "false");
  //             console.log("First launch, not redirecting to Learn.");
  //             return; // Ieșim din funcție fără redirecționare
  //           }

  //           // Verificăm datele utilizatorului pentru redirecționare
  //           const userData = await AsyncStorage.getItem("userData");
  //           const parsedData = JSON.parse(userData);
  //           console.log("Retrieved user data:", parsedData.actualLanguage);
  //           console.log(
  //             "Retrieved user data:",
  //             parsedData.actualLanguageAstrograma
  //           );
  //           console.log(
  //             "Retrieved user data:",
  //             parsedData.actualLanguageSinastrie
  //           );
  //           console.log("Retrieved user data:", parsedData.full_name);

  //           if (
  //             parsedData &&
  //             parsedData?.actualLanguage &&
  //             parsedData?.actualLanguageAstrograma &&
  //             parsedData?.actualLanguageSinastrie &&
  //             parsedData?.full_name
  //           ) {
  //             navigation.navigate("Learn");
  //           }
  //         } catch (error) {
  //           console.error("Error checking user data:", error);
  //         }
  //       };
  //       checkUserData();
  //     }
  //   }, [navigation, route.params?.editMode])
  // );

  const loadUserData = async () => {
    try {
      const personsData = await AsyncStorage.getItem("personsDataAstrograma");
      const parsedDataPersons = personsData ? JSON.parse(personsData) : [];

      if (route.params?.editMode && route.params?.editIndex !== undefined) {
        const personToEdit = parsedDataPersons[route.params.editIndex];
        setName(personToEdit.full_name);
        setSelectedDate(personToEdit.selectedDate);
        setSelectedTime(personToEdit.selectedTime);
        setGender(personToEdit.gender);
        setRelationshipStatus(personToEdit.relationshipStatus);
        setPlace(personToEdit.place);
        setAdress(personToEdit.adress);
        setTara(personToEdit.tara);
        setDay(personToEdit.day);
        setMonth(personToEdit.month);
        setYear(personToEdit.year);
        setLat(personToEdit.lat);
        setLong(personToEdit.lon);
      }
    } catch (error) {
      console.error("Error loading person data:", error);
    }
  };

  // const handleRemakeAllSinastries = async (userData, parsedDataPersons) => {
  //   // Configurați URL-urile pentru analizele de sinastrie
  //   const sinastrieUrls = {
  //     natalWheelChart:
  //       "https://astroapi-4.divineapi.com/western-api/v1/synastry/natal-wheel-chart",
  //     houseCusps:
  //       "https://astroapi-4.divineapi.com/western-api/v1/synastry/house-cusps",
  //     planetaryPositions:
  //       "https://astroapi-4.divineapi.com/western-api/v1/synastry/planetary-positions",
  //     aspect: "https://astroapi-4.divineapi.com/western-api/v1/synastry/aspect",
  //     harmoniousAspectReading:
  //       "https://astroapi-4.divineapi.com/western-api/v1/synastry/harmonious-aspect-reading",
  //     conflictingAspectReading:
  //       "https://astroapi-4.divineapi.com/western-api/v1/synastry/conflicting-aspect-reading",
  //     contrastingAspectReading:
  //       "https://astroapi-4.divineapi.com/western-api/v1/synastry/contrasting-aspect-reading",
  //     intenseCompatibility:
  //       "https://astroapi-4.divineapi.com/western-api/v1/synastry/intense-aspect-reading",
  //     physicalCompatibility:
  //       "https://astroapi-4.divineapi.com/western-api/v1/synastry/physical-compatibility",
  //     emotionalCompatibility:
  //       "https://astroapi-4.divineapi.com/western-api/v1/synastry/emotional-compatibility",
  //     sexualCompatibility:
  //       "https://astroapi-4.divineapi.com/western-api/v1/synastry/sexual-compatibility",
  //     spiritualCompatibility:
  //       "https://astroapi-4.divineapi.com/western-api/v1/synastry/spiritual-compatibility",
  //     financialCompatibility:
  //       "https://astroapi-4.divineapi.com/western-api/v1/synastry/financial-compatibility",
  //   };

  //   // Parcurge toate persoanele din parsedDataPersons
  //   for (
  //     let currentPersonIndex = 0;
  //     currentPersonIndex < parsedDataPersons.length;
  //     currentPersonIndex++
  //   ) {
  //     const currentPerson = parsedDataPersons[currentPersonIndex];

  //     // Actualizează valorile pentru limbaj
  //     currentPerson.actualLanguage = "en";
  //     currentPerson.actualLanguageAstrograma = "en";
  //     currentPerson.actualLanguageSinastrie = "en";

  //     // Efectuați analizele de sinastrie pentru persoana curentă
  //     const results = await Promise.all(
  //       Object.keys(sinastrieUrls).map((key) =>
  //         fetchSinastrieData(
  //           sinastrieUrls[key],
  //           userData.full_name,
  //           userData.day,
  //           userData.month,
  //           userData.year,
  //           userData.hour,
  //           userData.min,
  //           userData.sec,
  //           userData.gender,
  //           userData.place,
  //           userData.lat,
  //           userData.lon,
  //           userData.tzone,
  //           currentPerson
  //         )
  //       )
  //     );

  //     const [
  //       natalWheelChart,
  //       houseCusps,
  //       planetaryPositions,
  //       aspect,
  //       harmoniousAspectReading,
  //       conflictingAspectReading,
  //       contrastingAspectReading,
  //       intenseCompatibility,
  //       physicalCompatibility,
  //       emotionalCompatibility,
  //       sexualCompatibility,
  //       spiritualCompatibility,
  //       financialCompatibility,
  //     ] = results;

  //     // Adaugă rezultatele analizei în obiectul persoanei curente
  //     parsedDataPersons[currentPersonIndex].synastry = {
  //       natalWheelChart,
  //       houseCusps,
  //       planetaryPositions,
  //       aspect,
  //       harmoniousAspectReading,
  //       conflictingAspectReading,
  //       contrastingAspectReading,
  //       intenseCompatibility,
  //       physicalCompatibility,
  //       emotionalCompatibility,
  //       sexualCompatibility,
  //       spiritualCompatibility,
  //       financialCompatibility,
  //     };
  //   }

  //   // Salvează datele actualizate în AsyncStorage
  //   await AsyncStorage.setItem(
  //     "personsDataAstrograma",
  //     JSON.stringify(parsedDataPersons)
  //   );
  // };

  const handleContinue = async () => {
    if (!lat || !long || !adress || !place) {
      console.error("Adresa nu este completată!");
      Alert.alert(
        "Selectati cel putin o adresa", // Titlul alertei
        "Va rugam selectati cel putin o adresa din lista!", // Mesajul alertei
        [
          {
            text: "Anulează",
            onPress: () => console.log("Anulează apăsat"),
            style: "cancel",
          },
          { text: "OK", onPress: () => console.log("OK apăsat") },
        ],
        { cancelable: true } // Opțional: închide alerta dacă se apasă în afara acesteia
      );
      return;
    }
    const celestialBodies = [
      "Sun",
      "Moon",
      "Mars",
      "Mercury",
      "Venus",
      "Jupiter",
      "Saturn",
      "NorthNode",
      "SouthNode",
      "Uranus",
      "Neptune",
      "Pluto",
      "MC",
      "Chiron",
    ];

    try {
      const personsD = await AsyncStorage.getItem("personsDataAstrograma");
      const parsedDataPersons = personsD ? JSON.parse(personsD) : [];

      setIsLoading(true);
      const birthDate = moment(selectedDate, "DD-MM-YYYY");
      const birthTime = selectedTime ? moment(selectedTime, "HH:mm") : moment();

      const timestamp = generateTimestampFromDateTime(
        `${day}-${month}-${year}`,
        selectedTime
      );
      console.log("time zone....selectedDate", `${day}-${month}-${year}`);
      console.log("time zone....selectedTime", selectedTime);
      console.log("time zone....timestamp", timestamp);
      const data = await fetchTimeZone(lat, long, timestamp);
      const timezoneOffset = data.offset;
      console.log("time zone....data", data);
      console.log("time zone....", timezoneOffset);
      console.log("getZodiacSign....day", day);
      console.log("getZodiacSign....month", month);

      const zodiacSign = getZodiacSign(day, month);
      console.log("getZodiacSign....zodiacSign", zodiacSign);
      const zodiacSignFristUpperCase = capitalizeFirstLetter(
        zodiacSign.toLowerCase()
      );
      console.log(
        "getZodiacSign....zodiacSignFristUpperCase",
        zodiacSignFristUpperCase
      );

      const currentDate = new Date();
      const formattedDate = currentDate.toISOString().split("T")[0];
      const generateUniqueId = () =>
        "_" + Math.random().toString(36).substr(2, 9);
      const userData = {
        type: "othersAstrograma",
        id: generateUniqueId(), // Adaugă un ID unic
        full_name: name,
        day,
        month,
        year,
        hour: birthTime.hour(),
        min: birthTime.minute(),
        sec: birthTime.second(),
        selectedDate,
        selectedTime,
        gender,
        place,
        adress,
        localitate,
        tara,
        lat,
        long,
        // tzone: timezoneOffset + 1,
        tzone: timezoneOffset,
        // timeZoneData.data.timeZoneId === "Europe/Bucharest"
        //   ? timezoneOffset + 1
        //   : timezoneOffset,
        // tzone: timezone,
        actualLanguage: "en",
        actualLanguageAstrograma: "en",
        actualLanguageSinastrie: "en",
        zodiacSign,
        zodiacSignFristUpperCase,
        dataHoroscop: formattedDate,
      };

      // const urls = {
      //   natalWheelChart:
      //     "https://astroapi-4.divineapi.com/western-api/v1/natal-wheel-chart",
      //   aspectTable:
      //     "https://astroapi-4.divineapi.com/western-api/v2/aspect-table",
      //   planetaryPositions:
      //     "https://astroapi-4.divineapi.com/western-api/v1/planetary-positions",
      //   houseCusps:
      //     "https://astroapi-4.divineapi.com/western-api/v1/house-cusps",
      //   moonPhases:
      //     "https://astroapi-4.divineapi.com/western-api/v1/moon-phases",
      //   ascendantReport:
      //     "https://astroapi-4.divineapi.com/western-api/v1/ascendant-report",
      // };
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

      setLoadingMessage(i18n.translate("calculatingPlanetPositions"));

      const horoscopeResultsDaily = await fetchHoroscopeData(
        horoscopeUrls.dailyHoroscopePrediction,
        userData.day,
        userData.month,
        userData.year,
        userData.zodiacSign,
        userData.tzone
      );

      const horoscopeResultsWeekly = await fetchHoroscopeDataWeek(
        horoscopeUrls.weeklyHoroscopePrediction,
        userData.day,
        userData.month,
        userData.year,
        userData.zodiacSign,
        userData.tzone
      );

      const horoscopeResultsMonthly = await fetchHoroscopeDataMonth(
        horoscopeUrls.monthlyHoroscopePrediction,
        userData.day,
        userData.month,
        userData.year,
        userData.zodiacSign,
        userData.tzone
      );

      const horoscopeResultsYearly = await fetchHoroscopeDataYear(
        horoscopeUrls.anualHoroscopePrediction,
        userData.day,
        userData.month,
        userData.year,
        userData.zodiacSign,
        userData.tzone
      );

      userData.horoscopeResultsDaily = horoscopeResultsDaily;
      userData.horoscopeResultsWeekly = horoscopeResultsWeekly;
      userData.horoscopeResultsMonthly = horoscopeResultsMonthly;
      userData.horoscopeResultsYearly = horoscopeResultsYearly;
      // ------HOROSCOPE-----

      const urls = {
        natalWheelChart:
          "https://astroapi-4.divineapi.com/western-api/v1/natal-wheel-chart",
        aspectTable:
          "https://astroapi-4.divineapi.com/western-api/v2/aspect-table",
        planetaryPositions:
          "https://astroapi-4.divineapi.com/western-api/v1/planetary-positions",
        houseCusps:
          "https://astroapi-4.divineapi.com/western-api/v1/house-cusps",
        moonPhases:
          "https://astroapi-4.divineapi.com/western-api/v2/moon-phases",
        ascendantReport:
          "https://astroapi-4.divineapi.com/western-api/v1/ascendant-report",
        generalHouseReports: celestialBodies.map(
          (body) =>
            `https://astroapi-4.divineapi.com/western-api/v1/general-house-report/${body}`
        ),
        generalSignReports: celestialBodies.map(
          (body) =>
            `https://astroapi-4.divineapi.com/western-api/v1/general-sign-report/${body}`
        ),
      };

      const results = await Promise.all([
        ...Object.keys(urls)
          .filter(
            (key) =>
              key !== "generalSignReports" && key !== "generalHouseReports"
          )
          .map((key) =>
            fetchAstroData(
              urls[key],
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
              userData.long,
              userData.tzone
            )
          ),
        ...urls.generalSignReports.map((url) =>
          fetchAstroData(
            url,
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
            userData.long,
            userData.tzone
          )
        ),
        ...urls.generalHouseReports.map((url) =>
          fetchAstroData(
            url,
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
            userData.long,
            userData.tzone
          )
        ),
      ]);

      const [
        natalData,
        aspectsData,
        planetaryData,
        cuspsData,
        moonPhaseData,
        ascendantData,
        ...remainingResults
      ] = results;

      // Separate results into generalSign and generalHouse
      const generalSignResults = remainingResults.slice(
        0,
        celestialBodies.length
      );
      const generalHouseResults = remainingResults.slice(
        celestialBodies.length
      );

      // Map the results for generalSignReports
      const generalSignTextData = {};
      celestialBodies.forEach((body, index) => {
        generalSignTextData[body] = generalSignResults[index];
      });

      // Map the results for generalHouseReports
      const generalHouseTextData = {};
      celestialBodies.forEach((body, index) => {
        generalHouseTextData[body] = generalHouseResults[index];
      });

      // Assign results to userData
      userData.natalData = natalData;
      userData.aspectsData = aspectsData;
      userData.planetaryData = planetaryData;
      userData.cuspsData = cuspsData;
      userData.moonPhaseData = moonPhaseData;
      userData.ascendantData = ascendantData;
      userData.generalSignTextData = generalSignTextData;
      userData.generalHouseTextData = generalHouseTextData;

      // console.log("userData...", userData.generalSignTextData);

      // const { houses, planets, aspectsD } = prepareAstroData(userData);

      // const astrologyData = {
      //   birthDate: `${userData.day}.${userData.month}.${userData.year}`,
      //   birthTime: `${userData.hour}:${userData.min}`,
      //   birthPlace: userData.place,
      //   latitude: userData.lat,
      //   longitude: userData.lon,
      //   houseSystem: "Placidus",
      //   houses,
      //   planets,
      //   aspects: aspectsD,
      // };

      // const categories = [
      //   "General",
      //   "Dragoste",
      //   "Familie",
      //   "Bani",
      //   "Munca si studii",
      //   "Prieteni",
      //   "Sanatate",
      //   "Spiritualitate",
      // ];

      // for (const category of categories) {
      //   setLoadingMessage(i18n.translate(`fetching${category}`));
      //   const userInput = formatAstrologyReport(astrologyData, category);
      //   userData[`${category.toLowerCase()}Category`] = await fetchChatResponse(
      //     userInput
      //   );
      // }

      // setIsLoading(false);
      // let userInput;
      // userInput = formatAstrologyReport(astrologyData, "General");
      // // console.log("userInput....", userInput);
      // const generalCategory = await fetchChatResponse(userInput);
      // userData.generalCategory = generalCategory;
      // // console.log("userInput....2", userData.generalCategory);

      // setLoadingMessage(i18n.translate("creatingAstroChart"));
      // userInput = formatAstrologyReport(astrologyData, "Dragoste");
      // const dragosteCategory = await fetchChatResponse(userInput);
      // userData.dragosteCategory = dragosteCategory;

      // setLoadingMessage(i18n.translate("analyzingPlanetLinks"));
      // userInput = formatAstrologyReport(astrologyData, "Familie");
      // const familieCategory = await fetchChatResponse(userInput);
      // userData.familieCategory = familieCategory;

      // setLoadingMessage(i18n.translate("findingMoonPhases"));
      // userInput = formatAstrologyReport(astrologyData, "Bani");
      // const baniCategory = await fetchChatResponse(userInput);
      // userData.baniCategory = baniCategory;

      // setLoadingMessage(i18n.translate("elaboratingAscendantReport"));
      // userInput = formatAstrologyReport(astrologyData, "Munca si studii");
      // const muncaStudiiCategory = await fetchChatResponse(userInput);
      // userData.muncaStudiiCategory = muncaStudiiCategory;

      // setLoadingMessage(i18n.translate("analyzingPlanetLinks"));
      // userInput = formatAstrologyReport(astrologyData, "Prieteni");
      // const prieteniCategory = await fetchChatResponse(userInput);
      // userData.prieteniCategory = prieteniCategory;

      // setLoadingMessage(i18n.translate("calculatingPlanetPositionsLong"));
      // userInput = formatAstrologyReport(astrologyData, "Sanatate");
      // const sanatateCategory = await fetchChatResponse(userInput);
      // userData.sanatateCategory = sanatateCategory;

      // setLoadingMessage(i18n.translate("finalizingReport"));
      // userInput = formatAstrologyReport(astrologyData, "Spiritualitate");
      // const spiritualitateCategory = await fetchChatResponse(userInput);
      // userData.spiritualitateCategory = spiritualitateCategory;

      if (isEditMode && route.params?.editIndex !== undefined) {
        parsedDataPersons[route.params.editIndex] = userData;
      } else {
        parsedDataPersons.push(userData);
      }

      console.log("time zone to user....", userData.tzone);

      await AsyncStorage.setItem(
        "personsDataAstrograma",
        JSON.stringify(parsedDataPersons)
      );

      setIsLoading(false);
      navigation.navigate("Learn");
    } catch (error) {
      setIsLoading(false);
      if (error instanceof Error) {
        console.error("Error saving person data:", error.message);
        console.error("Stack trace:", error.stack); // Include detalii despre linia de cod
      } else {
        console.error("Unknown error:", error);
      }
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

  return (
    <Provider>
      <Fragment>
        <MainContainer style={{ flex: 1, backgroundColor: '#fffbe6' }}>
          <SafeAreaView style={{ flex: 1 }}>
          <LinearGradient
              colors={["#fffbe6", "#f7e7ce", "#e7c585"]}
              style={{ flex: 1 }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
          >
              <View style={styles.overlay} />
            {!isLoading && (
              <View style={styles.textContainer}>
                  <Text style={styles.titleText}>{i18n.translate("informatiiCalcule")}</Text>
              </View>
            )}
            {isLoading ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Video
                  source={require('../../../../assets/analizerscreen.mp4')}
                  style={{ ...StyleSheet.absoluteFillObject, zIndex: 0 }}
                  resizeMode="cover"
                  shouldPlay
                  isLooping
                  muted
                  ignoreSilentSwitch="obey"
                />
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', zIndex: 1, paddingHorizontal: 32 }}>
                  <Text style={{ color: '#131523', fontSize: 18, fontFamily: 'LoraBold', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: 16 }}>{loadingMessage}</Text>
                </View>
              </View>
            ) : (
                <KeyboardAvoidingView
                  style={{ flex: 1 }}
                  behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                  keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
                >
                  <ScrollView
                    contentContainerStyle={[styles.inputContainer, { paddingTop: 40 }]}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
              >
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
                  calculateTimeZone={(lat, long) =>
                    calculateTimeZone(lat, long)
                  }
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
                    paddingTop: timeZoneData?.offset ? 15 : 0,
                    paddingLeft: 10,
                  }}
                >
                      <Text style={styles.labelTextContrast}>
                    {i18n.translate("Adresa")}: {place || "-"}
                      </Text>
                  {/* {timeZoneData?.offset && (
                        <Text style={styles.labelTextContrast}>
                      {timeZoneData?.data?.timeZoneName}, UTC/GMT +
                      {timeZoneData?.offset} hours
                        </Text>
                  )}
                      <Text style={styles.labelTextContrast}>
                    Long/Lat: {long || "-"}/{lat || "-"}
                      </Text> */}
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
                      <Text style={styles.labelTextContrast}>
                    {i18n.translate("IntroduDataOraNasterii")}
                      </Text>
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
                              style={styles.selectButton}
                          theme={{
                            colors: {
                                  primary: '#C9A14A',
                                  onSurface: '#C9A14A',
                            },
                          }}
                              onPress={() => setDayMenuVisible(true)}
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
                              style={styles.selectButton}
                          theme={{
                            colors: {
                                  primary: '#C9A14A',
                                  onSurface: '#C9A14A',
                            },
                          }}
                              onPress={() => setMonthMenuVisible(true)}
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
                              style={styles.selectButton}
                          theme={{
                            colors: {
                                  primary: '#C9A14A',
                                  onSurface: '#C9A14A',
                            },
                          }}
                          onPress={() => setYearMenuVisible(true)}
                        >
                          {year}
                        </Button>
                      }
                    >
                      {Array.from(
                            { length: new Date().getFullYear() - 1900 + 1 },
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
                        style={styles.selectButton}
                        color="#C9A14A"
                    theme={{
                      colors: {
                            primary: '#C9A14A',
                            onSurface: '#C9A14A',
                      },
                    }}
                        labelStyle={styles.selectButtonLabel}
                  >
                    {selectedTime || i18n.translate("SelecteazaOraNasterii")}
                  </Button>
                </View>

                    <GenderSelector setGender={setGender} gender={gender} style={styles.genderSelectorNew} />
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
                {/* <View style={{ marginTop: 5 }}>
                  <TextInput
                    label="Timezone"
                    value={timezone.toString()} // Convertim `timezone` la string
                    onChangeText={(text) => setTimezone(Number(text))} // Convertim input-ul la număr
                    keyboardType="numeric" // Asigură-te că utilizatorul poate introduce doar cifre
                    mode="outlined" // Stilul input-ului
                    style={{ backgroundColor: "#fff", borderRadius: 50 }} // Personalizare stil
                  />
                </View> */}

                <View style={styles.buttonContainer}>
                  <CommonButton
                    disabled={false}
                    funCallback={handleContinue}
                        borderWidth={0}
                        bgColor={'#C9A14A'}
                    label={i18n.translate("clinicLoginRedirect")}
                        borderColor={'#C9A14A'}
                    success={true}
                        style={styles.loginButtonNew}
                        txtColor={'#fff'}
                        txtStyle={styles.loginButtonTextNew}
                  />
                </View>
                  </ScrollView>
                </KeyboardAvoidingView>
            )}
          </LinearGradient>
          </SafeAreaView>
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
    paddingTop: 40,
    marginBottom: 18,
  },
  textText: {
    textAlign: "center",
    paddingVertical: 5,
    color: "white",
  },
  inputContainer: {
    paddingHorizontal: 20,
    opacity: 0.9,
    justifyContent: "flex-start",
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingTop: 35,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: "35%",
  },
  overlay: {
    ...StyleSheetRN.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0)',
    zIndex: 2,
    pointerEvents: 'none',
  },
  selectButton: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#C9A14A',
    borderRadius: 22,
    marginHorizontal: 4,
    marginVertical: 4,
    shadowColor: '#C9A14A',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    minWidth: 60,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectButtonLabel: {
    color: '#C9A14A',
    fontFamily: 'Lora',
    fontSize: 16,
    textAlign: 'center',
  },
  genderSelectorNew: {
    borderColor: '#C9A14A',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderRadius: 22,
    marginTop: 10,
    marginBottom: 10,
    zIndex: 3,
  },
  loginButtonNew: {
    width: '100%',
    borderRadius: 22,
    marginBottom: 10,
    backgroundColor: '#C9A14A',
    shadowColor: '#C9A14A',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 3,
  },
  loginButtonTextNew: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'LoraBold',
  },
  titleText: {
    textAlign: 'center',
    paddingVertical: 5,
    color: '#C9A14A',
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'LoraBold',
    zIndex: 3,
  },
  labelTextContrast: {
    color: '#131523',
    fontFamily: 'Lora',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
});

export default NewPersonAstrograma;

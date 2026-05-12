import React, { Fragment, useEffect, useState } from "react";
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
  ImageBackground,
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
import { mergeAnalysisWithPreservedMeta } from "../../../utils/analysisIdentityUtils";
import DayPickerModal from '../../../components/DayPickerModal';
import MonthPickerModal from '../../../components/MonthPickerModal';
import YearPickerModal from '../../../components/YearPickerModal';

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
  const [timeZoneData, setTimeZoneData] = useState({});
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

  // Add state for MapInputPatientDash focus
  const [isMapInputFocused, setIsMapInputFocused] = useState(false);

  useEffect(() => {
    console.log("selectedTime.......", selectedTime);
  }, []);

  useEffect(() => {
    if (route.params?.editMode) {
      setIsEditMode(true);

      // Încarcă datele despre persoană pentru editare
      if (route.params?.personIndex !== undefined) {
        const loadPersonData = async () => {
          const personsD = await AsyncStorage.getItem("personsData");
          let parsedDataPersons;
          try {
            parsedDataPersons = JSON.parse(personsD);
            if (!Array.isArray(parsedDataPersons)) {
              parsedDataPersons = [];
            }
          } catch (e) {
            parsedDataPersons = [];
          }

          const person = parsedDataPersons[route.params.personIndex];
          if (person) {
            setName(person.full_name || "");
            setSelectedDate(person.selectedDate || null);
            setSelectedTime(person.selectedTime || null);
            setGender(person.gender || "male");
            setRelationshipStatus(person.relationshipStatus || "");
            setNumarNorocos(person.numarNorocos || "");
            setPlace(person.place || "");
            setAdress(person.adress || "");
            setTara(person.tara || "");
            setDay(person.day || "Zi");
            setMonth(person.month || "Lună");
            setYear(person.year || "An");
            setLong(person.lon || "");
            setLat(person.lat || "");
          }
        };
        loadPersonData();
      }
    }
  }, [route.params]);

  // Funcție de validare
  const validatePersonData = (data) => {
    console.log("data to validate...", data);
    const requiredFields = [
      "full_name",
      "day",
      "month",
      "year",
      "selectedTime",
      "gender",
      "place",
      "adress",
      "lat",
      "long",
    ];

    for (let field of requiredFields) {
      if (!data[field]) {
        return false; // Returnează fals dacă un câmp este gol
      }
    }
    return true; // Returnează adevărat dacă toate câmpurile sunt completate
  };

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
    try {
      setIsLoading(true);

      // Obține datele existente
      const userD = await AsyncStorage.getItem("userData");
      const personsD = await AsyncStorage.getItem("personsData");

      // Inițializează datele dacă sunt null
      const parsedData = userD ? JSON.parse(userD) : {};
      let parsedDataPersons;
      try {
        parsedDataPersons = JSON.parse(personsD);
        if (!Array.isArray(parsedDataPersons)) {
          parsedDataPersons = [];
        }
      } catch (e) {
        parsedDataPersons = [];
      }
      const existingPersonData =
        isEditMode && route.params?.personIndex !== undefined
          ? parsedDataPersons[route.params.personIndex]
          : null;

      // Construiește datele pentru noua persoană
      const birthTime = selectedTime ? moment(selectedTime, "HH:mm") : moment();
      const timestamp = generateTimestampFromDateTime(
        `${day}-${month}-${year}`,
        selectedTime
      );
      console.log("time zone....selectedDate", `${day}-${month}-${year}`);
      console.log("time zone....selectedTime", selectedTime);
      console.log("time zone....timestamp", timestamp);
      const data = await fetchTimeZone(lat, long, timestamp);
      console.log("time zone....data", data);

      const timezoneOffset = data.offset;
      console.log("time zone....timezoneOffset", timezoneOffset);
      const zodiacSign = getZodiacSign(day, month);
      const formattedDate = new Date().toISOString().split("T")[0];
      const generateUniqueId = () =>
        "_" + Math.random().toString(36).substr(2, 9);
      const generatedId = generateUniqueId();

      // Validează dacă toate câmpurile importante sunt completate
      const isValid = validatePersonData({
        full_name: name,
        day,
        month,
        year,
        selectedTime,
        gender,
        place,
        adress,
        lat,
        long,
      });

      if (!isValid) {
        Alert.alert("Eroare", "Te rugăm să completezi toate câmpurile.");
        setIsLoading(false);
        return;
      }

      const newPersonData = mergeAnalysisWithPreservedMeta(
        {
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
          lon: long,
          tzone: timezoneOffset,
          actualLanguage: "en",
          actualLanguageAstrograma: "en",
          actualLanguageSinastrie: "en",
          zodiacSign,
          zodiacSignFristUpperCase: capitalizeFirstLetter(
            zodiacSign.toLowerCase()
          ),
          dataHoroscop: formattedDate,
          id: generatedId,
          type: "personalSinastry",
        },
        existingPersonData,
        {
          id: generatedId,
          type: "personalSinastry",
        }
      );

      // Adaugă sau actualizează datele persoanei
      let currentPersonIndex;
      if (isEditMode && route.params?.personIndex !== undefined) {
        // Actualizează persoana existentă
        currentPersonIndex = route.params.personIndex;
        parsedDataPersons[currentPersonIndex] = newPersonData;
      } else {
        // Adaugă o persoană nouă
        parsedDataPersons.push(newPersonData);
        currentPersonIndex = parsedDataPersons.length - 1;
      }

      //───────────────────────────────────────────────
      //  Recalculăm timezone-ul PERSOANEI UTILIZATOR (parsedData)
      //───────────────────────────────────────────────
      if (parsedData && parsedData.day && parsedData.month && parsedData.year) {
        try {
          const userTimestamp = generateTimestampFromDateTime(
            `${parsedData.day}-${parsedData.month}-${parsedData.year}`,
            parsedData.selectedTime || "00:00"
          );
          const userTzData = await fetchTimeZone(parsedData.lat, parsedData.lon, userTimestamp);
          if (userTzData) {
            parsedData.tzone = userTzData.offset;
          }
        } catch (err) {
          console.log("Recalculare tzone user failed", err);
        }
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

      // Efectuați analizele de sinastrie pentru persoana curentă
      const results = await Promise.all(
        Object.keys(sinastrieUrls).map((key) =>
          fetchSinastrieData(
            sinastrieUrls[key],
            parsedData.full_name,
            parsedData.day,
            parsedData.month,
            parsedData.year,
            parsedData.hour,
            parsedData.min,
            parsedData.sec,
            parsedData.gender,
            parsedData.place,
            parsedData.lat,
            parsedData.lon,
            parsedData.tzone,
            parsedDataPersons[currentPersonIndex]
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
        intenseCompatibility,
        physicalCompatibility,
        emotionalCompatibility,
        sexualCompatibility,
        spiritualCompatibility,
        financialCompatibility,
      ] = results;

      // Salvează analizele în datele sinastriei persoanei curente
      parsedDataPersons[currentPersonIndex] = mergeAnalysisWithPreservedMeta(
        {
          ...parsedDataPersons[currentPersonIndex],
          synastry: {
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
          },
          id: generatedId,
          type: "personalSinastry",
        },
        existingPersonData,
        {
          id: generatedId,
          type: "personalSinastry",
        }
      );

      // Salvează `personsData` actualizat
      await AsyncStorage.setItem(
        "personsData",
        JSON.stringify(parsedDataPersons)
      );

      console.log("Date salvate cu succes:", parsedDataPersons);

      // Navighează înapoi la ecranul principal
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

  return (
    <Provider>
      <Fragment>
        <ImageBackground source={require('../../../../assets/dashboardbg.jpg')} style={{ flex: 1 }} imageStyle={{ opacity: 1 }}>
          <SafeAreaView style={{ flex: 1 }}>
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
                  adress={adress}
                  ref={inputRef}
                  value={localitate}
                  calculateTimeZone={(lat, long) =>
                    calculateTimeZone(lat, long)
                  }
                  onFocus={() => setIsMapInputFocused(true)}
                  onBlur={() => setIsMapInputFocused(false)}
                />

                {!(Platform.OS === 'ios' && isMapInputFocused) && (
                  <>
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
                      {timeZoneData?.offset && (
                            <Text style={styles.labelTextContrast}>
                          {timeZoneData?.data?.timeZoneName}, UTC/GMT +
                          {timeZoneData?.offset} hours
                            </Text>
                      )}
                          <Text style={styles.labelTextContrast}>
                        Long/Lat: {long || "-"}/{lat || "-"}
                          </Text>
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
                        {/* Ziua */}
                            <Button
                              mode="outlined"
                                  style={styles.selectButton}
                              onPress={() => setDayMenuVisible(true)}
                              theme={{
                                colors: {
                                      primary: '#FFD700',
                                      onSurface: '#FFD700',
                                },
                              }}
                                  labelStyle={styles.selectButtonLabel}
                            >
                              {day}
                            </Button>
                        <DayPickerModal
                          visible={isDayMenuVisible}
                          onClose={() => setDayMenuVisible(false)}
                          onSelect={(value) => setDay(value)}
                          selectedDay={day}
                        />
                        {/* Luna */}
                            <Button
                              mode="outlined"
                                  style={styles.selectButton}
                              onPress={() => setMonthMenuVisible(true)}
                              theme={{
                                colors: {
                                      primary: '#FFD700',
                                      onSurface: '#FFD700',
                                },
                              }}
                                  labelStyle={styles.selectButtonLabel}
                            >
                              {month}
                            </Button>
                        <MonthPickerModal
                          visible={isMonthMenuVisible}
                          onClose={() => setMonthMenuVisible(false)}
                          onSelect={(value) => setMonth(value)}
                          selectedMonth={month}
                            />
                        {/* Anul */}
                            <Button
                              mode="outlined"
                                  style={styles.selectButton}
                          onPress={() => setYearMenuVisible(true)}
                              theme={{
                                colors: {
                                      primary: '#FFD700',
                                      onSurface: '#FFD700',
                                },
                              }}
                          labelStyle={styles.selectButtonLabel}
                            >
                              {year}
                            </Button>
                        <YearPickerModal
                          visible={isYearMenuVisible}
                          onClose={() => setYearMenuVisible(false)}
                          onSelect={(value) => setYear(value)}
                          selectedYear={year}
                              />
                      </View>
                      <Button
                        mode="outlined"
                        onPress={() => setShowTimePicker(true)}
                            style={styles.selectButton}
                            color="#FFD700"
                        theme={{
                          colors: {
                                primary: '#FFD700',
                                onSurface: '#FFD700',
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
                    <View style={styles.buttonContainer}>
                      <CommonButton
                        disabled={false}
                        funCallback={handleContinue}
                            borderWidth={0}
                            bgColor={'#FFD700'}
                        label={i18n.translate("clinicLoginRedirect")}
                            borderColor={'#FFD700'}
                        success={true}
                            style={styles.loginButtonNew}
                            txtColor={'#fff'}
                            txtStyle={styles.loginButtonTextNew}
                      />
                    </View>
                  </>
                )}
                  </ScrollView>
                </KeyboardAvoidingView>
            )}
          </SafeAreaView>
        </ImageBackground>
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
    borderColor: '#FFD700',
    borderRadius: 22,
    marginHorizontal: 4,
    marginVertical: 4,
    shadowColor: '#FFD700',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    minWidth: 60,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectButtonLabel: {
    color: '#FFD700',
    fontFamily: 'Lora',
    fontSize: 16,
    textAlign: 'center',
  },
  genderSelectorNew: {
    borderColor: '#FFD700',
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
    backgroundColor: '#FFD700',
    shadowColor: '#FFD700',
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
    color: '#FFD700',
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

export default NewPersonScreen;

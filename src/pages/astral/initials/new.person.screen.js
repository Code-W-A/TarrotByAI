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
          const parsedPersonsData = JSON.parse(personsD) || [];

          const person = parsedPersonsData[route.params.personIndex];
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
      const parsedDataPersons = personsD ? JSON.parse(personsD) : [];

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

      const newPersonData = {
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
        actualLanguage: "naan",
        actualLanguageAstrograma: "naan",
        actualLanguageSinastrie: "naan",
        zodiacSign,
        zodiacSignFristUpperCase: capitalizeFirstLetter(
          zodiacSign.toLowerCase()
        ),
        dataHoroscop: formattedDate,
      };

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
      parsedDataPersons[currentPersonIndex].synastry = {
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

      const generateUniqueId = () =>
        "_" + Math.random().toString(36).substr(2, 9);
      parsedDataPersons[currentPersonIndex].id = generateUniqueId();
      parsedDataPersons[currentPersonIndex].type = "personalSinastry";

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
              <View
                style={[
                  styles.inputContainer,
                  { height: timeZoneData?.offset ? "92%" : "88%" },
                ]}
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
                    {i18n.translate("Adresa")}: {place || "-"}
                  </H9fontMediumWhite>
                  {timeZoneData?.offset && (
                    <H9fontMediumWhite>
                      {timeZoneData?.data?.timeZoneName}, UTC/GMT +
                      {timeZoneData?.offset} hours
                    </H9fontMediumWhite>
                  )}
                  <H9fontMediumWhite>
                    Long/Lat: {long || "-"}/{lat || "-"}
                  </H9fontMediumWhite>
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
                    color="white"
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

import i18n from "i18n-js";
import React, { Fragment, useEffect, useState } from "react";
import { StyleSheet, View, Platform } from "react-native";
import { Button, Headline, Text } from "react-native-paper";
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

function NameScreen({ navigation, route }) {
  const today = moment(new Date()).format("DD-MM-YYYY");
  const [name, setName] = useState("");
  const [localitate, setLocalitate] = useState("");
  const [tara, setTara] = useState("");
  const [numarNorocos, setNumarNorocos] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [gender, setGender] = useState("");
  const [relationshipStatus, setRelationshipStatus] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [isEditMode, setIsEditMode] = useState(false);

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
            console.log("Retrieved user data:", userData);
            if (userData) {
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
      if (userData) {
        const parsedData = JSON.parse(userData);
        setName(parsedData.name);
        setSelectedDate(parsedData.birthDate);
        setGender(parsedData.gender);
        setRelationshipStatus(parsedData.relationshipStatus);
        setNumarNorocos(parsedData.numarNorocos);
        setTara(parsedData.tara)
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const handleContinue = async () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    } else {
      try {
        const userData = {
          name,
          birthDate: selectedDate,
          hourDate: selectedTime,
          gender,
          relationshipStatus,
          numarNorocos,
          localitate,
          tara,
        };
        await AsyncStorage.setItem("userData", JSON.stringify(userData));
        navigation.navigate("Learn");
      } catch (error) {
        console.error("Error saving user data:", error);
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

  return (
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
            paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
          }}
        >
          <SpaceSky />
          <Aquarius width={60} height={60} style={styles.aquarius} />
          {/* <View style={{ flex: 0.5, }} /> */}
          <View style={styles.textContainer}>
            <Headline style={styles.textHeadline}>
              {getHeadlineText(currentStep)}
            </Headline>
            <Text style={styles.textText}>
              Pentru a face calcule exacte avem nevoie de cateva informatii
            </Text>
          </View>
          <View style={[styles.inputContainer]}>
            {currentStep === 1 && (
              <InputFields
                value={name}
                onChangeText={setName}
                placeholder={"Nume"}
                image={"person"}
              />
            )}
            {currentStep === 2 && (
              <View>
                <InputFields
                  value={localitate}
                  onChangeText={setLocalitate}
                  placeholder={"Localitate"}
                  image={"person"}
                />
                <InputFields
                  value={tara}
                  onChangeText={setTara}
                  placeholder={"Tara"}
                  image={"person"}
                />
              </View>
            )}

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
                time={selectedTime || new Date()}
                selectedTime={(selectedTime) => {
                  setSelectedTime(selectedTime);
                  setShowTimePicker(false);
                }}
              />
            )}

            {currentStep === 3 && (
              <View>
                <Button
                  mode="outlined"
                  onPress={() => setShowDatePicker(true)}
                  style={styles.dateButton}
                  color="#6200ee"
                  theme={{
                    colors: {
                      primary: colors.white,
                      onSurface: "red",
                    },
                  }}
                  labelStyle={{ fontSize: 18 }}
                >
                  {selectedDate || "Selectează Data"}
                </Button>
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
                  {selectedTime || "Selectează Ora"}
                </Button>
              </View>
            )}

            {currentStep === 4 && <GenderSelector setGender={setGender} />}
            {currentStep === 5 && (
              <RelationshipScreen
                setRelationshipStatus={setRelationshipStatus}
              />
            )}
            {currentStep === 6 && (
              <InputFields
                value={numarNorocos}
                onChangeText={setNumarNorocos}
                placeholder={"Număr norocos"}
                image={"person"}
              />
            )}
            <View style={styles.buttonContainer}>
              <CommonButton
                disabled={false}
                funCallback={handleContinue}
                borderWidth={0.2}
                bgColor={colors.gradientLogin1}
                label={"Continua"}
                borderColor={colors.white}
                success={true}
                style={{ marginTop: "0%", width: "70%" }}
                txtColor={colors.white}
              />
            </View>
          </View>
        </LinearGradient>
      </MainContainer>
    </Fragment>
  );
}

const styles = StyleSheet.create({
  aquarius: {
    zIndex: 0,
    position: "absolute",
    top: 20,
    right: 20,
    opacity: 0.2,
  },

  dateButton: {
    color: colors.white,
    marginTop: "10%",
  },
  timeButton: {
    marginTop: "3%",
    color: colors.white,
  },
  textContainer: {
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingTop: "10%",

    height: "20%",
  },
  textHeadline: {
    textAlign: "center",
    textTransform: "uppercase",
    fontWeight: "bold",
    color: "white",
  },
  textText: {
    textAlign: "center",
    paddingVertical: 5,
    color: "white",
  },
  inputContainer: {
    paddingHorizontal: 20,
    opacity: 0.9,
    height: "85%",

    justifyContent: "space-between",
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingTop: 35,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: "35%",
  },
});

export default NameScreen;

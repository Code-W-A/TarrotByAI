import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../utils/colors";
import {
  H15fontMediumBlack,
  H2fontBoldPrimary,
  H6fontBoldPrimary,
  H6fontRegularWhite,
  H7fontBoldPrimary,
  H8fontMediumPrimary,
} from "../components/commonText";
import { useNavigation } from "@react-navigation/native";
import { screenName } from "../utils/screenName";
import { handleLanguagei18n } from "../utils/handleLanguageGeneral";
import i18n from "../../i18n";

const LanguageSelectScreen = () => {
  const [selectedLanguage, setSelectedLanguage] = useState(null);

  const handleLanguageSelect = (language, name) => {
    console.log("test...", language);
    setSelectedLanguage(name);
    console.log(`${name} Selected`);
    handleLanguagei18n(language);
  };

  const navigation = useNavigation();

  // Lista limbilor și a steagurilor corespunzătoare
  const languages = [
    {
      code: "ro",
      name: "Romanian",
      flag: require("../../assets/flags/romania.png"),
    },
    {
      code: "en",
      name: "English",
      flag: require("../../assets/flags/english.png"),
    },
    {
      code: "es",
      name: "Spanish",
      flag: require("../../assets/flags/spanish.png"),
    },
    {
      code: "bg",
      name: "Bulgarian",
      flag: require("../../assets/flags/bulgaria.png"),
    },
    {
      code: "cs",
      name: "Czech",
      flag: require("../../assets/flags/czech.png"),
    },
    {
      code: "de",
      name: "German",
      flag: require("../../assets/flags/germany.png"),
    },
    {
      code: "el",
      name: "Greek",
      flag: require("../../assets/flags/greece.png"),
    },
    {
      code: "fr",
      name: "French",
      flag: require("../../assets/flags/france.png"),
    },
    {
      code: "hr",
      name: "Croatian",
      flag: require("../../assets/flags/croatia.png"),
    },
    {
      code: "hi",
      name: "Hindi",
      flag: require("../../assets/flags/india.png"),
    },
    {
      code: "it",
      name: "Italian",
      flag: require("../../assets/flags/italy.png"),
    },
    {
      code: "pl",
      name: "Polish",
      flag: require("../../assets/flags/poland.png"),
    },
    {
      code: "id",
      name: "Indonesian",
      flag: require("../../assets/flags/indonesia.png"),
    },
    {
      code: "sk",
      name: "Slovak",
      flag: require("../../assets/flags/slovakia.png"),
    },
    // Adăugați aici alte limbi și steaguri, dacă este necesar
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[
          colors.gradientLogin1,
          colors.gradientLogin2,
          colors.gradientLogin2,
        ]} // Înlocuiește cu culorile gradientului tău
        style={styles.gradient}
      >
        <View style={styles.headerContainer}>
          <Image
            source={require("../../assets/Onboarding2.png")}
            style={styles.headerImage}
            resizeMode="contain"
          />
          <H6fontBoldPrimary style={styles.headerText}>
            {i18n.translate("selectLanguage")}
          </H6fontBoldPrimary>
        </View>

        <View
          style={{
            width: "100%",
            height: "40%",
            marginTop: "10%",
          }}
        >
          <ScrollView contentContainerStyle={styles.buttonContainer}>
            {languages.map((language) => (
              <LanguageButton
                key={language.code}
                language={language.name}
                flagSource={language.flag}
                onSelect={() =>
                  handleLanguageSelect(language.code, language.name)
                }
                isSelected={selectedLanguage === language.name}
              />
            ))}
          </ScrollView>
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => navigation.navigate(screenName.SignInScreenClinic)}
        >
          <H6fontRegularWhite style={styles.continueButtonText}>
            {i18n.translate("clinicLoginRedirect")}
          </H6fontRegularWhite>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

const LanguageButton = ({ language, flagSource, onSelect, isSelected }) => (
  <TouchableOpacity
    style={[styles.button, isSelected ? styles.selectedButton : null]}
    onPress={onSelect}
  >
    <H6fontBoldPrimary style={styles.buttonText}>{language}</H6fontBoldPrimary>
    <Image style={styles.image} source={flagSource} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  gradient: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  headerContainer: {
    alignItems: "center",
    width: "100%",
    height: "30%",
  },
  headerImage: {
    width: 380,
    height: 230,
  },
  headerText: {
    marginBottom: 30,
  },
  buttonContainer: {
    justifyContent: "center",
    alignItems: "flex-start",
    width: "100%",
    paddingHorizontal: 20,
    paddingVertical: "25%",
  },
  button: {
    backgroundColor: colors.primary3,
    paddingHorizontal: 10,
    marginVertical: 10,
    paddingBottom: "1%",

    width: "100%",
    minHeight: "6%",
    borderRadius: 10,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
  },
  selectedButton: {
    backgroundColor: colors.primary1,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
  },
  image: {
    width: 30,
    height: 30,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#000",
  },
  continueButton: {
    marginTop: "10%",
    backgroundColor: colors.primary3,
    padding: 20,
    width: 250,
    borderRadius: 10,
    alignItems: "center",
    height: "auto",
  },
  continueButtonText: {
    fontSize: 18,
  },
});

export default LanguageSelectScreen;

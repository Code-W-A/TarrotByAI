import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  SafeAreaView,
  Platform,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../utils/colors";
import {
  H2fontBoldPrimary,
  H6fontBoldPrimary,
  H6fontMediumWhite,
  H8fontMediumWhite,
} from "../components/commonText";
import { useNavigation } from "@react-navigation/native";
import { screenName } from "../utils/screenName";
import { handleLanguagei18n } from "../utils/handleLanguageGeneral";
import i18n from "../../i18n";
import { useNavBarVisibility } from '../context/NavbarVisibilityContext';

const gold = "#FFD700"; // auriu cald pentru accente
const cream = "white"; // fundal crem deschis
const cream2 = "#F5E9D6";

const languages = [
  { code: "ro", name: "Română", flag: require("../../assets/flags/romania.png") },
  { code: "en", name: "English", flag: require("../../assets/flags/english.png") },
  { code: "es", name: "Español", flag: require("../../assets/flags/spanish.png") },
  { code: "bg", name: "Български", flag: require("../../assets/flags/bulgaria.png") },
  { code: "cs", name: "Čeština", flag: require("../../assets/flags/czech.png") },
  { code: "de", name: "Deutsch", flag: require("../../assets/flags/germany.png") },
  { code: "el", name: "Ελληνικά", flag: require("../../assets/flags/greece.png") },
  { code: "fr", name: "Français", flag: require("../../assets/flags/france.png") },
  { code: "hr", name: "Hrvatski", flag: require("../../assets/flags/croatia.png") },
  { code: "hi", name: "हिन्दी", flag: require("../../assets/flags/india.png") },
  { code: "it", name: "Italiano", flag: require("../../assets/flags/italy.png") },
  { code: "pl", name: "Polski", flag: require("../../assets/flags/poland.png") },
  { code: "id", name: "Bahasa Indonesia", flag: require("../../assets/flags/indonesia.png") },
  { code: "sk", name: "Slovenčina", flag: require("../../assets/flags/slovakia.png") },
];

const LanguageSelectScreen = (props) => {
  const { setIsNavBarVisible } = useNavBarVisibility();
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const navigation = useNavigation();
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    setIsNavBarVisible(false);
    return () => setIsNavBarVisible(true);
  }, []);

  const handleLanguageSelect = (language, name) => {
    setSelectedLanguage(name);
    handleLanguagei18n(language);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={[cream, cream, cream]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Image
              source={require("../../assets/LogoPngTransparent.png")}
            style={styles.headerImage}
            resizeMode="contain"
          />
            <View style={styles.goldLine} />
            <Text style={styles.headerTitle}>{i18n.translate("welcomeTitle")}</Text>
            <Text style={styles.headerSubtitle}>{i18n.translate("welcomeSubtitle")}</Text>
        </View>
          <Text style={styles.sectionTitle}>{i18n.translate("selectLanguage")}</Text>
          <ScrollView
            contentContainerStyle={styles.languageList}
            style={styles.languageScroll}
            showsVerticalScrollIndicator={false}
          >
            {languages.map((lang) => {
              const isSelected = selectedLanguage === lang.name;
              return (
                <TouchableOpacity
                  key={lang.code}
                  activeOpacity={0.85}
                  style={[
                    styles.languageButton,
                    isSelected && styles.languageButtonSelected,
                    isSelected && { transform: [{ scale: 1.06 }] },
                  ]}
                  onPress={() => handleLanguageSelect(lang.code, lang.name)}
                >
                  <Image source={lang.flag} style={styles.flag} />
                  <Text style={styles.languageText}>{lang.name}</Text>
                  {isSelected && (
                    <View style={styles.checkCircle}>
                      <Image source={require("../../assets/starRatting.png")} style={styles.checkIcon} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <View style={styles.bottomContainer}>
        <TouchableOpacity
              style={[styles.continueButton, pressed && styles.continueButtonPressed]}
              onPressIn={() => setPressed(true)}
              onPressOut={() => setPressed(false)}
          onPress={() => navigation.navigate(screenName.SignInScreenClinic)}
              activeOpacity={0.85}
        >
              <Text style={styles.continueButtonText}>{i18n.translate("clinicLoginRedirect")}</Text>
        </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: cream,
  },
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: Platform.OS === "android" ? 30 : 0,
    paddingHorizontal: 0,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 10,
    width: "90%",
  },
  headerImage: {
    width: 120,
    height: 120,
    marginBottom: 10,
  },
  goldLine: {
    width: 60,
    height: 3,
    backgroundColor: gold,
    borderRadius: 2,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: gold,
    fontFamily: "LoraBold",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.primary3,
    textAlign: "center",
    fontFamily: "Lora",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    color: gold,
    fontWeight: "600",
    marginBottom: 8,
    fontFamily: "LoraBold",
    alignSelf: "center",
  },
  languageScroll: {
    flex: 1,
    width: "100%",
    marginBottom: 10,
  },
  languageList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingBottom: 20,
  },
  languageButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: gold,
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 22,
    margin: 8,
    shadowColor: gold,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
    minWidth: 130,
    minHeight: 48,
    position: "relative",
  },
  languageButtonSelected: {
    backgroundColor: cream2,
    borderColor: gold,
    shadowOpacity: 0.25,
    elevation: 6,
  },
  flag: {
    width: 32,
    height: 22,
    borderRadius: 4,
    marginRight: 12,
  },
  languageText: {
    fontSize: 16,
    color: colors.primary3,
    fontFamily: "LoraBold",
  },
  checkCircle: {
    position: "absolute",
    top: -10,
    right: -10,
    backgroundColor: gold,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: gold,
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  checkIcon: {
    width: 16,
    height: 16,
    tintColor: "#fff8e1",
  },
  bottomContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: Platform.OS === "android" ? 20 : 10,
    backgroundColor: "transparent",
  },
  continueButton: {
    backgroundColor: gold,
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 48,
    marginTop: 10,
    marginBottom: 10,
    alignSelf: "center",
    shadowColor: gold,
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 5,
    transform: [{ scale: 1 }],
  },
  continueButtonPressed: {
    backgroundColor: "#b08d2b",
    transform: [{ scale: 0.97 }],
  },
  continueButtonText: {
    color: cream,
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "LoraBold",
    letterSpacing: 0.5,
  },
});

export default LanguageSelectScreen;

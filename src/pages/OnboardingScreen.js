import React, { useEffect, useRef, useState } from "react";
import {
  SafeAreaView,
  Image,
  StyleSheet,
  FlatList,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Platform,
  Animated,
} from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { screenName } from "../utils/screenName";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "../../i18n";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../utils/colors";
import {
  H2fontBoldPrimary,
  H6fontRegularPrimary,
} from "../components/commonText";
import ConsentModal from "../components/ImageConsentModal/ImageConsentModal";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");
const gold = "#C9A14A";
const cream = "#FAF7F2";
const cream2 = "#F5E9D6";

const slides = [
  {
    id: "1",
    image: require("../../assets/onboardImg.png"),
    title: i18n.translate("onboardingIntroTitle"),
    subtitle: i18n.translate("onboardingIntroSubtitle"),
  },
  {
    id: "2",
    image: require("../../assets/Onboarding2.png"),
    title: i18n.translate("onboardingPersonalizedTitle"),
    subtitle: i18n.translate("onboardingPersonalizedSubtitle"),
  },
  {
    id: "3",
    image: require("../../assets/bg-welcome.png"),
    title: i18n.translate("onboardingAccessTitle"),
    subtitle: i18n.translate("onboardingAccessSubtitle"),
  },
];

const Slide = ({ item, isActive }) => {
  const scaleAnim = useRef(new Animated.Value(isActive ? 1 : 0.95)).current;
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isActive ? 1 : 0.95,
      useNativeDriver: true,
      friction: 7,
    }).start();
  }, [isActive]);
  return (
    <Animated.View style={[styles.slideContainer, { transform: [{ scale: scaleAnim }] }]}>  
      <Image
        source={item.image}
        style={styles.slideImageLarge}
        resizeMode="contain"
      />
      <Text style={styles.slideTitleNoCard}>{item.title}</Text>
      <View style={styles.separator} />
      <Text style={styles.slideSubtitleNoCard}>{item.subtitle}</Text>
    </Animated.View>
  );
};

const OnboardingScreen = ({ navigation }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const ref = useRef();

  const updateCurrentSlideIndex = (e) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / width);
    setCurrentSlideIndex(currentIndex);
  };

  const goToNextSlide = () => {
    const nextSlideIndex = currentSlideIndex + 1;
    if (nextSlideIndex !== slides.length) {
      const offset = nextSlideIndex * width;
      ref?.current.scrollToOffset({ offset });
      setCurrentSlideIndex(nextSlideIndex);
    }
  };

  const skip = () => {
    const lastSlideIndex = slides.length - 1;
    const offset = lastSlideIndex * width;
    ref?.current.scrollToOffset({ offset });
    setCurrentSlideIndex(lastSlideIndex);
  };

  const checkConsent = async () => {
    try {
      const hasConsented = await AsyncStorage.getItem("hasConsented");
      if (hasConsented === null) {
        setVisible(true);
      }
    } catch (error) {
      console.log("Error reading consent status", error);
    }
  };

  const hideModalAndSetConsent = async () => {
    try {
      await AsyncStorage.setItem("hasConsented", "true");
      setVisible(false);
    } catch (error) {
      console.log("Error saving consent status", error);
    }
  };

  useEffect(() => {
    checkConsent();
  }, []);

  const Footer = () => (
    <View style={styles.footerContainer}>
      <View style={styles.indicatorRow}>
        {slides.map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.indicator,
              currentSlideIndex === index && styles.indicatorActive,
              currentSlideIndex === index && { shadowColor: gold, shadowOpacity: 0.7, shadowRadius: 8, elevation: 8 },
            ]}
          />
        ))}
      </View>
      <View style={styles.footerButtons}>
        {currentSlideIndex === slides.length - 1 ? (
          <TouchableOpacity
            style={styles.continueButton}
            onPress={async () => {
              await AsyncStorage.setItem("hasSeenOnboarding", "true");
              navigation.replace(screenName.languageSelectScreen);
            }}
            activeOpacity={0.85}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={styles.continueButtonText}>{i18n.translate("clinicLoginRedirect")}</Text>
              <MaterialCommunityIcons name="arrow-right" size={22} color={cream} />
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.rowButtons}>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={skip}
              activeOpacity={0.8}
            >
              <Text style={styles.skipButtonText}>{i18n.translate("skip")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.nextButton}
              onPress={goToNextSlide}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="arrow-right" size={20} color={gold} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient
        colors={[
          '#F7E7B4', // Aurie pastel, foarte soft, sus
          '#F9EFD6CC', // Crem-auriu luminos, semi-transparent
          cream + '33', // Crem foarte deschis, aproape transparent
          '#FFFBEA00' // Complet transparent jos
        ]}
        style={styles.gradient}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      >
        {/* Modern minimalist, no overlays */}
        {visible ? (
          <ConsentModal
            hideModalAndSetConsent={hideModalAndSetConsent}
            visible={visible}
          />
        ) : (
          <>
            <FlatList
              ref={ref}
              onMomentumScrollEnd={updateCurrentSlideIndex}
              contentContainerStyle={{ height: "100%", zIndex: 1 }}
              showsHorizontalScrollIndicator={false}
              horizontal
              data={slides}
              pagingEnabled
              renderItem={({ item, index }) => (
                <Slide item={item} isActive={currentSlideIndex === index} />
              )}
              keyExtractor={(item) => item.id}
              extraData={currentSlideIndex}
            />
            <Footer />
          </>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    width: "100%",
    height: "100%",
    position: "relative",
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideContainer: {
    width,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Platform.OS === "android" ? 60 : 80,
    paddingBottom: 30,
    minHeight: height * 0.8,
  },
  slideImageLarge: {
    width: width * 0.75,
    height: 260,
    marginBottom: 18,
    opacity: 0.97,
    borderRadius: 24,
    shadowColor: gold,
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 8,
    backgroundColor: '#fffbeae0',
  },
  slideTitleNoCard: {
    color: gold,
    fontSize: 28,
    fontWeight: "700",
    fontFamily: "LoraBold",
    textAlign: "center",
    marginBottom: 4,
    letterSpacing: 1.2,
    textShadowColor: gold + '44',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  separator: {
    width: 38,
    height: 2,
    backgroundColor: gold,
    opacity: 0.22,
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: 10,
  },
  slideSubtitleNoCard: {
    color: colors.primary3,
    fontSize: 17,
    fontFamily: "Lora",
    textAlign: "center",
    marginBottom: 0,
    maxWidth: width * 0.8,
    opacity: 0.85,
    letterSpacing: 0.2,
  },
  footerContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: Platform.OS === "android" ? 24 : 10,
  },
  indicatorRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 18,
  },
  indicator: {
    height: 12,
    width: 12,
    backgroundColor: "#e0cfa2",
    marginHorizontal: 6,
    borderRadius: 6,
    opacity: 0.5,
  },
  indicatorActive: {
    backgroundColor: gold,
    opacity: 1,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: gold,
    shadowColor: gold,
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 8,
  },
  footerButtons: {
    width: "100%",
    alignItems: "center",
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
  },
  continueButtonText: {
    color: cream,
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "LoraBold",
    letterSpacing: 0.5,
  },
  rowButtons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    gap: 12,
  },
  skipButton: {
    backgroundColor: "transparent",
    borderWidth: 0,
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginRight: 12,
    shadowColor: "transparent",
    elevation: 0,
  },
  skipButtonText: {
    color: gold,
    fontSize: 16,
    fontFamily: "LoraBold",
    opacity: 0.7,
  },
  nextButton: {
    backgroundColor: "#fffbeae0",
    borderRadius: 22,
    paddingVertical: 10,
    paddingHorizontal: 18,
    shadowColor: gold,
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1.2,
    borderColor: gold + '33',
  },
  nextButtonText: {
    color: gold,
    fontSize: 16,
    fontFamily: "LoraBold",
  },
});

export default OnboardingScreen;

import React, { useEffect, useRef, useState } from "react";
import {
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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
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
import { Video } from 'expo-av';

const { width, height } = Dimensions.get("window");
const gold = "#FFD700";
const cream = "#FAF7F2";
const cream2 = "#F5E9D6";

const slides = [
  {
    id: "1",
    image: require("../../assets/clinicdashboard/Tarot.png"),
    title: i18n.translate("onboardingSlide1Title"),
    subtitle: i18n.translate("onboardingSlide1Desc"),
  },
  {
    id: "2",
    image: require("../../assets/onboardtwo.png"),
    title: i18n.translate("onboardingSlide2Title"),
    subtitle: i18n.translate("onboardingSlide2Desc"),
  },
  {
    id: "3",
    image: require("../../assets/onboardthree.png"),
    title: i18n.translate("onboardingSlide3Title"),
    subtitle: i18n.translate("onboardingSlide3Desc"),
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
    <Animated.View style={[
      styles.slideContainer,
      {
        paddingTop: height * 0.07,
        paddingBottom: height * 0.03,
        minHeight: height * 0.8,
      },
      { transform: [{ scale: scaleAnim }], position: 'relative' }
    ]}>
      <Image
        source={item.image}
        style={[
          styles.slideImage,
          {
            width: Math.min(width * 0.7, 340),
            height: Math.min(height * 0.32, 340),
            marginBottom: height * 0.03,
          },
        ]}
        resizeMode="contain"
      />
      <Text
        style={[
          styles.slideTitleNoCard,
          {
            fontSize: Math.max(24, Math.min(width * 0.07, 32)),
            marginBottom: height * 0.012,
          },
        ]}
      >
        {item.title}
      </Text>
      <Text
        style={[
          styles.slideSubtitleNoCard,
          {
            fontSize: Math.max(15, Math.min(width * 0.045, 19)),
            marginBottom: height * 0.01,
          },
        ]}
      >
        {item.subtitle}
      </Text>
    </Animated.View>
  );
};

const OnboardingScreen = ({ navigation }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const ref = useRef();
  const insets = useSafeAreaInsets();

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
    <View style={[styles.footerCurveWrapper, { paddingBottom: insets.bottom }]}>
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
      <View style={styles.footerCurveContainer}>
        <TouchableOpacity
          style={styles.footerCurveButton}
          onPress={async () => {
            if (currentSlideIndex === slides.length - 1) {
              await AsyncStorage.setItem("hasSeenOnboarding", "true");
              navigation.replace(screenName.languageSelectScreen);
            } else {
              goToNextSlide();
            }
          }}
          activeOpacity={0.85}
        >
          <Text style={styles.footerCurveText}>
            {currentSlideIndex === slides.length - 1
              ? i18n.translate("clinicLoginRedirect")
              : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      {/* Video background care acoperă întregul ecran */}
      <Video
        source={require('../../assets/onboardbg.mp4')}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
        isLooping
        shouldPlay
        isMuted
        ignoreSilentSwitch="obey"
      />
      
      {/* Content overlay fără SafeAreaView pentru a permite video să acopere totul */}
      <View style={[styles.contentOverlay, { paddingTop: insets.top }]}>
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
              contentContainerStyle={{ height: "100%" }}
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
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  contentOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
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
    paddingTop: Platform.OS === "android" ? 60 : 40,
    paddingBottom: 30,
    minHeight: height * 0.8,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  slideImage: {
    width: 270,
    height: 270,
    borderRadius: 40,
    marginBottom: 32,
    shadowColor: '#FFD700',
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
    alignSelf: 'center',
  },
  slideTitleNoCard: {
    color: 'white',
    fontSize: 28,
    fontWeight: "700",
    fontFamily: "LoraBold",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: 1.2,
    textShadowColor: 'black',
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
    color: 'white',
    fontSize: 17,
    fontFamily: "Lora",
    textAlign: "center",
    marginBottom: 0,
    maxWidth: width * 0.8,
    opacity: 0.95,
    letterSpacing: 0.2,
    textShadowColor: 'black',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  footerCurveWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  footerCurveContainer: {
    width: '100%',
    height: 100,
    backgroundColor: '#FAF7F2',
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: gold,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  footerCurveButton: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  footerCurveText: {
    color: gold,
    fontSize: 20,
    fontFamily: 'LoraBold',
    letterSpacing: 1.1,
    textAlign: 'center',
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
});

export default OnboardingScreen;

import React, { useState, useEffect, useRef } from "react";
import { View, TouchableOpacity, StyleSheet, Animated, Text } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { screenName } from "../utils/screenName";
import { colors } from "../utils/colors";
import {
  H6fontBoldPrimary,
  H7fontBoldPrimary,
  H7fontMediumPrimary,
} from "./commonText";
import { useNavigationState } from "../context/NavigationContext";
import i18n from "../../i18n";
import { useApiData } from "../context/ApiContext";
import { useNumberContext } from "../context/NumberContext";
import { FontAwesome } from "@expo/vector-icons";

const GOLD = '#C9A14A';
const CREAM = 'rgba(250,247,242,0.95)';
const GRAY = '#B0B0B0';
const TAB_ICONS = [
  { lib: Ionicons, icon: 'star', screen: screenName.ClinicDashBoard },
  { lib: Ionicons, icon: 'bookmark', screen: "Astral" },
  { lib: MaterialCommunityIcons, icon: 'cards-outline', screen: screenName.PersonalReadingDashboard },
  { lib: Ionicons, icon: 'newspaper-outline', screen: 'News' },
  { lib: Ionicons, icon: 'person', screen: 'TarrotSettings' },
];

const NavBarBottom = () => {
  const navigation = useNavigation();
  const [selected, setSelected] = useState(0);
  const { setCurrentScreen, currentScreen } = useNavigationState();
  const [firstVisit, setFirstVisit] = useState(true);
  const { currentNumber, updateNumber, setSendToHistory } = useNumberContext();

  const {
    oreNorocoase,
    numereNorocoase,
    culoriNorocoase,
    citateMotivationale,
    categoriiViitor,
    cartiViitor,
    varianteCarti,
    categoriiPersonalizate,
    cartiPersonalizate,
    loading,
    setLoading,
    error,
    fetchData,
    triggerExitAnimation,
    startExitAnimation,
    resetExitAnimation,
    shuffleCartiViitor,
    shuffledCartiViitor,
    setShuffledCartiViitor,
    shuffleCartiPersonalizate,
    shuffledCartiPersonalizate,
    setShuffledCartiPersonalizate,
  } = useApiData();

  const animatedValues = useRef<Animated.Value[]>(
    Array.from({ length: 5 }, () => new Animated.Value(0))
  ).current;
  const chevronAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    animatedValues.forEach((value, i) => {
      Animated.spring(value, {
        toValue: i === selected ? 1 : 0,
        friction: 5,
        useNativeDriver: true,
      }).start();
    });

    // Pornirea animației cu repetiții
    Animated.loop(
      Animated.sequence([
        Animated.timing(chevronAnimation, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(chevronAnimation, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      {
        iterations: 3,
      }
    ).start();

    if (
      currentScreen === "Dashboard2" ||
      currentScreen === "PersonalReadingDashboard" ||
      currentScreen === "CeSimte" ||
      currentScreen === "CarteaTa" ||
      currentScreen === "CeGandeste" ||
      currentScreen === "FutureReadingDashboard"
    ) {
      setSelected(1);
    }
  }, [selected, animatedValues, chevronAnimation, currentScreen]);

  const handlePress = (screen, index) => {
    if (loading) {
      console.log("Is loading...please wait...");
    } else {
      if (index === 1 && selected === 1) {
        if (
          shuffledCartiViitor.length === 0 &&
          shuffledCartiPersonalizate.length === 0
        ) {
          setLoading(true);
          updateNumber(1);
          setSendToHistory([]);
        }
        if (currentScreen === "PersonalReadingDashboard") {
          shuffleCartiPersonalizate();
          updateNumber(1);
          setSendToHistory([]);
        } else if (currentScreen === "CeSimte") {
          shuffleCartiPersonalizate();
          updateNumber(1);
          setSendToHistory([]);
        } else if (currentScreen === "FutureReadingDashboard") {
          shuffleCartiViitor();
          updateNumber(1);
          setSendToHistory([]);
        } else if (currentScreen === "FutureReadingDashboard") {
          shuffleCartiViitor();
          updateNumber(1);
          setSendToHistory([]);
        } else if (currentScreen === "FutureReadingDashboard") {
          shuffleCartiViitor();
          updateNumber(1);
          setSendToHistory([]);
        }
        // startExitAnimation();
        setCurrentScreen(screen);
        setFirstVisit(false); // Adăugat aici
      } else {
        updateNumber(1);
        setSendToHistory([]);
        setSelected(index);
        navigation.navigate(screen);
        setCurrentScreen(screen);
        resetExitAnimation();
        setShuffledCartiViitor([]);
        setShuffledCartiPersonalizate([]);
        setFirstVisit(true);
      }
    }
  };
  const animatedStyle = (index) => ({
    transform: [
      {
        translateY: animatedValues[index].interpolate({
          inputRange: [0, 1],
          outputRange: [0, -10],
        }),
      },
      {
        scale: animatedValues[index].interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.1],
        }),
      },
    ],
    backgroundColor: selected === index ? colors.primary3 : "transparent",
    borderRadius: 20,
    marginBottom: 10,
  });

  const chevronStyle = {
    transform: [
      {
        translateY: chevronAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -10],
        }),
      },
    ],
  };

  return (
    <>
      {selected === 2 &&
        shuffledCartiViitor.length === 0 &&
        firstVisit &&
        !loading &&
        shuffledCartiPersonalizate.length === 0 && (
          <View style={styles.shuffleTextContainer}>
            <H7fontBoldPrimary>
              {i18n.translate("touchToShuffle")}
            </H7fontBoldPrimary>
            <Animated.View style={chevronStyle}>
              <MaterialCommunityIcons
                name="chevron-down"
                size={34}
                color={colors.primary2}
              />
            </Animated.View>
          </View>
        )}
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          alignItems: 'center',
          zIndex: 20,
        }}
      >
        <View style={styles.navbarModern}>
          {TAB_ICONS.map((tab, index) => {
            const IconLib = tab.lib;
            return (
            <TouchableOpacity
                key={tab.screen + '-' + index}
                style={styles.tabButtonModern}
                onPress={() => handlePress(tab.screen, index)}
                activeOpacity={0.85}
              >
                <IconLib
                  name={tab.icon as any}
                  size={selected === index ? 36 : 28}
                  color={selected === index ? GOLD : GRAY}
                  style={selected === index ? styles.iconActiveModern : styles.iconInactiveModern}
                />
            </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  navbarModern: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 74,
    backgroundColor: CREAM,
    borderTopWidth: 2,
    borderTopColor: GOLD,
    borderRadius: 28,
    marginBottom: 16,
    shadowColor: GOLD,
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
    width: '92%',
  },
  tabButtonModern: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    minWidth: 60,
  },
  iconActiveModern: {
    marginBottom: 0,
    shadowColor: GOLD,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  iconInactiveModern: {
    marginBottom: 0,
  },
  shuffleTextContainer: {
    alignItems: "center",
    backgroundColor: "transparent",
    position: "relative",
    bottom: "12%",
  },
  shuffleText: {
    color: colors.primary2,
    fontSize: 16,
    fontWeight: "bold",
    backgroundColor: "transparent",
  },
});

export default NavBarBottom;

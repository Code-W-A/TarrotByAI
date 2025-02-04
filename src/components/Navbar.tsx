import React, { useState, useEffect, useRef } from "react";
import { View, TouchableOpacity, StyleSheet, Animated } from "react-native";
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

  const animatedValues = useRef(
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
      {selected === 1 &&
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
        style={[
          styles.navbar,
          {
            backgroundColor:
              selected === 1 || selected === 3 || selected === 0
                ? "rgba(252, 246, 198, 0.8)"
                : "transparent",
          },
        ]}
      >
        {[
          screenName.ClinicDashBoard,
          screenName.PersonalReadingDashboard,
          "TarrotSettings",
          "News", // Ensure "News" is included in your navigation options array
          "Astral",
        ].map((screen, index) => (
          <Animated.View
            key={screen}
            style={[
              selected != index && styles.iconWrapBase,
              selected === index && styles.iconWrap,
              animatedStyle(index),
            ]}
          >
            <TouchableOpacity
              onPress={() => handlePress(screen, index)}
              style={{ zIndex: 1 }}
            >
              {screen === "News" ? (
                // Condition to check if the current screen is "News" and render the newspaper-outline icon
                <Ionicons
                  name="newspaper-outline"
                  size={selected === index ? 34 : 24}
                  color={
                    selected === index ? colors.gradientLogin2 : colors.primary3
                  }
                />
              ) : screen === "Astral" ? (
                // Condition to check if the current screen is "News" and render the newspaper-outline icon
                <Ionicons
                  name="moon-sharp"
                  size={selected === index ? 34 : 24}
                  color={
                    selected === index ? colors.gradientLogin2 : colors.primary3
                  }
                />
              ) : screen === screenName.PersonalReadingDashboard ? (
                // Condition to check if the current screen is "News" and render the newspaper-outline icon
                <MaterialCommunityIcons
                  name="cards-outline"
                  size={selected === index ? 34 : 24}
                  color={
                    selected === index ? colors.gradientLogin2 : colors.primary3
                  }
                />
              ) : (
                // Existing code to render icons for other navigation options
                <Ionicons
                  name={
                    index === 0 ? "star" : index === 1 ? "bookmark" : "person"
                  }
                  size={selected === index ? 34 : 24}
                  color={
                    selected === index ? colors.gradientLogin2 : colors.primary3
                  }
                />
              )}
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  navbar: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    height: 60,
    backgroundColor: "transparent",
    position: "absolute",
    bottom: 0,
    width: "100%",
    zIndex: 1,
  },
  iconWrapBase: {
    justifyContent: "center",
    alignItems: "center",
    width: 70,
    height: 70,
    borderRadius: 35,
    zIndex: 1,
    top: "1%",
  },
  iconWrap: {
    justifyContent: "center",
    alignItems: "center",
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 10,
    zIndex: 1,
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

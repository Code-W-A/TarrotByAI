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

const GOLD = '#FFD700';
const CREAM = 'rgba(250,247,242,0.95)';
const GRAY = '#B0B0B0';
const TAB_ICONS = [
  { lib: Ionicons, icon: 'star', screen: screenName.ClinicDashBoard },
  // { lib: Ionicons, icon: 'bookmark', screen: "Astral" },
  // { lib: MaterialCommunityIcons, icon: 'cards-outline', screen: screenName.PersonalReadingDashboard },
  // { lib: Ionicons, icon: 'newspaper-outline', screen: 'News' },
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

  // Animation values for each tab
  const scaleAnims = useRef(TAB_ICONS.map(() => new Animated.Value(1))).current;
  const opacityAnims = useRef(TAB_ICONS.map(() => new Animated.Value(1))).current;
  const chevronAnimation = useRef(new Animated.Value(0)).current;

  const handlePressIn = (index) => {
    Animated.parallel([
      Animated.spring(scaleAnims[index], {
        toValue: 0.95,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnims[index], {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = (index) => {
    Animated.parallel([
      Animated.spring(scaleAnims[index], {
        toValue: selected === index ? 1.1 : 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnims[index], {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

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
        setCurrentScreen(screen);
        setFirstVisit(false);
      } else {
        updateNumber(1);
        setSendToHistory([]);
        setSelected(index);
        // Animate the new selection
        Animated.spring(scaleAnims[index], {
          toValue: 1.1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }).start();
        // Reset previous selection
        if (selected !== index) {
          Animated.spring(scaleAnims[selected], {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }).start();
        }
        navigation.navigate(screen);
        setCurrentScreen(screen);
        resetExitAnimation();
        setShuffledCartiViitor([]);
        setShuffledCartiPersonalizate([]);
        setFirstVisit(true);
      }
    }
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
            <Animated.View style={[styles.chevronStyle, {
              transform: [{
                translateY: chevronAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -10],
                }),
              }],
            }]}>
              <MaterialCommunityIcons
                name="chevron-down"
                size={34}
                color={colors.primary2}
              />
            </Animated.View>
          </View>
      )}
      <View style={styles.navbarContainer}>
        <View style={styles.navbarModern}>
          {TAB_ICONS.map((tab, index) => {
            const IconLib = tab.lib;
            return (
              <Animated.View
                key={tab.screen + '-' + index}
                style={[
                  styles.tabButtonModern,
                  {
                    transform: [{ scale: scaleAnims[index] }],
                    opacity: opacityAnims[index],
                  },
                ]}
              >
                <TouchableOpacity
                  onPress={() => handlePress(tab.screen, index)}
                  onPressIn={() => handlePressIn(index)}
                  onPressOut={() => handlePressOut(index)}
                  activeOpacity={0.85}
                  style={styles.tabButtonInner}
                >
                  <IconLib
                    name={tab.icon as any}
                    size={selected === index ? 42 : 34}
                    color={selected === index ? colors.gold : GRAY}
                    style={selected === index ? styles.iconActiveModern : styles.iconInactiveModern}
                  />
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  navbarContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    alignItems: 'center',
    zIndex: 20,
    textShadowColor: 'rgba(184,134,11,0.7)',   // #B8860B cu transparență
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,    
  },
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
    backgroundColor: 'transparent',
  },
  tabButtonInner: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  iconActiveModern: {
    marginBottom: 0,
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
  chevronStyle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default NavBarBottom;

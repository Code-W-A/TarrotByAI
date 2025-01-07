import React, { useRef, useEffect, useState } from "react";
import { FlatList, StyleSheet, View, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import LongCard from "./LongCard";
import i18n from "../../../i18n";
import { useNavigationState } from "../../context/NavigationContext";

const data = [
  {
    text: "astrology",
    screen: "Astral",
    image: require("../../../assets/dash-frame.png"),
    buttonText: "clinicLoginRedirect",
    title: "yourAstrogram",
    description1: "exploreTheNatalChartHoroscope",
    description2: "andSynastricCompatibility",
    navigationScreen: "Astral",
  },
  {
    text: "AstroBlog",
    screen: "News",
    image: require("../../../assets/dash-frame.png"),
    buttonText: "seeArticles",
    title: "yourCosmicGuide",
    description1: "discoverTheInfluences",
    description2: "ofDailyStarsWithOurArticles",
    navigationScreen: "Astral",
  },
  // Adaugă mai multe obiecte similare în acest array pentru mai multe carduri
];

const AutoScrollingFlatList = ({ interstitialAdLoaded, interstitial }) => {
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigation = useNavigation();

  const { setCurrentScreen } = useNavigationState();

  const onCardPress = async (screen) => {
    if (interstitialAdLoaded) {
      try {
        await interstitial.show();
        navigation.navigate(screen);
        setCurrentScreen(screen);
      } catch (error) {
        console.error("InterstitialAd.show() error:", error);
        navigation.navigate(screen);
        setCurrentScreen(screen);
      }
    } else {
      navigation.navigate(screen);
      setCurrentScreen(screen);
    }
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const newIndex = prevIndex === data.length - 1 ? 0 : prevIndex + 1;
        flatListRef.current.scrollToIndex({ index: newIndex, animated: true });
        return newIndex;
      });
    }, 4000); // Schimbă la fiecare 2 secunde

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, []);

  const onButtonPress = (screen) => {
    navigation.navigate(screen);
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.cardRowLong}>
            <LongCard
              text={item.text}
              screen={item.screen}
              image={item.image}
              interstitial={item.interstitial}
              interstitialAdLoaded={item.interstitialAdLoaded}
              buttonText={item.buttonText}
              title={item.title}
              description1={item.description1}
              description2={item.description2}
              navigationScreen={item.screen}
              onCardPress={onCardPress}
            />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: Dimensions.get("window").height / 4.0,
    width: Dimensions.get("window").width,
  },
  cardRowLong: {
    width: Dimensions.get("window").width / 1.1,
    height: Dimensions.get("window").height,
    marginHorizontal: 10,
  },
});

export default AutoScrollingFlatList;

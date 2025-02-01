import React, { useRef, useEffect, useState } from "react";
import { FlatList, StyleSheet, View, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import LongCard from "./LongCard";
import i18n from "../../../i18n";
import { useNavigationState } from "../../context/NavigationContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

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
    let screenToNavigate;
    console.log("onCardPress called with screen:", screen);
    if (screen === "Astral") {
      console.log("Screen is Astral, performing Firestore query...");
      const storedData = await AsyncStorage.getItem("userDetails");
      const parsedUserDetails = storedData ? JSON.parse(storedData) : null;
      console.log("parsedUserDetails.........:", parsedUserDetails);

      try {
        const phoneQuery = query(
          collection(getFirestore(), "analysisBought"),
          where("phone", "==", parsedUserDetails?.phone)
        );
        const querySnapshot = await getDocs(phoneQuery);
        console.log("Firestore querySnapshot:", querySnapshot);
        let navigateToLearn = false;

        querySnapshot.forEach((doc) => {
          const analysisData = doc.data();
          console.log("analysisData:", analysisData);
          if (analysisData.analysisData.type === "personalAstrograma") {
            navigateToLearn = true;
          }
        });

        if (navigateToLearn) {
          console.log("Navigating to Learn screen...");
          screenToNavigate = "Learn";
        } else {
          screenToNavigate = screen;
        }
      } catch (error) {
        console.error("Firestore query error:", error);
      }
    }

    if (interstitialAdLoaded) {
      console.log("Interstitial ad is loaded, showing ad...");
      try {
        await interstitial.show();
        console.log("Interstitial ad shown successfully.");
        navigation.navigate(screenToNavigate);
        setCurrentScreen(screenToNavigate);
      } catch (error) {
        console.error("InterstitialAd.show() error:", error);
        navigation.navigate(screenToNavigate);
        setCurrentScreen(screenToNavigate);
      }
    } else {
      console.log("Interstitial ad not loaded, navigating directly...");
      navigation.navigate(screenToNavigate);
      setCurrentScreen(screenToNavigate);
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

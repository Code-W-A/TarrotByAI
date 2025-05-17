import React, { Fragment, useEffect, useRef, useState } from "react";
import {
  ScrollView,
  Dimensions,
  Animated,
  StatusBar,
  Platform,
  View,
  Text,
  ImageBackground,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import FlipCard from "../../components/FlipCard/FlipCard";
import GreetingBar from "../../components/UpperGreetingBar/GreetingBar";
import CardLayout from "../../components/CardLayout/CardLayout";
import CustomSpinner from "../../components/CustomSpinner/CustomSpinner";
import { colors } from "../../utils/colors";
import { useApiData } from "../../context/ApiContext";
import { MainContainer } from "../../components/commonViews";
import i18n, { languageCode } from "../../../i18n";

import {
  H6fontRegularBlack,
  H7fontBoldPrimary,
  H8fontMediumBlack,
  H8fontMediumPrimary,
  H8fontMediumWhite,
} from "../../components/commonText";
import { useLanguage } from "../../context/LanguageContext";
import CardLayoutViitor from "../../components/CardLayout/CardLayoutViitor";

const FutureReadingDashboard = () => {
  const [cardAnimations, setCardAnimations] = useState([]);

  const [opacityAnim, setOpacityAnim] = useState(new Animated.Value(0));

  const initialAnimations = useRef(Array(9).fill(null)).current;
  const {
    oreNorocoase,
    numereNorocoase,
    culoriNorocoase,
    citateMotivationale,

    varianteCarti,
    categoriiPersonalizate,
    cartiPersonalizate,
    shuffleCartiPersonalizate,
    shuffledCartiPersonalizate,
    setShuffledCartiPersonalizate,
    loading,
    error,
    fetchData,
    triggerExitAnimation,
    startExitAnimation,
    resetExitAnimation,
    categoriiViitor,
    cartiViitor,
    shuffleCartiViitor,
    shuffledCartiViitor,
    setShuffledCartiViitor,
    setLoading,
  } = useApiData();
  const { language, changeLanguage } = useLanguage();

  const [shouldFlip, setShouldFlip] = useState(false);

  const isFirstEntry = useRef(true);

  useEffect(() => {
    if (isFirstEntry.current) {
      setLoading(true);
      shuffleCartiViitor();
      console.log("Executat doar la prima intrare în acest ecran");

      // Setează flag-ul pe false, astfel încât logica să nu se mai execute la următoarele intrări
      isFirstEntry.current = false;
    }
  }, []); // Array gol de dependențe pentru a rula doar la montare

  // Initialize card animations and animate cards on mount and categoriiViitor change
  useEffect(() => {
    if (shuffledCartiViitor.length === 0 || triggerExitAnimation) return;

    const screenWidth = Dimensions.get("window").width;
    const newAnimations = initialAnimations.map(
      () => new Animated.Value(-screenWidth)
    );
    setCardAnimations(newAnimations);

    // Sequentially animate cards into view
    newAnimations.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
        delay: index * 100,
      }).start(() => {
        if (index === newAnimations.length - 1) {
          setShouldFlip(true);
        }
      });
    });
  }, [shuffledCartiViitor, triggerExitAnimation]); // Depend on shuffledCartiViitor and triggerExitAnimation

  // Animate cards out of view
  useEffect(() => {
    if (triggerExitAnimation) {
      cardAnimations.forEach((anim, index) => {
        Animated.timing(anim, {
          toValue: -Dimensions.get("window").width,
          duration: 300,
          useNativeDriver: true,
          delay: index * 100,
        }).start(() => {
          if (index === cardAnimations.length - 1) {
            setShouldFlip(false);
            fetchData();
            // resetExitAnimation(); MODIFICAT PENTRU CA DADEA ERORI
          }
        });
      });
    }
  }, [triggerExitAnimation, cardAnimations]);

  // Reset flip state after fetching new categoriiViitor
  useEffect(() => {
    if (!loading && categoriiViitor) {
      setShouldFlip(false);
    }
  }, [categoriiViitor, loading]);

  useEffect(() => {
    if (shouldFlip) {
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [shouldFlip]);

  useEffect(() => {
    // Acest useEffect va fi activat când `triggerExitAnimation` se schimbă
    if (triggerExitAnimation) {
      // Inițiați animația de fade out
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [triggerExitAnimation, opacityAnim]); // Dependențe: triggerExitAnimation și opacityAnim

  useEffect(() => {
    console.log("Tryyy...", categoriiViitor.length);
  }, []);

  const renderFlipCard = (category, index) => {
    // Function to get the categoryName based on the language
    const getCategoryName = (category, language) => {
      if (language === "hi") {
        return category.info.hu?.nume;
      } else if (language === "id") {
        return category.info.ru?.nume;
      } else if (language === "ru") {
        return category.info.rusa?.nume;
      } else {
        return category.info[language]?.nume;
      }
    };

    if (!cardAnimations[index]) return null;

    // Asociază fiecare categorie cu o carte, repetând cărțile dacă este necesar
    const card = shuffledCartiViitor[index % shuffledCartiViitor.length];
    const animatedStyle = {
      transform: [{ translateX: cardAnimations[index] }],
    };

    return (
      <View
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <FlipCard
          item={card}
          key={index}
          style={animatedStyle}
          shouldFlip={shouldFlip}
          isFuture={true}
          categoryName={getCategoryName(category, language)}
          triggerExitAnimation={triggerExitAnimation}
          varianteCarti={varianteCarti}
          conditieCategorie={category.info.ro.nume}
          number={index}
        />
        {shouldFlip && (
          <Text
            style={{
              marginTop: 10,
              textAlign: 'center',
              color: '#fff',
              fontFamily: 'Lora',
              fontSize: 16,
              textShadowColor: '#00000055',
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 2,
            }}
          >
              {getCategoryName(category, language)}
          </Text>
        )}
      </View>
    );
  };

  return (
    <Fragment>
      <MainContainer secondary={false} style={{ flex: 1 }}>
        <ImageBackground
          source={require("../../../assets/dashboardbg.jpg")}
          style={{ flex: 1, paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 }}
          imageStyle={{ opacity: 1 }}
        >
          {/* <GreetingBar isGoBack={true} /> */}
          {loading ? (
            <CustomSpinner size={74} color={colors.primary3} />
          ) : (
            <ScrollView
              contentContainerStyle={{
                paddingBottom: 20,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "transparent",
                minHeight: Dimensions.get("window").height,
              }}
            >
              <CardLayoutViitor
                shuffledCartiViitor={shuffledCartiViitor}
                title={i18n.translate("futureReading")}
              >
                {categoriiViitor &&
                  categoriiViitor.map((category, index) =>
                    renderFlipCard(category, index)
                  )}
              </CardLayoutViitor>
            </ScrollView>
          )}
        </ImageBackground>
      </MainContainer>
    </Fragment>
  );
};

export default FutureReadingDashboard;

import React, { Fragment, useEffect, useRef, useState } from "react";
import {
  ScrollView,
  Dimensions,
  Animated,
  StatusBar,
  Platform,
  View,
  Image,
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
import CardLayoutViitor from "../../components/CardLayout/CardLayoutViitor";
import {
  H6fontRegularBlack,
  H7fontBoldPrimary,
  H8fontMediumBlack,
  H8fontMediumPrimary,
  H8fontMediumWhite,
} from "../../components/commonText";
import { useLanguage } from "../../context/LanguageContext";
import { authentication } from "../../../firebase";
import { useNumberContext } from "../../context/NumberContext";


const PersonalReadingDashboard = ({ route }) => {
  const isFirstEntry = useRef(true);

  const [cardAnimations, setCardAnimations] = useState([]);

  const [renderedCards, setRenderedCards] = useState([]);

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
  const { currentNumber, updateNumber } = useNumberContext();

  useEffect(() => {
    

    if (isFirstEntry.current) {
      setLoading(true);
      shuffleCartiPersonalizate();
      console.log("Executat doar la prima intrare în acest ecran");

      // Setează flag-ul pe false, astfel încât logica să nu se mai execute la următoarele intrări
      isFirstEntry.current = false;
    }
  }, []); // Array gol de dependențe pentru a rula doar la montare

  // Initialize card animations and animate cards on mount and categoriiPersonalizate change
  useEffect(() => {
    console.log("TEst...", shuffledCartiPersonalizate.length);
    if (shuffledCartiPersonalizate.length === 0 || triggerExitAnimation) return;

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
  }, [shuffledCartiPersonalizate, triggerExitAnimation]); // Depend on shuffledCartiPersonalizate and triggerExitAnimation

  useEffect(() => {
    console.log("language...", language);
  }, [language]);

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
            // shuffleCartiPersonalizate();
            // resetExitAnimation(); COMENTAT PENTRU CA AVEA ERORI
            setShouldFlip(false); // Resetați aici
          }
        });
      });
    }
  }, [triggerExitAnimation, cardAnimations]);

  // Reset flip state after fetching new categoriiPersonalizate
  useEffect(() => {
    if (!loading && categoriiPersonalizate) {
      setShouldFlip(false);
    }
  }, [categoriiPersonalizate, loading]);

  useEffect(() => {
    if (shouldFlip) {
      // Inițiați animația de fade in
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else {
      // Inițiați animația de fade out
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
    console.log("Tryyy...", categoriiPersonalizate.length);
  }, []);

  const renderFlipCard = (category, index) => {
    // Function to get the categoryName based on the language
    const getCategoryName = (category, language) => {
      if (language === "hi") {
        return category.info.hu?.nume;
      } else if (language === "id") {
        return category.info.ru?.nume;
      } else {
        return category.info[language]?.nume;
      }
    };

    if (!cardAnimations[index]) return null;

    // Asociază fiecare categorie cu o carte, repetând cărțile dacă este necesar
    const card =
      shuffledCartiPersonalizate[index % shuffledCartiPersonalizate.length];
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
          isFuture={false}
          categoryName={getCategoryName(category, language)}
          triggerExitAnimation={triggerExitAnimation}
          varianteCarti={varianteCarti}
          conditieCategorie={category.info.ro.nume}
          number={index}
          currentNumber={currentNumber}
        />

        {shouldFlip && (
          <Animated.View
            style={{
              opacity: opacityAnim, // Aplică animația de opacitate
              backgroundColor: colors.primary3,
              borderRadius: 5,
              display: "flex",
              width: "auto",
              alignItems: "center",
              marginTop: 10,
              padding: 5,
            }}
          >
            <H8fontMediumWhite>
              {getCategoryName(category, language)}
            </H8fontMediumWhite>
          </Animated.View>
        )}
      </View>
    );
  };

  return (
    <Fragment>
      <MainContainer>
        <LinearGradient
          colors={[
            colors.gradientLogin1,
            colors.gradientLogin2,
            colors.gradientLogin2,
          ]} // Înlocuiește cu culorile gradientului tău
          style={{
            flex: 1,
            paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
          }}
        >
          <Image
            source={require("../../../assets/bg-inner.png")}
            style={{
              position: "absolute",
              width: "100%",
              height: 200,
              top: 0, // Ajustează dacă este necesar
            }}
          />
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
              <CardLayout
                shuffledCartiPersonalizate={shuffledCartiPersonalizate}
                title={i18n.translate("personalReading")}
              >
                {categoriiPersonalizate &&
                  categoriiPersonalizate.map((category, index) =>
                    renderFlipCard(category, index)
                  )}
              </CardLayout>
            </ScrollView>
          )}
        </LinearGradient>
      </MainContainer>
    </Fragment>
  );
};

export default PersonalReadingDashboard;

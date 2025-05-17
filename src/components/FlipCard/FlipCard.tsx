import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  TouchableWithoutFeedback,
  Dimensions,
  ImageBackground,
  Text,
  StyleSheet,
  View,
} from "react-native";
import i18n from "../../../i18n";
import { useFocusEffect, useNavigation } from "@react-navigation/native"; // Importă hook-ul pentru navigare
import { screenName } from "../../utils/screenName";
import { useLanguage } from "../../context/LanguageContext";
import { colors } from "../../utils/colors";
import { Image } from "react-native";
import { normalizeString } from "../../utils/stringUtils";
import { useNumberContext } from "../../context/NumberContext";
import {
  handleQueryFirestore,
  handleQueryFirestoreVarianteCarti,
  handleUploadFirestoreSubcollection,
} from "../../utils/firestoreUtils";
import { authentication } from "../../../firebase";

//---ADS---
import {
  InterstitialAd,
  AdEventType,
  TestIds,
} from "react-native-google-mobile-ads";

// Înlocuiți cu ID-ul real al unității de anunțuri pentru producție
const adUnitId = __DEV__
  ? TestIds.INTERSTITIAL
  : "ca-app-pub-9577714849380446/7080054250";
const interstitialAd = InterstitialAd.createForAdRequest(adUnitId);

const FlipCard = ({
  item,
  style,
  shouldFlip,
  isFuture,
  categoryName,
  triggerExitAnimation,
  varianteCarti,
  conditieCategorie,
  number,
}) => {
  const flipAnim = useRef(new Animated.Value(0)).current;

  const [opacityAnim, setOpacityAnim] = useState(new Animated.Value(0));
  const navigation = useNavigation(); // Obține obiectul de navigare
  const { language, changeLanguage } = useLanguage();
  const { currentNumber, updateNumber, sendToHistory, setSendToHistory } =
    useNumberContext();

  const [interstitialLoaded, setInterstitialLoaded] = useState(false);

  //---ADS---
  useEffect(() => {
    // Ascultător pentru evenimentul de încărcare a interstitialului
    const loadListener = interstitialAd.addAdEventListener(
      AdEventType.LOADED,
      () => {
        setInterstitialLoaded(true);
      }
    );

    // Ascultător pentru evenimentul de închidere a interstitialului
    const closeListener = interstitialAd.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        // Navigația se face după închiderea interstitialului
        // if (isFuture) {
        //   navigation.navigate(screenName.FutureReading, {
        //     item,
        //   });
        // }
        // Reîncărcați interstitialul pentru utilizări ulterioare
        setInterstitialLoaded(false);
        interstitialAd.load();
      }
    );

    const errorListener = interstitialAd.addAdEventListener(
      AdEventType.ERROR,
      (error) => {
        console.error(error);
      }
    );

    // Încărcați interstitialul
    interstitialAd.load();

    return () => {
      // Curățare la demontare
      loadListener();
      closeListener();
      errorListener();
    };
  }, []);

  // Funcție pentru a naviga către ecranul PersonalizedReading cu parametrul item
  const navigateToPersonalizedReading = async (isManualNav?) => {
    try {
      // console.log(item.image.finalUri);

      if (isFuture && interstitialLoaded) {
        //---ADS---
        await interstitialAd.show().then(() => {
          navigation.navigate(screenName.FutureReading, {
            item,
          });
        });
      } else {
        console.log("here...");
        if (isManualNav) {
          //---ADS---
          await interstitialAd.show().then(async () => {
            const cardNameNormalized = normalizeString(item.info.ro.nume);
            const categoryNameNormalized = normalizeString(conditieCategorie);
            const filteredVariante = await handleQueryFirestoreVarianteCarti(
              "VarianteCarti",
              cardNameNormalized,
              categoryNameNormalized
            );
            // Verificare dacă există elemente în array-ul filtrat
            if (filteredVariante.length > 0) {
              // Selectare aleatorie a unui element
              const randomIndex = Math.floor(
                Math.random() * filteredVariante.length
              );
              const selectedCard = filteredVariante[randomIndex];
              // ---- START HISTORY ----
              if (currentNumber !== 0) {
                console.log("sendToHistory...currentnr < 8", sendToHistory);
                let arr = [...sendToHistory];
                arr.push(selectedCard);
                setSendToHistory([...arr]);
              } else if (currentNumber === 0) {
                console.log("sendToHistory...currentnr === 8", sendToHistory);
                let arr = [...sendToHistory];
                arr.push(selectedCard);
                const auth = authentication;
                if (auth.currentUser) {
                  console.log("Is user...saving personal reading...");
                  const userLocation = `Users/${
                    auth.currentUser ? auth.currentUser.uid : ""
                  }/PersonalReading`;
                  if (arr.length > 0) {
                    handleUploadFirestoreSubcollection(arr, userLocation);
                  }
                }
                updateNumber(8);
                setSendToHistory([]);
              }
              // Navigație cu cartea selectată
              navigation.navigate("PersonalizedReading", {
                item: selectedCard,
              });
            } else {
              console.log(
                "Nicio carte nu a fost găsită pentru criteriile specificate."
              );
            }
          });
        } else {
          const cardNameNormalized = normalizeString(item.info.ro.nume);
          const categoryNameNormalized = normalizeString(conditieCategorie);

          const filteredVariante = await handleQueryFirestoreVarianteCarti(
            "VarianteCarti",
            cardNameNormalized,
            categoryNameNormalized
          );
          // Verificare dacă există elemente în array-ul filtrat
          if (filteredVariante.length > 0) {
            // Selectare aleatorie a unui element
            const randomIndex = Math.floor(
              Math.random() * filteredVariante.length
            );
            const selectedCard = filteredVariante[randomIndex];

            // ---- START HISTORY ----
            if (currentNumber !== 0) {
              console.log("sendToHistory...currentnr < 8", sendToHistory);
              let arr = [...sendToHistory];
              arr.push(selectedCard);
              setSendToHistory([...arr]);
            } else if (currentNumber === 0) {
              console.log("sendToHistory...currentnr === 8", sendToHistory);
              let arr = [...sendToHistory];
              arr.push(selectedCard);
              const auth = authentication;
              if (auth.currentUser) {
                console.log("Is user...saving personal reading...");
                const userLocation = `Users/${
                  auth.currentUser ? auth.currentUser.uid : ""
                }/PersonalReading`;
                if (arr.length > 0) {
                  handleUploadFirestoreSubcollection(arr, userLocation);
                }
              }
              updateNumber(8);
              setSendToHistory([]);
            }

            // Navigație cu cartea selectată
            navigation.navigate("PersonalizedReading", { item: selectedCard });
          } else {
            console.log(
              "Nicio carte nu a fost găsită pentru criteriile specificate."
            );
          }
        }
      }
    } catch (err) {
      console.log("Error at navigateToPersonalizedReading...", err);
    }
  };

  const flipCard = () => {
    Animated.spring(flipAnim, {
      toValue: 180,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
  };

  // useFocusEffect(
  //   React.useCallback(() => {
  //     console.log("focus on filp card...");
  //     if (number === currentNumber) {
  //       console.log("is equal to current number", currentNumber);
  //       console.log("number", number);
  //     }
  //     return () => {
  //       console.log("Unfocus on filp card...");
  //     };
  //   }, [])
  // );

  useFocusEffect(
    React.useCallback(() => {
      console.log("currentNumber in FlipCard:", currentNumber);
      if (number === currentNumber && number !== 1 && currentNumber !== 1) {
        console.log("is equal to current number.........", currentNumber);
        console.log("number", number);
        // if (number === 8) {
        //   updateNumber(1);
        // }

        navigateToPersonalizedReading();
      }
    }, [currentNumber])
  );

  useEffect(() => {
    if (shouldFlip) {
      flipCard();
    } else {
      flipAnim.setValue(0);
    }
  }, [shouldFlip]);

  useEffect(() => {
    if (shouldFlip) {
      // Inițiați animația de fade in
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start(() =>
        setTimeout(() => {
          if (number === 1 && currentNumber !== 8) {
            navigateToPersonalizedReading();
          }
        }, 500)
      );
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

  const frontAnimatedStyle = {
    transform: [
      {
        rotateY: flipAnim.interpolate({
          inputRange: [0, 180],
          outputRange: ["0deg", "180deg"],
        }),
      },
    ],
  };

  const backAnimatedStyle = {
    transform: [
      {
        rotateY: flipAnim.interpolate({
          inputRange: [0, 180],
          outputRange: ["180deg", "360deg"],
        }),
      },
    ],
  };

  return (
    <>
      <TouchableWithoutFeedback onPress={flipCard}>
        <Animated.View style={[styles.container, style]}>
          <Animated.View style={[styles.flipCard, frontAnimatedStyle]}>
            <ImageBackground
              source={require("../../../assets/card-back.png")}
              style={[styles.cardImage]}
              resizeMode="cover"
            />
          </Animated.View>

          <TouchableWithoutFeedback
            onPress={() => navigateToPersonalizedReading(true)}
          >
            {/* Zonele de atingere pentru a naviga la PersonalizedReading */}
            <Animated.View
              style={[styles.flipCard, backAnimatedStyle, styles.flipCardBack]}
            >
              <ImageBackground
                source={
                  item ? { uri: item.image ? item.image.finalUri : "" } : null
                }
                style={styles.fullCardImage}
                resizeMode="stretch" // Folosiți "stretch" pentru a întinde imaginea
              />
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </>
  );
};

const styles = StyleSheet.create({
  fullCardImage: {
    height: "100%", // Asigurați-vă că înălțimea și lățimea sunt setate la 100%
    width: "100%",
  },
  backgroundImage: {
    position: "relative", // Asigură-te că este absolut pentru a se extinde în exteriorul View-ului părinte
    top: 0, // Ajustează aceste valori pentru a poziționa cum dorești
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%", // Ajustează aceste valori în funcție de cât de mare dorești să fie imaginea de fundal
    height: "100%",
  },
  shadowImage: {
    position: "absolute",
    top: -180, // Ajustează aceste valori pentru a extinde imaginea în afara limitelor
    left: -195,
    width: Dimensions.get("window").width / 2.55 + 350, // Lățimea și înălțimea sunt mărite
    height: Dimensions.get("window").width / 3.8 + 350,
    zIndex: -1, // Asigură-te că imaginea este în spatele elementului Animated.View
  },

  container: {
    height: Dimensions.get("window").width / 2.55,
    width: Dimensions.get("window").width / 3.8,
    borderRadius: 5,
    overflow: "hidden",
    elevation: 4,
    marginRight: 10,
    marginBottom: 10,
  },
  buttonStyle: {
    height: "100%",
    width: Dimensions.get("window").width / 2.25,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    position: "absolute",
  },
  cardImage: {
    height: "100%",
    width: "100%", // Asigurați-vă că acesta este 100% pentru a acoperi întreaga suprafață a cartonașului
    justifyContent: "center",
    alignItems: "center",
  },
  flipCard: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backfaceVisibility: "hidden",
  },
  flipCardBack: {
    position: "absolute",
    top: 0,
  },
  textStyle: {
    width: "70%",
    textAlign: "center",
    color: "white",
  },
  // Other necessary styles
});

export default FlipCard;

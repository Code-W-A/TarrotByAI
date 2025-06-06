import React from "react";
import {
  TouchableWithoutFeedback,
  ImageBackground,
  Text,
  StyleSheet,
  View,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { colors } from "../../utils/colors";
import { useNavigationState } from "../../context/NavigationContext";
import {
  H7fontBoldPrimary,
  H8fontBoldPrimary,
  H8fontBoldYellow,
} from "../commonText";

// Adaugă 'text', 'screen', și 'image' ca props-uri ale componentei Card
const Card = ({ text, screen, image, interstitialAdLoaded, interstitial }) => {
  const navigation = useNavigation(); // folosește useNavigation pentru a naviga la screen-ul specific când card-ul este apăsat
  const { setCurrentScreen } = useNavigationState();

  const onCardPress = async () => {
    // ADS REMOVED - Direct navigation always
    // if (interstitialAdLoaded) {
    //   try {
    //     await interstitial.show();
    //     navigation.navigate(screen);
    //     setCurrentScreen(screen);
    //   } catch (error) {
    //     console.error("InterstitialAd.show() error:", error);
    //     navigation.navigate(screen);
    //     setCurrentScreen(screen);
    //   }
    // } else {
      navigation.navigate(screen);
      setCurrentScreen(screen);
    // }
  };

  return (
    <TouchableWithoutFeedback onPress={onCardPress}>
      <View style={styles.container}>
        <View style={styles.flipCard}>
          <ImageBackground
            source={image} // Utilizează prop-ul 'image' pentru a seta sursa
            style={styles.buttonStyle}
          >
            <View
              style={{
                width: "70%",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <H8fontBoldYellow style={styles.textStyle}>
                {text}
              </H8fontBoldYellow>
            </View>
          </ImageBackground>
        </View>
        {/* Se poate adăuga conținutul pentru partea din spate a cardului aici, dacă este necesar */}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    height: Dimensions.get("window").width / 3,
    width: Dimensions.get("window").width / 2.5,
    // borderRadius: 5,
    overflow: "hidden",
    // borderColor: colors.primary2,
    // borderWidth: 3,
    elevation: 4,
    margin: 13,
  },
  buttonStyle: {
    height: "100%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    position: "absolute",
  },
  flipCard: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    // Se poate seta backfaceVisibility la "hidden" dacă este necesar
  },
  flipCardBack: {
    // Stiluri pentru partea din spate a cardului, dacă este utilizată
  },
  textStyle: {
    textAlign: "center",
    width: "70%", // Ajustează lățimea după necesități
    paddingHorizontal: 5,
    color: colors.gradientLogin2,
    overflow: "hidden", // Ascunde textul care depășește lățimea
    textOverflow: "ellipsis", // Adaugă "..." la finalul textului dacă e prea lung (doar pentru web)
    flexShrink: 1, // Permite textului să se micșoreze pentru a încăpea în container
  },

  // Alte stiluri necesare
});

export default Card;

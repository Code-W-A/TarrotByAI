import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Platform,
  StatusBar,
  Dimensions,
  ImageBackground,
  ScrollView, // <-- Import ScrollView
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MainContainer } from "../../components/commonViews";
import GreetingBar from "../../components/UpperGreetingBar/GreetingBar";
import { colors } from "../../utils/colors";
import { TouchableWithoutFeedback } from "react-native";
import { Video } from "expo-av";

import {
  H6fontBoldPrimary,
  H7fontBoldPrimary,
  H7fontBoldWhite,
  H7fontMediumPrimary,
  H8fontMediumPrimary,
  H8fontMediumWhite,
} from "../../components/commonText";
import { useNavBarVisibility } from "../../context/NavbarVisibilityContext";
import { useLanguage } from "../../context/LanguageContext";

const FutureReading = ({ route }) => {
  const { language, changeLanguage } = useLanguage();
  const { item } = route.params;

  const onPressHandler = () => {
    console.log("Pressed");
  };

  const { setIsNavBarVisible } = useNavBarVisibility();

  React.useEffect(() => {
    setIsNavBarVisible(false);
    return () => setIsNavBarVisible(true); // Restabilește vizibilitatea la ieșirea din componentă
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <MainContainer>
        <LinearGradient
          colors={[
            colors.gradientLogin1,
            colors.gradientLogin2,
            colors.gradientLogin2,
          ]}
          style={styles.gradient}
        >
          <ImageBackground
            source={require("../../../assets/shadowBg.png")}
            resizeMode="cover"
            style={{
              flex: 1,
              width: null,
              height: null,
            }}
          >
            <GreetingBar isGoBack={true} />

            <View style={styles.overlay}>
              <View style={styles.imageContainer}>
                <Image
                  style={styles.image}
                  source={{ uri: item.image.finalUri }}
                />
              </View>

              <View
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "auto", // rămâne la fel
                }}
              >
                <H6fontBoldPrimary
                  style={{ alignSelf: "center", marginBottom: 10 }}
                >
                  {language === "hi"
                    ? item.info.hu?.nume
                    : language === "id"
                    ? item.info.ru?.nume
                    : language === "ru"
                    ? item.info.rusa?.nume
                    : item.info[language]?.nume}
                </H6fontBoldPrimary>

                {/** Aici folosim ScrollView cu o înălțime maximă pentru a permite scroll */}
                <ScrollView
                  style={{
                    maxHeight: 400,
                    paddingBottom: "50%",
                    marginTop: "5%",
                  }}
                >
                  <H7fontMediumPrimary style={{ textAlign: "center" }}>
                    {language === "hi"
                      ? item.info.hu?.descriere
                      : language === "id"
                      ? item.info.ru?.descriere
                      : language === "ru"
                      ? item.info.rusa?.descriere
                      : item.info[language]?.descriere}

                    {/** Continuă textul lung aici */}
                  </H7fontMediumPrimary>
                </ScrollView>
              </View>
            </View>
          </ImageBackground>
        </LinearGradient>
      </MainContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  imageContainerShadow: {
    position: "absolute",
    top: "-10%",
    left: "00%",
    transform: [{ translateX: -50 }, { translateY: -50 }],
    opacity: 0.3,
    zIndex: 1,
  },
  imageContainer: {
    alignSelf: "center",
    marginBottom: 20,
    width: "auto",
    height: "auto",
  },
  imageShadow: {
    width: 541,
    height: 1000,
    resizeMode: "contain",
    borderWidth: 3,
    zIndex: 1,
  },
  image: {
    width: 141,
    height: 200,
    resizeMode: "contain",
    borderWidth: 3,
  },
  secondImageContainer: {
    alignSelf: "center",
    position: "relative",
    height: "auto",
    width: "auto",
  },
  secondImage: {
    width: 350,
    height: 250,
  },
  gradient: {
    flex: 1,
    width: "100%",
    height: "100%",
    paddingBottom: 100,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    backgroundColor: "transparent",
    borderRadius: 10,
    padding: 20,
  },
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  colorName: {
    color: "white",
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 10,
  },
  description: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
  },
});

export default FutureReading;

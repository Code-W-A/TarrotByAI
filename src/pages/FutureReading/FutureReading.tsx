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
import ShareScreenshot from '../../components/common/ShareScreenshot';

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

  const { setIsNavBarVisible } = useNavBarVisibility();

  React.useEffect(() => {
    setIsNavBarVisible();
    return () => setIsNavBarVisible(); // Restabilește vizibilitatea la ieșirea din componentă
  }, []);

  // Funcții pentru titlu și descriere, ca în PersonalizedReading
  const getName = () => {
    if (language === "hi") return item.info.hu?.nume;
    if (language === "id") return item.info.ru?.nume;
    if (language === "ru") return item.info.rusa?.nume;
    return item.info[language]?.nume;
  };
  const getDescription = () => {
    if (language === "hi") return item.info.hu?.descriere;
    if (language === "id") return item.info.ru?.descriere;
    if (language === "ru") return item.info.rusa?.descriere;
    return item.info[language]?.descriere;
  };

  return (
    <ShareScreenshot fabPosition={{ bottom: 24, right: 24 }}>
      <MainContainer secondary={false} style={{ flex: 1 }}>
        <ImageBackground
          source={require("../../../assets/dashboardbg.jpg")}
          style={{ flex: 1, paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 }}
          imageStyle={{ opacity: 1 }}
        >
          <GreetingBar isGoBack={true} isPersonalGoBack={true} />
          <View style={styles.imageContainer}>
            <Image
              style={{
                width: 141,
                height: 200,
                resizeMode: 'stretch',
                borderWidth: 2,
                borderColor: '#FFD700',
                borderRadius: 12,
                shadowColor: '#FFD700',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.13,
                shadowRadius: 8,
              }}
              source={{ uri: item.image.finalUri }}
            />
            <Text
              style={{
                color: '#FFD700',
                fontWeight: '700',
                fontSize: 16,
                textAlign: 'center',
                textShadowColor: '#fffbeae0',
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 6,
                letterSpacing: 1.1,
                fontFamily: 'LoraBold',
                marginTop: 6,
                position:"relative",
                bottom:"-8%"
              }}
            >
              @CristinaZurba.App
            </Text>
          </View>
          <ScrollView contentContainerStyle={styles.scrollViewContainer}>
            <View
              style={{
                display: "flex",
                justifyContent: "space-around",
                height: "auto",
                paddingHorizontal: "5%",
              }}
            >
              <Text
                style={{
                  alignSelf: "center",
                  marginBottom: "5%",
                  color: '#FFD700',
                  fontFamily: 'LoraBold',
                  fontSize: 22,
                  letterSpacing: 1.1,
                  textShadowColor: '#fffbeae0',
                  textShadowOffset: { width: 0, height: 2 },
                  textShadowRadius: 6,
                }}
              >
                {getName()}
              </Text>
              <Text
                style={{
                  textAlign: 'justify',
                  color: '#7c6f57',
                  fontFamily: 'LoraRegular',
                  fontSize: 22,
                  letterSpacing: 0.2,
                }}
              >
                {getDescription()}
              </Text>
            </View>
          </ScrollView>
        </ImageBackground>
      </MainContainer>
    </ShareScreenshot>
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
    alignItems: "center",
    marginBottom: 8,
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
  scrollViewContainer: {
    padding: 20,
  },
});

export default FutureReading;

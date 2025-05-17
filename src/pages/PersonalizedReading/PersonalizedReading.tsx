import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Platform,
  StatusBar,
  Dimensions,
  ImageBackground,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MainContainer } from "../../components/commonViews";
import GreetingBar from "../../components/UpperGreetingBar/GreetingBar";
import { colors } from "../../utils/colors";
import { TouchableWithoutFeedback } from "react-native";
import { Video } from "expo-av";

import {
  H15fontMediumWhite,
  H6fontBoldPrimary,
  H6fontMediumWhite,
  H7fontBoldPrimary,
  H7fontBoldWhite,
  H7fontMediumPrimary,
  H8fontMediumPrimary,
  H8fontMediumWhite,
} from "../../components/commonText";
import { useNavBarVisibility } from "../../context/NavbarVisibilityContext";
import { useLanguage } from "../../context/LanguageContext";
import { ScrollView } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { screenName } from "../../utils/screenName";
import { useApiData } from "../../context/ApiContext";
import { useNumberContext } from "../../context/NumberContext";
import { Button } from "../../components/commonButton";
import {
  gTranslateFallbackFetch,
  gTranslateFetch,
} from "../../utils/AstralUtils/fetchGPTData";

const PersonalizedReading = ({ route }) => {
  const [isVideoLoading, setIsVideoLoading] = useState(!!videoUrl);

  const [videoEnded, setVideoEnded] = useState(false);
  const navigation = useNavigation();
  const { currentNumber, updateNumber } = useNumberContext();

  const { language, changeLanguage } = useLanguage();
  const { item } = route.params;
  const onPressHandler = () => {
    console.log("Pressed");
  };

  const [translatedName, setTranslatedName] = useState(null);
  const [translatedDescription, setTranslatedDescription] = useState(null);

  // Traducerea numelui și descrierii
  useEffect(() => {
    const translateContent = async () => {
      try {
        // Traducere pentru nume
        if (
          !(
            (language === "hi" && item.carte.info.hu?.nume) ||
            (language === "id" && item.carte.info.ru?.nume) ||
            (language === "ru" && item.carte.info.rusa?.nume) ||
            (item.carte.info[language]?.nume && language !== "ru")
          ) &&
          item.carte.info.en?.nume
        ) {
          const nameTranslation = await gTranslateFetch(
            item.carte.info.en.nume,
            language
          );
          setTranslatedName(nameTranslation);
        }

        // Traducere pentru descriere
        if (
          !(
            (language === "hi" && item.info.hu?.descriere) ||
            (language === "id" && item.info.ru?.descriere) ||
            (language === "ru" && item.info.rusa?.descriere) ||
            (item.info[language]?.descriere && language !== "ru")
          ) &&
          item.info.en?.descriere
        ) {
          const descriptionTranslation = await gTranslateFetch(
            item.info.en.descriere,
            language
          );
          setTranslatedDescription(descriptionTranslation);
        }
      } catch (error) {
        console.error("Eroare la traducere:", error);
      }
    };

    translateContent();
  }, [item, language]);

  const getName = () =>
    language === "hi" && item.carte.info.hu?.nume
      ? item.carte.info.hu.nume
      : language === "id" && item.carte.info.ru?.nume
      ? item.carte.info.ru.nume
      : language === "ru" && item.carte.info.rusa?.nume
      ? item.carte.info.rusa.nume
      : item.carte.info[language]?.nume && language !== "ru"
      ? item.carte.info[language].nume
      : translatedName || item.carte.info.en?.nume || "Necunoscut";

  const getDescription = () =>
    language === "hi" && item.info.hu?.descriere
      ? item.info.hu.descriere
      : language === "id" && item.info.ru?.descriere
      ? item.info.ru.descriere
      : language === "ru" && item.info.rusa?.descriere
      ? item.info.rusa.descriere
      : item.info[language]?.descriere && language !== "ru"
      ? item.info[language].descriere
      : translatedDescription || item.info.en?.descriere || "Nicio descriere";

  const { setIsNavBarVisible } = useNavBarVisibility();

  const handleVideoEnd = () => {
    console.log("Videoclipul s-a terminat!");
    console.log("currentNumber...", currentNumber);
    switch (currentNumber) {
      case 1:
        updateNumber(4);
        break;
      case 4:
        updateNumber(7);
        break;
      case 7:
        updateNumber(5);
        break;
      case 5:
        updateNumber(2);
        break;
      case 2:
        updateNumber(6);
        break;
      case 6:
        updateNumber(3);
        break;
      case 3:
        updateNumber(0);
        break;
      case 0:
        updateNumber(8);
        break;
    }

    setVideoEnded(true);

    setTimeout(() => {
      navigation.navigate(screenName.PersonalReadingDashboard);
    }, 500);

    // Aici puteți adăuga orice logică suplimentară dorită după terminarea videoclipului
  };

  const onPlaybackStatusUpdate = (playbackStatus) => {
    if (playbackStatus.didJustFinish && !playbackStatus.isLooping) {
      handleVideoEnd();
    }
  };

  const videoUrl =
    language === "hi" && item.info.hu?.url
      ? item.info.hu.url
      : language === "id" && item.info.ru?.url
      ? item.info.ru.url
      : language === "ru" && item.info.rusa?.url
      ? item.info.rusa.url
      : language !== "ru" && item.info[language]?.url
      ? item.info[language].url
      : null; // Returnează null dacă niciun URL nu este disponibil

  React.useEffect(() => {
    console.log("currentNumber...", currentNumber);
    console.log("item.info.........", item.info.bg?.url);

    setIsNavBarVisible(false);

    // Verifică dacă nu există URL valid pentru video
    if (!videoUrl) {
      setIsVideoLoading(false); // Nu mai afișăm spinner-ul dacă nu există video
    }

    return () => setIsNavBarVisible(true); // Restabilește vizibilitatea la ieșirea din componentă
  }, [videoUrl]); // Adaugă `videoUrl` în dependențe

  return (
    <View style={{ flex: 1 }}>
      <MainContainer style={{ flex: 1 }}>
        <LinearGradient
          colors={['#FFFBEA', '#FAF7F2', '#F7E7B4']}
          style={styles.gradient}
        >
          <ImageBackground
            source={require("../../../assets/shadowBg.png")}
            resizeMode="cover"
            style={{
              flex: 1,
              width: null,
              height: null,
              // alignItems: 'flex-end',
            }}
          >
            <GreetingBar isGoBack={true} isPersonalGoBack={true} />

            <View style={styles.imageContainer}>
              <Image
                style={[styles.image, { borderWidth: 2, borderColor: '#C9A14A', borderRadius: 12, shadowColor: '#C9A14A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.13, shadowRadius: 8 }]}
                source={{ uri: item.carte.image.finalUri }}
                resizeMode="stretch" // Folosiți "stretch" pentru a întinde imaginea
              />
            </View>

            <View
              style={[
                styles.secondImageContainer,
                { height: videoUrl ? 250 : 0 },
              ]}
            >
              {isVideoLoading && (
                <ActivityIndicator
                  size="large"
                  color={colors.primary2}
                  style={{ position: "relative", top: "40%" }}
                /> // Spinner de încărcare
              )}

              {videoUrl ? ( // Dacă videoUrl este valid
                <Video
                  source={{ uri: videoUrl }}
                  resizeMode="cover"
                  style={[
                    styles.secondImage,
                    { height: isVideoLoading ? 0 : 250 },
                  ]}
                  shouldPlay={true}
                  useNativeControls
                  onLoadStart={() => setIsVideoLoading(true)} // Începe afișarea spinner-ului
                  onLoad={() => setIsVideoLoading(false)} // Ascunde spinner-ul când videoclipul este încărcat
                  onPlaybackStatusUpdate={onPlaybackStatusUpdate}
                />
              ) : null}
            </View>
            <ScrollView contentContainerStyle={styles.scrollViewContainer}>
              <View
                style={{
                  display: "flex",
                  justifyContent: "space-around",
                  height: "auto",
                  // marginTop: "10%",
                  paddingHorizontal: "5%",
                  // bottom: "10%",
                }}
              >
                <Text
                  style={{
                    alignSelf: "center",
                    marginBottom: "5%",
                    color: '#C9A14A',
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
                    fontSize: 16,
                    letterSpacing: 0.2,
                  }}
                >
                  {getDescription()}
                </Text>
              </View>
            </ScrollView>
            {/* {videoEnded && (
              <Button
                disabled={false}
                funCallback={
                  () => navigation.navigate(screenName.PersonalReadingDashboard)
                  // console.log(currentNumber)
                }
                borderWidth={2}
                bgColor={colors.primary3}
                label={"next"}
                borderColor={colors.primary3}
                success={true}
                txtColor={colors.white}
                style={{ width: "70%", alignSelf: "center" }}
              />
            )} */}
          </ImageBackground>
        </LinearGradient>
      </MainContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    alignSelf: "center",
    // marginTop: 20,
    marginBottom: 20,
    width: "auto",
    height: "auto",
  },
  scrollViewContainer: {
    // flexGrow: 1, // Asigură că ScrollView se extinde pe tot spațiul disponibil
    justifyContent: "flex-start",
    alignItems: "center",
    // backgroundColor: "red",
    paddingTop: "5%",
    paddingBottom: "5%",
    // paddingBottom: 20, // Ajustați această valoare după cum este necesar
  },
  image: {
    width: 125,
    height: 170,
    // resizeMode: "contain",
    // borderWidth: 3,
    // borderColor: colors.primary2,
    // borderRadius: 10,
  },
  secondImageContainer: {
    alignSelf: "center",

    position: "relative",

    height: 250,
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
    // paddingBottom: 100,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    // Alte stiluri necesare pentru a pozitiona gradientul după cum este necesar
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    backgroundColor: "100%", // Adaugă un overlay pentru a spori lizibilitatea textului
    borderRadius: 10, // Rotunjirea colțurilor
    padding: 20, // Spațiu în interiorul containerului
    height: "100%",
  },
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10, // Spațiu sub titlu
  },
  colorName: {
    color: "white",
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 10, // Spațiu sub numele culorii
  },
  description: {
    color: "white",
    fontSize: 18,
    textAlign: "center", // Aliniere text la centru
  },
});

export default PersonalizedReading;

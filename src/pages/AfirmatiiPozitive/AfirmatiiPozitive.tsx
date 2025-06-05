import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Platform,
  StatusBar,
  ImageBackground,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MainContainer } from "../../components/commonViews";
import GreetingBar from "../../components/UpperGreetingBar/GreetingBar";
import { colors } from "../../utils/colors";
import { TouchableWithoutFeedback } from "react-native";
import {
  H15fontMediumWhite,
  H2fontBoldPrimary,
  H3fontBoldPrimary,
  H3fontBoldWhite,
  H6fontBoldPrimary,
  H6fontMediumPrimary,
  H6fontMediumWhite,
  H7fontBoldPrimary,
  H7fontBoldWhite,
  H7fontMediumPrimary,
  H8fontMediumPrimary,
  H8fontMediumWhite,
} from "../../components/commonText";
import { useNavBarVisibility } from "../../context/NavbarVisibilityContext";
import axios from "axios";
import { useApiData } from "../../context/ApiContext";
import { useLanguage } from "../../context/LanguageContext";
import i18n from "../../../i18n";
import { handleQueryRandom } from "../../utils/firestoreUtils";
import { collection, getCountFromServer } from "firebase/firestore";
import { db } from "../../../firebase";
import { RouteProp, useRoute } from "@react-navigation/native";
import { Positions } from "react-native-calendars/src/expandableCalendar";
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { MaterialIcons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import { Image as RNImage } from 'react-native';

const AfirmatiiPozitive = () => {
  const {
    zilnicNumereNorocoase,
    zilnicCuloriNorocoase,
    zilnicCategoriiViitor,
    numereNorocoase,
    citateMotivationale,
    culoriNorocoase,
    oreNorocoase,
  } = useApiData();
  const { language, changeLanguage } = useLanguage();

  const onPressHandler = () => {
    console.log("Pressed");
  };

  const { setIsNavBarVisible } = useNavBarVisibility();
  const [luck, setLuck] = React.useState(null);

  const [afirmatiiPozitive, setAfirmatiiPozitive] = React.useState(null);

  const getRandomDocumentFirestore = async () => {
    const coll = collection(db, "AfirmatiiPozitive");
    const snapshot = await getCountFromServer(coll);
    const count = snapshot.data().count;
    console.log("count: ", count);

    const randomIndex = Math.floor(Math.random() * count) + 1;

    console.log(randomIndex);
    const obj = await handleQueryRandom("AfirmatiiPozitive", randomIndex);
    setAfirmatiiPozitive(obj);
  };

  React.useEffect(() => {
    getRandomDocumentFirestore();
  }, []);

  // Generăm array-ul automat
  const images = [
    require("../../../assets/afirmatiipoze/1.png"),
    require("../../../assets/afirmatiipoze/2.png"),
    require("../../../assets/afirmatiipoze/3.png"),
    require("../../../assets/afirmatiipoze/4.png"),
    require("../../../assets/afirmatiipoze/5.png"),
    require("../../../assets/afirmatiipoze/6.png"),
    require("../../../assets/afirmatiipoze/7.png"),
    require("../../../assets/afirmatiipoze/8.png"),
    require("../../../assets/afirmatiipoze/9.png"),
    require("../../../assets/afirmatiipoze/10.png"),
    require("../../../assets/afirmatiipoze/11.png"),
    require("../../../assets/afirmatiipoze/12.png"),
    require("../../../assets/afirmatiipoze/13.png"),
    require("../../../assets/afirmatiipoze/14.png"),
    require("../../../assets/afirmatiipoze/15.png"),
    require("../../../assets/afirmatiipoze/16.png"),
    require("../../../assets/afirmatiipoze/17.png"),
    require("../../../assets/afirmatiipoze/18.png"),
    require("../../../assets/afirmatiipoze/19.png"),
    require("../../../assets/afirmatiipoze/20.png"),
    require("../../../assets/afirmatiipoze/21.png"),
    require("../../../assets/afirmatiipoze/22.png"),
    require("../../../assets/afirmatiipoze/23.png"),
    require("../../../assets/afirmatiipoze/24.png"),
    require("../../../assets/afirmatiipoze/25.png"),
    // require("../../../assets/afirmatiipoze/26.png"),
    // require("../../../assets/afirmatiipoze/27.png"),
    // require("../../../assets/afirmatiipoze/28.png"),
    // require("../../../assets/afirmatiipoze/29.png"),
    // require("../../../assets/afirmatiipoze/30.png"),
    // require("../../../assets/afirmatiipoze/31.png"),
    // require("../../../assets/afirmatiipoze/32.png"),
    // require("../../../assets/afirmatiipoze/33.png"),
    // require("../../../assets/afirmatiipoze/34.png"),
    // require("../../../assets/afirmatiipoze/35.png"),
    // require("../../../assets/afirmatiipoze/36.png"),
    // require("../../../assets/afirmatiipoze/37.png"),
    // require("../../../assets/afirmatiipoze/38.png"),
    // require("../../../assets/afirmatiipoze/39.png"),
    // require("../../../assets/afirmatiipoze/40.png"),
    // require("../../../assets/afirmatiipoze/41.png"),
    // require("../../../assets/afirmatiipoze/42.png"),
    // require("../../../assets/afirmatiipoze/43.png"),
    // require("../../../assets/afirmatiipoze/44.png"),
    // require("../../../assets/afirmatiipoze/45.png"),
    // require("../../../assets/afirmatiipoze/46.png"),
    // require("../../../assets/afirmatiipoze/47.png"),
    // require("../../../assets/afirmatiipoze/48.png"),
    // require("../../../assets/afirmatiipoze/49.png"),
    // require("../../../assets/afirmatiipoze/50.png"),
    // require("../../../assets/afirmatiipoze/51.png"),
    // require("../../../assets/afirmatiipoze/52.png"),
    // require("../../../assets/afirmatiipoze/53.png"),
    // require("../../../assets/afirmatiipoze/54.png"),
    // require("../../../assets/afirmatiipoze/55.png"),
    // require("../../../assets/afirmatiipoze/56.png"),
    // require("../../../assets/afirmatiipoze/57.png"),
    // require("../../../assets/afirmatiipoze/58.png"),
    // require("../../../assets/afirmatiipoze/59.png"),
    // require("../../../assets/afirmatiipoze/60.png"),
    // require("../../../assets/afirmatiipoze/61.png"),
    // require("../../../assets/afirmatiipoze/62.png"),
    // require("../../../assets/afirmatiipoze/63.png"),
    // require("../../../assets/afirmatiipoze/64.png"),
    // require("../../../assets/afirmatiipoze/65.png"),
    // require("../../../assets/afirmatiipoze/66.png"),
    // require("../../../assets/afirmatiipoze/67.png"),
    // require("../../../assets/afirmatiipoze/68.png"),
    // require("../../../assets/afirmatiipoze/69.png"),
    // require("../../../assets/afirmatiipoze/70.png"),
    // require("../../../assets/afirmatiipoze/71.png"),
    // require("../../../assets/afirmatiipoze/72.png"),
    // require("../../../assets/afirmatiipoze/73.png"),
  ];

  // Fix: imaginea random să fie aleasă o singură dată
  const [randomImage, setRandomImage] = React.useState(null);
  React.useEffect(() => {
    setRandomImage(images[Math.floor(Math.random() * images.length)]);
  }, []);

  const viewRef = React.useRef(null);

  const [fabOpen, setFabOpen] = React.useState(false);
  const [hideFab, setHideFab] = React.useState(false);
  const [showShareOverlay, setShowShareOverlay] = React.useState(false);

  // Funcție pentru captură screenshot
  const handleCapture = async (share = false) => {
    try {
      setHideFab(true);
      if (share) setShowShareOverlay(true);
      await new Promise(resolve => setTimeout(resolve, 100));
      if (!viewRef.current) {
        alert('Eroare: view-ul nu este disponibil pentru captură!');
        setHideFab(false);
        if (share) setShowShareOverlay(false);
        return;
      }
      const uri = await captureRef(viewRef, {
        format: 'png',
        quality: 1,
      });
      setHideFab(false);
      if (share) setShowShareOverlay(false);
      if (share) {
        await Sharing.shareAsync(uri, {
          dialogTitle: 'Distribuie afirmația pozitivă',
          mimeType: 'image/png',
          UTI: 'image/png',
        });
      } else {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
          alert('Permisiunea de acces la galerie este necesară!');
          return;
        }
        await MediaLibrary.saveToLibraryAsync(uri);
        alert('Imaginea a fost salvată în galeria telefonului!');
      }
    } catch (e) {
      setHideFab(false);
      if (share) setShowShareOverlay(false);
      console.log('Eroare la captură/share:', e);
      alert('Eroare la captură sau share! ' + (e?.message || ''));
    }
  };

  if (!afirmatiiPozitive) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!afirmatiiPozitive.info) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  console.log("test....", afirmatiiPozitive.info);
  // Extragem numele și descrierea în funcție de limbă
  // Extragem numele și descrierea în funcție de limbă
  const title =
    language === "hi"
      ? afirmatiiPozitive?.info?.hu?.nume || afirmatiiPozitive?.info?.en?.nume
      : language === "id"
      ? afirmatiiPozitive?.info?.ru?.nume || afirmatiiPozitive?.info?.en?.nume
      : language === "ru"
      ? afirmatiiPozitive?.info?.rusa?.nume || afirmatiiPozitive?.info?.en?.nume
      : afirmatiiPozitive?.info[language]?.nume ||
        afirmatiiPozitive?.info?.en?.nume;

  const description =
    language === "hi"
      ? afirmatiiPozitive?.info?.hu?.descriere ||
        afirmatiiPozitive?.info?.en?.descriere
      : language === "id"
      ? afirmatiiPozitive?.info?.ru?.descriere ||
        afirmatiiPozitive?.info?.en?.descriere
      : language === "ru"
      ? afirmatiiPozitive?.info?.rusa?.descriere ||
        afirmatiiPozitive?.info?.en?.descriere
      : afirmatiiPozitive?.info[language]?.descriere ||
        afirmatiiPozitive?.info?.en?.descriere;

  return (
    <View style={{ flex: 1 }}>
      <MainContainer style={{ flex: 1 }} secondary={false}>
        <View ref={viewRef} collapsable={false} style={{ flex: 1 }}>
          <ImageBackground
            source={randomImage || images[0]}
            resizeMode="cover"
            style={styles.imageBackground}
          >
            <View style={styles.overlay}>
              <View style={{ flex: 1 }}>
                <View style={styles.secondImageContainer}>
                  <Image
                    source={require("../../../assets/headerIcon.png")}
                    style={styles.secondImage}
                    resizeMode="contain"
                  />
                </View>
          
                <View style={styles.contentContainer}>
                  <H3fontBoldWhite style={styles.title}>{title}</H3fontBoldWhite>
                  <ScrollView
                    style={styles.scrollArea}
                    contentContainerStyle={styles.scrollContentContainer}
                  >
                    <H6fontMediumWhite style={{ textAlign: 'justify' }}>
                      {description}
                    </H6fontMediumWhite>
                  </ScrollView>
                  <View style={{ alignItems: 'center' }}>
                    <H7fontBoldWhite>@CristinaZurba.App</H7fontBoldWhite>
                  </View>
                </View>
              </View>
              {!hideFab && (
                <View style={styles.fabContainer} pointerEvents="box-none">
                  {fabOpen && (
                    <View style={styles.fabActions}>
                      <TouchableOpacity
                        onPress={() => { 
                          setFabOpen(false); 
                          console.log('FAB: Download apăsat');
                          handleCapture(false); 
                        }}
                        style={[styles.fabActionBtn, { marginBottom: 16 }]}
                      >
                        <MaterialIcons name="file-download" size={28} color="#fff" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => { 
                          setFabOpen(false); 
                          console.log('FAB: Share apăsat');
                          handleCapture(true); 
                        }}
                        style={styles.fabActionBtn}
                      >
                        <MaterialIcons name="share" size={28} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  )}
                  <TouchableOpacity
                    onPress={() => {
                      setFabOpen((v) => {
                        const newState = !v;
                        console.log(newState ? 'FAB deschis' : 'FAB închis');
                        return newState;
                      });
                    }}
                    style={styles.fabMain}
                    activeOpacity={0.8}
                  >
                    <MaterialIcons name={fabOpen ? "close" : "add"} size={32} color="#fff" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </ImageBackground>
        </View>
      </MainContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageBackground: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  secondImageContainer: {
    alignSelf: "center",
  },
  secondImage: {
    width: 250,
    height: 100,
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    // Eliminăm justifyContent: "space-between"
    // ca să nu împingă ultimul element în jos.
    paddingBottom: 10, // spațiu de jos, dacă dorești
  },
  title: {
    marginTop: 20,
    textAlign: "center",
    color: "white",
  },
  scrollArea: {
    maxHeight: "65%", // Poți pune '50%' sau alt număr, după preferințe
    width: "100%",
    marginTop: 20,
    marginBottom: 20,
  },
  scrollContentContainer: {
    alignItems: "center",
  },
  description: {
    textAlign: "center",
    color: "white",
  },
  mention: {
    textAlign: "center",
    color: "white",
  },
  fabContainer: {
    position: 'absolute',
    right: 24,
    bottom: 104, // mai sus de bara de navigație
    alignItems: 'center',
    zIndex: 100,
  },
  fabMain: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  fabActions: {
    marginBottom: 8,
    alignItems: 'center',
  },
  fabActionBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
});
export default AfirmatiiPozitive;

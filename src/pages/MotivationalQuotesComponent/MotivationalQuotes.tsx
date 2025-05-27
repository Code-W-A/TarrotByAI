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
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MainContainer } from "../../components/commonViews";
import GreetingBar from "../../components/UpperGreetingBar/GreetingBar";
import { colors } from "../../utils/colors";
import { TouchableWithoutFeedback } from "react-native";
import {
  H15fontMediumWhite,
  H3fontBoldWhite,
  H6fontBoldPrimary,
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
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { MaterialIcons } from '@expo/vector-icons';

const MotivationalQuotes = () => {
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

  const [zilnicCitateMotivationale, setZilnicCitateMotivationale] =
    React.useState({});

  const getRandomDocumentFirestore = async () => {
    // Presupunem că deja ai definit `collection` și `db`
    const coll = collection(db, "CitateMotivationale");
    const snapshot = await getCountFromServer(coll);
    const count = snapshot.data().count;
    console.log("count: ", count);

    const randomIndex = Math.floor(Math.random() * count) + 1;

    console.log(randomIndex);
    const obj = await handleQueryRandom("CitateMotivationale", randomIndex);
    setZilnicCitateMotivationale(obj);
  };

  React.useEffect(() => {
    getRandomDocumentFirestore();
  }, []);

  // React.useEffect(() => {
  //   if (citateMotivationale && citateMotivationale.length > 0) {
  //     const randomIndex = Math.floor(
  //       Math.random() * citateMotivationale.length
  //     );
  //     setZilnicCitateMotivationale(citateMotivationale[randomIndex]);
  //   }
  // }, [citateMotivationale]);

  React.useEffect(() => {
    setIsNavBarVisible(false);
    return () => setIsNavBarVisible(true); // Restabilește vizibilitatea la ieșirea din componentă
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
    require("../../../assets/afirmatiipoze/26.png"),
    require("../../../assets/afirmatiipoze/27.png"),
    require("../../../assets/afirmatiipoze/28.png"),
    require("../../../assets/afirmatiipoze/29.png"),
    require("../../../assets/afirmatiipoze/30.png"),
    require("../../../assets/afirmatiipoze/31.png"),
    require("../../../assets/afirmatiipoze/32.png"),
    require("../../../assets/afirmatiipoze/33.png"),
    require("../../../assets/afirmatiipoze/34.png"),
    require("../../../assets/afirmatiipoze/35.png"),
    require("../../../assets/afirmatiipoze/36.png"),
    require("../../../assets/afirmatiipoze/37.png"),
    require("../../../assets/afirmatiipoze/38.png"),
    require("../../../assets/afirmatiipoze/39.png"),
    require("../../../assets/afirmatiipoze/40.png"),
    require("../../../assets/afirmatiipoze/41.png"),
    require("../../../assets/afirmatiipoze/42.png"),
    require("../../../assets/afirmatiipoze/43.png"),
    require("../../../assets/afirmatiipoze/44.png"),
    require("../../../assets/afirmatiipoze/45.png"),
    require("../../../assets/afirmatiipoze/46.png"),
    require("../../../assets/afirmatiipoze/47.png"),
    require("../../../assets/afirmatiipoze/48.png"),
    require("../../../assets/afirmatiipoze/49.png"),
    require("../../../assets/afirmatiipoze/50.png"),
    require("../../../assets/afirmatiipoze/51.png"),
    require("../../../assets/afirmatiipoze/52.png"),
    require("../../../assets/afirmatiipoze/53.png"),
    require("../../../assets/afirmatiipoze/54.png"),
    require("../../../assets/afirmatiipoze/55.png"),
    require("../../../assets/afirmatiipoze/56.png"),
    require("../../../assets/afirmatiipoze/57.png"),
    require("../../../assets/afirmatiipoze/58.png"),
    require("../../../assets/afirmatiipoze/59.png"),
    require("../../../assets/afirmatiipoze/60.png"),
    require("../../../assets/afirmatiipoze/61.png"),
    require("../../../assets/afirmatiipoze/62.png"),
    require("../../../assets/afirmatiipoze/63.png"),
    require("../../../assets/afirmatiipoze/64.png"),
    require("../../../assets/afirmatiipoze/65.png"),
    require("../../../assets/afirmatiipoze/66.png"),
    require("../../../assets/afirmatiipoze/67.png"),
    require("../../../assets/afirmatiipoze/68.png"),
    require("../../../assets/afirmatiipoze/69.png"),
    require("../../../assets/afirmatiipoze/70.png"),
    require("../../../assets/afirmatiipoze/71.png"),
    require("../../../assets/afirmatiipoze/72.png"),
    require("../../../assets/afirmatiipoze/73.png"),
  ];

  // Fix: imaginea random să fie aleasă o singură dată
  const [randomImage, setRandomImage] = React.useState(null);
  React.useEffect(() => {
    setRandomImage(images[Math.floor(Math.random() * images.length)]);
  }, []);

  // Determină textul citatului în funcție de limbă
  const quoteText = zilnicCitateMotivationale.info
    ? language === "hi"
      ? zilnicCitateMotivationale.info.hu?.descriere
      : language === "id"
      ? zilnicCitateMotivationale.info.ru?.descriere
      : language === "ru"
      ? zilnicCitateMotivationale.info.rusa?.descriere
      : zilnicCitateMotivationale.info[language]?.descriere
    : "";

  const viewRef = React.useRef(null);
  const [fabOpen, setFabOpen] = React.useState(false);
  const [hideFab, setHideFab] = React.useState(false);

  const handleCapture = async (share = false) => {
    try {
      setHideFab(true);
      await new Promise(resolve => setTimeout(resolve, 100));
      if (!viewRef.current) {
        alert('Eroare: view-ul nu este disponibil pentru captură!');
        setHideFab(false);
        return;
      }
      const uri = await captureRef(viewRef, {
        format: 'png',
        quality: 1,
      });
      setHideFab(false);
      if (share) {
        await Sharing.shareAsync(uri, {
          dialogTitle: 'Distribuie citatul motivațional',
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
      console.log('Eroare la captură/share:', e);
      alert('Eroare la captură sau share! ' + (e?.message || ''));
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <MainContainer secondary={false} style={{ flex: 1 }}>
        <View ref={viewRef} collapsable={false} style={{ flex: 1 }}>
          <ImageBackground
            source={randomImage}
            resizeMode="cover"
            style={{ flex: 1 }}
          >
            <GreetingBar isGoBack={true} />

            {/* Imaginea header */}
            <View style={styles.secondImageContainer}>
              <Image
                source={require("../../../assets/headerIcon.png")}
                style={styles.secondImage}
                resizeMode="contain"
              />
            </View>

            <View style={styles.contentContainer}>
              {/* Titlul (dacă avem citat) */}
              {zilnicCitateMotivationale.info && (
                <H3fontBoldWhite style={styles.title}>
                  {i18n.translate("motivationalQuoteOfTheDay")}
                </H3fontBoldWhite>
              )}

              {/* ScrollView cu textul citatului */}
              <ScrollView
                style={styles.scrollArea}
                contentContainerStyle={styles.scrollContentContainer}
              >
                {!!quoteText && (
                  <H6fontMediumWhite style={styles.description}>
                    {quoteText}
                  </H6fontMediumWhite>
                )}
              </ScrollView>

              {/* Mențiune sub zona scrollabilă */}
              {zilnicCitateMotivationale.info && (
                <View style={{ alignItems: 'center' }}>
                  <H7fontBoldWhite>@cristinazurba</H7fontBoldWhite>
                </View>
              )}
            </View>

            {/* FAB pentru download/share */}
            {!hideFab && (
              <View style={fabStyles.fabContainer} pointerEvents="box-none">
                {fabOpen && (
                  <View style={fabStyles.fabActions}>
                    <TouchableOpacity
                      onPress={() => { 
                        setFabOpen(false); 
                        handleCapture(false); 
                      }}
                      style={[fabStyles.fabActionBtn, { marginBottom: 16 }]}
                    >
                      <MaterialIcons name="file-download" size={28} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => { 
                        setFabOpen(false); 
                        handleCapture(true); 
                      }}
                      style={fabStyles.fabActionBtn}
                    >
                      <MaterialIcons name="share" size={28} color="#fff" />
                    </TouchableOpacity>
                  </View>
                )}
                <TouchableOpacity
                  onPress={() => {
                    setFabOpen((v) => !v);
                  }}
                  style={fabStyles.fabMain}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name={fabOpen ? "close" : "add"} size={32} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
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
    backgroundColor: "rgba(0,0,0,0.5)",
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
    // spațiu jos pentru siguranță, dacă vrei:
    paddingBottom: 10,
  },
  title: {
    marginTop: 20,
    textAlign: "center",
    color: "white",
  },
  scrollArea: {
    maxHeight: "65%", // Ajustează după preferință
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
});

// Adaug stiluri pentru FAB
const fabStyles = StyleSheet.create({
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

export default MotivationalQuotes;

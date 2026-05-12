import React, {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  View,
  ScrollView,
  Dimensions,
  Animated,
  ActivityIndicator,
  StatusBar,
  Platform,
  ImageBackground,
  Text,
  Button,
  TouchableWithoutFeedback,
  StyleSheet,
  Image,
  Modal,
  TouchableOpacity,
} from "react-native";
import Constants from "expo-constants";
import { Provider as PaperProvider } from "react-native-paper";
import { useSelector, useDispatch } from "react-redux";
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { MaterialCommunityIcons, FontAwesome5, Feather, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import NavBarBottom from "../../components/Navbar";
import FlipCard from "../../components/FlipCard/FlipCard";
import { styles } from "./DashboardStyle";
import { MainContainer } from "../../components/commonViews";
import { LinearGradient } from "expo-linear-gradient";
import Card from "../../components/MenuCard/Card";
import GreetingBar from "../../components/UpperGreetingBar/GreetingBar";
import { screenName } from "../../utils/screenName";
import { useNavigationState } from "../../context/NavigationContext";
import i18n from "../../../i18n";
import { useLanguage } from "../../context/LanguageContext";
import { useApiData } from "../../context/ApiContext";
import { colors, textStyles } from "../../utils/colors";
import { handleLanguagei18n } from "../../utils/handleLanguageGeneral";

// ADS COMPLETELY REMOVED FOR DEBUGGING
// import {
//   InterstitialAd,
//   TestIds,
//   AdEventType,
// } from "react-native-google-mobile-ads";

import { usePushNotifications } from "../../hooks/usePushNotifications";
import { useAppUpdatePrompt } from "../../hooks/useAppUpdatePrompt";
import { useAuth } from "../../context/AuthContext";
import {
  handleQueryRandom,
  syncUserProfileAppLanguageForNotifications,
  upsertUserTokenMetadata,
} from "../../utils/firestoreUtils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RattingDialog from "../../components/RattingDialog/RattingDialog";
import LongCard from "../../components/MenuCard/LongCard";
import AutoScrollingFlatList from "../../components/MenuCard/AutoScrollingFlatList";
import MoreInfoModal from "../../components/Astral/components/MoreInfoModal";
import { doc, getFirestore, updateDoc, collection, query, orderBy, limit } from "firebase/firestore";
import { getDocsPreferCache } from "../../utils/firestoreCache";
import { db } from "../../../firebase";
import { filterArticlesBeforeCurrentTime } from "../../utils/commonUtils";
import { NewsDetailsModal } from "../../components/NewsDetailsModal/NewsDetailsModal";
import ShareScreenshot from '../../components/common/ShareScreenshot';
import UpdateAppModal from '../../components/UpdateAppModal';
// import { TestIds as GoogleTestIds } from "react-native-google-mobile-ads"; // ADS REMOVED

//---ADS---
// const adUnitId = __DEV__
//   ? GoogleTestIds.INTERSTITIAL
//   : Platform.OS === "android"
//     ? "ca-app-pub-9577714849380446/7080054250"
//     : "ca-app-pub-9577714849380446/5660268593";
// const adUnitId = "ca-app-pub-9577714849380446/7080054250";

// const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
//   keywords: ["spiritualitate", "bunăstare"],
// });

// const interstitial = "";

interface UserDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

const CATEGORIES = [
  {
    key: 'astrology',
    label: i18n.translate('Astrologie'),
    icon: <MaterialCommunityIcons name="star-outline" size={32} color="#FFD700" />,
    screen: screenName.PersonalReadingDashboard,
    description: i18n.translate('Descoperă astrograma natală, sinastria și articole astrologice.'),
  },
  {
    key: 'tarot',
    label: i18n.translate('Tarot'),
    icon: <MaterialCommunityIcons name="cards" size={32} color="#FFD700" />,
    screen: screenName.FutureReadingDashboard,
    description: i18n.translate('Citiri de tarot personalizate pentru tine.'),
  },
  {
    key: 'luck',
    label: i18n.translate('Noroc'),
    icon: <FontAwesome5 name="clover" size={28} color="#FFD700" />,
    screen: screenName.luckyNumber,
    description: i18n.translate('Numere, culori și ore norocoase.'),
  },
  {
    key: 'magic',
    label: i18n.translate('Mesaje magice'),
    icon: <MaterialCommunityIcons name="magic-staff" size={32} color="#FFD700" />,
    screen: screenName.motivationalQuotes,
    description: i18n.translate('Afirmații pozitive și ghidare spirituală.'),
  },
  {
    key: 'blog',
    label: i18n.translate('Blog'),
    icon: <Feather name="feather" size={32} color="#FFD700" />,
    screen: screenName.motivationalQuotes,
    description: i18n.translate('Articole și previziuni astrologice.'),
  },
];

const languages = [
  { name: "Romanian", code: "ro", flag: require("../../../assets/flags/romania.png") },
  { name: "English", code: "en", flag: require("../../../assets/flags/english.png") },
  { name: "Spanish", code: "es", flag: require("../../../assets/flags/spanish.png") },
  { name: "Bulgarian", code: "bg", flag: require("../../../assets/flags/bulgaria.png") },
  { name: "Czech", code: "cs", flag: require("../../../assets/flags/czech.png") },
  { name: "German", code: "de", flag: require("../../../assets/flags/germany.png") },
  { name: "Greek", code: "el", flag: require("../../../assets/flags/greece.png") },
  { name: "French", code: "fr", flag: require("../../../assets/flags/france.png") },
  { name: "Croatian", code: "hr", flag: require("../../../assets/flags/croatia.png") },
  { name: "Hindi", code: "hi", flag: require("../../../assets/flags/india.png") },
  { name: "Italian", code: "it", flag: require("../../../assets/flags/italy.png") },
  { name: "Polish", code: "pl", flag: require("../../../assets/flags/poland.png") },
  { name: "Indonesian", code: "id", flag: require("../../../assets/flags/indonesia.png") },
  { name: "Slovak", code: "sk", flag: require("../../../assets/flags/slovakia.png") },
  { name: "Russian", code: "ru", flag: require("../../../assets/flags/russia.png") },
  { name: "Turkey", code: "tr", flag: require("../../../assets/flags/turkey.png") },
  { name: "Arab", code: "ar", flag: require("../../../assets/flags/arab.png") },
  { name: "Albania", code: "sq", flag: require("../../../assets/flags/albania.png") },
];

const MesajeMagiceMainScreen = () => {
  const [loaded, setLoaded] = useState(false);
  const [cardAnimations, setCardAnimations] = useState([]);
  const initialAnimations = useRef(Array(4).fill(null)).current; // Utilizarea useRef pentru a păstra starea inițială
  const { language, changeLanguage } = useLanguage();

  const [visible, setVisible] = useState(false);
  const navigation: any = useNavigation();
  const { expoPushToken } = usePushNotifications();
  const { currentUser, userData, isGuestUser, setUserData } = useAuth();
  // Stări pentru informațiile utilizatorului
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [isModalVisible, setModalVisible] = useState<boolean>(false);
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("Romanian");
  const [latestArticles, setLatestArticles] = useState([]);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [articleModalVisible, setArticleModalVisible] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const { visible: showUpdateModal, onClose: onCloseAppUpdateModal } = useAppUpdatePrompt();

  useEffect(() => {
    const checkAndLoadData = async () => {
      try {
        const storedData = await AsyncStorage.getItem("userDetails");
        const parsedData = storedData ? JSON.parse(storedData) : null;
        console.log("parsedData.....", parsedData);

        const areDataEqual = (data1, data2) => {
          console.log(data1.email);
          console.log(data2.email);
          console.log(data1.phone);
          console.log(data2.phone);
          if (!data1 || !data2) return false;
          return data1.email === data2.email && data1.phone === data2.phone;
        };

        const hasUserData = userData?.owner_uid; // Verifică dacă există un UID

        if (parsedData && hasUserData) {
          // Dacă există ambele seturi de date
          console.log("here...one...");
          const combinedData = {
            firstName: userData?.first_name || parsedData.firstName || "",
            lastName: userData?.last_name || parsedData.lastName || "",
            email: userData?.email || parsedData.email || "",
            phone: userData?.phone || parsedData.phone || "",
          };

          setFirstName(combinedData.firstName);
          setLastName(combinedData.lastName);
          setEmail(combinedData.email);
          setPhone(combinedData.phone);

          // Afișează modalul doar dacă datele nu sunt egale
          if (!areDataEqual(parsedData, userData)) {
            console.log("here...one...two");
            setModalVisible(true);
          }
        } else if (hasUserData) {
          console.log("here...two...");
          // Dacă există doar `userData`
          setFirstName(userData?.first_name || "");
          setLastName(userData?.last_name || "");
          setEmail(userData?.email || "");
          setPhone(userData?.phone || "");
          setModalVisible(true);
        } else if (parsedData) {
          console.log("here...three...");
          // Dacă există doar `parsedData`
          setFirstName(parsedData.firstName || "");
          setLastName(parsedData.lastName || "");
          setEmail(parsedData.email || "");
          setPhone(parsedData.phone || "");
        } else {
          // Dacă nu există nici `parsedData`, nici `userData`
          setFirstName("");
          setLastName("");
          setEmail("");
          setPhone("");
          setModalVisible(true);
        }
      } catch (error) {
        console.error("Eroare la încărcarea datelor din AsyncStorage:", error);
        setModalVisible(true); // În caz de eroare, afișează modalul
      }
    };

    checkAndLoadData();
  }, [userData]);

  const handleConfirm = async (
    firstName: string,
    lastName: string,
    email: string,
    phone: string
  ) => {
    const userDetails = { firstName, lastName, email, phone };

    try {
      // Salvează datele local în AsyncStorage
      await AsyncStorage.setItem("userDetails", JSON.stringify(userDetails));

      // Șterge datele din cheile specificate
      const keysToRemove = [
        // "userData",
        "personsDataAstrograma",
        "personsData",
        "personsDataOthers",
      ];
      await Promise.all(
        keysToRemove.map((key) => AsyncStorage.removeItem(key))
      );

      // Actualizează state-ul local
      setFirstName(firstName);
      setLastName(lastName);
      setEmail(email);
      setPhone(phone);

      // Dacă există `owner_uid`, trimite telefonul în Firestore
      if (userData?.owner_uid) {
        const db = getFirestore();
        const userDocRef = doc(db, "Users", userData.owner_uid);

        await updateDoc(userDocRef, {
          phone,
        });

        console.log(
          `Numărul de telefon ${phone} a fost actualizat în Firestore.`
        );
      }

      setModalVisible(false);
      console.log("Datele au fost actualizate cu succes.");
      // navigation.navigate(screenName.OnboardingScreen);
    } catch (error) {
      console.error(
        "Eroare la salvarea datelor în AsyncStorage sau Firestore:",
        error
      );
    }
  };

  useEffect(() => {
    const handleUploadToken = async () => {
      if (expoPushToken) {
        await upsertUserTokenMetadata(expoPushToken.data, {
          language,
          isIos: Platform.OS === "ios",
          projectId: Constants.expoConfig?.extra?.eas.projectId,
          source: "MesajeMagiceMainScreen",
        });
      }
    };
    if (expoPushToken) {
      handleUploadToken(); // Apelarea funcției
    }
  }, [expoPushToken, isGuestUser, userData, language]);
  // useEffect(() => {
  //   const screen =
  //     userData.actualLanguage && userData.actualLanguageAstrograma
  //       ? screenName.MesajeMagiceMain
  //       : screenName.languageSelectScreen;

  //   navigation.navigate(screen);
  // }, []);
  const {
    oreNorocoase,
    numereNorocoase,
    culoriNorocoase,
    citateMotivationale,
    categoriiViitor,
    cartiViitor,
    varianteCarti,
    categoriiPersonalizate,
    cartiPersonalizate,
    loading,
    error,
    fetchData,
    zilnicCitateMotivationale,
  } = useApiData();

  const cardDataFrist = [
    {
      text: i18n.translate("personalReading"),
      screen: screenName.PersonalReadingDashboard,
    },
    {
      text: i18n.translate("futureReading"),
      screen: screenName.FutureReadingDashboard,
    },
    {
      text: i18n.translate("luckyNumber"),
      screen: screenName.luckyNumber,
    },
    {
      text: i18n.translate("luckyColor"),
      screen: screenName.luckyColor,
    },
    {
      text: i18n.translate("luckyHours"),
      screen: screenName.luckyHour,
    },
    {
      text: i18n.translate("motivationalQuotes"),
      screen: screenName.motivationalQuotes,
    },
  ];
  const cardDataSecond = [
    {
      text: i18n.translate("carteaTa"),
      screen: "CarteaTa",
    },
    {
      text: i18n.translate("ceGandeste"),
      screen: "CeGandeste",
    },
    {
      text: i18n.translate("ceSimte"),
      screen: "CeSimte",
    },
    {
      text: i18n.translate("EnergiaDinRelație"),
      screen: "EnergiaDinRelație",
    },
    {
      text: i18n.translate("ViitorApropiat"),
      screen: "ViitorApropiat",
    },
    {
      text: i18n.translate("AfirmatiiPozitive"),
      screen: "AfirmatiiPozitive",
    },
  ];

  useEffect(() => {
    console.log("asdsa");
    console.log(zilnicCitateMotivationale);
    // console.log("asdsa");
    const screenWidth = Dimensions.get("window").width;

    // Inițializarea animațiilor doar dacă nu au fost setate anterior
    if (initialAnimations.every((elem) => elem === null)) {
      initialAnimations.forEach((_, index) => {
        initialAnimations[index] = new Animated.Value(screenWidth);
      });

      setCardAnimations(initialAnimations);

      animateCard(0); // Începe animația pentru primul card
    }
  }, []);

  const animateCard = (index) => {
    if (index < initialAnimations.length) {
      Animated.timing(initialAnimations[index], {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => animateCard(index + 1));
    }
  };

  const renderCard = (card, index, interstitial, interstitialAdLoaded) => {
    return (
      <Card
        key={index}
        text={card.text}
        screen={card.screen}
        image={require("../../../assets/dash-frame.png")}
        interstitial={interstitial}
        interstitialAdLoaded={interstitialAdLoaded}
      />
    );
  };

  // Restul logicii și a codului specific aplicației...

  const screenHeight = Dimensions.get("window").height;

  //---ADS---
  // ADS COMPLETELY REMOVED - useEffect commented out
  // useEffect(() => {
  //   const loadListener = interstitial.addAdEventListener(
  //     AdEventType.LOADED,
  //     () => {
  //       setLoaded(true);
  //     }
  //   );
  //   const closeListener = interstitial.addAdEventListener(
  //     AdEventType.CLOSED,
  //     () => {
  //       setLoaded(false);
  //       interstitial.load(); // Reîncarcă reclama pentru o utilizare ulterioară
  //     }
  //   );
  //   const errorListener = interstitial.addAdEventListener(
  //     AdEventType.ERROR,
  //     (error) => {
  //       console.error(error);
  //     }
  //   );

  //   interstitial.load(); // Începe încărcarea anunțului

  //   return () => {
  //     loadListener();
  //     closeListener();
  //     errorListener();
  //   };
  // }, []);

  // No advert ready to show yet
  // if (!loaded) {
  //   return null;
  // }

  // useFocusEffect(
  //   useCallback(() => {
  //     const manageVisibility = async () => {
  //       const userRating = await AsyncStorage.getItem("userRating");
  //       console.log("useRating...", userRating);
  //       const entryCount = parseInt(
  //         (await AsyncStorage.getItem("entryCount")) || "0",
  //         10
  //       );
  //       await AsyncStorage.setItem("entryCount", (entryCount + 1).toString());

  //       // if ((entryCount + 1) % 5 === 0 && userRating === null) {
  //       if ((entryCount + 1) % 5 === 0) {
  //         console.log("true....");
  //         setVisible(true);
  //       } else {
  //         console.log("false....");
  //         setVisible(false);
  //       }
  //     };

  //     manageVisibility();
  //   }, [])
  // );

  const quickAccessCards = [
    {
      icon: <MaterialCommunityIcons name="account-circle-outline" size={36} color="#bfa76a" />,
      title: i18n.translate('yourAstrogram'),
      desc: i18n.translate('exploreTheNatalChartHoroscope'),
    },
    {
      icon: <MaterialCommunityIcons name="calendar-star" size={32} color="#bfa76a" />,
      title: i18n.translate('seeTheHoroscope'),
      desc: i18n.translate('historyFuture'),
    },
    {
      icon: <MaterialCommunityIcons name="account-group-outline" size={32} color="#bfa76a" />,
      title: i18n.translate('analyzeSynastry'),
      desc: i18n.translate('EnergiaDinRelație'),
    },
  ];
  const screenWidth = Dimensions.get('window').width;
  const scrollRef = useRef(null);

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem("@userLanguage");
        if (savedLanguage) {
          const foundLanguage = languages.find((l) => l.code === savedLanguage);
          setCurrentLanguage(foundLanguage ? foundLanguage.name : "English");
        }
      } catch (e) {
        console.error("Failed to load the language from storage");
      }
    };
    loadLanguage();
  }, []);

  const handleLanguageSelect = async (languageName) => {
    const selectedLanguage = languages.find((l) => l.name === languageName);
    const langCode = selectedLanguage ? selectedLanguage.code : "en";
    setCurrentLanguage(languageName);
    const newLangCode = await handleLanguagei18n(langCode);
    changeLanguage(newLangCode);
    AsyncStorage.setItem("@userLanguage", langCode);
    setLangModalVisible(false);
    void syncUserProfileAppLanguageForNotifications(
      langCode,
      "MesajeMagiceMainScreen.handleLanguageSelect"
    );
  };
  const flagImageSource = languages.find((l) => l.name === currentLanguage)?.flag;

  useEffect(() => {
    const fetchLatestArticles = async () => {
      setLoadingArticles(true);
      try {
        const articlesRef = collection(db, "BlogArticole");
        const q = query(articlesRef, orderBy("firstUploadTimestamp", "desc"), limit(3));
        const snapshot = await getDocsPreferCache(q);
        const articles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const filtered = filterArticlesBeforeCurrentTime(articles);
        setLatestArticles(filtered);
      } catch (e) {
        console.error("Failed to fetch latest articles", e);
      } finally {
        setLoadingArticles(false);
      }
    };
    fetchLatestArticles();
  }, []);

  const handlePressArticle = (article) => {
    setSelectedArticle(article);
    setArticleModalVisible(true);
  };

  return (
    <Fragment>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fffbe6' }}>
        <LinearGradient
          colors={["#fffbe6", "#f7e7ce", "#e7c585"]}
          style={{ flex: 1 }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Dashboard background image above gradient, but below content */}
          <ImageBackground
            source={require("../../../assets/dashboardbg.jpg")}
            resizeMode="cover"
            style={[StyleSheet.absoluteFill, { zIndex: 1 }]}
            imageStyle={{ opacity: 1 }}
          />
          {/* Overlay for opacity effect */}
          <View style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(255,255,255,0.72)',
            zIndex: 2,
            pointerEvents: 'none',
          }} />
          {/* Content with zIndex 3 to be above overlay */}
          <View style={{ flex: 1, zIndex: 3 }}>
            {/* Fixed Header */}
            <View style={stylesNew.fixedHeader}>
              <View style={stylesNew.headerRow}>
                <Image source={require("../../../assets/LogoPngTransparent.png")} style={stylesNew.logo} resizeMode="contain" />
                <View style={stylesNew.headerTextBlock}>
                  <Text style={stylesNew.headerSalute}>{i18n.translate('welcomeTitle')}</Text>
                  <Text style={stylesNew.headerUser}>{firstName ? `${i18n.translate('helloUser')}, ${firstName}` : ''}</Text>
                </View>
                {/* Flag language selector in top right */}
                <TouchableOpacity onPress={() => setLangModalVisible(true)} style={stylesNew.headerFlagBtn}>
                  <Image style={stylesNew.headerFlagImg} source={flagImageSource} />
                </TouchableOpacity>
              </View>
              {/* Modal for language selection */}
              <Modal
                animationType="slide"
                transparent={true}
                visible={langModalVisible}
                onRequestClose={() => setLangModalVisible(false)}
              >
                <TouchableOpacity
                  style={stylesNew.modalOverlay}
                  activeOpacity={1}
                  onPressOut={() => setLangModalVisible(false)}
                >
                  <View style={stylesNew.modalLang}>
                    <Text style={[stylesNew.modalText, { marginBottom: 15 }]}>{i18n.translate('selectLanguage')}</Text>
                    <ScrollView style={{ width: '100%' }}>
                      {languages.map((lang) => (
                        <TouchableOpacity
                          key={lang.code}
                          style={stylesNew.modalItem}
                          onPress={() => handleLanguageSelect(lang.name)}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Image source={lang.flag} style={{ width: 32, height: 22, borderRadius: 4, marginRight: 12 }} />
                            <Text style={stylesNew.modalText}>{lang.name}</Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                    <TouchableOpacity
                      style={stylesNew.modalItemCancel}
                      onPress={() => setLangModalVisible(false)}
                    >
                      <Text style={stylesNew.modalTextCancel}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </Modal>
              {/* Visually integrate GreetingBar, but keep it compact */}
              {/* <GreetingBar isGoBack={false} isPersonalGoBack={false} /> */}
            </View>
            <ScrollView
              contentContainerStyle={stylesNew.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Section: Acces rapid și istoric (carusel) */}
              <View style={stylesNew.sectionContainer}>
                {/* Mesaje magice */}
                <Text style={stylesNew.subSectionTitle}>Mesaje magice</Text>
                <View style={{ marginTop: 24 }}>
                  {[
                    { text: i18n.translate("motivationalQuotes"), screen: screenName.motivationalQuotes, icon: <MaterialCommunityIcons name="message-star-outline" size={48} color="#FFD700" style={{ marginRight: 18 }} /> },
                    { text: i18n.translate("AfirmatiiPozitive"), screen: "AfirmatiiPozitive", icon: <MaterialCommunityIcons name="magic-staff" size={48} color="#FFD700" style={{ marginRight: 18 }} /> },
                  ].map((card, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => navigation.navigate(card.screen as never)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: 'rgba(255,255,255,0.97)',
                        borderRadius: 18,
                        paddingVertical: 24,
                        paddingHorizontal: 24,
                        marginBottom: 18,
                        shadowColor: '#bfa76a',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.13,
                        shadowRadius: 16,
                        elevation: 7,
                      }}
                    >
                      {card.icon}
                      <Text style={{ fontSize: 28, fontWeight: 700, color: '#FFD700', flex: 1 }}>{card.text}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              {/* Section: Functional Cards (horizontal scroll) */}
              {/* <View style={stylesNew.sectionContainer}>
                <Text style={stylesNew.sectionTitle}>{i18n.translate('personalReading')}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={stylesNew.functionalCardsRow}>
                  {cardDataFrist.map((card, index) => (
                    <View key={index} style={stylesNew.functionalCardBox}>
                      <TouchableWithoutFeedback onPress={() => navigation.navigate(card.screen as never)}>
                        <View style={stylesNew.functionalCardContent}>
                          <MaterialCommunityIcons name="star-outline" size={28} color="#bfa76a" style={{ marginBottom: 6 }} />
                          <Text style={stylesNew.functionalCardLabel}>{card.text}</Text>
                        </View>
                      </TouchableWithoutFeedback>
                    </View>
                  ))}
                </ScrollView>
              </View> */}
              {/* <View style={stylesNew.sectionContainer}>
                <Text style={stylesNew.sectionTitle}>{i18n.translate('carteaTa')}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={stylesNew.functionalCardsRow}>
                  {cardDataSecond.map((card, index) => (
                    <View key={index} style={stylesNew.functionalCardBox}>
                      <TouchableWithoutFeedback onPress={() => navigation.navigate(card.screen as never)}>
                        <View style={stylesNew.functionalCardContent}>
                          <MaterialCommunityIcons name="star-outline" size={28} color="#bfa76a" style={{ marginBottom: 6 }} />
                          <Text style={stylesNew.functionalCardLabel}>{card.text}</Text>
              </View>
                      </TouchableWithoutFeedback>
                    </View>
                  ))}
                </ScrollView>
              </View> */}
            

      
            </ScrollView>
<></>
            {/* RattingDialog dacă este activ */}
            {visible && (
            <RattingDialog setVisible={setVisible} visible={visible} />
            )}
            {/* NewsDetailsModal for article details */}
            <NewsDetailsModal
              visible={articleModalVisible}
              article={selectedArticle}
              articleIndex={0}
              onClose={() => setArticleModalVisible(false)}
              saveArticle={() => {}}
            />
            <UpdateAppModal visible={showUpdateModal} onClose={onCloseAppUpdateModal} />
          </View>
        </LinearGradient>
      </SafeAreaView>
    </Fragment>
  );
};

const stylesNew = StyleSheet.create({
  fixedHeader: {
    backgroundColor: 'rgba(255,255,255,0.72)', // more transparent
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingBottom: 4,
    paddingTop: 6,
    paddingHorizontal: 10,
    shadowColor: '#bfa76a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 6,
    zIndex: 10,
    borderBottomWidth: 1,
    borderColor: '#e7c585',
    minHeight: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start', // top align
    marginBottom: 0,
    justifyContent: 'space-between',
    gap: 8,
    width: '100%',
  },
  logo: {
    width: 38,
    height: 38,
    marginRight: 8,
    borderRadius: 12,
    backgroundColor: '#fffbe6',
    borderWidth: 1.5,
    borderColor: '#e7c585',
    shadowColor: '#bfa76a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTextBlock: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    minHeight: 0,
    paddingTop: 2,
  },
  headerSalute: {
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 0.2,
    marginBottom: 0,
    ...textStyles.goldenTextBold,
  },
  headerUser: {
    fontSize: 13,
    marginTop: 0,
    fontWeight: '500',
    ...textStyles.goldenText,
  },
  // Add a style for the language selector in the header
  headerFlagBtn: {
    alignSelf: 'flex-start',
    marginLeft: 8,
    marginTop: 2,
    paddingHorizontal: 2,
    paddingVertical: 2,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderWidth: 1,
    borderColor: '#e7c585',
  },
  headerFlagImg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    objectFit: 'cover',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  modalLang: {
    backgroundColor: '#fffbe6',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 24,
    minHeight: 220,
    maxHeight: 400,
    width: '100%',
    alignItems: 'flex-start',
    shadowColor: '#bfa76a',
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 6,
  },
  modalItem: {
    paddingVertical: 10,
    alignItems: 'flex-start',
    width: '100%',
  },
  modalItemCancel: {
    paddingVertical: 10,
    alignItems: 'flex-start',
    width: '100%',
  },
  modalText: {
    fontSize: 18,
    fontWeight: '600',
    ...textStyles.goldenTextBold,
  },
  modalTextCancel: {
    fontSize: 18,
    color: '#7c6f57',
    fontWeight: '500',
  },
  scrollContent: {
    paddingBottom: 100,
    paddingTop: 16,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  sectionContainer: {
    width: '100%',
    marginBottom: 6,
    paddingHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    marginBottom: 6,
    marginLeft: 4,
    ...textStyles.goldenTextBold,
  },
  autoScrollContainer: {
    width: '100%',
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.85)',
    shadowColor: '#bfa76a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 3,
    padding: 8,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  categoryBox: {
    width: '47%',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 18,
    alignItems: 'center',
    marginBottom: 14,
    paddingVertical: 20,
    paddingHorizontal: 12,
    shadowColor: '#bfa76a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#fffbe6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#bfa76a',
    shadowColor: '#bfa76a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
    ...textStyles.goldenTextBold,
  },
  categoryDesc: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 2,
    ...textStyles.goldenText,
  },
  essentialsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  essentialBox: {
    width: 170,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 16,
    alignItems: 'center',
    marginRight: 10,
    paddingVertical: 16,
    paddingHorizontal: 10,
    shadowColor: '#bfa76a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 3,
  },
  essentialTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
    textAlign: 'center',
    ...textStyles.goldenTextBold,
  },
  essentialText: {
    fontSize: 13,
    textAlign: 'center',
    ...textStyles.goldenText,
  },
  functionalCardsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  functionalCardBox: {
    width: 140,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 16,
    alignItems: 'center',
    marginRight: 10,
    paddingVertical: 16,
    paddingHorizontal: 8,
    shadowColor: '#bfa76a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 3,
  },
  functionalCardContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  functionalCardLabel: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    ...textStyles.goldenTextBold,
  },
  quickAccessCarouselRow: {
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 0,
    gap: 0,
  },
  quickAccessCarouselCard: {
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: 22,
    paddingVertical: 28,
    paddingHorizontal: 18,
    marginHorizontal: 8,
    shadowColor: '#bfa76a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 16,
    elevation: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickAccessCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 2,
    textAlign: 'center',
    ...textStyles.goldenTextBold,
  },
  quickAccessCardDesc: {
    fontSize: 13,
    textAlign: 'center',
    ...textStyles.goldenText,
  },
  mysticCardBox: {
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 18,
    alignItems: 'center',
    marginBottom: 14,
    paddingVertical: 16,
    paddingHorizontal: 12,
    height:100
  },
  mysticCardContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mysticIcon: {
    position: 'absolute',
    width: 48,
    height: 48,
  },
  mysticCardDesc: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginTop: 10,
  },
  astroSurface: {
    width: '100%',
    height: 100,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 14,
  },
  astroGradient: {
    flex: 1,
    borderRadius: 18,
    padding: 16,
  },
  astroIconBg: {
    position: 'absolute',
    width: 90,
    height: 90,
  },
  astroHeadline: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  astroDesc: {
    fontSize: 14,
    color: '#fff',
  },
  astroButton: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 12,
    alignItems: 'center',
  },
  astroButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#bfa76a',
  },
  astroBrightCard: {
    width: '100%',
    height: 100,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 14,
  },
  astroBrightContent: {
    flex: 1,
    padding: 16,
  },
  astroBrightIcon: {
    position: 'absolute',
    width: 38,
    height: 38,
    top: 16,
    left: 16,
  },
  astroBrightHeadline: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 10,
    textShadowColor: '#B8860B',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  astroBrightDesc: {
    fontSize: 14,
    color: '#7c6f57',
  },
  astroBrightButton: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 12,
    alignItems: 'center',
  },
  astroBrightButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    textShadowColor: '#B8860B',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  astroSurfaceBright: {
    width: '100%',
    height: 100,
    backgroundColor: '#fff',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#bfa76a',
    shadowColor: '#bfa76a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
    marginBottom: 18,
  },
  astroSurfaceContent: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  astroSurfaceIcon: {
    position: 'absolute',
    width: 32,
    height: 32,
    top: 16,
    left: 16,
    shadowColor: '#bfa76a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  astroSurfaceHeadline: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.1,
    textShadowColor: '#B8860B',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  astroSurfaceDesc: {
    fontSize: 14,
    color: '#7c6f57',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 0.05,
  },
  astroSurfaceButton: {
    backgroundColor: '#bfa76a',
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: '#bfa76a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 2,
  },
  astroSurfaceButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.2,
  },
  astroCardElegant: {
    width: '100%',
    height: 'auto',
    backgroundColor: '#fff',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#bfa76a',
    shadowColor: '#bfa76a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
    marginBottom: 18,
  },
  astroCardContent: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  astroCardIcon: {
    position: 'absolute',
    width: 28,
    height: 28,
    top: 16,
    left: 16,
    shadowColor: '#bfa76a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  astroCardHeadline: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.1,
    textShadowColor: '#B8860B',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  astroCardDesc: {
    fontSize: 14,
    color: '#7c6f57',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 0.05,
  },
  astroCardButton: {
    backgroundColor: '#bfa76a',
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: '#bfa76a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 2,
  },
  astroCardButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.2,
  },
  astroCardMinimal: {
    width: '100%',
    height: 'auto',
    backgroundColor: '#fff',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#bfa76a',
    shadowColor: '#bfa76a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
    marginBottom: 18,
  },
  astroCardMinimalDesc: {
    fontSize: 14,
    color: '#7c6f57',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 0.05,
  },
  astroCardImageBg: {
    width: '100%',
    height: 'auto',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  astroCardImageBgImg: {
    width: '100%',
    height: '100%',
  },
  astroCardImageBgDesc: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginTop: 10,
  },
  astroCardImageBgRect: {
    width: '100%',
    height: 182,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  astroCardImageBgRectImg: {
    width: '100%',
    height: '100%',
  },
  astroCardImageBgRectOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.32)',
  },
  astroCardImageBgRectDesc: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffe6b0',
    textAlign: 'center',
  },
  subSectionTitle: {
    fontSize: 35,
    fontWeight: '700',
    marginTop: 0,
    marginBottom: 8,
    letterSpacing: 0.1,
    textAlign: 'left',
    paddingLeft: 4,
    ...textStyles.goldenTextBold,
  },
  subSectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 8,
  },
  subSectionCardBox: {
    width: '48%',
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 16,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    shadowColor: '#bfa76a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 3,
  },
  goldenText: {
    color: '#FFD700',
    textShadowColor: '#B8860B',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  goldenTextBold: {
    color: '#FFD700',
    fontWeight: '600',
    textShadowColor: '#B8860B',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
});

export default MesajeMagiceMainScreen;

import { logDebug } from "../../utils/Logger";
import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
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
  TextInput,
  RefreshControl,
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
import { SvgUri } from 'react-native-svg';
// ADS COMPLETELY REMOVED FOR DEBUGGING
// import { TestIds } from "react-native-google-mobile-ads";

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
import UpdateAppModal from "../../components/UpdateAppModal";
import LongCard from "../../components/MenuCard/LongCard";
import AutoScrollingFlatList from "../../components/MenuCard/AutoScrollingFlatList";
import MoreInfoModal from "../../components/Astral/components/MoreInfoModal";
import { doc, getFirestore, updateDoc, collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import { filterArticlesBeforeCurrentTime } from "../../utils/commonUtils";
import { NewsDetailsModal } from "../../components/NewsDetailsModal/NewsDetailsModal";
import { useUserDataModal } from "../../hooks/useUserDataModal";
// NEW: Import the centralized ads system
import { useAds } from "../../hooks/useAds";
import { useAdsContext } from "../../context/AdsContext";
import { getPublishedVideos } from "../../features/video-library/services/videoLibrary.service";
import type { Video } from "../../features/video-library/types/video";
import { WebView } from "react-native-webview";
import { getEmbedUrl, getRemoteThumbnailSource } from "../../features/video-library/utils/videoEmbed";
import { getLocalizedVideoForDisplay, getVideoThumbnailUrl } from "../../features/video-library/utils/videoPlayback";
import { hasPremiumAccess } from "../../features/video-library/utils/premiumAccess";
import { getDocsPreferCache } from "../../utils/firestoreCache";
import {
  ensureRewardedPolicyHydrated,
  getPremiumBonusRewardUnlocksRemainingToday,
  recordPremiumBonusRewardUnlockConsumed,
  recordVideoInterstitialShown,
  recordVideoOpen,
  shouldShowVideoInterstitial,
} from "../../features/video-library/utils/videoAdPolicy";
import { RewardedAdGate } from "../../features/video-library/components/RewardedAdGate";
import { createCoursesApi, normalizeLocale } from "../../services/coursesApi";
import type { SafeCourse } from "../../types/courses";
import { IOS_COURSES_FREE_MODE_ENABLED } from "../../features/courses/iosCoursesFreeMode";

// ADS COMPLETELY REMOVED FOR DEBUGGING
// const adUnitId = __DEV__
//   ? TestIds.INTERSTITIAL
//   : Platform.OS === "android"
//     ? "ca-app-pub-9577714849380446/7080054250"
//     : "ca-app-pub-9577714849380446/5660268593";
// // const adUnitId = "ca-app-pub-9577714849380446/7080054250";

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

const LatestVideoCard: React.FC<{ video: Video; onPress: () => void }> = ({
  video,
  onPress,
}) => {
  const [previewError, setPreviewError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const embedUrl = getEmbedUrl(video.platform, video.videoUrl);
  const shouldShowPreview = Boolean(embedUrl && !previewError);
  const thumbnailUrl = getVideoThumbnailUrl(video);

  const BASE_URL = "https://cristinazurba.com/";
  const embedParamsSeparator = embedUrl?.includes("?") ? "&" : "?";
  const previewHtml = embedUrl
    ? `<!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <style>
          html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background-color: #000; }
          .player { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
          iframe { width: 100%; height: 100%; border: 0; }
        </style>
      </head>
      <body>
        <div class="player">
          <iframe
            src="${embedUrl}${embedParamsSeparator}autoplay=0&mute=1&controls=0&modestbranding=1&playsinline=1&origin=${encodeURIComponent(
              BASE_URL
            )}"
            referrerpolicy="strict-origin-when-cross-origin"
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
          ></iframe>
        </div>
      </body>
    </html>`
    : null;

  return (
    <TouchableOpacity
      activeOpacity={0.93}
      onPress={onPress}
      style={{
        width: 220,
        height: 180,
        borderRadius: 20,
        overflow: "hidden",
        marginRight: 12,
        backgroundColor: "#fff",
        shadowColor: "#bfa76a",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.13,
        shadowRadius: 16,
        elevation: 7,
      }}
    >
      <View style={{ flex: 1, backgroundColor: "#000" }}>
        {shouldShowPreview ? (
          <>
            {isLoading && thumbnailUrl ? (
              <ImageBackground
                source={getRemoteThumbnailSource(thumbnailUrl)}
                style={{ ...StyleSheet.absoluteFillObject }}
                resizeMode="cover"
              />
            ) : null}
            <WebView
              source={{ html: previewHtml!, baseUrl: BASE_URL }}
              style={{ flex: 1, backgroundColor: "#000" }}
              onError={() => {
                setPreviewError(true);
                setIsLoading(false);
              }}
              onLoadEnd={() => setIsLoading(false)}
              scrollEnabled={false}
              bounces={false}
              javaScriptEnabled
              domStorageEnabled
              mediaPlaybackRequiresUserAction={false}
              allowsInlineMediaPlayback
              originWhitelist={["*"]}
            />
          </>
        ) : (
          <ImageBackground
            source={
              thumbnailUrl
                ? getRemoteThumbnailSource(thumbnailUrl)
                : { uri: "https://picsum.photos/800" }
            }
            style={{ flex: 1 }}
            resizeMode="cover"
          />
        )}

        {video.isPremium ? (
          <View
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              backgroundColor: "rgba(255, 215, 0, 0.92)",
              borderRadius: 12,
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderWidth: 1,
              borderColor: "rgba(125, 95, 46, 0.35)",
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: "700",
                color: "#5d4e37",
                letterSpacing: 0.3,
              }}
            >
              {i18n.translate("videoPremiumBadge")}
            </Text>
          </View>
        ) : null}

        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.18)",
            justifyContent: "center",
            alignItems: "center",
            padding: 12,
          }}
        >
          <Ionicons
            name="play-circle"
            size={40}
            color="rgba(255,255,255,0.92)"
          />
          <Text
            style={{
              color: "#ffe6b0",
              fontWeight: "700",
              fontSize: 15,
              textAlign: "center",
              textShadowColor: "#000",
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 1,
              marginTop: 6,
            }}
            numberOfLines={2}
          >
            {video.title}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const LatestCourseCard: React.FC<{
  course: SafeCourse;
  locale: string;
  featuredLabel: string;
  onPress: () => void;
}> = ({ course, locale, featuredLabel, onPress }) => {
  const [previewError, setPreviewError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const previewUrl =
    course.hasVimeoPreview && course.previewVimeoId
      ? `https://player.vimeo.com/video/${encodeURIComponent(
          course.previewVimeoId
        )}?autoplay=1&muted=1&loop=1&background=1&controls=0&title=0&byline=0&portrait=0`
      : null;

  const showPreview = Boolean(previewUrl && !course.hasCustomThumbnail && !previewError);

  const priceLabel = (() => {
    try {
      return new Intl.NumberFormat(locale || "ro", {
        style: "currency",
        currency: course.currency,
        maximumFractionDigits: 2,
      }).format(course.price);
    } catch {
      return `${course.price} ${course.currency}`;
    }
  })();

  return (
    <TouchableOpacity
      activeOpacity={0.93}
      onPress={onPress}
      style={{
        width: 220,
        height: 180,
        borderRadius: 20,
        overflow: "hidden",
        marginRight: 12,
        backgroundColor: "#fff",
        shadowColor: "#bfa76a",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.13,
        shadowRadius: 16,
        elevation: 7,
      }}
    >
      <View style={{ flex: 1, backgroundColor: "#000" }}>
        {showPreview ? (
          <>
            {isLoading && course.thumbnailUrl ? (
              <ImageBackground
                source={{ uri: course.thumbnailUrl }}
                style={{ ...StyleSheet.absoluteFillObject }}
                resizeMode="cover"
              />
            ) : null}
            <WebView
              source={{ uri: previewUrl! }}
              style={{ flex: 1, backgroundColor: "#000" }}
              onError={() => {
                setPreviewError(true);
                setIsLoading(false);
              }}
              onLoadEnd={() => setIsLoading(false)}
              scrollEnabled={false}
              bounces={false}
              javaScriptEnabled
              domStorageEnabled
              mediaPlaybackRequiresUserAction={false}
              allowsInlineMediaPlayback
              originWhitelist={["*"]}
            />
          </>
        ) : (
          <ImageBackground
            source={{ uri: course.thumbnailUrl ?? "https://picsum.photos/800" }}
            style={{ flex: 1 }}
            resizeMode="cover"
          />
        )}

        {course.featuredOnHome ? (
          <View
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              backgroundColor: "rgba(255, 215, 0, 0.92)",
              borderRadius: 12,
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderWidth: 1,
              borderColor: "rgba(125, 95, 46, 0.35)",
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: "700",
                color: "#5d4e37",
                letterSpacing: 0.3,
              }}
            >
              {featuredLabel}
            </Text>
          </View>
        ) : null}

        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.2)",
            justifyContent: "center",
            alignItems: "center",
            padding: 12,
          }}
        >
          <Ionicons
            name="school"
            size={34}
            color="rgba(255,255,255,0.92)"
          />
          <Text
            style={{
              color: "#ffe6b0",
              fontWeight: "700",
              fontSize: 15,
              textAlign: "center",
              textShadowColor: "#000",
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 1,
              marginTop: 6,
            }}
            numberOfLines={2}
          >
            {course.title}
          </Text>
        </View>

        {!IOS_COURSES_FREE_MODE_ENABLED ? (
          <View
            style={{
              position: "absolute",
              bottom: 10,
              right: 10,
              backgroundColor: "rgba(255, 248, 230, 0.95)",
              borderRadius: 10,
              paddingHorizontal: 8,
              paddingVertical: 4,
            }}
          >
            <Text style={{ color: "#5d4e37", fontSize: 12, fontWeight: "700" }}>
              {priceLabel}
            </Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const LatestSkeletonCard: React.FC = () => {
  const CARD_WIDTH = 220;
  const shimmerAnim = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1400,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [shimmerAnim]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-CARD_WIDTH, CARD_WIDTH],
  });

  return (
    <View
      style={{
        width: CARD_WIDTH,
        height: 180,
        borderRadius: 20,
        marginRight: 12,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(191, 167, 106, 0.25)",
        shadowColor: "#bfa76a",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
      }}
    >
      <View style={{ flex: 1, backgroundColor: "#f1e7d4" }} />
      <View
        style={{
          position: "absolute",
          left: 12,
          right: 12,
          bottom: 16,
          height: 16,
          borderRadius: 8,
          backgroundColor: "#e6d8be",
        }}
      />
      <View
        style={{
          position: "absolute",
          left: 12,
          bottom: 40,
          width: "60%",
          height: 12,
          borderRadius: 8,
          backgroundColor: "#eadcc1",
        }}
      />
      <Animated.View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: -CARD_WIDTH,
          width: CARD_WIDTH,
          transform: [{ translateX }],
        }}
      >
        <LinearGradient
          colors={[
            "rgba(255,255,255,0)",
            "rgba(255,255,255,0.35)",
            "rgba(255,255,255,0)",
          ]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </View>
  );
};

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

const ClinicDashboard = () => {
  const [loaded, setLoaded] = useState(false);
  const [cardAnimations, setCardAnimations] = useState([]);
  const initialAnimations = useRef(Array(4).fill(null)).current; // Utilizarea useRef pentru a păstra starea inițială
  const { language, changeLanguage } = useLanguage();
  
  // ADS Integration (after userData — need isPremiumUser for subscriber ad suppression)
  const { adsConfig } = useAdsContext();
  const [visible, setVisible] = useState(false);
  const navigation: any = useNavigation();
  const { expoPushToken } = usePushNotifications();
  const { currentUser, userData, isGuestUser, setUserData, refreshUserDataFromServer } = useAuth();
  const isPremiumUser = hasPremiumAccess(userData);
  const { showInterstitial, canShowAds, showRewarded, isRewardedLoaded } = useAds(adsConfig, {
    userHasPremiumAccess: isPremiumUser,
  });
  const { visible: showAppUpdateModal, onClose: onCloseAppUpdateModal } = useAppUpdatePrompt();
  
  // Hook pentru gestionarea verificării datelor utilizatorului
  const {
    firstName: modalFirstName,
    setFirstName: setModalFirstName,
    lastName: modalLastName,
    setLastName: setModalLastName,
    email: modalEmail,
    setEmail: setModalEmail,
    phone: modalPhone,
    setPhone: setModalPhone,
    isModalVisible,
    setModalVisible,
    navigateToLearn,
    handleModalConfirm,
    onCompleteCallback,
  } = useUserDataModal(navigation);
  
  // Stări pentru informațiile utilizatorului (pentru afișare în header)
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("Romanian");
  const [latestArticles, setLatestArticles] = useState([]);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [refreshingArticles, setRefreshingArticles] = useState(false);
  const [articleModalVisible, setArticleModalVisible] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [latestVideos, setLatestVideos] = useState<Video[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [refreshingVideos, setRefreshingVideos] = useState(false);
  const [rewardedGateVideo, setRewardedGateVideo] = useState<Video | null>(null);
  const [rewardedPolicyEpoch, setRewardedPolicyEpoch] = useState(0);
  const [latestCourses, setLatestCourses] = useState<SafeCourse[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [refreshingCourses, setRefreshingCourses] = useState(false);

  const dashboardVideoLocale = i18n.locale?.split("-")[0] ?? "ro";

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void ensureRewardedPolicyHydrated().then(() => {
        if (active) setRewardedPolicyEpoch((e) => e + 1);
      });
      return () => {
        active = false;
      };
    }, [])
  );

  const categories = useMemo(
    () => [
      {
        key: "astrology",
        label: i18n.translate("astroSectionTitle"),
        icon: (
          <Image
            source={require("../../../assets/clinicdashboard/astrology.png")}
            style={{ width: 55, height: 55 }}
          />
        ),
        screen: "Learn",
        description: i18n.translate(
          "Descoperă astrograma natală, sinastria și articole astrologice."
        ),
        image: require("../../../assets/card-back.png"),
      },
      {
        key: "tarot",
        label: i18n.translate("Tarot"),
        icon: (
          <Image
            source={require("../../../assets/clinicdashboard/Tarot.png")}
            style={{ width: 38, height: 38 }}
          />
        ),
        screen: "TarotMaineScreen",
        description: i18n.translate(
          "Citiri de tarot personalizate pentru tine."
        ),
        image: require("../../../assets/card-back.png"),
      },
      {
        key: "luck",
        label: i18n.translate("Noroc"),
        icon: (
          <Image
            source={require("../../../assets/clinicdashboard/Noroc.png")}
            style={{ width: 38, height: 38 }}
          />
        ),
        screen: "NorocMaineScreen",
        description: i18n.translate("Numere, culori și ore norocoase."),
        image: require("../../../assets/card-back.png"),
      },
      {
        key: "magic",
        label: i18n.translate("MesajeMagice"),
        icon: (
          <Image
            source={require("../../../assets/clinicdashboard/Mesajemagice.png")}
            style={{ width: 38, height: 38 }}
          />
        ),
        screen: "MesajeMagiceMainScreen",
        description: i18n.translate(
          "Afirmații pozitive și ghidare spirituală."
        ),
        image: require("../../../assets/card-back.png"),
      },
    ],
    [language]
  );

  const coursesApi = useMemo(() => {
    try {
      return createCoursesApi({
        baseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
        getAuthToken: async () => {
          if (currentUser?.getIdToken) {
            return currentUser.getIdToken();
          }
          return null;
        },
      });
    } catch (error) {
      console.error("[ClinicDashboard] Courses API init failed", error);
      return null;
    }
  }, [currentUser]);

  // Funcție pentru gestionarea navigării către Learn screen cu verificarea datelor
  const handleNavigateToLearn = async () => {
    await navigateToLearn();
  };

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedData = await AsyncStorage.getItem("userDetails");
        const parsedData = storedData ? JSON.parse(storedData) : null;
        
        // Doar încarcă datele pentru afișare, fără verificare obligatorie
        if (parsedData) {
          setFirstName(parsedData.firstName || "");
          setLastName(parsedData.lastName || "");
          setEmail(parsedData.email || "");
          setPhone(parsedData.phone || "");
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };
    loadUserData();
  }, [userData]);

  useEffect(() => {
    const handleUploadToken = async () => {
      if (expoPushToken) {
        await upsertUserTokenMetadata(expoPushToken.data, {
          language,
          isIos: Platform.OS === "ios",
          projectId: Constants.expoConfig?.extra?.eas.projectId,
          source: "ClinicDashboard",
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
  //       ? screenName.ClinicDashBoard
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
    logDebug("asdsa");
    logDebug(zilnicCitateMotivationale);
    // logDebug("asdsa");
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
  //       logDebug("useRating...", userRating);
  //       const entryCount = parseInt(
  //         (await AsyncStorage.getItem("entryCount")) || "0",
  //         10
  //       );
  //       await AsyncStorage.setItem("entryCount", (entryCount + 1).toString());

  //       // if ((entryCount + 1) % 5 === 0 && userRating === null) {
  //       if ((entryCount + 1) % 5 === 0) {
  //         logDebug("true....");
  //         setVisible(true);
  //       } else {
  //         logDebug("false....");
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
      "ClinicDashboard.handleLanguageSelect"
    );
  };
  const flagImageSource = languages.find((l) => l.name === currentLanguage)?.flag;

  const fetchLatestArticles = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshingArticles(true);
    } else {
      setLoadingArticles(true);
    }
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
      if (isRefresh) {
        setRefreshingArticles(false);
      } else {
        setLoadingArticles(false);
      }
    }
  };

  useEffect(() => {
    fetchLatestArticles();
  }, []);

  const fetchLatestVideos = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshingVideos(true);
    } else {
      setLoadingVideos(true);
    }
    try {
      const videos = await getPublishedVideos();
      setLatestVideos(videos.slice(0, 3));
    } catch (e) {
      console.error("Failed to fetch latest videos", e);
    } finally {
      if (isRefresh) {
        setRefreshingVideos(false);
      } else {
        setLoadingVideos(false);
      }
    }
  };

  useEffect(() => {
    fetchLatestVideos();
  }, []);

  const fetchLatestCourses = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshingCourses(true);
    } else {
      setLoadingCourses(true);
    }

    try {
      if (!coursesApi) {
        setLatestCourses([]);
        return;
      }

      const localeForBackend = normalizeLocale(language || i18n.locale || "ro");
      const localeCandidates = Array.from(
        new Set([localeForBackend, "ro", "en"].map((candidate) => normalizeLocale(candidate)))
      );

      let safeCourses: SafeCourse[] = [];
      let resolvedLocale = localeForBackend;

      for (let index = 0; index < localeCandidates.length; index += 1) {
        const candidateLocale = localeCandidates[index];
        const result = await coursesApi.listCourses({
          locale: candidateLocale,
          limit: 6,
        });
        const candidateCourses = result.courses || [];

        logDebug("[ClinicDashboard] Latest courses locale candidate", {
          requestedLocale: localeForBackend,
          candidateLocale,
          count: candidateCourses.length,
        });

        const isLastLocale = index === localeCandidates.length - 1;
        if (candidateCourses.length > 0 || isLastLocale) {
          safeCourses = candidateCourses;
          resolvedLocale = candidateLocale;
          break;
        }
      }

      const sortedLatest = [...safeCourses]
        .sort((a, b) => {
          const timeA = a.updatedAt ? Date.parse(a.updatedAt) : 0;
          const timeB = b.updatedAt ? Date.parse(b.updatedAt) : 0;
          return (Number.isNaN(timeB) ? 0 : timeB) - (Number.isNaN(timeA) ? 0 : timeA);
        })
        .slice(0, 3);

      setLatestCourses(sortedLatest);
      logDebug("[ClinicDashboard] Latest courses fetched", {
        requestedLocale: localeForBackend,
        resolvedLocale,
        fallbackUsed: resolvedLocale !== localeForBackend,
        count: sortedLatest.length,
      });
    } catch (error) {
      console.error("[ClinicDashboard] Failed to fetch latest courses", error);
      setLatestCourses([]);
    } finally {
      if (isRefresh) {
        setRefreshingCourses(false);
      } else {
        setLoadingCourses(false);
      }
    }
  }, [coursesApi, language]);

  useEffect(() => {
    void fetchLatestCourses();
  }, [fetchLatestCourses]);

  const handlePressArticle = (article) => {
    setSelectedArticle(article);
    setArticleModalVisible(true);
  };

  const handlePressVideo = async (video: Video) => {
    recordVideoOpen();
    await ensureRewardedPolicyHydrated();

    let effectiveIsPremiumUser = isPremiumUser;
    if (
      video.isPremium &&
      !isPremiumUser &&
      video.canPlay !== true &&
      refreshUserDataFromServer
    ) {
      try {
        const fresh = await refreshUserDataFromServer();
        if (fresh && hasPremiumAccess(fresh)) {
          effectiveIsPremiumUser = true;
        }
      } catch {
        // ignore
      }
    }

    const isPremiumLocked =
      video.isPremium &&
      !effectiveIsPremiumUser &&
      video.canPlay !== true;

    if (isPremiumLocked) {
      const bonusUnlocksLeft = getPremiumBonusRewardUnlocksRemainingToday();
      const canOfferRewarded =
        canShowAds && isRewardedLoaded && bonusUnlocksLeft > 0;

      if (canOfferRewarded) {
        setRewardedGateVideo(video);
        return;
      }
      if (bonusUnlocksLeft === 0) {
        setRewardedGateVideo(video);
        return;
      }

      navigation.navigate(screenName.VideoPremiumSubscription, { video });
      return;
    }

    if (
      !effectiveIsPremiumUser &&
      !video.isPremium &&
      canShowAds &&
      shouldShowVideoInterstitial()
    ) {
      const shown = await showInterstitial();
      if (shown) {
        recordVideoInterstitialShown();
      }
    }
    navigation.navigate(screenName.VideoPlayer, { video });
  };

  const handleWatchRewardedAdDashboard = async (): Promise<boolean> => {
    if (!rewardedGateVideo) return false;
    const videoToPlay = rewardedGateVideo;

    const success = await showRewarded();
    if (success) {
      await recordPremiumBonusRewardUnlockConsumed();
      setRewardedPolicyEpoch((e) => e + 1);
      setRewardedGateVideo(null);
      navigation.navigate(screenName.VideoPlayer, {
        video: videoToPlay,
        unlockedViaRewardedAd: true,
      });
      return true;
    }
    return false;
  };

  const handleSubscribeFromRewardGateDashboard = () => {
    const v = rewardedGateVideo;
    setRewardedGateVideo(null);
    if (v) {
      navigation.navigate(screenName.VideoPremiumSubscription, { video: v });
    }
  };

  const handlePressCourse = (course: SafeCourse) => {
    navigation.navigate("CoursesDetail", { courseId: course.id });
  };

  const handleOpenCoursesCatalog = () => {
    navigation.navigate("CoursesList");
  };

  const latestCoursesTitleRaw = i18n.translate("latestCourses");
  const latestCoursesTitle =
    latestCoursesTitleRaw === "latestCourses"
      ? "Latest Courses"
      : latestCoursesTitleRaw;
  const seeAllCoursesRaw = i18n.translate("seeAllCourses");
  const seeAllCoursesLabel =
    seeAllCoursesRaw === "seeAllCourses" ? "See all courses" : seeAllCoursesRaw;
  const noCoursesAvailableRaw = i18n.translate("noCoursesAvailable");
  const noCoursesAvailableLabel =
    noCoursesAvailableRaw === "noCoursesAvailable"
      ? "No courses available at the moment."
      : noCoursesAvailableRaw;
  const featuredBadgeRaw = i18n.translate("featuredBadge");
  const featuredBadgeLabel =
    featuredBadgeRaw === "featuredBadge" ? "Featured" : featuredBadgeRaw;
  const closeLabelRaw = i18n.translate("close");
  const closeLabel = closeLabelRaw === "close" ? "Close" : closeLabelRaw;
  const consultationsTitleRaw = i18n.translate("sessionsCategory");
  const consultationsTitle =
    consultationsTitleRaw === "sessionsCategory" ? "Consultations" : consultationsTitleRaw;

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
                      <Text style={stylesNew.modalTextCancel}>{closeLabel}</Text>
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
                <View style={stylesNew.categoriesContainer}>
                  {categories.map((category, index) => (
                    <TouchableOpacity
                      key={category.key}
                      style={stylesNew.categoryCard}
                      onPress={async () => {
                        logDebug('🎯 ClinicDashboard Category apăsat:', category.key);
                        try {
                          // Show ads before navigation
                          const adShown = await showInterstitial();
                          logDebug('✅ ClinicDashboard Ad shown:', adShown);
                        } catch (error) {
                          console.error("❌ ClinicDashboard Error showing ad:", error);
                        } finally {
                          // Navigate regardless of ad success/failure
                          if (category.screen === "Learn") {
                            handleNavigateToLearn();
                          } else {
                            navigation.navigate(category.screen as never);
                          }
                        }
                      }}
                      activeOpacity={0.96}
                    >
                      <View style={stylesNew.categoryContent}>
                        <Text style={stylesNew.categoryCardTitle}>{category.label}</Text>
                        <View style={stylesNew.categoryIcon}>
                          {category.icon}
                        </View>
                      </View>
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
            

              {/* Section: Appointments Navigation */}
          
              {/* Ultimele articole - Blog Section */}
              <View style={stylesNew.sectionContainer}>
                <View style={stylesNew.sectionTitleContainer}>
                  <Text style={stylesNew.sectionTitle}>{i18n.translate('latestArticles')}</Text>
                  <View style={stylesNew.iconBackground}>
                    <Image source={require('../../../assets/clinicdashboard/Articole.png')} style={{ width: 32, height: 32 }} />
                  </View>
                </View>
                {loadingArticles ? (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ flexDirection: "row", gap: 12 }}
                  >
                    {Array.from({ length: 3 }).map((_, index) => (
                      <LatestSkeletonCard key={`article-skeleton-${index}`} />
                    ))}
                  </ScrollView>
                ) : (
                  <>
                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={false} 
                      contentContainerStyle={{ flexDirection: 'row', gap: 12 }}
                      refreshControl={
                        <RefreshControl
                          refreshing={refreshingArticles}
                          onRefresh={() => fetchLatestArticles(true)}
                          colors={['#bfa76a']}
                          tintColor="#bfa76a"
                        />
                      }
                    >
                      {latestArticles.map((article) => (
                        <TouchableOpacity
                          key={article.id}
                          activeOpacity={0.93}
                          onPress={() => handlePressArticle(article)}
                          style={{ width: 220, height: 180, borderRadius: 20, overflow: 'hidden', marginRight: 12, backgroundColor: '#fff', shadowColor: '#bfa76a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.13, shadowRadius: 16, elevation: 7 }}
                        >
                          <ImageBackground
                            source={{ uri: article?.image?.finalUri ?? 'https://picsum.photos/800' }}
                            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                            imageStyle={{ borderRadius: 20 }}
                            resizeMode="cover"
                          >
                            <View style={{
                              position: 'absolute',
                              top: 0, left: 0, right: 0, bottom: 0,
                              backgroundColor: 'rgba(0,0,0,0.32)',
                              justifyContent: 'center', alignItems: 'center',
                              padding: 12,
                            }}>
                              <Text style={{ color: '#ffe6b0', fontWeight: '700', fontSize: 17, textAlign: 'center', textShadowColor: '#000', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 1 }} numberOfLines={3}>
                                {language === "hi"
                                  ? article.info?.hu?.nume
                                  : language === "id"
                                  ? article.info?.ru?.nume
                                  : language === "ru"
                                  ? article.info?.rusa?.nume
                                  : article.info?.[language]?.nume}
                              </Text>
                            </View>
                          </ImageBackground>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                    <TouchableOpacity 
                      style={stylesNew.seeAllButton}
                      onPress={() => navigation.navigate('News')}
                    >
                      <Text style={stylesNew.seeAllButtonText}>{i18n.translate('seeAllArticles')}</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
              {/* Ultimele cursuri video - Courses Section */}
              <View style={stylesNew.sectionContainer}>
                <View style={stylesNew.sectionTitleContainer}>
                  <Text style={stylesNew.sectionTitle}>{latestCoursesTitle}</Text>
                  <View style={stylesNew.iconBackground}>
                    <Ionicons name="school" size={20} color="#ffe6b0" />
                  </View>
                </View>
                {loadingCourses ? (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ flexDirection: "row", gap: 12 }}
                  >
                    {Array.from({ length: 3 }).map((_, index) => (
                      <LatestSkeletonCard key={`course-skeleton-${index}`} />
                    ))}
                  </ScrollView>
                ) : (
                  <>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ flexDirection: "row", gap: 12 }}
                      refreshControl={
                        <RefreshControl
                          refreshing={refreshingCourses}
                          onRefresh={() => fetchLatestCourses(true)}
                          colors={["#bfa76a"]}
                          tintColor="#bfa76a"
                        />
                      }
                    >
                      {latestCourses.map((course) => (
                        <LatestCourseCard
                          key={course.id}
                          course={course}
                          locale={normalizeLocale(language || i18n.locale || "ro")}
                          featuredLabel={featuredBadgeLabel}
                          onPress={() => handlePressCourse(course)}
                        />
                      ))}
                    </ScrollView>
                    {latestCourses.length === 0 ? (
                      <Text style={{ color: "#8b7355", marginTop: 8 }}>
                        {noCoursesAvailableLabel}
                      </Text>
                    ) : null}
                    <TouchableOpacity
                      style={stylesNew.seeAllButton}
                      onPress={handleOpenCoursesCatalog}
                    >
                      <Text style={stylesNew.seeAllButtonText}>{seeAllCoursesLabel}</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>

              {/* Ultimele videoclipuri - Video Section */}
              <View style={stylesNew.sectionContainer}>
                <View style={stylesNew.sectionTitleContainer}>
                  <Text style={stylesNew.sectionTitle}>{i18n.translate('latestVideos')}</Text>
                  <View style={stylesNew.iconBackground}>
                    <Ionicons name="play" size={20} color="#ffe6b0" />
                  </View>
                </View>
                {loadingVideos ? (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ flexDirection: "row", gap: 12 }}
                  >
                    {Array.from({ length: 3 }).map((_, index) => (
                      <LatestSkeletonCard key={`video-skeleton-${index}`} />
                    ))}
                  </ScrollView>
                ) : (
                  <>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ flexDirection: 'row', gap: 12 }}
                      refreshControl={
                        <RefreshControl
                          refreshing={refreshingVideos}
                          onRefresh={() => fetchLatestVideos(true)}
                          colors={['#bfa76a']}
                          tintColor="#bfa76a"
                        />
                      }
                    >
                      {latestVideos.map((video) => (
                        <LatestVideoCard
                          key={video.id}
                          video={video}
                          onPress={() => handlePressVideo(video)}
                        />
                      ))}
                    </ScrollView>
                    <TouchableOpacity
                      style={stylesNew.seeAllButton}
                      onPress={() => navigation.navigate(screenName.VideoLibrary)}
                    >
                      <Text style={stylesNew.seeAllButtonText}>
                        {i18n.translate('seeAllVideos')}
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
              {/* Consultatii - categorie nouă */}
              <View style={stylesNew.sectionContainer}>
                <View style={stylesNew.sectionTitleContainer}>
                  <Text style={stylesNew.sectionTitle}>{consultationsTitle}</Text>
                  <View style={stylesNew.iconBackground}>
                    <Image source={require('../../../assets/clinicdashboard/Consultatii.png')} style={{ width: 32, height: 32 }} />
                  </View>
                </View>
                <TouchableOpacity
                  style={[stylesNew.astroCardImageBgRect, { borderColor: '#bfa76a', borderWidth: 2 }]}
                  activeOpacity={0.93}
                  onPress={() => navigation.navigate('WebViewConsultatiiScreen')}
                >
                  <ImageBackground
                    source={require('../../../assets/consultatii_placeholder.png')}
                    style={stylesNew.astroCardImageBgRectImg}
                    imageStyle={{ borderRadius: 20 }}
                    resizeMode="cover"
                  >
                    {/* Fără overlay, fără text/link */}
                  </ImageBackground>
                </TouchableOpacity>
              </View>
            </ScrollView>
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
            {/* Modal completare date utilizator pentru guest sau user incomplet */}
            <MoreInfoModal
              visible={isModalVisible}
              onDismiss={() => setModalVisible(false)}
              onConfirm={handleModalConfirm}
              email={modalEmail}
              setEmail={setModalEmail}
              phone={modalPhone}
              setPhone={setModalPhone}
              firstName={modalFirstName}
              setFirstName={setModalFirstName}
              lastName={modalLastName}
              setLastName={setModalLastName}
              onCompleteCallback={onCompleteCallback}
            />
            <UpdateAppModal visible={showAppUpdateModal} onClose={onCloseAppUpdateModal} />
          </View>
        </LinearGradient>
      </SafeAreaView>
      <RewardedAdGate
        key={`rewarded-dash-${rewardedPolicyEpoch}`}
        visible={rewardedGateVideo !== null}
        videoId={rewardedGateVideo?.id ?? ""}
        videoTitle={
          rewardedGateVideo
            ? getLocalizedVideoForDisplay(
                rewardedGateVideo,
                dashboardVideoLocale
              ).title
            : ""
        }
        onWatchAd={handleWatchRewardedAdDashboard}
        onSubscribe={handleSubscribeFromRewardGateDashboard}
        onClose={() => setRewardedGateVideo(null)}
      />
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
    letterSpacing: 0.2,
    marginBottom: 0,
    ...textStyles.goldenTextBold,
  },
  headerUser: {
    fontSize: 13,
    marginTop: 0,
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
  categoriesContainer: {
    width: '100%',
    gap: 12,
    paddingHorizontal: 4,
  },
  categoryCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#bfa76a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#e7c585',
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  categoryIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 18,
  },
  categoryIconSunMoon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 18,
  },
  categoryCardTitle: {
    fontSize: 18,
    color: '#7c6f57',
    maxWidth: '80%',
    ...textStyles.goldenTextBold,
  },
  iconBackground: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',
    shadowColor: '#bfa76a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
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
    fontWeight: '700',
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
    fontWeight: '700',
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
    fontWeight: '700',
    color: '#ffe6b0',
    textAlign: 'center',
  },
  subSectionTitle: {
    fontSize: 17,
    marginTop: 8,
    marginBottom: 4,
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
    fontWeight: '700',
    textShadowColor: '#B8860B',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    marginLeft: 4,
    gap: 8,
  },
  seeAllButton: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  seeAllButtonText: {
    color: '#FFD700',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    textShadowColor: '#B8860B',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
});

export default ClinicDashboard;

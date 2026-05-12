import React, {
  useEffect,
  useRef,
  useState,
  createContext,
} from "react";
import RootNavigation from "./navigations";
import { screenName } from "./src/utils/screenName";
// import { MenuProvider } from "react-native-popup-menu";
import { Provider } from "react-redux";
import { Platform, View, ImageBackground, TextComponent, StyleSheet } from "react-native";
import Constants from "expo-constants";
import {
  ActivityIndicator,
  Button,
  Card,
  Paragraph,
  Text,
} from "react-native-paper";

import * as Location from "expo-location";

import * as Device from "expo-device";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";

import { langObj } from "./src/utils/labels";

// import messaging from '@react-native-firebase/messaging';

// import Bugsnag from "@bugsnag/expo";
import { Mode } from "react-hook-form";
import i18n from "./i18n";
import {
  NavigationContainer,
  NavigationContext,
  useNavigation,
} from "@react-navigation/native";

import { ErrorView } from "./src/components/ErrorView";
import ErrorBoundary from "./src/components/ErrorBoundary";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { NavBarVisibilityProvider } from "./src/context/NavbarVisibilityContext";
import { NavigationProvider } from "./src/context/NavigationContext";
import { LanguageProvider, useLanguage } from "./src/context/LanguageContext";
import { ApiDataProvider } from "./src/context/ApiContext";
import store from "./Store";
import * as Font from "expo-font";
import { NumberProvider } from "./src/context/NumberContext";
import { StripeProvider } from "@stripe/stripe-react-native";
import {
  PushNotificationsProvider,
  usePushNotifications,
} from "./src/context/PushNotificationsContext";
import { upsertUserTokenMetadata } from "./src/utils/firestoreUtils";
import { useAppTrackingTransparency } from "./src/hooks/useAppTrackingTransparency";
import { initializeTrackingServices } from "./src/utils/trackingUtils";
import { AdsProvider, useAdsContext } from "./src/context/AdsContext";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  flushReadTelemetry,
  initializeFirestoreReadTelemetry,
  setCurrentTelemetryScreen,
  setCurrentTelemetryUser,
} from "./src/utils/firestoreReadTelemetry";

const App = () => {
  const [notification, setNotification] = useState(false);
  const [languageLoaded, setLanguageLoaded] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const notificationListener = useRef(null);
  const responseListener = useRef(null);

  // App Tracking Transparency hook
  const { status: attStatus, hasPermission: hasTrackingPermission, requestPermission: requestATTPermission } = useAppTrackingTransparency();
  
  // We'll use this inside the AdsProvider to get access to setAdsConfig
  const AppContent = () => {
    const { setAdsConfig, isAdsReady } = useAdsContext();
    const { language } = useLanguage();
    const { currentUser, isGuestUser } = useAuth();
    const navigationRef = useRef<any>(null);

    useEffect(() => {
      initializeFirestoreReadTelemetry();
    }, []);

    useEffect(() => {
      setCurrentTelemetryUser(currentUser?.uid || "", {
        isGuestUser,
      });
    }, [currentUser?.uid, isGuestUser]);

    useEffect(() => {
      return () => {
        void flushReadTelemetry("app-unmount", { ignoreEnabled: true });
      };
    }, []);

    const syncTelemetryScreen = () => {
      const currentRoute = navigationRef.current?.getCurrentRoute?.();
      setCurrentTelemetryScreen(currentRoute?.name || "unknown");
    };
    
    // Handle ATT permission status changes - DOAR O DATĂ
    useEffect(() => {
      if (attStatus && languageLoaded && fontsLoaded && !isAdsReady) {
        console.log("ATT Status changed:", attStatus);
        
        // Initialize tracking services based on permission - DOAR O DATĂ
        initializeTrackingServices(hasTrackingPermission, setAdsConfig)
          .then((services) => {
            console.log("Tracking services initialized:", services.isPersonalized ? "Personalized" : "Non-personalized");
          })
          .catch((error) => {
            console.error("Failed to initialize tracking services:", error);
          });
      }
    }, [attStatus, languageLoaded, fontsLoaded, isAdsReady]); // Removed hasTrackingPermission and setAdsConfig to prevent loop
    
    // IMPORTANT: token upload should run INSIDE NavigationContainer to avoid useNavigation error
    const PushTokenUploader = () => {
      const { expoPushToken } = usePushNotifications();
      const tokenData = expoPushToken?.data;
      useEffect(() => {
        const uploadToken = async () => {
          try {
            if (!tokenData) return;
            const result = await upsertUserTokenMetadata(tokenData, {
              language,
              isIos: Platform.OS === "ios",
              projectId: Constants.expoConfig?.extra?.eas.projectId,
              source: "App.tsx:PushTokenUploader",
            });
            if (
              result &&
              !result.skipped &&
              (result.updated > 0 || result.created > 0)
            ) {
              console.log("Synced expo push token at startup to userTokens", result);
            }
          } catch (e) {
            console.error("Failed to upload expo push token at startup", e);
          }
        };
        uploadToken();
      }, [tokenData, language]);
      return null;
    };
    
    return (
      <NavigationContainer
        ref={navigationRef}
        onReady={syncTelemetryScreen}
        onStateChange={syncTelemetryScreen}
      >
        <PushNotificationsProvider>
          <StatusBar style="light" />
          <PushTokenUploader />
          <RootNavigation />
        </PushNotificationsProvider>
      </NavigationContainer>
    );
  };

  const handleRequestLocationPermission = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
    } catch (e) {
      console.log("error on handleRequestLocationPermission....", e);
    }
  };

  async function loadFonts() {
    await Font.loadAsync({
      Entypo: require("./assets/fonts/Entypo.ttf"),
      Lora: require("./assets/fonts/Lora/Lora-SemiBold.ttf"),
      LoraBold: require("./assets/fonts/Lora/Lora-Bold.ttf"),
    });
    setFontsLoaded(true);
  }
  
  useEffect(() => {
    loadFonts();

    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem("@userLanguage");
        if (savedLanguage !== null) {
          i18n.locale = savedLanguage;
        }
      } catch (e) {
        console.error("Failed to load the language from storage");
      }
      setLanguageLoaded(true);
    };

    loadLanguage();
    // handleRequestLocationPermission();
    
    // Request ATT permission after a short delay to ensure app is fully loaded
    const timer = setTimeout(() => {
      requestATTPermission();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Analytics could be logged here when both fonts and language are loaded
    if (languageLoaded && fontsLoaded) {
      console.log("Both language and fonts loaded - ready for analytics");
    }
  }, [languageLoaded, fontsLoaded]);

  // This useEffect is now moved inside AppContent component

  if (!languageLoaded || !fontsLoaded) {
    return (
      <ActivityIndicator />
    );
  }
  
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <NumberProvider>
          <ApiDataProvider>
            <LanguageProvider>
              <NavigationProvider>
                <NavBarVisibilityProvider>
                  <StripeProvider publishableKey="pk_live_51QA6KbFfPQUdD5PApH13dFiVdcrIcqIDRE0vDWVQRPApbE7DpAJDiHIYeeDDOMJwsUsqhvyRLayxXjEyErHLlm2O0015KzM92n">
                    <AuthProvider>
                      <AdsProvider>
                        <AppContent />
                      </AdsProvider>
                    </AuthProvider>
                  </StripeProvider>
                </NavBarVisibilityProvider>
              </NavigationProvider>
            </LanguageProvider>
          </ApiDataProvider>
        </NumberProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
};

export default App;

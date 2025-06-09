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
import { LanguageProvider } from "./src/context/LanguageContext";
import { ApiDataProvider } from "./src/context/ApiContext";
import store from "./Store";
import * as Font from "expo-font";
import { NumberProvider } from "./src/context/NumberContext";
import { StripeProvider } from "@stripe/stripe-react-native";
import { usePushNotifications } from "./src/hooks/usePushNotifications";
import { useAppTrackingTransparency } from "./src/hooks/useAppTrackingTransparency";
import { initializeTrackingServices } from "./src/utils/trackingUtils";

// ADS COMPLETELY REMOVED FOR DEBUGGING

const App = () => {
  const [notification, setNotification] = useState(false);
  const [languageLoaded, setLanguageLoaded] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const notificationListener = useRef(null);
  const responseListener = useRef(null);

  // App Tracking Transparency hook
  const { status: attStatus, hasPermission: hasTrackingPermission, requestPermission: requestATTPermission } = useAppTrackingTransparency();

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

  // Handle ATT permission status changes
  useEffect(() => {
    if (attStatus && languageLoaded && fontsLoaded) {
      console.log("ATT Status changed:", attStatus);
      
      // Initialize tracking services based on permission
      initializeTrackingServices(hasTrackingPermission)
        .then((services) => {
          console.log("Tracking services initialized:", services.isPersonalized ? "Personalized" : "Non-personalized");
        })
        .catch((error) => {
          console.error("Failed to initialize tracking services:", error);
        });
    }
  }, [attStatus, hasTrackingPermission, languageLoaded, fontsLoaded]);

  if (!languageLoaded || !fontsLoaded) {
    return (
      <ActivityIndicator />
    );
  }
  
  return (
    <ErrorBoundary>
      <NumberProvider>
        <ApiDataProvider>
          <LanguageProvider>
            <NavigationProvider>
              <NavBarVisibilityProvider>
                <StripeProvider publishableKey="pk_live_51QA6KbFfPQUdD5PApH13dFiVdcrIcqIDRE0vDWVQRPApbE7DpAJDiHIYeeDDOMJwsUsqhvyRLayxXjEyErHLlm2O0015KzM92n">
                  <AuthProvider>
                    <NavigationContainer>
                      <StatusBar style="light" />
                      <RootNavigation />
                    </NavigationContainer>
                  </AuthProvider>
                </StripeProvider>
              </NavBarVisibilityProvider>
            </NavigationProvider>
          </LanguageProvider>
        </ApiDataProvider>
      </NumberProvider>
    </ErrorBoundary>
  );
};

export default App;

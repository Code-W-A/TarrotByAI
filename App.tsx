import React, { useEffect, useRef, useState, status, createContext } from "react";
import RootNavigation from "./navigations";
import { screenName } from "./src/utils/screenName";
import { MenuProvider } from "react-native-popup-menu";
import { Provider } from "react-redux";
import { Platform, View, ImageBackground, TextComponent } from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  Paragraph,
  Text,
} from "react-native-paper";

import Geocoder from "react-native-geocoding";
import * as Location from "expo-location";

import * as Device from "expo-device";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";

import { langObj } from "./src/utils/labels";


// import messaging from '@react-native-firebase/messaging';

import Purchases, { PurchasesOffering } from "react-native-purchases";
// import Bugsnag from "@bugsnag/expo";
import { Mode } from "react-hook-form";
import i18n from "./i18n";
import {
  NavigationContainer,
  NavigationContext,
  useNavigation,
} from "@react-navigation/native";

import { ErrorView } from "./src/components/ErrorView";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HourClockProvider } from "./src/context/HourClockContext";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { NavBarVisibilityProvider } from "./src/context/NavbarVisibilityContext";
import { NavigationProvider } from "./src/context/NavigationContext";
import { LanguageProvider } from "./src/context/LanguageContext";
import { ApiDataProvider } from "./src/context/ApiContext";
import store from "./Store";
import * as Font from "expo-font";
import { NumberProvider } from "./src/context/NumberContext";

import { usePushNotifications } from "./src/hooks/usePushNotifications";


//---ADS---

import mobileAds from "react-native-google-mobile-ads";

mobileAds()
  .initialize()
  .then((adapterStatuses) => {
    console.log("Initialization of adds complete!");
    // Initialization complete!
  })
  .catch((err) => {
    console.log("Initialization of adds ERROR!", err);
  });



// AppOpenAd.createForAdRequest(TestIds.APP_OPEN);

// InterstitialAd.createForAdRequest(TestIds.INTERSTITIAL);

// RewardedAd.createForAdRequest(TestIds.REWARDED);

// Start BugSnag first...
// Bugsnag.start();


const App = () => {
 


  const [notification, setNotification] = useState(false);
  const [languageLoaded, setLanguageLoaded] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const notificationListener = useRef();
  const responseListener = useRef();

  // REVENUE CAT START -----------------------------------------------

  // const [currentOffering, setCurrentOffering] =
  // useState<PurchasesOffering | null>(null);

  // const APIKeys = {
  //   google: "goog_xdBhVfZFnrgNwtEvJFwAYfscpcu",
  // };

  // const fetchDataRevenueCat = async () => {
  //   try {
  //     const offerings = await Purchases.getOfferings();
  //     setCurrentOffering(offerings.current);
  //     console.log("our offerings...", offerings.all);
  //   } catch (error) {
  //     console.log("fetchDataRevenueCat...error....", error);
  //   }
  // };

  // const setupRevenueCat = async () => {
  //   try {
  //     Purchases.setDebugLogsEnabled(true);
  //     await Purchases.configure({ apiKey: APIKeys.google });
  //   } catch (err) {
  //     console.log("error on revenue cat config....", err);
  //   }
  // };

  // REVENUE CAT END -----------------------------------------------


  const handleRequestLocationPermission = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
    } catch (e) {
      // Bugsnag.notify("error on handleRequestLocationPermission....", e);
      console.log("error on handleRequestLocationPermission....", e);
    }
  };

  async function loadFonts() {
    await Font.loadAsync({
      Entypo: require("./assets/fonts/Entypo.ttf"),
      Lora: require("./assets/fonts/Lora/Lora-SemiBold.ttf"), // Asigură-te că calea este corectă
      LoraBold: require("./assets/fonts/Lora/Lora-Bold.ttf"), // Asigură-te că calea este corectă
      // adaugă aici alte fonturi după necesitate
    });
    setFontsLoaded(true); // Actualizează starea după încărcarea fonturilor
  }
  useEffect(() => {
    loadFonts();

    // setupRevenueCat();
    // fetchDataRevenueCat();
    // Bugsnag.notify(new Error("Test error"));

    // COMMENTED FOR WARNING

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

    // handleDevicePushTokeNotification();


    // COMMENTED FOR WARNING

    // handleRequestLocationPermission();




  }, []);

  useEffect(() => {
    // Asigură-te că evenimentul este logat numai după ce atât fonturile, cât și limba au fost încărcate
    // if (languageLoaded && fontsLoaded) {
    //   const logScreenView = async () => {
    //     await Analytics.logEvent("screen_view", {
    //       screen_name: "App enter",
    //     });
    //   };

    //   logScreenView().catch((error) => console.error(error));
    // }
  }, [languageLoaded, fontsLoaded]); // Dependențele efectului

  const Stack = createNativeStackNavigator();

  if (!languageLoaded || !fontsLoaded) {
    return (
      // Render a loading screen or spinner
      <ActivityIndicator />
    );
  }
  return (
    <>
      <NumberProvider>
        <ApiDataProvider>
          <LanguageProvider>
            <NavigationProvider>
              <NavBarVisibilityProvider>
                <AuthProvider>
        
                  <NavigationContainer>
                    <StatusBar style="light" />
                    <Provider store={store}>
                      <MenuProvider>
                        <RootNavigation />
                      </MenuProvider>
                    </Provider>
                  </NavigationContainer>
            
                </AuthProvider>
              </NavBarVisibilityProvider>
            </NavigationProvider>
          </LanguageProvider>
        </ApiDataProvider>
      </NumberProvider>
    </>
  );
};
export default App;

import { useState, useEffect, useRef, useContext } from "react";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

import Constants from "expo-constants";

import { Alert, Linking, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { screenName } from "../utils/screenName";
import { getVideoById } from "../features/video-library/services/videoLibrary.service";

export interface PushNotificationState {
  expoPushToken?: Notifications.ExpoPushToken;
  setExpoPushToken?: any;
  notification?: Notifications.Notification;
  registerForPushNotificationsAsync?: any;
  isGranted?: Boolean;
  openNotificationSettings?: any;
}

type RootStackParamList = {
  EcranAfirmatii: { title: string; body: string };
  // Adaugă aici alte rute dacă ai nevoie
};

// Tip pentru navigare
type EcranAfirmatiiNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "EcranAfirmatii"
>;

// Tip pentru ruta
type EcranAfirmatiiRouteProp = RouteProp<RootStackParamList, "EcranAfirmatii">;

export const usePushNotifications = (): PushNotificationState => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldShowAlert: true,
      shouldSetBadge: false,
    }),
  });

  const [expoPushToken, setExpoPushToken] = useState<
    Notifications.ExpoPushToken | undefined
  >();

  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >();

  const [isGranted, setIsGranted] = useState<any>(false);

  const navigation = useNavigation();

  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  const isPromptVisibleRef = useRef<boolean>(false);
  const hasSuppressedPromptRef = useRef<boolean>(false);

  const openNotificationSettings = () => {
    if (Platform.OS === "ios") {
      // Pentru iOS, deschide setările aplicației
      Linking.openURL("app-settings:");
    } else {
      // Pentru Android, deschide setările aplicației folosind openSettings()
      // Această metodă este disponibilă în versiunile mai noi de React Native
      Linking.openSettings().catch((err) =>
        console.error("An error occurred", err)
      );
    }
  };

  async function loadPromptSuppression() {
    try {
      const suppressed = await AsyncStorage.getItem("pushNotifPromptSuppressed");
      hasSuppressedPromptRef.current = suppressed === "true";
    } catch {}
  }

  async function setPromptSuppressed() {
    hasSuppressedPromptRef.current = true;
    try {
      await AsyncStorage.setItem("pushNotifPromptSuppressed", "true");
    } catch {}
  }

  function showPermissionAlertOnce() {
    if (isPromptVisibleRef.current || hasSuppressedPromptRef.current) {
      return;
    }
    isPromptVisibleRef.current = true;
    Alert.alert(
      "Notifications are stopped",
      "Do you want to activate notifications?",
      [
        {
          text: "No",
          onPress: () => {
            setPromptSuppressed();
            isPromptVisibleRef.current = false;
          },
          style: "cancel",
        },
        {
          text: "Activate",
          onPress: () => {
            openNotificationSettings();
            isPromptVisibleRef.current = false;
          },
        },
      ]
    );
  }

  async function registerForPushNotificationsAsync() {
    let token;
    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      console.log("status...", finalStatus);

      // Only request permissions automatically if status is undetermined
      if (existingStatus === "undetermined") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        showPermissionAlertOnce();
        setIsGranted(false);
        return;
      }
      setIsGranted(finalStatus == "granted");
      console.log("before token...");
      token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas.projectId,
      });
      console.log("after token...", token);
    } else {
      alert("Must be using a physical device for Push notifications");
    }

    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    return token;
  }

  useEffect(() => {
    loadPromptSuppression();
    registerForPushNotificationsAsync().then((token) => {
      setExpoPushToken(token);
    });

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(async (response) => {
        const data = response.notification.request.content.data as {
          type: string;
          nume?: string;
          descriere?: string;
          videoId?: string;
        };

            // Dacă există update disponibil, deschidem link-ul către Google Play
    if (data.info?.updateAvailable === true) {
      console.log("Update disponibil! Se redirecționează către Google Play Store...");
      Linking.openURL("https://play.google.com/store/apps/details?id=com.cristina.zurba.tarot&hl=ro");
      return;
    }
        if (data.type === "AfirmatiiPozitive") {
          console.log(
            "este afirmatie...se directioneaza catre ecran afirmatii..."
          );
          navigation.navigate("EcranAfirmatii", {
            title: data.nume,
            body: data.descriere,
          });
        }
        if (data.type === "NotificariHoroscop") {
          console.log(
            "este horoscop...se directioneaza catre ecran afirmatii..."
          );
          navigation.navigate("Learn");
        }
        if (data.type === "VideoPublished" && data.videoId) {
          const video = await getVideoById(data.videoId);
          if (video) {
            navigation.navigate(screenName.VideoPlayer, { video });
          }
        }
      });

    // Check if the app was opened from a notification
    Notifications.getLastNotificationResponseAsync().then(async (response) => {
      if (response) {
        const data = response.notification.request.content.data as {
          type: string;
          nume?: string;
          descriere?: string;
          videoId?: string;
        };
        if (data.info?.updateAvailable === true) {
          console.log("Update disponibil! Se redirecționează către Google Play Store...");
          Linking.openURL("https://play.google.com/store/apps/details?id=com.cristina.zurba.tarot&hl=ro");
          return;
        }
        if (data.type === "AfirmatiiPozitive") {
          navigation.navigate("EcranAfirmatii", {
            title: data.nume,
            body: data.descriere,
          });
        }
        if (data.type === "NotificariHoroscop") {
          navigation.navigate("Learn");
        }
        if (data.type === "VideoPublished" && data.videoId) {
          const video = await getVideoById(data.videoId);
          if (video) {
            navigation.navigate(screenName.VideoPlayer, { video });
          }
        }
      }
    });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current!
      );

      Notifications.removeNotificationSubscription(responseListener.current!);
    };
  }, []);

  return {
    expoPushToken,
    setExpoPushToken,
    notification,
    registerForPushNotificationsAsync,
    isGranted,
    openNotificationSettings,
  };
};

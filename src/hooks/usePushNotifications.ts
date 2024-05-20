import { useState, useEffect, useRef, useContext } from "react";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

import Constants from "expo-constants";

import { Alert, Linking, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";

export interface PushNotificationState {
  expoPushToken?: Notifications.ExpoPushToken;
  setExpoPushToken?:any;
  notification?: Notifications.Notification;
  registerForPushNotificationsAsync?:any;
  isGranted?:Boolean;
  openNotificationSettings?:any
}

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

  const [isGranted, setIsGranted] = useState<any>(false)

  const navigation = useNavigation()

  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  const openNotificationSettings = () => {
    if (Platform.OS === 'ios') {
      // Pentru iOS, deschide setările aplicației
      Linking.openURL('app-settings:');
    } else {
      // Pentru Android, deschide setările aplicației folosind openSettings()
      // Această metodă este disponibilă în versiunile mai noi de React Native
      Linking.openSettings().catch((err) => console.error('An error occurred', err));
    }
  };

  

  async function registerForPushNotificationsAsync() {
    let token;
    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      console.log("status...", finalStatus)

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        Alert.alert('Notifications are stopped', 'Do you want to activate notifications?', [
          {
            text: 'No',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
          },
          {text: 'Activate', onPress: () => openNotificationSettings()},
        ]);
        setIsGranted(false)
        return;
      }
      setIsGranted(finalStatus == "granted")
      console.log("before token...")
      token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas.projectId,
      });
      console.log("after token...", token)
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
    registerForPushNotificationsAsync().then((token) => {
      setExpoPushToken(token);
    });

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
        const data = response.notification.request.content.data;
        if (data.type === 'AfirmatiiPozitive') {
          console.log("got the data afirmatii pozitive....",data);
          navigation.navigate('EcranAfirmatii', {
            title: data.nume,
            body: data.descriere,
          });
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
    openNotificationSettings
  };
};
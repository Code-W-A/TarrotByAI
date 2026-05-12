import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Alert, AppState, Linking, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { screenName } from "../utils/screenName";
import { getVideoById } from "../features/video-library/services/videoLibrary.service";
import { syncPushTokenMetadataWithStoredLanguage } from "../utils/firestoreUtils";

const PROMPT_SUPPRESSED_KEY = "pushNotifPromptSuppressed";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldShowAlert: true,
    shouldSetBadge: false,
  }),
});

export interface PushNotificationState {
  expoPushToken?: Notifications.ExpoPushToken;
  setExpoPushToken?: React.Dispatch<
    React.SetStateAction<Notifications.ExpoPushToken | undefined>
  >;
  notification?: Notifications.Notification;
  registerForPushNotificationsAsync?: () => Promise<
    Notifications.ExpoPushToken | undefined
  >;
  isGranted?: boolean;
  openNotificationSettings?: () => void;
}

const PushNotificationsContext = createContext<PushNotificationState | null>(
  null
);

async function ensureAndroidDefaultChannel(): Promise<void> {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync("default", {
    name: "default",
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#FF231F7C",
  });
}

function getExpoProjectId(): string | undefined {
  const extra = Constants.expoConfig?.extra as
    | { eas?: { projectId?: string } }
    | undefined;
  return extra?.eas?.projectId;
}

export const PushNotificationsProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const navigation = useNavigation();
  const [expoPushToken, setExpoPushToken] = useState<
    Notifications.ExpoPushToken | undefined
  >();
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >();
  const [isGranted, setIsGranted] = useState(false);

  const isPromptVisibleRef = useRef(false);
  const hasSuppressedPromptRef = useRef(false);
  const sessionAlertShownRef = useRef(false);
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);
  const appStateRef = useRef(AppState.currentState);

  const loadPromptSuppression = useCallback(async () => {
    try {
      const suppressed = await AsyncStorage.getItem(PROMPT_SUPPRESSED_KEY);
      hasSuppressedPromptRef.current = suppressed === "true";
    } catch {
      /* ignore */
    }
  }, []);

  const setPromptSuppressed = useCallback(async () => {
    hasSuppressedPromptRef.current = true;
    try {
      await AsyncStorage.setItem(PROMPT_SUPPRESSED_KEY, "true");
    } catch {
      /* ignore */
    }
  }, []);

  const openNotificationSettings = useCallback(() => {
    if (Platform.OS === "ios") {
      Linking.openURL("app-settings:");
    } else {
      Linking.openSettings().catch((err) =>
        console.error("[PushNotifications] openSettings error", err)
      );
    }
  }, []);

  const registerForPushNotificationsAsync =
    useCallback(async (): Promise<Notifications.ExpoPushToken | undefined> => {
      await loadPromptSuppression();
      await ensureAndroidDefaultChannel();

      if (!Device.isDevice) {
        return undefined;
      }

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (finalStatus === "undetermined") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        setIsGranted(false);
        return undefined;
      }

      setIsGranted(true);
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: getExpoProjectId(),
      });
      setExpoPushToken(token);
      return token;
    }, [loadPromptSuppression]);

  useEffect(() => {
    let cancelled = false;

    const showPermissionAlertOnce = () => {
      if (
        isPromptVisibleRef.current ||
        hasSuppressedPromptRef.current ||
        sessionAlertShownRef.current
      ) {
        return;
      }
      sessionAlertShownRef.current = true;
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
    };

    const runInitialRegister = async () => {
      await loadPromptSuppression();
      await ensureAndroidDefaultChannel();

      if (!Device.isDevice) {
        return;
      }

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (finalStatus === "undetermined") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        if (!cancelled) {
          setIsGranted(false);
        }
        showPermissionAlertOnce();
        return;
      }

      if (!cancelled) {
        setIsGranted(true);
      }

      try {
        const token = await Notifications.getExpoPushTokenAsync({
          projectId: getExpoProjectId(),
        });
        if (!cancelled) {
          setExpoPushToken(token);
        }
        if (token?.data) {
          syncPushTokenMetadataWithStoredLanguage(token.data, {
            isIos: Platform.OS === "ios",
            projectId: getExpoProjectId(),
            source: "PushNotificationsProvider.initialRegister",
          }).catch(() => {});
        }
      } catch (e) {
        console.warn("[PushNotifications] getExpoPushTokenAsync failed", e);
      }
    };

    void runInitialRegister();

    notificationListener.current =
      Notifications.addNotificationReceivedListener((n) => {
      setNotification(n);
    });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(async (response) => {
        const data = response.notification.request.content.data as {
          type?: string;
          nume?: string;
          descriere?: string;
          videoId?: string;
          info?: { updateAvailable?: boolean };
        };

        if (data?.info?.updateAvailable === true) {
          Linking.openURL(
            "https://play.google.com/store/apps/details?id=com.cristina.zurba.tarot&hl=ro"
          );
          return;
        }
        if (data.type === "AfirmatiiPozitive") {
          (navigation as any).navigate("EcranAfirmatii", {
            title: data.nume,
            body: data.descriere,
          });
        }
        if (data.type === "NotificariHoroscop") {
          (navigation as any).navigate("Learn");
        }
        if (data.type === "VideoPublished" && data.videoId) {
          const video = await getVideoById(data.videoId);
          if (video) {
            (navigation as any).navigate(screenName.VideoPlayer, { video });
          }
        }
      });

    void Notifications.getLastNotificationResponseAsync().then(
      async (response) => {
        if (!response) return;
        const data = response.notification.request.content.data as {
          type?: string;
          nume?: string;
          descriere?: string;
          videoId?: string;
          info?: { updateAvailable?: boolean };
        };
        if (data?.info?.updateAvailable === true) {
          Linking.openURL(
            "https://play.google.com/store/apps/details?id=com.cristina.zurba.tarot&hl=ro"
          );
          return;
        }
        if (data.type === "AfirmatiiPozitive") {
          (navigation as any).navigate("EcranAfirmatii", {
            title: data.nume,
            body: data.descriere,
          });
        }
        if (data.type === "NotificariHoroscop") {
          (navigation as any).navigate("Learn");
        }
        if (data.type === "VideoPublished" && data.videoId) {
          const video = await getVideoById(data.videoId);
          if (video) {
            (navigation as any).navigate(screenName.VideoPlayer, { video });
          }
        }
      }
    );

    const sub = AppState.addEventListener("change", (next) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        next === "active"
      ) {
        void (async () => {
          const { status } = await Notifications.getPermissionsAsync();
          if (status === "granted") {
            setIsGranted(true);
            try {
              const token = await Notifications.getExpoPushTokenAsync({
                projectId: getExpoProjectId(),
              });
              setExpoPushToken(token);
              if (token?.data) {
                syncPushTokenMetadataWithStoredLanguage(token.data, {
                  isIos: Platform.OS === "ios",
                  projectId: getExpoProjectId(),
                  source: "PushNotificationsProvider.appStateActive",
                }).catch(() => {});
              }
            } catch {
              /* ignore */
            }
          } else {
            setIsGranted(false);
          }
        })();
      }
      appStateRef.current = next;
    });

    return () => {
      cancelled = true;
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
      sub.remove();
    };
  }, [
    loadPromptSuppression,
    navigation,
    openNotificationSettings,
    setPromptSuppressed,
  ]);

  const value = useMemo(
    () => ({
      expoPushToken,
      setExpoPushToken,
      notification,
      registerForPushNotificationsAsync,
      isGranted,
      openNotificationSettings,
    }),
    [
      expoPushToken,
      notification,
      registerForPushNotificationsAsync,
      isGranted,
      openNotificationSettings,
    ]
  );

  return (
    <PushNotificationsContext.Provider value={value}>
      {children}
    </PushNotificationsContext.Provider>
  );
};

export function usePushNotifications(): PushNotificationState {
  const ctx = useContext(PushNotificationsContext);
  if (!ctx) {
    throw new Error(
      "usePushNotifications must be used within PushNotificationsProvider"
    );
  }
  return ctx;
}

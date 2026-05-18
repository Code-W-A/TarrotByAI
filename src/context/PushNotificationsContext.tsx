import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppState, Linking, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { doc, updateDoc } from "firebase/firestore";
import { authentication, db } from "../../firebase";
import { screenName } from "../utils/screenName";
import { getVideoById } from "../features/video-library/services/videoLibrary.service";
import { syncPushTokenMetadataWithStoredLanguage } from "../utils/firestoreUtils";

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
  requestNotificationPermission?: () => Promise<boolean>;
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
  const expoPushTokenRef = useRef<Notifications.ExpoPushToken | undefined>(
    undefined
  );
  const lastResolvedTokenDataRef = useRef("");
  const lastSyncedUserExpoTokenRef = useRef<string>("");
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);
  const appStateRef = useRef(AppState.currentState);

  const setExpoPushTokenAndTrack = useCallback(
    (
      value: React.SetStateAction<Notifications.ExpoPushToken | undefined>
    ) => {
      setExpoPushToken((prev) => {
        const next = typeof value === "function" ? value(prev) : value;
        expoPushTokenRef.current = next;
        if (next?.data) {
          lastResolvedTokenDataRef.current = next.data;
        }
        return next;
      });
    },
    []
  );

  const openNotificationSettings = useCallback(() => {
    if (Platform.OS === "ios") {
      Linking.openURL("app-settings:");
    } else {
      Linking.openSettings().catch((err) =>
        console.error("[PushNotifications] openSettings error", err)
      );
    }
  }, []);

  const syncUserExpoTokenIfNeeded = useCallback(async (tokenData: string) => {
    const uid = authentication.currentUser?.uid;
    if (!uid || !tokenData) {
      return;
    }

    if (lastSyncedUserExpoTokenRef.current === tokenData) {
      return;
    }

    try {
      await updateDoc(doc(db, "Users", uid), {
        expoToken: tokenData,
      });
      lastSyncedUserExpoTokenRef.current = tokenData;
    } catch (error) {
      console.warn("[PushNotifications] failed to sync Users.expoToken", error);
    }
  }, []);

  const resolveTokenForGrantedPermission =
    useCallback(async (): Promise<Notifications.ExpoPushToken | undefined> => {
      if (
        expoPushTokenRef.current?.data &&
        expoPushTokenRef.current.data === lastResolvedTokenDataRef.current
      ) {
        return expoPushTokenRef.current;
      }

      try {
        const token = await Notifications.getExpoPushTokenAsync({
          projectId: getExpoProjectId(),
        });
        setExpoPushTokenAndTrack(token);
        if (token?.data) {
          await syncPushTokenMetadataWithStoredLanguage(token.data, {
            isIos: Platform.OS === "ios",
            projectId: getExpoProjectId(),
            source: "PushNotificationsProvider",
          });
          await syncUserExpoTokenIfNeeded(token.data);
        }
        return token;
      } catch (e) {
        console.warn("[PushNotifications] getExpoPushTokenAsync failed", e);
        return undefined;
      }
    }, [syncUserExpoTokenIfNeeded]);

  const registerForPushNotificationsAsync =
    useCallback(async (): Promise<Notifications.ExpoPushToken | undefined> => {
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
      return resolveTokenForGrantedPermission();
    }, [resolveTokenForGrantedPermission]);

  const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
    const token = await registerForPushNotificationsAsync();
    return Boolean(token?.data);
  }, [registerForPushNotificationsAsync]);

  useEffect(() => {
    let cancelled = false;

    const runInitialRegister = async () => {
      await ensureAndroidDefaultChannel();

      if (!Device.isDevice) {
        return;
      }

      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        if (!cancelled) {
          setIsGranted(false);
        }
        return;
      }

      if (!cancelled) {
        setIsGranted(true);
      }

      const token = await resolveTokenForGrantedPermission();
      if (!cancelled && token) {
        setExpoPushToken(token);
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
            const token = await resolveTokenForGrantedPermission();
            if (token) {
              setExpoPushToken(token);
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
    navigation,
    resolveTokenForGrantedPermission,
  ]);

  const value = useMemo(
    () => ({
      expoPushToken,
      setExpoPushToken: setExpoPushTokenAndTrack,
      notification,
      registerForPushNotificationsAsync,
      requestNotificationPermission,
      isGranted,
      openNotificationSettings,
    }),
    [
      expoPushToken,
      setExpoPushTokenAndTrack,
      notification,
      registerForPushNotificationsAsync,
      requestNotificationPermission,
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

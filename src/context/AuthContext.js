import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authentication } from "../../firebase";
import { handleGetUserInfo, handleGetUserInfoFromServer } from "../utils/handleFirebaseQuery";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAppOpenSuppressedForSubscriber } from "../utils/adsUtils";
import { hasPremiumAccess } from "../features/video-library/utils/premiumAccess";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGuestUser, setIsGuestUser] = useState(false); // Inițializat ca false

  const refreshUserData = useCallback(async () => {
    try {
      const userDataFromFirestore = await handleGetUserInfo();
      setUserData(userDataFromFirestore);
      return userDataFromFirestore;
    } catch (error) {
      console.error("Failed to refresh user data:", error);
      return null;
    }
  }, []);

  const refreshUserDataFromServer = useCallback(async () => {
    try {
      const userDataFromFirestore = await handleGetUserInfoFromServer();
      if (userDataFromFirestore) {
        setUserData(userDataFromFirestore);
      }
      return userDataFromFirestore;
    } catch (error) {
      console.error("Failed to refresh user data from server:", error);
      return null;
    }
  }, []);

  // Funcția pentru a seta utilizatorul ca guest user
  const setAsGuestUser = useCallback(async (isGuest) => {
    try {
      await AsyncStorage.setItem("isGuestUser", isGuest ? "true" : "false");
      setIsGuestUser(isGuest);
    } catch (e) {
      console.error("Failed to update isGuestUser in AsyncStorage:", e);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = authentication.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          await refreshUserData();
        } catch (error) {
          console.error("Failed to fetch user data:", error);
        }
      }
      setCurrentUser(user);

      try {
        const guestUserValue = await AsyncStorage.getItem("isGuestUser");
        // Setează isGuestUser ca true sau false bazat pe valoarea din AsyncStorage
        // Dacă valoarea nu există, va rămâne setat ca false
        setIsGuestUser(guestUserValue === "true");
      } catch (e) {
        console.error("Failed to fetch isGuestUser from AsyncStorage:", e);
        setIsGuestUser(false); // Setat ca false în cazul unei erori
      }

      setLoading(false);
    });

    return unsubscribe;
  }, [refreshUserData]);

  useEffect(() => {
    if (!currentUser) {
      setAppOpenSuppressedForSubscriber(false);
      return;
    }
    setAppOpenSuppressedForSubscriber(hasPremiumAccess(userData));
  }, [currentUser, userData]);

  const value = useMemo(
    () => ({
      currentUser,
      userData,
      loading,
      isGuestUser,
      setAsGuestUser,
      refreshUserData,
      refreshUserDataFromServer,
      setUserData,
      setCurrentUser,
    }),
    [
      currentUser,
      userData,
      loading,
      isGuestUser,
      setAsGuestUser,
      refreshUserData,
      refreshUserDataFromServer,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

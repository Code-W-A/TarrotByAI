import React, { createContext, useContext, useEffect, useState } from "react";
import { authentication } from "../../firebase";
import { handleGetUserInfo } from "../utils/handleFirebaseQuery";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGuestUser, setIsGuestUser] = useState(false); // Inițializat ca false

  // Funcția pentru a seta utilizatorul ca guest user
  const setAsGuestUser = async (isGuest) => {
    try {
      await AsyncStorage.setItem("isGuestUser", isGuest ? "true" : "false");
      setIsGuestUser(isGuest);
    } catch (e) {
      console.error("Failed to update isGuestUser in AsyncStorage:", e);
    }
  };

  useEffect(() => {
    const unsubscribe = authentication.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const userDataFromFirestore = await handleGetUserInfo();
          setUserData(userDataFromFirestore);
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
  }, []);

  const value = {
    currentUser,
    userData,
    loading,
    isGuestUser, // Includeți isGuestUser în context
    setAsGuestUser, // Expuși funcția prin context
    setUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

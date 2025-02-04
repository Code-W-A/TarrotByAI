// src/context/LanguageContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("ro");

  const changeLanguage = async (newLanguage) => {
    console.log("newLanguage...", newLanguage);
    setLanguage(newLanguage);
  };

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem("@userLanguage");
        if (savedLanguage) {
          setLanguage(savedLanguage);
        }
      } catch (e) {
        console.error("Failed to load the language from storage");
      }
    };

    loadLanguage();
  }, []);

  useEffect(() => {
    // ... codul existent ...
    console.log("Language in Context:", language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

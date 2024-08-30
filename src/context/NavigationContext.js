// src/context/NavigationContext.js
import React, { useState, createContext, useContext } from "react";

const NavigationContext = createContext();

export const useNavigationState = () => useContext(NavigationContext);

export const NavigationProvider = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState(null);

  return (
    <NavigationContext.Provider value={{ currentScreen, setCurrentScreen }}>
      {children}
    </NavigationContext.Provider>
  );
};

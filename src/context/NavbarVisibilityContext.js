// src/context/NavBarVisibilityContext.js
import React, { createContext, useState, useContext } from "react";

// Define the shape of the context data and its updater function
const defaultContextValue = {
  isNavBarVisible: true,
  setIsNavBarVisible: () => {},
};

// Create the context with a default value
const NavBarVisibilityContext = createContext(defaultContextValue);

// Hook to use the context
export const useNavBarVisibility = () => useContext(NavBarVisibilityContext);

// Provider component to wrap the part of the app that needs this context
export const NavBarVisibilityProvider = ({ children }) => {
  const [isNavBarVisible, setIsNavBarVisible] = useState(true);

  return (
    <NavBarVisibilityContext.Provider
      value={{ isNavBarVisible, setIsNavBarVisible }}
    >
      {children}
    </NavBarVisibilityContext.Provider>
  );
};

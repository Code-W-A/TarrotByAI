import React, { createContext, useState, useContext } from "react";

// Crearea contextului
const NumberContext = createContext();

// Exportați un hook personalizat pentru a folosi contextul
export const useNumberContext = () => useContext(NumberContext);

export const NumberProvider = ({ children }) => {
  const [currentNumber, setNumber] = useState(1);
  const [sendToHistory, setSendToHistory] = useState([]);

  // Funcție pentru actualizarea numărului
  const updateNumber = (newNumber) => {
    setNumber(newNumber);
  };

  return (
    <NumberContext.Provider
      value={{ currentNumber, updateNumber, sendToHistory, setSendToHistory }}
    >
      {children}
    </NumberContext.Provider>
  );
};

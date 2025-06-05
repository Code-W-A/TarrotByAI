import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Verifică dacă utilizatorul are toate datele complete în AsyncStorage
 * @returns {Promise<{hasAllData: boolean, userData: Object|null}>}
 */
export const checkUserDataCompleteness = async () => {
  try {
    const storedData = await AsyncStorage.getItem("userDetails");
    const parsedData = storedData ? JSON.parse(storedData) : null;
    
    const hasAllData = parsedData && 
                      parsedData.firstName && 
                      parsedData.lastName && 
                      parsedData.email && 
                      parsedData.phone;
    
    return {
      hasAllData: !!hasAllData,
      userData: parsedData
    };
  } catch (error) {
    console.error("Error checking user data completeness:", error);
    return {
      hasAllData: false,
      userData: null
    };
  }
};

/**
 * Navighează către Learn screen cu verificarea prealabilă a datelor utilizatorului
 * @param {Object} navigation - Navigation object din React Navigation
 * @param {Function} setModalVisible - Funcție pentru afișarea modal-ului de completare date
 * @param {Function} setModalCallback - Funcție pentru setarea callback-ului după completarea datelor
 * @param {Function} setFirstName - Funcție pentru setarea prenumelui în modal
 * @param {Function} setLastName - Funcție pentru setarea numelui în modal
 * @param {Function} setEmail - Funcție pentru setarea email-ului în modal
 * @param {Function} setPhone - Funcție pentru setarea telefonului în modal
 */
export const navigateToLearnWithCheck = async (
  navigation,
  setModalVisible,
  setModalCallback,
  setFirstName,
  setLastName,
  setEmail,
  setPhone
) => {
  const { hasAllData, userData } = await checkUserDataCompleteness();
  
  if (hasAllData) {
    // Toate datele sunt complete, navighează direct
    navigation.navigate("Learn");
  } else {
    // Datele lipsesc, afișează modal-ul
    // Pre-populează cu datele existente (dacă sunt)
    setFirstName(userData?.firstName || "");
    setLastName(userData?.lastName || "");
    setEmail(userData?.email || "");
    setPhone(userData?.phone || "");
    
    // Setează callback-ul să navigheze către Learn după completare
    setModalCallback(() => () => {
      navigation.navigate("Learn");
    });
    
    // Afișează modal-ul
    setModalVisible(true);
  }
};

/**
 * Versiune simplificată pentru componente care nu au modal-ul implementat
 * @param {Object} navigation - Navigation object din React Navigation
 * @returns {Promise<boolean>} - true dacă navigarea a avut loc, false dacă datele lipsesc
 */
export const navigateToLearnSimple = async (navigation) => {
  const { hasAllData } = await checkUserDataCompleteness();
  
  if (hasAllData) {
    navigation.navigate("Learn");
    return true;
  } else {
    // Poate afișa o alertă sau redirecționa către un alt screen pentru completarea datelor
    console.warn("User data incomplete. Cannot navigate to Learn screen.");
    return false;
  }
}; 
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
 * Verifică dacă utilizatorul are datele astrologice complete pentru astrograma natală
 * @returns {Promise<{hasAstroData: boolean, astroData: Object|null}>}
 */
export const checkAstroDataCompleteness = async () => {
  try {
    const userData = await AsyncStorage.getItem("userData");
    const parsedData = userData ? JSON.parse(userData) : null;
    
    // Verifică dacă există datele esențiale pentru astrograma natală
    const hasAstroData = parsedData && 
                        parsedData.full_name && 
                        parsedData.selectedDate && 
                        parsedData.selectedTime && 
                        parsedData.place && 
                        parsedData.lat && 
                        parsedData.lon &&
                        parsedData.natalData &&
                        parsedData.ascendantData &&
                        parsedData.generalSignTextData &&
                        parsedData.generalHouseTextData;
    
    return {
      hasAstroData: !!hasAstroData,
      astroData: parsedData
    };
  } catch (error) {
    console.error("Error checking astro data completeness:", error);
    return {
      hasAstroData: false,
      astroData: null
    };
  }
};

/**
 * Navighează către Learn screen cu verificarea prealabilă a datelor utilizatorului și astrologice
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
  const { hasAstroData, astroData } = await checkAstroDataCompleteness();
  
  console.log("🔍 navigateToLearnWithCheck - Verificare date:");
  console.log("📱 hasAllData (userDetails):", hasAllData);
  console.log("⭐ hasAstroData (userData astro):", hasAstroData);
  
  // PRIMA VERIFICARE: Datele utilizatorului (firstName, lastName, email, phone)
  if (!hasAllData) {
    console.log("⚠️ Datele utilizatorului lipsesc - afișare MoreInfoModal");
    // Pre-populează cu datele existente (dacă sunt)
    setFirstName(userData?.firstName || "");
    setLastName(userData?.lastName || "");
    setEmail(userData?.email || "");
    setPhone(userData?.phone || "");
    
    // Setează callback-ul să verifice din nou datele astrologice după completare
    setModalCallback(() => async () => {
      // După completarea datelor utilizatorului, verifică din nou datele astrologice
      const { hasAstroData: hasAstroDataAfter } = await checkAstroDataCompleteness();
      
      if (!hasAstroDataAfter) {
        console.log("🔄 Datele astrologice lipsesc - navigare către Name screen");
        navigation.navigate("Name");
      } else {
        console.log("✅ Toate datele sunt complete după modal - navigare către Learn screen");
        navigation.navigate("Learn");
      }
    });
    
    // Afișează modal-ul
    setModalVisible(true);
    return;
  }
  
  // A DOUA VERIFICARE: Datele astrologice (dacă datele utilizatorului sunt complete)
  if (!hasAstroData) {
    console.log("🔄 Datele astrologice lipsesc - navigare către Name screen");
    navigation.navigate("Name");
    return;
  }
  
  // Toate datele sunt complete, navighează direct la Learn
  console.log("✅ Toate datele sunt complete - navigare către Learn screen");
  navigation.navigate("Learn");
};

/**
 * Versiune simplificată pentru componente care nu au modal-ul implementat
 * @param {Object} navigation - Navigation object din React Navigation
 * @returns {Promise<boolean>} - true dacă navigarea a avut loc, false dacă datele lipsesc
 */
export const navigateToLearnSimple = async (navigation) => {
  const { hasAllData } = await checkUserDataCompleteness();
  const { hasAstroData } = await checkAstroDataCompleteness();
  
  console.log("🔍 navigateToLearnSimple - Verificare date:");
  console.log("📱 hasAllData (userDetails):", hasAllData);
  console.log("⭐ hasAstroData (userData astro):", hasAstroData);
  
  // PRIMA VERIFICARE: Datele utilizatorului
  if (!hasAllData) {
    console.warn("⚠️ User data incomplete. Cannot navigate without MoreInfoModal.");
    return false;
  }
  
  // A DOUA VERIFICARE: Datele astrologice
  if (!hasAstroData) {
    console.log("🔄 Datele astrologice lipsesc - navigare către Name screen");
    navigation.navigate("Name");
    return true;
  }
  
  // Toate datele sunt complete
  console.log("✅ Toate datele sunt complete - navigare către Learn screen");
  navigation.navigate("Learn");
  return true;
}; 
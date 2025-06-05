import { useState, useCallback } from 'react';
import { navigateToLearnWithCheck } from '../utils/userDataUtils';

/**
 * Hook personalizat pentru gestionarea verificării datelor utilizatorului
 * și afișarea modal-ului MoreInfoModal
 */
export const useUserDataModal = (navigation) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalCallback, setModalCallback] = useState(null);

  /**
   * Navighează către Learn screen cu verificarea prealabilă a datelor
   */
  const navigateToLearn = useCallback(async () => {
    await navigateToLearnWithCheck(
      navigation,
      setModalVisible,
      setModalCallback,
      setFirstName,
      setLastName,
      setEmail,
      setPhone
    );
  }, [navigation]);

  /**
   * Funcție de confirmare pentru modal
   */
  const handleModalConfirm = useCallback(async (firstName, lastName, email, phone) => {
    const userDetails = { firstName, lastName, email, phone };

    try {
      // Salvează datele local în AsyncStorage
      const AsyncStorage = await import('@react-native-async-storage/async-storage').then(m => m.default);
      await AsyncStorage.setItem("userDetails", JSON.stringify(userDetails));

      // Actualizează state-ul local
      setFirstName(firstName);
      setLastName(lastName);
      setEmail(email);
      setPhone(phone);

      console.log("Datele au fost actualizate cu succes.");
    } catch (error) {
      console.error("Eroare la salvarea datelor în AsyncStorage:", error);
    }
  }, []);

  /**
   * Callback-ul care se execută după închiderea modal-ului
   */
  const onCompleteCallback = useCallback(() => {
    if (modalCallback) {
      modalCallback();
      setModalCallback(null); // Reset callback
    }
  }, [modalCallback]);

  return {
    // State pentru modal
    firstName,
    setFirstName,
    lastName,
    setLastName,
    email,
    setEmail,
    phone,
    setPhone,
    isModalVisible,
    setModalVisible,
    
    // Funcții
    navigateToLearn,
    handleModalConfirm,
    onCompleteCallback,
  };
}; 
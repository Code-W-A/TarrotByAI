import React, { useState } from "react";
import { Modal, Text, StyleSheet, View, TextInput, Alert } from "react-native";
import PhoneInput, { ICountry } from "react-native-international-phone-number";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button } from "../../../components/commonButton";
import { colors } from "../../../utils/colors";
import { useTranslation } from "../../../utils/translateUtil";
import { useLanguage } from "../../../context/LanguageContext";

const PurchaseModal = ({
  visible,
  onDismiss,
  onConfirm,
  email,
  setEmail,
  phone,
  setPhone,
  firstName,
  setFirstName,
  lastName,
  setLastName,
}) => {
  const [emailError, setEmailError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const { language, changeLanguage, userData, setUserData } = useLanguage();

  const validateFields = () => {
    let valid = true;

    if (!firstName || !lastName) {
      setNameError(true);
      valid = false;
    } else {
      setNameError(false);
    }

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setEmailError(true);
      valid = false;
    } else {
      setEmailError(false);
    }

    if (!phone || phone.length < 9) {
      setPhoneError(true);
      valid = false;
    } else {
      setPhoneError(false);
    }

    return valid;
  };

  const handleConfirm = async () => {
    if (validateFields()) {
      try {
        const updatedUserDetails = {
          firstName,
          lastName,
          email,
          phone,
        };

        // Actualizează datele în AsyncStorage
        await AsyncStorage.setItem(
          "userDetails",
          JSON.stringify(updatedUserDetails)
        );

        onConfirm(firstName, lastName, email, phone);
        onDismiss();
      } catch (error) {
        Alert.alert(
          "Eroare",
          "A apărut o problemă la actualizarea datelor. Te rugăm să încerci din nou."
        );
      }
    }
  };

  //traducere inline text

  const AchiziționatText = useTranslation(
    "Achiziționat",
    language,
    "PurchaseModal"
  );
  const NeachiziționatText = useTranslation(
    "Anuleaza",
    language,
    "PurchaseModal"
  );
  const completeazaInfoText = useTranslation(
    "Completează informațiile",
    language,
    "PurchaseModal"
  );
  const completeazaInfoText2 = useTranslation(
    "Te rugăm să completezi prenumele și numele.",
    language,
    "PurchaseModal"
  );
  const completeazaInfoText3 = useTranslation(
    "Te rugăm să introduci un email valid.",
    language,
    "PurchaseModal"
  );
  const completeazaInfoText4 = useTranslation(
    "Număr de telefon.",
    language,
    "PurchaseModal"
  );
  const completeazaInfoText5 = useTranslation(
    "Te rugăm să introduci un număr de telefon valid.",
    language,
    "PurchaseModal"
  );
  //traducere inline text

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="slide"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{completeazaInfoText}:</Text>

          <TextInput
            style={[styles.input, nameError ? styles.errorInput : null]}
            placeholder="Prenume"
            value={firstName}
            onChangeText={(text) => {
              setFirstName(text);
              setNameError(false);
            }}
          />
          <TextInput
            style={[styles.input, nameError ? styles.errorInput : null]}
            placeholder="Nume"
            value={lastName}
            onChangeText={(text) => {
              setLastName(text);
              setNameError(false);
            }}
          />
          {nameError && (
            <Text style={styles.errorText}>{completeazaInfoText2}</Text>
          )}

          <TextInput
            style={[styles.input, emailError ? styles.errorInput : null]}
            placeholder="Email"
            keyboardType="email-address"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setEmailError(false);
            }}
          />
          {emailError && (
            <Text style={styles.errorText}>{completeazaInfoText3}</Text>
          )}

          <View style={styles.phoneInputContainer}>
            <PhoneInput
              value={phone}
              onChangePhoneNumber={setPhone}
              selectedCountry={selectedCountry}
              onChangeSelectedCountry={setSelectedCountry}
              defaultCountry="RO"
              placeholder={completeazaInfoText4}
              containerStyle={[
                styles.input,
                phoneError ? styles.errorInput : null,
              ]}
            />
            {phoneError && (
              <Text style={styles.errorText}>{completeazaInfoText5}</Text>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <Button
              disabled={false}
              funCallback={handleConfirm}
              label={AchiziționatText}
              success={true}
              bgColor={colors.primary3}
              borderColor={colors.white}
              borderWidth={0.2}
              txtColor={colors.white}
            />
            <Button
              disabled={false}
              funCallback={onDismiss}
              label={NeachiziționatText}
              success={true}
              bgColor={colors.primary3}
              borderColor={colors.primary3}
              borderWidth={0.2}
              txtColor={colors.white}
              style={{ marginTop: "6%" }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)", // Fundal întunecat și opac
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%", // Aproape de lățimea totală
    height: "80%", // Ocupă o mare parte a ecranului
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    elevation: 10,
    justifyContent: "space-between", // Elementele sunt distribuite uniform
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 10,
    textAlign: "center",
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    fontSize: 16,
    width: "100%",
  },
  phoneInputContainer: {
    marginVertical: 10,
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginTop: 5,
  },
  errorInput: {
    borderColor: "red",
  },
  buttonContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
});

export default PurchaseModal;

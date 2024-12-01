import React, { useState } from "react";
import { Modal, Text, StyleSheet, View, TextInput } from "react-native";
import { Button } from "../../../components/commonButton";
import PhoneInput, { ICountry } from "react-native-international-phone-number";
import { colors } from "../../../utils/colors";

interface MoreInfoModalProps {
  visible: boolean;
  onDismiss: () => void;
  onConfirm: (
    firstName: string,
    lastName: string,
    email: string,
    phone: string
  ) => void;
  email: string;
  setEmail: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  firstName: string;
  setFirstName: (value: string) => void;
  lastName: string;
  setLastName: (value: string) => void;
}

const MoreInfoModal: React.FC<MoreInfoModalProps> = ({
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
  const [selectedCountry, setSelectedCountry] = useState<null | ICountry>(null);

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

    if (!phone) {
      setPhoneError(true);
      valid = false;
    } else {
      setPhoneError(false);
    }

    return valid;
  };

  const handlePhoneChange = (phoneNumber: string) => {
    setPhone(phoneNumber);
    if (phoneNumber.length > 0) {
      setPhoneError(false);
    } else {
      setPhoneError(true);
    }
  };

  const handleSelectedCountry = (country: ICountry) => {
    setSelectedCountry(country);
    console.log("Țara selectată:", country.name.en, country.callingCode);
  };

  const handleConfirm = () => {
    if (validateFields()) {
      onConfirm(firstName, lastName, email, phone);
      onDismiss();
    }
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="slide"
      onRequestClose={() => {
        // Nu facem nimic pentru a preveni închiderea la apăsarea butonului back
      }}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Completează informațiile:</Text>

          <TextInput
            style={[styles.input, nameError ? styles.errorInput : null]}
            placeholder="Introdu numele"
            value={firstName}
            onChangeText={(text) => {
              setFirstName(text);
              if (nameError) setNameError(false);
            }}
          />
          <TextInput
            style={[styles.input, nameError ? styles.errorInput : null]}
            placeholder="Introdu prenumele"
            value={lastName}
            onChangeText={(text) => {
              setLastName(text);
              if (nameError) setNameError(false);
            }}
          />
          {nameError && (
            <Text style={styles.errorText}>
              Te rugăm să completezi numele și prenumele.
            </Text>
          )}

          <TextInput
            style={[styles.input, emailError ? styles.errorInput : null]}
            placeholder="Introdu email-ul"
            keyboardType="email-address"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (emailError) setEmailError(false);
            }}
          />
          {emailError && (
            <Text style={styles.errorText}>
              Te rugăm să introduci un email valid.
            </Text>
          )}

          <View style={styles.phoneInputContainer}>
            <PhoneInput
              value={phone}
              onChangePhoneNumber={handlePhoneChange}
              selectedCountry={selectedCountry}
              onChangeSelectedCountry={handleSelectedCountry}
              defaultCountry="RO"
              placeholder="Introdu numărul de telefon"
              containerStyle={[
                styles.input,
                phoneError ? styles.errorInput : null,
              ]}
            />
            {phoneError && (
              <Text style={styles.errorText}>
                Te rugăm să introduci un număr de telefon valid.
              </Text>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <Button
              disabled={false}
              funCallback={handleConfirm}
              label={"Actualizează Info"} // Text modificat
              success={true}
              bgColor={colors.primary3}
              borderColor={colors.white}
              borderWidth={0.2}
              txtColor={colors.white}
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 0,
    padding: 20,
    elevation: 10,
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
    fontSize: 16,
    width: "100%",
  },
  phoneInputContainer: {
    marginVertical: 10,
    width: "100%",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 10,
    marginBottom: 15,
  },
  errorInput: {
    borderColor: "red",
  },
  buttonContainer: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "center",
  },
});

export default MoreInfoModal;

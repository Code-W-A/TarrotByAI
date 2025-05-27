import React, { useState } from "react";
import {
  Modal,
  Text,
  StyleSheet,
  View,
  TextInput,
  Alert,
  ScrollView,
  TouchableOpacity, // Importăm ScrollView
} from "react-native";
import PhoneInput from "react-native-international-phone-number";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button } from "../../../components/commonButton";
import { colors } from "../../../utils/colors";
import { useTranslation } from "../../../utils/translateUtil";
import { useLanguage } from "../../../context/LanguageContext";
import { Checkbox } from "react-native-paper";

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
  line1,
  setLine1,
  city,
  setCity,
  postalCode,
  setPostalCode,
  country,
  setCountry,
}) => {
  const [emailError, setEmailError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [addressError, setAddressError] = useState(false);

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [termsError, setTermsError] = useState(false);

  const [isChecked, setIsChecked] = useState(false);
  const [termsVisible, setTermsVisible] = useState(false); // Modal pentru Terms & Conditions

  const [selectedCountry, setSelectedCountry] = useState(null);

  const { language } = useLanguage();

  // Funcție de validare simplă
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

    if (!line1 || !city || !country) {
      setAddressError(true);
      valid = false;
    } else {
      setAddressError(false);
    }

    if (!isChecked) {
      Alert.alert(
        "Terms & Conditions",
        "You must accept the Terms & Conditions to proceed."
      );
      valid = false;
    }

    return valid;
  };

  const handleConfirm = async () => {
    if (validateFields()) {
      try {
        // Datele introduse de user
        const updatedUserDetails = {
          firstName,
          lastName,
          email,
          phone,
          line1,
          city,
          postalCode,
          country,
        };

        // Salvăm local, dacă dorim
        await AsyncStorage.setItem(
          "userDetails",
          JSON.stringify(updatedUserDetails)
        );

        onConfirm(updatedUserDetails);
        onDismiss();
      } catch (error) {
        Alert.alert(
          "Eroare",
          "A apărut o problemă la actualizarea datelor. Te rugăm să încerci din nou."
        );
      }
    }
  };

  // Traduceri inline text
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
  const completeazaInfoText6 = useTranslation(
    "Te rugăm să completezi toate câmpurile de adresă.",
    language,
    "PurchaseModal"
  );
  const termsText1 = useTranslation(
    "By purchasing this analysis, you accept the",
    language,
    "PurchaseModal"
  );
  const termsText2 = useTranslation(
    "Terms & Conditions",
    language,
    "PurchaseModal"
  );

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        {/* ScrollView ca să permită derularea dacă e prea mult conținut */}
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.modalContainerCustom}>
            <Text style={styles.modalTitleCustom}>{completeazaInfoText}:</Text>

            {/* NUME */}
            <TextInput
              style={[styles.inputCustom, nameError && styles.errorInputCustom]}
              placeholder="Prenume"
              value={firstName}
              onChangeText={(text) => {
                setFirstName(text);
                setNameError(false);
              }}
            />
            <TextInput
              style={[styles.inputCustom, nameError && styles.errorInputCustom]}
              placeholder="Nume"
              value={lastName}
              onChangeText={(text) => {
                setLastName(text);
                setNameError(false);
              }}
            />
            {nameError && (
              <Text style={styles.errorTextCustom}>{completeazaInfoText2}</Text>
            )}

            {/* EMAIL */}
            <TextInput
              style={[styles.inputCustom, emailError && styles.errorInputCustom]}
              placeholder="Email"
              keyboardType="email-address"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setEmailError(false);
              }}
            />
            {emailError && (
              <Text style={styles.errorTextCustom}>{completeazaInfoText3}</Text>
            )}

            {/* TELEFON */}
            <View style={styles.phoneInputContainerCustom}>
              <PhoneInput
                value={phone}
                onChangePhoneNumber={setPhone}
                selectedCountry={selectedCountry}
                onChangeSelectedCountry={setSelectedCountry}
                defaultCountry="RO"
                placeholder={completeazaInfoText4}
                containerStyle={[styles.inputCustom, phoneError && styles.errorInputCustom]}
              />
              {phoneError && (
                <Text style={styles.errorTextCustom}>{completeazaInfoText5}</Text>
              )}
            </View>

            {/* ADRESĂ */}
            <TextInput
              style={[styles.inputCustom, addressError && styles.errorInputCustom]}
              placeholder="Strada și numărul (line1)"
              value={line1}
              onChangeText={(text) => {
                setLine1(text);
                setAddressError(false);
              }}
            />
            <TextInput
              style={[styles.inputCustom, addressError && styles.errorInputCustom]}
              placeholder="Oraș"
              value={city}
              onChangeText={(text) => {
                setCity(text);
                setAddressError(false);
              }}
            />
            {/* <TextInput
              style={[styles.input, addressError && styles.errorInput]}
              placeholder="Cod Poștal"
              keyboardType="numbers-and-punctuation"
              value={postalCode}
              onChangeText={(text) => {
                setPostalCode(text);
                setAddressError(false);
              }}
            /> */}
            <TextInput
              style={[styles.inputCustom, addressError && styles.errorInputCustom]}
              placeholder="Țară"
              value={country}
              onChangeText={(text) => {
                setCountry(text);
                setAddressError(false);
              }}
            />
            {addressError && (
              <Text style={styles.errorTextCustom}>{completeazaInfoText6}</Text>
            )}

            <View style={styles.checkboxContainerCustom}>
              <Checkbox
                status={isChecked ? "checked" : "unchecked"}
                onPress={() => setIsChecked(!isChecked)}
                color={colors.primary3}
              />

              <TouchableOpacity onPress={() => setTermsVisible(true)}>
                <Text style={styles.termsTextCustom}>
                  {termsText1}{" "}
                  <Text style={styles.termsLinkCustom}>{termsText2}</Text>
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.buttonContainerCustom}>
              <Button
                disabled={!isChecked} // Butonul este activ doar dacă checkbox-ul e bifat
                funCallback={handleConfirm}
                label={AchiziționatText}
                success={true}
                bgColor={isChecked ? colors.primary3 : "#ccc"} // Culoare gri dacă nu e bifat
                borderColor={colors.white}
                borderWidth={0.2}
                txtColor={colors.white}
                style={styles.btnMargin}
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
              />
            </View>
          </View>
        </ScrollView>

        <Modal
          transparent
          visible={termsVisible}
          animationType="slide"
          onRequestClose={() => setTermsVisible(false)}
        >
          <View style={styles.overlay}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
              <View style={styles.modalContainerCustom}>
                <Text style={styles.modalTitleCustom}>Terms & Conditions</Text>
                <Text style={styles.termsContentCustom}>
                  - By completing a purchase, you agree to the processing of
                  your personal data in accordance with our Privacy Policy and
                  applicable laws.
                  {"\n\n"}- Your email and phone number are collected solely for
                  the purpose of order confirmation, service delivery, and
                  customer support.
                  {"\n\n"}- We do not share your personal data with third
                  parties unless required by law or necessary for payment
                  processing and order fulfillment.
                  {"\n\n"}- Payments are processed securely through encrypted
                  channels. Refunds and cancellations are subject to our Refund
                  Policy.
                  {"\n\n"}- GDPR Compliance: You have the right to access,
                  modify, delete, or restrict the processing of your personal
                  data. You can exercise these rights by contacting our support
                  team.
                </Text>

                <Button
                  funCallback={() => setTermsVisible(false)}
                  label="Close"
                />
              </View>
            </ScrollView>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

export default PurchaseModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContainerCustom: {
    backgroundColor: '#FAF7F2',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#FFD700',
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  modalTitleCustom: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFD700',
    fontFamily: 'Lora',
    marginBottom: 18,
    textAlign: 'center',
  },
  inputCustom: {
    backgroundColor: '#fffbe6',
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    fontFamily: 'Lora',
    color: '#131523',
    fontSize: 15,
  },
  errorInputCustom: {
    borderColor: '#d9534f',
    backgroundColor: '#fff0f0',
  },
  errorTextCustom: {
    color: '#d9534f',
    fontSize: 13,
    marginBottom: 6,
    fontFamily: 'Lora',
  },
  phoneInputContainerCustom: {
    marginBottom: 10,
  },
  checkboxContainerCustom: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  termsTextCustom: {
    fontSize: 14,
    color: '#131523',
    fontFamily: 'Lora',
  },
  termsLinkCustom: {
    color: '#FFD700',
    textDecorationLine: 'underline',
    fontWeight: '700',
    fontFamily: 'Lora',
  },
  buttonContainerCustom: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
    marginTop: 18,
    gap: 10,
  },
  termsContentCustom: {
    fontSize: 14,
    marginVertical: 10,
    color: '#131523',
    fontFamily: 'Lora',
    textAlign: 'left',
  },
  btnMargin: {
    marginBottom: 10,
  },
});

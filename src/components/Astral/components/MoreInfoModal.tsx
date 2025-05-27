import React, { useState } from "react";
import { Modal, Text, StyleSheet, View, TextInput } from "react-native";
import { Button } from "../../../components/commonButton";
import PhoneInput, { ICountry } from "react-native-international-phone-number";
import { colors } from "../../../utils/colors";
import { useTranslation } from "../../../utils/translateUtil";
import { useLanguage } from "../../../context/LanguageContext";
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';

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

  //traducere inline text

  const introduEmailText = useTranslation(
    "Introdu E-mail",
    language,
    "MoreInfoModal"
  );
  const introduNumeleText = useTranslation(
    "Introdu Nume",
    language,
    "MoreInfoModal"
  );
  const introduPrenumeleText = useTranslation(
    "Introdu Prenumele",
    language,
    "MoreInfoModal"
  );
  const ActualizeazaInfoText = useTranslation(
    "Actualizează Informatii",
    language,
    "MoreInfoModal"
  );
  const completeazaInfoText = useTranslation(
    "Completează informațiile",
    language,
    "MoreInfoModal"
  );
  const completeazaInfoText2 = useTranslation(
    "Te rugăm să completezi prenumele și numele.",
    language,
    "MoreInfoModal"
  );
  const completeazaInfoText3 = useTranslation(
    "Te rugăm să introduci un email valid.",
    language,
    "MoreInfoModal"
  );
  const completeazaInfoText4 = useTranslation(
    "Număr de telefon.",
    language,
    "MoreInfoModal"
  );
  const completeazaInfoText5 = useTranslation(
    "Te rugăm să introduci un număr de telefon valid.",
    language,
    "MoreInfoModal"
  );
  //traducere inline text

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="slide"
      onRequestClose={() => {
        // Nu facem nimic pentru a preveni închiderea la apăsarea butonului back
      }}
    >
      <LinearGradient
        colors={["#fffbe6", "#f7e7ce", "#e7c585"]}
        style={styles.gradientBg}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{completeazaInfoText}:</Text>

            <View style={styles.inputWrapper}>
              <Feather name="user" size={20} color={colors.gold} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, nameError ? styles.errorInput : null]}
            placeholder={introduNumeleText}
            value={firstName}
            onChangeText={(text) => {
              setFirstName(text);
              if (nameError) setNameError(false);
            }}
                placeholderTextColor="#bfa76a"
          />
            </View>
            <View style={styles.inputWrapper}>
              <Feather name="user-check" size={20} color={colors.gold} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, nameError ? styles.errorInput : null]}
            placeholder={introduPrenumeleText}
            value={lastName}
            onChangeText={(text) => {
              setLastName(text);
              if (nameError) setNameError(false);
            }}
                placeholderTextColor="#bfa76a"
          />
            </View>
          {nameError && (
            <Text style={styles.errorText}>{completeazaInfoText2}</Text>
          )}

            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons name="email-outline" size={20} color={colors.gold} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, emailError ? styles.errorInput : null]}
            placeholder={introduEmailText}
            keyboardType="email-address"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (emailError) setEmailError(false);
            }}
                placeholderTextColor="#bfa76a"
          />
            </View>
          {emailError && (
            <Text style={styles.errorText}>{completeazaInfoText3}</Text>
          )}

              <View style={styles.phoneInputContainer}>
                <PhoneInput
                  value={phone}
                  onChangePhoneNumber={handlePhoneChange}
                  selectedCountry={selectedCountry}
                  onChangeSelectedCountry={handleSelectedCountry}
                  defaultCountry="RO"
                  placeholder={completeazaInfoText4}
                  style={{ width: '100%' }}
                  containerStyle={{ width: '100%' }}
                />
              </View>
      
            {phoneError && (
              <Text style={styles.errorText}>{completeazaInfoText5}</Text>
            )}

          <View style={styles.buttonContainer}>
              <LinearGradient
                colors={[colors.gold, colors.gold]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.buttonGradient}
              >
            <Button
              disabled={false}
              funCallback={handleConfirm}
                  label={ActualizeazaInfoText}
              success={true}
                  bgColor="transparent"
                  borderColor={colors.gold}
                  borderWidth={0}
                  txtColor={"#222"}
            />
              </LinearGradient>
            </View>
          </View>
        </View>
      </LinearGradient>
    </Modal>
  );
};

const styles = StyleSheet.create({
  gradientBg: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    padding: 24,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    marginBottom: 18,
    textAlign: 'center',
    fontWeight: 'bold',
    color: colors.gold,
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.gold,
    marginVertical: 7,
    paddingHorizontal: 10,
    width: '100%',
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    borderWidth: 0,
    borderColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
    fontSize: 16,
    color: colors.gold,
    backgroundColor: 'transparent',
  },
  phoneInputContainer: {
    width: '100%',
    marginVertical: 7,
    flex: 1,
    marginBottom: 60,
  },
  errorText: {
    color: '#d9534f',
    fontSize: 12,
    marginTop: 2,
    marginBottom: 8,
    alignSelf: 'flex-start',
    marginLeft: 8,
  },
  errorInput: {
    borderColor: '#d9534f',
  },
  buttonContainer: {
    marginTop: 24,
    width: '100%',
    alignItems: 'center',
  },
  buttonGradient: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
});

export default MoreInfoModal;

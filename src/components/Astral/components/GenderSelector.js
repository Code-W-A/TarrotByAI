import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { colors } from "../../../utils/colors";
import i18n from "../../../../i18n";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const GenderSelector = ({ setGender, gender, style }) => {
  const genderOptions = [
    { value: "male", label: i18n.translate("Masculin"), icon: "gender-male" },
    {
      value: "female",
      label: i18n.translate("Feminin"),
      icon: "gender-female",
    },
    {
      value: "other",
      label: i18n.translate("Altul"),
      icon: "gender-male-female",
    },
  ];

  return (
    <View style={[styles.genderContainer, style]}>
      <Text style={styles.genderLabel}>
        {i18n.translate("SelecteazaGenul")}:
      </Text>
      <View style={styles.buttonContainer}>
        {genderOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.button,
              gender === option.value && styles.activeButton,
            ]}
            onPress={() => setGender(option.value)}
          >
            <MaterialCommunityIcons
              name={option.icon}
              size={24}
              color={gender === option.value ? '#FFD700' : '#B0AFA6'}
              style={styles.icon}
            />
            <Text
              style={[
                styles.buttonText,
                gender === option.value && styles.activeButtonText,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  genderContainer: {
    marginTop: 10,
    marginBottom: 10,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#FFD700',
    width: '100%',
    shadowColor: '#FFD700',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  genderLabel: {
    fontSize: 16,
    marginBottom: 0,
    fontWeight: 'bold',
    color: '#FFD700',
    fontFamily: 'Lora',
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 0,
    marginHorizontal: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#B0AFA6',
    backgroundColor: 'transparent',
    height: 'auto',
  },
  activeButton: {
    backgroundColor: '#fffbe6',
    borderColor: '#FFD700',
  },
  buttonText: {
    fontSize: 14,
    color: '#FFD700',
    fontFamily: 'Lora',
  },
  activeButtonText: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
  icon: {
    marginBottom: 5,
  },
});

export default GenderSelector;

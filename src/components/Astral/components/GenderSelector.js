import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { colors } from "../../../utils/colors";
import i18n from "../../../../i18n";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const GenderSelector = ({ setGender, gender }) => {
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
    <View style={styles.genderContainer}>
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
              color={gender === option.value ? colors.primary3 : "white"}
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
    marginTop: 20,
    padding: 10,
    backgroundColor: colors.primary3,
    borderRadius: 10,
  },
  genderLabel: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: "bold",
    color: "#FFF",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
    backgroundColor: "transparent",
  },
  activeButton: {
    backgroundColor: "white",
  },
  buttonText: {
    fontSize: 14,
    color: "white",
  },
  activeButtonText: {
    color: colors.primary3,
  },
  icon: {
    marginBottom: 5,
  },
});

export default GenderSelector;

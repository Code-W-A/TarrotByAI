import { StyleSheet, View } from "react-native";
import { colors } from "../../../utils/colors";
import { useState } from "react";
import { Button, SegmentedButtons, Text } from "react-native-paper";
import i18n from "../../../../i18n";

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
      <SegmentedButtons
        value={gender}
        onValueChange={(newValue) => setGender(newValue)}
        buttons={genderOptions.map((option) => ({
          value: option.value,
          label: option.label,
          icon: option.icon,
        }))}
        style={styles.segmentedButtons}
        theme={{
          colors: {
            primary: "white", // Folosește o culoare din gradient pentru selectare
            onSurface: "white", // O culoare închisă pentru text
          },
        }}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  genderContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: colors.primary3, // Container foarte transparent
    borderRadius: 10,
    shadowOpacity: 0, // Poți reduce sau elimina umbra pentru mai multă transparență
    elevation: 0, // Elimină elevația pentru Android
  },
  genderLabel: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: "bold",
    color: "#FFF", // Text alb pentru a se distinge pe un fundal posibil întunecat
  },
  segmentedButtons: {
    borderRadius: 20,
    backgroundColor: "transparent", // Fundal complet transparent pentru butoane
    borderColor: "rgba(255, 255, 255, 0.5)", // Contur subtil pentru butoane
    borderWidth: 1,
  },
});

export default GenderSelector;

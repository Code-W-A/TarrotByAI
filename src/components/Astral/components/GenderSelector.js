import { StyleSheet, View } from "react-native";
import { colors } from "../../../utils/colors";
import { useState } from "react";
import { Button, SegmentedButtons, Text } from "react-native-paper";

const GenderSelector = () => {
  const [gender, setGender] = useState("male");

  const genderOptions = [
    { value: "male", label: "Masculin", icon: "gender-male" },
    { value: "female", label: "Feminin", icon: "gender-female" },
    { value: "other", label: "Altul", icon: "gender-male-female" },
  ];

  return (
    <View style={styles.genderContainer}>
      <Text style={styles.genderLabel}>Selectează Genul:</Text>
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
            primary: "#E6E2B8", // Folosește o culoare din gradient pentru selectare
            onSurface: "#283140", // O culoare închisă pentru text
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
    backgroundColor: "rgba(255, 255, 255, 0.1)", // Container foarte transparent
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

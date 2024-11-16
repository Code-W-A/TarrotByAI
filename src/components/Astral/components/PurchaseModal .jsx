import React from "react";
import {
  Modal,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  View,
  Image,
  Button,
} from "react-native";

const PurchaseModal = ({
  visible,
  onDismiss,
  onConfirm,
  selectedLanguage,
  setSelectedLanguage,
}) => {
  const languages = [
    {
      name: "Romanian",
      code: "ro",
      flag: require("../../../../assets/flags/romania.png"),
    },
    {
      name: "English",
      code: "en",
      flag: require("../../../../assets/flags/english.png"),
    },
    {
      name: "Spanish",
      code: "es",
      flag: require("../../../../assets/flags/spanish.png"),
    },
    {
      name: "Bulgarian",
      code: "bg",
      flag: require("../../../../assets/flags/bulgaria.png"),
    },
    {
      name: "German",
      code: "de",
      flag: require("../../../../assets/flags/germany.png"),
    },
    {
      name: "French",
      code: "fr",
      flag: require("../../../../assets/flags/france.png"),
    },
    {
      name: "Italian",
      code: "it",
      flag: require("../../../../assets/flags/italy.png"),
    },
  ];

  const handleConfirm = () => {
    if (selectedLanguage) {
      onConfirm(selectedLanguage);
      onDismiss();
    }
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="slide"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Selectează limba dorită:</Text>

          <FlatList
            data={languages}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.languageItem,
                  selectedLanguage === item.code && styles.selectedLanguage,
                ]}
                onPress={() => setSelectedLanguage(item.code)}
              >
                <Image source={item.flag} style={styles.flag} />
                <Text style={styles.languageText}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />

          <View style={styles.buttonContainer}>
            <View style={styles.button}>
              <Button
                title="Confirmă Achiziția"
                onPress={handleConfirm}
                disabled={!selectedLanguage}
              />
            </View>
            <View style={styles.button}>
              <Button title="Anulează" onPress={onDismiss} color="#888" />
            </View>
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
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "bold",
  },
  languageItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  selectedLanguage: {
    backgroundColor: "#e0f7fa",
  },
  languageText: {
    fontSize: 16,
    marginLeft: 10,
  },
  flag: {
    width: 30,
    height: 20,
    resizeMode: "contain",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
});

export default PurchaseModal;

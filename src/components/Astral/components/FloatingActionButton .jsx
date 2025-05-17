import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text, Modal } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const FloatingActionButton = ({
  handleAddYourSinastrie,
  handleAddOtherSinastrie,
  handleRecoverBoughtAnalysis,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  return (
    <View style={styles.container}>
      {/* Modal pentru opțiuni */}
      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={toggleModal}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Selectează o opțiune</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                toggleModal();
                handleAddYourSinastrie();
              }}
            >
              <Text style={styles.modalButtonText}>Adaugă sinastria ta</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                toggleModal();
                handleAddOtherSinastrie();
              }}
            >
              <Text style={styles.modalButtonText}>
                Adaugă sinastrie pentru alții
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                toggleModal();
                handleRecoverBoughtAnalysis();
              }}
            >
              <Text style={styles.modalButtonText}>
                Recupereaza analizele cumparate
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={toggleModal}>
              <Text style={styles.cancelButtonText}>Închide</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={toggleModal}>
        <MaterialIcons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 102,
    right: 20,
    alignItems: "center",
  },
  fab: {
    width: 56,
    height: 56,
    backgroundColor: "#C9A14A",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: '#C9A14A',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fffbe6",
    borderRadius: 18,
    padding: 28,
    width: "80%",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#C9A14A",
    shadowColor: '#C9A14A',
    shadowOpacity: 0.10,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'LoraBold',
    marginBottom: 20,
    color: "#C9A14A",
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: "#C9A14A",
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 10,
    width: "100%",
    alignItems: "center",
    shadowColor: '#C9A14A',
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 2,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: 'LoraBold',
    letterSpacing: 0.1,
  },
  cancelButton: {
    backgroundColor: "#fff",
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: "#C9A14A",
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 10,
    width: "100%",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#C9A14A",
    fontSize: 16,
    fontFamily: 'LoraBold',
  },
});

export default FloatingActionButton;

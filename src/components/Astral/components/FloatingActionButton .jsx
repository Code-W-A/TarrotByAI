import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text, Modal, Alert } from "react-native";
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
      <TouchableOpacity style={styles.fab} onPress={toggleModal}>
        <MaterialIcons name="add" size={24} color="white" />
      </TouchableOpacity>
      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={toggleModal}
        animationType="fade"
      >
        <View style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.7)",
          justifyContent: "center",
          alignItems: "center"
        }}>
          <View style={{
            backgroundColor: "#fff",
            borderRadius: 24,
            paddingVertical: 36,
            paddingHorizontal: 28,
            alignItems: "center",
            borderWidth: 2,
            borderColor: "#FFD700",
            shadowColor: '#FFD700',
            shadowOpacity: 0.12,
            shadowRadius: 18,
            shadowOffset: { width: 0, height: 8 },
            elevation: 12,
            minWidth: 280,
            maxWidth: 340,
          }}>
            <Text style={{ fontSize: 28, color: "#FFD700", fontWeight: "bold", marginBottom: 18, letterSpacing: 0.5 }}>
              Acțiuni rapide
            </Text>
            <TouchableOpacity onPress={() => { toggleModal(); handleAddYourSinastrie(); }} style={{ marginTop: 10, backgroundColor: "#FFD700", paddingVertical: 14, paddingHorizontal: 18, borderRadius: 12, width: "100%", alignItems: "center", marginBottom: 8 }}>
              <Text style={{ color: "#131523", fontSize: 18, fontWeight: "bold", letterSpacing: 0.2 }}>Adaugă sinastria ta</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { toggleModal(); handleAddOtherSinastrie(); }} style={{ backgroundColor: "#fffbe6", paddingVertical: 14, paddingHorizontal: 18, borderRadius: 12, width: "100%", alignItems: "center", marginBottom: 8, borderWidth: 1, borderColor: "#FFD700" }}>
              <Text style={{ color: "#FFD700", fontSize: 18, fontWeight: "bold", letterSpacing: 0.2 }}>Adaugă sinastrie pentru alții</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleModal} style={{ marginTop: 8, backgroundColor: "#fffbe6", paddingVertical: 10, paddingHorizontal: 18, borderRadius: 10, width: "100%", alignItems: "center", borderWidth: 1, borderColor: "#FFD700" }}>
              <Text style={{ color: "#131523", fontSize: 16, fontWeight: "bold" }}>Închide</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 102,
    right: 20,
    alignItems: "center",
    zIndex: 1000,
  },
  fab: {
    width: 56,
    height: 56,
    backgroundColor: "#FFD700",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
    shadowColor: '#FFD700',
    shadowOpacity: 0.5,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    zIndex: 1000,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    width: "80%",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "red",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  modalIndicator: {
    width: 40,
    height: 4,
    backgroundColor: "#FFD700",
    borderRadius: 2,
    marginRight: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'LoraBold',
    marginBottom: 20,
    color: "#FFD700",
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  modalContent: {
    width: "100%",
  },
  modalButton: {
    backgroundColor: "#FFD700",
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 10,
    width: "100%",
    alignItems: "center",
    shadowColor: '#FFD700',
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 2,
  },
  buttonIcon: {
    marginRight: 10,
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
    borderColor: "#FFD700",
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 10,
    width: "100%",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#FFD700",
    fontSize: 16,
    fontFamily: 'LoraBold',
  },
});

export default FloatingActionButton;

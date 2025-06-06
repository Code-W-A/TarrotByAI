import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text, Modal, Alert } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const FloatingActionButtonAstrograma = ({
  handleAddYourSinastrie,
  handleAddOtherSinastrie,
  handleRecoverBoughtAnalysis,
  astrogramaNoua,
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
              <Text style={{ color: "#131523", fontSize: 18, fontWeight: "bold", letterSpacing: 0.2 }}>{astrogramaNoua || 'Adaugă persoană'}</Text>
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
    backgroundColor: "rgba(19, 21, 35, 0.85)",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fffbe6",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 0,
    width: "100%",
    minHeight: 200,
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 15,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
    marginBottom: 20,
  },
  modalIndicator: {
    width: 4,
    height: 24,
    backgroundColor: "#FFD700",
    borderRadius: 2,
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: 'LoraBold',
    color: "#131523",
    letterSpacing: 0.3,
    flex: 1,
  },
  modalContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    width: "100%",
  },
  modalButton: {
    backgroundColor: "#FFD700",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonIcon: {
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  modalButtonText: {
    color: "#131523",
    fontSize: 16,
    fontFamily: 'LoraBold',
    flex: 1,
    marginLeft: 12,
    letterSpacing: 0.1,
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginTop: 8,
    width: "100%",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  cancelButtonText: {
    color: "#FFD700",
    fontSize: 16,
    fontFamily: 'LoraBold',
    letterSpacing: 0.1,
  },
});

export default FloatingActionButtonAstrograma;

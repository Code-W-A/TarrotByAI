import React, { useEffect, useState } from "react";
import {
  FlatList,
  SafeAreaView,
  StatusBar,
  Platform,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Button, Surface, Title } from "react-native-paper";
import { colors } from "../../../utils/colors";
import SpaceSky from "../../../components/Astral/components/space-sky";
import Constellation from "../../../svgs/backgrounds/Constellation";

const PersonListScreen = ({ navigation }) => {
  const [persons, setPersons] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [personToDelete, setPersonToDelete] = useState(null);

  useEffect(() => {
    const fetchPersons = async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        const parsedData = JSON.parse(userData);

        // Extrage toate persoanele din array-ul `people` și filtrează elementele invalide
        const personData = (parsedData?.people || []).filter(
          (person) => person && typeof person === "object"
        );

        setPersons(personData);
      } catch (error) {
        console.error("Error fetching persons:", error);
      }
    };

    fetchPersons();
  }, []);

  const handleDelete = async () => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      const parsedData = JSON.parse(userData);

      // Elimină persoana selectată din lista `people`
      const updatedPersons = persons.filter(
        (person) => person !== personToDelete
      );

      parsedData.people = updatedPersons;

      // Salvează datele actualizate în AsyncStorage
      await AsyncStorage.setItem("userData", JSON.stringify(parsedData));
      setPersons(updatedPersons);
      setModalVisible(false);
    } catch (error) {
      console.error("Error deleting person:", error);
    }
  };

  const confirmDelete = (person) => {
    setPersonToDelete(person);
    setModalVisible(true);
  };

  const renderItem = ({ item, index }) => {
    // Verifică dacă toate valorile necesare există
    const hasFullName = !!item.full_name;
    const hasDateOfBirth = item.day && item.month && item.year;

    return (
      <Surface
        style={[styles.surfaceRight, { backgroundColor: "transparent" }]}
      >
        <View style={[StyleSheet.absoluteFill, { top: -25, opacity: 0.3 }]}>
          <Constellation
            color={colors.gradientLogin2 + "3D"}
            dotColor={colors.gradientLogin2}
            width={250}
            height={300}
          />
        </View>
        <LinearGradient
          colors={["transparent", "#4c4c4c" + "E6", "#4c4c4c" + "E6"]}
          start={[0, 0]}
          end={[1, 0]}
          style={styles.gradientRight}
        >
          <View style={{ flex: 1 }}>
            {/* Afișează doar dacă există un nume complet */}
            {hasFullName && (
              <Title style={styles.nameText}>{item.full_name}</Title>
            )}

            {/* Afișează doar dacă există o dată de naștere validă */}
            {hasDateOfBirth && (
              <Text style={styles.detailsText}>
                Data nașterii: {item.day}/{item.month}/{item.year}
              </Text>
            )}

            <View style={styles.buttonRow}>
              <Button
                mode="contained"
                compact
                style={styles.sinButton}
                onPress={() =>
                  navigation.navigate("Sinastrie", {
                    personIndex: index,
                    personData: item,
                  })
                }
              >
                Vezi Sinastrie
              </Button>
              <Button
                mode="outlined"
                compact
                style={styles.updateButton}
                labelStyle={styles.updateButtonLabel}
                onPress={() =>
                  navigation.navigate("NewPerson", {
                    personIndex: index,
                    personData: item,
                    editMode: true,
                  })
                }
              >
                Actualizează
              </Button>
              <Button
                mode="text"
                compact
                color="red"
                onPress={() => confirmDelete(item)}
              >
                Șterge
              </Button>
            </View>
          </View>
        </LinearGradient>
      </Surface>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={[colors.gradientLogin1, colors.gradientLogin11]}
        style={styles.container}
      >
        <SpaceSky />
        <View style={styles.listContainer}>
          <FlatList
            data={persons}
            keyExtractor={(item, index) => `person-${index}`}
            renderItem={renderItem}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                Nu există persoane adăugate încă.
              </Text>
            }
            contentContainerStyle={styles.flatListContent}
          />
        </View>
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            style={styles.addButton}
            onPress={() =>
              navigation.navigate("NewPerson", { editMode: false })
            }
          >
            Adaugă Persoană
          </Button>
        </View>

        {/* Modal pentru confirmarea ștergerii */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalText}>
                Sigur doriți să ștergeți această persoană?
              </Text>
              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Anulează</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={handleDelete}
                >
                  <Text style={styles.modalButtonText}>Confirmă</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  listContainer: {
    flex: 0.8,
  },
  flatListContent: {
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  surfaceRight: {
    elevation: 3,
    height: "auto",
    flexDirection: "row",
    borderRadius: 25,
    marginHorizontal: 20,
    marginVertical: 10,
    overflow: "hidden",
  },
  gradientRight: {
    padding: 15,
    borderTopRightRadius: 25,
    borderBottomRightRadius: 25,
    flex: 1,
    flexDirection: "column",
  },
  nameText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.gradientLogin2,
  },
  detailsText: {
    fontSize: 14,
    color: "#FFFFFF",
    marginVertical: 5,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  sinButton: {
    backgroundColor: colors.gradientLogin11,
    marginRight: 10,
  },
  updateButton: {
    borderColor: colors.gradientLogin2,
    borderWidth: 1,
    color: "white",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "white",
    marginTop: 20,
  },
  buttonContainer: {
    flex: 0.2,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: "2%",
  },
  addButton: {
    width: "100%",
    backgroundColor: colors.gradientLogin11,
  },
  updateButtonLabel: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    width: "80%",
    alignItems: "center",
  },
  modalText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  confirmButton: {
    backgroundColor: "#ff4d4d",
  },
  modalButtonText: {
    color: "#333",
    fontSize: 16,
  },
});

export default PersonListScreen;

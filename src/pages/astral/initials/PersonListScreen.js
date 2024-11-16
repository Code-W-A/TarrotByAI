import React, { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../../../utils/colors";

const PersonListScreen = ({ navigation }) => {
  const [persons, setPersons] = useState([]);

  useEffect(() => {
    const fetchPersons = async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        const parsedData = JSON.parse(userData);

        // Extrage toate persoanele din obiectul parsedData
        const personKeys = Object.keys(parsedData).filter((key) =>
          key.startsWith("p")
        );
        const personData = personKeys.map((key) => parsedData[key]);
        setPersons(personData);
      } catch (error) {
        console.error("Error fetching persons:", error);
      }
    };

    fetchPersons();
  }, []);

  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate("NewPersonScreen", {
          personKey: `p${index + 1}`, // Cheia persoanei în AsyncStorage
          personData: item, // Datele persoanei
          editMode: true, // Activare mod de editare
        })
      }
    >
      <Text style={styles.nameText}>{item.full_name || "Nume necunoscut"}</Text>
      <Text style={styles.detailsText}>
        Data nașterii: {item.day}/{item.month}/{item.year}
      </Text>
      <Text style={styles.detailsText}>Ora nașterii: {item.selectedTime}</Text>
      <Text style={styles.detailsText}>
        Locul nașterii: {item.place || "Necunoscut"}
      </Text>
      <Text style={styles.detailsText}>
        Zodia: {item.zodiacSign || "Necunoscut"}
      </Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={[colors.gradientLogin1, colors.gradientLogin11]}
      style={styles.container}
    >
      <FlatList
        data={persons}
        keyExtractor={(item, index) => `person-${index}`}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Nu există persoane adăugate încă.
          </Text>
        }
        contentContainerStyle={styles.listContainer}
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() =>
          navigation.navigate("NewPersonScreen", { editMode: false })
        } // Adăugare nouă persoană
      >
        <Text style={styles.addButtonText}>Adaugă Persoană</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
  },
  listContainer: {
    paddingVertical: 20,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  nameText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.gradientLogin1,
  },
  detailsText: {
    fontSize: 14,
    color: "#555",
    marginTop: 5,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "gray",
    marginTop: 20,
  },
  addButton: {
    backgroundColor: colors.gradientLogin2,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 10,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default PersonListScreen;

import React, { useCallback, useEffect, useState } from "react";
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
import FloatingActionButton from "../../../components/Astral/components/FloatingActionButton ";
import { db } from "../../../../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  getFirestore,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useFocusEffect } from "@react-navigation/native";
import LoadingOverlay from "../../../components/Astral/components/zodiac/LoadingOverlay";
import { useTranslation } from "../../../utils/translateUtil";
import { useLanguage } from "../../../context/LanguageContext";

const PersonListScreen = ({ navigation }) => {
  const [persons, setPersons] = useState([]);
  const [otherPersons, setOtherPersons] = useState([]); // Nou state
  const [selectedList, setSelectedList] = useState("persons"); // "persons" sau "others"
  const [asyncPersons, setAsyncPersons] = useState([]);
  const [modalVisible, setModalVisible] = useState(false); // Pentru confirmare ștergere
  const [modalVisibleOthers, setModalVisibleOthers] = useState(false); // Pentru confirmare ștergere
  const [personToDelete, setPersonToDelete] = useState(null);
  const [analysisToDelete, setAnalysisToDelete] = useState(null);
  const [purchaseModalVisible, setPurchaseModalVisible] = useState(false); // Pentru achiziție
  const [isLoading, setIsLoading] = useState(true);
  const { language, changeLanguage, userData, setUserData } = useLanguage();

  // varianta noua

  // Adaugă o metodă pentru confirmare înainte de ștergere
  // const confirmDeleteAnalysis = (analysis) => {
  //   setAnalysisToDelete(analysis);
  //   setModalVisibleOthers(true);
  // };

  // const confirmDelete = (person) => {
  //   console.log("person...person...", person);
  //   setPersonToDelete(person);
  //   setModalVisible(true);
  // };

  const handleAddPerson = () => {
    // if (persons.length > 0) {
    //   // Afișează mesajul de achiziție
    //   setPurchaseModalVisible(true);
    // } else {
    // Navighează către ecranul de adăugare
    navigation.navigate("NewPerson", { editMode: false });
    // }
  };
  const handleAddPersonForOthers = () => {
    // if (persons.length > 0) {
    //   // Afișează mesajul de achiziție
    //   setPurchaseModalVisible(true);
    // } else {
    // Navighează către ecranul de adăugare
    navigation.navigate("NewTwoPersonsSinastry", { editMode: false });
    // }
  };

  const handleRecoverBoughtAnalysis = async () => {
    setIsLoading(true);
    console.log("🔄 handleRecoverBoughtAnalysis started...");

    try {
      // 🔹 Citește datele existente din AsyncStorage
      const existingPersonalData = await AsyncStorage.getItem("personsData");
      const existingOtherData = await AsyncStorage.getItem("personsDataOthers");

      // 🔹 Parsează datele
      const parsedPersonalData = existingPersonalData
        ? JSON.parse(existingPersonalData)
        : [];
      const parsedOtherData = existingOtherData
        ? JSON.parse(existingOtherData)
        : [];

      // 🔹 Setează state-ul pentru a afișa datele în UI
      setPersons(parsedPersonalData);
      setOtherPersons(parsedOtherData);

      console.log("✅ personsData:", parsedPersonalData);
      console.log("✅ personsDataOthers:", parsedOtherData);
    } catch (error) {
      console.error("❌ Error in handleRecoverBoughtAnalysis:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      handleRecoverBoughtAnalysis();
    }, [])
  );

  const unifiedData = [
    ...otherPersons.map((item, index) => ({
      ...item,
      listType: "otherPersons",
      indexArray: index, // Indexul original din otherPersons
    })),
    ...persons.map((item, index) => ({
      ...item,
      listType: "myAnalysis",
      indexArray: index, // Indexul original din persons
    })),
  ];

  //traducere inline text
  const veziAnalizaText = useTranslation(
    "Vezi Sinastrie",
    language,
    "ListaSinastriePersoane"
  );
  const AchiziționatText = useTranslation(
    "Achiziționat",
    language,
    "PersonListAstrograma"
  );
  const NeachiziționatText = useTranslation(
    "Neachiziționat",
    language,
    "PersonListAstrograma"
  );
  const dataNasteriiText = useTranslation(
    "Data nasterii",
    language,
    "PersonListAstrograma"
  );
  //traducere inline text

  const renderItem = ({ item, index }) => {
    if (item.listType === "myAnalysis") {
      const hasFullName = !!item?.full_name;
      const hasDateOfBirth = item?.day && item?.month && item?.year;

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
              <View
                style={[
                  styles.statusBadge,
                  item?.isPaid
                    ? styles.statusBadgePaid
                    : styles.statusBadgeUnpaid,
                ]}
              >
                <Text style={styles.statusBadgeText}>
                  {item?.isPaid ? AchiziționatText : NeachiziționatText}
                </Text>
              </View>
              {hasFullName && (
                <Title style={styles.nameText}>{item?.full_name}</Title>
              )}

              {hasDateOfBirth && (
                <Text style={styles.detailsText}>
                  {dataNasteriiText}: {item?.day}/{item?.month}/{item?.year}
                </Text>
              )}

              <View style={styles.buttonRow}>
                <Button
                  mode="contained"
                  compact
                  style={styles.sinButton}
                  onPress={
                    () =>
                      navigation.navigate("Sinastrie", {
                        personIndex: item.indexArray,
                        personData: item,
                      })
                    // console.log("item...", item.synastry.natalWheelChart.data)
                  }
                >
                  {veziAnalizaText}
                </Button>
                {/* <Button
                  mode="text"
                  compact
                  color="red"
                  onPress={() => confirmDelete(item)}
                >
                  Șterge
                </Button> */}
              </View>
            </View>
          </LinearGradient>
        </Surface>
      );
    }

    if (item.listType === "otherPersons") {
      console.log("other person...", item.actualLanguageSinastrie);
      console.log("other person...", item);
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
              <View
                style={[
                  styles.statusBadge,
                  item?.isPaid
                    ? styles.statusBadgePaid
                    : styles.statusBadgeUnpaid,
                ]}
              >
                <Text style={styles.statusBadgeText}>
                  {item?.isPaid ? AchiziționatText : NeachiziționatText}
                </Text>
              </View>
              <Title style={styles.nameText}>
                {item?.person1?.full_name} & {item?.person2?.full_name}
              </Title>
              <View style={styles.buttonRow}>
                <Button
                  mode="contained"
                  compact
                  style={styles.sinButton}
                  onPress={() => {
                    navigation.navigate("SinastrieOthers", {
                      analysisIndex: item.indexArray,
                      analysisData: item,
                    });
                    console.log(item);
                  }}
                >
                  {veziAnalizaText}
                </Button>
                {/* <Button
                  mode="text"
                  compact
                  color="red"
                  onPress={() => confirmDeleteAnalysis(item)}
                >
                  Șterge
                </Button> */}
              </View>
            </View>
          </LinearGradient>
        </Surface>
      );
    }
  };

  if (isLoading) {
    return <LoadingOverlay isLoadingBuy={true} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={[colors.gradientLogin1, colors.gradientLogin11]}
        style={styles.container}
      >
        <SpaceSky />

        <View style={styles.listContainer}>
          <FlatList
            data={unifiedData}
            keyExtractor={(item, index) =>
              `${item.listType}-${item.id || index}`
            }
            renderItem={renderItem}
            contentContainerStyle={styles.flatListContent}
          />

          <FloatingActionButton
            handleAddYourSinastrie={handleAddPerson}
            handleAddOtherSinastrie={handleAddPersonForOthers}
            handleRecoverBoughtAnalysis={handleRecoverBoughtAnalysis}
          />
        </View>

        {/* Modal pentru achiziție */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={purchaseModalVisible}
          onRequestClose={() => setPurchaseModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalText}>
                Pentru a adăuga mai multe persoane, trebuie să achiziționați
                această funcționalitate.
              </Text>
              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setPurchaseModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Anulează</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={() => {
                    setPurchaseModalVisible(false);
                    navigation.navigate("NewPerson", { editMode: false });
                  }}
                >
                  <Text style={[styles.modalButtonText, { color: "white" }]}>
                    Cumpără
                  </Text>
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
  statusBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    zIndex: 10,
  },
  statusBadgePaid: {
    backgroundColor: "#4CAF50", // Verde pentru achiziționat
  },
  statusBadgeUnpaid: {
    backgroundColor: "#F44336", // Roșu pentru neachiziționat
  },
  statusBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },

  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "transparent",
  },
  navButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: "transparent",
  },
  navButtonActive: {
    backgroundColor: "rgba(104, 110, 121, 0.5)",
    shadowColor: "#000", // Culoarea umbrei
    shadowOffset: {
      width: 0, // Umbra pe orizontală
      height: 2, // Umbra pe verticală
    },
    shadowOpacity: 0.25, // Opacitatea umbrei
    shadowRadius: 4, // Raza umbrei
    elevation: 5, // Pentru Android
    borderRadius: 10, // Rotunjirea marginilor
    paddingHorizontal: 20, // Spațiu interior pe orizontală
    paddingVertical: 10, // Spațiu interior pe verticală
  },

  navButtonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
  },

  listTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginVertical: 10,
    textAlign: "center",
  },

  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  listContainer: {
    flex: 0.8,
    justifyContent: "flex-start",
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
    flexDirection: "row",
    justifyContent: "space-around",
    paddingBottom: "5%",
  },
  addButton: {
    width: "45%",
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
    backgroundColor: "#686e79",
    color: "white",
  },
  modalButtonText: {
    color: "#333",
    fontSize: 16,
  },
});

export default PersonListScreen;

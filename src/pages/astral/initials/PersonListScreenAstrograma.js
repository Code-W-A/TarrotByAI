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
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Button, Surface, Title } from "react-native-paper";
import { colors } from "../../../utils/colors";
import SpaceSky from "../../../components/Astral/components/space-sky";
import Constellation from "../../../svgs/backgrounds/Constellation";
import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
import { useFocusEffect } from "@react-navigation/native";
import LoadingOverlay from "../../../components/Astral/components/zodiac/LoadingOverlay";
import { useTranslation } from "../../../utils/translateUtil";
import { useLanguage } from "../../../context/LanguageContext";
import FloatingActionButtonAstrograma from "../../../components/Astral/components/FloatingActionButtonAstrograma";
import {
  backupAnalysesToFirestore,
  retrieveBackupsByPhone,
} from "../../../utils/firestoreUtils";
import {
  backupAnalizeAstrogramaNatalaOthersToFirestore,
  backupAnalizeAstrogramaNatalaPersonalaToFirestore,
  retrieveAnalizeAstrogramaNatalaOthersByPhone,
  retrieveAnalizeAstrogramaNatalaPersonalaByPhone,
} from "../../../utils/backupAnalysisUtils";

const PersonListScreenAstrograma = ({ navigation }) => {
  const [persons, setPersons] = useState([]);
  const [modalVisible, setModalVisible] = useState(false); // Pentru confirmare ștergere
  const [personToDelete, setPersonToDelete] = useState(null);
  const [purchaseModalVisible, setPurchaseModalVisible] = useState(false); // Pentru achiziție
  const [firestorePersons, setFirestorePersons] = useState([]);
  const [asyncPersons, setAsyncPersons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { language, changeLanguage, userData, setUserData } = useLanguage();
  const [warningModalVisible, setWarningModalVisible] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);

  const handleAddPerson = () => {
    navigation.navigate("NewPersonAstrograma", { editMode: false });
  };

  // Funcție pentru sincronizarea datelor:
  // 1. Se face backup-ul (din AsyncStorage în Firestore)
  // 2. Se recuperează backup-urile din Firestore (filtrate după telefonul utilizatorului)
  // 3. Se actualizează state-ul cu datele preluate din Firestore
  const synchronizeData = async () => {
    try {
      setIsLoading(true);
      // Apelăm separat backup-urile:
      await backupAnalizeAstrogramaNatalaPersonalaToFirestore();
      await backupAnalizeAstrogramaNatalaOthersToFirestore();
      console.log("✅ Backup-ul s-a efectuat.");

      // Recuperează datele din Firestore:
      const personalDocs =
        await retrieveAnalizeAstrogramaNatalaPersonalaByPhone();
      const othersDocs = await retrieveAnalizeAstrogramaNatalaOthersByPhone();
      setPersons(Array.isArray(personalDocs) ? personalDocs : [personalDocs]);
      setAsyncPersons(Array.isArray(othersDocs) ? othersDocs : [othersDocs]);
    } catch (error) {
      console.error("Eroare la sincronizarea datelor:", error);
    } finally {
      setIsLoading(false);
    }
  };
  // Folosim useFocusEffect pentru a sincroniza datele de fiecare dată când ecranul este vizibil
  useFocusEffect(
    useCallback(() => {
      synchronizeData();
    }, [])
  );

  //Traducere inline text

  const adaugaPersoanaNoua = useTranslation(
    "Adaugă Persoană",
    language,
    "PersonListAstrograma"
  );
  const veziAstrogramaText = useTranslation(
    "Vezi Astrograma",
    language,
    "PersonListAstrograma"
  );
  const actualizeazaAstrogramaText = useTranslation(
    "Actualizeaza",
    language,
    "PersonListAstrograma"
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

  //Traducere inline text

  const handleUpdate = (person) => {
    if (person.isPaid) {
      setSelectedPerson(person);
      setWarningModalVisible(true); // Afișează modalul
    } else {
      navigation.navigate("Name", { editMode: true }); // Navighează direct
    }
  };

  const confirmUpdate = () => {
    setWarningModalVisible(false);
    navigation.navigate("Name", { editMode: true });
  };

  const renderItem = ({ item, index }) => {
    const isUserData = item?.actualLanguage !== undefined; // Verifică dacă este userData
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
            {/* Cartonaș pentru starea achiziției */}
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
                onPress={() => {
                  index === 0
                    ? navigation.navigate("AstrogramaNatala", {
                        isPaid: item?.isPaid,
                      })
                    : navigation.navigate("AstrogramaNatalaOtherPersonData", {
                        personData: item,
                      });
                }}
              >
                {veziAstrogramaText}
              </Button>
              {item.type !== "othersAstrograma" && (
                <Button
                  mode="outlined"
                  compact
                  style={styles.updateButton}
                  labelStyle={styles.updateButtonLabel}
                  onPress={() => {
                    index === 0
                      ? handleUpdate(item)
                      : navigation.navigate("NewPersonAstrograma", {
                          editMode: true,
                          editIndex: index,
                          personData: item, // Trimiți datele persoanei selectate
                        });
                  }}
                >
                  {actualizeazaAstrogramaText}
                </Button>
              )}
            </View>
          </View>
        </LinearGradient>
      </Surface>
    );
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
            data={[...persons, ...asyncPersons]}
            keyExtractor={(item, index) => `person-${index}`}
            renderItem={renderItem}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                Nu există persoane adăugate încă.
              </Text>
            }
            contentContainerStyle={styles.flatListContent}
          />
          <FloatingActionButtonAstrograma
            astrogramaNoua={adaugaPersoanaNoua}
            handleAddYourSinastrie={handleAddPerson}
          />
        </View>

        {/* Modal pentru avertizare actualizare */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={warningModalVisible}
          onRequestClose={() => setWarningModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalText}>
                Dacă actualizați analiza, veți pierde informațiile
                achiziționate. Vă recomandăm să descărcați PDF-ul înainte de a
                continua.
              </Text>
              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setWarningModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Anulează</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={confirmUpdate}
                >
                  <Text style={[styles.modalButtonText, { color: "white" }]}>
                    Continuă
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

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
                    navigation.navigate("NewPersonAstrograma", {
                      editMode: false,
                    });
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
    backgroundColor: "#686e79",
    color: "white",
  },
  modalButtonText: {
    color: "#333",
    fontSize: 16,
  },
});

export default PersonListScreenAstrograma;

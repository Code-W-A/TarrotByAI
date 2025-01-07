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

const PersonListScreenAstrograma = ({ navigation }) => {
  const [persons, setPersons] = useState([]);
  const [modalVisible, setModalVisible] = useState(false); // Pentru confirmare ștergere
  const [personToDelete, setPersonToDelete] = useState(null);
  const [purchaseModalVisible, setPurchaseModalVisible] = useState(false); // Pentru achiziție
  const [firestorePersons, setFirestorePersons] = useState([]);
  const [asyncPersons, setAsyncPersons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { language, changeLanguage, userData, setUserData } = useLanguage();

  const updateUserDataInAsyncStorage = async (fetchedFirestorePersons) => {
    try {
      const userDataString = await AsyncStorage.getItem("userData");
      const userData = userDataString ? JSON.parse(userDataString) : null;

      // Filtrare după `type: "personalAstrograma"`
      const filteredFirestorePersons = fetchedFirestorePersons.filter(
        (firestorePerson) =>
          firestorePerson?.analysisData?.type === "personalAstrograma"
      );

      if (!userData) {
        console.warn(
          "Nu există userData în AsyncStorage pentru a fi comparat."
        );
        return;
      }

      // Dacă userData are isPaid === true, setează doar state-ul și oprește execuția
      if (userData.isPaid) {
        console.log(
          "userData are isPaid = true. Setăm state-ul cu userData și nu facem alte modificări."
        );
        setPersons([userData]);
        return;
      }

      const matchingPerson = filteredFirestorePersons.find(
        (person) => person?.analysisData?.id === userData.id
      );

      if (matchingPerson) {
        const updatedUserData = {
          ...matchingPerson.analysisData,
        };
        console.log(
          "Datele coincid. Actualizăm userData în AsyncStorage și state."
        );
        console.log("updatedUserData...", updatedUserData);
        // Actualizează AsyncStorage
        await AsyncStorage.setItem("userData", JSON.stringify(updatedUserData));
        // Actualizează state-ul persons
        setPersons([updatedUserData]);
      } else {
        setPersons([userData]);
        console.log(
          "Nu s-au găsit date din Firestore care să coincidă cu userData."
        );
      }
    } catch (error) {
      console.error("Eroare la actualizarea userData în AsyncStorage:", error);
    }
  };

  const compareFirestoreAndAsyncStorage = async (fetchedFirestorePersons) => {
    try {
      // Obține `personsDataAstrograma` din AsyncStorage
      const personsDataString = await AsyncStorage.getItem(
        "personsDataAstrograma"
      );
      const personsDataAstrograma = personsDataString
        ? JSON.parse(personsDataString)
        : [];

      // Filtrare după `type: "othersAstrograma"`
      const filteredFirestorePersons = fetchedFirestorePersons.filter(
        (firestorePerson) =>
          firestorePerson?.analysisData?.type === "othersAstrograma"
      );

      if (!personsDataAstrograma.length) {
        console.warn(
          "Nu există personsDataAstrograma în AsyncStorage pentru a fi comparat."
        );
        return;
      }

      // Elemente din Firestore care au un match în `AsyncStorage`
      const matchedData = filteredFirestorePersons.filter((firestorePerson) =>
        personsDataAstrograma.some(
          (astrogramaPerson) =>
            astrogramaPerson?.id === firestorePerson?.analysisData?.id
        )
      );

      // Elemente din `AsyncStorage` care NU au un match în Firestore
      const unmatchedData = personsDataAstrograma.filter(
        (astrogramaPerson) =>
          !filteredFirestorePersons.some(
            (firestorePerson) =>
              astrogramaPerson?.id === firestorePerson?.analysisData?.id
          )
      );

      // Suprascrie elementele potrivite din Firestore în AsyncStorage
      const updatedMatchedData = matchedData.map((firestorePerson) => ({
        id: firestorePerson.analysisData.id,
        ...firestorePerson.analysisData,
      }));

      // Combinație între datele suprascrise și cele fără corespondență
      const updatedData = [...updatedMatchedData, ...unmatchedData];

      // Actualizează state-ul
      setAsyncPersons(updatedData);

      // Salvează rezultatele în AsyncStorage
      await AsyncStorage.setItem(
        "personsDataAstrograma",
        JSON.stringify(updatedData)
      );

      console.log(
        "Date actualizate salvate în AsyncStorage:",
        updatedData[0].type
      );
    } catch (error) {
      console.error(
        "Eroare la compararea datelor Firestore cu AsyncStorage:",
        error
      );
    }
  };

  useFocusEffect(
    useCallback(() => {
      const fetchUserDataFromAsyncStorage = async () => {
        try {
          // Obține datele `userData` din AsyncStorage
          const userDataString = await AsyncStorage.getItem("userData");
          const userData = userDataString ? JSON.parse(userDataString) : null;

          console.log("User Data din AsyncStorage:", userData.id);
        } catch (error) {
          console.error(
            "Eroare la obținerea userData din AsyncStorage:",
            error
          );
        } finally {
          setIsLoading(false);
        }
      };

      fetchUserDataFromAsyncStorage();
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      const fetchPersonsDataFromAsyncStorage = async () => {
        try {
          // Obține datele `personsDataAstrograma` din AsyncStorage
          const personsDataString = await AsyncStorage.getItem(
            "personsDataAstrograma"
          );
          const personsDataAstrograma = personsDataString
            ? JSON.parse(personsDataString)
            : [];

          console.log(
            "Persons Data din AsyncStorage:",
            personsDataAstrograma.length
          );
        } catch (error) {
          console.error(
            "Eroare la obținerea personsDataAstrograma din AsyncStorage:",
            error
          );
        } finally {
          setIsLoading(false);
        }
      };

      fetchPersonsDataFromAsyncStorage();
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      const fetchFirestoreData = async () => {
        try {
          // Obține telefonul utilizatorului din AsyncStorage
          const storedData = await AsyncStorage.getItem("userDetails");
          const parsedUserDetails = storedData ? JSON.parse(storedData) : null;

          if (!parsedUserDetails || !parsedUserDetails.phone) {
            console.warn("Telefonul utilizatorului nu este disponibil.");
            return;
          }

          const { phone } = parsedUserDetails;
          console.log("user phone to check in firestore analysis....", phone);
          // Query pentru toate documentele care corespund telefonului utilizatorului
          const phoneQuery = query(
            collection(getFirestore(), "analysisBought"),
            where("phone", "==", phone)
          );
          const phoneSnapshot = await getDocs(phoneQuery);

          // Maparea documentelor și adăugarea `isPaid` în `analysisData`
          const fetchedFirestorePersons = phoneSnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              analysisData: {
                ...data.analysisData,
                isPaid: data.isPaid, // Adaugă `isPaid` în `analysisData`
              },
            };
          });

          // Filtrează doar documentele cu `isPaid: true`
          const paidFirestorePersons = fetchedFirestorePersons.filter(
            (person) => person.analysisData.isPaid
          );

          console.log(
            "fetchedFirestorePersons...data...",
            paidFirestorePersons.length
          );
          updateUserDataInAsyncStorage(paidFirestorePersons);
          compareFirestoreAndAsyncStorage(paidFirestorePersons);
          console.log("Firestore Data:", fetchedFirestorePersons[0].documentId);
        } catch (error) {
          console.error("Eroare la obținerea datelor din Firestore:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchFirestoreData();
    }, [])
  );

  const handleDelete = async () => {
    try {
      // Încarcă lista din AsyncStorage
      const personsDataString = await AsyncStorage.getItem(
        "personsDataAstrograma"
      );
      const personsData = personsDataString
        ? JSON.parse(personsDataString)
        : [];

      // Găsește și elimină persoana selectată utilizând id-ul
      const updatedPersonsData = personsData.filter(
        (person) => person.id !== personToDelete.id
      );

      // Salvează lista actualizată în AsyncStorage
      await AsyncStorage.setItem(
        "personsDataAstrograma",
        JSON.stringify(updatedPersonsData)
      );

      // Actualizează lista locală
      const updatedPersons = persons.filter(
        (person) => person.id !== personToDelete.id
      );
      setPersons(updatedPersons);

      // Resetează starea pentru modal
      setPersonToDelete(null);
      setModalVisible(false);
    } catch (error) {
      console.error("Eroare la ștergerea persoanei:", error);
    }
  };

  const confirmDelete = (person) => {
    setPersonToDelete(person); // Salvează persoana de șters
    setModalVisible(true); // Afișează modalul de confirmare
  };

  const handleAddPerson = () => {
    // if (persons.length > 0) {
    //   // Afișează mesajul de achiziție
    //   setPurchaseModalVisible(true);
    // } else {
    // Navighează către ecranul de adăugare
    navigation.navigate("NewPersonAstrograma", { editMode: false });

    // }
  };

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
                      ? navigation.navigate("Name", {
                          editMode: true,
                        })
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
              {/* {item.type === "othersAstrograma" && (
                <Button
                  mode="text"
                  compact
                  color="red"
                  onPress={() => confirmDelete(item)}
                >
                  Șterge
                </Button>
              )} */}
            </View>
          </View>
        </LinearGradient>
      </Surface>
    );
  };

  // if (isLoading || persons.length === 0 || asyncPersons.length === 0) {
  //   return <LoadingOverlay isLoadingBuy={true} />;
  // }

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
        </View>
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            style={styles.addButton}
            onPress={handleAddPerson}
          >
            {adaugaPersoanaNoua}
          </Button>
        </View>

        {/* Modal pentru confirmare ștergere */}
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
                  <Text style={[styles.modalButtonText, { color: "white" }]}>
                    Confirmă
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

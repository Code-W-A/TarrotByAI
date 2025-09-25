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
  Linking,
  ImageBackground,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Button, Surface, Title } from "react-native-paper";
import { colors } from "../../../utils/colors";
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

  // Debug: log persons and asyncPersons


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
  const helpText = useTranslation(
    "Dacă întâmpini probleme, contactează-ne la adresa de email: webdynamicx@gmail.com",
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

  // Funcție pentru ștergerea datelor din AsyncStorage (debug)
  const handleDeletePersonsData = async () => {
    try {
      await AsyncStorage.removeItem('personsDataAstrograma');
      setPersons([]);
      Alert.alert('Șters!', 'Datele au fost șterse din AsyncStorage.');
    } catch (e) {
      Alert.alert('Eroare', 'Nu s-au putut șterge datele.');
    }
  };

  const renderItem = ({ item, index }) => {
    // Protecție: nu randa dacă itemul e undefined sau nu e obiect
    if (!item || typeof item !== 'object') {
      console.warn('SKIP renderItem: item invalid', item);
      return null;
    }
    const isUserData = item?.actualLanguage !== undefined; // Verifică dacă este userData
    const hasFullName = !!item?.full_name;
    const hasDateOfBirth = item?.day && item?.month && item?.year;

    return (
      <Surface
        style={[styles.surfaceRight, { backgroundColor: "#fffbeae0", borderColor: "#FFD700", borderWidth: 1.2 }]}
      >
        <View style={[StyleSheet.absoluteFill, { top: -10, left: -10, opacity: 0.28 }]}> 
          <Constellation
            color={'#FFD70099'}
            dotColor={'#FFD700'}
            width={250}
            height={300}
          />
        </View>
        <LinearGradient
          colors={["#FFFBEA99", "#FAF7F299", "#F7E7B499"]}
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
              <Text style={styles.nameText}>{item?.full_name}</Text>
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
                        personData: item
                      })
                    : navigation.navigate("AstrogramaNatalaOtherPersonData", {
                        personData: item,
                      });
                }}
                theme={{ colors: { primary: '#FFD700', text: '#2D2A22' } }}
                labelStyle={{ fontFamily: 'LoraBold', fontSize: 14 }}
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
                  theme={{ colors: { primary: '#FFD700', text: '#FFD700' } }}
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
    <ImageBackground source={require('../../../../assets/dashboardbg.jpg')} style={{ flex: 1 }} imageStyle={{ opacity: 1 }}>
      <View style={{ flex: 1 }}>
        <View style={styles.listContainer}>
          <View style={styles.helpContainer}>
            <Text style={styles.helpText}>
              {helpText.split('webdynamicx@gmail.com')[0]}
              <TouchableOpacity onPress={() => Linking.openURL('mailto:webdynamicx@gmail.com')}>
                <Text style={{ fontWeight: 'bold', color: 'black', textDecorationLine: 'underline' }}>webdynamicx@gmail.com</Text>
              </TouchableOpacity>
            </Text>
          </View>
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
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  helpContainer: {
    padding: 10,
    alignItems: 'center',
  },
  helpText: {
    fontSize: 14,
    color: 'black',
    textAlign: 'center',
  },
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
    backgroundColor: "#FFD700", // Auriu pentru achiziționat
  },
  statusBadgeUnpaid: {
    backgroundColor: "#fffbe6", // Crem deschis pentru neachiziționat
    borderWidth: 1.5,
    borderColor: "#FFD700",
  },
  statusBadgeText: {
    color: "#FFD700",
    fontSize: 12,
    fontFamily: 'LoraBold',
  },

  safeArea: {
    flex: 1,
    backgroundColor: '#fffbe6',
  },
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    backgroundColor: '#fffbe6',
  },
  listContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: 40,
  },
  flatListContent: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    paddingBottom:100
  },
  surfaceRight: {
    elevation: 3,
    height: "auto",
    flexDirection: "row",
    borderRadius: 25,
    marginHorizontal: 20,
    marginVertical: 10,
    overflow: "hidden",
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#FFD700',
  },
  gradientRight: {
    padding: 15,
    borderTopRightRadius: 25,
    borderBottomRightRadius: 25,
    flex: 1,
    flexDirection: "column",
    backgroundColor: '#fff',
  },
  nameText: {
    fontSize: 20,
    fontFamily: 'LoraBold',
    color: '#FFD700',
    marginBottom: 2,
  },
  detailsText: {
    fontSize: 15,
    color: '#131523',
    fontFamily: 'Lora',
    marginVertical: 5,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  sinButton: {
    backgroundColor: '#FFD700',
    marginRight: 10,
    borderRadius: 22,
    minWidth: 120,
  },
  updateButton: {
    borderColor: '#FFD700',
    borderWidth: 1.5,
    backgroundColor: '#fff',
    borderRadius: 22,
    minWidth: 120,
  },
  updateButtonLabel: {
    color: '#FFD700',
    fontFamily: 'LoraBold',
    fontSize: 15,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: '#FFD700',
    fontFamily: 'LoraBold',
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
    backgroundColor: '#FFD700',
    borderRadius: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: "80%",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: '#FFD700',
  },
  modalText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: '#131523',
    fontFamily: 'Lora',
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
    backgroundColor: '#fffbe6',
    borderWidth: 1.5,
    borderColor: '#FFD700',
  },
  confirmButton: {
    backgroundColor: '#FFD700',
  },
  modalButtonText: {
    color: '#131523',
    fontFamily: 'LoraBold',
    fontSize: 16,
  },
});

export default PersonListScreenAstrograma;

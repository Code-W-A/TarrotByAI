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
  Linking,
  ImageBackground,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Button, Surface, Title } from "react-native-paper";
import { colors } from "../../../utils/colors";
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
import {
  applyEntitlementsToAnalyses,
  backupAnalizeSinastrieOnePersonToFirestore,
  backupAnalizeSinastrieOthersToFirestore,
  refreshLocalAnalysisAccessFromEntitlements,
  loadLocalSinastrieAnalyses,
  mergeAnalysesById,
  retrievePurchaseEntitlementsByContact,
  retrieveAnalizeSinastrieOnePersonByPhone,
  retrieveAnalizeSinastrieOthersByPhone,
} from "../../../utils/backupAnalysisUtils";

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



  const handleAddPerson = () => {
    // if (persons.length > 0) {
    //   // Afișează mesajul de achiziție
    //   setPurchaseModalVisible(true);
    // } else {
    // Navighează către e cranul de adăugare
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

  const handleRecoverBoughtAnalysis = () => {
    // Funcție pentru recuperarea analizelor cumpărate
    // Poate redirecționa către un ecran special sau afișa un modal
    console.log("Recupereaza analizele cumparate");
    // navigation.navigate("RecoverAnalysis");
  };

  // Funcție pentru sincronizarea datelor:
  // 1. Se face backup-ul (din AsyncStorage în Firestore) pentru ambele colecții sinastrie.
  // 2. Se recuperează documentele din Firestore (filtrate după telefonul utilizatorului).
  // 3. Se actualizează state-urile cu datele preluate din Firestore.

  const containsServiceUnavailable = (obj) => {
    if (typeof obj === "string") {
      return obj === "Service Unavailable";
    }
    if (Array.isArray(obj)) {
      return obj.some(item => containsServiceUnavailable(item));
    }
    if (typeof obj === "object" && obj !== null) {
      return Object.values(obj).some(value => containsServiceUnavailable(value));
    }
    return false;
  };

  const shouldDisplaySinastrieAnalysis = (analysis) => {
    if (!analysis || typeof analysis !== "object") {
      return false;
    }

    if (analysis.isPaid) {
      return true;
    }

    const synastry = analysis?.synastry;
    if (!synastry) {
      return false;
    }
    if (synastry.natalWheelChart === null) {
      return false;
    }
    if (synastry.aspect === null) {
      return false;
    }
    if (containsServiceUnavailable(synastry)) {
      return false;
    }

    return true;
  };
  

  const synchronizeData = async () => {
    let localOnePersonDocs = [];
    let localOtherDocs = [];

    try {
      setIsLoading(true);
      await refreshLocalAnalysisAccessFromEntitlements();
      const localAnalyses = await loadLocalSinastrieAnalyses();
      localOnePersonDocs = localAnalyses.onePersonDocs;
      localOtherDocs = localAnalyses.othersDocs;
      setPersons(localOnePersonDocs.filter(shouldDisplaySinastrieAnalysis));
      setOtherPersons(localOtherDocs.filter(shouldDisplaySinastrieAnalysis));

      // Apelăm separat funcțiile de backup:
      await backupAnalizeSinastrieOnePersonToFirestore();
      await backupAnalizeSinastrieOthersToFirestore();
      console.log("✅ [Sinastrie] Backup-ul s-a efectuat.");
  
      // Recuperăm documentele din Firestore:
      const [onePersonDocs, othersDocs, entitlements] = await Promise.all([
        retrieveAnalizeSinastrieOnePersonByPhone(),
        retrieveAnalizeSinastrieOthersByPhone(),
        retrievePurchaseEntitlementsByContact(),
      ]);

      const mergedOnePersonDocs = applyEntitlementsToAnalyses(
        mergeAnalysesById(onePersonDocs, localOnePersonDocs),
        entitlements
      );
      const mergedOthersDocs = applyEntitlementsToAnalyses(
        mergeAnalysesById(othersDocs, localOtherDocs),
        entitlements
      );
  
      const filteredOnePersonDocs = mergedOnePersonDocs.filter(
        shouldDisplaySinastrieAnalysis
      );
      const filteredOthersDocs = mergedOthersDocs.filter(
        shouldDisplaySinastrieAnalysis
      );

      setPersons(filteredOnePersonDocs);
      setOtherPersons(filteredOthersDocs);
    } catch (error) {
      console.error("Eroare la sincronizarea datelor sinastrie:", error);
      setPersons(localOnePersonDocs.filter(shouldDisplaySinastrieAnalysis));
      setOtherPersons(localOtherDocs.filter(shouldDisplaySinastrieAnalysis));
    } finally {
      setIsLoading(false);
    }
  };
  
  
  

  useFocusEffect(
    useCallback(() => {
      synchronizeData();
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
  const helpText = useTranslation(
    "Dacă întâmpini probleme, contactează-ne la adresa de email: webdynamicx@gmail.com",
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
          <View style={styles.gradientRight}>
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
                  onPress={
                    () =>
                    {
                      navigation.navigate("Sinastrie", {
                        personIndex: item.indexArray,
                        personData: item,
                      })
                    console.log("item...", item.synastry)
                  }
                  }
                  theme={{ colors: { primary: '#FFD700', text: '#fff' } }}
                  labelStyle={{ fontFamily: 'LoraBold', fontSize: 14 }}
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
          </View>
        </Surface>
      );
    }

    if (item.listType === "otherPersons") {
      // console.log("other person...", item.actualLanguageSinastrie);
      // console.log("other person...", item);
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
          <View style={styles.gradientRight}>
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
              <Text style={styles.nameText}>
                {item?.person1?.full_name} & {item?.person2?.full_name}
              </Text>
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
               
                  }}
                  theme={{ colors: { primary: '#FFD700', text: '#fff' } }}
                  labelStyle={{ fontFamily: 'LoraBold', fontSize: 14 }}
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
          </View>
        </Surface>
      );
    }
  };

  if (isLoading) {
    return <LoadingOverlay isLoadingBuy={true} />;
  }

  return (
    <ImageBackground
      source={require('../../../../assets/dashboardbg.jpg')}
      style={{ flex: 1 }}
      imageStyle={{ opacity: 1 }}
    >
      <View style={{ flex: 1, zIndex: 2 }}>
        <View style={[styles.listContainer, { paddingTop: 40, backgroundColor: 'transparent', flex: 1 }]}> 
          <View style={styles.helpContainer}>
            <Text style={styles.helpText}>
              {helpText.split('webdynamicx@gmail.com')[0]}
              <TouchableOpacity onPress={() => Linking.openURL('mailto:webdynamicx@gmail.com')}>
                <Text style={{ fontWeight: 'bold', color: 'black', textDecorationLine: 'underline' }}>webdynamicx@gmail.com</Text>
              </TouchableOpacity>
            </Text>
          </View>
          <FlatList
            data={unifiedData}
            keyExtractor={(item, index) => `${item.listType}-${item.id || index}`}
            renderItem={renderItem}
            ListEmptyComponent={<Text style={styles.emptyText}>Nu există persoane adăugate încă.</Text>}
            contentContainerStyle={{ flexGrow: 1, paddingVertical: 20, paddingHorizontal: 10, paddingBottom:100 }}
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
    backgroundColor: '#fffbe6',
    borderWidth: 1.5,
    borderColor: '#FFD700',
  },
  statusBadgePaid: {
    backgroundColor: "#fffbe6",
  },
  statusBadgeUnpaid: {
    backgroundColor: "#fffbe6",
  },
  statusBadgeText: {
    color: "#FFD700",
    fontSize: 12,
    fontFamily: 'LoraBold',
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
    borderColor: colors.gradientLogin2,
    borderWidth: 1,
    color: "white",
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

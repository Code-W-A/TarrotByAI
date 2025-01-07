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
  // START SINASTRIE PENTRU PERSONALA //
  const updateUserDataInAsyncStorage = async (fetchedFirestorePersons) => {
    try {
      // Obține `personsDataAstrograma` din AsyncStorage
      const personsDataString = await AsyncStorage.getItem("personsData");
      const personsDataAstrograma = personsDataString
        ? JSON.parse(personsDataString)
        : [];

      // Filtrare după `type: "personalSinastry"`
      const filteredAsync = personsDataAstrograma.filter(
        (astrogramaPerson) => astrogramaPerson?.type === "personalSinastry"
      );

      const filteredFirestorePersons = fetchedFirestorePersons.filter(
        (firestorePerson) =>
          firestorePerson?.analysisData?.type === "personalSinastry"
      );

      if (!filteredAsync.length) {
        console.warn(
          "Nu există filteredAsync în AsyncStorage pentru a fi comparat."
        );
        return;
      }

      // Elemente din Firestore care au un match în `AsyncStorage`
      const matchedData = filteredFirestorePersons.filter((firestorePerson) =>
        filteredAsync.some(
          (astrogramaPerson) =>
            astrogramaPerson?.id === firestorePerson?.analysisData?.id
        )
      );

      // Elemente din `AsyncStorage` care NU au un match în Firestore
      const unmatchedData = filteredAsync.filter(
        (astrogramaPerson) =>
          !filteredFirestorePersons.some(
            (firestorePerson) =>
              astrogramaPerson?.id === firestorePerson?.analysisData?.id
          )
      );

      // Suprascrie elementele potrivite din Firestore în AsyncStorage,
      // dar păstrează datele existente dacă `isPaid` este `true`
      const updatedMatchedData = matchedData.map((firestorePerson) => {
        const asyncPerson = filteredAsync.find(
          (astrogramaPerson) =>
            astrogramaPerson?.id === firestorePerson?.analysisData?.id
        );

        // Dacă `isPaid` este `true`, păstrează datele din `AsyncStorage`
        if (asyncPerson?.isPaid) {
          return asyncPerson;
        }

        // În caz contrar, suprascrie cu datele din Firestore
        return {
          id: firestorePerson.analysisData.id,
          ...firestorePerson.analysisData,
        };
      });

      // Combinație între datele suprascrise și cele fără corespondență
      const updatedData = [...updatedMatchedData, ...unmatchedData];

      // Actualizează state-ul
      setPersons(updatedData);

      // Salvează rezultatele în AsyncStorage
      await AsyncStorage.setItem("personsData", JSON.stringify(updatedData));

      console.log(
        "Date actualizate salvate în AsyncStorage:",
        updatedData[0]?.type
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
          const userDataString = await AsyncStorage.getItem("personsData");
          const personsDataOthers = userDataString
            ? JSON.parse(userDataString)
            : null;

          // Filtrare după `type: "personalSinastry"`
          const filtered = personsDataOthers.filter(
            (firestorePerson) => firestorePerson?.type === "personalSinastry"
          );

          console.log(
            "personal Data din AsyncStorage sinastrie:",
            filtered[0].type
          );
          // setPersons(filtered);
        } catch (error) {
          console.error(
            "Eroare la obținerea personsDataOthers din AsyncStorage:",
            error
          );
        } finally {
          setIsLoading(false);
        }
      };

      fetchUserDataFromAsyncStorage();
    }, [])
  );
  // END SINASTRIE PENTRU PERSONALA //

  // START SINASTRIE PENTRU ALTII //
  const compareFirestoreAndAsyncStorage = async (fetchedFirestorePersons) => {
    try {
      // Obține `personsDataAstrograma` din AsyncStorage
      const personsDataString = await AsyncStorage.getItem("personsDataOthers");
      const personsDataAstrograma = personsDataString
        ? JSON.parse(personsDataString)
        : [];

      // Filtrare după `type: "othersSinastry"`
      const filteredAsync = personsDataAstrograma.filter(
        (astrogramaPerson) => astrogramaPerson?.type === "othersSinastry"
      );

      const filteredFirestorePersons = fetchedFirestorePersons.filter(
        (firestorePerson) =>
          firestorePerson?.analysisData?.type === "othersSinastry"
      );

      if (!filteredAsync.length) {
        console.warn(
          "Nu există filteredAsync în AsyncStorage pentru a fi comparat."
        );
        return;
      }

      // Elemente din Firestore care au un match în `AsyncStorage`
      const matchedData = filteredFirestorePersons.filter((firestorePerson) =>
        filteredAsync.some(
          (astrogramaPerson) =>
            astrogramaPerson?.id === firestorePerson?.analysisData?.id
        )
      );

      // Elemente din `AsyncStorage` care NU au un match în Firestore
      const unmatchedData = filteredAsync.filter(
        (astrogramaPerson) =>
          !filteredFirestorePersons.some(
            (firestorePerson) =>
              astrogramaPerson?.id === firestorePerson?.analysisData?.id
          )
      );

      // Suprascrie elementele potrivite din Firestore în AsyncStorage,
      // dar păstrează datele existente dacă `isPaid` este `true`
      const updatedMatchedData = matchedData.map((firestorePerson) => {
        const asyncPerson = filteredAsync.find(
          (astrogramaPerson) =>
            astrogramaPerson?.id === firestorePerson?.analysisData?.id
        );

        // Dacă `isPaid` este `true`, păstrează datele din `AsyncStorage`
        if (asyncPerson?.isPaid) {
          return asyncPerson;
        }

        // În caz contrar, suprascrie cu datele din Firestore
        return {
          id: firestorePerson.analysisData.id,
          ...firestorePerson.analysisData,
        };
      });

      // Combinație între datele suprascrise și cele fără corespondență
      const updatedData = [...updatedMatchedData, ...unmatchedData];

      // Actualizează state-ul
      setOtherPersons(updatedData);

      // Salvează rezultatele în AsyncStorage
      await AsyncStorage.setItem(
        "personsDataOthers",
        JSON.stringify(updatedData)
      );

      console.log(
        "Date actualizate salvate în AsyncStorage:",
        updatedData[0]?.type
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
      const fetchPersonsDataFromAsyncStorage = async () => {
        try {
          // Obține datele `personsDataAstrograma` din AsyncStorage
          const personsDataString = await AsyncStorage.getItem(
            "personsDataOthers"
          );
          const personsDataAstrograma = personsDataString
            ? JSON.parse(personsDataString)
            : [];

          const filtered = personsDataAstrograma.filter(
            (firestorePerson) => firestorePerson?.type === "othersSinastry"
          );

          // setOtherPersons(filtered);
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
  // END SINASTRIE PENTRU ALTII //

  // START PRELUARE DIN FIRESTORE//
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
                documentId: data.documentId, // Adaugă `isPaid` în `analysisData`
              },
            };
          });

          // Filtrează doar documentele cu `isPaid: true`
          const paidFirestorePersons = fetchedFirestorePersons.filter(
            (person) => person.analysisData.isPaid
          );

          updateUserDataInAsyncStorage(paidFirestorePersons);
          compareFirestoreAndAsyncStorage(paidFirestorePersons);
        } catch (error) {
          console.error("Eroare la obținerea datelor din Firestore:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchFirestoreData();
    }, [])
  );
  // END PRELUARE DIN FIRESTORE//

  //start stergere date din analiza personala//
  const handleDelete = async () => {
    try {
      console.log("person to delete....", personToDelete.documentId);
      if (personToDelete.documentId) {
        // Creează referința documentului pe baza ID-ului
        const docRef = doc(
          getFirestore(),
          "analysisBought",
          personToDelete.documentId
        );

        // Șterge documentul din Firestore
        await deleteDoc(docRef);
        console.log("Document șters din Firestore:", personToDelete.documentId);
      }

      // Filtrează lista pentru a elimina persoana selectată
      const updatedPersons = persons.filter(
        (person) => person.documentId !== personToDelete.documentId
      );

      // Salvează lista actualizată în AsyncStorage
      await AsyncStorage.setItem("personsData", JSON.stringify(updatedPersons));

      // Actualizează state-ul local
      setPersons(updatedPersons);

      // Ascunde modalul de confirmare
      setModalVisible(false);
    } catch (error) {
      console.error("Error deleting person from Firestore:", error);
    }
  };
  //end stergere date din analiza personala//

  const handleDeleteAnalysis = async () => {
    try {
      if (analysisToDelete.documentId) {
        // Creează referința documentului pe baza ID-ului
        const docRef = doc(
          getFirestore(),
          "analysisBought",
          analysisToDelete.documentId
        );

        // Șterge documentul din Firestore
        await deleteDoc(docRef);
        console.log(
          "Document șters din Firestore:",
          analysisToDelete.documentId
        );
      }

      // Filtrăm lista locală pentru a elimina analiza
      const updatedOtherPersons = otherPersons.filter(
        (item) => item?.documentId !== analysisToDelete.documentId
      );

      // Salvează lista actualizată în AsyncStorage
      await AsyncStorage.setItem(
        "personsDataOthers",
        JSON.stringify(updatedOtherPersons)
      );

      // Actualizează state-ul local
      setOtherPersons(updatedOtherPersons);

      // Ascunde modalul de confirmare
      setModalVisibleOthers(false);
    } catch (error) {
      console.error("Error deleting analysis from Firestore:", error);
    }
  };

  // Adaugă o metodă pentru confirmare înainte de ștergere
  const confirmDeleteAnalysis = (analysis) => {
    setAnalysisToDelete(analysis);
    setModalVisibleOthers(true);
  };

  const confirmDelete = (person) => {
    console.log("person...person...", person);
    setPersonToDelete(person);
    setModalVisible(true);
  };

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

  const renderItemPersons = ({ item, index }) => {
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
                onPress={() =>
                  navigation.navigate("Sinastrie", {
                    personIndex: index,
                    personData: item,
                  })
                }
              >
                {veziAnalizaText}
              </Button>
              {/* <Button
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
              </Button> */}
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
  };

  // Modifică funcția `renderItemOtherPersons` pentru a include ștergerea
  const renderItemOtherPersons = ({ item, index }) => {
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
                {item?.isPaid ? "Achiziționat" : "Neachiziționat"}
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
                    analysisIndex: index,
                    analysisData: item,
                  });
                  console.log(item);
                }}
              >
                Vezi Analiza
              </Button>
              {/* <Button
                mode="outlined"
                compact
                style={styles.updateButton}
                labelStyle={styles.updateButtonLabel}
                onPress={() =>
                  navigation.navigate("NewTwoPersonsSinastry", {
                    editMode: true,
                    analysisIndex: index,
                    analysisData: item, // Transmite toate datele analizei
                  })
                }
              >
                Actualizează
              </Button> */}
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
  };

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
    console.log("unifiedData....length", unifiedData.length);
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

  // if (isLoading || unifiedData.length === 0) {
  //   return <LoadingOverlay isLoadingBuy={true} />;
  // }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={[colors.gradientLogin1, colors.gradientLogin11]}
        style={styles.container}
      >
        <SpaceSky />
        {/* <View style={styles.navbar}>
          <TouchableOpacity
            style={[
              styles.navButton,
              selectedList === "persons" && styles.navButtonActive,
            ]}
            onPress={() => setSelectedList("persons")}
          >
            <Text style={styles.navButtonText}>Persoane Individuale</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.navButton,
              selectedList === "others" && styles.navButtonActive,
            ]}
            onPress={() => setSelectedList("others")}
          >
            <Text style={styles.navButtonText}>Analize Sinastrie</Text>
          </TouchableOpacity>
        </View> */}

        <View style={styles.listContainer}>
          <FlatList
            data={unifiedData}
            keyExtractor={(item, index) =>
              `${item.listType}-${item.id || index}`
            }
            renderItem={renderItem}
            contentContainerStyle={styles.flatListContent}
          />
          {/* {selectedList === "persons" && ( */}
          {/* <FlatList
            data={persons}
            keyExtractor={(item, index) => `person-${index}`}
            renderItem={renderItemPersons}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                Nu există persoane adăugate încă.
              </Text>
            }
            contentContainerStyle={[
              styles.flatListContent,
              { marginBottom: 0 },
            ]}
          /> */}
          {/* )} */}
          {/* {selectedList === "others" && ( */}
          {/* <FlatList
            data={otherPersons}
            keyExtractor={(item, index) => `analysis-${index}`}
            renderItem={renderItemOtherPersons}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                Nu există analize adăugate încă.
              </Text>
            }
            contentContainerStyle={[styles.flatListContent, { marginTop: 0 }]}
          /> */}
          {/* )} */}
          <FloatingActionButton
            handleAddYourSinastrie={handleAddPerson}
            handleAddOtherSinastrie={handleAddPersonForOthers}
          />
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
                Sigur doriți să ștergeți această persoană? Această acțiune este
                ireversibilă și va elimina analiza definitiv.
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

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisibleOthers}
          onRequestClose={() => setModalVisibleOthers(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalText}>
                Sigur doriți să ștergeți această analiză? Această acțiune este
                ireversibilă și va elimina analiza definitiv.
              </Text>

              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalVisibleOthers(false)}
                >
                  <Text style={styles.modalButtonText}>Anulează</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={() => {
                    handleDeleteAnalysis(analysisToDelete);
                  }}
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

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { Octicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { colors } from "../../utils/colors";
import { handleLanguagei18n } from "../../utils/handleLanguageGeneral";
import { useAuth } from "../../context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "../../../i18n";
import { useLanguage } from "../../context/LanguageContext";
import { useNumberContext } from "../../context/NumberContext";
import { handleQueryToken, handleUploadFirestoreSubcollection } from "../../utils/firestoreUtils";
import { authentication } from "../../../firebase";
import { useApiData } from "../../context/ApiContext";
import { usePushNotifications } from "../../hooks/usePushNotifications";
import { collection, query, where, getDocs, updateDoc, getFirestore } from "firebase/firestore";  


const languages = [
  {
    name: "Romanian",
    code: "ro",
    flag: require("../../../assets/flags/romania.png"),
  },
  {
    name: "English",
    code: "en",
    flag: require("../../../assets/flags/english.png"),
  },
  {
    name: "Spanish",
    code: "es",
    flag: require("../../../assets/flags/spanish.png"),
  },
  {
    name: "Bulgarian",
    code: "bg",
    flag: require("../../../assets/flags/bulgaria.png"),
  },
  {
    name: "Czech",
    code: "cs",
    flag: require("../../../assets/flags/czech.png"),
  },
  {
    name: "German",
    code: "de",
    flag: require("../../../assets/flags/germany.png"),
  },
  {
    name: "Greek",
    code: "el",
    flag: require("../../../assets/flags/greece.png"),
  },
  {
    name: "French",
    code: "fr",
    flag: require("../../../assets/flags/france.png"),
  },
  {
    name: "Croatian",
    code: "hr",
    flag: require("../../../assets/flags/croatia.png"),
  },
  {
    name: "Hindi",
    code: "hi",
    flag: require("../../../assets/flags/india.png"),
  },
  {
    name: "Italian",
    code: "it",
    flag: require("../../../assets/flags/italy.png"),
  },
  {
    name: "Polish",
    code: "pl",
    flag: require("../../../assets/flags/poland.png"),
  },
  {
    name: "Indonesian",
    code: "id",
    flag: require("../../../assets/flags/indonesia.png"),
  },
  {
    name: "Slovak",
    code: "sk",
    flag: require("../../../assets/flags/slovakia.png"),
  },
  // Adăugați aici alte limbi și steaguri, dacă este necesar
];

const GreetingBar = ({ isGoBack, isPersonalGoBack }) => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("Romanian");
  const { currentUser, userData, isGuestUser, setUserData } = useAuth();
  const { language, changeLanguage } = useLanguage();
  const { currentNumber, updateNumber, sendToHistory, setSendToHistory } =
    useNumberContext();
    const {expoPushToken} = usePushNotifications()
  const {
    loading,

    setLoading,
  } = useApiData();

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem("@userLanguage");
        if (savedLanguage) {
          const foundLanguage = languages.find((l) => l.code === savedLanguage);
          setCurrentLanguage(foundLanguage ? foundLanguage.name : "English");
        }
      } catch (e) {
        console.error("Failed to load the language from storage");
      }
    };

    loadLanguage();
  }, []);

  const handleLanguageSelect = async (languageName) => {
    const selectedLanguage = languages.find((l) => l.name === languageName);
    const langCode = selectedLanguage ? selectedLanguage.code : "en";
    setCurrentLanguage(languageName);
    console.log(`${languageName} Selected`);

    // Așteaptă finalizarea schimbării limbii
    const newLangCode = await handleLanguagei18n(langCode);

    let expoToken = expoPushToken.data;

    // Actualizează contextul
    changeLanguage(newLangCode);
    AsyncStorage.setItem("@userLanguage", langCode);
    setModalVisible(false);

    // Firestore db instance
    const db = getFirestore();

    // Creează o interogare pentru a găsi documentul după token
    if (expoToken) {
        const q = query(collection(db, "userTokens"), where("token", "==", expoToken));

        try {
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach(async (doc) => {
                // Actualizează campul `language` pentru fiecare document găsit
                await updateDoc(doc.ref, {
                    language: langCode
                });
            });
            console.log("Language updated in Firestore successfully");
        } catch (error) {
            console.error("Error updating language in Firestore:", error);
        }
    }
};


  const flagImageSource = languages.find((l) => l.name === currentLanguage)
    ?.flag;

  return (
    <View style={styles.navbar}>
      {isGoBack ? (
        <TouchableOpacity
          onPress={() => {
            console.log("loading...", loading);
            let arr = [...sendToHistory];
            const auth = authentication;
            if (auth.currentUser) {
              console.log("Is user...saving personal reading...");
              const userLocation = `Users/${
                auth.currentUser ? auth.currentUser.uid : ""
              }/PersonalReading`;
              if (arr.length > 0) {
                handleUploadFirestoreSubcollection(arr, userLocation);
              }
            }
            updateNumber(8);
            setSendToHistory([]);
            navigation.goBack();
          }}
          style={{ zIndex: 10 }}
        >
          <Octicons
            name="chevron-left"
            size={29}
            color={colors.primary1}
            style={{ marginLeft: 15, zIndex: 5 }}
          />
        </TouchableOpacity>
      ) : isGuestUser ? (
        <Text style={styles.text}>{i18n.translate("helloUser")}! </Text>
      ) : (
        <Text style={styles.text}>
          {i18n.translate("helloUser")},{" "}
          <Text style={styles.boldText}>
            {userData ? userData.first_name : ""}
          </Text>
        </Text>
      )}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={{ zIndex: 5 }}
      >
        <Image style={styles.image} source={flagImageSource} />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setModalVisible(false)}
        >
          {/* <SafeAreaView style={styles.safeAreaView}> */}
          <View style={styles.modal}>
            <Text style={[styles.modalText, { marginBottom: 15 }]}>
              Schimbă limba
            </Text>
            <ScrollView style={styles.scrollView}>
              {languages.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={styles.modalItem}
                  onPress={() => handleLanguageSelect(lang.name)}
                >
                  <Text style={styles.modalText}>{lang.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalItemCancel}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalTextCancel}>Renunță</Text>
            </TouchableOpacity>
          </View>
          {/* </SafeAreaView> */}
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
  },
  safeAreaView: {
    flex: 0,
    backgroundColor: colors.secondary2,
  },
  scrollView: {
    flex: 1, // Acest stil este important pentru a permite extinderea ScrollView
    width: "100%",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: colors.secondary2,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 35,
    height: "35%",
    justifyContent: "flex-start",

    alignItems: "flex-start",
  },
  modalItem: {
    paddingVertical: 10,
    alignItems: "flex-start",
  },
  modalItemCancel: {
    paddingVertical: 10,
    alignItems: "flex-start",
    // marginTop: 10,
  },
  modalText: {
    fontSize: 18,
    color: colors.white,
  },
  modalTextCancel: {
    fontSize: 18,
    color: colors.white,
  },
  // ... rest of your styles
  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingTop: 10,
    backgroundColor: "transparent",
  },
  text: {
    fontSize: 18,
    color: "white", // Sau orice altă culoare dorită
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 20, // Face imaginea rotundă
    borderWidth: 1,
    borderColor: "#000", // Sau orice altă culoare pentru border
  },
  boldText: {
    fontWeight: "bold",
    // poți adăuga aici și alte stiluri specifice pentru textul bolduit
  },
});

export default GreetingBar;

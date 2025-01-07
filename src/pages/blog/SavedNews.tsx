import React, { useCallback, useEffect, useState } from "react";
import {
  Text,
  useColorScheme,
  View,
  FlatList,
  TouchableOpacity,
} from "react-native";
import styles from "./styles";
import { RefreshControl } from "react-native";
import { NewsCategory } from "../../utils/constant";
import { NewsTags } from "../../components/NewsTags/NewsTags";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../../utils/colors";
import { Platform } from "react-native";
import { StatusBar } from "react-native";
import { SearchInput } from "../../components/SearchInput/SearchInput";
import { NewsCard } from "../../components/NewsCard/NewsCard";
import { NewsDetailsModal } from "../../components/NewsDetailsModal/NewsDetailsModal";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  handleGetFirestore,
  handleQueryFirestoreGeneral,
} from "../../utils/firestoreUtils";
import { handleSearch } from "../../utils/searchUtils";
import { useLanguage } from "../../context/LanguageContext";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const SavedNews: React.FC = () => {
  const [newsFeed, setNewsFeed] = useState({});
  const [searchResults, SetSearchResults] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const { language, changeLanguage } = useLanguage();

  const navigation = useNavigation();

  const openModalWithArticle = (article) => {
    console.log("open...modal...", article);
    setSelectedArticle(article);
    setModalVisible(true);
  };
  const handleCloseModal = () => {
    setModalVisible(!modalVisible);
  };
  const saveArticle = async (article) => {
    try {
      // Obține lista curentă de articole salvate
      const savedArticlesJSON = await AsyncStorage.getItem("savedArticles");
      let savedArticles = savedArticlesJSON
        ? JSON.parse(savedArticlesJSON)
        : [];

      // Verifică dacă articolul există deja în listă
      const existingIndex = savedArticles.findIndex(
        (a) => a.documentId === article.documentId
      );

      if (existingIndex !== -1) {
        // Dacă articolul există deja, îl ștergem
        savedArticles.splice(existingIndex, 1);
        console.log("Article removed successfully");
      } else {
        // Dacă articolul nu există, îl adăugăm
        savedArticles.push(article);
        console.log("Article added successfully");
      }

      // Salvează lista actualizată înapoi în AsyncStorage
      await AsyncStorage.setItem(
        "savedArticles",
        JSON.stringify(savedArticles)
      );
    } catch (error) {
      console.error("Failed to save or remove the article", error);
    }
  };

  const handleGetSavedData = async () => {
    // Obținerea datelor articolelor din Firestore
    const savedArticlesJSON = await AsyncStorage.getItem("savedArticles");
    const articlesData = savedArticlesJSON ? JSON.parse(savedArticlesJSON) : [];
    console.log("articles data...", articlesData);
    let articles = {};
    if (articlesData.length > 0) {
      // Sortarea articolelor după data și ora lor
      const sortedArticles = articlesData.sort((a, b) => {
        // Combină data și ora într-un singur string și convertește-le în obiecte de tip Date
        const dateTimeA = new Date(`${a.firstUploadDate} ${a.firstUploadtime}`);
        const dateTimeB = new Date(`${b.firstUploadDate} ${b.firstUploadtime}`);

        // Compară obiectele de tip Date
        return dateTimeB - dateTimeA;
      });

      // Selectarea celor mai noi două articole
      const latestArticles = sortedArticles.slice(0, 2);

      // Selectarea celor mai noi cinci articole
      const latestFiveArticles = sortedArticles.slice(0, 5);

      // Selectarea celui mai nou articol
      const lastArticle = sortedArticles[0]; // Primul articol din lista sortată este cel mai recent

      // Returnarea datelor către componenta Next.js
      articles = {
        articlesData,
        latestArticles,
        lastArticle,
        latestFiveArticles,
      };
    } else {
      articles = {
        articlesData: [],
        latestArticles: [],
        lastArticle: [],
        latestFiveArticles: [],
      };
    }
    setNewsFeed(articles);
  };

  const handleQueryData = async () => {
    let articlesData = await handleQueryFirestoreGeneral(
      "BlogArticole",
      "categorie",
      selectedCategory
    );
    console.log("articles data...query...", articlesData);

    let articles = {};
    if (articlesData.length > 0) {
      // Sortarea articolelor după data și ora lor
      const sortedArticles = articlesData.sort((a, b) => {
        // Combină data și ora într-un singur string și convertește-le în obiecte de tip Date
        const dateTimeA = new Date(`${a.date} ${a.time}`);
        const dateTimeB = new Date(`${b.date} ${b.time}`);

        // Compară obiectele de tip Date
        return dateTimeB - dateTimeA;
      });

      // Selectarea celor mai noi două articole
      const latestArticles = sortedArticles.slice(0, 2);

      // Selectarea celor mai noi cinci articole
      const latestFiveArticles = sortedArticles.slice(0, 5);

      // Selectarea celui mai nou articol
      const lastArticle = sortedArticles[0]; // Primul articol din lista sortată este cel mai recent

      // Returnarea datelor către componenta Next.js
      articles = {
        articlesData,
        latestArticles,
        lastArticle,
        latestFiveArticles,
      };
    } else {
      articles = {
        articlesData: [],
        latestArticles: [],
        lastArticle: [],
        latestFiveArticles: [],
      };
    }
    setNewsFeed(articles);
  };

  useEffect(() => {
    handleGetSavedData();
  }, []);

  const backgroundColor = useColorScheme() === "dark" ? "#000" : "#fff";

  const handleSearchData = (text) => {
    console.log("Start......");
    const newData = handleSearch(newsFeed.articlesData, language, text);
    // console.log("new data...", newData);
    SetSearchResults(newData);
    // console.log("Search reasults...length...", searchResults.length);
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <LinearGradient
        colors={[
          colors.gradientLogin1,
          colors.gradientLogin2,
          colors.gradientLogin2,
        ]} // Înlocuiește cu culorile gradientului tău
        style={{
          flex: 1,
          paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 10,
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ width: "10%", alignItems: "flex-end" }}
          >
            <FontAwesome name="chevron-left" size={24} color={colors.white} />
          </TouchableOpacity>
          <View style={{ width: "90%" }}>
            <SearchInput
              searchText={searchText}
              setSearchText={setSearchText}
              setIsLoading={setIsLoading}
              handleSearchData={handleSearchData}
            />
          </View>
        </View>
        {/* {!searchText?.trim() && (
          <NewsTags
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        )} */}
        <FlatList
          keyExtractor={(item) => item.id} // Utilizarea unui ID unic, dacă este disponibil
          showsVerticalScrollIndicator={false}
          data={searchText.length > 0 ? searchResults : newsFeed.articlesData}
          renderItem={({ item }) => (
            <NewsCard post={item} onPress={openModalWithArticle} />
          )}
          style={styles.list}
        />
        <NewsDetailsModal
          visible={modalVisible}
          article={selectedArticle}
          articleIndex={0} // Ajustează în funcție de cazul de utilizare
          onClose={handleCloseModal}
          saveArticle={saveArticle}
        />
      </LinearGradient>
    </View>
  );
};

export default SavedNews;

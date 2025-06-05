import React, { useState, useCallback, useEffect } from "react";
import {
  Modal,
  Image,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
  ImageBackground,
  StyleSheet,
  Share,
} from "react-native";
import styles from "./styles";
import { Ionicons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { colors } from "../../utils/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { WebView } from "react-native-webview";
import { Video } from "expo-av";
import { getYoutubeEmbedUrl } from "../../utils/youtubeLinkUtils";
import { useLanguage } from "../../context/LanguageContext";

export const NewsDetailsModal: React.FC<{
  visible: boolean;
  article: any; // Accepts any article shape, including info and image fields
  articleIndex: number;
  onClose: () => void;
  saveArticle: Function;
}> = ({ visible, article, articleIndex, onClose, saveArticle }) => {
  const backgroundColor = "#fff";
  const color = "#000";
  const contentColor = useColorScheme() === "dark" ? "#bbb" : "#444";
  const readMoreBgColor = useColorScheme() === "dark" ? "#222" : "#ddd";
  const [isSaved, setIsSaved] = useState(false);
  const { language, changeLanguage } = useLanguage();

  const customCSS = `
  <style>
      body {
          font-size: 26px; /* Setează dimensiunea fontului pentru elementul body */
          padding-left:30px;
          padding-right:30px;
          padding-bottom:30px;
          background: transparent !important;
      }
      h1 {
          font-size: 54px; /* Dimensiunea fontului pentru titluri */
      }
      h2 {
          font-size: 52px; /* Dimensiunea fontului pentru titluri */
      }
      p {
          font-size: 50px; /* Dimensiunea fontului pentru paragrafe */
      }
      /* Adaugă alte selecții și stiluri după cum este necesar */
  </style>
`;

  const youtubeEmbedHTML = article?.youtubeLinks
    ? article.youtubeLinks
        .map((link) => {
          const embedUrl = getYoutubeEmbedUrl(link);
          return `<iframe style="margin-top: 10px;" width="100%" height="515" src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        })
        .join("") // Unește toate fragmentele HTML într-un singur șir
    : "";

  const youtubeVideoId = "caWBmvhRcII"; // ID-ul videoclipului YouTube

  const fullHTMLContent = `
  <!DOCTYPE html>
  <html>
  <head>
      ${customCSS}
  </head>
  <body>
      ${
        language === "hi"
          ? article?.info?.hu?.content
          : language === "id"
          ? article?.info?.ru?.content
          : language === "ru"
          ? article?.info?.rusa?.content
          : article?.info[language]?.content
      }
      ${youtubeEmbedHTML}
  </body>
  </html>
`;

  //   const handleURLPress = useCallback(() => {
  //     Linking.openURL(article?.url);
  //   }, [article]);
  useEffect(() => {
    const checkIfArticleIsSaved = async () => {
      try {
        const savedArticlesJSON = await AsyncStorage.getItem("savedArticles");
        const savedArticles = savedArticlesJSON
          ? JSON.parse(savedArticlesJSON)
          : [];
        const isArticleSaved = savedArticles.some(
          (a) => a.documentId === article.documentId
        );
        console.log("is saved...", isArticleSaved);
        setIsSaved(isArticleSaved);
      } catch (error) {
        console.error("Failed to check if the article is saved", error);
      }
    };

    if (visible) {
      checkIfArticleIsSaved();
    }
  }, [article, visible]);

  const handleSaveArticle = (article) => {
    setIsSaved(!isSaved);
    saveArticle(article);
  };

  // Linkuri aplicație
  const ANDROID_LINK = "https://play.google.com/store/apps/details?id=com.cristinazurba.tarot";
  const IOS_LINK = "https://apps.apple.com/app/id6476755632";

  // FAB share handler
  const handleShare = async () => {
    const title =
      language === "hi"
        ? article?.info?.hu?.nume
        : language === "id"
        ? article?.info?.ru?.nume
        : language === "ru"
        ? article?.info?.rusa?.nume
        : article?.info[language]?.nume;
    const readMoreText = language === "ro"
      ? `Citește mai multe în aplicația Tarot by Cristina Zurba:\nAndroid: ${ANDROID_LINK}\niOS: ${IOS_LINK}`
      : `Read more in the Tarot by Cristina Zurba app:\nAndroid: ${ANDROID_LINK}\niOS: ${IOS_LINK}`;
    const message = `${title}\n\n${readMoreText}`;
    try {
      await Share.share({
        message,
        title,
      });
    } catch (error) {
      // Poți adăuga un toast sau alertă dacă vrei
      console.error("Share error", error);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <ImageBackground
        source={require("../../../assets/dashboardbg.jpg")}
        resizeMode="cover"
        style={{ flex: 1 }}
      >
        {/* Overlay for opacity effect */}
        <View style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: 'rgba(255,255,255,0.5)',
          zIndex: 1,
        }} />
        {/* Modal content above overlay */}
        <View style={{ flex: 1, zIndex: 2 }}>
        <TouchableOpacity style={[styles.crossContainer]} onPress={onClose}>
          <View style={[styles.backArrowContainer]}>
            <Ionicons
              name="arrow-back"
              size={24}
              color="black"
              //   style={styles.cross}
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bookmarkContainer}
          onPress={() => handleSaveArticle(article)}
        >
          <View style={styles.backContainer}>
            {isSaved ? (
              <FontAwesome name="bookmark" size={33} color={colors.primary3} />
            ) : (
              <FontAwesome
                name="bookmark-o"
                size={33}
                color={colors.primary3}
              />
            )}
          </View>
        </TouchableOpacity>

        <View
          style={[
            styles.container,
            styles.contentContainer,
              { backgroundColor: 'transparent' },
          ]}
        >
          <Image
            style={styles.image}
            source={{
              uri: article?.image?.finalUri ?? "https://picsum.photos/1000",
            }}
            resizeMode={"cover"}
          />
          <View style={{ height: "auto" }}>
            <Text style={[styles.title, { color }]}>
              {language === "hi"
                ? article?.info?.hu?.nume
                : language === "id"
                ? article?.info?.ru?.nume
                : language === "ru"
                ? article?.info?.rusa?.nume
                : article?.info[language]?.nume}
            </Text>
            <Text
              style={{
                color: '#FFD700',
                fontWeight: '700',
                fontSize: 16,
                textAlign: 'center',
                textShadowColor: '#fffbeae0',
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 6,
                letterSpacing: 1.1,
                fontFamily: 'LoraBold',
                marginTop: 0,
                position:"relative",
                bottom:"-20%"
              }}
            >
              @CristinaZurba.App
            </Text>
          </View>
          {/* <Text style={[styles.content, { color: contentColor }]}>
            {article?.info?.ro.content}
          </Text> */}
        </View>
        <WebView originWhitelist={["*"]} source={{ html: fullHTMLContent }} 
          style={{ backgroundColor: 'transparent', marginTop: 0 }}
          containerStyle={{ backgroundColor: 'transparent' }}
          injectedJavaScript={`document.body.style.background = 'transparent'; true;`}
        />

        {/* <View
          style={[
            styles.readMoreContainer,
            { backgroundColor: readMoreBgColor },
          ]}
        >
          <Text style={[styles.readMoreText, { color }]} numberOfLines={2}>
            Read more at{" "}
            <Text style={styles.link} onPress={handleURLPress}>
              {article?.url}
            </Text>
          </Text>
        </View> */}

        {/* FAB Share Button */}
        <TouchableOpacity
          onPress={handleShare}
          style={{
            position: 'absolute',
            bottom: 32,
            right: 24,
            backgroundColor: '#FFD700',
            borderRadius: 32,
            width: 56,
            height: 56,
            justifyContent: 'center',
            alignItems: 'center',
            elevation: 6,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            zIndex: 20,
          }}
        >
          <Ionicons name="share-social" size={28} color="#2D2A22" />
        </TouchableOpacity>
        </View>
      </ImageBackground>
    </Modal>
  );
};

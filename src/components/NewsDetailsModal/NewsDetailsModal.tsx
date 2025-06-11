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
  Dimensions,
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
  const [webViewReady, setWebViewReady] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const { language, changeLanguage } = useLanguage();

  const customCSS = `
  <style>
      body {
          font-size: 20px; /* Font mare pentru citire confortabilă */
          padding-left: 20px;
          padding-right: 20px;
          padding-bottom: 30px;
          padding-top: 10px;
          background: transparent !important;
          color: #333;
          line-height: 1.6;
      }
      h1 {
          font-size: 28px; /* Titluri mari */
          margin-bottom: 16px;
          margin-top: 20px;
          color: #FFD700;
          font-weight: bold;
      }
      h2 {
          font-size: 26px; /* Subtitluri mari */
          margin-bottom: 14px;
          margin-top: 18px;
          color: #bfa76a;
          font-weight: bold;
      }
      h3 {
          font-size: 24px; /* Subtitluri nivel 3 mari */
          margin-bottom: 12px;
          margin-top: 16px;
          color: #bfa76a;
          font-weight: bold;
      }
      p {
          font-size: 20px; /* Paragrafe mari pentru citire ușoară */
          margin-bottom: 14px;
          text-align: justify;
          color: #333;
      }
      li {
          font-size: 20px; /* Liste cu același font ca paragrafele */
          margin-bottom: 10px;
          color: #333;
      }
      ul, ol {
          padding-left: 20px;
          margin-bottom: 14px;
      }
      iframe {
          margin-top: 20px;
          margin-bottom: 20px;
          border-radius: 12px;
          max-width: 100%;
          height: 220px;
          border: 1px solid #ddd;
      }
      /* Stiluri pentru citire mai ușoară */
      strong {
          color: #bfa76a;
          font-weight: bold;
          font-size: 21px;
      }
      em {
          color: #666;
          font-style: italic;
          font-size: 19px;
      }
      blockquote {
          font-size: 22px;
          color: #bfa76a;
          border-left: 4px solid #FFD700;
          padding-left: 15px;
          margin: 20px 0;
          font-style: italic;
      }
  </style>
`;

  // Debug YouTube links - DETAILED LOGGING
  console.log("🎥 =========================");
  console.log("🎥 YOUTUBE DEBUG START");
  console.log("🎥 =========================");
  console.log("🎥 Raw article object:", article);
  console.log("🎥 article?.youtubeLinks:", article?.youtubeLinks);
  console.log("🎥 typeof youtubeLinks:", typeof article?.youtubeLinks);
  console.log("🎥 Array.isArray(youtubeLinks):", Array.isArray(article?.youtubeLinks));
  console.log("🎥 youtubeLinks length:", article?.youtubeLinks?.length);
  
  // Test each link individually
  if (article?.youtubeLinks) {
    console.log("🎥 Processing each YouTube link:");
    article.youtubeLinks.forEach((link, index) => {
      console.log(`🎯 Link ${index}:`, link);
      console.log(`🎯 Link ${index} type:`, typeof link);
      console.log(`🎯 Link ${index} length:`, link?.length);
      console.log(`🎯 Link ${index} trimmed:`, link?.trim());
    });
  }

  const youtubeEmbedHTML = article?.youtubeLinks && Array.isArray(article.youtubeLinks)
    ? article.youtubeLinks
        .filter(link => {
          const isValid = link && link.trim() !== "";
          console.log(`🔍 Link validation: "${link}" -> ${isValid}`);
          return isValid;
        })
        .map((link, index) => {
          console.log(`🎯 =========================`);
          console.log(`🎯 Processing YouTube link ${index}`);
          console.log(`🎯 Original link:`, link);
          console.log(`🎯 Link includes "watch?v=":`, link.includes("watch?v="));
          console.log(`🎯 Link includes "list=":`, link.includes("list="));
          
          const embedUrl = getYoutubeEmbedUrl(link);
          console.log(`🔗 Generated embed URL:`, embedUrl);
          console.log(`🔗 Embed URL valid:`, embedUrl && embedUrl.length > 0);
          
          // Test if the URL structure is correct
          if (embedUrl) {
            console.log(`🔗 Embed URL parts:`, embedUrl.split('/'));
            console.log(`🔗 Contains youtube.com:`, embedUrl.includes('youtube.com'));
            console.log(`🔗 Contains embed:`, embedUrl.includes('embed'));
          }
          
                     const iframeHTML = `
             <div style="margin: 25px 0; text-align: center;">
               <iframe 
                 width="100%" 
                 height="250" 
                 src="${embedUrl}" 
                 frameborder="0" 
                 allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share" 
                 allowfullscreen
                 loading="lazy"
                 style="border-radius: 12px; max-width: 100%; border: 1px solid #ddd;"
                 title="YouTube video"
               ></iframe>
             </div>
           `;
          
          console.log(`🎬 Generated iframe HTML length:`, iframeHTML.length);
          return iframeHTML;
        })
        .join("")
    : "";
  
  console.log("🎬 =========================");
  console.log("🎬 FINAL YOUTUBE HTML DEBUG");
  console.log("🎬 =========================");
  console.log("🎬 Final YouTube HTML length:", youtubeEmbedHTML.length);
  console.log("🎬 Final YouTube HTML preview (first 500 chars):");
  console.log(youtubeEmbedHTML.substring(0, 500));
  console.log("🎬 Contains iframe tag:", youtubeEmbedHTML.includes('<iframe'));
  console.log("🎬 Contains youtube.com:", youtubeEmbedHTML.includes('youtube.com'));
  console.log("🎬 =========================");

  const youtubeVideoId = "caWBmvhRcII"; // ID-ul videoclipului YouTube

  const articleContent = language === "hi"
    ? article?.info?.hu?.content
    : language === "id"
    ? article?.info?.ru?.content
    : language === "ru"
    ? article?.info?.rusa?.content
    : article?.info[language]?.content;

  console.log("📄 =========================");
  console.log("📄 ARTICLE CONTENT DEBUG");
  console.log("📄 =========================");
  console.log("📄 Current language:", language);
  console.log("📄 Article content length:", articleContent?.length);
  console.log("📄 Article content preview (first 200 chars):");
  console.log(articleContent?.substring(0, 200));
  console.log("🎬 YouTube HTML will be added:", youtubeEmbedHTML.length > 0);

  const fullHTMLContent = `
  <!DOCTYPE html>
  <html>
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      ${customCSS}
  </head>
  <body>
      ${articleContent || '<p style="color: #bfa76a; text-align: center;">Conținut indisponibil</p>'}
      
      ${youtubeEmbedHTML}
      
      ${youtubeEmbedHTML.length === 0 ? '<p style="color: #999; text-align: center; font-size: 18px; margin-top: 30px;">📺 Nu există videoclipuri disponibile</p>' : ''}
  </body>
  </html>
`;

  console.log("📋 =========================");
  console.log("📋 FINAL HTML DEBUG");
  console.log("📋 =========================");
  console.log("📋 Full HTML length:", fullHTMLContent.length);
  console.log("📋 HTML contains iframe:", fullHTMLContent.includes('<iframe'));
  console.log("📋 HTML contains youtube.com:", fullHTMLContent.includes('youtube.com'));
  console.log("📋 Number of iframes:", (fullHTMLContent.match(/<iframe/g) || []).length);
  console.log("📋 HTML preview around YouTube section:");
  const youtubePosition = fullHTMLContent.indexOf('📺 Video');
  if (youtubePosition > -1) {
    console.log(fullHTMLContent.substring(youtubePosition - 100, youtubePosition + 500));
  } else {
    console.log("❌ No YouTube section found in HTML");
  }
  console.log("📋 =========================");

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
      // Reset WebView ready state when modal opens
      setWebViewReady(false);
      // Delay WebView rendering to ensure proper layout
      const timer = setTimeout(() => {
        setWebViewReady(true);
      }, 100);
      
      return () => clearTimeout(timer);
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
        <ScrollView 
          style={{ flex: 1, zIndex: 2 }}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity style={[styles.crossContainer]} onPress={onClose}>
            <View style={[styles.backArrowContainer]}>
              <Ionicons
                name="arrow-back"
                size={24}
                color="black"
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
                  marginBottom: 12,
                }}
              >
                @CristinaZurba.App
              </Text>
            </View>
          </View>
          
          {/* WebView with calculated height */}
          <View style={{ 
            minHeight: Dimensions.get('window').height - 350,
            backgroundColor: 'transparent'
          }}>
            <WebView 
              originWhitelist={["*"]} 
              source={{ html: fullHTMLContent }} 
              style={{ 
                backgroundColor: 'transparent',
                height: Dimensions.get('window').height - 350,
              }}
              containerStyle={{ backgroundColor: 'transparent' }}
              injectedJavaScript={`document.body.style.background = 'transparent'; true;`}
              allowsInlineMediaPlayback={true}
              mediaPlaybackRequiresUserAction={false}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              mixedContentMode="compatibility"
              onLoadStart={() => console.log('WebView loading started')}
              onLoadEnd={() => console.log('WebView loading ended')}
              onError={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;
                console.warn('WebView error: ', nativeEvent);
              }}
              scrollEnabled={true}
              nestedScrollEnabled={true}
            />
          </View>
        </ScrollView>

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
      </ImageBackground>
    </Modal>
  );
};

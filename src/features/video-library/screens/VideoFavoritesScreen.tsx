import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ImageBackground,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { colors } from "../../../utils/colors";
import { screenName } from "../../../utils/screenName";
import { useAuth } from "../../../context/AuthContext";
import { useAds } from "../../../hooks/useAds";
import { useAdsContext } from "../../../context/AdsContext";
import { EmptyState } from "../components/EmptyState";
import { VideoCard } from "../components/VideoCard";
import { VideoSkeleton } from "../components/VideoSkeleton";
import { getVideoCategories } from "../services/videoLibrary.service";
import type { VideoCategory } from "../types/videoCategory";
import type { Video } from "../types/video";
import i18n from "../../../../i18n";
import {
  recordVideoInterstitialShown,
  recordVideoOpen,
  shouldShowVideoInterstitial,
} from "../utils/videoAdPolicy";
import {
  getFavoriteVideos,
  toggleFavoriteVideo,
} from "../utils/videoFavorites";

const VideoFavoritesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { userData } = useAuth() as { userData?: unknown };
  const { adsConfig } = useAdsContext();
  const { showInterstitial, canShowAds } = useAds(adsConfig);
  const [favorites, setFavorites] = useState<Video[]>([]);
  const [categoriesData, setCategoriesData] = useState<VideoCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [adLoading, setAdLoading] = useState(false);
  const [favoriteMap, setFavoriteMap] = useState<Record<string, boolean>>({});
  const locale = i18n.locale?.split("-")[0] ?? "en";

  const isPremiumUser = Boolean((userData as any)?.isPremiumUser);

  const syncFavorites = useCallback(async () => {
    const list = await getFavoriteVideos();
    setFavorites(list);
    const map: Record<string, boolean> = {};
    list.forEach((item) => {
      if (item?.id) {
        map[item.id] = true;
      }
    });
    setFavoriteMap(map);
  }, []);

  const loadFavorites = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setErrorMessage(null);

    try {
      const [favoriteData, categoryData] = await Promise.all([
        getFavoriteVideos(),
        getVideoCategories(),
      ]);
      setFavorites(favoriteData);
      setCategoriesData(categoryData);
      const map: Record<string, boolean> = {};
      favoriteData.forEach((item) => {
        if (item?.id) {
          map[item.id] = true;
        }
      });
      setFavoriteMap(map);
    } catch (error) {
      setErrorMessage(i18n.translate("videoFavoritesLoadError"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  useFocusEffect(
    useCallback(() => {
      syncFavorites();
    }, [syncFavorites])
  );

  const getLocalizedVideo = useCallback(
    (video: Video) => {
      const localizedFields = video.locales?.[locale];
      const localizedTitle = localizedFields?.title?.trim();
      const localizedDescription = localizedFields?.description?.trim();

      return {
        ...video,
        title: localizedTitle || video.title,
        description: localizedDescription || video.description,
      };
    },
    [locale]
  );

  const getLocalizedCategoryName = useCallback(
    (categoryName: string) => {
      const category = categoriesData.find((item) => item.name === categoryName);
      const localizedName = category?.locales?.[locale];
      return localizedName?.trim() || category?.name || categoryName;
    },
    [categoriesData, locale]
  );

  const videosByCategory = useMemo(() => {
    const grouped: Record<string, Video[]> = {};
    favorites.forEach((video) => {
      const cat = video.category || i18n.translate("videoLibraryOtherCategory");
      if (!grouped[cat]) {
        grouped[cat] = [];
      }
      grouped[cat].push(video);
    });
    return grouped;
  }, [favorites]);

  const filteredVideosByCategory = useMemo(() => {
    if (!searchQuery.trim()) {
      return videosByCategory;
    }

    const normalizedQuery = searchQuery.trim().toLowerCase();
    const filtered: Record<string, Video[]> = {};

    Object.keys(videosByCategory).forEach((cat) => {
      const matchingVideos = videosByCategory[cat].filter((video) => {
        const localizedVideo = getLocalizedVideo(video);
        return localizedVideo.title.toLowerCase().includes(normalizedQuery);
      });
      if (matchingVideos.length > 0) {
        filtered[cat] = matchingVideos;
      }
    });

    return filtered;
  }, [videosByCategory, searchQuery, getLocalizedVideo]);

  const handlePressVideo = async (video: Video) => {
    recordVideoOpen();
    if (
      !video.isPremium &&
      !isPremiumUser &&
      canShowAds &&
      shouldShowVideoInterstitial()
    ) {
      setAdLoading(true);
      const shown = await showInterstitial();
      if (shown) {
        recordVideoInterstitialShown();
      }
      setAdLoading(false);
    }
    navigation.navigate(screenName.VideoPlayer, { video });
  };

  const renderCategorySection = (categoryName: string, categoryVideos: Video[]) => (
    <View key={categoryName} style={styles.categorySection}>
      <Text style={styles.categoryTitle}>
        {getLocalizedCategoryName(categoryName)}
      </Text>
      <FlatList
        horizontal
        data={categoryVideos}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => {
          const localizedVideo = getLocalizedVideo(item);
          return (
            <View
              style={index === categoryVideos.length - 1 ? styles.lastCard : null}
            >
              <VideoCard
                video={localizedVideo}
                onPress={() => handlePressVideo(localizedVideo)}
                isLocked={Boolean(item.isPremium && !isPremiumUser)}
                isFavorite={Boolean(favoriteMap[item.id])}
                onToggleFavorite={async () => {
                  const result = await toggleFavoriteVideo(item);
                  setFavorites(result.favorites);
                  const nextMap: Record<string, boolean> = {};
                  result.favorites.forEach((fav) => {
                    if (fav?.id) {
                      nextMap[fav.id] = true;
                    }
                  });
                  setFavoriteMap(nextMap);
                }}
              />
            </View>
          );
        }}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.horizontalList,
          categoryVideos.length <= 2 && styles.horizontalListCentered,
        ]}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#fffef9", "#faf6ed", "#f5ead9"]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ImageBackground
          source={require("../../../../assets/dashboardbg.jpg")}
          resizeMode="cover"
          style={[StyleSheet.absoluteFill, styles.backgroundImage]}
          imageStyle={{ opacity: 1 }}
        />
        <View style={styles.overlay} />
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {i18n.translate("videoFavoritesTitle")}
            </Text>
            <View style={styles.searchContainer}>
              <Ionicons
                name="search"
                size={20}
                color="#8b7355"
                style={styles.searchIcon}
              />
              <TextInput
                placeholder={i18n.translate("videoFavoritesSearchPlaceholder")}
                placeholderTextColor="#8b7355"
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCorrect={false}
              />
            </View>
            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}
          </View>

          {loading ? (
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              <View style={styles.skeletonContainer}>
                {Array.from({ length: 3 }).map((_, index) => (
                  <VideoSkeleton key={`skeleton-${index}`} />
                ))}
              </View>
            </ScrollView>
          ) : Object.keys(filteredVideosByCategory).length === 0 ? (
            <View style={styles.emptyContainer}>
              <EmptyState
                title={i18n.translate("videoFavoritesEmptyTitle")}
                message={i18n.translate("videoFavoritesEmptyMessage")}
                actionLabel={i18n.translate("videoFavoritesRetry")}
                onAction={() => loadFavorites(true)}
              />
            </View>
          ) : (
            <ScrollView
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => loadFavorites(true)}
                  tintColor={colors.gold}
                />
              }
            >
              {Object.keys(filteredVideosByCategory).map((categoryName) =>
                renderCategorySection(
                  categoryName,
                  filteredVideosByCategory[categoryName]
                )
              )}
              <View style={styles.bottomSpacer} />
            </ScrollView>
          )}

          {adLoading ? (
            <View style={styles.adOverlay}>
              <ActivityIndicator size="large" color={colors.gold} />
              <Text style={styles.adOverlayText}>
                {i18n.translate("videoAdLoading")}
              </Text>
            </View>
          ) : null}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fffbe6",
  },
  gradient: {
    flex: 1,
  },
  backgroundImage: {
    zIndex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.65)",
    zIndex: 2,
    pointerEvents: "none",
  },
  content: {
    flex: 1,
    zIndex: 3,
  },
  scrollView: {
    flex: 1,
    paddingTop: 8,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: "transparent",
    zIndex: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#5d4e37",
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(250, 247, 242, 0.85)",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(191, 167, 106, 0.25)",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginLeft: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    paddingRight: 18,
    fontSize: 15,
    color: "#5d4e37",
  },
  categorySection: {
    marginBottom: 32,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#bfa76a",
    paddingHorizontal: 20,
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  horizontalList: {
    paddingHorizontal: 20,
  },
  horizontalListCentered: {
    flexGrow: 1,
    justifyContent: "center",
  },
  lastCard: {
    marginRight: -16,
  },
  errorText: {
    color: colors.red,
    marginTop: 10,
  },
  skeletonContainer: {
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomSpacer: {
    height: 100,
  },
  adOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  adOverlayText: {
    marginTop: 12,
    color: colors.white,
    fontSize: 14,
  },
});

export default VideoFavoritesScreen;

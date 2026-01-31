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
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";
import { colors } from "../../../utils/colors";
import { screenName } from "../../../utils/screenName";
import { useAuth } from "../../../context/AuthContext";
import { useAds } from "../../../hooks/useAds";
import { useAdsContext } from "../../../context/AdsContext";
import { EmptyState } from "../components/EmptyState";
import { VideoCard } from "../components/VideoCard";
import { VideoSkeleton } from "../components/VideoSkeleton";
import { PremiumPaywall } from "../components/PremiumPaywall";
import { getPublishedVideos, getVideoCategories } from "../services/videoLibrary.service";
import type { VideoCategory } from "../types/videoCategory";
import type { Video } from "../types/video";
import i18n from "../../../../i18n";
import { AdBanner } from "../../../components/AdBanner/AdBanner";
import {
  recordVideoAppOpenShown,
  recordVideoInterstitialShown,
  recordVideoOpen,
  shouldShowVideoAppOpen,
  shouldShowVideoInterstitial,
} from "../utils/videoAdPolicy";

const VideoLibraryScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { userData } = useAuth() as { userData?: unknown };
  const { adsConfig } = useAdsContext();
  const { showInterstitial, canShowAds, getBannerAdUnitId } = useAds(adsConfig);
  const [videos, setVideos] = useState<Video[]>([]);
  const [categoriesData, setCategoriesData] = useState<VideoCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [adLoading, setAdLoading] = useState(false);
  const [paywallVisible, setPaywallVisible] = useState(false);
  const locale = i18n.locale?.split("-")[0] ?? "en";

  // TODO: Wire real premium status when available on userData.
  const isPremiumUser = Boolean((userData as any)?.isPremiumUser);

  const loadVideos = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setErrorMessage(null);

    try {
      console.log("[VideoLibrary] Fetching videos/categories...");
      const [videoData, categoryData] = await Promise.all([
        getPublishedVideos(),
        getVideoCategories(),
      ]);
      console.log("[VideoLibrary] Videos fetched:", videoData.length);
      console.log("[VideoLibrary] Categories fetched:", categoryData.length);
      console.log(
        "[VideoLibrary] Published videos:",
        videoData.map((v) => ({
          id: v.id,
          title: v.title,
          isPublished: v.isPublished,
          category: v.category,
        }))
      );
      setVideos(videoData);
      setCategoriesData(categoryData);
    } catch (error) {
      console.error("[VideoLibrary] Failed to load videos/categories:", error);
      setErrorMessage(i18n.translate("videoLibraryLoadError"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  const videosByCategory = useMemo(() => {
    const grouped: Record<string, Video[]> = {};
    
    videos.forEach((video) => {
      const cat = video.category || i18n.translate("videoLibraryOtherCategory");
      if (!grouped[cat]) {
        grouped[cat] = [];
      }
      grouped[cat].push(video);
    });
    
    return grouped;
  }, [videos]);

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

  const getLocalizedCategoryName = useCallback(
    (categoryName: string) => {
      const category = categoriesData.find((item) => item.name === categoryName);
      const localizedName = category?.locales?.[locale];
      return localizedName?.trim() || category?.name || categoryName;
    },
    [categoriesData, locale]
  );

  const handlePressVideo = async (video: Video) => {
    if (video.isPremium && !isPremiumUser) {
      setPaywallVisible(true);
      return;
    }

    recordVideoOpen();
    if (!isPremiumUser && canShowAds && shouldShowVideoInterstitial()) {
      setAdLoading(true);
      const shown = await showInterstitial();
      if (shown) {
        recordVideoInterstitialShown();
      }
      setAdLoading(false);
    }
    navigation.navigate(screenName.VideoPlayer, { video });
  };

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      const maybeShowAppOpen = async () => {
        if (cancelled) return;
        if (isPremiumUser || !canShowAds) return;
        if (!shouldShowVideoAppOpen()) return;

        // Using interstitial as an “app-open” surrogate, with strict frequency cap.
        const shown = await showInterstitial();
        if (shown) {
          recordVideoAppOpenShown();
        }
      };

      maybeShowAppOpen();

      return () => {
        cancelled = true;
      };
    }, [canShowAds, isPremiumUser, showInterstitial])
  );

  const renderCategorySection = (categoryName: string, categoryVideos: Video[]) => (
    <View key={categoryName} style={styles.categorySection}>
      <Text style={styles.categoryTitle}>{categoryName}</Text>
      <FlatList
        horizontal
        data={categoryVideos}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => {
          const localizedVideo = getLocalizedVideo(item);
          return (
          <View style={index === categoryVideos.length - 1 ? styles.lastCard : null}>
            <VideoCard
              video={localizedVideo}
              onPress={() => handlePressVideo(localizedVideo)}
              isLocked={Boolean(item.isPremium && !isPremiumUser)}
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

  const SponsoredAdCard = useCallback(() => {
    if (!canShowAds || isPremiumUser) {
      return null;
    }

    return (
      <View style={styles.sponsoredContainer}>
        <BannerAd
          unitId={getBannerAdUnitId()}
          size={BannerAdSize.MEDIUM_RECTANGLE}
          requestOptions={{
            requestNonPersonalizedAdsOnly: !adsConfig?.isPersonalized,
          }}
          onAdLoaded={() => console.log("[VideoLibrary] Sponsored ad loaded")}
          onAdFailedToLoad={(error) =>
            console.error("[VideoLibrary] Sponsored ad failed:", error)
          }
        />
      </View>
    );
  }, [adsConfig?.isPersonalized, canShowAds, getBannerAdUnitId, isPremiumUser]);

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
          {/* Fixed Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{i18n.translate("videoLibraryTitle")}</Text>
            <View style={styles.searchContainer}>
              <Ionicons 
                name="search" 
                size={20} 
                color="#8b7355" 
                style={styles.searchIcon} 
              />
              <TextInput
                placeholder={i18n.translate("videoLibrarySearchPlaceholder")}
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

          {/* Scrollable Content */}
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
                title={i18n.translate("videoLibraryEmptyTitle")}
                message={i18n.translate("videoLibraryEmptyMessage")}
                actionLabel={i18n.translate("videoLibraryRetry")}
                onAction={() => loadVideos(true)}
              />
            </View>
          ) : (
            <ScrollView
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => loadVideos(true)}
                  tintColor={colors.gold}
                />
              }
            >
              {Object.keys(filteredVideosByCategory).map((categoryName, index) => {
                const displayName = getLocalizedCategoryName(categoryName);
                return (
                  <React.Fragment key={categoryName}>
                    {index === 1 ? <SponsoredAdCard /> : null}
                    {renderCategorySection(
                      displayName,
                      filteredVideosByCategory[categoryName]
                    )}
                  </React.Fragment>
                );
              })}

              {!isPremiumUser ? (
                <AdBanner
                  adsConfig={adsConfig}
                  size={BannerAdSize.ADAPTIVE_BANNER}
                  style={styles.bannerContainer}
                />
              ) : null}

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
          <PremiumPaywall
            visible={paywallVisible}
            onClose={() => setPaywallVisible(false)}
            onSubscribe={() => setPaywallVisible(false)}
          />
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
  sponsoredContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  bannerContainer: {
    marginTop: 8,
    marginBottom: 18,
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

export default VideoLibraryScreen;

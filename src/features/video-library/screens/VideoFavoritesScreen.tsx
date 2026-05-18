import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  ensureRewardedPolicyHydrated,
  getPremiumBonusRewardUnlocksRemainingToday,
  recordPremiumBonusRewardUnlockConsumed,
  recordVideoInterstitialShown,
  recordVideoOpen,
  shouldShowVideoInterstitial,
} from "../utils/videoAdPolicy";
import { RewardedAdGate } from "../components/RewardedAdGate";
import { NativeAdCard } from "../components/NativeAdCard";
import {
  getFavoriteVideos,
  toggleFavoriteVideo,
} from "../utils/videoFavorites";
import { getLocalizedVideoForDisplay } from "../utils/videoPlayback";
import { hasPremiumAccess } from "../utils/premiumAccess";

const VideoFavoritesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { userData, refreshUserDataFromServer } = useAuth() as { 
    userData?: unknown;
    refreshUserDataFromServer?: (options?: { force?: boolean }) => Promise<unknown>;
  };
  const isPremiumUser = hasPremiumAccess(userData);
  const { adsConfig } = useAdsContext();
  const { showInterstitial, showRewarded, canShowAds, isRewardedLoaded } = useAds(adsConfig, {
    userHasPremiumAccess: isPremiumUser,
  });
  const [favorites, setFavorites] = useState<Video[]>([]);
  const [categoriesData, setCategoriesData] = useState<VideoCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [adLoading, setAdLoading] = useState(false);
  const [favoriteMap, setFavoriteMap] = useState<Record<string, boolean>>({});
  const [premiumCheckInProgress, setPremiumCheckInProgress] = useState(false);
  const [rewardedGateVideo, setRewardedGateVideo] = useState<Video | null>(null);
  const [rewardedPolicyEpoch, setRewardedPolicyEpoch] = useState(0);
  const locale = i18n.locale?.split("-")[0] ?? "en";

  // Refresh user data from server on focus to ensure premium status is up-to-date
  useFocusEffect(
    useCallback(() => {
      let active = true;
      const refreshPremiumStatus = async () => {
        if (!refreshUserDataFromServer) return;
        try {
          const fresh = await refreshUserDataFromServer();
          if (active && fresh && __DEV__) {
            console.log("[VideoFavorites] Refreshed user premium status from server", {
              hasPremium: hasPremiumAccess(fresh),
            });
          }
        } catch (err) {
          console.warn("[VideoFavorites] Failed to refresh user premium status", err);
        }
      };
      refreshPremiumStatus();
      return () => {
        active = false;
      };
    }, [refreshUserDataFromServer])
  );

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

  /** Re-fetch favorites list when premium flips on so canPlay/embedSrc reflect new entitlements. */
  const prevIsPremiumRef = useRef(isPremiumUser);
  useEffect(() => {
    if (!prevIsPremiumRef.current && isPremiumUser) {
      console.log("[VideoFavorites] Premium activated - reloading favorites to refresh entitlements");
      loadFavorites(true);
    }
    prevIsPremiumRef.current = isPremiumUser;
  }, [isPremiumUser, loadFavorites]);

  useFocusEffect(
    useCallback(() => {
      syncFavorites();
    }, [syncFavorites])
  );

  useFocusEffect(
    useCallback(() => {
      let active = true;
      ensureRewardedPolicyHydrated().then(() => {
        if (active) {
          setRewardedPolicyEpoch((e) => e + 1);
        }
      });
      return () => {
        active = false;
      };
    }, [])
  );

  const getLocalizedVideo = useCallback(
    (video: Video) => {
      return getLocalizedVideoForDisplay(video, locale);
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

  const handlePressVideo = useCallback(async (video: Video) => {
    recordVideoOpen();
    await ensureRewardedPolicyHydrated();

    let effectiveIsPremiumUser = isPremiumUser;
    if (video.isPremium && !isPremiumUser && video.canPlay !== true && refreshUserDataFromServer) {
      try {
        setPremiumCheckInProgress(true);
        const fresh = await refreshUserDataFromServer({ force: true });
        if (fresh && hasPremiumAccess(fresh)) {
          effectiveIsPremiumUser = true;
        }
      } catch {
        // ignore
      } finally {
        setPremiumCheckInProgress(false);
      }
    }

    const isPremiumLocked = video.isPremium && !effectiveIsPremiumUser && video.canPlay !== true;

    if (isPremiumLocked) {
      const bonusUnlocksLeft = getPremiumBonusRewardUnlocksRemainingToday();
      const canOfferRewarded =
        canShowAds && isRewardedLoaded && bonusUnlocksLeft > 0;

      if (canOfferRewarded) {
        setRewardedGateVideo(video);
        return;
      }
      if (bonusUnlocksLeft === 0) {
        setRewardedGateVideo(video);
        return;
      }

      navigation.navigate(screenName.VideoPremiumSubscription, { video });
      return;
    }

    if (!video.isPremium && !effectiveIsPremiumUser && canShowAds && shouldShowVideoInterstitial()) {
      setAdLoading(true);
      const shown = await showInterstitial();
      if (shown) {
        recordVideoInterstitialShown();
      }
      setAdLoading(false);
    }
    navigation.navigate(screenName.VideoPlayer, { video });
  }, [canShowAds, isPremiumUser, isRewardedLoaded, navigation, refreshUserDataFromServer, showInterstitial]);

  const handleToggleFavorite = useCallback(async (video: Video) => {
    const result = await toggleFavoriteVideo(video);
    setFavorites(result.favorites);
    const nextMap: Record<string, boolean> = {};
    result.favorites.forEach((fav) => {
      if (fav?.id) {
        nextMap[fav.id] = true;
      }
    });
    setFavoriteMap(nextMap);
  }, []);

  const handleWatchRewardedAd = async (): Promise<boolean> => {
    if (!rewardedGateVideo) return false;
    const videoToPlay = rewardedGateVideo;

    const success = await showRewarded();
    if (success) {
      await recordPremiumBonusRewardUnlockConsumed();
      setRewardedPolicyEpoch((e) => e + 1);
      setRewardedGateVideo(null);
      navigation.navigate(screenName.VideoPlayer, {
        video: videoToPlay,
        unlockedViaRewardedAd: true,
      });
      return true;
    }
    return false;
  };

  const handleSubscribeFromGate = () => {
    if (rewardedGateVideo) {
      setRewardedGateVideo(null);
      navigation.navigate(screenName.VideoPremiumSubscription, { video: rewardedGateVideo });
    }
  };

  const renderCategorySection = useCallback((categoryName: string, categoryVideos: Video[]) => {
    const shouldShowNativeAds = canShowAds && !isPremiumUser;
    type ListItem = { type: "video"; video: Video } | { type: "ad"; key: string };
    const listItems: ListItem[] = [];
    
    categoryVideos.forEach((video, i) => {
      listItems.push({ type: "video", video });
      if (shouldShowNativeAds && (i + 1) % 4 === 0 && i < categoryVideos.length - 1) {
        listItems.push({ type: "ad", key: `ad-${categoryName}-${i}` });
      }
    });

    return (
      <View key={categoryName} style={styles.categorySection}>
        <Text style={styles.categoryTitle}>
          {getLocalizedCategoryName(categoryName)}
        </Text>
        <FlatList
          horizontal
          data={listItems}
          extraData={{ favoriteMap, isPremiumUser }}
          keyExtractor={(item) => (item.type === "video" ? item.video.id : item.key)}
          renderItem={({ item, index }) => {
            if (item.type === "ad") {
              return <NativeAdCard adsConfig={adsConfig} />;
            }
            const localizedVideo = getLocalizedVideo(item.video);
            const isLastItem = index === listItems.length - 1;
            return (
              <View style={isLastItem ? styles.lastCard : undefined}>
                <VideoCard
                  video={localizedVideo}
                  onPress={() => handlePressVideo(localizedVideo)}
                  isLocked={Boolean(
                    item.video.isPremium &&
                      !isPremiumUser &&
                      item.video.canPlay !== true
                  )}
                  isFavorite={Boolean(favoriteMap[item.video.id])}
                  onToggleFavorite={() => handleToggleFavorite(item.video)}
                />
              </View>
            );
          }}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.horizontalList,
            categoryVideos.length <= 2 && styles.horizontalListCentered,
          ]}
          initialNumToRender={10}
          maxToRenderPerBatch={8}
          windowSize={10}
          nestedScrollEnabled
          removeClippedSubviews={false}
        />
      </View>
    );
  }, [
    adsConfig,
    canShowAds,
    favoriteMap,
    getLocalizedCategoryName,
    getLocalizedVideo,
    handlePressVideo,
    handleToggleFavorite,
    isPremiumUser,
  ]);

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
              nestedScrollEnabled
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

          {adLoading || premiumCheckInProgress ? (
            <View style={styles.adOverlay}>
              <ActivityIndicator size="large" color={colors.gold} />
              <Text style={styles.adOverlayText}>
                {premiumCheckInProgress
                  ? i18n.translate("checkoutAccessCheckingToast", "Verifying access...")
                  : i18n.translate("videoAdLoading")}
              </Text>
            </View>
          ) : null}
        </View>
      </LinearGradient>

      <RewardedAdGate
        key={`rewarded-${rewardedPolicyEpoch}`}
        visible={rewardedGateVideo !== null}
        videoId={rewardedGateVideo?.id ?? ""}
        videoTitle={rewardedGateVideo?.title || ""}
        onWatchAd={handleWatchRewardedAd}
        onSubscribe={handleSubscribeFromGate}
        onClose={() => setRewardedGateVideo(null)}
      />
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

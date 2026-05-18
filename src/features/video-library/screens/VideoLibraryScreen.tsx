import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ImageBackground,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
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
import { getPublishedVideos, getVideoCategories } from "../services/videoLibrary.service";
import type { VideoCategory } from "../types/videoCategory";
import type { Video } from "../types/video";
import i18n from "../../../../i18n";
import { AdBanner } from "../../../components/AdBanner/AdBanner";
import { NativeAdCard } from "../components/NativeAdCard";
import {
  recordVideoAppOpenShown,
  recordVideoInterstitialShown,
  recordVideoOpen,
  shouldShowVideoAppOpen,
  shouldShowVideoInterstitial,
  ensureRewardedPolicyHydrated,
  getPremiumBonusRewardUnlocksRemainingToday,
  recordPremiumBonusRewardUnlockConsumed,
} from "../utils/videoAdPolicy";
import { RewardedAdGate } from "../components/RewardedAdGate";
import {
  getFavoriteVideos,
  toggleFavoriteVideo,
} from "../utils/videoFavorites";
import { getLocalizedVideoForDisplay } from "../utils/videoPlayback";
import { hasPremiumAccess } from "../utils/premiumAccess";

type LibraryRow =
  | { kind: "sponsored" }
  | {
      kind: "category";
      categoryKey: string;
      title: string;
      videos: Video[];
    };

const VideoLibraryScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { userData, refreshUserDataFromServer } = useAuth() as { 
    userData?: unknown;
    refreshUserDataFromServer?: (options?: { force?: boolean }) => Promise<unknown>;
  };
  const isPremiumUser = hasPremiumAccess(userData);
  const { adsConfig } = useAdsContext();
  const { showInterstitial, showRewarded, showAppOpen, canShowAds, getBannerAdUnitId, isRewardedLoaded } = useAds(
    adsConfig,
    { userHasPremiumAccess: isPremiumUser }
  );
  const [videos, setVideos] = useState<Video[]>([]);
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
  // (avoids stale cache showing user as not premium after buying on web or mobile)
  useFocusEffect(
    useCallback(() => {
      let active = true;
      const refreshPremiumStatus = async () => {
        if (!refreshUserDataFromServer) return;
        try {
          const fresh = await refreshUserDataFromServer();
          if (active && fresh && __DEV__) {
            console.log("[VideoLibrary] Refreshed user premium status from server", {
              hasPremium: hasPremiumAccess(fresh),
            });
          }
        } catch (err) {
          console.warn("[VideoLibrary] Failed to refresh user premium status", err);
        }
      };
      refreshPremiumStatus();
      return () => {
        active = false;
      };
    }, [refreshUserDataFromServer])
  );

  const loadVideos = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setErrorMessage(null);

    try {
      const [videoData, categoryData] = await Promise.all([
        getPublishedVideos(),
        getVideoCategories(),
      ]);
      if (__DEV__) {
        console.log("[VideoLibrary] Loaded", videoData.length, "videos,", categoryData.length, "categories");
      }
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

  /** Detect the moment premium flips on (e.g., user just subscribed) and refresh the list
   *  so canPlay/embedSrc/lockedReason reflect the new entitlements without leaving the app. */
  const prevIsPremiumRef = useRef(isPremiumUser);
  useEffect(() => {
    if (!prevIsPremiumRef.current && isPremiumUser) {
      console.log("[VideoLibrary] Premium activated - reloading library to refresh entitlements");
      loadVideos(true);
    }
    prevIsPremiumRef.current = isPremiumUser;
  }, [isPremiumUser, loadVideos]);

  const loadFavorites = useCallback(async () => {
    const favorites = await getFavoriteVideos();
    const map: Record<string, boolean> = {};
    favorites.forEach((item) => {
      if (item?.id) {
        map[item.id] = true;
      }
    });
    setFavoriteMap(map);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites])
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
      return getLocalizedVideoForDisplay(video, locale);
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

  const libraryRows = useMemo((): LibraryRow[] => {
    const keys = Object.keys(filteredVideosByCategory);
    if (keys.length === 0) return [];
    const rows: LibraryRow[] = [];
    const insertSponsored = canShowAds && !isPremiumUser;
    keys.forEach((categoryKey, index) => {
      if (insertSponsored && index === 1) {
        rows.push({ kind: "sponsored" });
      }
      rows.push({
        kind: "category",
        categoryKey,
        title: getLocalizedCategoryName(categoryKey),
        videos: filteredVideosByCategory[categoryKey],
      });
    });
    return rows;
  }, [
    canShowAds,
    filteredVideosByCategory,
    getLocalizedCategoryName,
    isPremiumUser,
  ]);

  const libraryListExtraData = useMemo(
    () => ({
      favoriteMap,
      isPremiumUser,
    }),
    [favoriteMap, isPremiumUser]
  );

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

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      const maybeShowAppOpen = async () => {
        if (cancelled) return;
        if (isPremiumUser || !canShowAds) return;
        if (!shouldShowVideoAppOpen()) return;

        const shown = await showAppOpen();
        if (shown) {
          recordVideoAppOpenShown();
        }
      };

      maybeShowAppOpen();

      return () => {
        cancelled = true;
      };
    }, [canShowAds, isPremiumUser, showAppOpen])
  );

  const handleToggleFavorite = useCallback(async (video: Video) => {
    const result = await toggleFavoriteVideo(video);
    const nextMap: Record<string, boolean> = {};
    result.favorites.forEach((fav) => {
      if (fav?.id) {
        nextMap[fav.id] = true;
      }
    });
    setFavoriteMap(nextMap);
  }, []);

  const renderCategorySection = useCallback(
    (categoryKey: string, categoryTitle: string, categoryVideos: Video[]) => {
      const shouldShowNativeAds = canShowAds && !isPremiumUser;
      type ListItem = { type: "video"; video: Video } | { type: "ad"; key: string };
      const listItems: ListItem[] = [];

      categoryVideos.forEach((video, i) => {
        listItems.push({ type: "video", video });
        if (shouldShowNativeAds && (i + 1) % 4 === 0 && i < categoryVideos.length - 1) {
          listItems.push({ type: "ad", key: `ad-${categoryKey}-${i}` });
        }
      });

      return (
        <View style={styles.categorySection}>
          <Text style={styles.categoryTitle}>{categoryTitle}</Text>
          <FlatList
            horizontal
            data={listItems}
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
            initialNumToRender={4}
            maxToRenderPerBatch={4}
            windowSize={5}
            nestedScrollEnabled
            removeClippedSubviews={Platform.OS === "ios"}
          />
        </View>
      );
    },
    [
      adsConfig,
      canShowAds,
      favoriteMap,
      getLocalizedVideo,
      handlePressVideo,
      handleToggleFavorite,
      isPremiumUser,
    ]
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
            <View style={styles.headerRow}>
              <Text style={styles.title}>
                {i18n.translate("videoLibraryTitle")}
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate(screenName.VideoFavorites)}
                style={styles.headerAction}
              >
                <Ionicons name="heart" size={20} color="#bfa76a" />
              </TouchableOpacity>
            </View>
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
            
            {!isPremiumUser && canShowAds ? (
              <View style={styles.stickyBannerContainer}>
                <AdBanner
                  adsConfig={adsConfig}
                  size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                />
              </View>
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
            <FlatList
              data={libraryRows}
              extraData={libraryListExtraData}
              keyExtractor={(item) =>
                item.kind === "sponsored" ? "sponsored" : item.categoryKey
              }
              renderItem={({ item }) => {
                if (item.kind === "sponsored") {
                  return <SponsoredAdCard />;
                }
                return renderCategorySection(
                  item.categoryKey,
                  item.title,
                  item.videos
                );
              }}
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
              removeClippedSubviews
              initialNumToRender={2}
              maxToRenderPerBatch={2}
              windowSize={5}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => loadVideos(true)}
                  tintColor={colors.gold}
                />
              }
              ListFooterComponent={<View style={styles.bottomSpacer} />}
            />
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(191, 167, 106, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(191, 167, 106, 0.35)",
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
  stickyBannerContainer: {
    marginTop: 8,
    alignItems: "center",
    marginBottom: 4,
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

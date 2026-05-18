import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { WebView } from "react-native-webview";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../../utils/colors";
import { useAdsContext } from "../../../context/AdsContext";
import { useAuth } from "../../../context/AuthContext";
import { useNavBarVisibility } from "../../../context/NavbarVisibilityContext";
import { logDebug, logError } from "../../../utils/Logger";
import { screenName } from "../../../utils/screenName";
import type { Video } from "../types/video";
import { getEmbedUrl } from "../utils/videoEmbed";
import {
  getPlaybackPickerLocales,
  prepareVideoForPlayback,
} from "../utils/videoPlayback";
import { hasPremiumAccess } from "../utils/premiumAccess";
import { VideoLanguagePicker } from "../components/VideoLanguagePicker";
import { EmptyState } from "../components/EmptyState";
import { VideoPremiumUpsell } from "../components/VideoPremiumUpsell";
import i18n from "../../../../i18n";
import { AdBanner } from "../../../components/AdBanner/AdBanner";
import {
  isFavoriteVideo,
  toggleFavoriteVideo,
} from "../utils/videoFavorites";
import {
  fetchVideoLibraryDetail,
  getVideoById,
} from "../services/videoLibrary.service";

type RouteParams = {
  video?: Video;
  /** True only when navigating from a completed rewarded ad for this visit (not persisted). */
  unlockedViaRewardedAd?: boolean;
};

const VideoPlayerScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = route.params as RouteParams | undefined;
  const video = params?.video;
  const unlockedViaRewardedAd = params?.unlockedViaRewardedAd === true;
  const insets = useSafeAreaInsets();
  const { setIsNavBarVisible } = useNavBarVisibility();
  const { userData, refreshUserDataFromServer } = useAuth() as { 
    userData?: unknown;
    refreshUserDataFromServer?: (options?: { force?: boolean }) => Promise<unknown>;
  };
  const [refreshedUserData, setRefreshedUserData] = useState<unknown>(null);
  const { adsConfig } = useAdsContext();
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [retryKey, setRetryKey] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [refreshedVideo, setRefreshedVideo] = useState<Video | null>(null);
  const [detailAvailableLocales, setDetailAvailableLocales] = useState<
    string[] | null
  >(null);
  const [localeSwitchLoading, setLocaleSwitchLoading] = useState(false);

  const effectiveUserData = refreshedUserData ?? userData;
  const isPremiumUser = hasPremiumAccess(effectiveUserData);
  const appLocale = i18n.locale?.split("-")[0] ?? "en";
  /** Prefer freshly-fetched DTO so embedSrc/canPlay reflect the latest premium state without leaving the screen. */
  const sourceVideo = refreshedVideo ?? video;
  const availableLocales = useMemo(() => {
    return sourceVideo
      ? getPlaybackPickerLocales(sourceVideo, detailAvailableLocales)
      : [];
  }, [detailAvailableLocales, sourceVideo]);
  const [playbackLocale, setPlaybackLocale] = useState(appLocale);

  useEffect(() => {
    setDetailAvailableLocales(null);
    setRefreshedVideo(null);
    const nextPlayback = i18n.locale?.split("-")[0] ?? "en";
    setPlaybackLocale(nextPlayback);

    const id = video?.id;
    if (!id) return;

    let cancelled = false;
    (async () => {
      const detail = await fetchVideoLibraryDetail(id, nextPlayback);
      if (cancelled) return;
      if (Array.isArray(detail?.availableLocales) && detail.availableLocales.length > 0) {
        setDetailAvailableLocales(detail.availableLocales);
      }
      if (detail?.video) {
        setRefreshedVideo(detail.video);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [video?.id]);

  useEffect(() => {
    if (availableLocales.length > 0 && !availableLocales.includes(playbackLocale)) {
      setPlaybackLocale(availableLocales[0]);
    }
  }, [availableLocales, playbackLocale]);

  const playableVideo = useMemo(() => {
    return sourceVideo ? prepareVideoForPlayback(sourceVideo, playbackLocale) : null;
  }, [playbackLocale, sourceVideo]);
  const unlockedByReward = unlockedViaRewardedAd;
  const isVideoLocked = Boolean(
    !unlockedByReward &&
      !isPremiumUser &&
      (playableVideo?.lockedReason === "premium_required" ||
        (playableVideo?.isPremium && playableVideo?.canPlay !== true))
  );
  const displayTitle = playableVideo?.title;
  const displayDescription =
    playableVideo?.description;

  const embedUrl = useMemo(() => {
    if (!playableVideo) {
      return null;
    }
    // API may send canPlay: false for premium gated items; embedding is still needed after rewarded unlock (or when premium is detected late).
    const playbackDenied =
      isVideoLocked ||
      (playableVideo.canPlay === false && !unlockedByReward);
    if (playbackDenied) {
      return null;
    }
    const url =
      playableVideo.embedSrc || getEmbedUrl(playableVideo.platform, playableVideo.videoUrl);
    logDebug("[VideoPlayer] video:", {
      id: playableVideo.id,
      title: playableVideo.title,
      platform: playableVideo.platform,
      videoUrl: playableVideo.videoUrl,
      embedUrl: url,
    });
    return url;
  }, [isVideoLocked, playableVideo, unlockedByReward]);

  const isAndroid = Platform.OS === "android";
  const isYoutube = playableVideo?.platform === "youtube";
  const descriptionBottomPadding = Math.max(
    isAndroid ? 72 : 28,
    insets.bottom + (isAndroid ? 24 : 12)
  );

  const embedUrlWithParams = useMemo(() => {
    if (!embedUrl) {
      return null;
    }
    if (playableVideo?.platform !== "youtube") {
      return embedUrl;
    }
    // Keep the player-only UI (no YouTube page title/metadata) and no recommendations.
    const hasQuery = embedUrl.includes("?");
    const sep = hasQuery ? "&" : "?";
    return (
      embedUrl +
      sep +
      `playsinline=1&controls=1&modestbranding=1&rel=0&hl=${encodeURIComponent(playbackLocale)}`
    );
  }, [embedUrl, playbackLocale, playableVideo?.platform]);

  const preferredPlayerUrl = useMemo(() => {
    if (!playableVideo) {
      return null;
    }
    // For YouTube, keep embed to avoid showing recommendations / page UI.
    if (playableVideo.platform === "youtube") {
      return embedUrlWithParams ?? embedUrl;
    }
    return embedUrl;
  }, [embedUrl, embedUrlWithParams, playableVideo]);

  const webViewSource = useMemo(() => {
    const REFERER = "https://cristinazurba.com/";
    if (preferredPlayerUrl) {
      return { uri: preferredPlayerUrl, headers: { Referer: REFERER } };
    }
    return { html: "<html></html>", baseUrl: REFERER };
  }, [preferredPlayerUrl]);

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    setRetryKey((prev) => prev + 1);
  };

  /** Same as web: `/api/premium/video-library/[id]?locale=` returns embed + title for that language. */
  const handlePlaybackLocaleSelect = useCallback(
    async (nextLocale: string) => {
      const id = video?.id;
      if (!id || nextLocale === playbackLocale) {
        return;
      }
      setLocaleSwitchLoading(true);
      try {
        const detail = await fetchVideoLibraryDetail(id, nextLocale);
        if (!detail?.video) {
          throw new Error("missing_video");
        }
        setPlaybackLocale(nextLocale);
        setRefreshedVideo(detail.video);
        if (Array.isArray(detail.availableLocales) && detail.availableLocales.length > 0) {
          setDetailAvailableLocales(detail.availableLocales);
        }
        setHasError(false);
        setRetryKey((k) => k + 1);
      } catch (e) {
        logError("[VideoPlayer] Failed to load video for playback locale", e);
      } finally {
        setLocaleSwitchLoading(false);
      }
    },
    [playbackLocale, video?.id]
  );

  const handleBack = () => {
    navigation.goBack();
  };

  const handleWebViewError = (event: any, label: string) => {
    logError(`[VideoPlayer] WebView ${label}:`, event.nativeEvent);
    setHasError(true);
  };

  useFocusEffect(
    useCallback(() => {
      setIsNavBarVisible(false);
      return () => {
        setIsNavBarVisible(true);
      };
    }, [setIsNavBarVisible])
  );

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const loadFavorite = async () => {
        if (!playableVideo?.id) {
          return;
        }
        const fav = await isFavoriteVideo(playableVideo.id);
        if (active) {
          setIsFavorite(fav);
        }
      };
      loadFavorite();
      return () => {
        active = false;
      };
    }, [playableVideo?.id])
  );

  // Refresh user data from server if video is premium but user appears not premium
  // This handles the case where user purchased on web and cache is stale
  useFocusEffect(
    useCallback(() => {
      let active = true;
      const checkPremiumAccess = async () => {
        // Only refresh if video is premium and user data says not premium
        if (!playableVideo?.isPremium) {
          return;
        }
        if (hasPremiumAccess(userData)) {
          return;
        }
        if (!refreshUserDataFromServer) {
          return;
        }
        
        logDebug("[VideoPlayer] Premium video but no access - refreshing user data from server");
        try {
          const freshData = await refreshUserDataFromServer({ force: true });
          if (active && freshData) {
            setRefreshedUserData(freshData);
            logDebug("[VideoPlayer] Refreshed user data from server", { 
              hasPremium: hasPremiumAccess(freshData) 
            });
          }
        } catch (err) {
          logError("[VideoPlayer] Failed to refresh user data from server", err);
        }
      };
      checkPremiumAccess();
      return () => {
        active = false;
      };
    }, [playableVideo?.isPremium, userData, refreshUserDataFromServer])
  );

  /** When the user becomes premium (or arrives on this screen already premium) but the
   *  DTO carried over from the list has stale canPlay/embedSrc/lockedReason — fetch fresh. */
  useEffect(() => {
    if (!isPremiumUser) return;
    if (!video?.id) return;
    const needsRefresh =
      !playableVideo?.embedSrc ||
      playableVideo.canPlay === false ||
      playableVideo.lockedReason === "premium_required";
    if (!needsRefresh) return;

    let active = true;
    (async () => {
      try {
        const fresh = await getVideoById(video.id, playbackLocale);
        if (active && fresh) {
          setRefreshedVideo(fresh);
          logDebug("[VideoPlayer] Refetched video after premium upgrade", {
            id: fresh.id,
            canPlay: fresh.canPlay,
            hasEmbed: Boolean(fresh.embedSrc),
          });
        }
      } catch (err) {
        logError("[VideoPlayer] Failed to refetch video after premium upgrade", err);
      }
    })();
    return () => {
      active = false;
    };
  }, [
    isPremiumUser,
    video?.id,
    playbackLocale,
    playableVideo?.embedSrc,
    playableVideo?.canPlay,
    playableVideo?.lockedReason,
  ]);

  const handleToggleFavorite = async () => {
    if (!playableVideo) {
      return;
    }
    const result = await toggleFavoriteVideo(playableVideo);
    setIsFavorite(result.isFavorite);
  };

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
        <View style={styles.contentWrapper}>
        <View style={styles.header} pointerEvents="box-none">
          <TouchableOpacity style={styles.headerIcon} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="#5d4e37" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {i18n.translate("videoPlayerBack")}
          </Text>
          <TouchableOpacity
            style={styles.headerIcon}
            onPress={handleToggleFavorite}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={22}
              color={isFavorite ? "#d94f45" : "#5d4e37"}
            />
          </TouchableOpacity>
        </View>

        {!playableVideo ? (
          <EmptyState
            title={i18n.translate("videoUnavailableTitle")}
            message={i18n.translate("videoUnavailableMessage")}
            actionLabel={i18n.translate("videoRetry")}
            onAction={handleRetry}
          />
        ) : isVideoLocked ? (
          <VideoPremiumUpsell
            onSubscribe={() =>
              navigation.navigate(screenName.VideoPremiumSubscription, {
                video: playableVideo,
              })
            }
            onDismiss={() => navigation.goBack()}
          />
        ) : (
          <View style={styles.content}>
            <View
              style={[
                styles.playerContainer,
                styles.playerContainerAspect,
                isAndroid && isYoutube ? styles.playerContainerNoClip : null,
              ]}
            >
              {!preferredPlayerUrl ? (
                <EmptyState
                  title={i18n.translate("videoInvalidLinkTitle")}
                  message={i18n.translate("videoInvalidLinkMessage")}
                  actionLabel={i18n.translate("videoRetry")}
                  onAction={handleRetry}
                />
              ) : hasError ? (
                    <View style={styles.errorContainer}>
                <EmptyState
                  title={i18n.translate("videoPlaybackErrorTitle")}
                  message={i18n.translate("videoPlaybackErrorMessage")}
                  actionLabel={i18n.translate("videoRetry")}
                  onAction={handleRetry}
                />
                    </View>
              ) : (
                <>
                  {isLoading || localeSwitchLoading ? (
                    <View style={styles.loader} pointerEvents="none">
                      <ActivityIndicator size="large" color={colors.gold} />
                    </View>
                  ) : null}
                  <WebView
                    key={`video-webview-${retryKey}-${playbackLocale}`}
                        source={webViewSource}
                    allowsFullscreenVideo
                        onError={(event) => {
                          handleWebViewError(event, "error");
                        }}
                        onHttpError={(event) => {
                          handleWebViewError(event, "HTTP error");
                        }}
                    onLoadStart={() => setIsLoading(true)}
                    onLoadEnd={() => {
                      logDebug("[VideoPlayer] WebView loaded");
                      setIsLoading(false);
                    }}
                    onLoadProgress={(event) => {
                      logDebug("[VideoPlayer] WebView progress:", event.nativeEvent.progress);
                    }}
                    javaScriptEnabled
                    domStorageEnabled
                    originWhitelist={["*"]}
                    allowsInlineMediaPlayback
                    mediaPlaybackRequiresUserAction={false}
                    androidLayerType={isAndroid ? "hardware" : undefined}
                    style={styles.webview}
                  />
                </>
              )}
            </View>
            {availableLocales.length > 1 && (
              <View style={styles.languagePickerContainer}>
                <VideoLanguagePicker
                  availableLocales={availableLocales}
                  selectedLocale={playbackLocale}
                  onSelect={handlePlaybackLocaleSelect}
                />
              </View>
            )}
            {!isPremiumUser ? <AdBanner style={styles.banner} adsConfig={adsConfig} /> : null}
            <Text style={styles.title}>{displayTitle}</Text>
            {displayDescription ? (
              <ScrollView 
                style={styles.descriptionScroll}
                contentContainerStyle={[
                  styles.descriptionScrollContent,
                  { paddingBottom: descriptionBottomPadding },
                ]}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.description}>{displayDescription}</Text>
              </ScrollView>
            ) : null}
          </View>
        )}
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
  contentWrapper: {
    flex: 1,
    zIndex: 3,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight ?? 0 : 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    paddingBottom: 20,
  },
  headerIcon: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "#5d4e37",
    fontSize: 17,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
    letterSpacing: -0.2,
  },
  content: {
    flex: 1,
  },
  playerContainer: {
    width: "100%",
    backgroundColor: colors.pureBlack,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    // On Android, keep a small gap from the header so the YouTube top-right controls
    // (settings gear) aren't under any overlapping touch hitboxes.
    marginTop: Platform.OS === "android" ? 8 : 0,
    marginBottom: 16,
  },
  playerContainerNoClip: {
    // Android WebView + overflow:hidden/borderRadius can make taps unreliable (e.g., YouTube settings gear).
    borderRadius: 0,
    overflow: "visible",
  },
  playerContainerAspect: {
    aspectRatio: 16 / 9,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#bfa76a",
    marginBottom: 12,
    letterSpacing: -0.5,
    lineHeight: 30,
    paddingHorizontal: 4,
  },
  descriptionScroll: {
    flexGrow: 0,
    paddingHorizontal: 4,
  },
  descriptionScrollContent: {
    paddingBottom: 0,
  },
  description: {
    fontSize: 15,
    fontWeight: "400",
    color: "#5d4e37",
    lineHeight: 22,
  },
  banner: {
    marginTop: 6,
    marginBottom: 8,
  },
  languagePickerContainer: {
    marginBottom: 12,
    alignItems: "flex-start",
  },
  loader: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  externalButton: {
    alignSelf: "center",
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#bfa76a",
  },
  externalButtonText: {
    color: "#bfa76a",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: -0.3,
  },
  webview: {
    flex: 1,
    backgroundColor: colors.pureBlack,
  },
});

export default VideoPlayerScreen;

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  Linking,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { WebView } from "react-native-webview";
import { colors } from "../../../utils/colors";
import { useAds } from "../../../hooks/useAds";
import { useAdsContext } from "../../../context/AdsContext";
import { useAuth } from "../../../context/AuthContext";
import type { Video } from "../types/video";
import { getEmbedUrl, getWatchUrl } from "../utils/videoEmbed";
import { EmptyState } from "../components/EmptyState";
import i18n from "../../../../i18n";
import { recordVideoInterstitialShown, shouldShowVideoInterstitial } from "../utils/videoAdPolicy";
import {
  isFavoriteVideo,
  toggleFavoriteVideo,
} from "../utils/videoFavorites";

type RouteParams = {
  video?: Video;
};

const VideoPlayerScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = route.params as RouteParams | undefined;
  const video = params?.video;
  const { userData } = useAuth() as { userData?: unknown };
  const { adsConfig } = useAdsContext();
  const { showInterstitial, showRewarded, canShowAds } = useAds(adsConfig);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [retryKey, setRetryKey] = useState(0);
  const [adLoading, setAdLoading] = useState(false);
  const [rewardedLoading, setRewardedLoading] = useState(false);
  const [unlockedThisSession, setUnlockedThisSession] = useState(false);
  const [unlockModalVisible, setUnlockModalVisible] = useState(false);
  const hasPromptedRef = useRef(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // TODO: Wire real premium status when available on userData.
  const isPremiumUser = Boolean((userData as any)?.isPremiumUser);
  const isVideoLocked = Boolean(video?.isPremium && !isPremiumUser && !unlockedThisSession);
  const locale = i18n.locale?.split("-")[0] ?? "en";
  const localizedFields = video?.locales?.[locale];
  const displayTitle = localizedFields?.title?.trim() || video?.title;
  const displayDescription =
    localizedFields?.description?.trim() || video?.description;

  const embedUrl = useMemo(() => {
    if (!video) {
      return null;
    }
    const url = getEmbedUrl(video.platform, video.videoUrl);
    console.log("[VideoPlayer] video:", {
      id: video.id,
      title: video.title,
      platform: video.platform,
      videoUrl: video.videoUrl,
      embedUrl: url,
    });
    return url;
  }, [video]);

  const watchUrl = useMemo(() => {
    if (!video) {
      return null;
    }
    return getWatchUrl(video.platform, video.videoUrl);
  }, [video]);

  const webViewSource = useMemo(() => {
    const REFERER = "https://cristinazurba.com/";
    if (embedUrl) {
      return { uri: embedUrl, headers: { Referer: REFERER } };
    }
    return { html: "<html></html>", baseUrl: REFERER };
  }, [embedUrl]);

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    setRetryKey((prev) => prev + 1);
  };

  const handleBack = async () => {
    if (!isPremiumUser && canShowAds && shouldShowVideoInterstitial()) {
      setAdLoading(true);
      const shown = await showInterstitial();
      if (shown) {
        recordVideoInterstitialShown();
      }
      setAdLoading(false);
    }
    navigation.goBack();
  };

  const handleWebViewError = (event: any, label: string) => {
    console.error(`[VideoPlayer] WebView ${label}:`, event.nativeEvent);
    setHasError(true);
  };

  const handleOpenExternal = async () => {
    if (!watchUrl) {
      return;
    }
    try {
      await Linking.openURL(watchUrl);
    } catch (error) {
      console.error("[VideoPlayer] Failed to open external URL:", error);
    }
  };

  const handleUnlockWithAd = async () => {
    if (!canShowAds || isPremiumUser) {
      return;
    }
    setRewardedLoading(true);
    const earned = await showRewarded();
    setRewardedLoading(false);
    if (earned) {
      setUnlockedThisSession(true);
      setUnlockModalVisible(false);
    }
  };

  useEffect(() => {
    if (!video) return;
    if (isPremiumUser) return;
    if (!canShowAds) return;
    if (!isVideoLocked) return;
    if (hasPromptedRef.current) return;

    hasPromptedRef.current = true;
    setUnlockModalVisible(true);
  }, [canShowAds, isPremiumUser, isVideoLocked, video]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const loadFavorite = async () => {
        if (!video?.id) {
          return;
        }
        const fav = await isFavoriteVideo(video.id);
        if (active) {
          setIsFavorite(fav);
        }
      };
      loadFavorite();
      return () => {
        active = false;
      };
    }, [video?.id])
  );

  const handleToggleFavorite = async () => {
    if (!video) {
      return;
    }
    const result = await toggleFavoriteVideo(video);
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
        <View style={styles.header}>
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

        <Modal
          visible={unlockModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setUnlockModalVisible(false)}
        >
          <View style={styles.unlockModalOverlay}>
            <View style={styles.unlockModalCard}>
              <Text style={styles.unlockModalTitle}>
                {i18n.translate("videoPremiumBadge")}
              </Text>
              <Text style={styles.unlockModalMessage}>
                {i18n.translate("rewardedUnlockCta")}
              </Text>

              <TouchableOpacity
                onPress={handleUnlockWithAd}
                disabled={rewardedLoading}
                style={styles.unlockModalPrimary}
              >
                {rewardedLoading ? (
                  <ActivityIndicator size="small" color={colors.gold} />
                ) : (
                  <Text style={styles.unlockModalPrimaryText}>
                    {i18n.translate("rewardedUnlockCta")}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setUnlockModalVisible(false);
                  handleBack();
                }}
                style={styles.unlockModalSecondary}
              >
                <Text style={styles.unlockModalSecondaryText}>
                  {i18n.translate("premiumPaywallClose")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {!video ? (
          <EmptyState
            title={i18n.translate("videoUnavailableTitle")}
            message={i18n.translate("videoUnavailableMessage")}
            actionLabel={i18n.translate("videoRetry")}
            onAction={handleRetry}
          />
        ) : (
          <View style={styles.content}>
            <View style={styles.playerContainer}>
              {!embedUrl ? (
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
                      {watchUrl ? (
                        <TouchableOpacity
                          onPress={handleOpenExternal}
                          style={styles.externalButton}
                        >
                          <Text style={styles.externalButtonText}>
                            {i18n.translate("videoOpenExternal")}
                          </Text>
                        </TouchableOpacity>
                      ) : null}
                    </View>
              ) : (
                <>
                  {isLoading ? (
                    <View style={styles.loader}>
                      <ActivityIndicator size="large" color={colors.gold} />
                    </View>
                  ) : null}
                  <WebView
                    key={`video-webview-${retryKey}`}
                        source={webViewSource}
                    allowsFullscreenVideo
                        onError={(event) => handleWebViewError(event, "error")}
                        onHttpError={(event) => handleWebViewError(event, "HTTP error")}
                    onLoadStart={() => setIsLoading(true)}
                    onLoadEnd={() => {
                      console.log("[VideoPlayer] WebView loaded");
                      setIsLoading(false);
                    }}
                    onLoadProgress={(event) => {
                      console.log(
                        "[VideoPlayer] WebView progress:",
                        event.nativeEvent.progress
                      );
                    }}
                    javaScriptEnabled
                    domStorageEnabled
                    originWhitelist={["*"]}
                    allowsInlineMediaPlayback
                    mediaPlaybackRequiresUserAction={false}
                    style={styles.webview}
                  />
                </>
              )}
              {isVideoLocked ? <View style={styles.playerLockOverlay} /> : null}
            </View>
            <Text style={styles.title}>{displayTitle}</Text>
            {displayDescription ? (
              <ScrollView 
                style={styles.descriptionScroll}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.description}>{displayDescription}</Text>
              </ScrollView>
            ) : null}
          </View>
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
  contentWrapper: {
    flex: 1,
    zIndex: 3,
    paddingHorizontal: 20,
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
    aspectRatio: 16 / 9,
    backgroundColor: colors.pureBlack,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 16,
  },
  unlockModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
  },
  unlockModalCard: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 18,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderWidth: 1,
    borderColor: "rgba(191, 167, 106, 0.25)",
  },
  unlockModalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#5d4e37",
    marginBottom: 6,
  },
  unlockModalMessage: {
    fontSize: 14,
    color: "#6b5a44",
    marginBottom: 14,
  },
  unlockModalPrimary: {
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: "center",
    backgroundColor: "rgba(191, 167, 106, 0.18)",
    borderWidth: 1,
    borderColor: "rgba(191, 167, 106, 0.55)",
  },
  unlockModalPrimaryText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#5d4e37",
    letterSpacing: -0.2,
  },
  unlockModalSecondary: {
    alignSelf: "center",
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  unlockModalSecondaryText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#8b7355",
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
    flex: 1,
    paddingHorizontal: 4,
  },
  description: {
    fontSize: 15,
    fontWeight: "400",
    color: "#5d4e37",
    lineHeight: 22,
    paddingBottom: 20,
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
  playerLockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    zIndex: 3,
  },
  adOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
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

export default VideoPlayerScreen;

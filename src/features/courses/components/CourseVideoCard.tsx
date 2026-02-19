import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";

import type { PlaybackResponse, SafeCourseDetail } from "../../../types/courses";
import { courseT } from "../courseI18n";

interface CourseVideoCardProps {
  course: SafeCourseDetail;
  locale: string;
  hasAccess: boolean;
  playback: PlaybackResponse | null;
  playbackLoading: boolean;
  playbackError: string | null;
  lockedMessage?: string;
  allowPreviewFallbackWhenUnlocked?: boolean;
  onRetryPlayback?: () => void;
}

const buildVimeoUrl = (vimeoId: string, controls: boolean): string => {
  const query = controls
    ? "autoplay=0&muted=0&controls=1&title=0&byline=0&portrait=0"
    : "autoplay=1&muted=1&loop=1&background=1&controls=0&title=0&byline=0&portrait=0";

  return `https://player.vimeo.com/video/${encodeURIComponent(vimeoId)}?${query}`;
};

const LockedOverlay: React.FC<{ locale: string; message?: string }> = ({
  locale,
  message,
}) => {
  return (
    <View style={styles.lockedOverlay}>
      <Ionicons name="lock-closed" size={24} color="#fff" />
      <Text style={styles.lockedOverlayText}>
        {message || courseT(locale, "unlockToPlayFullCourse")}
      </Text>
    </View>
  );
};

export const CourseVideoCard: React.FC<CourseVideoCardProps> = ({
  course,
  locale,
  hasAccess,
  playback,
  playbackLoading,
  playbackError,
  lockedMessage,
  allowPreviewFallbackWhenUnlocked = false,
  onRetryPlayback,
}) => {
  const playbackUrl = useMemo(() => {
    if (!playback?.vimeoId) {
      return null;
    }
    return buildVimeoUrl(playback.vimeoId, true);
  }, [playback?.vimeoId]);

  const previewUrl = useMemo(() => {
    if (!course.previewVimeoId) {
      return null;
    }
    return buildVimeoUrl(course.previewVimeoId, false);
  }, [course.previewVimeoId]);

  const previewFallbackUrl = useMemo(() => {
    if (!course.previewVimeoId) {
      return null;
    }
    return buildVimeoUrl(course.previewVimeoId, true);
  }, [course.previewVimeoId]);

  return (
    <View style={styles.container}>
      <View style={styles.mediaFrame}>
        {hasAccess ? (
          playbackLoading ? (
            <View style={styles.centeredState}>
              <ActivityIndicator size="large" color="#c0963a" />
              <Text style={styles.stateText}>{courseT(locale, "loadingPlayback")}</Text>
            </View>
          ) : playbackError ? (
            allowPreviewFallbackWhenUnlocked && previewFallbackUrl ? (
              <WebView
                source={{ uri: previewFallbackUrl }}
                style={styles.webView}
                allowsFullscreenVideo
                mediaPlaybackRequiresUserAction
              />
            ) : (
              <View style={styles.centeredState}>
                <Text style={styles.stateTitle}>
                  {courseT(locale, "playbackErrorTitle")}
                </Text>
                <Text style={styles.stateText}>{playbackError}</Text>
                {onRetryPlayback ? (
                  <TouchableOpacity style={styles.retryButton} onPress={onRetryPlayback}>
                    <Text style={styles.retryButtonText}>{courseT(locale, "retry")}</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            )
          ) : playbackUrl ? (
            <WebView
              source={{ uri: playbackUrl }}
              style={styles.webView}
              allowsFullscreenVideo
              mediaPlaybackRequiresUserAction
            />
          ) : allowPreviewFallbackWhenUnlocked && previewFallbackUrl ? (
            <WebView
              source={{ uri: previewFallbackUrl }}
              style={styles.webView}
              allowsFullscreenVideo
              mediaPlaybackRequiresUserAction
            />
          ) : (
            <View style={styles.centeredState}>
              <Text style={styles.stateTitle}>
                {courseT(locale, "playbackUnavailableTitle")}
              </Text>
              <Text style={styles.stateText}>
                {courseT(locale, "playbackNotReady")}
              </Text>
            </View>
          )
        ) : course.thumbnailUrl ? (
          <>
            <Image source={{ uri: course.thumbnailUrl }} style={styles.thumbnailImage} />
            <LockedOverlay locale={locale} message={lockedMessage} />
          </>
        ) : previewUrl ? (
          <>
            <WebView
              source={{ uri: previewUrl }}
              style={styles.webView}
              allowsFullscreenVideo={false}
              scrollEnabled={false}
              pointerEvents="none"
            />
            <LockedOverlay locale={locale} message={lockedMessage} />
          </>
        ) : (
          <View style={styles.centeredState}>
            <Text style={styles.stateTitle}>
              {courseT(locale, "previewUnavailableTitle")}
            </Text>
            <Text style={styles.stateText}>
              {courseT(locale, "previewNotAvailable")}
            </Text>
            <LockedOverlay locale={locale} message={lockedMessage} />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#dfd1b3",
    backgroundColor: "#1f1a15",
  },
  mediaFrame: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#15110d",
    position: "relative",
  },
  webView: {
    flex: 1,
    backgroundColor: "#000",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  centeredState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    gap: 6,
  },
  stateTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#f4e9d6",
    textAlign: "center",
  },
  stateText: {
    fontSize: 13,
    color: "#d7c5a8",
    textAlign: "center",
    lineHeight: 18,
  },
  retryButton: {
    marginTop: 8,
    backgroundColor: "#d7ad52",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#3d2f19",
  },
  lockedOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 20,
  },
  lockedOverlayText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
});

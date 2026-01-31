import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import { colors } from "../../../utils/colors";
import i18n from "../../../../i18n";
import type { Video } from "../types/video";
import { formatDuration } from "../utils/formatters";
import { getEmbedUrl } from "../utils/videoEmbed";

interface Props {
  video: Video;
  onPress: () => void;
  showPreview?: boolean;
  isLocked?: boolean;
}

export const VideoCard: React.FC<Props> = ({
  video,
  onPress,
  showPreview = true,
  isLocked = false,
}) => {
  const durationLabel = formatDuration(video.durationSeconds);
  const [previewError, setPreviewError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const embedUrl = getEmbedUrl(video.platform, video.videoUrl);
  const shouldShowPreview = showPreview && embedUrl && !previewError;

  const BASE_URL = "https://cristinazurba.com/";
  
  const previewHtml = embedUrl ? `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <style>
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background-color: #000;
          }
          .player {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
          }
          iframe {
            width: 100%;
            height: 100%;
            border: 0;
          }
        </style>
      </head>
      <body>
        <div class="player">
          <iframe
            src="${embedUrl}?autoplay=0&mute=1&controls=0&modestbranding=1&playsinline=1&origin=${encodeURIComponent(BASE_URL)}"
            referrerpolicy="strict-origin-when-cross-origin"
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
          ></iframe>
        </div>
      </body>
    </html>
  ` : null;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.videoWrapper}>
        {shouldShowPreview ? (
          <>
            {isLoading && video.thumbnailUrl && (
              <Image
                source={{ uri: video.thumbnailUrl }}
                style={[styles.video, StyleSheet.absoluteFill]}
                resizeMode="cover"
              />
            )}
            <WebView
              source={{ html: previewHtml!, baseUrl: BASE_URL }}
              style={styles.video}
              onError={() => {
                setPreviewError(true);
                setIsLoading(false);
              }}
              onLoadEnd={() => setIsLoading(false)}
              scrollEnabled={false}
              bounces={false}
              javaScriptEnabled
              domStorageEnabled
              mediaPlaybackRequiresUserAction={false}
              allowsInlineMediaPlayback
              originWhitelist={["*"]}
            />
          </>
        ) : video.thumbnailUrl ? (
          <Image
            source={{ uri: video.thumbnailUrl }}
            style={styles.video}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.videoPlaceholder}>
            <Ionicons name="videocam" size={48} color="#8b7355" />
          </View>
        )}
        {durationLabel ? (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{durationLabel}</Text>
          </View>
        ) : null}
        {video.isPremium ? (
          <View style={styles.premiumBadge}>
            <Ionicons name="sparkles" size={12} color={colors.white} />
            <Text style={styles.premiumText}>
              {i18n.translate("videoPremiumBadge")}
            </Text>
          </View>
        ) : null}
        <View style={styles.playBadge}>
          <Ionicons name="play-circle" size={56} color="rgba(255,255,255,0.9)" />
        </View>
        {isLocked ? (
          <View style={styles.lockOverlay}>
            <Ionicons name="lock-closed" size={20} color={colors.white} />
      </View>
        ) : null}
        <View style={styles.titleOverlay}>
        <Text style={styles.title} numberOfLines={2}>
          {video.title}
        </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 320,
    height: 240,
    borderRadius: 20,
    overflow: "hidden",
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 5,
  },
  videoWrapper: {
    position: "relative",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.9)",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  videoPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(139, 115, 85, 0.15)",
  },
  durationBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.85)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  durationText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  premiumBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(191, 167, 106, 0.95)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  premiumText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
    marginLeft: 4,
  },
  playBadge: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -28,
    marginLeft: -28,
  },
  lockOverlay: {
    position: "absolute",
    right: 12,
    bottom: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  titleOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.white,
    lineHeight: 20,
  },
});

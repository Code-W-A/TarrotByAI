import React, { memo, useEffect, useRef, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../../utils/colors";
import i18n from "../../../../i18n";
import type { Video } from "../types/video";
import { formatDuration } from "../utils/formatters";
import { getAllVideoThumbnailUrls } from "../utils/videoPlayback";
import { getRemoteThumbnailSource } from "../utils/videoEmbed";

interface Props {
  video: Video;
  onPress: () => void;
  isLocked?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

const VideoCardComponent: React.FC<Props> = ({
  video,
  onPress,
  isLocked = false,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const durationLabel = formatDuration(video.durationSeconds);
  const allThumbnailUrls = getAllVideoThumbnailUrls(video, i18n.locale);
  const thumbIndexRef = useRef(0);
  const [displayUri, setDisplayUri] = useState<string | undefined>(
    allThumbnailUrls[0]
  );

  useEffect(() => {
    const urls = getAllVideoThumbnailUrls(video, i18n.locale);
    thumbIndexRef.current = 0;
    setDisplayUri(urls[0]);
  }, [
    video.id,
    video.thumbnailUrl,
    video.videoUrl,
    video.embedSrc,
    video.platform,
    i18n.locale,
  ]);

  const handleImageError = () => {
    const urls = getAllVideoThumbnailUrls(video, i18n.locale);
    const nextIndex = thumbIndexRef.current + 1;
    if (nextIndex < urls.length) {
      thumbIndexRef.current = nextIndex;
      setDisplayUri(urls[nextIndex]);
    } else {
      setDisplayUri(undefined);
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.videoWrapper}>
        {displayUri ? (
          <Image
            source={getRemoteThumbnailSource(displayUri)}
            style={[styles.video, styles.thumbnailImage]}
            resizeMode="cover"
            onError={handleImageError}
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
        {onToggleFavorite ? (
          <TouchableOpacity
            onPress={onToggleFavorite}
            activeOpacity={0.9}
            style={styles.favoriteButton}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={22}
              color={isFavorite ? "#d94f45" : colors.white}
            />
          </TouchableOpacity>
        ) : null}
        {video.isPremium ? (
          <View style={styles.premiumBadge}>
            <Ionicons name="star" size={12} color={colors.white} />
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

export const VideoCard = memo(VideoCardComponent, (prev, next) => {
  return (
    prev.video.id === next.video.id &&
    prev.isLocked === next.isLocked &&
    prev.isFavorite === next.isFavorite &&
    prev.video.title === next.video.title &&
    prev.video.thumbnailUrl === next.video.thumbnailUrl &&
    prev.video.videoUrl === next.video.videoUrl &&
    prev.video.embedSrc === next.video.embedSrc &&
    prev.video.platform === next.video.platform
  );
});

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
    overflow: "hidden",
  },
  thumbnailImage: {
    ...StyleSheet.absoluteFillObject,
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
  favoriteButton: {
    position: "absolute",
    right: 12,
    bottom: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 4,
    elevation: 6,
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
    paddingRight: 56,
    paddingVertical: 12,
    zIndex: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.white,
    lineHeight: 20,
  },
});

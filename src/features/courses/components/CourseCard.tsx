import React, { useMemo } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { WebView } from "react-native-webview";

import type { SafeCourse } from "../../../types/courses";
import { courseT } from "../courseI18n";

interface CourseCardProps {
  course: SafeCourse;
  locale: string;
  onPress: (courseId: string) => void;
}

const buildPreviewUrl = (vimeoId: string): string => {
  return `https://player.vimeo.com/video/${encodeURIComponent(
    vimeoId
  )}?autoplay=1&muted=1&loop=1&background=1&controls=0&title=0&byline=0&portrait=0`;
};

const formatPrice = (value: number, currency: string, locale: string): string => {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
};

export const CourseCard: React.FC<CourseCardProps> = ({ course, locale, onPress }) => {
  const previewUrl = useMemo(() => {
    if (!course.previewVimeoId) {
      return null;
    }

    return buildPreviewUrl(course.previewVimeoId);
  }, [course.previewVimeoId]);

  const useVimeoPreview = course.hasVimeoPreview && !course.hasCustomThumbnail && !!previewUrl;
  const t = (key: Parameters<typeof courseT>[1]) => courseT(locale, key);

  return (
    <TouchableOpacity
      onPress={() => onPress(course.id)}
      style={styles.card}
      activeOpacity={0.9}
    >
      <View style={styles.mediaContainer}>
        {useVimeoPreview ? (
          <WebView
            source={{ uri: previewUrl! }}
            style={styles.previewWebView}
            scrollEnabled={false}
            allowsFullscreenVideo={false}
            pointerEvents="none"
          />
        ) : course.thumbnailUrl ? (
          <Image source={{ uri: course.thumbnailUrl }} style={styles.thumbnailImage} />
        ) : (
          <View style={styles.placeholderMedia}>
            <Text style={styles.placeholderText}>{t("noImage")}</Text>
          </View>
        )}

        {course.featuredOnHome ? (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredBadgeText}>{t("featured")}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {course.title || t("untitledCourse")}
        </Text>
        <Text style={styles.description} numberOfLines={3}>
          {course.description || t("noDescription")}
        </Text>

        <View style={styles.footer}>
          <Text style={styles.priceText}>{formatPrice(course.price, course.currency, locale)}</Text>
          <View style={styles.openButton}>
            <Text style={styles.openButtonText}>{t("open")}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: "#e5d8bf",
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  mediaContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#f1e8d6",
    position: "relative",
  },
  previewWebView: {
    flex: 1,
    backgroundColor: "#000",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholderMedia: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    fontSize: 13,
    color: "#7f7461",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  featuredBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#1f1a15",
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 9,
  },
  featuredBadgeText: {
    color: "#f7e8cc",
    fontSize: 11,
    fontWeight: "700",
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#443826",
    lineHeight: 21,
  },
  description: {
    marginTop: 6,
    fontSize: 13,
    color: "#6f6555",
    lineHeight: 18,
    minHeight: 54,
  },
  footer: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#5a4931",
  },
  openButton: {
    borderRadius: 8,
    backgroundColor: "#d8b267",
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  openButtonText: {
    color: "#3d2f19",
    fontSize: 13,
    fontWeight: "700",
  },
});

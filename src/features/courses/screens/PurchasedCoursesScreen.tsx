import React, { useCallback, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { useAuth } from "../../../context/AuthContext";
import { useLanguage } from "../../../context/LanguageContext";
import { logError, logInfo } from "../../../utils/Logger";
import type { PurchasedCourseItem } from "../../../types/courses";
import { PurchasedCardSkeleton } from "../components/CourseSkeletons";
import { courseT } from "../courseI18n";
import { IOS_COURSES_FREE_MODE_ENABLED } from "../iosCoursesFreeMode";
import { useCourses } from "../useCourses";

const ROUTE_COURSE_LIST = "CoursesList";
const ROUTE_COURSE_DETAIL = "CoursesDetail";
const ROUTE_SIGN_IN = "SignInScreenClinic";

type PurchasedListRow = PurchasedCourseItem | { id: string; __skeleton: true };

const formatDate = (value: string | null, locale: string): string => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(locale);
};

const formatAmount = (value: number, currency: string, locale: string): string => {
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

const PurchasedCard: React.FC<{
  item: PurchasedCourseItem;
  locale: string;
  t: (
    key: Parameters<typeof courseT>[1],
    params?: Record<string, string | number>
  ) => string;
  onOpenCourse: (courseId: string) => void;
  hideAmount?: boolean;
}> = ({ item, locale, t, onOpenCourse, hideAmount = false }) => {
  const course = item.course;
  const isUnavailable = item.courseMissing || !course;

  return (
    <View style={styles.purchaseCard}>
      <View style={styles.purchaseCardMedia}>
        {course?.thumbnailUrl ? (
          <Image source={{ uri: course.thumbnailUrl }} style={styles.purchaseCardImage} />
        ) : (
          <View style={styles.purchasePlaceholder}>
            <Text style={styles.purchasePlaceholderText}>{t("noImage")}</Text>
          </View>
        )}
      </View>

      <View style={styles.purchaseCardBody}>
        <View style={styles.purchaseHeaderRow}>
          <Text style={styles.purchaseTitle} numberOfLines={2}>
            {course?.title || t("unavailableCourse")}
          </Text>
          {isUnavailable ? (
            <View style={styles.unavailableBadge}>
              <Text style={styles.unavailableBadgeText}>{t("unavailable")}</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.purchaseDescription} numberOfLines={3}>
          {course?.description || t("courseNoLongerAvailable")}
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>{t("purchasedLabel")}</Text>
          <Text style={styles.metaValue}>{formatDate(item.purchasedAt, locale)}</Text>
        </View>
        {!hideAmount ? (
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>{t("amountLabel")}</Text>
            <Text style={styles.metaValue}>{formatAmount(item.amountPaid, item.currency, locale)}</Text>
          </View>
        ) : null}

        {course ? (
          <TouchableOpacity style={styles.openButton} onPress={() => onOpenCourse(course.id)}>
            <Text style={styles.openButtonText}>{t("openCourse")}</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.missingCourseHint}>{t("courseDetailsUnavailable")}</Text>
        )}
      </View>
    </View>
  );
};

export const PurchasedCoursesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { language } = useLanguage() as { language: string };
  const { currentUser } = useAuth() as { currentUser?: { getIdToken?: () => Promise<string> } };
  const didRedirectRef = useRef(false);
  const isIosCoursesFreeMode = IOS_COURSES_FREE_MODE_ENABLED;
  const t = (
    key: Parameters<typeof courseT>[1],
    params?: Record<string, string | number>
  ) => courseT(language, key, params);

  const getAuthToken = useCallback(async () => {
    if (!currentUser?.getIdToken) {
      return null;
    }

    return currentUser.getIdToken();
  }, [currentUser]);

  const {
    purchases,
    purchasedLoading,
    purchasedError,
    loadPurchased,
  } = useCourses({
    locale: language,
    getAuthToken,
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
  });

  useEffect(() => {
    if (isIosCoursesFreeMode) {
      if (!didRedirectRef.current) {
        didRedirectRef.current = true;
        logInfo("[PurchasedCoursesScreen] Redirect to course list on iOS free mode");
        navigation.navigate(ROUTE_COURSE_LIST);
      }
      return;
    }

    if (!currentUser) {
      if (!didRedirectRef.current) {
        didRedirectRef.current = true;
        logInfo("[PurchasedCoursesScreen] Redirect to login (no auth user)");
        navigation.navigate(ROUTE_SIGN_IN, {
          returnRoute: "CoursesPurchased",
          returnParams: {},
        });
      }
      return;
    }

    didRedirectRef.current = false;
    logInfo("[PurchasedCoursesScreen] Load purchased courses", {
      locale: language,
    });
    void loadPurchased().catch((error) => {
      logError("[PurchasedCoursesScreen] Load purchased failed", {
        message: error instanceof Error ? error.message : String(error),
      });
    });
  }, [currentUser, isIosCoursesFreeMode, language, loadPurchased, navigation]);

  const openCourse = (courseId: string) => {
    logInfo("[PurchasedCoursesScreen] Open purchased course", { courseId });
    navigation.navigate(ROUTE_COURSE_DETAIL, { courseId });
  };
  const shouldShowSkeletons = purchasedLoading && purchases.length === 0;
  const skeletonRows: PurchasedListRow[] = useRef(
    Array.from({ length: 4 }, (_, index) => ({
      id: `purchased-skeleton-${index}`,
      __skeleton: true as const,
    }))
  ).current;
  const listRows = (shouldShowSkeletons ? skeletonRows : purchases) as PurchasedListRow[];

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate(ROUTE_COURSE_LIST);
  };

  if (isIosCoursesFreeMode) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centeredState}>
          <ActivityIndicator size="small" color="#c79f4a" />
          <Text style={styles.centeredText}>{t("loadingCourses")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentUser) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <TouchableOpacity
          style={[styles.topBackButton, { top: Math.max(insets.top, 8) }]}
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel={t("back")}
        >
          <Ionicons name="arrow-back" size={22} color="#4e3f2c" />
        </TouchableOpacity>
        <View style={styles.centeredState}>
          <ActivityIndicator size="small" color="#c79f4a" />
          <Text style={styles.centeredText}>{t("redirectingToLogin")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableOpacity
        style={[styles.topBackButton, { top: Math.max(insets.top, 8) }]}
        onPress={handleBack}
        accessibilityRole="button"
        accessibilityLabel={t("back")}
      >
        <Ionicons name="arrow-back" size={22} color="#4e3f2c" />
      </TouchableOpacity>
      <FlatList
        data={listRows}
        keyExtractor={(item, index) =>
          "__skeleton" in item ? item.id : `${item.courseId}-${index}`
        }
        contentContainerStyle={styles.contentContainer}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>{t("purchasedCourses")}</Text>
            <Text style={styles.headerSubtitle}>{t("purchasedCoursesSubtitle")}</Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => navigation.navigate(ROUTE_COURSE_LIST)}
            >
              <Text style={styles.browseButtonText}>{t("browseCourses")}</Text>
            </TouchableOpacity>

            {purchasedError ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerTitle}>{t("loadPurchasesErrorTitle")}</Text>
                <Text style={styles.errorBannerText}>{purchasedError.message}</Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => {
                    logInfo("[PurchasedCoursesScreen] Retry load purchased");
                    void loadPurchased({ force: true }).catch((error) => {
                      logError("[PurchasedCoursesScreen] Retry load purchased failed", {
                        message: error instanceof Error ? error.message : String(error),
                      });
                    });
                  }}
                >
                  <Text style={styles.retryButtonText}>{t("retry")}</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {!shouldShowSkeletons && !purchasedError && purchases.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>{t("noPurchasedCourses")}</Text>
                <Text style={styles.emptyText}>{t("purchasedCoursesEmptyDescription")}</Text>
                <TouchableOpacity
                  style={styles.emptyCtaButton}
                  onPress={() => navigation.navigate(ROUTE_COURSE_LIST)}
                >
                  <Text style={styles.emptyCtaText}>{t("browseCourses")}</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        }
        renderItem={({ item }) => {
          if ("__skeleton" in item) {
            return <PurchasedCardSkeleton />;
          }

          return (
            <PurchasedCard
              item={item}
              locale={language}
              t={t}
              onOpenCourse={openCourse}
              hideAmount={isIosCoursesFreeMode}
            />
          );
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f9f3e5",
  },
  topBackButton: {
    position: "absolute",
    left: 12,
    zIndex: 30,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#efe5d3",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#dec79a",
  },
  contentContainer: {
    padding: 12,
    paddingTop: 60,
    paddingBottom: 26,
    gap: 10,
  },
  headerContainer: {
    paddingBottom: 2,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#3f3221",
  },
  headerSubtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: "#675c4d",
  },
  browseButton: {
    marginTop: 14,
    alignSelf: "flex-start",
    borderRadius: 9,
    backgroundColor: "#d9b267",
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  browseButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#3d2f19",
  },
  errorBanner: {
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e6b8b8",
    backgroundColor: "#fff1f1",
    padding: 12,
    gap: 4,
  },
  errorBannerTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#933939",
  },
  errorBannerText: {
    fontSize: 13,
    lineHeight: 18,
    color: "#8a4747",
  },
  retryButton: {
    marginTop: 6,
    alignSelf: "flex-start",
    borderRadius: 8,
    backgroundColor: "#f1c2c2",
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  retryButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#7a2b2b",
  },
  emptyCard: {
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5d8bf",
    backgroundColor: "#fff",
    padding: 14,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#4a3e2d",
  },
  emptyText: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    color: "#6e6555",
  },
  emptyCtaButton: {
    marginTop: 10,
    alignSelf: "flex-start",
    borderRadius: 8,
    backgroundColor: "#e6d1a2",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  emptyCtaText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4f3f2b",
  },
  purchaseCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5d8bf",
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  purchaseCardMedia: {
    width: "100%",
    aspectRatio: 16 / 7,
    backgroundColor: "#efe4cc",
  },
  purchaseCardImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  purchasePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  purchasePlaceholderText: {
    fontSize: 12,
    textTransform: "uppercase",
    color: "#8a7a5f",
  },
  purchaseCardBody: {
    padding: 12,
  },
  purchaseHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  purchaseTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: "#493d2b",
  },
  unavailableBadge: {
    borderRadius: 999,
    backgroundColor: "#efe0ba",
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  unavailableBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#8a6f36",
    textTransform: "uppercase",
  },
  purchaseDescription: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    color: "#6e6454",
  },
  metaRow: {
    marginTop: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaLabel: {
    fontSize: 12,
    color: "#7d715e",
  },
  metaValue: {
    fontSize: 12,
    color: "#594d3d",
    fontWeight: "600",
  },
  openButton: {
    marginTop: 10,
    alignSelf: "flex-start",
    borderRadius: 8,
    backgroundColor: "#d8b267",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  openButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#3d2f19",
  },
  missingCourseHint: {
    marginTop: 10,
    fontSize: 12,
    color: "#7a6e59",
  },
  centeredState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  centeredText: {
    fontSize: 13,
    color: "#6d624f",
  },
});

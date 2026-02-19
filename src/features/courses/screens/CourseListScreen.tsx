import React, { useCallback, useEffect, useMemo } from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { useAuth } from "../../../context/AuthContext";
import { useLanguage } from "../../../context/LanguageContext";
import { logError, logInfo } from "../../../utils/Logger";
import type { SafeCourse } from "../../../types/courses";
import { CourseCard } from "../components/CourseCard";
import { CourseCardSkeleton } from "../components/CourseSkeletons";
import { courseT } from "../courseI18n";
import { useCourses } from "../useCourses";

const ROUTE_COURSE_DETAIL = "CoursesDetail";
const ROUTE_COURSES_PURCHASED = "CoursesPurchased";
const ROUTE_CLINIC_DASHBOARD = "ClinicDashBoard";

type CourseListRow = SafeCourse | { id: string; __skeleton: true };

export const CourseListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { language } = useLanguage() as { language: string };
  const { currentUser } = useAuth() as { currentUser?: { getIdToken?: () => Promise<string> } };
  const t = (key: Parameters<typeof courseT>[1]) => courseT(language, key);

  const getAuthToken = useCallback(async () => {
    if (!currentUser?.getIdToken) {
      return null;
    }

    return currentUser.getIdToken();
  }, [currentUser]);

  const {
    courses,
    listLoading,
    listError,
    loadCourses,
  } = useCourses({
    locale: language,
    getAuthToken,
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
  });

  useEffect(() => {
    logInfo("[CourseListScreen] Initial load", {
      locale: language,
      hasCurrentUser: Boolean(currentUser),
    });
    void loadCourses({ limit: 20 }).catch((error) => {
      logError("[CourseListScreen] Initial load failed", {
        message: error instanceof Error ? error.message : String(error),
      });
    });
  }, [currentUser, language, loadCourses]);

  const numColumns = useMemo(() => {
    if (width >= 1200) {
      return 3;
    }

    if (width >= 700) {
      return 2;
    }

    return 1;
  }, [width]);
  const shouldShowSkeletons = listLoading && courses.length === 0;
  const skeletonRows = useMemo<CourseListRow[]>(() => {
    const count = numColumns === 1 ? 4 : 6;
    return Array.from({ length: count }, (_, index) => ({
      id: `course-skeleton-${index}`,
      __skeleton: true as const,
    }));
  }, [numColumns]);
  const listRows = (shouldShowSkeletons ? skeletonRows : courses) as CourseListRow[];

  const openCourse = (courseId: string) => {
    logInfo("[CourseListScreen] Open course", { courseId });
    navigation.navigate(ROUTE_COURSE_DETAIL, { courseId });
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate(ROUTE_CLINIC_DASHBOARD);
  };

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
        key={numColumns}
        data={listRows}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        contentContainerStyle={styles.contentContainer}
        columnWrapperStyle={numColumns > 1 ? styles.columns : undefined}
        ListHeaderComponent={
          <View style={styles.heroContainer}>
            <Text style={styles.heroTitle}>{t("coursesTitle")}</Text>
            <Text style={styles.heroSubtitle}>
              {t("coursesSubtitle")}
            </Text>
            <TouchableOpacity
              style={styles.purchasedCta}
              onPress={() => navigation.navigate(ROUTE_COURSES_PURCHASED)}
            >
              <Text style={styles.purchasedCtaText}>{t("purchasedCourses")}</Text>
            </TouchableOpacity>

            {listError ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerTitle}>{t("loadCoursesErrorTitle")}</Text>
                <Text style={styles.errorBannerText}>{listError.message}</Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => {
                    logInfo("[CourseListScreen] Retry load");
                    void loadCourses({ limit: 20 }, { force: true }).catch(
                      (error) => {
                        logError("[CourseListScreen] Retry load failed", {
                          message: error instanceof Error ? error.message : String(error),
                        });
                      }
                    );
                  }}
                >
                  <Text style={styles.retryButtonText}>{t("retry")}</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {!shouldShowSkeletons && !listError && courses.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>{t("noCoursesAvailable")}</Text>
                <Text style={styles.emptyText}>
                  {t("coursesAvailableSoon")}
                </Text>
              </View>
            ) : null}
          </View>
        }
        renderItem={({ item }) => {
          if ("__skeleton" in item) {
            return (
              <View style={styles.cardWrapper}>
                <CourseCardSkeleton />
              </View>
            );
          }

          return (
            <View style={styles.cardWrapper}>
              <CourseCard course={item} locale={language} onPress={openCourse} />
            </View>
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
    paddingHorizontal: 12,
    paddingTop: 60,
    paddingBottom: 28,
  },
  heroContainer: {
    paddingTop: 12,
    paddingBottom: 8,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: "#3e3221",
  },
  heroSubtitle: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: "#655b4d",
  },
  purchasedCta: {
    marginTop: 14,
    alignSelf: "flex-start",
    borderRadius: 10,
    backgroundColor: "#d9b267",
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  purchasedCtaText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#3d2f19",
  },
  errorBanner: {
    marginTop: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e6b6b6",
    backgroundColor: "#fff1f1",
    padding: 12,
    gap: 4,
  },
  errorBannerTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#992f2f",
  },
  errorBannerText: {
    fontSize: 13,
    color: "#8c4545",
    lineHeight: 18,
  },
  retryButton: {
    marginTop: 6,
    alignSelf: "flex-start",
    borderRadius: 8,
    backgroundColor: "#f2c1c1",
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  retryButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#7a2c2c",
  },
  emptyCard: {
    marginTop: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5d8bf",
    backgroundColor: "#fff",
    padding: 14,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#4b3f2e",
  },
  emptyText: {
    marginTop: 6,
    fontSize: 13,
    color: "#6f6555",
    lineHeight: 18,
  },
  columns: {
    gap: 10,
  },
  cardWrapper: {
    flex: 1,
    marginTop: 10,
  },
});

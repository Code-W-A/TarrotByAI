import React, { useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import type { CourseCurriculumLesson } from "../../../types/courses";
import { courseT } from "../courseI18n";

interface CourseSidebarCurriculumProps {
  locale: string;
  lessons: CourseCurriculumLesson[];
  hasAccess: boolean;
  onPressCertificate?: () => void;
  certificateLoading?: boolean;
  certificateEnabled?: boolean;
}

export const CourseSidebarCurriculum: React.FC<CourseSidebarCurriculumProps> = ({
  locale,
  lessons,
  hasAccess,
  onPressCertificate,
  certificateLoading = false,
  certificateEnabled = false,
}) => {
  const [expandedLessonIds, setExpandedLessonIds] = useState<Record<string, boolean>>({});

  const sortedLessons = useMemo(() => {
    return [...(lessons || [])].sort((a, b) => a.order - b.order);
  }, [lessons]);

  const completedCount = useMemo(() => {
    return sortedLessons.filter((lesson) => lesson.isCompleted).length;
  }, [sortedLessons]);

  const progressLabel =
    sortedLessons.length > 0
      ? courseT(locale, "progressCompleted", {
          completed: completedCount,
          total: sortedLessons.length,
        })
      : courseT(locale, "noLessons");

  const handleToggle = (lessonId: string) => {
    setExpandedLessonIds((prev) => ({
      ...prev,
      [lessonId]: !prev[lessonId],
    }));
  };

  const canDownloadCertificate = hasAccess && certificateEnabled && !certificateLoading;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{courseT(locale, "curriculum")}</Text>
      <Text style={styles.progress}>{progressLabel}</Text>

      <View style={styles.lessonList}>
        {sortedLessons.length === 0 ? (
          <Text style={styles.emptyText}>{courseT(locale, "noCurriculumDetails")}</Text>
        ) : (
          sortedLessons.map((lesson) => {
            const expanded = !!expandedLessonIds[lesson.id];
            return (
              <View key={lesson.id} style={styles.lessonAccordion}>
                <TouchableOpacity
                  style={styles.lessonAccordionHeader}
                  onPress={() => handleToggle(lesson.id)}
                >
                  <Ionicons
                    name={lesson.isCompleted ? "checkmark-circle" : "ellipse-outline"}
                    size={18}
                    color={lesson.isCompleted ? "#3c9a4f" : "#9f9076"}
                  />
                  <Text style={styles.lessonTitle} numberOfLines={1}>
                    {lesson.title || courseT(locale, "untitledLesson")}
                  </Text>
                  <Ionicons
                    name={expanded ? "chevron-up" : "chevron-down"}
                    size={18}
                    color="#8d7c5e"
                  />
                </TouchableOpacity>

                {expanded ? (
                  <View style={styles.lessonAccordionBody}>
                    {!!lesson.summary?.trim() && (
                      <Text style={styles.lessonSummary}>{lesson.summary}</Text>
                    )}
                    <Text style={styles.lessonMeta}>
                      {typeof lesson.durationMinutes === "number" && lesson.durationMinutes > 0
                        ? `${lesson.durationMinutes} min`
                        : courseT(locale, "durationNotSpecified")}
                    </Text>
                  </View>
                ) : null}
              </View>
            );
          })
        )}
      </View>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPressCertificate}
        disabled={!canDownloadCertificate}
        style={[
          styles.infoCard,
          !hasAccess ? styles.infoCardDisabled : null,
          canDownloadCertificate ? styles.infoCardInteractive : null,
        ]}
      >
        <Text style={styles.infoCardTitle}>{courseT(locale, "certificate")}</Text>
        <Text style={styles.infoCardText}>
          {hasAccess
            ? courseT(locale, "certificateAfterFinalTest")
            : courseT(locale, "certificateLocked")}
        </Text>
        {hasAccess ? (
          <View style={styles.certificateActionRow}>
            {certificateLoading ? (
              <ActivityIndicator size="small" color="#4a3f2d" />
            ) : (
              <Ionicons name="download-outline" size={16} color="#4a3f2d" />
            )}
            <Text style={styles.certificateActionLabel}>
              {courseT(locale, "downloadCertificate")}
            </Text>
          </View>
        ) : null}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e5d8bf",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#443826",
  },
  progress: {
    marginTop: 4,
    fontSize: 13,
    color: "#7f735f",
  },
  lessonList: {
    marginTop: 12,
    gap: 8,
  },
  lessonAccordion: {
    borderWidth: 1,
    borderColor: "#e9deca",
    borderRadius: 10,
    backgroundColor: "#faf7f0",
  },
  lessonAccordionHeader: {
    minHeight: 40,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  lessonTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#4f4535",
  },
  lessonAccordionBody: {
    paddingHorizontal: 10,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: "#ece3d3",
  },
  lessonSummary: {
    marginTop: 8,
    fontSize: 12,
    color: "#695f50",
    lineHeight: 17,
  },
  lessonMeta: {
    marginTop: 6,
    fontSize: 11,
    color: "#8a7d66",
  },
  emptyText: {
    fontSize: 12,
    color: "#7f735f",
  },
  infoCard: {
    marginTop: 12,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#e7dcc6",
    backgroundColor: "#faf6ec",
  },
  infoCardDisabled: {
    opacity: 0.55,
  },
  infoCardInteractive: {
    borderColor: "#ccb37f",
    backgroundColor: "#fef7e9",
  },
  infoCardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4a3f2d",
  },
  infoCardText: {
    marginTop: 4,
    fontSize: 12,
    color: "#706551",
  },
  certificateActionRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  certificateActionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4a3f2d",
  },
});

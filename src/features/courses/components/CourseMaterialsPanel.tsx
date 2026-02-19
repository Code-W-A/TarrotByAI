import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import type { CourseCurriculumLesson } from "../../../types/courses";
import { courseT } from "../courseI18n";

interface CourseMaterialsPanelProps {
  locale: string;
  lessons: CourseCurriculumLesson[];
  sectionSummary?: string;
}

const formatDuration = (minutes: number | null, locale: string): string => {
  if (typeof minutes !== "number" || Number.isNaN(minutes) || minutes <= 0) {
    return courseT(locale, "durationNotSpecified");
  }

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  if (!remaining) {
    return `${hours}h`;
  }

  return `${hours}h ${remaining}m`;
};

export const CourseMaterialsPanel: React.FC<CourseMaterialsPanelProps> = ({
  locale,
  lessons,
  sectionSummary,
}) => {
  const sortedLessons = useMemo(() => {
    return [...(lessons || [])].sort((a, b) => a.order - b.order);
  }, [lessons]);

  if (!sortedLessons.length) {
    return (
      <View style={styles.emptyBox}>
        <Text style={styles.emptyTitle}>{courseT(locale, "noLessonsAvailable")}</Text>
        <Text style={styles.emptyText}>
          {courseT(locale, "curriculumComingSoon")}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      {sortedLessons.map((lesson, index) => {
        return (
          <View key={lesson.id || `${lesson.title}-${index}`} style={styles.lessonCard}>
            <View style={styles.lessonHeader}>
              <Text style={styles.lessonTitle}>
                {lesson.title || courseT(locale, "untitledLesson")}
              </Text>
              <Text style={styles.lessonDuration}>
                {formatDuration(lesson.durationMinutes, locale)}
              </Text>
            </View>
            {!!lesson.summary?.trim() && <Text style={styles.lessonSummary}>{lesson.summary}</Text>}
          </View>
        );
      })}

      <View style={styles.sectionSummaryBox}>
        <Text style={styles.sectionSummaryTitle}>{courseT(locale, "sectionSummary")}</Text>
        <Text style={styles.sectionSummaryText}>
          {sectionSummary?.trim() || courseT(locale, "summaryComingSoon")}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 16,
    gap: 10,
  },
  lessonCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e7dcc6",
    padding: 12,
  },
  lessonHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  lessonTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: "#4b3f2d",
  },
  lessonDuration: {
    fontSize: 12,
    fontWeight: "600",
    color: "#816f4e",
  },
  lessonSummary: {
    marginTop: 8,
    fontSize: 13,
    color: "#6d6559",
    lineHeight: 18,
  },
  sectionSummaryBox: {
    marginTop: 10,
    borderRadius: 12,
    backgroundColor: "#f6f0e2",
    borderWidth: 1,
    borderColor: "#e7dcc6",
    padding: 12,
  },
  sectionSummaryTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4b3f2d",
    marginBottom: 6,
  },
  sectionSummaryText: {
    fontSize: 13,
    color: "#655b4f",
    lineHeight: 18,
  },
  emptyBox: {
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e7dcc6",
    padding: 14,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#4b3f2d",
  },
  emptyText: {
    marginTop: 6,
    fontSize: 13,
    color: "#6d6559",
    lineHeight: 18,
  },
});

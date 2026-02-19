import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { courseT } from "../courseI18n";

export type CourseTabKey = "materials" | "notes" | "curriculum";

interface CourseTabsProps {
  activeTab: CourseTabKey;
  locale: string;
  onChange: (tab: CourseTabKey) => void;
}

const TAB_CONFIG: Array<{ key: CourseTabKey; textKey: Parameters<typeof courseT>[1] }> = [
  { key: "materials", textKey: "materials" },
  { key: "notes", textKey: "notes" },
  { key: "curriculum", textKey: "curriculum" },
];

export const CourseTabs: React.FC<CourseTabsProps> = ({ activeTab, locale, onChange }) => {
  return (
    <View style={styles.container}>
      {TAB_CONFIG.map((tab) => {
        const isActive = tab.key === activeTab;

        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => onChange(tab.key)}
            style={[styles.tabButton, isActive ? styles.tabButtonActive : null]}
          >
            <Text style={[styles.tabLabel, isActive ? styles.tabLabelActive : null]}>
              {courseT(locale, tab.textKey)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: 12,
    backgroundColor: "#f2ede3",
    padding: 4,
    marginTop: 12,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: "#fff8e8",
  },
  tabLabel: {
    fontSize: 14,
    color: "#7a715f",
    fontWeight: "600",
  },
  tabLabelActive: {
    color: "#4f442f",
  },
});

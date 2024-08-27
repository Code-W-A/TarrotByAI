import React, { useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { H4fontBoldYellow } from "../../commonText";
import { colors } from "../../../utils/colors";

const HorizontalTabSelector = ({ isLoading, activeTab, setActiveTab }) => {
  const tabs = [
    "Harmony",
    "Conflict",
    "Contrast",

    "Physical Compatibility",
    "Emotional Compatibility",
    "Sexual Compatibility",
    "Spiritual Compatibility",
    "Financial Compatibility",
  ]; // Lista actualizată de tab-uri

  return (
    <View style={styles.horoscopeTodayContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContainer}
      >
        {tabs.map((tab, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.tabButton,
              activeTab === tab ? styles.activeTab : null,
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <H4fontBoldYellow
              style={[
                styles.textTitles,
                activeTab === tab ? styles.activeText : null,
                // { marginTop: "7%", fontSize: 15, fontWeight: "bold" },
              ]}
            >
              {tab}
            </H4fontBoldYellow>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  activeTab: {
    backgroundColor: colors.gradientLogin2, // O ușoară diferențiere pentru tabul activ
    borderColor: "#000",
    padding: 5,
    // borderWidth: 4,
    borderRadius: 10,
    // borderColor: colors.gradientLogin11, // Contur mai pronunțat pentru tabul activ
  },
  activeText: {
    color: colors.primary3, // Contur mai pronunțat pentru tabul activ
  },
  horoscopeTodayContainer: {},
  scrollViewContainer: {
    alignItems: "center",
    paddingHorizontal: 10,
  },
  tabButton: {
    marginRight: 20,
  },
  textTitles: {
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default HorizontalTabSelector;

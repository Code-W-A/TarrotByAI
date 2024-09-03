// TabNavigator.js
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors } from "../../../utils/colors";
import {
  H7fontBoldWhite,
  H8fontBoldWhite,
  H8fontMediumPrimary,
  H9fontMediumWhite,
} from "../../commonText";
import SpaceSky from "./space-sky";

const MyTopBar = ({ onChangeTab }) => {
  const [activeTab, setActiveTab] = useState("natal");

  return (
    <View style={styles.tabContainer}>
      <SpaceSky />
      <TouchableOpacity
        style={[styles.tab, activeTab === "natal" && styles.activeTab]}
        onPress={() => {
          setActiveTab("natal");
          onChangeTab("natal");
        }}
      >
        <H9fontMediumWhite style={styles.tabText}>
          Natal Chart
        </H9fontMediumWhite>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === "table" && styles.activeTab]}
        onPress={() => {
          setActiveTab("table");
          onChangeTab("table");
        }}
      >
        <H9fontMediumWhite style={styles.tabText}>
          Aspect Table
        </H9fontMediumWhite>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === "interpretation" && styles.activeTab]}
        onPress={() => {
          setActiveTab("interpretation");
          onChangeTab("interpretation");
        }}
      >
        <H9fontMediumWhite style={styles.tabText}>
          Interpretation
        </H9fontMediumWhite>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    paddingTop: 20,
    backgroundColor: colors.primary3,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    padding: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "white",
  },
  tabText: {
    fontSize: 14,
    color: colors.white,
  },
});

export default MyTopBar;

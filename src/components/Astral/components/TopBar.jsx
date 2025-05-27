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

const MyTopBar = ({ onChangeTab }) => {
  const [activeTab, setActiveTab] = useState("natal");

  return (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === "natal" && styles.activeTab]}
        onPress={() => {
          setActiveTab("natal");
          onChangeTab("natal");
        }}
      >
        <Text style={[styles.tabText, activeTab === "natal" ? styles.activeTabText : styles.inactiveTabText]}>Natal Chart</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === "table" && styles.activeTab]}
        onPress={() => {
          setActiveTab("table");
          onChangeTab("table");
        }}
      >
        <Text style={[styles.tabText, activeTab === "table" ? styles.activeTabText : styles.inactiveTabText]}>Aspect Table</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === "interpretation" && styles.activeTab]}
        onPress={() => {
          setActiveTab("interpretation");
          onChangeTab("interpretation");
        }}
      >
        <Text style={[styles.tabText, activeTab === "interpretation" ? styles.activeTabText : styles.inactiveTabText]}>Interpretation</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    paddingTop: 20,
    backgroundColor: 'transparent',
  },
  tab: {
    flex: 1,
    alignItems: "center",
    padding: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FFD700',
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Lora',
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  activeTabText: {
    color: '#FFD700',
  },
  inactiveTabText: {
    color: '#131523',
  },
});

export default MyTopBar;

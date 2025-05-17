import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { colors } from "../../../utils/colors";
import {
  H8fontBoldWhite,
  H8fontMediumPrimary,
  H9fontMediumWhite,
} from "../../commonText";
import i18n from "../../../../i18n"; // Import i18n to handle translations

const screenWidth = Dimensions.get("window").width; // Get the width of the screen

const MyTopBarHoroscope = ({ onChangeTab }) => {
  const [activeTab, setActiveTab] = useState("zilnic");

  const tabNames = [
    { key: "zilnic", label: i18n.translate("daily") },
    { key: "saptamanal", label: i18n.translate("weekly") },
    { key: "lunar", label: i18n.translate("monthly") },
    { key: "anual", label: i18n.translate("yearly") },
  ];

  return (
    <View style={styles.tabContainer}>
      {tabNames.map((tab, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.tab, activeTab === tab.key && styles.activeTab]}
          onPress={() => {
            setActiveTab(tab.key);
            onChangeTab(tab.key);
          }}
        >
          <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    paddingTop: 20,
    backgroundColor: 'transparent',
    marginHorizontal: 0,
    marginTop: 10,
    borderRadius: 0,
  },
  tab: {
    flex: 1, // This ensures each tab takes equal space
    alignItems: "center",
    justifyContent: "center", // Centers the text vertically
    paddingVertical: 10, // Adjust padding as needed
    minWidth: screenWidth / 4, // Ensures a minimum width for each tab based on the screen size
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#C9A14A',
  },
  tabText: {
    fontSize: 14,
    color: '#131523', // bleumarin închis pentru contrast
    textAlign: "center",
    fontFamily: 'Lora',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  activeTabText: {
    color: '#C9A14A',
    fontWeight: '700',
  },
});

export default MyTopBarHoroscope;

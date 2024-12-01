import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../../../utils/colors";
import {
  H6fontBoldPrimary,
  H6fontBoldPurple,
  H6fontBoldYellow,
  H7fontBoldWhite,
  H8fontBoldWhite,
  H8fontMediumWhite,
  H9fontMediumWhite,
} from "../../commonText";
import {
  convertSpeedToSexagesimal,
  decimalToSexagesimal,
  getAspectAngle,
} from "../../../utils/commonUtils";
import i18n from "../../../../i18n";

const AspectTable = ({ houseCusps, planetaryData, aspects }) => {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: "30%", paddingTop: "5%" }}
    >
      <ScrollView
        contentContainerStyle={{
          width: 380,
          flexDirection: "column",
          marginTop: "6%",
        }}
        horizontal={true}
      >
        <View style={styles.tableHeader}>
          <H7fontBoldWhite style={[styles.headerText, styles.columnLarge]}>
            {i18n.translate("House")}
          </H7fontBoldWhite>
          <H7fontBoldWhite style={[styles.headerText, styles.columnLarge]}>
            {i18n.translate("Sign")}
          </H7fontBoldWhite>
          <H7fontBoldWhite style={[styles.headerText, styles.columnLarge]}>
            {i18n.translate("Degree")}
          </H7fontBoldWhite>
        </View>
        {houseCusps?.houses &&
          houseCusps.houses.map((aspect, index) => (
            <View key={index} style={styles.tableRow}>
              <H8fontBoldWhite style={[styles.rowText, styles.columnLarge]}>
                {aspect?.house}
              </H8fontBoldWhite>
              <View style={[styles.iconWithText, styles.columnLarge]}>
                <MaterialCommunityIcons
                  name={`zodiac-${aspect?.sign.toLowerCase()}`}
                  size={24}
                  color={colors.gradientLogin3}
                />
                <H8fontBoldWhite>{aspect?.sign}</H8fontBoldWhite>
              </View>
              <H8fontBoldWhite style={[styles.rowText, styles.columnLarge]}>
                {decimalToSexagesimal(aspect?.full_degree)}
              </H8fontBoldWhite>
            </View>
          ))}
      </ScrollView>

      <View style={styles.sectionTitle}>
        <H6fontBoldYellow>{i18n.translate("Natal")}</H6fontBoldYellow>
      </View>
      <ScrollView
        contentContainerStyle={{
          width: 720,
          flexDirection: "column",
          marginTop: "6%",
        }}
        horizontal={true}
      >
        <View style={[styles.tableHeader]}>
          <H7fontBoldWhite style={[styles.headerText, styles.columnLarge]}>
            {i18n.translate("Planet")}
          </H7fontBoldWhite>
          <H7fontBoldWhite style={[styles.headerText, styles.columnLarge]}>
            {i18n.translate("Sign")}
          </H7fontBoldWhite>
          <H7fontBoldWhite style={[styles.headerText, styles.columnLarge]}>
            {i18n.translate("Degree")}
          </H7fontBoldWhite>
          <H7fontBoldWhite style={[styles.headerText, styles.columnLarge]}>
            {i18n.translate("House")}
          </H7fontBoldWhite>
          <H7fontBoldWhite style={[styles.headerText, styles.columnLarge]}>
            {i18n.translate("Speed")}
          </H7fontBoldWhite>
        </View>
        {planetaryData &&
          planetaryData.map((aspect, index) => (
            <View key={index} style={[styles.tableRow]}>
              <H8fontBoldWhite style={[styles.rowText, styles.columnLarge]}>
                {aspect?.name}
              </H8fontBoldWhite>
              <View style={[styles.iconWithText, styles.columnLarge]}>
                <MaterialCommunityIcons
                  name={`zodiac-${aspect?.sign.toLowerCase()}`}
                  size={24}
                  color={colors.gradientLogin3}
                />
                <H8fontBoldWhite>{aspect?.sign}</H8fontBoldWhite>
              </View>
              <H8fontBoldWhite style={[styles.rowText, styles.columnLarge]}>
                {decimalToSexagesimal(aspect?.full_degree)}
              </H8fontBoldWhite>
              <H8fontBoldWhite style={[styles.rowText, styles.columnLarge]}>
                {aspect?.house}
              </H8fontBoldWhite>
              <H8fontBoldWhite style={[styles.rowText, styles.columnLarge]}>
                {convertSpeedToSexagesimal(aspect?.speed)}
              </H8fontBoldWhite>
            </View>
          ))}
      </ScrollView>

      <View style={styles.sectionTitle}>
        <H6fontBoldYellow>Aspects</H6fontBoldYellow>
      </View>
      <ScrollView
        contentContainerStyle={{
          width: 550,
          flexDirection: "column",
          marginTop: "0%",
        }}
        horizontal={true}
      >
        <View style={[styles.tableHeader, { marginTop: "6%" }]}>
          <H7fontBoldWhite style={[styles.headerText, styles.columnLarge]}>
            {i18n.translate("Planet")}
          </H7fontBoldWhite>
          <H7fontBoldWhite style={[styles.headerText, styles.columnLarge]}>
            Aspect
          </H7fontBoldWhite>
          <H7fontBoldWhite style={[styles.headerText, styles.columnLarge]}>
            {i18n.translate("Planet")}
          </H7fontBoldWhite>
          <H7fontBoldWhite style={[styles.headerText, styles.columnLarge]}>
            {i18n.translate("Orb")}
          </H7fontBoldWhite>
        </View>
        {aspects &&
          aspects.map((aspect, index) => (
            <View key={index} style={styles.tableRow}>
              <H8fontBoldWhite style={[styles.rowText, styles.columnLarge]}>
                {aspect?.planetOne}
              </H8fontBoldWhite>
              <View style={[styles.columnLarge, { flexDirection: "row" }]}>
                <H8fontBoldWhite>{aspect?.aspect}</H8fontBoldWhite>
                <Text style={styles.degreeLabel}>
                  {getAspectAngle(aspect?.aspect)}°
                </Text>
              </View>
              <H8fontBoldWhite style={[styles.rowText, styles.columnLarge]}>
                {aspect?.planetTwo}
              </H8fontBoldWhite>
              <H8fontBoldWhite style={[styles.rowText, styles.columnLarge]}>
                {aspect?.orb}
              </H8fontBoldWhite>
            </View>
          ))}
      </ScrollView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "transparent",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderColor: "#fff",
    paddingBottom: 4,
    justifyContent: "space-around",
  },
  headerText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center", // Ensure text is centered
    flex: 1, // Make sure this matches the flex in rowText if using flex sizing
    paddingHorizontal: 5,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#fff",
    justifyContent: "space-around",
  },
  rowText: {
    color: "#fff",
    fontSize: 15,
    textAlign: "center", // Center the text
    flex: 1, // Ensure this matches the flex in headerText
    paddingHorizontal: 5,
  },
  columnLarge: {
    marginHorizontal: 10, // Adjust or remove if it causes misalignment
    justifyContent: "center",
    alignItems: "center",
  },
  iconWithText: {
    flexDirection: "row",
    alignItems: "center",
    height: "auto",
    justifyContent: "center",
  },
  degreeLabel: {
    position: "relative",
    bottom: 0,
    left: 2,
    fontSize: 8,
    color: "white",
    fontWeight: "bold",
  },
  sectionTitle: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginTop: "10%",
  },
});

export default AspectTable;

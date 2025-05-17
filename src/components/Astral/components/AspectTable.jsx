import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text as RNText } from 'react-native';
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
          <RNText style={[styles.headerText, styles.columnLarge, { color: '#C9A14A', fontFamily: 'Lora', fontWeight: '700' }]}>
            {i18n.translate("House")}
          </RNText>
          <RNText style={[styles.headerText, styles.columnLarge, { color: '#C9A14A', fontFamily: 'Lora', fontWeight: '700' }]}>
            {i18n.translate("Sign")}
          </RNText>
          <RNText style={[styles.headerText, styles.columnLarge, { color: '#C9A14A', fontFamily: 'Lora', fontWeight: '700' }]}>
            {i18n.translate("Degree")}
          </RNText>
        </View>
        {houseCusps?.houses &&
          houseCusps.houses.map((aspect, index) => (
            <View key={index} style={styles.tableRow}>
              <RNText style={[styles.rowText, styles.columnLarge, { color: '#131523', fontFamily: 'Lora', fontWeight: '500' }]}>
                {aspect?.house}
              </RNText>
              <View style={[styles.iconWithText, styles.columnLarge]}>
                <MaterialCommunityIcons
                  name={`zodiac-${aspect?.sign.toLowerCase()}`}
                  size={24}
                  color={'#C9A14A'}
                />
                <RNText style={{ color: '#131523', fontFamily: 'Lora', fontWeight: '500', marginLeft: 4 }}>{aspect?.sign}</RNText>
              </View>
              <RNText style={[styles.rowText, styles.columnLarge, { color: '#131523', fontFamily: 'Lora', fontWeight: '500' }]}>
                {decimalToSexagesimal(aspect?.full_degree)}
              </RNText>
            </View>
          ))}
      </ScrollView>

      <View style={styles.sectionTitle}>
        <RNText style={{ color: '#C9A14A', fontFamily: 'Lora', fontWeight: '700', fontSize: 18 }}>{i18n.translate("Natal")}</RNText>
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
          <RNText style={[styles.headerText, styles.columnLarge, { color: '#C9A14A', fontFamily: 'Lora', fontWeight: '700' }]}>
            {i18n.translate("Planet")}
          </RNText>
          <RNText style={[styles.headerText, styles.columnLarge, { color: '#C9A14A', fontFamily: 'Lora', fontWeight: '700' }]}>
            {i18n.translate("Sign")}
          </RNText>
          <RNText style={[styles.headerText, styles.columnLarge, { color: '#C9A14A', fontFamily: 'Lora', fontWeight: '700' }]}>
            {i18n.translate("Degree")}
          </RNText>
          <RNText style={[styles.headerText, styles.columnLarge, { color: '#C9A14A', fontFamily: 'Lora', fontWeight: '700' }]}>
            {i18n.translate("House")}
          </RNText>
          <RNText style={[styles.headerText, styles.columnLarge, { color: '#C9A14A', fontFamily: 'Lora', fontWeight: '700' }]}>
            {i18n.translate("Speed")}
          </RNText>
        </View>
        {planetaryData &&
          planetaryData.map((aspect, index) => (
            <View key={index} style={[styles.tableRow]}>
              <RNText style={[styles.rowText, styles.columnLarge, { color: '#131523', fontFamily: 'Lora', fontWeight: '500' }]}>
                {aspect?.name}
              </RNText>
              <View style={[styles.iconWithText, styles.columnLarge]}>
                <MaterialCommunityIcons
                  name={`zodiac-${aspect?.sign.toLowerCase()}`}
                  size={24}
                  color={'#C9A14A'}
                />
                <RNText style={{ color: '#131523', fontFamily: 'Lora', fontWeight: '500', marginLeft: 4 }}>{aspect?.sign}</RNText>
              </View>
              <RNText style={[styles.rowText, styles.columnLarge, { color: '#131523', fontFamily: 'Lora', fontWeight: '500' }]}>
                {decimalToSexagesimal(aspect?.full_degree)}
              </RNText>
              <RNText style={[styles.rowText, styles.columnLarge, { color: '#131523', fontFamily: 'Lora', fontWeight: '500' }]}>
                {aspect?.house}
              </RNText>
              <RNText style={[styles.rowText, styles.columnLarge, { color: '#131523', fontFamily: 'Lora', fontWeight: '500' }]}>
                {convertSpeedToSexagesimal(aspect?.speed)}
              </RNText>
            </View>
          ))}
      </ScrollView>

      <View style={styles.sectionTitle}>
        <RNText style={{ color: '#C9A14A', fontFamily: 'Lora', fontWeight: '700', fontSize: 18 }}>Aspects</RNText>
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
          <RNText style={[styles.headerText, styles.columnLarge, { color: '#C9A14A', fontFamily: 'Lora', fontWeight: '700' }]}>
            {i18n.translate("Planet")}
          </RNText>
          <RNText style={[styles.headerText, styles.columnLarge, { color: '#C9A14A', fontFamily: 'Lora', fontWeight: '700' }]}>
            Aspect
          </RNText>
          <RNText style={[styles.headerText, styles.columnLarge, { color: '#C9A14A', fontFamily: 'Lora', fontWeight: '700' }]}>
            {i18n.translate("Planet")}
          </RNText>
          <RNText style={[styles.headerText, styles.columnLarge, { color: '#C9A14A', fontFamily: 'Lora', fontWeight: '700' }]}>
            {i18n.translate("Orb")}
          </RNText>
        </View>
        {aspects &&
          aspects.map((aspect, index) => (
            <View key={index} style={styles.tableRow}>
              <RNText style={[styles.rowText, styles.columnLarge, { color: '#131523', fontFamily: 'Lora', fontWeight: '500' }]}>
                {aspect?.planetOne}
              </RNText>
              <View style={[styles.columnLarge, { flexDirection: "row" }]}>
                <RNText style={{ color: '#131523', fontFamily: 'Lora', fontWeight: '500' }}>{aspect?.aspect}</RNText>
                <RNText style={[styles.degreeLabel, { color: '#131523', fontFamily: 'Lora', fontWeight: '500' }]}>
                  {getAspectAngle(aspect?.aspect)}°
                </RNText>
              </View>
              <RNText style={[styles.rowText, styles.columnLarge, { color: '#131523', fontFamily: 'Lora', fontWeight: '500' }]}>
                {aspect?.planetTwo}
              </RNText>
              <RNText style={[styles.rowText, styles.columnLarge, { color: '#131523', fontFamily: 'Lora', fontWeight: '500' }]}>
                {aspect?.orb}
              </RNText>
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

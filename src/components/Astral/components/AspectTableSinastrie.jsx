import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../../../utils/colors";
import {
  H6fontBoldPrimary,
  H6fontBoldPurple,
  H7fontBoldWhite,
  H8fontMediumWhite,
  H9fontMediumWhite,
} from "../../commonText";
import {
  convertSpeedToSexagesimal,
  decimalToSexagesimal,
  getAspectAngle,
} from "../../../utils/commonUtils";
import i18n from "../../../../i18n";

const AspectTableSinastrie = ({
  houseCusps,
  planetaryData,
  aspects,
  userD,
}) => {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: "30%", paddingTop: "5%" }}
    >
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          marginTop: "0%",
        }}
      >
        <H6fontBoldPurple> {userD?.full_name}</H6fontBoldPurple>
      </View>
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
        {houseCusps?.housesP1.houses &&
          houseCusps.housesP1.houses.map((aspect, index) => (
            <View key={index} style={styles.tableRow}>
              <H8fontMediumWhite style={[styles.rowText, styles.columnLarge]}>
                {aspect?.house}
              </H8fontMediumWhite>
              <View style={[styles.rowText, styles.columnLarge]}>
                <MaterialCommunityIcons
                  name={`zodiac-${aspect?.sign.toLowerCase()}`}
                  size={24}
                  color={colors.gradientLogin3}
                />
                <H8fontMediumWhite>{aspect?.sign}</H8fontMediumWhite>
              </View>
              <H8fontMediumWhite style={[styles.rowText, styles.columnLarge]}>
                {decimalToSexagesimal(aspect?.full_degree)}
              </H8fontMediumWhite>
            </View>
          ))}
      </ScrollView>
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          marginTop: "5%",
        }}
      >
        <H6fontBoldPurple> {userD?.p2?.full_name}</H6fontBoldPurple>
      </View>
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
        {houseCusps?.housesP2.houses &&
          houseCusps.housesP2.houses.map((aspect, index) => (
            <View key={index} style={styles.tableRow}>
              <H8fontMediumWhite style={[styles.rowText, styles.columnLarge]}>
                {aspect?.house}
              </H8fontMediumWhite>
              <View style={[styles.rowText, styles.columnLarge]}>
                <MaterialCommunityIcons
                  name={`zodiac-${aspect?.sign.toLowerCase()}`}
                  size={24}
                  color={colors.gradientLogin3}
                />
                <H8fontMediumWhite>{aspect?.sign}</H8fontMediumWhite>
              </View>
              <H8fontMediumWhite style={[styles.rowText, styles.columnLarge]}>
                {decimalToSexagesimal(aspect?.full_degree)}
              </H8fontMediumWhite>
            </View>
          ))}
      </ScrollView>

      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          marginTop: "10%",
        }}
      >
        <H6fontBoldPurple> {i18n.translate("Natal")}</H6fontBoldPurple>
      </View>
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          marginTop: "0%",
        }}
      >
        <H6fontBoldPurple style={{ fontSize: 20 }}>
          {" "}
          {userD?.full_name}
        </H6fontBoldPurple>
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
          planetaryData.planetaryP1.map((aspect, index) => (
            <View key={index} style={[styles.tableRow]}>
              <H8fontMediumWhite style={[styles.rowText, styles.columnLarge]}>
                {aspect?.name}
              </H8fontMediumWhite>
              <View style={[styles.rowText, styles.columnLarge]}>
                <MaterialCommunityIcons
                  name={`zodiac-${aspect?.sign.toLowerCase()}`}
                  size={24}
                  color={colors.gradientLogin3}
                />
                <H8fontMediumWhite>{aspect?.sign}</H8fontMediumWhite>
              </View>
              <H8fontMediumWhite style={[styles.rowText, styles.columnLarge]}>
                {decimalToSexagesimal(aspect?.full_degree)}
              </H8fontMediumWhite>
              <H8fontMediumWhite style={[styles.rowText, styles.columnLarge]}>
                {aspect?.house}
              </H8fontMediumWhite>
              <H8fontMediumWhite style={[styles.rowText, styles.columnLarge]}>
                {convertSpeedToSexagesimal(aspect?.speed)}
              </H8fontMediumWhite>
            </View>
          ))}
      </ScrollView>

      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          marginTop: "10%",
        }}
      >
        <H6fontBoldPurple style={{ fontSize: 20 }}>
          {" "}
          {userD?.p2?.full_name}
        </H6fontBoldPurple>
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
          planetaryData.planetaryP2.map((aspect, index) => (
            <View key={index} style={[styles.tableRow]}>
              <H8fontMediumWhite style={[styles.rowText, styles.columnLarge]}>
                {aspect?.name}
              </H8fontMediumWhite>
              <View style={[styles.rowText, styles.columnLarge]}>
                <MaterialCommunityIcons
                  name={`zodiac-${aspect?.sign.toLowerCase()}`}
                  size={24}
                  color={colors.gradientLogin3}
                />
                <H8fontMediumWhite>{aspect?.sign}</H8fontMediumWhite>
              </View>
              <H8fontMediumWhite style={[styles.rowText, styles.columnLarge]}>
                {decimalToSexagesimal(aspect?.full_degree)}
              </H8fontMediumWhite>
              <H8fontMediumWhite style={[styles.rowText, styles.columnLarge]}>
                {aspect?.house}
              </H8fontMediumWhite>
              <H8fontMediumWhite style={[styles.rowText, styles.columnLarge]}>
                {convertSpeedToSexagesimal(aspect?.speed)}
              </H8fontMediumWhite>
            </View>
          ))}
      </ScrollView>

      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          marginTop: "10%",
        }}
      >
        <H6fontBoldPurple>Aspects</H6fontBoldPurple>
      </View>
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          marginTop: "0%",
        }}
      >
        <H6fontBoldPurple style={{ fontSize: 20 }}>
          {" "}
          {userD?.full_name}
        </H6fontBoldPurple>
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
          aspects.aspectsP1.map((aspect, index) => (
            <View key={index} style={styles.tableRow}>
              <H8fontMediumWhite style={[styles.rowText, styles.columnLarge]}>
                {aspect?.planetOne}
              </H8fontMediumWhite>

              <View style={[styles.rowText, styles.columnLarge]}>
                <H8fontMediumWhite>{aspect?.aspect}</H8fontMediumWhite>
                <Text style={styles.degreeLabel}>
                  {getAspectAngle(aspect?.aspect)}°
                </Text>
              </View>

              <H8fontMediumWhite style={[styles.rowText, styles.columnLarge]}>
                {aspect?.planetTwo}
              </H8fontMediumWhite>

              <H8fontMediumWhite style={[styles.rowText, styles.columnLarge]}>
                {aspect?.orb}
              </H8fontMediumWhite>
            </View>
          ))}
      </ScrollView>

      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          marginTop: "10%",
        }}
      >
        <H6fontBoldPurple style={{ fontSize: 20 }}>
          {" "}
          {userD?.p2?.full_name}
        </H6fontBoldPurple>
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
          aspects.aspectsP2.map((aspect, index) => (
            <View key={index} style={styles.tableRow}>
              <H8fontMediumWhite style={[styles.rowText, styles.columnLarge]}>
                {aspect?.planetOne}
              </H8fontMediumWhite>

              <View style={[styles.rowText, styles.columnLarge]}>
                <H8fontMediumWhite>{aspect?.aspect}</H8fontMediumWhite>
                <Text style={styles.degreeLabel}>
                  {getAspectAngle(aspect?.aspect)}°
                </Text>
              </View>

              <H8fontMediumWhite style={[styles.rowText, styles.columnLarge]}>
                {aspect?.planetTwo}
              </H8fontMediumWhite>

              <H8fontMediumWhite style={[styles.rowText, styles.columnLarge]}>
                {aspect?.orb}
              </H8fontMediumWhite>
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
  },
  headerText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#fff",
  },
  rowText: {
    color: "#fff",
    fontSize: 15,

    flexDirection: "row",
  },
  columnLarge: {
    flex: 1,
    paddingHorizontal: 5,
    marginHorizontal: 10,
  },
  iconWithText: {
    flexDirection: "row",
    alignItems: "center",
    height: "auto",
    width: "20%",
  },
  columnSmall: {
    flex: 1,
    paddingHorizontal: 5,
    textAlign: "right",
  },
  degreeLabel: {
    position: "relative",
    bottom: -5, // Ajustează dacă este necesar
    left: 2, // Ajustează pentru a plasa textul exact unde dorești
    fontSize: 8, // Alege o dimensiune adecvată pentru textul gradului
    color: "white", // Schimbă culoarea dacă este necesar
    fontWeight: "bold",
  },
});

export default AspectTableSinastrie;

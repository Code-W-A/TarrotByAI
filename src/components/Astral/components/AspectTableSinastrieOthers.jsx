import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../../../utils/colors";
import {
  H6fontBoldPrimary,
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

const AspectTableSinastrieOthers = ({
  houseCusps,
  planetaryData,
  aspects,
  userD,
  currentUserData,
}) => {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: "30%", paddingTop: "5%" }}
    >
      <View style={{ justifyContent: "center", alignItems: "center", width: "100%", marginTop: "0%" }}>
        <Text style={{ color: '#C9A14A', fontFamily: 'Lora', fontWeight: '700', fontSize: 20, textAlign: 'center' }}>{currentUserData?.full_name}</Text>
      </View>
      <ScrollView
        contentContainerStyle={{ width: 380, flexDirection: "column", marginTop: "6%" }}
        horizontal={true}
      >
        <View style={styles.tableHeader}>
          <Text style={styles.headerCellText}>{i18n.translate("House")}</Text>
          <Text style={styles.headerCellText}>{i18n.translate("Sign")}</Text>
          <Text style={styles.headerCellText}>{i18n.translate("Degree")}</Text>
        </View>
        {houseCusps?.housesP1.houses &&
          houseCusps.housesP1.houses.map((aspect, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.cellText}>{aspect?.house}</Text>
              <View style={[styles.columnCell, { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }]}> 
                <MaterialCommunityIcons
                  name={`zodiac-${aspect?.sign.toLowerCase()}`}
                  size={24}
                  color="#C9A14A"
                />
                <Text style={styles.cellText}>{aspect?.sign}</Text>
              </View>
              <Text style={styles.cellText}>{decimalToSexagesimal(aspect?.full_degree)}</Text>
            </View>
          ))}
      </ScrollView>
      <View style={{ justifyContent: "center", alignItems: "center", width: "100%", marginTop: "5%" }}>
        <Text style={{ color: '#C9A14A', fontFamily: 'Lora', fontWeight: '700', fontSize: 20, textAlign: 'center' }}>{userD?.full_name}</Text>
      </View>
      <ScrollView
        contentContainerStyle={{ width: 380, flexDirection: "column", marginTop: "6%" }}
        horizontal={true}
      >
        <View style={styles.tableHeader}>
          <Text style={styles.headerCellText}>{i18n.translate("House")}</Text>
          <Text style={styles.headerCellText}>{i18n.translate("Sign")}</Text>
          <Text style={styles.headerCellText}>{i18n.translate("Degree")}</Text>
        </View>
        {houseCusps?.housesP2.houses &&
          houseCusps.housesP2.houses.map((aspect, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.cellText}>{aspect?.house}</Text>
              <View style={[styles.columnCell, { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }]}> 
                <MaterialCommunityIcons
                  name={`zodiac-${aspect?.sign.toLowerCase()}`}
                  size={24}
                  color="#C9A14A"
                />
                <Text style={styles.cellText}>{aspect?.sign}</Text>
              </View>
              <Text style={styles.cellText}>{decimalToSexagesimal(aspect?.full_degree)}</Text>
            </View>
          ))}
      </ScrollView>
      <View style={{ justifyContent: "center", alignItems: "center", width: "100%", marginTop: "10%" }}>
        <Text style={{ color: '#C9A14A', fontFamily: 'Lora', fontWeight: '700', fontSize: 20, textAlign: 'center' }}>{i18n.translate("Natal")}</Text>
      </View>
      <View style={{ justifyContent: "center", alignItems: "center", width: "100%", marginTop: "0%" }}>
        <Text style={{ color: '#C9A14A', fontFamily: 'Lora', fontWeight: '700', fontSize: 20, textAlign: 'center' }}>{currentUserData?.full_name}</Text>
      </View>
      <ScrollView
        contentContainerStyle={{ width: 720, flexDirection: "column", marginTop: "6%" }}
        horizontal={true}
      >
        <View style={styles.tableHeader}>
          <Text style={styles.headerCellText}>{i18n.translate("Planet")}</Text>
          <Text style={styles.headerCellText}>{i18n.translate("Sign")}</Text>
          <Text style={styles.headerCellText}>{i18n.translate("Degree")}</Text>
          <Text style={styles.headerCellText}>{i18n.translate("House")}</Text>
          <Text style={styles.headerCellText}>{i18n.translate("Speed")}</Text>
        </View>
        {planetaryData &&
          planetaryData.planetaryP1.map((aspect, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.cellText}>{aspect?.name}</Text>
              <View style={[styles.columnCell, { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }]}> 
                <MaterialCommunityIcons
                  name={`zodiac-${aspect?.sign.toLowerCase()}`}
                  size={24}
                  color="#C9A14A"
                />
                <Text style={styles.cellText}>{aspect?.sign}</Text>
              </View>
              <Text style={styles.cellText}>{decimalToSexagesimal(aspect?.full_degree)}</Text>
              <Text style={styles.cellText}>{aspect?.house}</Text>
              <Text style={styles.cellText}>{convertSpeedToSexagesimal(aspect?.speed)}</Text>
            </View>
          ))}
      </ScrollView>
      <View style={{ justifyContent: "center", alignItems: "center", width: "100%", marginTop: "10%" }}>
        <Text style={{ color: '#C9A14A', fontFamily: 'Lora', fontWeight: '700', fontSize: 20, textAlign: 'center' }}>{userD?.full_name}</Text>
      </View>
      <ScrollView
        contentContainerStyle={{ width: 720, flexDirection: "column", marginTop: "6%" }}
        horizontal={true}
      >
        <View style={styles.tableHeader}>
          <Text style={styles.headerCellText}>{i18n.translate("Planet")}</Text>
          <Text style={styles.headerCellText}>{i18n.translate("Sign")}</Text>
          <Text style={styles.headerCellText}>{i18n.translate("Degree")}</Text>
          <Text style={styles.headerCellText}>{i18n.translate("House")}</Text>
          <Text style={styles.headerCellText}>{i18n.translate("Speed")}</Text>
        </View>
        {planetaryData &&
          planetaryData.planetaryP2.map((aspect, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.cellText}>{aspect?.name}</Text>
              <View style={[styles.columnCell, { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }]}> 
                <MaterialCommunityIcons
                  name={`zodiac-${aspect?.sign.toLowerCase()}`}
                  size={24}
                  color="#C9A14A"
                />
                <Text style={styles.cellText}>{aspect?.sign}</Text>
              </View>
              <Text style={styles.cellText}>{decimalToSexagesimal(aspect?.full_degree)}</Text>
              <Text style={styles.cellText}>{aspect?.house}</Text>
              <Text style={styles.cellText}>{convertSpeedToSexagesimal(aspect?.speed)}</Text>
            </View>
          ))}
      </ScrollView>
      <View style={{ justifyContent: "center", alignItems: "center", width: "100%", marginTop: "10%" }}>
        <Text style={{ color: '#C9A14A', fontFamily: 'Lora', fontWeight: '700', fontSize: 20, textAlign: 'center' }}>Aspects</Text>
      </View>
      <View style={{ justifyContent: "center", alignItems: "center", width: "100%", marginTop: "0%" }}>
        <Text style={{ color: '#C9A14A', fontFamily: 'Lora', fontWeight: '700', fontSize: 20, textAlign: 'center' }}>{currentUserData?.full_name}</Text>
      </View>
      <ScrollView
        contentContainerStyle={{ width: 550, flexDirection: "column", marginTop: "0%" }}
        horizontal={true}
      >
        <View style={[styles.tableHeader, { marginTop: "6%" }]}>
          <Text style={{ color: '#131523', fontFamily: 'Lora', fontWeight: '700', flex: 1, paddingHorizontal: 5 }}>{i18n.translate("Planet")}</Text>
          <Text style={{ color: '#131523', fontFamily: 'Lora', fontWeight: '700', flex: 1, paddingHorizontal: 5 }}>Aspect</Text>
          <Text style={{ color: '#131523', fontFamily: 'Lora', fontWeight: '700', flex: 1, paddingHorizontal: 5 }}>{i18n.translate("Planet")}</Text>
          <Text style={{ color: '#131523', fontFamily: 'Lora', fontWeight: '700', flex: 1, paddingHorizontal: 5 }}>{i18n.translate("Orb")}</Text>
        </View>
        {aspects &&
          aspects.aspectsP1.map((aspect, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={{ color: '#131523', fontFamily: 'Lora', fontWeight: '700', flex: 1, paddingHorizontal: 5 }}>{aspect?.planetOne}</Text>
              <View style={[styles.columnLarge, { flexDirection: "row" }]}> 
                <Text style={{ color: '#131523', fontFamily: 'Lora' }}>{aspect?.aspect}</Text>
                <Text style={styles.degreeLabel}>{getAspectAngle(aspect?.aspect)}°</Text>
              </View>
              <Text style={{ color: '#131523', fontFamily: 'Lora', fontWeight: '700', flex: 1, paddingHorizontal: 5 }}>{aspect?.planetTwo}</Text>
              <Text style={{ color: '#131523', fontFamily: 'Lora', fontWeight: '700', flex: 1, paddingHorizontal: 5 }}>{aspect?.orb}</Text>
            </View>
          ))}
      </ScrollView>
      <View style={{ justifyContent: "center", alignItems: "center", width: "100%", marginTop: "10%" }}>
        <Text style={{ color: '#C9A14A', fontFamily: 'Lora', fontWeight: '700', fontSize: 20, textAlign: 'center' }}>{userD?.full_name}</Text>
      </View>
      <ScrollView
        contentContainerStyle={{ width: 550, flexDirection: "column", marginTop: "0%" }}
        horizontal={true}
      >
        <View style={[styles.tableHeader, { marginTop: "6%" }]}>
          <Text style={{ color: '#131523', fontFamily: 'Lora', fontWeight: '700', flex: 1, paddingHorizontal: 5 }}>{i18n.translate("Planet")}</Text>
          <Text style={{ color: '#131523', fontFamily: 'Lora', fontWeight: '700', flex: 1, paddingHorizontal: 5 }}>Aspect</Text>
          <Text style={{ color: '#131523', fontFamily: 'Lora', fontWeight: '700', flex: 1, paddingHorizontal: 5 }}>{i18n.translate("Planet")}</Text>
          <Text style={{ color: '#131523', fontFamily: 'Lora', fontWeight: '700', flex: 1, paddingHorizontal: 5 }}>{i18n.translate("Orb")}</Text>
        </View>
        {aspects &&
          aspects.aspectsP2.map((aspect, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={{ color: '#131523', fontFamily: 'Lora', fontWeight: '700', flex: 1, paddingHorizontal: 5 }}>{aspect?.planetOne}</Text>
              <View style={[styles.columnLarge, { flexDirection: "row" }]}> 
                <Text style={{ color: '#131523', fontFamily: 'Lora' }}>{aspect?.aspect}</Text>
                <Text style={styles.degreeLabel}>{getAspectAngle(aspect?.aspect)}°</Text>
              </View>
              <Text style={{ color: '#131523', fontFamily: 'Lora', fontWeight: '700', flex: 1, paddingHorizontal: 5 }}>{aspect?.planetTwo}</Text>
              <Text style={{ color: '#131523', fontFamily: 'Lora', fontWeight: '700', flex: 1, paddingHorizontal: 5 }}>{aspect?.orb}</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderColor: "#fff",
    paddingBottom: 4,
  },
  headerCellText: {
    color: '#131523',
    fontFamily: 'Lora',
    fontWeight: '700',
    fontSize: 15,
    textAlign: 'center',
    flex: 1,
    paddingHorizontal: 5,
    alignSelf: 'center',
  },
  tableRow: {
    flexDirection: "row",
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#fff",
  },
  cellText: {
    color: '#131523',
    fontFamily: 'Lora',
    fontWeight: '700',
    fontSize: 15,
    textAlign: 'center',
    flex: 1,
    paddingHorizontal: 5,
    alignSelf: 'center',
  },
  columnCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    flexDirection: 'column',
  },
  columnLarge: {
    marginHorizontal: 10, // Adjust or remove if it causes misalignment
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center", // Ensure text is centered
  },
  iconWithText: {
    flexDirection: "row",
    alignItems: "center",
    height: "auto",
    justifyContent: "center",
  },
  degreeLabel: {
    position: "relative",
    bottom: -1,
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

export default AspectTableSinastrieOthers;

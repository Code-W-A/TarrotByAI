import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Fontisto";
import AntDesign from "react-native-vector-icons/AntDesign";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import LinearGradient from "react-native-linear-gradient";
import { colors } from "../utils/colors";
import { TouchableWithoutFeedback } from "react-native";
import i18n from "../../i18n";
import { H9fontMediumLightBlack } from "./commonText";

export const GuestCardApp = ({ info, imgUri, handleDateSelect }) => {
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const handleCallPress = () => {
    Linking.openURL(`tel:${info.phoneNumber}`);
  };
  const handleOpenDirections = () => {
    const latitude = info.clinicCoords.lat;
    const longitude = info.clinicCoords.lng;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    Alert.alert(
      i18n.translate("openGoogleMaps"),
      i18n.translate("openGoogleMapsMessage"),
      [
        {
          text: i18n.translate("cancel"),
          style: "cancel",
        },
        {
          text: i18n.translate("openRouteToClinic"),
          onPress: () => Linking.openURL(url),
        },
      ]
    );
  };

  const handlePress = () => {
    setTooltipVisible(!tooltipVisible);
  };

  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardBody}>
        <View style={styles.cardBodyTop}>
          <Image
            style={styles.cardAvatar}
            source={{
              uri: imgUri,
            }}
          />
          <View style={styles.cardLeftSide}>
            <Text style={styles.tag}>{i18n.translate("doctor")}</Text>
            <Text style={styles.cardName}>{info.doctorName}</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              <Text style={styles.cardTime}>{info.daySelected}</Text>
              <Text style={styles.cardAddress}>
                {" "}
                {i18n.translate("toTime")}{" "}
              </Text>
              <Text style={styles.cardTime}>{info.appointmentInterval}</Text>
            </View>
            <Text style={styles.cardAddress}>{info.clinicName}</Text>
            <Text style={styles.cardAddress}>{info.clinicAddress}</Text>
            {/* <Text style={styles.cardAddress}>{info.detail}</Text> */}
            {/* {info.rating && <Rating rating={info.rating} />} */}
            {/* <View style={styles.iconMore}>
                <Icon name="angle-right" color="gray" />
              </View> */}
          </View>
        </View>

        <View style={styles.cardBodyBottom}>
          {info.isApproved ? (
            <View>
              <TouchableOpacity onPress={handlePress}>
                {/* <View style={styles.cardGroupIcon}>
                  <AntDesign name="checkcircleo" size={32} color={colors.green}/>
                </View> */}
                <View style={{ justifyContent: "flex-end" }}>
                  <H9fontMediumLightBlack style={{ color: colors.primary2 }}>
                    {i18n.translate("confirm")}
                  </H9fontMediumLightBlack>
                </View>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <TouchableOpacity onPress={handlePress}>
                {/* <View style={styles.cardGroupIcon}>
                  <AntDesign name="closecircleo" size={32} color={colors.red}/>
                </View> */}
                <View style={styles.cardGroupIcon}>
                  <H9fontMediumLightBlack style={{ color: colors.red }}>
                    {i18n.translate("notConfirmed")}
                  </H9fontMediumLightBlack>
                </View>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity onPress={handleCallPress}>
            <View style={styles.cardGroupIcon}>
              <AntDesign name="phone" size={32} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleDateSelect(info.daySelected)}>
            <View style={styles.cardGroupIcon}>
              <AntDesign name="calendar" size={32} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleOpenDirections}>
            <View style={styles.cardGroupIcon}>
              <MaterialIcons name="explore" size={32} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tooltipContent: {
    backgroundColor: "white",
    padding: 8,
    borderRadius: 4,
  },
  tooltip: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  tooltipContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  rating: {
    flexDirection: "row",
    marginTop: 2,
  },
  tag: {
    color: colors.facebook,
  },
  cardContainer: {
    paddingHorizontal: 15,
    paddingBottom: 0,
  },
  margin: {
    height: 1,
    backgroundColor: "#F0F1F2",
    width: "100%",
    marginVertical: 10,
  },
  cardBodyBottom: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardBottomTitle: {
    fontSize: 14,
    marginTop: 2,
  },
  cardGroupIcon: {
    justifyContent: "center",
    alignItems: "center",
    width: 70,
  },
  iconMore: {
    position: "absolute",
    bottom: 0,
    right: 0,
  },
  iconLike: {
    position: "absolute",
    top: 0,
    right: 0,
  },
  cardBody: {
    padding: 15,
    backgroundColor: "#fff",
    marginTop: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cardBodyTop: {
    flexDirection: "row",
  },
  cardLeftSide: {
    paddingHorizontal: 10,
    flex: 1,
  },
  cardName: {
    color: "#222",
    fontSize: 18,
    fontWeight: "bold",
  },
  cardTime: {
    color: "#222",
    fontSize: 14,
    fontWeight: "500",
    marginTop: 2,
  },
  cardAddress: {
    color: "gray",
    fontSize: 14,
    fontWeight: "500",
    marginTop: 2,
  },
  cardAvatar: {
    height: 60,
    width: 60,
    backgroundColor: "gray",
    borderRadius: 60,
  },
  cardHeaderContaner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardHeading: {
    fontSize: 24,
    fontWeight: "bold",
  },
  cardMore: {
    fontWeight: "bold",
    color: "#7B6C95",
  },
  faceGroup: {
    justifyContent: "center",
    alignItems: "center",
  },
  faceContainer: {
    backgroundColor: "#fff",
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 20,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginTop: 20,
  },
  faceText: {
    fontSize: 16,
    marginTop: 6,
  },

  container: {
    flex: 1,
  },
  headerContainer: {
    padding: 20,
    paddingHorizontal: 30,
    marginTop: 52,
  },
  heading: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
  },
  desc: {
    fontSize: 20,
    fontWeight: "400",
    color: "#fff",
    marginTop: 2,
  },
  buttonBooks: {
    flexDirection: "row",
    marginTop: 20,
  },
  btnGradient: {
    padding: 10,
    borderRadius: 40,
  },
  btnBookText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
  },
});

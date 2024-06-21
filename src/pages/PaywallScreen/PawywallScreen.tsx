import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  ScrollView,
  Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import AntDesign from "react-native-vector-icons/AntDesign";
import styles from "./PaywallScreen.style";
import { useNavigation } from "@react-navigation/native";
import { EvilIcons } from "@expo/vector-icons";
// import colors from "../../config/colors";
import { colors } from "../../utils/colors";
// import { adapty } from "react-native-adapty";
import Purchases, { PurchasesOffering } from "react-native-purchases";
import useRevenueCat from "../../hooks/useRevenueCat";
import { Alert } from "react-native";
import i18n from "../../../i18n";

const PaywallScreen = ({ navigation }) => {
  const { currentOffering, customerInfo, isProMember } = useRevenueCat();
  // console.log("currentOffering...on paywall", currentOffering?.monthly);
  // const [paywall, setPaywall] = useState(null);

  const close = () => {
    navigation.pop(); //because of implementing TSX
  };

  // const fetchPaywall = async () => {
  //   try {

  //     const paywall = await adapty.getPaywall("default");
  //     const products = await adapty.getPaywallProducts(paywall);

  //   } catch (error) {
  //     console.log("adapty error....", error);
  //   }
  // };

  const handleMonthlyPurchase = async () => {
    try {
      if (!currentOffering?.monthly) return;

      const purchaserInfo = await Purchases.purchasePackage(
        currentOffering.monthly
      );

      console.log(
        "YOU BOUGHT THE MONTHLY SUB",
        purchaserInfo.customerInfo.entitlements.active
      );

      if (purchaserInfo.customerInfo.entitlements.active.pro) {
        navigation.goBack();
      }
    } catch (error) {
      console.log("error handleMonthlyPurchase...", error);
    }
  };

  const handleYearlyPurchase = async () => {
    try {
      if (!currentOffering?.annual) return;

      const purchaserInfo = await Purchases.purchasePackage(
        currentOffering.annual
      );

      console.log(
        "YOU BOUGHT THE ANNUAL SUB",
        purchaserInfo.customerInfo.entitlements.active
      );

      if (purchaserInfo.customerInfo.entitlements.active.pro) {
        navigation.goBack();
      }
    } catch (error) {
      console.log("error handleAnnualPurchase...", error);
    }
  };

  useEffect(() => {}, []);

  if (!currentOffering) {
    return (
      <View style={[styles.activityContainer, styles.activityHorizontal]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable style={styles.close} onPress={close}>
        <EvilIcons name="close" size={24} color="black" />
      </Pressable>
      <Text style={[styles.title, { fontSize: 30, color: "#FFDC6C" }]}>
        {i18n.translate("styleConnectUpgradeMessage0")}
        {/* {paywallData.title} 🌟 */}
      </Text>
      <Text style={[styles.title, { marginBottom: 10, marginTop: 0 }]}>
        {i18n.translate("styleConnectUpgrade")}
        {/* {paywallData.title} 🌟 */}
      </Text>
      <View
        style={{ height: 1, backgroundColor: "white", width: "100%" }}
      ></View>
      <Text
        style={[
          styles.subTitle,
          { marginVertical: 0, marginTop: 15, fontSize: 20 },
        ]}
      >
        {i18n.translate("styleConnectUpgradeMessage1")}
        {/* {paywallData.subtitle} */}
      </Text>
      <Text style={[styles.subTitle, { marginVertical: 0 }]}>
        ✓ {i18n.translate("styleConnectUpgradeMessage2")}
        {/* ✓ {paywallData.features} */}
      </Text>
      <Text style={[styles.subTitle, { marginVertical: 0 }]}>
        ✓ {i18n.translate("styleConnectUpgradeMessage3")}
        {/* ✓ {paywallData.features} */}
      </Text>
      <ScrollView
        contentContainerStyle={{
          alignItems: "center",
          // backgroundColor: "red",
          justifyContent: "center",
          paddingVertical: 50,
        }}
        showsVerticalScrollIndicator={false}
        style={{ maxHeight: "80%" }}
      >
        <View style={styles.blackBox}>
          <View style={{ width: "100%", height: "10%", flexDirection: "row" }}>
            {/* <Image
              source={require("../../images/smallicon.jpg")}
              style={{ width: "15%", height: 22, borderRadius: 5 }}
            /> */}
            <Text style={{ color: "white", marginLeft: 5, fontWeight: "bold" }}>
              {/* <Text style={styles.bold}>only $2/month</Text> */}
              {i18n.translate("styleConnectUpgradeMessage7")}
            </Text>
          </View>
          <Text style={styles.offerTitle}>
            {i18n.translate("styleConnectUpgradeMessage4")}
            <Text style={styles.bold}>
              {" "}
              {i18n.translate("styleConnectUpgradeMessage5")}
            </Text>{" "}
            {i18n.translate("styleConnectUpgradeMessage6")}
          </Text>
          <Pressable
            style={styles.buttonPrimary}
            // onPress={() => purchaseProduct(paywall?.products[0])}
            onPress={handleYearlyPurchase}
            // onPress={() => console.log("ASda")}
          >
            <Text
              style={{ fontSize: 20, color: "#5A5A5A", fontWeight: "bold" }}
            >
              {/* {paywall?.products[0].localizedPrice}/year */}
              {currentOffering?.annual?.product.priceString} /
              {i18n.translate("styleConnectUpgradeMessage10")}
              {/* 20/year */}
            </Text>
          </Pressable>
        </View>
        <View style={styles.blackBox}>
          <View style={{ width: "100%", height: "10%", flexDirection: "row" }}>
            {/* <Image
              source={require("../../images/smallicon.jpg")}
              style={{ width: "15%", height: 22, borderRadius: 5 }}
            /> */}
            <Text style={{ color: "white", marginLeft: 5, fontWeight: "bold" }}>
              {/* <Text style={styles.bold}>only $2/month</Text> */}
              {i18n.translate("styleConnectUpgradeMessage8")}
            </Text>
          </View>
          <Text style={styles.offerTitle}>
            {/* <Text style={styles.bold}>only $2/month</Text> */}
            {i18n.translate("styleConnectUpgradeMessage9")}.{" "}
            {i18n.translate("styleConnectUpgradeMessage6")}
          </Text>
          <Pressable
            style={styles.buttonPrimary}
            // onPress={() => purchaseProduct(paywall?.products[1])}
            onPress={handleMonthlyPurchase}
            // onPress={() => console.log("ASda")}
          >
            <Text
              style={{ fontSize: 20, color: "#5A5A5A", fontWeight: "bold" }}
            >
              {/* {paywall?.products[1].localizedPrice}/month */}
              {currentOffering?.monthly?.product.priceString} /
              {i18n.translate("styleConnectUpgradeMessage11")}
              {/* 20 /month */}
            </Text>
          </Pressable>
          {/* <Footer /> */}
        </View>
      </ScrollView>
      {/* <Text style={styles.offerTitle}>
        <Text style={styles.bold}>$5,49/month</Text> after trial ends.
      </Text>
      <Pressable style={styles.buttonSecondary}>
        <Text style={styles.buttonSecondaryText}>Start free trial</Text>
      </Pressable> */}
    </View>
  );
};

export default PaywallScreen;

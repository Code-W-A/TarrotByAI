import React, { Fragment, useEffect, useState, Component } from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Linking,
} from "react-native";
import { MainContainer } from "../../components/commonViews";
import { NavBar } from "../../common/commonComponents";
import { termAndConditionTextClinic } from "../../utils/constant";
import { uploadTermsConditionsClinicPatient } from "../../utils/UploadFirebaseData";
import { useSelector } from "react-redux";
import { Feather, Octicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { screenName } from "../../utils/screenName";
import i18n from "../../../i18n";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../../utils/colors";

const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
  const paddingToBottom = 20;
  return (
    layoutMeasurement.height + contentOffset.y >=
    contentSize.height - paddingToBottom
  );
};

interface Props extends GeneralProps {
  route: Route<string, object | undefined>;
}

const TermsConditionsClinic: React.FC<Props> = ({}): JSX.Element => {
  const [accepted, setAccepted] = useState(false);
  const navigation = useNavigation();

  return (
    <Fragment>
      <LinearGradient
        colors={[
          colors.gradientLogin1,
          colors.gradientLogin2,
          colors.gradientLogin2,
        ]} // Înlocuiește cu culorile gradientului tău
        style={styles.gradient}
      >
        <View style={styles.container}>
          <TouchableOpacity
            onPress={() => {
              navigation.goBack();
            }}
            style={{ zIndex: 10 }}
          >
            <Octicons
              name="chevron-left"
              size={29}
              color={colors.primary1}
              style={{ marginLeft: 15, zIndex: 5 }}
            />
          </TouchableOpacity>
          <Text style={styles.title}>Terms & Conditions</Text>
          <ScrollView
            style={styles.tcContainer}
            onScroll={({ nativeEvent }) => {
              if (isCloseToBottom(nativeEvent)) {
                setAccepted(true);
              }
            }}
          >
            <Text style={styles.tcP}>{termAndConditionTextClinic[0].text}</Text>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL("https://policies.google.com/terms")
              }
            >
              <Text style={{ color: "blue", textDecorationLine: "underline" }}>
                Google Play Sercices
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL("https://firebase.google/terms/analytics")
              }
            >
              <Text style={{ color: "blue", textDecorationLine: "underline" }}>
                Google Analytics for Firebase
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL("https://firebase.google.com/terms/crashlytics")
              }
            >
              <Text style={{ color: "blue", textDecorationLine: "underline" }}>
                Firebase Crashlytics
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => Linking.openURL("https://expo.io/terms")}
            >
              <Text style={{ color: "blue", textDecorationLine: "underline" }}>
                Expo
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL("https://www.revenuecat.com/terms")
              }
            >
              {/* <Text style={{ color: "blue", textDecorationLine: "underline" }}>
                RevenueCat
              </Text> */}
            </TouchableOpacity>
            <Text style={styles.tcP}>{termAndConditionTextClinic[1].text}</Text>
            <Text style={styles.tcP}>{termAndConditionTextClinic[2].text}</Text>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL("https://policies.google.com/terms")
              }
            >
              <Text style={{ color: "blue", textDecorationLine: "underline" }}>
                Google Play Sercices
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL("https://firebase.google/terms/analytics")
              }
            >
              <Text style={{ color: "blue", textDecorationLine: "underline" }}>
                Google Analytics for Firebase
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL("https://firebase.google.com/terms/crashlytics")
              }
            >
              <Text style={{ color: "blue", textDecorationLine: "underline" }}>
                Firebase Crashlytics
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => Linking.openURL("https://expo.io/terms")}
            >
              <Text style={{ color: "blue", textDecorationLine: "underline" }}>
                Expo
              </Text>
            </TouchableOpacity>
            {/* <TouchableOpacity
              onPress={() =>
                Linking.openURL("https://www.revenuecat.com/terms")
              }
            >
              <Text style={{ color: "blue", textDecorationLine: "underline" }}>
                RevenueCat
              </Text>
            </TouchableOpacity> */}
            <Text style={styles.tcP}>{termAndConditionTextClinic[3].text}</Text>
            {/* <Text style={styles.tcP}>
                The use of this website is subject to the following terms of use
              </Text> */}
          </ScrollView>
        </View>
      </LinearGradient>
    </Fragment>
  );
};

const { width, height } = Dimensions.get("window");

const styles = {
  gradient: {
    flex: 1,
    width: "100%",
    height: "100%",
    paddingBottom: 100,
    // Alte stiluri necesare pentru a pozitiona gradientul după cum este necesar
  },
  container: {
    padding: 30,
    paddingTop: "20%",
    height: "100%",
  },
  title: {
    fontSize: 22,
    alignSelf: "center",
    color: "white",
  },
  tcP: {
    marginTop: 10,
    marginBottom: 10,
    fontSize: 12,
  },
  tcP: {
    marginTop: 10,
    fontSize: 12,
  },
  tcL: {
    marginLeft: 10,
    marginTop: 10,
    marginBottom: 10,
    fontSize: 12,
  },
  tcContainer: {
    marginTop: 15,
    // marginBottom: 15,
    height: height * 0.7,
  },

  button: {
    backgroundColor: "#136AC7",
    borderRadius: 5,
    padding: 10,
    justifyContent: "center",
    alignSelf: "center",
    flexDirection: "row",
    width: 200,
  },

  buttonDisabled: {
    backgroundColor: "#999",
    borderRadius: 5,
    padding: 10,
    justifyContent: "center",
    alignSelf: "center",
    flexDirection: "row",
  },

  buttonLabel: {
    fontSize: 14,
    color: "#FFF",
  },
};

export default TermsConditionsClinic;

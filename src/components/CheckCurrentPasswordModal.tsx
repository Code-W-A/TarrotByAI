import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Image, Modal, TouchableOpacity, View, StyleSheet } from "react-native";
import { H15fontMediumBlack } from "./commonText";
import { colors } from "../utils/colors";
import BasicInfoPatient from "../pages/profileSettings/basicInfoPatient";
import { Input } from "react-native-elements";
import { Feather } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import i18n from "../../i18n";
import { Button } from "./commonButton";
import { LinearGradient } from "expo-linear-gradient";

export default function CheckCurrentPasswordModal({
  setIsModalVisible,
  isModalVisible,
  setCurrentPassword,
  handleSubmit,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [emailTxt, setEmailTxt] = useState("");

  return (
    <Modal animationType="fade" transparent={true} visible={isModalVisible}>
      <View style={[styles.centeredView]}>
        <LinearGradient
          colors={["rgba(0, 0, 0, 0.9)", "rgba(67, 67, 67, 0.9)"]}
          style={{
            flex: 1,
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <View style={{ alignItems: "flex-end", height: "auto" }}>
            <TouchableOpacity
              style={styles.modalView}
              onPress={() => setIsModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
          </View>

          <Input
            containerStyle={{}}
            secureTextEntry={showPassword ? false : true}
            disabledInputStyle={{ background: "#ddd" }}
            inputContainerStyle={{}}
            // errorMessage="Oops! that's not correct."
            errorStyle={{}}
            errorProps={{}}
            inputStyle={{ color: "#FFFFFF" }}
            label={i18n.translate("confirmPassword")}
            labelStyle={{}}
            labelProps={{}}
            // leftIcon={<Icon name="account-outline" size={20} />}
            leftIconContainerStyle={{}}
            rightIcon={
              showPassword ? (
                <Feather
                  onPress={() => setShowPassword(!showPassword)}
                  name="eye"
                  size={24}
                  color="grey"
                />
              ) : (
                <Feather
                  onPress={() => setShowPassword(!showPassword)}
                  name="eye-off"
                  size={24}
                  color="grey"
                />
              )
            }
            rightIconContainerStyle={{}}
            placeholder={i18n.translate("enterPasswordCurrent")}
            onChangeText={(value) => setCurrentPassword(value)}
          />
          <View
            style={{
              display: "flex",
              // justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View style={{ alignItems: "center", height: "auto", width: 200 }}>
              <Button
                disabled={false}
                borderWidth={0.2}
                bgColor={colors.primary2}
                label={i18n.translate("saveChanges")}
                borderColor={colors.white}
                success={true}
                funCallback={handleSubmit}
              />
            </View>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // marginTop: 22,
    backgroundColor: "rgba(239, 239, 240, 0.3)",
    // backgroundColor:"red"
  },
  modalView: {
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
    marginTop: 5,
    backgroundColor: "white",
    borderRadius: 20,
    // padding: 35,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "15%",
    height: 40,
  },
  sideMenuStyle: {
    margin: 0,
    width: 100,
  },
  nextButtonStyle: {
    height: 45,
    backgroundColor: "#1B5A90",
    marginVertical: 10,
    borderRadius: 30,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
    marginTop: 30,
  },
  clinicImageContainer: {
    height: 70,
    width: 70,
    borderStyle: "dashed",
    borderColor: "#CFCFCF",
    borderRadius: 15,
    borderWidth: 1,
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 5,
    backgroundColor: colors.background,
  },
  clicnicImageStyle: { height: 70, width: 70, borderRadius: 20, margin: 5 },
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  container: { marginHorizontal: 10 },
  bodyStyle: { paddingHorizontal: 10, paddingTop: 10 },
  // containerMap: {
  //   flex: 1,
  //   justifyContent: 'center',
  //   // paddingTop: Constants.statusBarHeight,
  //   // paddingTop: 20,
  // },
});

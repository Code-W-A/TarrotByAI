import { useNavigation } from "@react-navigation/native";
import React, { Fragment, useEffect, useState } from "react";
import {
  TouchableOpacity,
  View,
  Dimensions,
  StyleSheet,
  Text,
  Image,
} from "react-native";
import { H6fontMediumWhite, H7fontMediumWhite } from "../components/commonText";
import { RowView } from "../components/commonViews";
import { colors } from "../utils/colors";
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import Icon1 from 'react-native-vector-icons/Octicons';
import Modal from "react-native-modal";

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";

import { screenName } from "../utils/screenName";

import { useDispatch, useSelector } from "react-redux";

import { useAppSelector } from "../hooks/hooks";

interface NavBarProps {
  title: string;
  chat?: boolean;
  isPatient?: boolean;
  navHeight?: any;
  isModal?: boolean;
  isTermsAccepted?: boolean;
  children?: any;
  userTitle?: any;
  isGoBack?: any;
  isClinicSettings?: any;
  isdelete?: any;
  handleDeleteAppointment?: any;
  isFirstDoctors?: any;
}
const { width } = Dimensions.get("window");

export const NavBar: React.FC<NavBarProps> = ({
  title,
  chat,
  isPatient,
  navHeight,
  isModal,
  isTermsAccepted,
  userTitle,
  isGoBack,
  isClinicSettings,
  isdelete,
  handleDeleteAppointment,
  isFirstDoctors,
}) => {
  const [isModalVisible, setModalVisible] = useState(false);

  const dispatch = useDispatch();
  useEffect(() => {
    setModalVisible(false);
    // console.log('clinicInformation', clinicInformation.clinicInfoData.clinicname);
  }, []);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };
  const navigation = useNavigation();
  return (
    <Fragment>
      <RowView
        style={{
          borderBottomColor: colors.borderTextColor,
          borderBottomWidth: 1,
          backgroundColor: colors.primary2,
          height: navHeight ? navHeight : 150,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            paddingTop: navHeight ? 20 : 8,
            justifyContent: isdelete ? "space-between" : "flex-start",
            width: "100%",
          }}
        >
          {/* // FOR TOGGLE */}
          {isTermsAccepted && !isGoBack && !isFirstDoctors ? (
            <TouchableOpacity
              onPress={() => {
                toggleModal();
                console.log("toggle activated here...here");
              }}
              style={{ paddingTop: 20, paddingLeft: 15 }}
            >
              <View
                style={{ height: 3, width: 30, backgroundColor: "white" }}
              ></View>
              <View style={{ paddingTop: 5 }}>
                <View
                  style={{
                    height: 3,
                    width: 20,
                    backgroundColor: "white",
                  }}
                ></View>
              </View>
              <View style={{ paddingTop: 5 }}>
                <View
                  style={{
                    height: 3,
                    width: 30,
                    backgroundColor: "white",
                  }}
                ></View>
              </View>
            </TouchableOpacity>
          ) : isGoBack ? (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ padding: 10, paddingTop: isGoBack ? 16 : 0 }}
            >
              <Ionicons name="arrow-back-outline" size={24} color="white" />
            </TouchableOpacity>
          ) : null}
          {isdelete && (
            <TouchableOpacity onPress={handleDeleteAppointment}>
              <MaterialCommunityIcons
                name="trash-can"
                size={30}
                color="white"
                style={{ paddingTop: isGoBack ? 16 : 0, marginRight: 10 }}
              />
            </TouchableOpacity>
          )}
          {title && (
            <H7fontMediumWhite
              style={{ paddingLeft: isGoBack ? 0 : 20, paddingTop: 15 }}
            >
              {title}
            </H7fontMediumWhite>
          )}
        </View>
      </RowView>
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={toggleModal}
        onSwipeComplete={toggleModal}
        animationIn="slideInLeft"
        animationOut="slideOutLeft"
        swipeDirection="left"
        useNativeDriver
        hideModalContentWhileAnimating
        propagateSwipe
        style={styles.sideMenuStyle}
      >
        {/* <SideMenu
          setModalVisible={() => setModalVisible(false)}
          userTitle={
            clinicInformation && clinicInformation.clinicInfoData
              ? clinicInformation.clinicInfoData.clinicname
              : ""
          }
          isClinicSettings={true}
        /> */}
      </Modal>
    </Fragment>
  );
};
export const NavBarPatient: React.FC<NavBarProps> = ({
  title,
  isPatient,
  isTermsAccepted,
  navHeight,
  children,
  userTitle,
  isGoBack,
}) => {
  const patientInfoDB = useAppSelector((state) => state.patientInfoData);
  const { patientInformation } = patientInfoDB;
  const [isModalVisible, setModalVisible] = useState(false);
  const dispatch = useDispatch();
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };
  const navigation = useNavigation();
  const [opened, setOpened] = useState(false);
  const onTriggerPress = () => {
    setOpened(true);
  };
  const onBackdropPress = () => {
    setOpened(false);
  };

  const guestDetailsData = useAppSelector((state) => state.guestDetailsPatient);
  const { guestDetails } = guestDetailsData;
  return (
    <Fragment>
      <RowView
        style={{
          borderBottomColor: colors.borderTextColor,
          borderBottomWidth: 1,
          backgroundColor: colors.primary2,
          height: navHeight ? navHeight : 80,
          paddingTop: 5,
        }}
      >
        <View
          style={{
            flexDirection: "row",
          }}
        >
          {/* FOR TOGGLE */}
          {isTermsAccepted && !isGoBack ? (
            <TouchableOpacity
              onPress={() => {
                toggleModal();
              }}
              style={{ paddingTop: 38, paddingLeft: 15 }}
            >
              <View
                style={{ height: 2, width: 25, backgroundColor: "white" }}
              ></View>
              <View style={{ paddingTop: 5 }}>
                <View
                  style={{
                    height: 2,
                    width: 15,
                    backgroundColor: "white",
                  }}
                ></View>
              </View>
              <View style={{ paddingTop: 5 }}>
                <View
                  style={{
                    height: 2.2,
                    width: 25,
                    backgroundColor: "white",
                  }}
                ></View>
              </View>
            </TouchableOpacity>
          ) : isGoBack ? (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ padding: 10, paddingLeft: 15, paddingTop: 30 }}
            >
              <Ionicons name="arrow-back-outline" size={35} color="white" />
            </TouchableOpacity>
          ) : (
            children
          )}

          <H7fontMediumWhite
            style={{ paddingLeft: isGoBack ? 0 : 20, paddingTop: 34 }}
          >
            {title}
          </H7fontMediumWhite>
        </View>
      </RowView>
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={toggleModal}
        onSwipeComplete={toggleModal}
        animationIn="slideInLeft"
        animationOut="slideOutLeft"
        swipeDirection="left"
        useNativeDriver
        hideModalContentWhileAnimating
        propagateSwipe
        style={styles.sideMenuStyle}
      >
        {/* <SideMenu
          isPatient={true}
          setModalVisible={() => setModalVisible(false)}
          userTitle={
            patientInformation && patientInformation.basicInfoData
              ? `${patientInformation.basicInfoData.firstName} ${patientInformation.basicInfoData.lastName}`
              : ""
          }
        /> */}
      </Modal>
    </Fragment>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  sideMenuStyle: {
    margin: 0,
    width: width * 0.65,
  },
});

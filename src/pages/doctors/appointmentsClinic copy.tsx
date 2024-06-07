import React, { useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  FlatList,
  Text,
  Image,
  StyleSheet,
  ScrollView,
} from "react-native";
import { GeneralProps } from "../../interfaces/generalProps";
import { Route, useNavigation, useRoute } from "@react-navigation/native";
import { labels } from "../../utils/labels";
import {
  CardSurface,
  CommonLineDotted,
  RowView,
} from "../../components/commonViews";
import {
  H14fontRegularBlackk,
  H16fontRegularYellow,
  H6fontRegularBlack,
  H6fontRegularBlue,
  H8fontMediumBlack,
  H9fontRegularGray,
} from "../../components/commonText";

import { flexRow, pt10, pt5 } from "../../common/commonStyles";
import CheckMarkIcon from "../../../assets/images/icon-checkmark.svg";
import AwesomeEye from "../../../assets/images/icon-awesome-eye.svg";
import MetroPrintor from "../../../assets/images/icon-metro-printer.svg";
// import {patientAppointments} from '../../utils/constant';

import Doctor1 from "../../../assets/images/doctors/doctor-01.svg";
import Doctor2 from "../../../assets/images/doctors/doctor-02.svg";
import Doctor3 from "../../../assets/images/doctors/doctor-03.svg";
import { NavBar, NavBarPatient } from "../../common/commonComponents";
import { retrieveClinicAppointments } from "../../utils/getFirebaseData";
import { useDispatch, useSelector } from "react-redux";
import { getClinicAppointments } from "../../actions/clinicActions";
import { uploadApprovedAppointment } from "../../utils/UploadFirebaseData";
import { ActivityIndicator } from "react-native-paper";
import { screenName } from "../../utils/screenName";
import CustomLoader from "../../components/customLoader";
import i18n from "../../../i18n";
import { createTimeFormat } from "../../utils/convertTime24Hours";
import { useHourClockContext } from "../../context/HourClockContext";

interface Props {}

const ClinicAppointments: React.FC<Props> = ({}): JSX.Element => {
  const cAppointments = useSelector((state) => state.clinicAppointments);
  const { clinicAppointments, loading } = cAppointments;

  const clinicApprovedApp = useSelector(
    (state) => state.clinicApprovedAppointments
  );
  const { clinicApprovedAppointments, loading: loadingApprovedAppointments } =
    clinicApprovedApp;

  const hourClock = useHourClockContext();

  const [mappableApp, setMappableApp] = useState([]);

  const [toggle, setToggle] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  // const dispatch = useDispatch();
  const routeAppointments = route.params;

  const dispatch = useDispatch();

  useEffect(() => {
    if (routeAppointments) {
      if (routeAppointments.upcomingAppointments === "upcomingAppointments") {
        console.log("yes upcomming");
        setMappableApp(clinicApprovedAppointments.upcommingAppointments);
      } else if (routeAppointments.todayAppointments === "todayAppointments") {
        console.log("yes today");
        setMappableApp(clinicApprovedAppointments.todayAppointments);
      }
    } else {
      console.log("yes all");
      setMappableApp(clinicAppointments);
    }
    // console.log(clinicAppointments[0].patientInfo);
  }, [clinicAppointments]);

  return (
    <>
      <NavBar
        title={"Appointments"}
        navHeight={80}
        isModal={false}
        isTermsAccepted={true}
      />
      <CustomLoader isLoading={loadingApprovedAppointments} />
      <ScrollView style={styles.container}>
        {mappableApp.length === 0 &&
          (routeAppointments &&
          routeAppointments.upcomingAppointments === "upcomingAppointments" ? (
            <H6fontRegularBlue> No upcomming appointments</H6fontRegularBlue>
          ) : routeAppointments &&
            routeAppointments.todayAppointments === "todayAppointments" ? (
            <H6fontRegularBlue> No appointments today</H6fontRegularBlue>
          ) : (
            <H6fontRegularBlue> No appointments</H6fontRegularBlue>
          ))}
        {mappableApp.length > 0 &&
          mappableApp.map((item, index) => (
            <CardSurface style={styles.cardStyle} key={index}>
              <RowView style={pt5}>
                <View style={flexRow}>
                  <H14fontRegularBlackk>
                    {i18n.translate("bookingDate")}
                  </H14fontRegularBlackk>
                  <H14fontRegularBlackk>
                    {" - "}
                    {item.daySelected}
                  </H14fontRegularBlackk>
                </View>
                {/* <H9fontRegularGray>{'Dental'}</H9fontRegularGray> */}
              </RowView>
              <CommonLineDotted />
              <RowView>
                <View style={styles.detailsStyles}>
                  <View style={styles.profileImageStyle}>
                    <Doctor1 height={60} width={100} />
                  </View>
                  <View style={styles.basicDetails}>
                    <View style={flexRow}>
                      <H8fontMediumBlack>
                        {item.patientInfo.basicInfoData.firstname}{" "}
                        {item.patientInfo.basicInfoData.lastname}
                      </H8fontMediumBlack>
                      <View
                        style={[
                          styles.confirmViewStyle,
                          {
                            backgroundColor: !item.isApproved && "#FF0000",
                            marginLeft: 40,
                          },
                        ]}
                      ></View>
                    </View>

                    <View style={flexRow}>
                      <H9fontRegularGray>{"Start time "}</H9fontRegularGray>
                      <H9fontRegularGray>
                        {createTimeFormat(
                          item.timeSelected.starttime,
                          hourClock
                        )}
                      </H9fontRegularGray>
                    </View>
                    <View style={flexRow}>
                      <H9fontRegularGray>{"End time "}</H9fontRegularGray>
                      <H9fontRegularGray>
                        {createTimeFormat(item.timeSelected.endtime, hourClock)}
                      </H9fontRegularGray>
                    </View>
                    {/* <H8fontMediumBlack style={pt5}>{'$150'}</H8fontMediumBlack> */}
                  </View>
                </View>
              </RowView>
              <View style={styles.cardButtonRow}>
                <View
                  style={[
                    styles.confirmButtonStyle,
                    {
                      backgroundColor: !item.isApproved
                        ? "red"
                        : "rgba(29, 185, 71, 0.65)",
                    },
                  ]}
                  // onPress={() => toggleApprovedAppointment(item)}
                >
                  <View style={styles.buttonRow}>
                    <CheckMarkIcon height={12} width={12} />
                    <Text style={styles.buttonTextStyle}>
                      {item.isApproved
                        ? i18n.translate("confirm")
                        : i18n.translate("notConfirmed")}
                    </Text>
                  </View>
                </View>
                {/* <TouchableOpacity
                  style={[
                    styles.confirmButtonStyle,
                    {
                      backgroundColor: item.isApproved
                        ? 'red'
                        : 'rgba(29, 185, 71, 0.65)',
                    },
                  ]}
                  onPress={() => toggleApprovedAppointment(item)}>
                  <View style={styles.buttonRow}>
                    <CheckMarkIcon height={12} width={12} />
                    <Text style={styles.buttonTextStyle}>
                          {item.isApproved ? labels.confirm : labels.notConfirmed}
                    </Text>
                  </View>
                </TouchableOpacity> */}

                {/* <View style={styles.buttonRow}>
                  <CheckMarkIcon height={12} width={12} />
                  <Text style={styles.buttonTextStyle}>
                    {item.isApproved ? labels.confirm : labels.notConfirmed}
                  </Text>
                </View> */}

                <TouchableOpacity
                  style={styles.viewButtonStyle}
                  onPress={() =>
                    navigation.navigate(screenName.CheckAppointmentClinic, {
                      item,
                    })
                  }
                >
                  <View style={styles.buttonRow}>
                    <AwesomeEye height={10} width={15} />
                    <Text style={styles.buttonTextStyle}>
                      {i18n.translate("view")}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* <TouchableOpacity style={styles.printButtonStyle}>
                  <View style={styles.buttonRow}>
                    <MetroPrintor height={13} width={13} />
                    <Text style={styles.printButtonTextStyle}>{labels.view}</Text>
                  </View>
                </TouchableOpacity> */}
              </View>
            </CardSurface>
          ))}
      </ScrollView>
    </>
  );
};
export default ClinicAppointments;

const styles = StyleSheet.create({
  cardStyle: {
    height: 180,
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  detailsStyles: { padding: 5, paddingTop: 10, flexDirection: "row" },
  profileImageStyle: {
    height: 60,
    width: 60,
    borderRadius: 50,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    paddingRight: 25,
  },
  basicDetails: { paddingLeft: 10 },
  cardButtonRow: {
    flexDirection: "row",
    // paddingTop: 10,
    justifyContent: "center",
  },
  confirmButtonStyle: {
    height: 28,
    // width: 80,
    // backgroundColor: ,
    borderRadius: 30,
    justifyContent: "center",
  },
  confirmViewStyle: {
    height: 28,
    // width: 80,
    backgroundColor: "rgba(29, 185, 71, 0.65)",
    borderRadius: 30,
    justifyContent: "center",
  },
  confirmImageStyle: { height: 10, width: 10, marginRight: 3 },
  buttonTextStyle: {
    paddingLeft: 5,
    // paddingTop: 5,
    color: "white",
    fontSize: 11,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
  },
  viewButtonStyle: {
    height: 28,
    width: 78,
    backgroundColor: "rgba(29, 185, 170, 0.65)",
    borderRadius: 30,
    justifyContent: "center",
    marginHorizontal: 5,
  },
  viewImageStyle: { height: 10, width: 15 },
  printButtonStyle: {
    height: 28,
    width: 78,
    backgroundColor: "#D4D4D4",
    borderRadius: 30,
    justifyContent: "center",
  },
  printImageStyle: { height: 13, width: 13 },
  printButtonTextStyle: {
    paddingLeft: 5,
    // paddingTop: 5,
    color: "#8B8A8A",
    fontSize: 11,
  },
  container: { paddingHorizontal: 10, paddingTop: 10, paddingBottom: 100 },
});

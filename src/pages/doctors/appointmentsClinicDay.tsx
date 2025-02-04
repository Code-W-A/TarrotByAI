import React, { useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  FlatList,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
} from "react-native";
import { GeneralProps } from "../../interfaces/generalProps";
import { Route, useNavigation, useRoute } from "@react-navigation/native";
import { labels } from "../../utils/labels";
import { Fontisto } from "@expo/vector-icons";
import {
  CardSurface,
  CommonLineDotted,
  RowView,
} from "../../components/commonViews";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  H14fontRegularBlackk,
  H16fontRegularYellow,
  H6fontRegularBlack,
  H6fontRegularBlue,
  H8fontMediumBlack,
  H9fontRegularGray,
} from "../../components/commonText";

import { flexRow, pt10, pt5 } from "../../common/commonStyles";

import { AntDesign } from "@expo/vector-icons";

import { Feather } from "@expo/vector-icons";

// import {patientAppointments} from '../../utils/constant';

import { NavBar, NavBarPatient } from "../../common/commonComponents";
import { retrieveClinicAppointments } from "../../utils/getFirebaseData";
import { useDispatch, useSelector } from "react-redux";
import {
  getClinicAppointments,
  getClinicApprovedAppointments,
  getDoctorCalendarTimes,
  getPatientsOfClinic,
} from "../../actions/clinicActions";
import {
  uploadApprovedAppointment,
  uploadCreateAppointmentToClinic,
} from "../../utils/UploadFirebaseData";
import { ActivityIndicator } from "react-native-paper";
import { screenName } from "../../utils/screenName";
import CustomLoader from "../../components/customLoader";
import { colors } from "../../utils/colors";
import { FontAwesome } from "@expo/vector-icons";
import { authentication } from "../../../firebase";
import * as Yup from "yup";
import AddAppointmentModal from "../../components/AddAppointmentModal";
import * as SMS from "expo-sms";
import i18n from "../../../i18n";
import { useAppSelector } from "../../hooks/hooks";
import { createTimeFormat } from "../../utils/convertTime24Hours";
import useRevenueCat from "../../hooks/useRevenueCat";

interface Props {}

const ClinicAppointmentsDay: React.FC<Props> = ({}): JSX.Element => {
  const { currentOffering, customerInfo, isProMember } = useRevenueCat();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [value, setValue] = useState("");
  const [selectedImage, setSelectedImage] = useState<any>();
  const [dataInfoBasic, setDataInfoBasic] = useState();
  const [mobileNumber, setMobileNumber] = useState("0787813831");

  const allClinicsPatients = useSelector((state) => state.clinicsPatients);
  const { clinicsPatients, loading: loadingPatients } = allClinicsPatients;

  const doctorApprovedApp = useAppSelector(
    (state) => state.doctorApprovedAppointments
  );
  const { doctorApprovedAppointments, loading: loadingApprovedAppointments } =
    doctorApprovedApp;

  const initiateSMS = async (values, phoneNumber) => {
    const bodySMS = `${i18n.translate("txt1")}, ${values.firstName} ${
      values.lastName
    }! ${i18n.translate("txt2")} ${
      routeAppointments.selectedDay
    }, ${i18n.translate("txt3")} ${
      routeAppointments.selectedAppointmentDayTime.starttime
    } ${i18n.translate("txt4")} ${
      routeAppointments.selectedAppointmentDayTime.endtime
    }. ${i18n.translate("txt5")}`;
    const isAvailable = await SMS.isAvailableAsync();
    if (isAvailable) {
      console.log(bodySMS);
      // do your SMS stuff here
      const { result } = await SMS.sendSMSAsync(
        [`${phoneNumber}`],
        bodySMS
        // {
        //   attachments: {
        //     uri: 'path/myfile.png',
        //     mimeType: 'image/png',
        //     filename: 'myfile.png',
        //   },
        // }
      );
    } else {
      // misfortune... there's no SMS available on this device

      console.log("misfortune... there's no SMS available on this device");
    }
  };

  const initiateSMSReminder = async (values, phoneNumber) => {
    console.log;
    const bodySMS = `${i18n.translate("txt1")}, ${values.firstName} ${
      values.lastName
    }! ${i18n.translate("txt2")} ${
      routeAppointments.selectedDay
    }, ${i18n.translate("txt3")} ${createTimeFormat(
      routeAppointments.selectedAppointmentDayTime.starttime
    )} ${i18n.translate("txt4")} ${createTimeFormat(
      routeAppointments.selectedAppointmentDayTime.endtime
    )}. ${i18n.translate("txt5")}`;
    const isAvailable = await SMS.isAvailableAsync();
    if (isAvailable) {
      console.log(bodySMS);
      // do your SMS stuff here
      const { result } = await SMS.sendSMSAsync(
        [`${phoneNumber}`],
        bodySMS
        // {
        //   attachments: {
        //     uri: 'path/myfile.png',
        //     mimeType: 'image/png',
        //     filename: 'myfile.png',
        //   },
        // }
      );
    } else {
      // misfortune... there's no SMS available on this device

      console.log("misfortune... there's no SMS available on this device");
    }
  };

  const [appointment, setAppointment] = useState([]);

  const [toggle, setToggle] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  // const dispatch = useDispatch();
  const routeAppointments = route.params;

  const dispatch = useDispatch();
  const auth = authentication;

  let totalAppointments = [];

  const handleSMS = (values) => {
    Alert.alert(
      i18n.translate("addAppointmentConfirmationSMS"),
      i18n.translate("addAppointmentConfirmationSMSMessage"),
      [
        {
          text: "Cancel",
          onPress: () => {
            console.log("Cancel Pressed");
            dispatch(getDoctorCalendarTimes(routeAppointments.doctorId));
            dispatch(getPatientsOfClinic());
            dispatch(getClinicApprovedAppointments());
            dispatch(getClinicAppointments());
            navigation.pop(3);
          },
          style: "cancel",
        },
        {
          text: "OK",
          onPress: () => {
            initiateSMS(values, values.phoneNumber),
              dispatch(getDoctorCalendarTimes(routeAppointments.doctorId));
            dispatch(getPatientsOfClinic());
            dispatch(getClinicApprovedAppointments());
            dispatch(getClinicAppointments());
            navigation.pop(3);
          },
        },
      ]
    );
  };

  const handleSMSReminder = (values) => {
    // if (isProMember) {
    console.log(values.patientInfo.basicInfoData);
    Alert.alert(
      `${i18n.translate("doYouWantToSendSMSReminder")} ${
        values.patientInfo.basicInfoData.firstName
      } ${values.patientInfo.basicInfoData.lastName}?`,
      `${values.patientInfo.basicInfoData.firstName} ${
        values.patientInfo.basicInfoData.lastName
      } ${i18n.translate("doYouWantToSendSMSReminderM1")} ${
        values.daySelected
      } ${i18n.translate("txt3Unreg")} ${createTimeFormat(
        values.timeSelected.starttime
      )} ${i18n.translate("txt4Unreg")} ${createTimeFormat(
        values.timeSelected.endtime
      )}`,
      [
        {
          text: i18n.translate("cancel"),
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: i18n.translate("sendReminder"),
          onPress: () =>
            initiateSMSReminder(
              values.patientInfo.basicInfoData,
              values.patientInfo.phoneNumber
            ),
        },
      ]
    );
    // } else {
    //   navigation.navigate(screenName.Subscription);
    // }
  };

  const handleAddAppointment = (values, selectedServices) => {
    const d = new Date();
    let appointmentId = d.valueOf();
    console.log(values);

    let str = values.phoneNumber.replace(/\s/g, "");

    let completePhoneNumber =
      values.selectedCountryPhoneNumber.callingCode + " " + str;

    console.log(completePhoneNumber);

    console.log("values....");
    console.log(values);

    let isApproved = true;

    uploadCreateAppointmentToClinic(
      auth.currentUser.uid,
      routeAppointments.doctorId,
      routeAppointments.selectedDay,
      routeAppointments.selectedAppointmentDayTime,
      completePhoneNumber,
      values,
      appointmentId,
      clinicsPatients,
      isApproved,
      "",
      selectedServices
    )
      .then(() => {
        setIsModalVisible(false);
      })
      .then(() => {
        handleSMS(values);
      });
  };

  useEffect(() => {
    // console.log('------------------------START-----------------------', clinicsPatients);
    console.log("------------------------START-----------------------");
    console.log(routeAppointments.servicesList);
    // console.log(routeAppointments);
    // initiateSMS()
    for (
      let i = 0;
      i < doctorApprovedAppointments.approvedDoctorAppointments.length;
      i++
    ) {
      if (
        doctorApprovedAppointments.approvedDoctorAppointments[i].daySelected ===
          routeAppointments.selectedDay &&
        doctorApprovedAppointments.approvedDoctorAppointments[i].timeSelected
          .starttime ===
          routeAppointments.selectedAppointmentDayTime.starttime &&
        doctorApprovedAppointments.approvedDoctorAppointments[i].timeSelected
          .endtime === routeAppointments.selectedAppointmentDayTime.endtime
      ) {
        doctorApprovedAppointments.approvedDoctorAppointments[i].doctorId =
          routeAppointments.doctorId;
        totalAppointments.push(
          doctorApprovedAppointments.approvedDoctorAppointments[i]
        );
      }
    }
    setAppointment(totalAppointments);
    console.log(appointment);
  }, []);

  // return(
  // <View>
  //   <Text>
  //     asdads
  //   </Text>
  // </View>)

  return (
    <>
      <NavBar
        title={i18n.translate("Appointments")}
        navHeight={80}
        isModal={false}
        isTermsAccepted={true}
      />
      <CustomLoader isLoading={loadingApprovedAppointments} />
      <AddAppointmentModal
        isModalVisible={isModalVisible}
        setIsModalVisible={setIsModalVisible}
        handleAddAppointment={handleAddAppointment}
        servicesList={routeAppointments.servicesList}
      />
      {appointment.length === 0 && (
        <TouchableOpacity
          style={styles.modalView}
          onPress={() => setIsModalVisible(true)}
        >
          <FontAwesome name="plus" size={34} color={colors.facebook} />
        </TouchableOpacity>
      )}
      <ScrollView style={styles.container}>
        {appointment.length === 0 && (
          <View style={{ width: "100%" }}>
            <H6fontRegularBlue>
              {" "}
              {i18n.translate("noAppointemnts")}
            </H6fontRegularBlue>
          </View>
        )}
        {appointment &&
          appointment.length > 0 &&
          appointment.map((item, index) => (
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
                    <AntDesign name="checkcircleo" size={20} color="white" />
                    <Text style={styles.buttonTextStyle}>
                      {item.isApproved
                        ? i18n.translate("confirm")
                        : i18n.translate("notConfirmed")}
                    </Text>
                  </View>
                </View>
              </RowView>
              <CommonLineDotted />
              <RowView>
                <View style={styles.detailsStyles}>
                  <View style={styles.profileImageStyle}>
                    {item.patientInfo.patientImg ? (
                      <Image
                        source={{ uri: item.patientInfo.patientImg }}
                        style={{ height: "100%", width: "100%" }}
                      />
                    ) : (
                      <Fontisto
                        name="person"
                        size={74}
                        color={colors.facebook}
                      />
                    )}
                  </View>
                  <View style={styles.basicDetails}>
                    <View style={flexRow}>
                      <H8fontMediumBlack>
                        {item.patientInfo.basicInfoData.firstName}{" "}
                        {item.patientInfo.basicInfoData.lastName}
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
                      <H9fontRegularGray>
                        {i18n.translate("startTime")}
                      </H9fontRegularGray>
                      <H9fontRegularGray> </H9fontRegularGray>
                      <H9fontRegularGray>
                        {createTimeFormat(item.timeSelected.starttime)}
                      </H9fontRegularGray>
                    </View>
                    <View style={flexRow}>
                      <H9fontRegularGray>
                        {i18n.translate("endTime")}
                      </H9fontRegularGray>
                      <H9fontRegularGray> </H9fontRegularGray>
                      <H9fontRegularGray>
                        {createTimeFormat(item.timeSelected.endtime)}
                      </H9fontRegularGray>
                    </View>
                    {/* <H8fontMediumBlack style={pt5}>{'$150'}</H8fontMediumBlack> */}
                  </View>
                </View>
              </RowView>
              <View style={styles.cardButtonRow}>
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
                    <Feather name="eye" size={20} color="white" />
                    <Text style={styles.buttonTextStyle}>
                      {i18n.translate("view")}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.viewButtonStyle,
                    { backgroundColor: colors.facebook, width: "auto" },
                  ]}
                  onPress={() =>
                    item.isApproved
                      ? handleSMSReminder(item)
                      : Alert.alert(
                          "Appointment is not approved",
                          "You have to approve the appointment in order to send a reminder",
                          [
                            {
                              text: "Ask me later",
                              onPress: () =>
                                console.log("Ask me later pressed"),
                            },
                            {
                              text: "Cancel",
                              onPress: () => console.log("Cancel Pressed"),
                              style: "cancel",
                            },
                            {
                              text: "OK",
                              onPress: () => console.log("OK Pressed"),
                            },
                          ]
                        )
                  }
                >
                  <View style={styles.buttonRow}>
                    <MaterialCommunityIcons
                      name="cellphone-message"
                      size={20}
                      color="white"
                    />
                    <Text style={styles.buttonTextStyle}>
                      {i18n.translate("sendReminder")}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.viewButtonStyle,
                    { backgroundColor: colors.darkblack },
                  ]}
                  onPress={() =>
                    Linking.openURL(`tel:${item.patientInfo.phoneNumber}`)
                  }
                >
                  <View style={styles.buttonRow}>
                    <MaterialCommunityIcons
                      name="phone"
                      size={20}
                      color="white"
                    />
                    <Text style={styles.buttonTextStyle}>
                      {i18n.translate("callPatient")}
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
export default ClinicAppointmentsDay;

const styles = StyleSheet.create({
  cardStyle: {
    height: "auto",
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  modalView: {
    justifyContent: "center",
    alignItems: "center",
    margin: 20,
    backgroundColor: "white",
    borderRadius: 50,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: 57,
    height: 57,
    position: "absolute",
    bottom: 10,
    right: 10,
    zIndex: 3,
  },
  detailsStyles: { padding: 5, paddingTop: 10, flexDirection: "row" },
  profileImageStyle: {
    height: 60,
    width: 60,
    borderRadius: 50,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    // paddingRight: 25,
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
    width: "auto",
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

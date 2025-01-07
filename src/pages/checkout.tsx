import React, { useEffect, useState } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { CommonButton, RowView } from "../components/commonViews";
import {
  H15fontMediumBlack,
  H9fontRegularGray,
  H8fontMediumLightBlack,
  H8fontMediumBlack,
  H9fontMediumLightBlack,
  H6fontRegularBlack,
  H14fontMediumBlack,
  H14fontRegularWhite,
} from "../components/commonText";
import {
  alignItemsCenter,
  flexRow,
  justyfyCenter,
  pb10,
  pb5,
  pl5,
  pv10,
  spaceBetween,
} from "../common/commonStyles";
import LeftArrow from "../../assets/images/left-arrow-big-black.svg";
import { colors } from "../utils/colors";
import StarIcon from "../../assets/images/star.svg";
import Doctor2 from "../../assets/images/doctors/doctor-02.svg";
import Specialities5 from "../../assets/images/specialities/specialities-05.svg";
// import Icon from 'react-native-vector-icons/FontAwesome';
import { NavBarPatient } from "../common/commonComponents";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import {
  uploadAppointmentDataToClinic,
  uploadAppointmentDataToPatient,
  uploadCreateAppointmentToClinic,
} from "../utils/UploadFirebaseData";
import { screenName } from "../utils/screenName";
import {
  getGuestLoginDetails,
  getPatientAppointments,
} from "../actions/patientActions";
import { Text } from "react-native-paper";
import { labels } from "../utils/labels";
import { schedulePushNotificationOnAppointment } from "../utils/Notification/scheduleLocalNotification";
import i18n from "../../i18n";
import AddAppointmentModal from "../components/AddAppointmentModal";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import {
  retrieveClinicDoctors,
  retrieveClinicPatients,
} from "../utils/getFirebaseData";
import { useAppSelector } from "../hooks/hooks";
import moment from "moment";
import { addAppointmentToGuest } from "../utils/asyncStorageHandler";

import {
  convertTimeTo12Hours,
  createTimeFormat,
} from "../utils/convertTime24Hours";

interface Props {
  onpress: CallableFunction;
}

const Checkout: React.FC<Props> = ({ onpress }): JSX.Element => {
  const route = useRoute();
  const AllDoctorInfo = route.params;

  const [doctorInfo, setDoctorInfo] = useState(
    AllDoctorInfo.doctorInfo.clinicAllInfo
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [clinicTimeSelected, setClinicTimeSelected] = useState({});
  const [daySelected, setDaySelected] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const patientInfoDB = useAppSelector((state) => state.patientInfoData);
  const { patientInformation } = patientInfoDB;

  const guestDetailsData = useAppSelector((state) => state.guestDetailsPatient);
  const { guestDetails, loading: loadGuestDetails } = guestDetailsData;

  const ptAppointments = useAppSelector((state) => state.patientAppointments);
  const { myAppointments, loading: loadingMyAppointments } = ptAppointments;

  const hourFormatResult = useAppSelector((state) => state.hourFormat);
  const { hourClock } = hourFormatResult;

  const navigation = useNavigation();
  const dispatch = useDispatch();

  const handleSubmitAppointment = () => {
    setIsLoading(true);
    console.log("-----------handleSubmitAppointment-------------");
    const basicInfo = AllDoctorInfo.doctorInfo.item.doctorInfoData;

    const timeScheduled = AllDoctorInfo.item;
    const daySelected = AllDoctorInfo.daySelected;

    const d = new Date();
    let appointmentId = d.valueOf();

    console.log("----basicInfo---");
    // console.log(basicInfo)

    // SCHEDULE PUSH NOTIFICATION COMING SOON
    // schedulePushNotificationOnAppointment(timeScheduled, daySelected, basicInfo,appointmentId)

    // console.log(AllDoctorInfo.doctorInfo.item.doctorId)

    console.log(patientInformation.owner_uid);

    const startFunction = Date.now();
    console.log("STart....");

    console.log(timeScheduled);
    console.log(daySelected);
    let myMoment = moment.utc(
      `${timeScheduled.starttime} ${daySelected}`,
      "HH:mm DD-MM-YYYY"
    );
    console.log(moment.utc(myMoment).valueOf());
    console.log(
      moment.utc(moment.utc(myMoment).valueOf()).format("DD MM YYYY hh:mm")
    );

    let dateToQuery = moment.utc(myMoment).valueOf();

    uploadAppointmentDataToPatient(
      dateToQuery,
      AllDoctorInfo.doctorInfo.item.doctorId,
      AllDoctorInfo.doctorInfo.item.clinicId,
      appointmentId,
      timeScheduled,
      daySelected
    )
      .then(() => {
        uploadAppointmentDataToClinic(
          AllDoctorInfo.doctorInfo.item.clinicId,
          AllDoctorInfo.doctorInfo.item.doctorId,
          AllDoctorInfo.daySelected,
          timeScheduled,
          patientInformation.owner_uid,
          appointmentId,
          dateToQuery
        );
      })
      .then(() => {
        const startFunction = Date.now();
        console.log("STart....");

        dispatch(getPatientAppointments(false, false)).then(() => {
          setIsLoading(false);

          navigation.navigate(screenName.BookingSuccess, {
            basicInfo,
            timeScheduled,
            daySelected,
          });

          const endFunction = Date.now();
          console.log(`Execution time: ${endFunction - startFunction} ms`);
        });
      });
  };

  useEffect(() => {
    console.log("AllDoctorInfo--------------------------AllDoctorInfo");
    console.log(AllDoctorInfo.doctorInfo.item.servicesList);

    // dispatch(getGuestLoginDetails())
  }, []);

  const handleAddAppointment = async (values, selectedServices) => {
    try {
      let basicInfo = AllDoctorInfo.doctorInfo.item.doctorInfoData;
      let timeScheduled = AllDoctorInfo.item;
      const d = new Date();
      let appointmentId = d.valueOf();
      console.log("--app id");

      //create phone number contact strings
      let completePhoneNumber =
        values.selectedCountryPhoneNumber.callingCode +
        " " +
        values.phoneNumber;

      // console.log(phoneNumber)

      const clinicsPatients = await retrieveClinicPatients(
        AllDoctorInfo.doctorInfo.item.clinicId
      );

      console.log("-----clinicsPatients-----");
      console.log(clinicsPatients);
      console.log("-----values-----");
      console.log("-----values YES-----");
      console.log(values);

      let myAppGuestObj = {
        clinicId: AllDoctorInfo.doctorInfo.item.clinicId,
        doctorId: AllDoctorInfo.doctorInfo.item.doctorId,
        daySelected: AllDoctorInfo.daySelected,
        timeSelected: AllDoctorInfo.item,
        values: values,
        appointmentId,
      };

      // addAppointmentToGuest()
      console.log("test 1...");

      let isApproved = false;

      let guestDetails = {};

      console.log("guestDetails.....");
      console.log(guestDetails.phoneNumberCountry);

      let oldPhoneNumber = guestDetails.phoneNumberCountry;

      uploadCreateAppointmentToClinic(
        AllDoctorInfo.doctorInfo.item.clinicId,
        AllDoctorInfo.doctorInfo.item.doctorId,
        AllDoctorInfo.daySelected,
        AllDoctorInfo.item,
        completePhoneNumber,
        values,
        appointmentId,
        clinicsPatients,
        isApproved,
        oldPhoneNumber,
        selectedServices
      ).then(() => {
        if (!guestDetails.isGuest || !guestDetails) {
          console.log("test here....no no");
        } else {
          console.log("test here....guest add");

          addAppointmentToGuest(
            AllDoctorInfo.doctorInfo.item.doctorId,
            AllDoctorInfo.doctorInfo.item.clinicId,
            appointmentId,
            AllDoctorInfo.item,
            AllDoctorInfo.daySelected,
            guestDetails.isGuest,
            values,
            completePhoneNumber
          ).then(() => {
            dispatch(getGuestLoginDetails())
              .then(() => {
                setIsModalVisible(false);
              })
              .then(() => {
                navigation.navigate(screenName.PatientSearchDashboard);
              });
          });
        }
      });
    } catch (err) {
      console.log("Error on handleAddAppointment....", err);
    }
  };

  const startImage = () => {
    return <StarIcon height={12} width={12} />;
  };

  const otherDetailsRow = (label: string, value: any) => {
    return (
      <RowView style={pb5}>
        <H8fontMediumLightBlack>{label}</H8fontMediumLightBlack>
        <H9fontRegularGray>{value}</H9fontRegularGray>
      </RowView>
    );
  };

  if (loadGuestDetails) {
    return <ActivityIndicator />;
  }

  return (
    <>
      <NavBarPatient
        isPatient={true}
        title={i18n.translate("appointmentCheckout")}
        isTermsAccepted={true}
      >
        {/* <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{position: 'absolute', padding: 20}}>
          <LeftArrow />
        </TouchableOpacity> */}
      </NavBarPatient>
      <AddAppointmentModal
        isModalVisible={isModalVisible}
        setIsModalVisible={setIsModalVisible}
        handleAddAppointment={handleAddAppointment}
        guestDetails={guestDetails}
        servicesList={AllDoctorInfo.doctorInfo.item.servicesList}
      />
      <View style={styles.container}>
        <View
          style={{
            marginBottom: 10,
            alignItems: "center",
          }}
        >
          <H6fontRegularBlack>
            {i18n.translate("bookingSummary")}
          </H6fontRegularBlack>
        </View>
        <TouchableOpacity onPress={() => onpress} style={styles.drSelection}>
          <View style={styles.drImageStyle}>
            {AllDoctorInfo.doctorInfo.item.doctorImgURI.length > 0 ? (
              <Image
                style={{ height: "100%", width: "100%" }}
                source={{ uri: AllDoctorInfo.doctorInfo.item.doctorImgURI }}
              />
            ) : (
              <Doctor2 height={"100%"} width={"150%"} />
            )}
          </View>
          <View style={styles.drDetailsStyle}>
            <View style={[pl5, spaceBetween]}>
              <H15fontMediumBlack>
                {AllDoctorInfo.doctorInfo.item.doctorInfoData.firstname}{" "}
                {AllDoctorInfo.doctorInfo.item.doctorInfoData.lastname}
              </H15fontMediumBlack>
              {/* <View style={[flexRow, alignItemsCenter]}>
            {startImage()}
            {startImage()}
            {startImage()}
            {startImage()}
            {startImage()}
            <H9fontMediumLightBlack>{'(47)'}</H9fontMediumLightBlack>
          </View> */}
              <View style={[flexRow, alignItemsCenter]}>
                {/* <H8fontMediumLightBlack>{'('}</H8fontMediumLightBlack> */}
                {/* <Icon name="map-marker" size={14} color={'black'} /> */}
                <H8fontMediumLightBlack>
                  {
                    AllDoctorInfo.doctorInfo.item.clinicAddressLocation
                      .clinicAddress
                  }
                </H8fontMediumLightBlack>
              </View>
            </View>
            {/* <View style={styles.typeofDrImageContainer}>
              <Specialities5 height={12} width={12} />
            </View> */}
          </View>
        </TouchableOpacity>

        <View style={styles.cardContainerStyles}>
          {otherDetailsRow(i18n.translate("date"), AllDoctorInfo.daySelected)}
          {otherDetailsRow(
            i18n.translate("startTime"),
            createTimeFormat(AllDoctorInfo.item.starttime, hourClock)
          )}
          {otherDetailsRow(
            i18n.translate("endTime"),
            createTimeFormat(AllDoctorInfo.item.endtime, hourClock)
          )}
          {/* {otherDetailsRow('Consulting', 'Fee$100')} */}
          {/* {otherDetailsRow('Slot Timing Fees', '$10')} */}
        </View>
        {/* 
      <View style={styles.cardContainerStyles}>
        {otherDetailsRow('Date', '16 Nov 2019')}
        {otherDetailsRow('Consulting', 'Fee$100')}
        {otherDetailsRow('Slot Timing Fees', '$10')}
      </View> */}
        <TouchableOpacity
          style={styles.nextButtonStyle}
          onPress={() => {
            {
              guestDetails.isGuest
                ? setIsModalVisible(!isModalVisible)
                : handleSubmitAppointment();
            }
          }}
          title="Submit"
        >
          <H14fontRegularWhite>
            {i18n.translate("completeAppointment")}
          </H14fontRegularWhite>
        </TouchableOpacity>
        {isLoading && <ActivityIndicator size={"large"} />}
      </View>
    </>
  );
};

export default Checkout;

const styles = StyleSheet.create({
  nextButtonStyle: {
    height: 45,
    backgroundColor: "#1B5A90",
    marginVertical: 15,
    borderRadius: 30,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },
  container: {
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  drSelection: {
    height: 104,
    padding: 14,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 2,
    flexDirection: "row",
  },
  drImageStyle: {
    height: 80,
    width: 80,
    borderRadius: 40,
    borderWidth: 5,
    borderColor: "#f7f7f7",
    overflow: "hidden",
  },
  drDetailsStyle: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  starImageStyle: { height: 12, width: 12 },
  typeofDrImageContainer: {
    height: 24,
    width: 24,
    borderRadius: 14,
    elevation: 3,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  typeofDrImageStyle: {
    height: 12,
    width: 12,
  },
  cardContainerStyles: {
    backgroundColor: colors.white,
    //   height: 145,
    borderRadius: 10,
    elevation: 3,
    padding: 12,
    justifyContent: "space-between",
    marginTop: 10,
  },
});

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
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { GeneralProps } from "../../interfaces/generalProps";
import { Route, useNavigation, useRoute } from "@react-navigation/native";
import { labels } from "../../utils/labels";
import { Ionicons } from "@expo/vector-icons";
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
  H8fontMediumLightBlack,
  H8fontRegularPrimary,
  H9fontRegularGray,
} from "../../components/commonText";

import { flexRow, pt10, pt5 } from "../../common/commonStyles";

import { AntDesign } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";

// import {patientAppointments} from '../../utils/constant';

import { NavBar, NavBarPatient } from "../../common/commonComponents";
import {
  retrieveApprovedClinicAppointments,
  retrieveClinicAppointments,
} from "../../utils/getFirebaseData";
import { useDispatch, useSelector } from "react-redux";
import { getClinicAppointments } from "../../actions/clinicActions";
import { uploadApprovedAppointment } from "../../utils/UploadFirebaseData";
import {
  ActivityIndicator,
  IconButton,
  Searchbar,
  Tooltip,
} from "react-native-paper";
import { screenName } from "../../utils/screenName";
import CustomLoader from "../../components/customLoader";
import { colors } from "../../utils/colors";
import * as SMS from "expo-sms";
import { ControlledTooltip } from "../../components/tooltipModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getTutorialData, storeData } from "../../utils/asyncStorageHandler";
import i18n from "../../../i18n";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { authentication, db } from "../../../firebase";
import AppointmentFilters from "../../components/Filters/AppointmentFilters";
import { extendMoment } from "moment-range";
import Moment from "moment";
import { useAppSelector } from "../../hooks/hooks";
import {
  convertTimeTo12Hours,
  createTimeFormat,
} from "../../utils/convertTime24Hours";
import { useHourClockContext } from "../../context/HourClockContext";
import useRevenueCat from "../../hooks/useRevenueCat";

interface Props {}

const ClinicAppointments: React.FC<Props> = ({}): JSX.Element => {
  const { currentOffering, customerInfo, isProMember } = useRevenueCat();

  const cAppointments = useAppSelector((state) => state.clinicAppointments);
  const { clinicAppointments, loading } = cAppointments;

  const clinicApprovedApp = useAppSelector(
    (state) => state.clinicApprovedAppointments
  );
  const { clinicApprovedAppointments, loading: loadingApprovedAppointments } =
    clinicApprovedApp;

  const hourClock = useHourClockContext();

  const [mappableApp, setMappableApp] = useState([]);
  const [isDescending, setIsDescending] = useState(false);

  const [toggle, setToggle] = useState(false);
  const [open, setOpen] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [thirdQuery, setThirdQuery] = React.useState<string>("");

  const [registeredPatient, setRegisteredPatient] = React.useState(false);
  const [unregisteredPatient, setUnregisteredPatient] = React.useState(false);
  const [isApproved, setIsApproved] = React.useState(false);
  const [isNotApproved, setIsNotApproved] = React.useState(false);
  const [selectedRange, setRange] = React.useState({});
  const [sortBy, setSortBy] = React.useState("");

  const navigation = useNavigation();
  const route = useRoute();
  // const dispatch = useDispatch();
  const routeAppointments = route.params;

  const dispatch = useDispatch();
  const momentExtended = extendMoment(Moment);

  const initiateSMS = async (values) => {
    console.log;
    const bodySMS = `${i18n.translate("txt1")}, ${
      values.patientInfo.basicInfoData.firstName
    } ${values.patientInfo.basicInfoData.lastName}! ${i18n.translate("txt2")} ${
      values.daySelected
    }, ${i18n.translate("txt3")} ${createTimeFormat(
      values.timeSelected.starttime,
      hourClock
    )} ${i18n.translate("txt4")} ${createTimeFormat(
      values.timeSelected.endtime,
      hourClock
    )}. ${i18n.translate("txt5")}`;
    const isAvailable = await SMS.isAvailableAsync();
    if (isAvailable) {
      console.log(bodySMS);
      // do your SMS stuff here
      const { result } = await SMS.sendSMSAsync(
        [`${values.phoneNumber}`],
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

  const handleSMS = (values) => {
    if (isProMember) {
      Alert.alert(
        `${i18n.translate("doYouWantToSendSMSReminder")} ${
          values.patientInfo.basicInfoData.firstName
        } ${values.patientInfo.basicInfoData.lastName}?`,
        `${values.patientInfo.basicInfoData.firstName} ${
          values.patientInfo.basicInfoData.lastName
        } ${i18n.translate("doYouWantToSendSMSReminderM1")} ${
          values.daySelected
        } ${i18n.translate("txt3Unreg")} ${createTimeFormat(
          values.timeSelected.starttime,
          hourClock
        )} ${i18n.translate("txt4Unreg")} ${createTimeFormat(
          values.timeSelected.endtime,
          hourClock
        )}`,
        [
          {
            text: i18n.translate("cancel"),
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel",
          },
          {
            text: i18n.translate("sendReminder"),
            onPress: () => initiateSMS(values),
          },
        ]
      );
    } else {
      navigation.navigate(screenName.Subscription);
    }
  };

  const handleTest = async () => {
    let clinicAppointments;
    let clinicAppointmentsUnregistered;

    const auth = authentication;

    const querySnapshot = await getDocs(
      collection(db, "Users", auth.currentUser.uid, "Doctors")
    );
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      // console.log(doc.id, " => ", doc.data());
      if (doc.data().clinicAppointments) {
        clinicAppointments = [...doc.data().clinicAppointments];
      }
      if (doc.data().clinicAppointmentsUnregistered) {
        clinicAppointmentsUnregistered = [
          ...doc.data().clinicAppointmentsUnregistered,
        ];
      }
    });
    for (let i = 0; i < clinicAppointmentsUnregistered.length; i++) {
      // GET INFO ABOUT DOCTOR
      const doctorRef = doc(
        db,
        "Users",
        auth.currentUser.uid,
        "Doctors",
        clinicAppointmentsUnregistered[i].doctorId
      );
      const doctorSnap = await getDoc(doctorRef);
      if (doctorSnap.exists()) {
        delete doctorSnap.data().clinicAppointments;

        clinicAppointmentsUnregistered[i].doctorInfo = doctorSnap.data();
      }

      clinicAppointments.push(clinicAppointmentsUnregistered[i]);
    }
    console.log(clinicAppointments[0]);
    console.log(clinicAppointments[1]);
  };

  const handleApplyFilter = (isDescending?) => {
    // console.log(sortBy)
    let appointments = [];
    let newArrApp = [];
    let filteredNewApp = [];
    let finalNewFilteredApp = [];

    if (routeAppointments) {
      if (routeAppointments.upcomingAppointments === "upcomingAppointments") {
        appointments = clinicApprovedAppointments.upcommingAppointments;
      } else if (routeAppointments.todayAppointments === "todayAppointments") {
        appointments = clinicApprovedAppointments.todayAppointments;
      } else {
        appointments = clinicAppointments;
      }
    }
    newArrApp = appointments;

    //START SORT

    if (sortBy === i18n.translate("doctorName")) {
      newArrApp = appointments.sort((a, b) => {
        if (isDescending) {
          return a.doctorInfo.doctorInfoData.firstname.localeCompare(
            b.doctorInfo.doctorInfoData.firstname
          );
        } else {
          return b.doctorInfo.doctorInfoData.firstname.localeCompare(
            a.doctorInfo.doctorInfoData.firstname
          );
        }
      });
    } else if (sortBy === i18n.translate("date")) {
      newArrApp = appointments.sort((a, b) => {
        if (isDescending) {
          return a.daySelected.localeCompare(b.daySelected);
        } else {
          return b.daySelected.localeCompare(a.daySelected);
        }
      });
    } else if (sortBy === i18n.translate("pacientName")) {
      newArrApp = appointments.sort((a, b) => {
        if (isDescending) {
          return a.patientInfo.basicInfoData.firstName.localeCompare(
            b.patientInfo.basicInfoData.firstName
          );
        } else {
          return b.patientInfo.basicInfoData.firstName.localeCompare(
            a.patientInfo.basicInfoData.firstName
          );
        }
      });
    }

    // START FILTER BY REGISTERED/UNREGISTERED
    if (unregisteredPatient && registeredPatient) {
      let firstNewArr = newArrApp.filter((app) => {
        return app.isUnregistered;
      });
      let secondNewArr = newArrApp.filter((app) => {
        return !app.isUnregistered;
      });
      filteredNewApp = [...firstNewArr, ...secondNewArr];
    } else if (unregisteredPatient) {
      filteredNewApp = newArrApp.filter((app) => {
        return app.isUnregistered;
      });
    } else if (registeredPatient) {
      filteredNewApp = newArrApp.filter((app) => {
        return !app.isUnregistered;
      });
    } else if (isApproved && isNotApproved) {
      let firstNewArr = newArrApp.filter((app) => {
        return app.isApproved;
      });
      let secondNewArr = newArrApp.filter((app) => {
        return !app.isApproved;
      });
      filteredNewApp = [...firstNewArr, ...secondNewArr];
    } else if (isApproved) {
      filteredNewApp = newArrApp.filter((app) => {
        return app.isApproved;
      });
    } else if (isNotApproved) {
      filteredNewApp = newArrApp.filter((app) => {
        return !app.isApproved;
      });
    } else {
      filteredNewApp = newArrApp;
    }

    //STAR FILTER BY DATE RANGE
    console.log(selectedRange);
    if (selectedRange.firstDate) {
      const start = selectedRange.firstDate.split("-").reverse().join("-");
      const end = selectedRange.secondDate.split("-").reverse().join("-");
      const startDate = Moment.utc(start);
      const endDate = Moment.utc(end);

      const range = momentExtended().range(startDate, endDate);

      finalNewFilteredApp = filteredNewApp.filter((app) => {
        const dateToFind = app.daySelected.split("-").reverse().join("-");
        const dateToCheck = Moment.utc(dateToFind);
        return range.contains(dateToCheck);
      });
    } else {
      finalNewFilteredApp = filteredNewApp;
    }

    setMappableApp(finalNewFilteredApp);
  };

  const handleAppointmentType = () => {
    console.log("TEST.............................");
    console.log("TEST.............................");
    if (routeAppointments) {
      if (routeAppointments.upcomingAppointments === "upcomingAppointments") {
        console.log("app type yes upcomming");
        setMappableApp(clinicApprovedAppointments.upcommingAppointments);
      } else if (routeAppointments.todayAppointments === "todayAppointments") {
        console.log("app type yes today");
        setMappableApp(clinicApprovedAppointments.todayAppointments);
      } else if (
        routeAppointments.unconfirmedAppointments === "unconfirmedAppointments"
      ) {
        console.log("app type unconfirmedAppointments");
        // console.log(clinicAppointments[0].isApproved);
        if (!loading) {
          const filteredAppointments = clinicAppointments.filter(
            (appointment) => appointment.isApproved === false
          );

          setMappableApp(filteredAppointments);
        }
      } else {
        console.log("yes all");
        setMappableApp(clinicAppointments);
      }
    }
  };

  const [searchedApp, setSearchedApp] = useState([]);

  const handleSearchApp = (txt) => {
    console.log("-------------Searching.......-------------");
    let filteredPersons;

    try {
      if (thirdQuery.length > 0) {
        filteredPersons = mappableApp.filter((app) => {
          let fullPatientName =
            app.patientInfo.basicInfoData.firstName +
            " " +
            app.patientInfo.basicInfoData.lastName;
          let fullDoctorName =
            app.doctorInfo.doctorInfoData.firstname +
            " " +
            app.doctorInfo.doctorInfoData.lastname;
          return (
            fullPatientName.toLowerCase().includes(txt.toLowerCase()) ||
            fullDoctorName.toLowerCase().includes(txt.toLowerCase())
          );
        });
      } else {
        filteredPersons = mappableApp.filter((app) => {
          return (
            app.patientInfo.basicInfoData.firstName
              .toLowerCase()
              .includes(txt.toLowerCase()) ||
            app.patientInfo.basicInfoData.lastName
              .toLowerCase()
              .includes(txt.toLowerCase()) ||
            app.doctorInfo.doctorInfoData.firstname
              .toLowerCase()
              .includes(txt.toLowerCase()) ||
            app.doctorInfo.doctorInfoData.lastname
              .toLowerCase()
              .includes(txt.toLowerCase())
          );
        });
      }

      setSearchedApp(filteredPersons);
    } catch (err) {
      console.log("error...searching appointemnts in handle search....", err);
    }
  };

  useEffect(() => {
    // handleGetAsyncData()

    // console.log(mappableApp[1])

    // handleTest()
    console.log("-------------clinicAppointments-------------");
    // console.log(clinicAppointments[0])

    handleAppointmentType();

    // console.log(mappableApp)
  }, [clinicAppointments, loading]);

  // return(
  //   <View>
  //     <Text>
  //       asdasdasds
  //     </Text>
  //   </View>
  // )

  return (
    <>
      <NavBar
        title={
          routeAppointments.upcomingAppointments === "upcomingAppointments"
            ? i18n.translate("upcomingAppointments")
            : routeAppointments.todayAppointments === "todayAppointments"
            ? i18n.translate("todayAppointments")
            : routeAppointments.unconfirmedAppointments ===
              "unconfirmedAppointments"
            ? i18n.translate("unconfirmedAppointments")
            : i18n.translate("appointments")
        }
        navHeight={80}
        isModal={false}
        isTermsAccepted={true}
        isGoBack={
          routeAppointments.upcomingAppointments === "upcomingAppointments" ||
          routeAppointments.todayAppointments === "todayAppointments" ||
          routeAppointments.unconfirmedAppointments ===
            "unconfirmedAppointments"
            ? true
            : false
        }
      />

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
        }}
      >
        <Searchbar
          placeholder={i18n.translate("search")}
          onChangeText={(query: string) => {
            setThirdQuery(query);
            handleSearchApp(query);
          }}
          value={thirdQuery}
          icon="filter"
          onIconPress={() => setModalVisible(!modalVisible)}
          style={{ margin: 4, width: "85%" }}
        />

        {selectedRange.firstdate ||
        sortBy.length > 0 ||
        registeredPatient ||
        unregisteredPatient ? (
          <TouchableOpacity
            onPress={() => {
              handleApplyFilter(!isDescending);
              setIsDescending(!isDescending);
            }}
          >
            {isDescending ? (
              <MaterialCommunityIcons
                name="sort-descending"
                size={24}
                color="black"
              />
            ) : (
              <MaterialCommunityIcons
                name="sort-ascending"
                size={24}
                color="black"
              />
            )}
          </TouchableOpacity>
        ) : null}
      </View>
      <AppointmentFilters
        sortBy={sortBy}
        unregisteredPatient={unregisteredPatient}
        setUnregisteredPatient={setUnregisteredPatient}
        handleApplyFilter={handleApplyFilter}
        selectedRange={selectedRange}
        setModalVisible={setModalVisible}
        modalVisible={modalVisible}
        setSortBy={setSortBy}
        setRange={setRange}
        setRegisteredPatient={setRegisteredPatient}
        registeredPatient={registeredPatient}
        isApproved={isApproved}
        setIsNotApproved={setIsNotApproved}
        setIsApproved={setIsApproved}
        isNotApproved={isNotApproved}
        handleAppointmentType={handleAppointmentType}
      />

      {searchedApp.length > 0 && !loading && !loadingApprovedAppointments ? (
        <ScrollView style={styles.container}>
          {searchedApp.length === 0 &&
            (routeAppointments &&
            routeAppointments.upcomingAppointments ===
              "upcomingAppointments" ? (
              <H6fontRegularBlue>
                {" "}
                {i18n.translate("noUpcommingAppointments")}
              </H6fontRegularBlue>
            ) : routeAppointments &&
              routeAppointments.todayAppointments === "todayAppointments" ? (
              <H6fontRegularBlue>
                {" "}
                {i18n.translate("noAppointmentsToday")}
              </H6fontRegularBlue>
            ) : (
              <H6fontRegularBlue>
                {" "}
                {i18n.translate("noAppointemnts")}
              </H6fontRegularBlue>
            ))}
          {searchedApp.length > 0 &&
            searchedApp.map((item, index) => (
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
                  <View style={flexRow}>
                    <H9fontRegularGray numberOfLines={2}>
                      {createTimeFormat(item.timeSelected.starttime, hourClock)}
                    </H9fontRegularGray>
                    <H9fontRegularGray numberOfLines={2}>
                      {" - "}
                    </H9fontRegularGray>
                    <H9fontRegularGray numberOfLines={2}>
                      {createTimeFormat(item.timeSelected.endtime, hourClock)}
                    </H9fontRegularGray>
                  </View>

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
                      <AntDesign name="checkcircle" size={24} color="white" />
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
                        <Image
                          style={{ height: 100, width: 130 }}
                          source={require("../../images/clients.png")}
                        />
                      )}
                    </View>
                    <View style={styles.basicDetails}>
                      <View style={flexRow}>
                        <H8fontMediumBlack numberOfLines={2}>
                          {item.patientInfo.basicInfoData &&
                            item.patientInfo.basicInfoData.firstName}{" "}
                          {item.patientInfo.basicInfoData &&
                            item.patientInfo.basicInfoData.lastName}
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
                      <View style={[flexRow, { width: "80%" }]}>
                        <H8fontMediumBlack numberOfLines={2}>
                          {i18n.translate("doctor")}:
                          {item.doctorInfo.doctorInfoData.firstname}{" "}
                          {item.doctorInfo.doctorInfoData.lastname}
                        </H8fontMediumBlack>
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
                    onPress={() => {
                      // navigation.navigate(screenName.CheckAppointmentClinic, {
                      //   item,
                      // });
                      console.log("test1...");
                      // await storeData("appointmentsTutorial", "done");
                    }}
                  >
                    <View style={styles.buttonRow}>
                      <Feather name="eye" size={24} color="black" />
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
                        ? handleSMS(item)
                        : Alert.alert(
                            "Appointment is not confirmed",
                            "You have to confirm the appointment in order to send a reminder",
                            [
                              {
                                text: "Cancel",
                                onPress: () => console.log("Cancel Pressed"),
                                style: "cancel",
                              },
                              {
                                text: "Confirm appointment",
                                onPress: () =>
                                  navigation.navigate(
                                    screenName.CheckAppointmentClinic,
                                    {
                                      item,
                                    }
                                  ),
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
                    onPress={() => Linking.openURL(`tel:${item.phoneNumber}`)}
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
      ) : loading || loadingApprovedAppointments ? (
        <View
          style={{
            height: "80%",
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size={"large"} />
        </View>
      ) : (
        mappableApp &&
        thirdQuery.length === 0 &&
        !loading && (
          <ScrollView style={styles.container}>
            {mappableApp.length === 0 &&
              (routeAppointments &&
              routeAppointments.upcomingAppointments ===
                "upcomingAppointments" ? (
                <H6fontRegularBlue>
                  {" "}
                  {i18n.translate("noUpcommingAppointments")}
                </H6fontRegularBlue>
              ) : routeAppointments &&
                routeAppointments.todayAppointments === "todayAppointments" ? (
                <H6fontRegularBlue>
                  {" "}
                  {i18n.translate("noAppointmentsToday")}
                </H6fontRegularBlue>
              ) : (
                <H6fontRegularBlue>
                  {" "}
                  {i18n.translate("noAppointemnts")}
                </H6fontRegularBlue>
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
                        <AntDesign name="checkcircle" size={20} color="white" />
                        <Text style={styles.buttonTextStyle}>
                          {item.isApproved
                            ? i18n.translate("confirm")
                            : i18n.translate("notConfirmed")}
                        </Text>
                      </View>
                    </View>
                  </RowView>
                  <View style={flexRow}>
                    <H8fontRegularPrimary numberOfLines={2}>
                      {createTimeFormat(item.timeSelected.starttime, hourClock)}
                    </H8fontRegularPrimary>
                    <H8fontRegularPrimary numberOfLines={2}>
                      {" - "}
                    </H8fontRegularPrimary>
                    <H8fontRegularPrimary numberOfLines={2}>
                      {createTimeFormat(item.timeSelected.endtime, hourClock)}
                    </H8fontRegularPrimary>
                  </View>

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
                          //  <Ionicons name="person-sharp" size={50} color={colors.facebook} />
                          <Image
                            style={{ height: 100, width: 130 }}
                            source={require("../../images/clients.png")}
                          />
                        )}
                      </View>
                      <View style={styles.basicDetails}>
                        <View style={flexRow}>
                          <H8fontMediumBlack numberOfLines={2}>
                            {item.patientInfo.basicInfoData &&
                              item.patientInfo.basicInfoData.firstName}{" "}
                            {item.patientInfo.basicInfoData &&
                              item.patientInfo.basicInfoData.lastName}
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
                        <View style={[flexRow, { width: "80%" }]}>
                          <H8fontMediumBlack numberOfLines={2}>
                            {i18n.translate("doctor")}:
                            {item.doctorInfo.doctorInfoData.firstname}{" "}
                            {item.doctorInfo.doctorInfoData.lastname}
                          </H8fontMediumBlack>
                        </View>
                        <View style={[flexRow, { width: "80%" }]}>
                          <H8fontMediumBlack numberOfLines={2}>
                            {i18n.translate("services")}:{" "}
                          </H8fontMediumBlack>
                          {item.selectedServices.map((service, index) => (
                            <H8fontMediumBlack numberOfLines={2}>
                              {index === 0 ? service : `, ${service}`}
                            </H8fontMediumBlack>
                          ))}
                        </View>

                        {/* <H8fontMediumBlack style={pt5}>{'$150'}</H8fontMediumBlack> */}
                      </View>
                    </View>
                  </RowView>
                  <View style={styles.cardButtonRow}>
                    <TouchableOpacity
                      style={styles.viewButtonStyle}
                      onPress={async () => {
                        navigation.navigate(screenName.CheckAppointmentClinic, {
                          item,
                        });
                        // console.log("Test2...");
                        await storeData("appointmentsTutorial", "done");
                      }}
                    >
                      <View style={styles.buttonRow}>
                        <Feather name="eye" size={24} color="white" />

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
                          ? handleSMS(item)
                          : Alert.alert(
                              "Appointment is not confirmed",
                              "You have to confirm the appointment in order to send a reminder",
                              [
                                {
                                  text: "Cancel",
                                  onPress: () => console.log("Cancel Pressed"),
                                  style: "cancel",
                                },
                                {
                                  text: "Confirm appointment",
                                  onPress: () =>
                                    navigation.navigate(
                                      screenName.CheckAppointmentClinic,
                                      {
                                        item,
                                      }
                                    ),
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
                      onPress={() => Linking.openURL(`tel:${item.phoneNumber}`)}
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
        )
      )}
    </>
  );
};
export default ClinicAppointments;

const styles = StyleSheet.create({
  cardStyle: {
    height: "auto",
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
    // paddingRight: 25,
    // backgroundColor:"red"
  },
  basicDetails: { paddingLeft: 10 },
  cardButtonRow: {
    flexDirection: "row",
    marginTop: 5,
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

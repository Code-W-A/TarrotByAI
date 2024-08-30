import React, { useEffect, useState } from "react";
import { View, Image, StyleSheet } from "react-native";
import { labels } from "../../utils/labels";
import { CardSurface, DashedLine, RowView } from "../../components/commonViews";
import {
  H14fontRegularBlackk,
  H15fontMediumBlack,
  H6fontRegularBlack,
  H8fontMediumBlack,
  H9fontMediumBlack,
  H9fontRegularGray,
} from "../../components/commonText";
import { colors } from "../../utils/colors";
// import Icon from 'react-native-vector-icons/FontAwesome';
// import Icon1 from 'react-native-vector-icons/MaterialIcons';
// import Icon2 from 'react-native-vector-icons/Entypo';
// import {DevWidth} from '../../utils/device';
import { Dimensions } from "react-native";

import { flexRow, p5, pl10, pl15, pl5, pt5 } from "../../common/commonStyles";
import Iicon from "../../../assets/images/i-icon.svg";
import Patient4 from "../../../assets/images/blank-profile.svg";
import UserIcon from "../../../assets/images/icon-awesome-user.svg";
import MapDoctor from "../../../assets/images/map-doctor.svg";
import { useDispatch, useSelector } from "react-redux";
import {
  filterPastAppointments,
  filterUpcomingAppointments,
  sortByDate,
} from "../../utils/sortAppPatient";
import { Text } from "react-native-paper";
import { getPatientAppointments } from "../../actions/patientActions";
import i18n from "../../../i18n";
import { useAppSelector } from "../../hooks/hooks";
import { createTimeFormat } from "../../utils/convertTime24Hours";
import { useHourClockContext } from "../../context/HourClockContext";

interface Props {
  patientImag?: any;
}

const Dash = () => {
  return (
    <View style={{ paddingLeft: 23 }}>
      <DashedLine />
    </View>
  );
};

const PatientOverView: React.FC<Props> = ({ patientImag }): JSX.Element => {
  const [sortedAppointments, setSortedAppointments] = useState([]);

  const patientInfoDB = useAppSelector((state) => state.patientInfoData);
  const { patientInformation } = patientInfoDB;

  const ptAppointments = useAppSelector((state) => state.patientAppointments);
  const { myAppointments, loading } = ptAppointments;

  const hourClock = useHourClockContext();

  const dispatch = useDispatch();

  useEffect(() => {
    if (loading) {
      return;
    }

    const filteredPastApp = filterUpcomingAppointments(
      myAppointments.upcommingAppointments
    );

    const sortedApp = sortByDate(filteredPastApp);

    setSortedAppointments(sortedApp);
  }, []);

  // return(<View>
  //   <Text>aasdasd</Text>
  // </View>)

  return (
    <View style={styles.container}>
      <View style={flexRow}>
        <View>
          <CardSurface style={styles.iconSurface}>
            <Iicon fill={"#000"} height={20} width={7} />
          </CardSurface>
          <Dash />
        </View>
        <View style={pl15}>
          <CardSurface style={styles.infoDetailsStyle}>
            <RowView>
              <View style={[styles.patientDetails, { width: "100%" }]}>
                <View style={styles.profileImage}>
                  {patientImag ? (
                    <Image
                      source={{ uri: patientImag }}
                      style={{ height: 80, width: 80 }}
                    />
                  ) : (
                    <Patient4 height={"100%"} width={"150%"} />
                  )}
                </View>

                <View
                  style={{
                    justifyContent: "center",
                    paddingLeft: 10,
                    width: "70%",
                  }}
                >
                  <H6fontRegularBlack numberOfLines={2}>
                    {patientInformation.basicInfoData &&
                      patientInformation.basicInfoData.firstname}{" "}
                    {patientInformation &&
                      patientInformation.basicInfoData.lastname}
                  </H6fontRegularBlack>
                  <View style={[{ width: "100%" }]}>
                    <H9fontRegularGray style={pt5} numberOfLines={2}>
                      <Text style={{ fontWeight: "bold" }}>
                        {i18n.translate("gender")}:{" "}
                      </Text>
                      {patientInformation.basicInfoData &&
                        patientInformation.basicInfoData.gender}
                    </H9fontRegularGray>
                  </View>
                  <View style={flexRow}>
                    <H9fontRegularGray style={{}} numberOfLines={2}>
                      <Text style={{ fontWeight: "bold" }}>
                        {i18n.translate("email")}:{" "}
                      </Text>
                      {patientInformation && patientInformation.email}
                    </H9fontRegularGray>
                  </View>
                  <View style={flexRow}>
                    <H9fontRegularGray style={{}} numberOfLines={2}>
                      <Text style={{ fontWeight: "bold" }}>
                        {i18n.translate("phoneNumber")}:{" "}
                      </Text>
                      {patientInformation && patientInformation.phoneNumber}
                    </H9fontRegularGray>
                  </View>
                </View>
              </View>
            </RowView>
            {/* <RowView>
              <View style={styles.otherDetails}>
                <H9fontMediumBlack style={styles.otherDetailsText}>
                  {patientInformation.basicInfoData && patientInformation.basicInfoData.town}
                  {', '}
                  {patientInformation.basicInfoData &&
                    patientInformation.basicInfoData.country}
                </H9fontMediumBlack>
              </View>
            </RowView> */}
          </CardSurface>
        </View>
      </View>

      <View style={flexRow}>
        <CardSurface style={styles.iconSurface}>
          <MapDoctor fill={"#000"} height={18} width={15} />
        </CardSurface>
        <View style={pl15}>
          <CardSurface style={styles.bookingDetails}>
            <H15fontMediumBlack style={p5}>
              {i18n.translate("nextAppointment")}
            </H15fontMediumBlack>
            <View style={styles.drNameStyle}>
              {/* <Icon1 name="check" size={20} color={'black'} /> */}
              <H14fontRegularBlackk style={pt5}>
                {sortedAppointments.length > 0
                  ? sortedAppointments[0].doctorInfo.doctorInfoData.firstname
                  : "You don't have any"}{" "}
                {sortedAppointments.length > 0
                  ? sortedAppointments[0].doctorInfo.doctorInfoData.lastname
                  : "appointments"}
              </H14fontRegularBlackk>
            </View>
            <H9fontRegularGray style={styles.bookigDetila}>
              {sortedAppointments.length > 0
                ? sortedAppointments[0].doctorInfo.doctorInfoData
                    .specializations
                : null}
            </H9fontRegularGray>
            <H9fontRegularGray style={styles.bookigDetila}>
              {sortedAppointments.length > 0
                ? sortedAppointments[0].daySelected
                : null}
              {sortedAppointments.length > 0 ? ", " : ""}
              {sortedAppointments.length > 0
                ? createTimeFormat(
                    sortedAppointments[0].timeSelected.starttime,
                    hourClock
                  )
                : null}
              {sortedAppointments.length > 0 ? ` ${i18n.translate("to")} ` : ""}
              {sortedAppointments.length > 0
                ? createTimeFormat(
                    sortedAppointments[0].timeSelected.endtime,
                    hourClock
                  )
                : null}
            </H9fontRegularGray>
          </CardSurface>
        </View>
      </View>
    </View>
  );
};
export default PatientOverView;
const styles = StyleSheet.create({
  container: { paddingHorizontal: 18 },
  iconSurface: {
    borderRadius: 25,
    height: 40,
    width: 40,
    backgroundColor: colors.white,
    paddingTop: 9,
    // paddingLeft: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  infoIconStyle: { height: 20, width: 7 },
  infoDetailsStyle: {
    height: 160,
    width: Dimensions.get("window").width / 1.35,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 10,
  },
  patientDetails: { padding: 5, flexDirection: "row" },
  profileImage: {
    height: 70,
    width: 70,
    borderRadius: 40,
    borderWidth: 5,
    borderColor: "#f7f7f7",
    paddingRight: 20,
    overflow: "hidden",
  },
  otherDetails: { flexDirection: "row", paddingTop: 6 },
  otherDetailsText: { paddingLeft: 4, paddingRight: 10 },
  userIconStyle: { height: 18, width: 15 },
  drIconStyle: { height: 18, width: 18 },
  bookingDetails: {
    height: 140,
    width: Dimensions.get("window").width / 1.35,
    backgroundColor: "white",
    borderRadius: 20,
  },
  drNameStyle: {
    flexDirection: "row",
    paddingLeft: 5,
    borderTopWidth: 1,
    borderTopColor: "grey",
  },
  bookigDetila: { paddingLeft: 32 },
  rowStyele: { flexDirection: "row", paddingLeft: 5, paddingTop: 5 },
});

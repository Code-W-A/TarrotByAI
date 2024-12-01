import React, { Fragment, useEffect, useState } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from "react-native";
import { GeneralProps } from "../../interfaces/generalProps";
import { Route, useRoute } from "@react-navigation/native";
import { labels } from "../../utils/labels";
import { screenName } from "../../utils/screenName";
import {
  H23fontRegularGray,
  H16fontRegularGray,
  H16fontRegularYellow,
  H14fontRegularWhite,
} from "../../components/commonText";
import { colors } from "../../utils/colors";
import { flexRow, justyfyCenter, p15 } from "../../common/commonStyles";

import { useDispatch } from "react-redux";
import {
  getClinicAppointments,
  getClinicApprovedAppointments,
} from "../../actions/clinicActions";
import i18n from "../../../i18n";
import { createTimeFormat } from "../../utils/convertTime24Hours";
import { useHourClockContext } from "../../context/HourClockContext";
import { Feather } from "@expo/vector-icons";

interface Props extends GeneralProps {
  route: Route<string, object | undefined>;
}

const BookingCanceledClinic: React.FC<Props> = ({
  navigation,
  route,
}): JSX.Element => {
  const dispatch = useDispatch();
  const [patientData, setPatientData] = useState({});

  const hourClock = useHourClockContext();

  const handleNavigation = () => {
    dispatch(getClinicAppointments()).then(() => {
      navigation.navigate(screenName.ClinicDashBoard);
    });
  };

  useEffect(() => {
    // dispatch(getClinicAppointments());
    console.log(patientData);
    setPatientData(route.params.patientData.item);
  }, []);
  return (
    <Fragment>
      <ImageBackground
        source={require("../../images/confirmCancelAppBG.png")}
        resizeMode="cover"
        style={{ height: "100%", width: "100%" }}
      >
        {/* <TouchableOpacity onPress={() => navigation.goBack()} style={p15}>
          <LeftArrowIcon height={24} width={24} />
        </TouchableOpacity> */}
        <View style={styles.successImageContainer}>
          <Feather name="check-circle" size={144} color="white" />
        </View>
        <View style={styles.bodyContainer}>
          <View style={styles.borderStyle}>
            <H23fontRegularGray>
              {i18n.translate("canceled")}
            </H23fontRegularGray>
            <H23fontRegularGray>{i18n.translate("success")}</H23fontRegularGray>
            <H16fontRegularGray>
              {i18n.translate("canceledWith")}
            </H16fontRegularGray>
            <View style={flexRow}>
              {route.params.patientData.item && (
                <H16fontRegularYellow>
                  {
                    route.params.patientData.item.patientInfo.basicInfoData
                      .firstName
                  }{" "}
                  {
                    route.params.patientData.item.patientInfo.basicInfoData
                      .lastName
                  }
                </H16fontRegularYellow>
              )}
              <H16fontRegularGray>{` ${i18n.translate(
                "on"
              )} `}</H16fontRegularGray>
              {route.params.patientData.item && (
                <H16fontRegularYellow>
                  {route.params.patientData.item.daySelected}
                </H16fontRegularYellow>
              )}
            </View>
            {route.params.patientData.item && (
              <H16fontRegularYellow style={{}}>
                {`${createTimeFormat(
                  route.params.patientData.item.timeSelected.starttime,
                  hourClock
                )} ${i18n.translate("to")} ${createTimeFormat(
                  route.params.patientData.item.timeSelected.endtime,
                  hourClock
                )}`}
              </H16fontRegularYellow>
            )}
          </View>
        </View>

        <TouchableOpacity
          onPress={() => handleNavigation()}
          style={styles.buttonStyle}
        >
          <H14fontRegularWhite>
            {i18n.translate("checkAppointments")}
          </H14fontRegularWhite>
        </TouchableOpacity>
      </ImageBackground>
    </Fragment>
  );
};
export default BookingCanceledClinic;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.blue,
    flex: 1,
  },
  backImageStyle: {
    height: 25,
    width: 25,
  },
  successImageContainer: {
    alignSelf: "center",
    paddingTop: 80,
  },
  imageStyle: {
    height: 150,
    width: 150,
  },
  bodyContainer: {
    paddingHorizontal: 40,
    paddingTop: 30,
  },
  borderStyle: {
    height: 220,
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 5,
    borderStyle: "dashed",
    borderColor: "white",
    padding: 10,
    justifyContent: "space-evenly",
  },
  buttonStyle: {
    height: 45,
    backgroundColor: colors.primary2,
    marginTop: 40,
    marginHorizontal: 30,
    borderRadius: 30,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0.3,
    borderColor: "white",
  },
});

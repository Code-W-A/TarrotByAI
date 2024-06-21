import React, { useEffect } from "react";
import { View, Image, StyleSheet } from "react-native";
import { labels } from "../../utils/labels";
import { CardSurface, RowView } from "../../components/commonViews";
import {
  H10fontRegularGreen,
  H10fontRegularRed,
  H14fontMediumBlack,
  H14fontRegulargray,
  H15fontMediumBlack,
  H9fontRegularBlack,
} from "../../components/commonText";
// import Icon from 'react-native-vector-icons/Feather';
import { colors } from "../../utils/colors";
import { justyfyCenter, spaceBetween } from "../../common/commonStyles";
import TodayIcon from "../../../assets/images/today-icon.svg";
import { useRoute } from "@react-navigation/native";
import i18n from "../../../i18n";
import { createTimeFormat } from "../../utils/convertTime24Hours";
import { useHourClockContext } from "../../context/HourClockContext";

interface Props {}

const HoursView: React.FC<Props> = ({}): JSX.Element => {
  const route = useRoute();
  const doctorRouteInfo = route.params;
  console.log("---------------");
  const hourClock = useHourClockContext();

  useEffect(() => {
    // console.log(doctorRouteInfo.doctorInfo.allDays);
  }, []);

  const scheduleTimeList = [
    {
      day: i18n.translate("monday"),
      time: "07:00 AM - 09:00 PM",
      isClosed: false,
    },
    {
      day: i18n.translate("tuesday"),
      time: "07:00 AM - 09:00 PM",
      isClosed: false,
    },
    {
      day: i18n.translate("wednesday"),
      time: "07:00 AM - 09:00 PM",
      isClosed: false,
    },
    {
      day: i18n.translate("thrusday"),
      time: "07:00 AM - 09:00 PM",
      isClosed: false,
    },
    {
      day: i18n.translate("friday"),
      time: "07:00 AM - 09:00 PM",
      isClosed: false,
    },
    {
      day: i18n.translate("saturday"),
      time: "07:00 AM - 09:00 PM",
      isClosed: false,
    },
    {
      day: i18n.translate("sunday"),
      time: "07:00 AM - 09:00 PM",
      isClosed: true,
    },
  ];

  const scheduleTime = (item) => {
    const splitted = item.timeS.split(" - ");
    console.log(item.timeSPack);
    return (
      <RowView style={{ padding: 8 }}>
        <View style={{ flexDirection: "row" }}>
          {/* <Icon
            name="check-circle"
            size={20}
            color={item.isClosed ? colors.red : colors.black}
          /> */}
          <H14fontMediumBlack style={{ paddingLeft: 10 }}>
            {splitted[1]}
          </H14fontMediumBlack>
        </View>

        {/* {item.isClosed ? (
          <View style={styles.closedStatus}>
            <H10fontRegularRed>{labels.closed}</H10fontRegularRed>
          </View>
        ) : ( */}
        {item.timeSPack.map((time, index) => (
          <H14fontRegulargray key={index}>
            {createTimeFormat(time.starttime, hourClock)}
            {` ${i18n.translate("to")} `}
            {createTimeFormat(time.endtime, hourClock)}
          </H14fontRegulargray>
        ))}
        {/* )} */}
      </RowView>
    );
  };

  return (
    <View style={styles.constainer}>
      <CardSurface style={styles.cardStyle}>
        <RowView>
          <TodayIcon height={50} width={50} />
          <View style={spaceBetween}>
            <H15fontMediumBlack>{i18n.translate("today")}</H15fontMediumBlack>
            <H9fontRegularBlack>{"5 Nov 2019"}</H9fontRegularBlack>
          </View>
          <View>
            <View style={styles.timeAndStatus}>
              <H10fontRegularGreen>
                {i18n.translate("openNow")}
              </H10fontRegularGreen>
            </View>
            <H14fontRegulargray>{"07:00 AM - 09:00 PM"}</H14fontRegulargray>
          </View>
        </RowView>
      </CardSurface>
      <View style={styles.bodyContainer}>
        <CardSurface style={styles.bodySurfaceStyle}>
          {doctorRouteInfo.doctorInfo.allDays.map((item, index) => {
            return scheduleTime(item);
          })}
        </CardSurface>
      </View>
    </View>
  );
};
export default HoursView;
const styles = StyleSheet.create({
  constainer: { paddingHorizontal: 18 },
  cardStyle: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: "white",
    borderRadius: 20,
  },
  timerStyle: { height: 50, width: 50 },
  timeAndStatus: {
    height: 25,
    width: 90,
    borderRadius: 5,
    backgroundColor: "rgba(0, 167, 105, 0.3)",
    alignSelf: "flex-end",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  bodyContainer: { paddingTop: 20 },
  bodySurfaceStyle: {
    height: 300,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 10,
  },
  closedStatus: {
    height: 25,
    width: 90,
    borderRadius: 6,
    backgroundColor: "rgba(255, 49, 49, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
});

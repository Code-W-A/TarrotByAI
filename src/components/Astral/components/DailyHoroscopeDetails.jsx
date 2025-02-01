import React from "react";
import { StyleSheet, View } from "react-native";
import { H15fontMediumWhite } from "../../../components/commonText";
import { Divider } from "react-native-paper";
import LuckyNumber from "../../../pages/LuckyNumberComponent/LuckyNumberComponent";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../../../utils/colors";
import ShowFromTop from "./show-from-top";

// Assuming you are passing the necessary userD data as a prop
const DailyHoroscopeDetails = ({ userD }) => {
  return (
    <ShowFromTop>
      {/* <View
      style={[
        styles.defaultContainer,
        {
          flexDirection: "row",
          alignItems: "center",
          marginTop: 10,
        },
      ]}
    >
      <H15fontMediumWhite style={styles.textTitles}>
        Focus of the day:
      </H15fontMediumWhite>
      <H15fontMediumWhite
        style={{
          fontSize: 16,
          marginLeft: 5,
          color: colors.primary3,
        }}
      >
        focus...
      </H15fontMediumWhite>
    </View> */}
      {/* <View
      style={[
        styles.defaultContainer,
        {
          marginTop: 25,
          marginBottom: 5,
          flexDirection: "row",
          justifyContent: "space-around",
        },
      ]}
    >
      <ProgressItem
        text={"Love"}
        percent={data.contents.percents.love}
      />
      <ProgressItem
        text={"Career"}
        percent={data.contents.percents.work}
        style={{ marginHorizontal: 5 }}
      />
      <ProgressItem
        text={"Health"}
        percent={data.contents.percents.health}
      />
    </View> */}
      <View style={styles.defaultContainer}>
        <H15fontMediumWhite style={styles.textTitles}>
          Lucky numbers{" "}
        </H15fontMediumWhite>
      </View>
      <View
        style={[
          styles.defaultContainer,
          {
            flexDirection: "row",
            justifyContent: "space-evenly",
          },
        ]}
      >
        {userD.horoscopeResultsDaily?.data?.prediction?.luck[1] &&
          userD.horoscopeResultsDaily.data.prediction.luck[1]
            .match(/\d+/g)
            ?.map((numberStr, i) => (
              <LuckyNumber key={i} number={parseInt(numberStr, 10)} />
            ))}
      </View>
      {/* <View style={{ paddingVertical: 10 }} /> */}
      <View style={styles.defaultContainer}>
        <H15fontMediumWhite style={styles.textTitles}>
          {userD.horoscopeResultsDaily?.data?.prediction?.luck[0]}
        </H15fontMediumWhite>
      </View>
      <View style={styles.defaultContainer}>
        <H15fontMediumWhite style={styles.textTitles}>
          {userD.horoscopeResultsDaily?.data?.prediction?.luck[2]}
        </H15fontMediumWhite>
      </View>
      <View style={styles.defaultContainer}>
        <H15fontMediumWhite style={styles.textTitles}>
          {userD.horoscopeResultsDaily?.data?.prediction?.luck[3]}
        </H15fontMediumWhite>
      </View>
      <View style={styles.defaultContainer}>
        <H15fontMediumWhite style={styles.textTitles}>
          {userD.horoscopeResultsDaily?.data?.prediction?.luck[4]}
        </H15fontMediumWhite>
      </View>
      <View style={styles.defaultContainer}>
        <H15fontMediumWhite style={styles.textTitles}>
          {userD.horoscopeResultsDaily?.data?.prediction?.luck[5]}
        </H15fontMediumWhite>
      </View>
      <Divider style={{ marginTop: 20 }} />
      <View style={[styles.defaultContainer]}>
        <View style={styles.horoscopeTodayContainer}>
          <H15fontMediumWhite style={styles.textTitles}>
            Your horoscope for today:
          </H15fontMediumWhite>
          <View style={styles.iconsHoroscopeToday}>
            <MaterialCommunityIcons
              name="heart"
              size={16}
              color={colors.white}
              style={{ marginLeft: 5 }}
            />
            <MaterialCommunityIcons
              name="briefcase"
              size={16}
              color={colors.white}
              style={{ marginLeft: 5 }}
            />
            <MaterialCommunityIcons
              name="food-apple"
              size={16}
              color={colors.white}
              style={{ marginLeft: 5 }}
            />
          </View>
        </View>
      </View>
      <View style={styles.defaultContainer}>
        <H15fontMediumWhite style={styles.textTitles}>
          Emotions
        </H15fontMediumWhite>
        <H15fontMediumWhite style={{ marginTop: 15 }}>
          {userD.horoscopeResultsDaily?.data?.prediction?.emotions}
        </H15fontMediumWhite>
      </View>
      <View style={styles.defaultContainer}>
        <H15fontMediumWhite style={styles.textTitles}>
          Health
        </H15fontMediumWhite>
        <H15fontMediumWhite style={{ marginTop: 15 }}>
          {userD.horoscopeResultsDaily?.data?.prediction?.health}
        </H15fontMediumWhite>
      </View>
      <View style={styles.defaultContainer}>
        <H15fontMediumWhite style={styles.textTitles}>
          Personal
        </H15fontMediumWhite>
        <H15fontMediumWhite style={{ marginTop: 15 }}>
          {userD.horoscopeResultsDaily?.data?.prediction?.personal}
        </H15fontMediumWhite>
      </View>
      <View style={styles.defaultContainer}>
        <H15fontMediumWhite style={styles.textTitles}>
          Profession
        </H15fontMediumWhite>
        <H15fontMediumWhite style={{ marginTop: 15 }}>
          {userD.horoscopeResultsDaily?.data?.prediction?.profession}
        </H15fontMediumWhite>
      </View>
      <View style={styles.defaultContainer}>
        <H15fontMediumWhite style={styles.textTitles}>
          Travel
        </H15fontMediumWhite>
        <H15fontMediumWhite style={{ marginTop: 15 }}>
          {userD.horoscopeResultsDaily?.data?.prediction?.travel}
        </H15fontMediumWhite>
      </View>
    </ShowFromTop>
  );
};

export default DailyHoroscopeDetails;

const styles = StyleSheet.create({
  backgroundConstellation: {
    zIndex: 1,
    position: "absolute",
    top: 300,
    left: 20,
    opacity: 0.05,
  },
  headerContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginVertical: 20,
  },
  headerHeadline: {
    fontWeight: "bold",
    fontSize: 30,
    lineHeight: 34,
    marginTop: 20,
    color: "white",
  },
  defaultContainer: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  textTitles: {
    fontSize: 16,
  },
  horoscopeTodayContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconsHoroscopeToday: {
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  loveContainer: {
    flexDirection: "row",
    marginTop: 15,
    marginHorizontal: 20,
    justifyContent: "space-between",
    borderWidth: 2,
    borderRadius: 10,
  },
  heartLoveContainer: {
    flex: 0.2,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  loveSignsContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    flex: 1,
    marginTop: 10,
  },
});

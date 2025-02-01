import * as React from "react";
import { Text, View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { colors } from "../utils/colors";
// import {DevWidth} from '../utils/device';
import { Dimensions } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import {
  H10fontRegularBlack,
  H10fontRegularWhite,
  H13fontRegularGray,
  H14fontRegularBlack,
  H14fontRegularBlackk,
  H14fontRegularBlue,
  H15fontMediumBlack,
  H6fontMediumWhite,
  H7fontRegularBlack,
  H8fontMediumBlue,
  H8fontMediumLightBlack,
  H8fontRegularWhite,
  H9fontMediumBlack,
  H9fontMediumBlue,
  H9fontMediumWhite,
  H9fontRegularGray,
} from "./commonText";
import { CardSurface, CommonLineDotted, RowView } from "./commonViews";
// import Icon2 from 'react-native-vector-icons/FontAwesome';
// import Icon3 from 'react-native-vector-icons/AntDesign';
import { DoctorDetailsProps } from "../interfaces/generalProps";
import {
  alignItemsCenter,
  flex1,
  flexRow,
  justifyStart,
  justyfyCenter,
  mh10,
  ml10,
  pl10,
  pl5,
  pt5,
  pv10,
  pv5,
  pl2,
  ml5,
  mv10,
  mr10,
  pt10,
} from "../common/commonStyles";
import { labels } from "../utils/labels";
import Doctor1 from "../../assets/images/blank-profile.svg";
import DentistIcon from "../../assets/images/specialities/specialities-05.svg";
import { ButtonFull } from "./commonButton";
import { AirbnbRating } from "react-native-elements";
import StarRating from "react-native-star-rating-widget";
import { Chip } from "react-native-paper";
import i18n from "../../i18n";
interface DoctorDetailsCardProps {
  drProfileNavigation: CallableFunction;
  bookAnAppointment: CallableFunction;
  details: DoctorDetailsProps;
  page: string;
  marginH?: any;
}

const DoctorDetailsCard: React.FC<DoctorDetailsCardProps> = ({
  drProfileNavigation,
  bookAnAppointment,
  details,
  page,
  marginH,
}) => {
  console.log("details about ranking...");
  console.log(details.ratingMedia);
  return (
    <View
      style={{
        height: 190,
        backgroundColor: "white",
        borderRadius: 30,
        // paddingHorizontal: 15,
        width: 330,
        marginHorizontal: marginH,
        marginTop: 10,
      }}
    >
      {/* <CommonLineDotted /> */}
      <RowView style={{ width: "100%", height: "100%" }}>
        <View
          style={{
            // padding: 5,
            flexDirection: "row",
            // alignItems: 'center',
            // backgroundColor: 'green',
            width: "100%",
            height: "100%",
          }}
        >
          <View style={styles.chip}>
            <Text style={{ color: "white", flexWrap: "wrap" }}>
              {details.distanceToPatient &&
                details.distanceToPatient.stringDistance}{" "}
              {details.distanceToPatient &&
                details.distanceToPatient.distanceType}
            </Text>
          </View>
          <TouchableOpacity
            style={{
              height: "100%",
              width: "45%",
              borderTopLeftRadius: 30,
              borderBottomLeftRadius: 30,
              overflow: "hidden",
            }}
            onPress={() => drProfileNavigation()}
          >
            {details ? (
              <Image
                source={{ uri: details.doctorImgURI }}
                style={{ height: "100%", width: "100%" }}
              />
            ) : (
              <Doctor1 height={60} width={60} />
            )}
          </TouchableOpacity>

          <View style={{ paddingLeft: 10, width: "55%", paddingRight: 20 }}>
            {/* <H8fontMediumBlack>
            {item.doctorInfoData && item.doctorInfoData.firstname}{' '}
            {item.doctorInfoData && item.doctorInfoData.lastname}
          </H8fontMediumBlack> */}
            <RowView
              style={{
                // width: Dimensions.get('window').width / 1.53,
                width: "100%",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  paddingVertical: 1,
                  justifyContent: "flex-start",
                  width: "100%",
                }}
              >
                <H9fontMediumBlue numberOfLines={1}>
                  {i18n.translate("doctor")}
                </H9fontMediumBlue>
              </View>
            </RowView>
            <RowView
              style={{
                // width: Dimensions.get('window').width / 1.53,
                width: "100%",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  paddingVertical: 1,
                  justifyContent: "flex-start",
                  width: "100%",
                }}
              >
                <H7fontRegularBlack numberOfLines={1}>
                  {details.doctorInfoData && details.doctorInfoData.firstname}{" "}
                  {details.doctorInfoData && details.doctorInfoData.lastname}
                </H7fontRegularBlack>
              </View>
            </RowView>
            <RowView
              style={{
                // width: Dimensions.get('window').width / 1.53,
                width: "100%",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  paddingVertical: 1,

                  width: "100%",
                }}
              >
                <H8fontMediumLightBlack numberOfLines={1}>
                  {/* <H8fontMediumBlue numberOfLines={1}>
                    {labels.specializations}:{' '}
                  </H8fontMediumBlue>{' '} */}
                  {details.doctorInfoData &&
                    details.doctorInfoData.specializations}{" "}
                </H8fontMediumLightBlack>
              </View>
            </RowView>
            <RowView
              style={{
                width: Dimensions.get("window").width / 1.53,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  paddingVertical: 0,
                }}
              >
                <H8fontMediumLightBlack numberOfLines={1}>
                  {/* <H8fontMediumBlue numberOfLines={1}>
                    {labels.services}:{' '}
                  </H8fontMediumBlue>{' '} */}
                  {details.doctorInfoData && details.doctorInfoData.services}
                </H8fontMediumLightBlack>
              </View>
            </RowView>
            <RowView
              style={{
                width: "auto",
              }}
            >
              <View
                style={[
                  flexRow,
                  alignItemsCenter,
                  { marginTop: 5, marginBottom: 5, flexWrap: "wrap" },
                ]}
              >
                {details.numberOfReviews != 0 ? (
                  <StarRating
                    rating={details.ratingMedia}
                    onChange={(n) => console.log("star pressed")}
                    color={colors.facebook}
                    starSize={16}
                  />
                ) : null}
                <Text
                  numberOfLines={2}
                  style={{
                    color: colors.facebook,
                    fontSize: 13,
                    marginLeft: 5,
                  }}
                >
                  {details && details.numberOfReviews
                    ? `${details.numberOfReviews} ${
                        details.numberOfReviews === 1
                          ? i18n.translate("review")
                          : i18n.translate("reviews")
                      }`
                    : i18n.translate("noReviews")}{" "}
                </Text>
              </View>
            </RowView>
            <View
              style={{
                flexDirection: "row",
                paddingVertical: 1,
                justifyContent: "flex-start",
                width: "100%",
              }}
            >
              <TouchableOpacity
                onPress={() => bookAnAppointment()}
                style={{
                  backgroundColor: colors.primary2,
                  width: "70%",
                  height: 40,
                  borderRadius: 10,
                  right: "5%",
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "row",
                  marginTop: 10,
                }}
              >
                <H9fontMediumWhite style={{ fontWeight: "bold" }}>
                  {i18n.translate("bookNow")}
                </H9fontMediumWhite>
                <MaterialIcons
                  name="arrow-forward-ios"
                  size={20}
                  color="white"
                  style={{ marginLeft: 5 }}
                />
              </TouchableOpacity>
            </View>
            {/* <View style={{flexDirection: 'row', paddingTop: 5}}>
            <TouchableOpacity
              onPress={() => dialContact(item.phoneNumber)}>
              <CardSurface
                style={{
                  borderRadius: 20,
                  height: 30,
                  width: 30,
                  backgroundColor: colors.white,
                  paddingHorizontal: 0,
                  paddingVertical: 0,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Feather
                  name="phone-forwarded"
                  size={18}
                  color="black"
                />
              </CardSurface>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => dialContact(item.phoneNumber)}>
              <H9fontMediumBlack
                style={{paddingLeft: 6, paddingTop: 7}}>
                {item.phoneNumber}
              </H9fontMediumBlack>
            </TouchableOpacity>
          </View> */}
          </View>
        </View>
      </RowView>
    </View>
  );
};

export default DoctorDetailsCard;

const styles = StyleSheet.create({
  containerLoader: {
    flex: 1,
    justifyContent: "center",
  },
  chip: {
    // margin: 4,
    height: 30,
    width: "auto",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    position: "absolute",
    zIndex: 2,
    top: 10,
    left: 10,
    borderRadius: 10,
    flexWrap: "wrap",
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  horizontal: {
    flexDirection: "row",
    justifyContent: "center",
    padding: 10,
    width: "100%",
  },
});

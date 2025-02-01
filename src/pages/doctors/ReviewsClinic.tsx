import React, { useEffect, useState } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import {
  CardSurface,
  CommonLineDotted,
  RowView,
} from "../../components/commonViews";
import {
  H10fontRegularBlack,
  H14fontRegularBlue,
  H14fontRegulargray,
  H16fontRegularGray,
  H6fontRegularBlack,
  H8fontMediumBlack,
  H9fontRegularBlack,
  H9fontRegularGreen,
} from "../../components/commonText";
import { colors } from "../../utils/colors";
// import Icon2 from 'react-native-vector-icons/FontAwesome';
import { labels } from "../../utils/labels";
// import {DevWidth} from '../../utils/device';
import { Dimensions } from "react-native";
import { AntDesign } from "@expo/vector-icons";

import {
  alignItemsCenter,
  alignSelfCenter,
  flexRow,
  mh15,
  mv15,
  ph10,
  pl10,
  pl5,
  pt5,
} from "../../common/commonStyles";
import { AirbnbRating } from "react-native-elements";
import { ActivityIndicator, Button, Snackbar, Text } from "react-native-paper";
import {
  deleteDoctorReview,
  uploadDoctorReview,
} from "../../utils/UploadFirebaseData";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import {
  getPatientClinicsDoctorsAround,
  getPatientsForReviews,
  setTemporaryPatientClinicReview,
  setTemporaryPatientReview,
} from "../../actions/patientActions";
import CustomLoader from "../../components/customLoader";
import i18n from "../../../i18n";
import RoundInitials from "../../components/RoundInitials";
import { useAppSelector } from "../../hooks/hooks";

interface Props {
  doctorInfoData?: any;
}

const reviews = [
  {
    reviewId: Date.now(),
    isReview: true,
    reviewName: "Richard Wilson",
    rating: 4,
    dateReview: "12-02-2023",
    comment: "First commet of reviewer",
    replies: [
      {
        replyId: Date.now(),
        isReply: true,
        replyName: "Richard Wilson",
        dateReply: "12-02-2023",
        reply: "First reply of reviewer",
      },
    ],
  },
];
const ReviewsClinic: React.FC<Props> = ({ doctorInfoData }): JSX.Element => {
  const patientInfoDB = useSelector((state) => state.patientInfoData);
  const { patientInformation } = patientInfoDB;

  const aroundPatientData = useSelector((state) => state.aroundPatientData);
  const { aroundPatient, loading: loadingAroundPatient } = aroundPatientData;

  const temporarPatientClinicReview = useAppSelector(
    (state) => state.tempPatientClinicRev
  );
  const { tempPatientClinicReview, loading: loadingClinicReview } =
    temporarPatientClinicReview;

  const guestDetailsData = useSelector((state) => state.guestDetailsPatient);
  const { guestDetails } = guestDetailsData;

  const [text, setText] = useState(
    tempPatientClinicReview.comment ? tempPatientClinicReview.comment : ""
  );
  const [heightSet, setHeightSet] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [showAllFeedback, setShowAllFeedback] = useState(false);
  const [rating, setRating] = useState(
    tempPatientClinicReview.rating ? tempPatientClinicReview.rating : 0
  );
  const [patientReview, setPatientReview] = useState({});
  const [patientReviewEdit, setPatientReviewEdit] = useState({});
  const [otherReviews, setOtherReviews] = useState([]);

  const patientsWithReviews = useSelector((state) => state.patientsForReviews);
  const { patientsForReviews, loading: loadingPatientsForReviews } =
    patientsWithReviews;

  const dispatch = useDispatch();

  const handleSubmit = () => {
    console.log(patientReviewEdit);
    console.log(text);
    console.log(rating);
    if (patientReviewEdit.isReview) {
      console.log("yesss");

      if (doctorInfoData.isClinic) {
        console.log("yesss 2");
        console.log(tempPatientClinicReview);
        deleteDoctorReview(
          doctorInfoData.owner_uid,
          false,
          tempPatientClinicReview
        );
      } else {
        deleteDoctorReview(
          doctorInfoData.owner_uid,
          doctorInfoData.doctorId,
          tempPatientClinicReview
        );
      }
    }
    const dateReview = moment(new Date()).format("DD-MM-YYYY");
    const reviewName = `${guestDetails.basicInfoData.firstName} ${guestDetails.basicInfoData.lastName}`;
    const reviewId = Date.now();
    const patientName = `${guestDetails.basicInfoData.firstName} ${guestDetails.basicInfoData.lastName}`;
    console.log(guestDetails.basicInfoData.firstName);
    console.log(guestDetails);
    uploadDoctorReview(
      doctorInfoData.owner_uid,
      false,
      guestDetails.phoneNumberCountry,
      reviewId,
      reviewName,
      rating,
      dateReview,
      text,
      patientName
    );
    const review = {
      reviewId,
      patientPhoneNumber: guestDetails.phoneNumberCountry,
      isReview: true,
      reviewName,
      rating,
      dateReview,
      comment: text,
      patientName,
    };
    setPatientReviewEdit({});
    dispatch(setTemporaryPatientClinicReview(review));
    dispatch(getPatientClinicsDoctorsAround());
  };

  const handleDeleteReview = () => {
    setRating(0);
    setText("");
    deleteDoctorReview(
      doctorInfoData.owner_uid,
      false,
      tempPatientClinicReview
    );
    dispatch(getPatientClinicsDoctorsAround());
    dispatch(setTemporaryPatientClinicReview({}));
  };

  useEffect(() => {
    console.log("tempPatientReview length..", tempPatientClinicReview);
    // console.log("tempPatientReview length..", patientReviewEdit);
    // console.log("doctorInfoData length..", doctorInfoData);

    const otherR = [];
    for (let i = 0; i < doctorInfoData.clinicReviews.length; i++) {
      console.log(
        "doctorInfoData.clinicReviews..",
        doctorInfoData.clinicReviews[i]
      );
      if (
        doctorInfoData.clinicReviews[i].patientPhoneNumber ===
        guestDetails.phoneNumberCountry
      ) {
        console.log("review yes...is same patient...");
        const review = {
          reviewId : doctorInfoData.clinicReviews[i].reviewId,
          patientPhoneNumber: guestDetails.phoneNumberCountry,
          isReview: doctorInfoData.clinicReviews[i].isReview,
          reviewName: doctorInfoData.clinicReviews[i].reviewName,
          rating: doctorInfoData.clinicReviews[i].rating,
          dateReview: doctorInfoData.clinicReviews[i].dateReview,
          comment: doctorInfoData.clinicReviews[i].comment,
          patientName: doctorInfoData.clinicReviews[i].patientName,
        };
        setPatientReviewEdit({});
        // dispatch(setTemporaryPatientClinicReview(review))
      } else {
        // dispatch(setTemporaryPatientClinicReview({}))
        otherR.push(doctorInfoData.clinicReviews[i]);
      }
    }

    // dispatch(getPatientsForReviews(otherR, true))
    console.log("otherReviews-------");
    console.log(otherReviews);
    setOtherReviews(otherR);
  }, []);

  // return(
  //   <View>
  //     <Text>
  //       asdas
  //     </Text>
  //   </View>
  // )

  return (
    <View style={styles.constainer}>
      <>
        <CardSurface style={styles.cardSurface}>
          {tempPatientClinicReview.isReview && !patientReviewEdit.isReview ? (
            <RowView>
              <View style={styles.initialRowStyle}>
                <View style={styles.userImageStyle}>
                  {guestDetails.isGuest ? (
                    <RoundInitials
                      firstName={guestDetails.basicInfoData.firstName}
                      lastName={guestDetails.basicInfoData.lastName}
                      fontSize={23}
                    />
                  ) : (
                    <View
                      style={{ justifyContent: "center", alignItems: "center" }}
                    >
                      {/* <Fontisto name="persons" size={34} color={colors.facebook} /> */}
                      <Image
                        style={{ height: "100%", width: "200%" }}
                        source={require("../../images/clients.png")}
                      />
                    </View>
                  )}
                </View>
                <View style={ph10}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <View>
                      <H8fontMediumBlack>
                        {tempPatientClinicReview.reviewName}
                      </H8fontMediumBlack>
                      <H14fontRegulargray>
                        {tempPatientClinicReview.dateReview}
                      </H14fontRegulargray>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-around",
                        width: "30%",
                      }}
                    >
                      <TouchableOpacity
                        onPress={() =>
                          setPatientReviewEdit(tempPatientClinicReview)
                        }
                      >
                        <View
                          style={{
                            backgroundColor: "white",
                            elevation: 5,
                            justifyContent: "center",
                            alignItems: "center",
                            borderRadius: 50,
                            height: 30,
                            width: 30,
                          }}
                        >
                          <AntDesign name="edit" size={18} color="black" />
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeleteReview()}>
                        <View
                          style={{
                            backgroundColor: colors.google,
                            elevation: 5,
                            justifyContent: "center",
                            alignItems: "center",
                            borderRadius: 50,
                            height: 30,
                            width: 30,
                          }}
                        >
                          <AntDesign name="delete" size={18} color="white" />
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                  {/* <RattingStyle /> */}
                  <View
                    style={[
                      flexRow,
                      alignItemsCenter,
                      { marginTop: 5, marginBottom: 5 },
                    ]}
                  >
                    <AirbnbRating
                      size={13}
                      defaultRating={tempPatientClinicReview.rating}
                      isDisabled={true}
                      selectedColor={colors.facebook}
                      reviewColor={"red"}
                      showRating={false}
                    />
                  </View>
                  <H9fontRegularBlack style={styles.widthStyle}>
                    {tempPatientClinicReview.comment}
                  </H9fontRegularBlack>
                  {/* <CommonLineDotted style={styles.widthStyle} /> */}
                  {/* <View style={styles.thumpsUpContainer}> */}
                  {/* <Icon2
        name="reply"
        size={11}
        color={colors.ligtBlue}
        style={pt5}
      /> */}
                  {/* <H14fontRegularBlue style={pl5}>
        {labels.replay}
      </H14fontRegularBlue> */}
                  {/* </View> */}
                  {/* {
        item.replies.map((r, i) => (
          <RowView>
          <View style={styles.subContainer}>
            <View style={styles.subProfileImage}>
              <Patient7 height={45} width={45} />
            </View>
            <View style={pl10}>
              <H8fontMediumBlack>{r.replyName}</H8fontMediumBlack>
              <H14fontRegulargray>
                {r.dateReply}
              </H14fontRegulargray>

             
              <H9fontRegularBlack style={styles.descriptionStyle}>
                {
                 r.reply
                }
              </H9fontRegularBlack>
         
       
    
            </View>
          </View>
        </RowView>
        ))
      } */}
                </View>
              </View>
            </RowView>
          ) : (
            <View style={{ marginBottom: 10, height: "auto" }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  width: "100%",
                  height: "auto",
                }}
              >
                <View style={{ justifyContent: "flex-start", height: "100%" }}>
                  <View style={styles.userPrimeImageStyle}>
                    {guestDetails.isGuest ? (
                      <RoundInitials
                        firstName={guestDetails.basicInfoData.firstName}
                        lastName={guestDetails.basicInfoData.lastName}
                      />
                    ) : (
                      <Patient10 height={45} width={45} />
                    )}
                  </View>
                </View>
                <View style={[ph10, { width: "80%", height: "auto" }]}>
                  <View style={[flexRow, alignItemsCenter]}>
                    <H6fontRegularBlack>
                      {i18n.translate("rating")}:
                    </H6fontRegularBlack>
                    <AirbnbRating
                      size={20}
                      defaultRating={
                        tempPatientClinicReview.rating
                          ? tempPatientClinicReview.rating
                          : rating
                      }
                      isDisabled={false}
                      selectedColor={colors.facebook}
                      reviewColor={"red"}
                      showRating={false}
                      onFinishRating={(number) => setRating(number)}
                    />
                    {patientReviewEdit.isReview && (
                      <TouchableOpacity
                        onPress={() => setPatientReviewEdit({})}
                      >
                        <View
                          style={{
                            backgroundColor: "white",
                            elevation: 5,
                            justifyContent: "center",
                            alignItems: "center",
                            borderRadius: 50,
                            marginLeft: 15,
                            height: 40,
                            width: 40,
                          }}
                        >
                          <AntDesign name="close" size={24} color="black" />
                        </View>
                      </TouchableOpacity>
                    )}
                  </View>
                  <TextInput
                    maxLength={350}
                    defaultValue={
                      tempPatientClinicReview.rating
                        ? tempPatientClinicReview.comment
                        : text
                    }
                    style={{
                      height: Math.max(35, heightSet),
                      borderBottomWidth: isFocused ? 1.0 : 0.5,
                      borderBottomColor: isFocused ? colors.facebook : "grey",
                    }}
                    multiline
                    numberOfLines={4}
                    onChangeText={(newText) => setText(newText)}
                    onContentSizeChange={(event) => {
                      setHeightSet(event.nativeEvent.contentSize.height);
                    }}
                    onFocus={() => {
                      setIsFocused(true);
                    }}
                    onBlur={() => {
                      setIsFocused(false);
                    }}
                  ></TextInput>
                  {isFocused ||
                  text.length > 0 ||
                  rating > 0 ||
                  tempPatientClinicReview.comment > 0 ||
                  tempPatientClinicReview.rating > 0 ? (
                    <View
                      style={{
                        marginTop: 10,
                        width: "100%",
                        flexDirection: "row",
                        justifyContent: "space-around",
                      }}
                    >
                      <Button
                        mode={"outlined"}
                        textColor="#000000"
                        buttonColor="#000000"
                        onPress={() => {
                          if (tempPatientClinicReview.isReview) {
                            setPatientReviewEdit({});
                          } else {
                            setText("");
                            setRating(0);
                          }
                        }}
                        style={{ borderRadius: 50 }}
                      >
                        {i18n.translate("cancel")}
                      </Button>
                      <Button
                        mode={"contained"}
                        textColor="#000000"
                        buttonColor="#000000"
                        disabled={rating === 0 ? true : false}
                        onPress={() => {
                          handleSubmit();
                        }}
                        style={{ borderRadius: 50 }}
                      >
                        {i18n.translate("submit")}
                      </Button>
                    </View>
                  ) : null}
                </View>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[flexRow, mv15, alignSelfCenter]}
            onPress={() => setShowAllFeedback(!showAllFeedback)}
          >
            {patientsWithReviews.length > 1 && (
              <H9fontRegularBlack style={{}}>
                {!showAllFeedback
                  ? i18n.translate("showFeedback")
                  : i18n.translate("hideFeedback")}
              </H9fontRegularBlack>
            )}
            {!showAllFeedback && patientsWithReviews.length > 1 ? (
              <H9fontRegularBlack style={{}}>
                {" "}
                ({patientsWithReviews.length - 1})
              </H9fontRegularBlack>
            ) : null}
          </TouchableOpacity>

          {otherReviews.length > 0
            ? otherReviews.map((item, index) => {
                console.log(index);
                console.log(showAllFeedback);
                if (index === 2 && !showAllFeedback) {
                  return null;
                } else {
                  return (
                    // <RowView style={{borderTopWidth:1, borderStyle:"dashed", borderColor:colors.gray}}>
                    <RowView>
                      <View style={styles.initialRowStyle}>
                        {
                          <>
                            <View style={styles.userImageStyle}>
                              {otherReviews ? (
                                // <Image style={{height:"100%", width:"100%"}} source={{uri:item.patientImg}}/>
                                <RoundInitials
                                  firstName={""}
                                  lastName={""}
                                  patientName={item.patientName}
                                />
                              ) : (
                                <Patient10 height={45} width={45} />
                              )}
                            </View>
                            <View style={ph10}>
                              <H8fontMediumBlack>
                                {item.reviewName}
                              </H8fontMediumBlack>
                              <H14fontRegulargray>
                                {item.dateReview}
                              </H14fontRegulargray>
                              {/* <RattingStyle /> */}
                              <View
                                style={[
                                  flexRow,
                                  alignItemsCenter,
                                  { marginTop: 5, marginBottom: 5 },
                                ]}
                              >
                                <AirbnbRating
                                  size={13}
                                  defaultRating={item.rating}
                                  isDisabled={true}
                                  selectedColor={colors.facebook}
                                  reviewColor={"red"}
                                  showRating={false}
                                />
                              </View>
                              <H9fontRegularBlack style={styles.widthStyle}>
                                {item.comment}
                              </H9fontRegularBlack>
                              {/* <CommonLineDotted style={styles.widthStyle} /> */}
                              {/* <View style={styles.thumpsUpContainer}> */}
                              {/* <Icon2
                  name="reply"
                  size={11}
                  color={colors.ligtBlue}
                  style={pt5}
                /> */}
                              {/* <H14fontRegularBlue style={pl5}>
                  {labels.replay}
                </H14fontRegularBlue> */}
                              {/* </View> */}
                              {/* {
                  item.replies.map((r, i) => (
                    <RowView>
                    <View style={styles.subContainer}>
                      <View style={styles.subProfileImage}>
                        <Patient7 height={45} width={45} />
                      </View>
                      <View style={pl10}>
                        <H8fontMediumBlack>{r.replyName}</H8fontMediumBlack>
                        <H14fontRegulargray>
                          {r.dateReply}
                        </H14fontRegulargray>
    
                       
                        <H9fontRegularBlack style={styles.descriptionStyle}>
                          {
                           r.reply
                          }
                        </H9fontRegularBlack>
                   
                 
              
                      </View>
                    </View>
                  </RowView>
                  ))
                } */}
                            </View>
                          </>
                        }
                      </View>
                    </RowView>
                  );
                }
              })
            : null}
        </CardSurface>
      </>
    </View>
  );
};
export default ReviewsClinic;

const styles = StyleSheet.create({
  constainer: { paddingHorizontal: 18 },
  cardSurface: { backgroundColor: "white", borderRadius: 20 },
  initialRowStyle: { padding: 5, flexDirection: "row" },
  userPrimeImageStyle: {
    height: 70,
    width: 70,
    borderRadius: 45,
    overflow: "hidden",
    elevation: 6,
  },
  userImageStyle: {
    height: 65,
    width: 65,
    borderRadius: 45,
    overflow: "hidden",
  },
  thumpsUpContainer: { flexDirection: "row", paddingTop: 4 },
  widthStyle: { width: Dimensions.get("window").width / 1.5, paddingTop: 10 },
  yesbuttonStyle: {
    height: 25,
    width: 52,
    borderRadius: 40,
    borderStyle: "dashed",
    borderColor: colors.black,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  btnTxtStyle: { paddingLeft: 5, paddingTop: 2 },
  btnIconPadding: { paddingTop: 4, paddingLeft: 5 },

  noButtonStyle: {
    height: 25,
    width: 52,
    borderRadius: 40,
    borderStyle: "dashed",
    borderColor: colors.black,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  subContainer: { paddingTop: 20, flexDirection: "row" },
  subProfileImage: {
    height: 45,
    width: 45,
    borderRadius: 45,
    overflow: "hidden",
  },
  descriptionStyle: {
    width: Dimensions.get("window").width / 2,
    paddingTop: 6,
  },
});

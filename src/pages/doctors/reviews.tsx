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
import Patient10 from "../../../assets/images/patients/patient10.svg";
import Patient7 from "../../../assets/images/patients/patient7.svg";
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
  setTemporaryPatientReview,
} from "../../actions/patientActions";
import CustomLoader from "../../components/customLoader";
import { getAllClinicsSearchDashboard } from "../../actions/clinicActions";
import i18n from "../../../i18n";
import { screenName } from "../../utils/screenName";
import { useNavigation } from "@react-navigation/native";
import RoundInitials from "../../components/RoundInitials";

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
const Reviews: React.FC<Props> = ({ doctorInfoData }): JSX.Element => {
  const patientInfoDB = useSelector((state) => state.patientInfoData);
  const { patientInformation } = patientInfoDB;

  const aroundPatientData = useSelector((state) => state.aroundPatientData);
  const { aroundPatient, loading: loadingAroundPatient } = aroundPatientData;

  const temporarPatientReview = useSelector((state) => state.tempPatientRev);
  const { tempPatientReview, loading: loadingPatientReview } =
    temporarPatientReview;

  const patientsWithReviews = useSelector((state) => state.patientsForReviews);
  const { patientsForReviews, loading: loadingPatientsForReviews } =
    patientsWithReviews;

  const guestDetailsData = useSelector((state) => state.guestDetailsPatient);
  const { guestDetails } = guestDetailsData;

  const [text, setText] = useState(
    tempPatientReview.comment ? tempPatientReview.comment : ""
  );
  const [heightSet, setHeightSet] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAllFeedback, setShowAllFeedback] = useState(false);
  const [rating, setRating] = useState(
    tempPatientReview.rating ? tempPatientReview.rating : 0
  );
  const [patientReview, setPatientReview] = useState({});
  const [patientReviewEdit, setPatientReviewEdit] = useState({});
  const [otherReviews, setOtherReviews] = useState([]);

  // const allClinicsForPatientDash = useSelector(
  //   state => state.allClinicsForPatientDash,
  // );
  // const {clinicsForDash, loading} = allClinicsForPatientDash;

  const dispatch = useDispatch();
  const navigation = useNavigation();

  const handleSubmit = () => {
    console.log(patientReviewEdit);
    if (patientReviewEdit.isReview) {
      console.log("yesss");
      console.log(tempPatientReview);
      deleteDoctorReview(
        doctorInfoData.clinicId,
        doctorInfoData.doctorId,
        tempPatientReview
      );
    }
    const dateReview = moment(new Date()).format("DD-MM-YYYY");
    const reviewName = `${guestDetails.basicInfoData.firstName} ${guestDetails.basicInfoData.lastName}`;
    const reviewId = Date.now();
    const patientName = `${guestDetails.basicInfoData.firstName} ${guestDetails.basicInfoData.lastName}`;
    console.log(guestDetails.basicInfoData.firstName);
    console.log(guestDetails);
    uploadDoctorReview(
      doctorInfoData.clinicId,
      doctorInfoData.doctorId,
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
      doctorId: doctorInfoData.doctorId,
      patientPhoneNumber: guestDetails.phoneNumberCountry,
      isReview: true,
      reviewName,
      rating,
      dateReview,
      comment: text,
      patientName,
    };
    setPatientReviewEdit({});
    dispatch(setTemporaryPatientReview(review));
    dispatch(getPatientClinicsDoctorsAround());
  };

  const handleDeleteReview = () => {
    setRating(0);
    setText("");
    deleteDoctorReview(
      doctorInfoData.clinicId,
      doctorInfoData.doctorId,
      tempPatientReview
    );
    dispatch(getPatientClinicsDoctorsAround());
    dispatch(setTemporaryPatientReview({}));
  };

  useEffect(() => {
    // console.log("tempPatientReview----")
    // console.log(tempPatientReview)

    setIsLoading(true);
    const otherR = [];
    let patientsWithReviewsIDS = [];
    for (let i = 0; i < doctorInfoData.doctorReviews.length; i++) {
      console.log(
        "doctorInfoData.doctorReviews..",
        doctorInfoData.doctorReviews[i]
      );

      if (
        doctorInfoData.doctorReviews[i].patientPhoneNumber ===
        guestDetails.phoneNumberCountry
      ) {
        console.log("review yes...is same patient...");
      } else {
        otherR.push(doctorInfoData.doctorReviews[i]);
        patientsWithReviewsIDS.push(
          doctorInfoData.doctorReviews[i].patientPhoneNumber
        );
      }
    }
    console.log("other reviews...");
    console.log(otherR);

    otherR.sort((a, b) => b.rating - a.rating);
    // dispatch(getPatientsForReviews(otherR))
    setOtherReviews(otherR);
    setIsLoading(false);
    // setOtherReviews(sortedOtherReviews);
    console.log(
      "patientsForReviews..............................",
      patientsForReviews
    );
  }, []);

  // return(
  //   <View>
  //     <Text>
  //       asdadas
  //     </Text>
  //   </View>
  // )

  return (
    <View style={styles.constainer}>
      <>
        <CardSurface style={styles.cardSurface}>
          {tempPatientReview.isReview && !patientReviewEdit.isReview ? (
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
                        {tempPatientReview.reviewName}
                      </H8fontMediumBlack>
                      <H14fontRegulargray>
                        {tempPatientReview.dateReview}
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
                        onPress={() => setPatientReviewEdit(tempPatientReview)}
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
                      defaultRating={tempPatientReview.rating}
                      isDisabled={true}
                      selectedColor={colors.facebook}
                      reviewColor={"red"}
                      showRating={false}
                    />
                  </View>
                  <H9fontRegularBlack style={styles.widthStyle}>
                    {tempPatientReview.comment}
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
                        tempPatientReview.rating
                          ? tempPatientReview.rating
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
                      tempPatientReview.rating
                        ? tempPatientReview.comment
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
                  tempPatientReview.comment > 0 ||
                  tempPatientReview.rating > 0 ? (
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
                          if (tempPatientReview.isReview) {
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
            {patientsForReviews
              ? patientsForReviews.length > 1 && (
                  <H9fontRegularBlack style={{}}>
                    {!showAllFeedback
                      ? i18n.translate("showFeedback")
                      : i18n.translate("hideFeedback")}
                  </H9fontRegularBlack>
                )
              : null}
            {patientsForReviews &&
            !showAllFeedback &&
            patientsForReviews.length > 1 ? (
              <H9fontRegularBlack style={{}}>
                {" "}
                ({patientsForReviews && patientsForReviews.length - 1})
              </H9fontRegularBlack>
            ) : null}
          </TouchableOpacity>

          {otherReviews.length > 0
            ? otherReviews.map((item, index) => {
                console.log(index);
                console.log(showAllFeedback);
                if (index === 3 && !showAllFeedback) {
                  return null;
                } else {
                  return (
                    // <RowView style={{borderTopWidth:1, borderStyle:"dashed", borderColor:colors.gray}}>
                    <RowView>
                      <View style={styles.initialRowStyle}>
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
export default Reviews;

const styles = StyleSheet.create({
  constainer: { paddingHorizontal: 18 },
  cardSurface: { backgroundColor: "white", borderRadius: 20 },
  initialRowStyle: { padding: 5, flexDirection: "row" },
  userPrimeImageStyle: {
    height: 65,
    width: 65,
    borderRadius: 45,
    overflow: "hidden",
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

import React, { Fragment, useEffect, useState } from "react";
import {
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
} from "react-native";
import { Button, SocialMediaLogin } from "../components/commonButton";
import { GeneralProps } from "../interfaces/generalProps";
import { Route } from "@react-navigation/native";
import { labels } from "../utils/labels";
import { screenName } from "../utils/screenName";
import {
  FirebaseRecaptchaVerifierModal,
  FirebaseRecaptchaBanner,
} from "expo-firebase-recaptcha";
import {
  H10fontRegularWhite,
  H6fontRegularBlack,
  H7fontMediumWhite,
  H8fontMediumWhite,
  H8fontRegularWhite,
  H9fontRegularBlack,
  H9fontRegularGray,
} from "../components/commonText";
import {
  CommonLineView,
  MainContainer,
  RowView,
  SubContainer,
} from "../components/commonViews";
import { colors } from "../utils/colors";
// import {DevWidth} from '../utils/device';
import { Dimensions } from "react-native";
import {
  alignItemsCenter,
  alignItemsLeft,
  alignSelfRight,
  flex1,
  mb20,
  ml10,
  mt10,
  mt20,
  pb10,
  ph15,
  pt10,
} from "../common/commonStyles";
import {
  emailValidation,
  minLengthValidation,
  requiredValidation,
  validationSchema,
} from "../utils/validationConfig";
import { useForm, Controller } from "react-hook-form";
import { InputFields } from "../components/commonInputFields";
import LoginIcon from "../../assets/images/login-img.svg";
import LogoIcon from "../../assets/images/logo.svg";
import FacebookIcon from "../../assets/images/facebook-letter.svg";
import GoogleIcon from "../../assets/images/google-plus-letter.svg";
import EmailIcon from "../../assets/images/email.svg";
import LockIcon from "../../assets/images/lock-icon.svg";
import { Text } from "react-native-paper";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  getAuth,
  PhoneAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { authentication, db } from "../../firebase";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";
import {
  getAllClinicsSearchDashboard,
  getCalendarTimes,
  getClinicAppointments,
  getClinicApprovedAppointments,
  getClinicInfo,
  getClinics,
  // getPatientsOfClinic,
  getScheduleTimings,
} from "../actions/clinicActions";
import {
  getGuestLoginDetails,
  getPatientAppointments,
  getPatientInfo,
  setTemporaryPatientClinicReview,
  setTemporaryPatientReview,
} from "../actions/patientActions";
import { registerForPushNotificationsAsync } from "../utils/Notification/registerPushNotification";
import { uploadExpoPushToken } from "../utils/UploadFirebaseData";
import { retrieveTypeOfUser } from "../utils/getFirebaseData";
import { handleSignOutFromSignIn } from "../utils/handleSignOut";
import CustomLoader from "../components/customLoader";
import { MaterialIcons } from "@expo/vector-icons";
import i18n from "../../i18n";

import { useAppSelector } from "../hooks/hooks";

// import AsyncStorage from '@react-native-community/async-storage';

interface Props extends GeneralProps {
  route: Route<string, object | undefined>;
}

const SignInScreenPatient: React.FC<Props> = ({
  navigation,
  route,
}): JSX.Element => {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  const patientInfoDB = useAppSelector((state) => state.patientInfoData);
  const { patientInformation } = patientInfoDB;

  const guestDetailsData = useAppSelector((state) => state.guestDetailsPatient);
  const { guestDetails } = guestDetailsData;

  const formKeys = {
    email: "email",
    password: "password",
  };

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    console.log("Sign In For Patient");
  }, []);

  const auth = authentication;

  const storeData = async (value) => {
    try {
      await AsyncStorage.setItem("userType", value);
    } catch (e) {
      // saving error
    }
  };

  const onsubmit = async (detaila) => {
    setIsLoading(true);
    // const expoPushToken =  await handleGetExpoPushNotificationToken()
    const expoToken = await registerForPushNotificationsAsync();
    console.log("expoPushToken...", expoToken);
    signInWithEmailAndPassword(auth, detaila.email, detaila.password)
      .then(async (userCredentials) => {
        console.log("userCredentials...", userCredentials.user.uid);
        const userType = await retrieveTypeOfUser(userCredentials.user.uid);

        console.log("userType...", userType);
        uploadExpoPushToken(expoToken);
        // console.log("userCredentials...", userCredentials)
        if (userType != "isPatient") {
          throw {
            name: "Not the right user type",
            message: "User type is clinic not patient...",
          };
        } else {
          storeData("Patient");
          if (userCredentials.user.uid) {
            console.log("changing...isguest...");
            handleLoginAsGuest(true).then(() => {
              dispatch(getGuestLoginDetails());
            });
          }

          // handleLoginAsGuest(false);
          dispatch(getScheduleTimings());
          dispatch(getCalendarTimes());
          dispatch(getPatientAppointments(1, 5));

          // dispatch(getClinics());
          // dispatch(getPatientsOfClinic());
          dispatch(getClinicAppointments());
          dispatch(getClinicApprovedAppointments());
          // dispatch(getAllClinicsSearchDashboard());
          dispatch(setTemporaryPatientReview({}));
          // dispatch(setTemporaryPatientClinicReview({}))
          // AsyncStorage.setItem('userType', "Patient")
          // navigation.navigate(screenName.SearchDoctor);

          dispatch(getPatientInfo()).then(() => {
            navigation.navigate(screenName.PatientSearchDashboard);
          });
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.log("Error sign in patient...", error.name);
        if (error.name === "Not the right user type") {
          Alert.alert(
            "Could Not Log In",
            "We found an account with this e-mail created as a clinic account. Please use a patient account or register for a patient account.",
            [
              {
                text: "Try Again",
                onPress: () => {
                  console.log("Try Again pressed");
                  setIsLoading(false);
                  handleSignOutFromSignIn();
                },
                style: "cancel",
              },
              {
                text: "Register",
                onPress: () => {
                  setIsLoading(false);
                  handleSignOutFromSignIn();
                  navigation.push(screenName.SignUpScreenPatient);
                },
              },
            ]
          );
        } else {
          Alert.alert(
            "Could Not Log In",
            "Your email or password is incorect or there is no existing user with this account. Please try again or register for an accout",
            [
              {
                text: "Try Again",
                onPress: () => {
                  console.log("Try Again pressed");
                  setIsLoading(false);
                  handleSignOutFromSignIn();
                },
                style: "cancel",
              },
              {
                text: "Register",
                onPress: () => {
                  navigation.push(screenName.SignUpScreenPatient);
                  setIsLoading(false);
                  handleSignOutFromSignIn();
                },
              },
            ]
          );
        }
        console.log(error);
      });
  };

  return (
    <Fragment>
      <MainContainer>
        <CustomLoader isLoading={isLoading} />
        <ImageBackground
          source={require("../images/loginBG.png")}
          resizeMode="cover"
          style={{
            flex: 1,
            width: null,
            height: null,
            // alignItems: 'flex-end',
          }}
        >
          {/* <ScrollView showsVerticalScrollIndicator={false} style={flex1}> */}
          <KeyboardAvoidingView
            style={{ flex: 1, marginTop: "17%" }}
            // behavior={'padding'}
            keyboardVerticalOffset={65}
          >
            <View style={styles.subContainer}>
              <Button
                disabled={false}
                bgColor={"#FFFFFF"}
                txtColor={colors.pureBlack}
                transparent={true}
                funCallback={() =>
                  handleLoginAsGuest(false).then((guestDetails) => {
                    dispatch(getGuestLoginDetails()).then(() => {
                      dispatch(getPatientInfo(guestDetails)).then(() => {
                        navigation.navigate(
                          screenName.guestPhoneInputModal as any
                        );
                      });
                    });
                  })
                }
                label={i18n.translate("loginAsPatient")}
                success={true}
                borderWidth={0.5}
              />

              <Button
                disabled={false}
                bgColor={"#FFFFFF"}
                txtColor={colors.pureBlack}
                transparent={true}
                funCallback={() =>
                  navigation.navigate(screenName.SignInScreenClinic as any)
                }
                label={i18n.translate("loginAsClinic")}
                success={true}
                borderWidth={0.5}
              />

              <View>
                {/* <View style={styles.infoTextViewStyle}>
                  <H8fontMediumWhite>
                    {i18n.translate("dntHaveAccount")}{' '}
                  </H8fontMediumWhite>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate(screenName.SignUpScreenPatient as any)
                    }>
                    <H8fontRegularWhite>{i18n.translate("signUp")}</H8fontRegularWhite>
                  </TouchableOpacity>
                </View> */}

                <View style={styles.borderLineStyle}>
                  <CommonLineView />
                </View>
                {/* <RowView style={styles.footerComponentView}>
                  <SocialMediaLogin
                    btnKey={'fb'}
                    label={labels.facebook}
                    image={
                      <View style={styles.socialMediaFBIconStyle}>
                        <FacebookIcon/>
                      </View>
                    }
                    onPress={() => {}}
                  />
                  <SocialMediaLogin
                    label={labels.google}
                    image={
                      <View style={styles.socialMediaFBIconStyle}>
                        <GoogleIcon />
                      </View>
                    }
                    onPress={() => {}}
                  />
                </RowView> */}
              </View>
            </View>
            {/* </ScrollView> */}
          </KeyboardAvoidingView>
        </ImageBackground>
      </MainContainer>
    </Fragment>
  );
};
export default SignInScreenPatient;

const styles = StyleSheet.create({
  subContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 15,
    justifyContent: "center",
    marginTop: "10%",
  },
  infoTextViewStyle: {
    paddingTop: 10,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  socialMediaBtnIconsStyle: { position: "absolute", marginLeft: 15, top: -19 },
  socialMediaBtnIconContainerStyle: {
    borderRadius: 25,
    height: 30,
    width: 30,
    backgroundColor: colors.white,
    paddingTop: 10,
    paddingLeft: 3,
  },
  socialMediaIconStyle: { height: 15, width: 22, alignSelf: "center" },
  socialMediaBtnStyle: {
    zIndex: -1,
    height: 45,
    width: Dimensions.get("window").width / 3,
    backgroundColor: colors.google,
    borderRadius: 30,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  socialMediaBtnTextStyele: {
    color: "white",
    fontSize: 14,
  },
  socialMediaFBIconStyle: { alignItems: "center" },
  userIconsStyle: {
    // height: 20,
    // width: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  passwordIconStyle: { alignItems: "center", justifyContent: "center" },
  borderLineStyle: { paddingTop: 10 },
  footerComponentView: { paddingTop: 30 },
});

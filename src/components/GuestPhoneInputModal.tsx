import React, { Fragment, useEffect, useState } from "react";
import {
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ImageBackground,
  Alert,
} from "react-native";
import { Button } from "../components/commonButton";
import { GeneralProps } from "../interfaces/generalProps";
import { Route } from "@react-navigation/native";
// import {labels} from '../utils/labels';
import { screenName } from "../utils/screenName";
import {
  FormErrorMessage,
  H10fontRegularWhite,
  H14fontRegularWhite,
  H6fontRegularBlack,
  H9fontRegularBlack,
  H9fontRegularGray,
} from "../components/commonText";
import {
  CardSurface,
  MainContainer,
  RowView,
  SubContainer,
  TextInputStyle,
} from "../components/commonViews";
import { colors } from "../utils/colors";
import { AntDesign } from "@expo/vector-icons";
import {
  alignItemsCenter,
  mb20,
  ml10,
  mt10,
  mt20,
  ph30,
  pt10,
  pv10,
  pv30,
} from "../common/commonStyles";
import { useForm, Controller } from "react-hook-form";
import { InputFields } from "../components/commonInputFields";
import {
  minLengthValidation,
  numberValidation,
  requiredValidation,
  validationSchema,
} from "../utils/validationConfig";
import LoginIcon from "../assets/images/login-img.svg";
import LogoIcon from "../assets/images/logo.svg";
import LockIcon from "../../assets/images/lock-icon.svg";
import LeftArrow from "../../assets/images/left-arrow-big-black.svg";
import { authentication } from "../../firebase";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { handleSignOut } from "../utils/handleSignOut";
import { Snackbar } from "react-native-paper";
import CustomLoader from "../components/customLoader";
import { updateClinicPhoneNumber } from "../utils/UploadFirebaseData";
import i18n from "../../i18n";
import {
  ICountry,
  PhoneInput,
  getCountryByCca2,
} from "react-native-international-phone-number";
import { Modal } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getGuestLoginDetails } from "../actions/patientActions";
import { useDispatch } from "react-redux";

import { useAppSelector } from "../hooks/hooks";

interface Props extends GeneralProps {
  route?: Route<string, object | undefined>;
  isVisible: any;
  setIsVisible: any;
}

const GuestPhoneInputModal: React.FC<Props> = ({
  navigation,
  route,
  isVisible,
  setIsVisible,
}): JSX.Element => {
  const [showSnackBar, setShowSnackback] = useState(false);
  const [updatePass, setUpdatedPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const formKeys = {
    mobileNo: "mobileNo",
  };

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
    watch,
  } = useForm();

  let pwd = watch("password");
  const auth = authentication;
  const user = auth.currentUser;

  const [selectedCountry, setSelectedCountry] = useState<undefined | ICountry>(
    getCountryByCca2("RO")
  );

  function handleSelectedCountry(country: ICountry) {
    setSelectedCountry(country);
  }

  const onsubmit = async (detaila) => {
    try {
      console.log(detaila);
      console.log(selectedCountry);

      let str = detaila.mobileNo.replace(/\s/g, "");

      let completePhoneNumber = selectedCountry.callingCode + " " + str;
      console.log(completePhoneNumber);

      // const success = await updateClinicPhoneNumber(completePhoneNumber);

      const guestDetails = {};

      // guestDetails.myAppointments = myAppointments
      // guestDetails.clinicsHistory = clinicsHistory
      guestDetails.phoneNumberCountry = completePhoneNumber;
      guestDetails.phoneNumber = str;

      let guestDetailsToAdd = guestDetails;
      console.log("-----END ADD TO guestLoginDetails------");
      console.log(guestDetails);

      console.log("-----END ADD TO guestLoginDetails------");
      console.log(guestDetailsToAdd);

      AsyncStorage.setItem(
        "guestLoginDetails",
        JSON.stringify(guestDetailsToAdd)
      );

      dispatch(getGuestLoginDetails()).then(() => {
        navigation.navigate(screenName.PatientSearchDashboard);
      });
    } catch (err) {
      console.log("error on add guest phone number...", err);
    }
  };

  const guestDetailsData = useAppSelector((state) => state.guestDetailsPatient);
  const { guestDetails } = guestDetailsData;

  useEffect(() => {
    // console.log("guest details phone number");
    // console.log(guestDetails.phoneNumber);
    if (guestDetails.phoneNumber) {
      if (guestDetails.phoneNumber.length == 0) {
        console.log("guest details phone number");
      } else {
        navigation.navigate(screenName.PatientSearchDashboard as any);
      }
    }
  });

  return (
    <Fragment>
      <MainContainer>
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
          <CustomLoader isLoading={isLoading} />
          <ScrollView>
            <View style={styles.subContainer}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{ position: "absolute", padding: 20, paddingTop: 30 }}
              >
                <AntDesign name="arrowleft" size={24} color="black" />
              </TouchableOpacity>
              {/* <View style={alignItemsCenter}>
                <LoginIcon fill={'#e0e0e0'} />
                <View>
                  <LogoIcon />
                </View>
              </View> */}
              <View style={{ marginTop: "90%" }}>
                {/* <Controller
                  name={formKeys.mobileNo}
                  control={control}
                  render={({field: {onChange, value}}) => (
                    <InputFields
                      value={value}
                      isNumber={true}
                      onChangeText={onChange}
                      placeholder={i18n.translate("mobileNumber")}
                      errorMessage={errors[
                        formKeys.mobileNo
                      ]?.message.toString()}
                      image={
                        <View style={styles.passwordIconStyle}>
                          <AntDesign name="phone" size={23} color="black" />
                        </View>
                      }
                    />
                  )}
                  rules={{
                    required: requiredValidation(i18n.translate("mobileNumber")),
                    validate: numberValidation,
                    minLength: minLengthValidation(
                      validationSchema.phoneNumber.minLength,
                    ),
                  }}
                /> */}

                <Controller
                  name={formKeys.mobileNo}
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <>
                      <PhoneInput
                        // defaultValue="+12505550199"
                        placeholder={i18n.translate("mobileNumber")}
                        value={value}
                        onChangePhoneNumber={onChange}
                        selectedCountry={selectedCountry}
                        onChangeSelectedCountry={handleSelectedCountry}
                        placeholderTextColor="#adb5bd"
                        inputStyle={{
                          color: colors.lightBlack,
                        }}
                        containerStyle={{
                          flexDirection: "row",
                          borderRadius: 35,
                          // borderColor: colors.lightGray,
                          borderWidth: 0.5,
                          backgroundColor: "white",
                          // paddingHorizontal: 15,
                          marginTop: 12,
                          height: 55,
                          alignItems: "center",
                          elevation: 0.4,
                        }}
                        flagContainerStyle={{
                          borderTopLeftRadius: 7,
                          borderBottomLeftRadius: 7,
                          backgroundColor: "transparent",
                          justifyContent: "center",
                          borderRightWidth: 1,
                          borderTopRightRadius: 35,
                          borderColor: colors.lightGray,
                          borderBottomRightRadius: 35,
                        }}
                      />
                      {errors[formKeys.mobileNo]?.message.toString() ? (
                        <FormErrorMessage style={ml10}>
                          {errors[formKeys.mobileNo]?.message.toString()}
                        </FormErrorMessage>
                      ) : null}
                    </>
                  )}
                  rules={{
                    required: requiredValidation(
                      i18n.translate("mobileNumber")
                    ),

                    minLength: minLengthValidation(
                      validationSchema.phoneNumber.minLength
                    ),
                  }}
                />
              </View>

              <View style={pv10}>
                <Button
                  disabled={false}
                  funCallback={handleSubmit(onsubmit)}
                  label={i18n.translate("addPhoneNumberGuest")}
                  bgColor={colors.primary2}
                  borderColor={colors.white}
                  success={true}
                  borderWidth={0.2}
                />
              </View>

              {/* <View style={styles.infoTextViewStyle}>
                <H14fontRegularWhite>
                  {labels.gobacktoLogin}{' '}
                </H14fontRegularWhite>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate(screenName.SignInScreenClinic as any)
                  }>
                  <H14fontRegularWhite
                    style={{
                      textDecorationLine: 'underline',
                      fontWeight: 'bold',
                    }}>
                    {labels.registerLogin}
                  </H14fontRegularWhite>
                </TouchableOpacity>
              </View> */}
            </View>
          </ScrollView>
          <View
            style={{
              position: "absolute",
              width: 300,
              height: 100,
              bottom: "2%",
              left: "10%",
            }}
          >
            <Snackbar
              visible={showSnackBar}
              onDismiss={() => setShowSnackback(false)}
              action={{
                label: "OK",
                onPress: () => {
                  // Do something
                  setShowSnackback(false);
                  navigation.navigate(screenName.PatientSearchDashboard);
                },
              }}
              // duration={2000}
            >
              Phone number changed!
            </Snackbar>
          </View>
        </ImageBackground>
      </MainContainer>
    </Fragment>
  );
};
export default GuestPhoneInputModal;
const styles = StyleSheet.create({
  subContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  passwordImageStye: {
    height: 25,
    width: 25,
    alignSelf: "center",
  },
  infoTextViewStyle: {
    paddingTop: 10,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  passwordIconStyle: { justifyContent: "center", alignItems: "center" },
});

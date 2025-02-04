import React, { Fragment, useState } from "react";
import {
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  ImageBackground,
} from "react-native";
import { Button, SocialMediaLogin } from "../components/commonButton";
import { GeneralProps } from "../interfaces/generalProps";
import { Route } from "@react-navigation/native";
import { labels } from "../utils/labels";
import { screenName } from "../utils/screenName";
import {
  FormErrorMessage,
  H6fontRegularBlack,
  H7fontMediumWhite,
  H7fontRegularWhite,
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
import {
  alignItemsCenter,
  flex1,
  ml10,
  mt10,
  mt20,
  pb10,
  ph15,
} from "../common/commonStyles";
import { StyleSheet } from "react-native";
import { useForm, Controller } from "react-hook-form";
import {
  emailValidation,
  minLengthValidation,
  numberValidation,
  requiredValidation,
  validationSchema,
} from "../utils/validationConfig";
import { InputFields } from "../components/commonInputFields";

import { authentication, db, storage } from "../../firebase";
import { ref, uploadBytes, uploadBytesResumable } from "firebase/storage";
import { setDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { retrieveInfoAboutPatientsFromClinic } from "../utils/getFirebaseData";
import { MaterialIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import CustomLoader from "../components/customLoader";
import { handleSignOut } from "../utils/handleSignOut";
import i18n from "../../i18n";
import {
  ICountry,
  PhoneInput,
  getCountryByCca2,
} from "react-native-international-phone-number";

interface Props extends GeneralProps {
  route: Route<string, object | undefined>;
}

const SignUpScreenPatient: React.FC<Props> = ({ navigation }): JSX.Element => {
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchingForAppointments, setIsSearchingForAppointments] =
    useState(false);

  const formKeys = {
    email: "email",
    // linkId: 'linkId',
    mobileNo: "mobileNo",
    password: "password",
    confirmPassword: "confirmPassword",
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

  //ADD OWNER_UID TO CLINICS...FOR MESSAGES...
  const handleUpdateInfoAboutPatientsInClinic = async (
    uid,
    clinics,
    patientPhoneNumber
  ) => {
    try {
      console.log(
        "-------------handleUpdateInfoAboutPatientsInClinic-------------"
      );
      console.log(uid);
      console.log(clinics);
      console.log(patientPhoneNumber);

      for (let i = 0; i < clinics.length; i++) {
        const docRef = doc(db, "Users", clinics[i]);
        const docSnap = await getDoc(docRef);
        let clinicPatientsArr;
        // let clinicPatientsArr;
        if (docSnap.exists()) {
          clinicPatientsArr = docSnap.data().clinicsPatients;
        }

        for (let i = 0; i < clinicPatientsArr.length; i++) {
          if (clinicPatientsArr[i].phoneNumber === patientPhoneNumber) {
            // clinicPatientsArr[i].owner_uid = uid
            clinicPatientsArr[i] = uid;
          } else {
            console.log("is not...");
          }
        }

        const docRefArr = doc(db, "Users", clinics[i]);

        await updateDoc(docRefArr, {
          clinicsPatients: clinicPatientsArr,
        });
      }
    } catch (err) {
      console.log(
        "error....on....handleUpdateInfoAboutPatientsInClinic....",
        err
      );
    }
  };

  const onsubmit = async (detaila) => {
    setIsCreatingProfile(true);
    //reset values of async storage guest details
    handleLoginAsGuest(true);

    console.log(detaila);
    console.log(selectedCountry);

    let str = detaila.mobileNo.replace(/\s/g, "");

    let completePhoneNumber = selectedCountry.callingCode + " " + str;
    console.log(completePhoneNumber);

    let basicInfoData = {};
    // let phoneNumber = 0;
    let myAppointments = [];
    let clinicsHistory = [];
    console.log("START");
    console.log("---------------PHONE----------NUMBER----------------");
    console.log(detaila);

    console.log(
      "---------------before createUserWithEmailAndPassword----------------"
    );
    createUserWithEmailAndPassword(auth, detaila.email, detaila.password)
      .then((userCredentials) => {
        setTimeout(async () => {
          console.log("START 1");
          const user = userCredentials.user;
          console.log("user uid.....", user.uid);

          // ===================> CONTINUE HERE FOR REWRITING CLINIC DATA ABOUT UNREGISTERED APPOINTMENTS AND DOWNLOAD APPOINTMENTS FROM CLINIC FOR PATIENT
          // const patientInfos = await retrieveInfoAboutPatientsFromClinic(completePhoneNumber, user.uid)
          // console.log('---------------patientInfos----------------');
          // console.log(patientInfos)
          // <================= CONTINUE HERE FOR REWRITING CLINIC DATA ABOUT UNREGISTERED APPOINTMENTS AND DOWNLOAD APPOINTMENTS FROM CLINIC FOR PATIENT

          const patientInfos = false;
          if (patientInfos != false) {
            setIsCreatingProfile(false);
            setIsSearchingForAppointments(true);
          }
          let curentUserUid;

          if (patientInfos === false) {
            console.log("START 2");

            const collectionId = "Users";
            const documentId = user.uid;
            console.log("START 3");

            const value = {
              basicInfoData,
              owner_uid: user.uid,
              phoneNumber: completePhoneNumber,
              email: user.email,
              // linkId: detaila.linkId,
              isClinic: false,
              isPatient: true,
              hasProfile: false,
              myAppointments: [],
              clinicsHistory: [],
              termsConditions: { text: "", isAccepted: false },
            };
            setDoc(doc(db, collectionId, documentId), value);

            console.log("START 4");

            console.log("success PASS");
            console.log("START 5");
          } else {
            console.log("ELSEEEEE-----------------");
            setIsCreatingProfile(false);
            setIsSearchingForAppointments(true);
            basicInfoData = patientInfos.basicInfoData;
            //  phoneNumber = patientInfos.phoneNumber
            myAppointments = patientInfos.appointmentsArr;
            clinicsHistory = patientInfos.clinicHistoryArr;

            console.log("------------------------");
            console.log(basicInfoData);
            // console.log("------------------------")
            // console.log(phoneNumber)
            console.log("--------------------------");
            console.log(myAppointments.length);
            console.log("-------------------------");
            console.log(clinicsHistory.length);

            const user = userCredentials.user;
            curentUserUid = user.uid;
            console.log(
              "-------------handleUpdateInfoAboutPatientsInClinic----------BEGITN---"
            );
            console.log(patientInfos.clinicHistoryArr);
            console.log("--------------------------");
            console.log(patientInfos.appointmentsArr);
            console.log("--------------------------");
            console.log(patientInfos.basicInfoData);
            console.log("--------------------------");

            handleUpdateInfoAboutPatientsInClinic(
              user.uid,
              patientInfos.clinicHistoryArr,
              patientInfos.patientPhoneNumber
            );

            const collectionId = "Users";
            const documentId = user.uid;
            const value = {
              basicInfoData,
              owner_uid: user.uid,
              phoneNumber: completePhoneNumber,
              email: user.email,
              // linkId: detaila.linkId,
              isClinic: false,
              isPatient: true,
              hasProfile: false,
              myAppointments: myAppointments,
              clinicsHistory: clinicsHistory,
              termsConditions: { text: "", isAccepted: false },
            };
            setDoc(doc(db, collectionId, documentId), value);

            console.log("success PASS");
          }
        }, 1500);

        console.log("START 6");
      })
      .then(() => {
        console.log("START 7");
        handleSignOut(navigation, true);
      })

      .catch((error) => {
        console.log("error....", error);
        Alert.alert(
          "User already in use",
          "Your e-mail is already in use. Please try again with another e-mail or log in into an existing account",
          [
            {
              text: "Try Again",
              onPress: () => console.log("Try Again pressed"),
              style: "cancel",
            },
          ]
        );

        console.log(error);
      });
    setIsCreatingProfile(false);

    setIsCreatingProfile(false);
    setIsSearchingForAppointments(false);
  };

  const onChange = (password, score, { label, labelColor, activeBarColor }) => {
    console.log(password, score, { label, labelColor, activeBarColor });
  };

  const [selectedCountry, setSelectedCountry] = useState<undefined | ICountry>(
    getCountryByCca2("RO")
  );

  function handleSelectedCountry(country: ICountry) {
    setSelectedCountry(country);
  }

  return (
    <Fragment>
      <MainContainer>
        <CustomLoader
          isLoading={isCreatingProfile}
          text={
            isSearchingForAppointments ? "Searching for appointments..." : false
          }
        />
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
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ position: "absolute", padding: 20, zIndex: 3 }}
          >
            <AntDesign name="arrowleft" size={24} color="black" />
          </TouchableOpacity>
          {/* <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.subContainer}> */}
          <View style={styles.subContainer}>
            {/* <View style={flex1}> */}
            {/* <View style={[alignItemsCenter, pb10]}>
                  <LoginIcon fill={'#e0e0e0'} />
                  <View>
                    <LogoIcon />
                  </View>
                </View> */}
            <RowView style={{ marginTop: "80%" }}>
              <H7fontMediumWhite>
                {i18n.translate("patientRegister")}
              </H7fontMediumWhite>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate(screenName.SignUpScreenClinic as any)
                }
              >
                <H7fontMediumWhite>
                  {i18n.translate("notaPatient")}
                </H7fontMediumWhite>
              </TouchableOpacity>
              {/* <H9fontRegularBlack>{labels.notaDoctor}</H9fontRegularBlack> */}
            </RowView>
            <View>
              <Controller
                name={formKeys.email}
                control={control}
                render={({ field: { onChange, value } }) => (
                  <InputFields
                    errorMessage={errors[formKeys.email]?.message.toString()}
                    value={value}
                    onChangeText={onChange}
                    placeholder={i18n.translate("email")}
                    image={
                      <View style={styles.passwordIconStyle}>
                        <MaterialIcons name="email" size={24} color="grey" />
                      </View>
                    }
                  />
                )}
                rules={{
                  required: requiredValidation(i18n.translate("email")),
                  validate: emailValidation,
                }}
              />

              {/* <Controller
                name={formKeys.linkId}
                control={control}
                render={({field: {onChange, value}}) => (
                  <InputFields
                    value={value}
                    onChangeText={onChange}
                    placeholder={labels.linkId}
                    errorMessage={errors[formKeys.linkId]?.message.toString()}
                    image={
                      <View style={styles.passwordIconStyle}>
                        <LockIcon />
                      </View>
                    }
                  />
                )}
                rules={{
                  required: requiredValidation(labels.linkId),
                }}
              /> */}

              {/* <Controller
                name={formKeys.mobileNo}
                control={control}
                render={({field: {onChange, value}}) => (
                  <InputFields
                    value={value}
                    isNumber={true}
                    onChangeText={onChange}
                    placeholder={i18n.translate("mobileNumber")}
                    errorMessage={errors[formKeys.mobileNo]?.message.toString()}
                    image={
                      <View style={styles.passwordIconStyle}>
                                  <AntDesign name="mobile1" size={24} color="grey" />
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
                  required: requiredValidation(i18n.translate("mobileNumber")),

                  minLength: minLengthValidation(
                    validationSchema.phoneNumber.minLength
                  ),
                }}
              />

              <Controller
                name={formKeys.password}
                control={control}
                render={({ field: { onChange, value } }) => (
                  <InputFields
                    isPassword={true}
                    value={value}
                    isSecure={true}
                    onChangeText={onChange}
                    placeholder={i18n.translate("createPassword")}
                    errorMessage={errors[formKeys.password]?.message.toString()}
                    image={
                      <View style={styles.passwordIconStyle}>
                        <MaterialIcons
                          name="lock-outline"
                          size={24}
                          color="grey"
                        />
                      </View>
                    }
                  />
                )}
                rules={{
                  required: requiredValidation(
                    i18n.translate("createPassword")
                  ),
                  minLength: minLengthValidation(
                    validationSchema.password.minLength
                  ),
                }}
              />

              <Controller
                name={formKeys.confirmPassword}
                control={control}
                render={({ field: { onChange, value } }) => (
                  <InputFields
                    isPassword={true}
                    value={value}
                    isSecure={true}
                    onChangeText={onChange}
                    placeholder={i18n.translate("confirmPassword")}
                    errorMessage={errors[
                      formKeys.confirmPassword
                    ]?.message.toString()}
                    image={
                      <View style={styles.passwordIconStyle}>
                        <MaterialIcons
                          name="lock-outline"
                          size={24}
                          color="grey"
                        />
                      </View>
                    }
                  />
                )}
                rules={{
                  required: requiredValidation(
                    i18n.translate("confirmPassword")
                  ),
                  validate: (value) =>
                    value === pwd || i18n.translate("passDontMatch"),
                }}
              />
            </View>

            <Button
              disabled={false}
              funCallback={handleSubmit(onsubmit)}
              label={i18n.translate("register")}
            />
            {/* </View> */}

            <View>
              <View style={styles.infoTextViewStyle}>
                <H7fontRegularWhite>
                  {i18n.translate("alreadyAccount")}{" "}
                </H7fontRegularWhite>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate(screenName.SignInScreenPatient as any)
                  }
                >
                  <H7fontRegularWhite>
                    {i18n.translate("registerLogin")}
                  </H7fontRegularWhite>
                </TouchableOpacity>
              </View>
              <View style={styles.borderLineStyle}>
                <CommonLineView />
              </View>
              {/* <RowView style={styles.footerComponentView}>
                  <SocialMediaLogin
                    btnKey={'fb'}
                    label={labels.facebook}
                    image={
                      <View style={styles.socialMediaFBIconStyle}>
                        <FacebookIcon />
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
        </ImageBackground>
      </MainContainer>
    </Fragment>
  );
};
export default SignUpScreenPatient;

const styles = StyleSheet.create({
  subContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 15,
    justifyContent: "center",
    // marginTop: '10%',
  },
  infoTextViewStyle: {
    paddingTop: 10,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },

  socialMediaIconStyle: { height: 15, width: 22, alignSelf: "center" },

  socialMediaFBIconStyle: { alignItems: "center", justifyContent: "center" },
  borderLineStyle: { paddingTop: 10 },
  footerComponentView: { paddingTop: 30 },
  passwordIconStyle: { justifyContent: "center", alignItems: "center" },
  userIconsStyle: {
    height: 20,
    width: 20,
    alignSelf: "center",
    justifyContent: "center",
  },
});

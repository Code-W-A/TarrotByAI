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
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";

import { Button, SocialMediaLogin } from "../components/commonButton";
import { GeneralProps } from "../interfaces/generalProps";
import { Route } from "@react-navigation/native";
import { labels } from "../utils/labels";
import { screenName } from "../utils/screenName";
import { LinearGradient } from "expo-linear-gradient";

import {
  FormErrorMessage,
  H10fontRegularWhite,
  H6fontBoldPrimary,
  H6fontBoldWhite,
  H6fontRegularBlack,
  H7fontBoldPrimary,
  H7fontMediumWhite,
  H8fontBoldPrimary,
  H8fontMediumPrimary,
  H8fontMediumWhite,
  H8fontRegularPrimary,
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

import { Text } from "react-native-paper";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  getAuth,
  PhoneAuthProvider,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { authentication, db } from "../../firebase";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri } from "expo-auth-session";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  getCalendarTimes,
  getClinicAppointments,
  getClinicApprovedAppointments,
  getClinicDoctors,
  getClinicInfo,
  getClinics,
  getPatientsOfClinic,
  getScheduleTimings,
} from "../actions/clinicActions";
import {
  getGuestLoginDetails,
  getPatientAppointments,
  getPatientInfo,
  setTemporaryPatientClinicReview,
} from "../actions/patientActions";
import { registerForPushNotificationsAsync } from "../utils/Notification/registerPushNotification";
import { uploadExpoPushToken } from "../utils/UploadFirebaseData";
import { retrieveTypeOfUser } from "../utils/getFirebaseData";

import CustomLoader from "../components/customLoader";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import i18n from "../../i18n";
import {
  ICountry,
  PhoneInput,
  getCountryByCca2,
} from "react-native-international-phone-number";
import { useAuth } from "../context/AuthContext";
import { handleFirebaseAuthError } from "../utils/authUtils";
import SnackBar from "../components/SnackBar";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Icon from "react-native-vector-icons/FontAwesome";

interface Props extends GeneralProps {
  route: Route<string, object | undefined>;
}

const SignInScreenClinic: React.FC<Props> = ({
  navigation,
  route,
}): JSX.Element => {
  const { setAsGuestUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [borderWhite, setBorderWhite] = useState(false);
  const [isWhite1, setIsWhite1] = useState(false);
  const [isWhite2, setIsWhite2] = useState(false);
  const [loginType, setLoginType] = useState("email");
  const [message, setMessage] = useState("email");
  const [showSnackback, setShowSnackback] = useState(false);

  const formKeys = {
    email: "email",
    password: "password",
  };
  const formKeysPhone = {
    mobileNo: "mobileNo",
  };

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm();

  const auth = authentication;

  const storeData = async (value) => {
    try {
      await AsyncStorage.setItem("userType", value);
    } catch (e) {
      // saving error
    }
  };

  const handleLoginAsGuest = async () => {
    try {
      // Setează valoarea pentru a indica că utilizatorul este un guest user
      await setAsGuestUser(true).then(() => {
        navigation.navigate(screenName.ClinicDashBoard);
      });

      console.log("Utilizatorul este acum setat ca guest user.");
    } catch (error) {
      // Gestionează orice erori care pot apărea la scrierea în AsyncStorage
      console.error(
        "Eroare la setarea guest user-ului în AsyncStorage:",
        error
      );
    }
  };

  const onsubmit = async (detaila) => {
    // Use the replace method with a regular expression to remove white spaces
    const emailWithoutSpace = detaila.email.replace(/\s/g, "");
    detaila.email = emailWithoutSpace;
    try {
    } catch (err) {
      console.log("errror expo", err);
    }
    signInWithEmailAndPassword(auth, detaila.email, detaila.password)
      .then(async (userCredentials) => {
        console.log("userCredentials...", userCredentials.user.uid);
        const userType = await retrieveTypeOfUser(userCredentials.user.uid);
        console.log("test here....");
        if (userCredentials.user.uid) {
          // console.log("test here....with yes");
          // handleLoginAsGuest(false, true).then(() => {
          //   dispatch(getGuestLoginDetails());
          // });
        }

        console.log("userType...", userType);

        setIsLoading(false);
      })
      .catch((error) => {
        const errorMessage = handleFirebaseAuthError(error);
        // Aici puteți folosi errorMessage pentru a afișa un snackbar sau un alert
        setShowSnackback(true);
        setMessage(errorMessage);

        console.log("error on sign in user...", error.message);
        console.log("error on sign in user...", error.code);
      });
  };

  const [selectedCountry, setSelectedCountry] = useState<undefined | ICountry>(
    getCountryByCca2("RO")
  );

  function handleSelectedCountry(country: ICountry) {
    setSelectedCountry(country);
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // console.log('is user...');
        navigation.navigate(screenName.ClinicDashBoard);
      } else {
      }
    });

    return unsubscribe;
  }, []);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId:
      "76318868979-fg83s3bgc4a685n46lul2a2u6lrooahh.apps.googleusercontent.com",
    redirectUri: makeRedirectUri({
      scheme: "com.cristina.zurba.tarot",
      useProxy: true, // Folosește proxy-ul Expo pentru teste locale
    }),
  });

  const handleGoogleSignIn = async () => {
    console.log("Start....nou");
    if (response?.type === "success") {
      const { id_token } = response.params;

      try {
        // Creează credentialele Firebase din token-ul Google
        const credential = GoogleAuthProvider.credential(id_token);
        const userCredential = await signInWithCredential(
          authentication,
          credential
        );
        const user = userCredential.user;

        // Verificare și stocare date utilizator
        const collectionId = "Users";
        const documentId = user.uid;
        const value = {
          owner_uid: user.uid,
          first_name: user.displayName || "Utilizator",
          last_name: "",
          email: user.email || "Email necunoscut",
          photoURL: user.photoURL || "",
          auth_provider: "Google",
        };

        console.log("Start....nou", value);

        const userRef = doc(db, collectionId, documentId);
        const docSnapshot = await getDoc(userRef);

        if (!docSnapshot.exists()) {
          await setDoc(userRef, value);
          console.log("Utilizator nou creat:", value);
        } else {
          console.log("Utilizator deja existent:", docSnapshot.data());
        }

        // Navighează către altă pagină
        navigation.navigate(screenName.ClinicDashBoard);
      } catch (error) {
        console.error("Eroare la autentificare:", error.message);
        Alert.alert(
          "Eroare",
          "Autentificarea a eșuat. Vă rugăm să încercați din nou."
        );
      }
    } else {
      Alert.alert("Eroare", "Autentificarea cu Google a fost anulată.");
    }
  };

  useEffect(() => {
    if (response) {
      handleGoogleSignIn();
    }
  }, [response]);

  return (
    <TouchableWithoutFeedback onPress={() => console.log("ass")}>
      <Fragment>
        <CustomLoader isLoading={isLoading} />
        <LinearGradient
          colors={[
            colors.gradientLogin1,
            colors.gradientLogin2,
            colors.gradientLogin2,
          ]} // Înlocuiește cu culorile gradientului tău
          style={styles.gradient}
        >
          <KeyboardAvoidingView
            style={{ flex: 1, justifyContent: "center" }}
            keyboardVerticalOffset={65}
          >
            <View style={styles.subContainer}>
              <View
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  position: "relative",
                  bottom: "8%",
                }}
              >
                <Image
                  source={require("../../assets/headerIcon.png")}
                  style={{ width: 300, height: 100, marginBottom: "5%" }}
                  resizeMode="contain" // Aceasta va asigura că întreaga imagine se va încadra în spațiul disponibil, păstrând proporțiile.
                />
                <H6fontBoldWhite style={{ top: "5%" }}>
                  {i18n.translate("login")}
                </H6fontBoldWhite>
              </View>

              <View>
                <View>
                  <Controller
                    name={formKeys.email}
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <InputFields
                        errorMessage={errors[
                          formKeys.email
                        ]?.message.toString()}
                        value={value}
                        onChangeText={onChange}
                        placeholder={i18n.translate("email")}
                        image={"email"}
                        setIsWhite1={setIsWhite1}
                      />
                    )}
                    rules={{
                      required: requiredValidation(i18n.translate("email")),
                      validate: emailValidation,
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
                        placeholder={i18n.translate("password")}
                        errorMessage={errors[
                          formKeys.password
                        ]?.message.toString()}
                        image={"lock-outline"}
                        setIsWhite2={setIsWhite2}
                      />
                    )}
                    rules={{
                      required: requiredValidation(i18n.translate("password")),
                      minLength: minLengthValidation(
                        validationSchema.password.minLength
                      ),
                    }}
                  />
                </View>

                <RowView style={[mt10, alignSelfRight]}>
                  {loginType === "email" && (
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate(
                          screenName.ForgotPasswordClinic as any
                        )
                      }
                    >
                      <H7fontBoldPrimary>
                        {i18n.translate("forgotPassword")}
                      </H7fontBoldPrimary>
                    </TouchableOpacity>
                  )}
                </RowView>
                <View
                  style={{
                    width: "100%",

                    height: "32%",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Button
                    disabled={false}
                    funCallback={handleLoginAsGuest}
                    borderWidth={3}
                    bgColor={"transparent"}
                    txtColor={colors.primary3}
                    label={i18n.translate("loginNowNoAccount")}
                    borderColor={colors.white}
                    success={true}
                    style={{ height: "42%", marginTop: "5%" }}
                    txtStyle={{ fontSize: 20 }}
                  />

                  <Button
                    disabled={false}
                    funCallback={handleSubmit(onsubmit)}
                    borderWidth={2}
                    bgColor={colors.primary3}
                    style={{ marginTop: "5%" }}
                    label={i18n.translate("loginNow")}
                    borderColor={colors.primary3}
                    success={true}
                    txtColor={colors.white}
                  />
                </View>

                <TouchableOpacity
                  style={styles.googleButton}
                  onPress={() => promptAsync()} // Acțiunea butonului rămâne aceeași
                  disabled={!request}
                >
                  <Icon name="google" size={24} color="white" />
                </TouchableOpacity>
                <View>
                  <View style={styles.infoTextViewStyle}>
                    <H7fontBoldPrimary>
                      {i18n.translate("dntHaveAccount")}{" "}
                    </H7fontBoldPrimary>
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate(
                          screenName.SignUpScreenClinic as any,
                          { item: loginType }
                        )
                      }
                    >
                      <H7fontBoldPrimary
                        style={{
                          textDecorationLine: "underline",
                        }}
                      >
                        {i18n.translate("signUp")}
                      </H7fontBoldPrimary>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
            {/* </View> */}
          </KeyboardAvoidingView>
          <SnackBar
            showSnackBar={showSnackback}
            setShowSnackback={setShowSnackback}
            message={message}
            bottom={2}
            screen={screenName.SignInScreenClinic}
          />
        </LinearGradient>
      </Fragment>
    </TouchableWithoutFeedback>
  );
};
export default SignInScreenClinic;

const styles = StyleSheet.create({
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4285F4", // Albastru Google
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 4,
    marginTop: 15,
    width: "80%", // Proporție relativă a lățimii ecranului
    maxWidth: 400, // Dimensiune maximă pentru ecrane mari
    justifyContent: "center", // Centrează iconul și textul
    alignSelf: "center", // Centrează butonul pe orizontală
  },

  googleButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold", // Font bold pentru vizibilitate
    marginLeft: 10, // Spațiere între icon și text
  },
  subContainer: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: "20%",
    justifyContent: "center",
  },
  gradient: {
    flex: 1,
    width: "100%",
    height: "100%",
    // paddingBottom: 100,
    // Alte stiluri necesare pentru a pozitiona gradientul după cum este necesar
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

  borderLineStyle: { paddingTop: 10 },
  footerComponentView: { paddingTop: 30 },
});

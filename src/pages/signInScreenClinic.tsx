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
  OAuthProvider,
} from "firebase/auth";
import { authentication, db } from "../../firebase";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri } from "expo-auth-session";
import * as AppleAuthentication from 'expo-apple-authentication';

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
import { useNavBarVisibility } from '../context/NavbarVisibilityContext';

interface Props extends GeneralProps {
  route: Route<string, object | undefined>;
}

const deviceWidth = Dimensions.get('window').width;

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
  const { setIsNavBarVisible } = useNavBarVisibility();

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
      await setAsGuestUser(true);
      setIsNavBarVisible(true);
      navigation.replace(screenName.ClinicDashBoard);
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

  // Check Apple Authentication availability on iOS
  useEffect(() => {
    if (Platform.OS === "ios") {
      AppleAuthentication.isAvailableAsync().then((available) => {
        console.log("Apple Authentication available:", available);
      });
    }
  }, []);

  const handleAppleSignIn = async () => {
    try {
      // Start Apple authentication flow
      const appleCredential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      // Create Firebase credential using Apple token
      const provider = new OAuthProvider('apple.com');
      const firebaseCredential = provider.credential({
        idToken: appleCredential.identityToken,
      });

      // Authenticate user in Firebase
      const userCredential = await signInWithCredential(authentication, firebaseCredential);
      const user = userCredential.user;
      console.log('User authenticated with Apple:', user);

      // Create or update user document in Firestore
      const collectionId = "Users";
      const documentId = user.uid;
      const value = {
        owner_uid: user.uid,
        // Use full name provided by Apple (only available on first authentication)
        first_name: appleCredential.fullName?.givenName || user.displayName || "Utilizator",
        last_name: appleCredential.fullName?.familyName || "",
        email: appleCredential.email || user.email || "Email necunoscut",
        photoURL: user.photoURL || "",
        auth_provider: "Apple",
      };

      const userRef = doc(db, collectionId, documentId);
      const docSnapshot = await getDoc(userRef);

      if (!docSnapshot.exists()) {
        await setDoc(userRef, value);
        console.log("New user created:", value);
      } else {
        console.log("Existing user:", docSnapshot.data());
      }

      // Navigate to dashboard
      setIsNavBarVisible(true);
      navigation.replace(screenName.ClinicDashBoard);
    } catch (error) {
      console.error('Error with Apple authentication:', error);
      Alert.alert("Eroare", "Autentificarea cu Apple a eșuat. Vă rugăm să încercați din nou.");
    }
  };

  useEffect(() => {
    setIsNavBarVisible(false);
    return () => setIsNavBarVisible(true);
  }, []);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <MainContainer secondary={false} style={{ flex: 1 }}>
        <ImageBackground
          source={require("../../assets/dashboardbg.jpg")}
          style={{ flex: 1, width: '100%', height: '100%' }}
          imageStyle={{ opacity: 1 }}
        >
        <CustomLoader isLoading={isLoading} />
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={40}
          >
            <ScrollView
              contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-start', paddingBottom: 60 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={[styles.subContainerNew, { paddingTop: 10 }]}>
                <View style={styles.headerContainerNew}>
                <Image
                    source={require('../../assets/headerIcon.png')}
                    style={styles.logoCrownResponsive}
                    resizeMode="contain"
                  />
                  <View style={styles.goldLineNew} />
                  <H6fontBoldPrimary>
                    {i18n.translate('login')}
                  </H6fontBoldPrimary>
              </View>
                <View style={styles.formContainerNew}>
                  <Controller
                    name={formKeys.email}
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <InputFields
                        errorMessage={errors[formKeys.email]?.message?.toString()}
                        value={value}
                        onChangeText={onChange}
                        placeholder={i18n.translate('email')}
                        image={"email"}
                        containerStyle={styles.inputWrapperNew}
                        textInputStyle={styles.inputTextNew}
                        setIsWhite1={setIsWhite1}
                      />
                    )}
                    rules={{
                      required: requiredValidation(i18n.translate('email')),
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
                        placeholder={i18n.translate('password')}
                        errorMessage={errors[formKeys.password]?.message?.toString()}
                        image={"lock-outline"}
                        containerStyle={styles.inputWrapperNew}
                        textInputStyle={styles.inputTextNew}
                        setIsWhite2={setIsWhite2}
                      />
                    )}
                    rules={{
                      required: requiredValidation(i18n.translate('password')),
                      minLength: minLengthValidation(validationSchema.password.minLength),
                    }}
                  />
                  <RowView style={styles.forgotRowNew} height={undefined}>
                    {loginType === 'email' && (
                    <TouchableOpacity
                        onPress={() => navigation.navigate(screenName.ForgotPasswordClinic as any)}
                    >
                      <H7fontBoldPrimary>
                          {i18n.translate('forgotPassword')}
                      </H7fontBoldPrimary>
                    </TouchableOpacity>
                  )}
                </RowView>
                  <View style={styles.buttonGroupNew}>
                  <Button
                    disabled={false}
                    funCallback={handleLoginAsGuest}
                      borderWidth={2}
                      bgColor={'#FFD700'}
                      txtColor={'#000'}
                      label={i18n.translate('loginNowNoAccount')}
                      borderColor={'#FFD700'}
                    success={true}
                      style={styles.guestButtonNew}
                      txtStyle={styles.guestButtonTextNew}
                  />
                  <Button
                    disabled={false}
                    funCallback={handleSubmit(onsubmit)}
                      borderWidth={0}
                      bgColor={'#FFD700'}
                      style={styles.loginButtonNew}
                      label={i18n.translate('loginNow')}
                      borderColor={'#FFD700'}
                    success={true}
                      txtColor={'#fff'}
                      txtStyle={styles.loginButtonTextNew}
                  />
                <TouchableOpacity
                      style={styles.googleButtonNew}
                      onPress={() => promptAsync()}
                  disabled={!request}
                      activeOpacity={0.85}
                >
                      <Icon name="google" size={22} color="#FFD700" style={{ marginRight: 10 }} />
                      <Text style={styles.googleButtonTextNew}>{i18n.translate('loginWithGoogle')}</Text>
                </TouchableOpacity>

                {/* Apple Sign In Button - iOS only */}
                {Platform.OS === 'ios' && (
                  <TouchableOpacity
                    style={styles.appleButtonNew}
                    onPress={handleAppleSignIn}
                    activeOpacity={0.85}
                  >
                    <Icon name="apple" size={22} color="#FFD700" style={{ marginRight: 10 }} />
                    <Text style={styles.appleButtonTextNew}>Sign in with Apple</Text>
                  </TouchableOpacity>
                )}
                  </View>
                  <View style={styles.infoTextViewStyleNew}>
                    <H7fontBoldPrimary>
                      {i18n.translate('dntHaveAccount')} {" "}
                    </H7fontBoldPrimary>
                    <TouchableOpacity
                      onPress={() => navigation.navigate(screenName.SignUpScreenClinic as any, { item: loginType })}
                    >
                      <H7fontBoldPrimary>
                        {i18n.translate('signUp')}
                      </H7fontBoldPrimary>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
          <SnackBar
            showSnackBar={showSnackback}
            setShowSnackback={setShowSnackback}
            message={message}
            bottom={2}
            screen={screenName.SignInScreenClinic}
          />
        </ImageBackground>
      </MainContainer>
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
  subContainerNew: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: deviceWidth < 400 ? 10 : 30,
  },
  headerContainerNew: {
    alignItems: 'center',
    marginBottom: deviceWidth < 400 ? 8 : 18,
    width: '100%',
  },
  logoCrownResponsive: {
    width: deviceWidth * 0.55,
    height: deviceWidth * 0.55,
    maxWidth: 340,
    maxHeight: 340,
    minWidth: 120,
    minHeight: 120,
    marginBottom: 8,
    alignSelf: 'center',
  },
  goldLineNew: {
    width: 60,
    height: 3,
    backgroundColor: '#FFD700',
    borderRadius: 2,
    marginBottom: 12,
  },
  titleNew: {
    fontSize: 28,
    color: '#FFD700',
    fontFamily: 'LoraBold',
    marginBottom: 8,
    textAlign: 'center',
  },
  formContainerNew: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  inputWrapperNew: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#FFD700',
    borderRadius: 22,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    width: '100%',
    shadowColor: '#FFD700',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  inputIconNew: {
    marginRight: 10,
  },
  inputFieldNew: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 0,
    color: '#FFD700',
    fontSize: 16,
    fontFamily: 'Lora',
  },
  inputTextNew: {
    color: '#FFD700',
    fontSize: 16,
    fontFamily: 'Lora',
  },
  forgotRowNew: {
    width: '100%',
    justifyContent: 'flex-end',
    marginBottom: 8,
    paddingRight: 8,
  },
  forgotTextNew: {
    color: '#FFD700',
    textDecorationLine: 'underline',
    fontSize: 14,
    fontFamily: 'Lora',
  },
  buttonGroupNew: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  guestButtonNew: {
    width: '100%',
    borderRadius: 22,
    marginBottom: 10,
    borderColor: '#FFD700',
    backgroundColor: '#fff',
    shadowColor: '#FFD700',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  guestButtonTextNew: {
    color: '#000',
    fontSize: 18,
    fontFamily: 'LoraBold',
  },
  loginButtonNew: {
    width: '100%',
    borderRadius: 22,
    marginBottom: 10,
    backgroundColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  loginButtonTextNew: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'LoraBold',
  },
  googleButtonNew: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#FFD700',
    borderRadius: 22,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 8,
    width: '100%',
    justifyContent: 'center',
    shadowColor: '#FFD700',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  googleButtonTextNew: {
    color: '#FFD700',
    fontSize: 16,
    fontFamily: 'LoraBold',
  },
  appleButtonNew: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    borderWidth: 1.5,
    borderColor: '#000',
    borderRadius: 22,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 8,
    width: '100%',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  appleButtonTextNew: {
    color: '#FFD700',
    fontSize: 16,
    fontFamily: 'LoraBold',
  },
  infoTextViewStyleNew: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  signupPromptNew: {
    color: '#FFD700',
    fontSize: 15,
    fontFamily: 'Lora',
  },
  signupLinkNew: {
    color: '#FFD700',
    textDecorationLine: 'underline',
    fontSize: 15,
    fontFamily: 'LoraBold',
    marginLeft: 4,
  },
});

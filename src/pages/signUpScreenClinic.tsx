import React, { Fragment, useEffect, useState } from "react";
import {
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Text,
  Platform,
  Keyboard,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

import { Button, SocialMediaLogin } from "../components/commonButton";
import { GeneralProps } from "../interfaces/generalProps";
import { Route, useRoute } from "@react-navigation/native";
import { labels } from "../utils/labels";
import { screenName } from "../utils/screenName";
import {
  FormErrorMessage,
  H10fontRegularWhite,
  H6fontBoldPrimary,
  H6fontBoldWhite,
  H6fontRegularBlack,
  H7fontMediumPrimary,
  H7fontMediumWhite,
  H8fontMediumPrimary,
  H8fontMediumWhite,
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
import { setDoc, doc, getDoc } from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  getAuth,
  signInWithCredential,
  OAuthProvider,
} from "firebase/auth";
import { MaterialIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { handleSignOut } from "../utils/handleSignOut";
import i18n, { languageCode } from "../../i18n";

import CustomLoader from "../components/customLoader";
import { TouchableWithoutFeedback } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import { Checkbox, Snackbar } from "react-native-paper";
import SnackBar from "../components/SnackBar";
import { handleFirebaseAuthError } from "../utils/authUtils";
import { useAuth } from "../context/AuthContext";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri } from "expo-auth-session";
import * as AppleAuthentication from 'expo-apple-authentication';

interface Props extends GeneralProps {
  route: Route<string, object | undefined>;
}

WebBrowser.maybeCompleteAuthSession();

const GOLD = '#FFD700';
const CREAM = '#FAF7F2';
const CREAM2 = '#F5E9D6';

const SignUpScreenClinic: React.FC<Props> = ({ navigation }): JSX.Element => {
  const formKeys = {
    email: "email",
    mobileNo: "mobileNo",
    firstName: "firstName",
    lastName: "lastName",
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

  const route = useRoute();

  // const [registerType, setRegisterType] = useState(route.params.item)
  const [registerType, setRegisterType] = useState("email");
  const [message, setMessage] = useState("email");
  const [isLoading, setIsLoading] = useState(false);
  const [showSnackback, setShowSnackback] = useState(false);
  const [isChecked, setChecked] = useState(false);
  const { setUserData } = useAuth();

  let pwd = watch("password");
  const auth = authentication;

  const onSubmit = (detaila) => {
    setIsLoading(true);
    console.log(detaila);

    createUserWithEmailAndPassword(auth, detaila.email, detaila.password)
      .then((userCredentials) => {
        setTimeout(async () => {
          const user = userCredentials.user;

          const collectionId = "Users";
          const documentId = user.uid;
          const value = {
            owner_uid: user.uid,
            first_name: detaila.firstName,
            last_name: detaila.lastName,
            email: detaila.email,
            // Adaugă orice alte câmpuri necesare
          };
          setUserData({ ...value });
          setDoc(doc(db, collectionId, documentId), value);
          console.log("success PASS");
        }, 1500);
      })
      .then(() => {
        // storeData('Clinic');
      })
      .then(() => {
        // navigation.navigate(screenName.SignInScreenClinic);
      })
      .catch((error) => {
        const errorMessage = handleFirebaseAuthError(error);
        // Aici puteți folosi errorMessage pentru a afișa un snackbar sau un alert
        setShowSnackback(true);
        setMessage(errorMessage);
      });

    setIsLoading(false);
  };

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId:
      "76318868979-fg83s3bgc4a685n46lul2a2u6lrooahh.apps.googleusercontent.com",
    redirectUri: makeRedirectUri({
      scheme: "com.cristina.zurba.tarot",
      useProxy: true, // Folosește proxy-ul Expo pentru teste locale
    }),
  });

  const handleGoogleSignIn = async () => {
    console.log("Start....");
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
          auth_provider: "Google", // Indică provider-ul de autentificare
        };

        console.log("Start....", value);

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
      navigation.navigate(screenName.ClinicDashBoard);
    } catch (error) {
      console.error('Error with Apple authentication:', error);
      Alert.alert("Eroare", "Autentificarea cu Apple a eșuat. Vă rugăm să încercați din nou.");
    }
  };

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
                contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-start', alignItems: 'center', paddingBottom: 60, paddingHorizontal: 20 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.headerContainerNew}>
                  <Image
                    source={require('../../assets/headerIcon.png')}
                    style={styles.logoCrownResponsive}
                    resizeMode="contain"
                  />
                  <View style={styles.goldLineNew} />
                  <H6fontBoldPrimary style={styles.titleNew}>
                    {i18n.translate('signUp')}
                  </H6fontBoldPrimary>
                </View>
                <View style={styles.formContainerNew}>
                      <Controller
                        name={formKeys.firstName}
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <InputFields
                        errorMessage={errors[formKeys.firstName]?.message?.toString()}
                            value={value}
                            onChangeText={onChange}
                        placeholder={i18n.translate('firstName')}
                            image={"person"}
                        containerStyle={styles.inputWrapperNew}
                        textInputStyle={styles.inputTextNew}
                          />
                        )}
                    rules={{ required: requiredValidation(i18n.translate('firstName')) }}
                      />
                      <Controller
                        name={formKeys.lastName}
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <InputFields
                        errorMessage={errors[formKeys.lastName]?.message?.toString()}
                            value={value}
                            onChangeText={onChange}
                        placeholder={i18n.translate('lastName')}
                            image={"person"}
                        containerStyle={styles.inputWrapperNew}
                        textInputStyle={styles.inputTextNew}
                          />
                        )}
                    rules={{ required: requiredValidation(i18n.translate('lastName')) }}
                      />
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
                        placeholder={i18n.translate('createPassword')}
                        errorMessage={errors[formKeys.password]?.message?.toString()}
                          image={"lock-outline"}
                        containerStyle={styles.inputWrapperNew}
                        textInputStyle={styles.inputTextNew}
                        />
                      )}
                      rules={{
                      required: requiredValidation(i18n.translate('createPassword')),
                      minLength: minLengthValidation(validationSchema.password.minLength),
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
                        placeholder={i18n.translate('confirmPassword')}
                        errorMessage={errors[formKeys.confirmPassword]?.message?.toString()}
                          image={"lock-outline"}
                        containerStyle={styles.inputWrapperNew}
                        textInputStyle={styles.inputTextNew}
                        />
                      )}
                      rules={{
                      required: requiredValidation(i18n.translate('confirmPassword')),
                      validate: (value) => value === pwd || i18n.translate('passDontMatch'),
                      }}
                    />
                  <View style={styles.checkboxRow}>
                  <Checkbox
                    status={isChecked ? "checked" : "unchecked"}
                      onPress={() => setChecked(!isChecked)}
                      color={GOLD}
                  />
                    <Text style={styles.termsText}>
                      {i18n.translate('agreeTerms1')}
                      <Text style={styles.termsLink} onPress={() => navigation.navigate(screenName.termConditionsClinic)}>
                        {i18n.translate('termsOfService')}
                      </Text>
                      {i18n.translate('and')}
                      <Text style={styles.termsLink} onPress={() => navigation.navigate(screenName.termConditionsClinic)}>
                        {i18n.translate('privacyPolicy')}
                      </Text>
                      .
                    </Text>
                  </View>
                    <Button
                      disabled={!isChecked}
                      funCallback={handleSubmit(onSubmit)}
                    label={i18n.translate('register')}
                      success={true}
                    bgColor={GOLD}
                    borderColor={GOLD}
                      borderWidth={0.2}
                    txtColor={'#fff'}
                    style={styles.loginButtonNew}
                    txtStyle={styles.loginButtonTextNew}
                    />
                <TouchableOpacity
                    style={styles.googleButtonNew}
                    onPress={() => promptAsync()}
                  disabled={!request}
                    activeOpacity={0.85}
                >
                    <Icon name="google" size={22} color={GOLD} style={{ marginRight: 10 }} />
                    <Text style={styles.googleButtonTextNew}>{i18n.translate('loginWithGoogle')}</Text>
                </TouchableOpacity>

                {/* Apple Sign In Button - iOS only */}
                {Platform.OS === 'ios' && (
                  <TouchableOpacity
                    style={styles.appleButtonNew}
                    onPress={handleAppleSignIn}
                    activeOpacity={0.85}
                  >
                    <Icon name="apple" size={22} color={GOLD} style={{ marginRight: 10 }} />
                    <Text style={styles.appleButtonTextNew}>Sign in with Apple</Text>
                  </TouchableOpacity>
                )}
                  <View style={styles.infoTextViewStyleNew}>
                    <H7fontMediumPrimary>
                      {i18n.translate('alreadyAccount')} {" "}
                    </H7fontMediumPrimary>
                    <TouchableOpacity
                      onPress={() => navigation.navigate(screenName.SignInScreenClinic)}
                    >
                      <H7fontMediumPrimary style={{ textDecorationLine: 'underline' }}>
                        {i18n.translate('registerLogin')}
                      </H7fontMediumPrimary>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
            {showSnackback ? (
              <SnackBar
                showSnackBar={showSnackback}
                setShowSnackback={setShowSnackback}
                message={message}
                bottom={2}
                screen={screenName.SignInScreenClinic}
              />
            ) : null}
        </ImageBackground>
        </MainContainer>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  headerContainerNew: {
    alignItems: 'center',
    marginBottom: 10,
    width: '90%',
    marginTop: 30,
  },
  logoCrownResponsive: {
    width: 120,
    height: 120,
    marginBottom: 10,
    alignSelf: 'center',
  },
  goldLineNew: {
    width: 60,
    height: 3,
    backgroundColor: GOLD,
    borderRadius: 2,
    marginBottom: 12,
  },
  titleNew: {
    fontSize: 28,
    fontWeight: '700',
    color: GOLD,
    fontFamily: 'LoraBold',
    marginBottom: 4,
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
    borderColor: GOLD,
    borderRadius: 22,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    width: '100%',
    shadowColor: GOLD,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  inputTextNew: {
    color: GOLD,
    fontSize: 16,
    fontFamily: 'Lora',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 10,
    width: '100%',
  },
  termsText: {
    color: colors.primary3,
    fontSize: 14,
    fontFamily: 'Lora',
    marginLeft: 8,
    flex: 1,
    flexWrap: 'wrap',
  },
  termsLink: {
    color: GOLD,
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
  loginButtonNew: {
    width: '100%',
    borderRadius: 22,
    marginBottom: 10,
    backgroundColor: GOLD,
    shadowColor: GOLD,
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
    borderColor: GOLD,
    borderRadius: 22,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 8,
    width: '100%',
    justifyContent: 'center',
    shadowColor: GOLD,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  googleButtonTextNew: {
    color: GOLD,
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
    color: GOLD,
    fontSize: 16,
    fontFamily: 'LoraBold',
  },
  infoTextViewStyleNew: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
});

export default SignUpScreenClinic;

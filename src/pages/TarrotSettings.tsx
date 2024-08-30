import React, { Fragment, useEffect, useState } from "react";
import {
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
} from "react-native";
import { Button, SocialMediaLogin } from "../components/commonButton";
import { GeneralProps } from "../interfaces/generalProps";
import { Route, useRoute } from "@react-navigation/native";
import { labels } from "../utils/labels";
import { screenName } from "../utils/screenName";
import {
  H6fontBoldPrimary,
  H6fontBoldWhite,
  H7fontMediumPrimary,
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
import { setDoc, doc } from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signOut,
  updateEmail,
  updatePassword,
} from "firebase/auth";
import { MaterialIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { handleSignOut } from "../utils/handleSignOut";
import i18n, { languageCode } from "../../i18n";
import {
  ICountry,
  PhoneInput,
  getCountryByCca2,
} from "react-native-international-phone-number";
import CustomLoader from "../components/customLoader";
import { TouchableWithoutFeedback } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  handleChangeEmail,
  handleChangePassword,
  handleDeleteAccount,
  handleLogout,
} from "../utils/authUtils";
import CheckCurrentPasswordModal from "../components/CheckCurrentPasswordModal";
import SnackBar from "../components/SnackBar";
import GreetingBar from "../components/UpperGreetingBar/GreetingBar";
import CheckCurrentPasswordModalDelete from "../components/CheckPassDelete/CheckPasswordModalDelete";
import {
  handleDeleteFirestore,
  handleUpdateFirestore,
  userLocation,
} from "../utils/firestoreUtils";
import { useAuth } from "../context/AuthContext";
import { usePushNotifications } from "../hooks/usePushNotifications";

interface Props extends GeneralProps {
  route: Route<string, object | undefined>;
}

const TarrotSettings: React.FC<Props> = ({ navigation }): JSX.Element => {
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
    reset,
  } = useForm();

  const passwordValue = watch(formKeys.password);
  const emailValue = watch(formKeys.email);
  const firstNameValue = watch(formKeys.firstName);
  const lastNameValue = watch(formKeys.lastName);

  const route = useRoute();
  const { setAsGuestUser, isGuestUser, userData, setUserData } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [registerType, setRegisterType] = useState("email");
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisibleDelete, setModalVisibleDelete] = useState(false);
  const [showSnackBar, setShowSnackback] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");
  const {isGranted, openNotificationSettings} = usePushNotifications()

  let pwd = watch("password");
  const auth = authentication;

  const [selectedCountry, setSelectedCountry] = useState<undefined | ICountry>(
    getCountryByCca2("RO")
  );

  function handleSelectedCountry(country: ICountry) {
    setSelectedCountry(country);
  }

  const handleDeleteModal = () => {
    setModalVisibleDelete(!modalVisibleDelete);
  };

  const handleDelete = () => {
    const userLocation = `Users/${
      userData.owner_uid ? userData.owner_uid : ""
    }`; // Calea către document
    handleDeleteFirestore(userLocation, currentPassword).then(() => {
      setSnackMessage("Accound deleted succesfully");
      setShowSnackback(!showSnackBar);
      navigation.navigate(screenName.SignInScreenClinic);
    });
  };

  const handleResetForm = () => {
    reset({
      email: "",
      mobileNo: "",
      firstName: "",
      lastName: "",
      password: "",
      confirmPassword: "",
    });
  };

  const onsubmit = (detaila) => {
    let copyUserData = { ...userData };
    console.log("asas", currentPassword);
    console.log("asas", currentPassword.length);

    //change password
    if (passwordValue && currentPassword.length == 0) {
      console.log("first");
      setModalVisible(true);
    } else if (passwordValue && currentPassword.length > 0) {
      console.log("second");
      handleChangePassword(currentPassword, passwordValue).then(() => {
        setSnackMessage("Password changed successfully");
        setShowSnackback(!showSnackBar);
        setModalVisible(!modalVisible);
        handleResetForm();
      });
    }
    //change email
    if (emailValue && currentPassword.length == 0) {
      console.log("first");
      setModalVisible(true);
    } else if (emailValue && currentPassword.length > 0) {
      console.log("second");
      handleChangeEmail(currentPassword, emailValue).then(() => {
        setSnackMessage(
          "Please check your new e-mail inbox or spam to verify the new e-mail"
        );
        setShowSnackback(!showSnackBar);
        setModalVisible(!modalVisible);
        handleResetForm();
      });
    }

    if (firstNameValue) {
      // const newData = {
      //   first_name: firstNameValue,
      // };
      copyUserData.first_name = firstNameValue;

      const userLocation = `Users/${
        userData.owner_uid ? userData.owner_uid : ""
      }`; // Calea către document
      setUserData(copyUserData);
      handleUpdateFirestore(userLocation, copyUserData)
        .then(() => {
          console.log("Document successfully updated!");
          setSnackMessage("Name updated successfully");
          setShowSnackback(!showSnackBar);
        })
        .catch((error) => {
          console.error("Error updating document: ", error);
        });
    }
    if (lastNameValue) {
      // const newData = {
      //   ...userData,
      //   last_name: lastNameValue,
      // };

      copyUserData.last_name = lastNameValue;

      const userLocation = `Users/${
        userData.owner_uid ? userData.owner_uid : ""
      }`; // Calea către document
      // setUserData(newData);
      console.log("TEst...here", copyUserData);
      setUserData(copyUserData);
      handleUpdateFirestore(userLocation, copyUserData)
        .then(() => {
          console.log("Document successfully updated!");
          setSnackMessage("Name updated successfully");
          setShowSnackback(!showSnackBar);
        })
        .catch((error) => {
          console.error("Error updating document: ", error);
        });
    }
    console.log(detaila);
  };

  return (
    <TouchableWithoutFeedback onPress={() => console.log("ass")}>
      <Fragment>
        <MainContainer>
          <CustomLoader isLoading={isLoading} />
          <LinearGradient
            colors={[
              colors.gradientLogin1,
              colors.gradientLogin2,
              colors.gradientLogin2,
            ]} // Înlocuiește cu culorile gradientului tău
            style={styles.gradient}
          >
            <ImageBackground
              source={require("../../assets/bg-horizontalLines.png")}
              resizeMode="cover"
              style={{
                flex: 1,
                width: null,
                height: null,
                // alignItems: 'flex-end',
              }}
            >
              <KeyboardAvoidingView
                style={{ flex: 1, marginTop: "10%" }}
                keyboardVerticalOffset={65}
              >
                <View style={styles.subContainer}>
                  {isGuestUser ? (
                    <>
                      <View
                        style={{
                          display: "flex",
                          justifyContent: "space-around",
                          alignItems: "center",
                          height: "100%",
                        }}
                      >
                        <View style={{ height: "30%" }}>
                          <Image
                            source={require("../../assets/createAccount.png")}
                            style={{ width: 300, height: 150 }}
                            resizeMode="contain" // Aceasta va asigura că întreaga imagine se va încadra în spațiul disponibil, păstrând proporțiile.
                          />
                          <Image
                            source={require("../../assets/headerIcon.png")}
                            style={{ width: 300, height: 150, bottom: "20%" }}
                            resizeMode="contain" // Aceasta va asigura că întreaga imagine se va încadra în spațiul disponibil, păstrând proporțiile.
                          />
                        </View>
                        <View
                          style={{
                            height: "70%",
                            paddingTop: "20%",
                            display: "flex",
                            alignItems: "center",
                            width: "100%",
                          }}
                        >
                          <H6fontBoldPrimary style={{ textAlign: "center" }}>
                            {i18n.translate("createAccountCTA")}
                          </H6fontBoldPrimary>

                          <H7fontMediumPrimary
                            style={{ textAlign: "center", marginTop: "10%" }}
                          >
                            {i18n.translate("createAccountCTAMessage")}
                          </H7fontMediumPrimary>
                          <View style={{width:"100%", justifyContent:"center", alignItems:"center", height:"50%"}}>
                          <Button
                            disabled={false}
                            funCallback={() => {
                              handleLogout().then(() => {
                                setAsGuestUser(false).then(() => {
                                  navigation.navigate(
                                    screenName.SignInScreenClinic as any
                                  );
                                });
                              });
                            }}
                            borderWidth={0.2}
                            bgColor={colors.primary3}
                            // txtColor={colors.primary2}
                            label={i18n.translate("register")}
                            borderColor={colors.white}
                            success={true}
                            style={{ marginTop: "0%", width: "100%" }}
                            txtColor={colors.white}
                          />
                          <Button
                            disabled={false}
                            funCallback={() => {
                              navigation.navigate(
                                screenName.termConditionsClinic as any
                              );
                            }}
                            borderWidth={0.2}
                            bgColor={colors.gradientLogin1}
                            // txtColor={colors.primary2}
                            label={"Privacy Policy & Terms"}
                            borderColor={colors.white}
                            success={true}
                            style={{ marginTop: "0%", width: "70%" }}
                            txtColor={colors.white}
                          />
                          {
                            !isGranted
                            ?
                            <Button
                            disabled={false}
                            funCallback={() => {
                              openNotificationSettings()
                            }}
                            borderWidth={0.2}
                            bgColor={colors.gradientLogin1}
                            // txtColor={colors.primary2}
                            label={"Activate notifications"}
                            borderColor={colors.white}
                            success={true}
                            style={{ marginTop: "0%", width: "70%" }}
                            txtColor={colors.white}
                          />
                            :
                            <Button
                            disabled={false}
                            funCallback={() => {
                              openNotificationSettings()
                            }}
                            borderWidth={0.2}
                            bgColor={colors.gradientLogin1}
                            // txtColor={colors.primary2}
                            label={"Stop notifications"}
                            borderColor={colors.white}
                            success={true}
                            style={{ marginTop: "0%", width: "70%" }}
                            txtColor={colors.white}
                          />
                          }
                        
                          </View>
                        </View>
                      </View>
                    </>
                  ) : (
                    <>
                      <View
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          height: "30%",
                        }}
                      >
                        <H6fontBoldWhite>
                          {i18n.translate("myAccount")}
                        </H6fontBoldWhite>

                        <Image
                          source={require("../../assets/headerIcon.png")}
                          style={{ width: 300, height: 150 }}
                          resizeMode="contain" // Aceasta va asigura că întreaga imagine se va încadra în spațiul disponibil, păstrând proporțiile.
                        />
                      </View>

                      <ScrollView style={{ height: "70%" }}>
                        <View
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <TouchableOpacity
                            onPress={() => {
                              // Traduceți valoarea
                              const translatedHistoryType = i18n.translate(
                                "historyTypePersonalized"
                              );

                              // Navigați cu parametrul
                              navigation.navigate(
                                screenName.historyTarrot as any,
                                {
                                  historyType: translatedHistoryType,
                                }
                              );
                            }}
                          >
                            <H7fontMediumPrimary>
                              {i18n.translate("historyPersonalized")}
                            </H7fontMediumPrimary>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={{ marginTop: 10 }}
                            onPress={() => {
                              // Traduceți valoarea
                              const translatedHistoryType =
                                i18n.translate("historyTypeFuture");

                              // Navigați cu parametrul
                              navigation.navigate(
                                screenName.historyTarrot as any,
                                {
                                  historyType: translatedHistoryType,
                                }
                              );
                            }}
                          >
                            <H7fontMediumPrimary>
                              {i18n.translate("historyFuture")}
                            </H7fontMediumPrimary>
                          </TouchableOpacity>
                        </View>
                        <View>
                          {registerType === "email" && (
                            <Controller
                              name={formKeys.firstName}
                              control={control}
                              render={({ field: { onChange, value } }) => (
                                <InputFields
                                  errorMessage={errors[
                                    formKeys.firstName
                                  ]?.message.toString()}
                                  value={value}
                                  onChangeText={onChange}
                                  placeholder={i18n.translate("firstName")}
                                  image={"person"}
                                />
                              )}
                            />
                          )}
                          {registerType === "email" && (
                            <Controller
                              name={formKeys.lastName}
                              control={control}
                              render={({ field: { onChange, value } }) => (
                                <InputFields
                                  errorMessage={errors[
                                    formKeys.lastName
                                  ]?.message.toString()}
                                  value={value}
                                  onChangeText={onChange}
                                  placeholder={i18n.translate("lastName")}
                                  image={"person"}
                                />
                              )}
                            />
                          )}
                          {registerType === "email" && (
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
                                />
                              )}
                              rules={{
                                required: emailValue
                                  ? requiredValidation(i18n.translate("email"))
                                  : undefined,
                                validate: emailValidation,
                              }}
                            />
                          )}

                          {registerType === "email" && (
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
                                  errorMessage={errors[
                                    formKeys.password
                                  ]?.message.toString()}
                                  image={"lock-outline"}
                                />
                              )}
                              rules={{
                                required: passwordValue
                                  ? requiredValidation(
                                      i18n.translate("createPassword")
                                    )
                                  : undefined,
                                minLength: passwordValue
                                  ? minLengthValidation(
                                      validationSchema.password.minLength
                                    )
                                  : undefined,
                                // Poți adăuga aici alte validări pentru complexitate, dacă este necesar.
                              }}
                            />
                          )}

                          {registerType === "email" && (
                            <Controller
                              name={formKeys.confirmPassword}
                              control={control}
                              render={({ field: { onChange, value } }) => (
                                <InputFields
                                  isPassword={true}
                                  value={value}
                                  isSecure={true}
                                  onChangeText={onChange}
                                  placeholder={i18n.translate(
                                    "confirmPassword"
                                  )}
                                  errorMessage={errors[
                                    formKeys.confirmPassword
                                  ]?.message.toString()}
                                  image={"lock-outline"}
                                />
                              )}
                              rules={{
                                validate: passwordValue
                                  ? (value) =>
                                      value === passwordValue ||
                                      i18n.translate("passDontMatch")
                                  : undefined,
                              }}
                            />
                          )}
                        </View>

                        <Button
                          disabled={false}
                          funCallback={handleSubmit(onsubmit)}
                          label={i18n.translate("saveChanges")}
                          success={true}
                          bgColor={colors.primary3}
                          borderColor={colors.white}
                          borderWidth={0.2}
                          txtColor={colors.white}
                        />

                        <Button
                          disabled={false}
                          funCallback={() => {
                            navigation.navigate(
                              screenName.termConditionsClinic as any
                            );
                          }}
                          label={"Privacy Policy & Terms"}
                          success={true}
                          bgColor={colors.gradientLogin2}
                          borderColor={colors.white}
                          borderWidth={0.2}
                          txtColor={colors.black}
                        />

{
                            !isGranted
                            ?
                            <Button
                            disabled={false}
                            funCallback={() => {
                              openNotificationSettings()
                            }}
                            borderWidth={0.2}
                            bgColor={colors.gradientLogin1}
                            // txtColor={colors.primary2}
                            label={"Activate notifications"}
                            borderColor={colors.white}
                            success={true}
                            style={{ marginTop: "0%", width: "100%" }}
                            txtColor={colors.white}
                          />
                            :
                            <Button
                            disabled={false}
                            funCallback={() => {
                              openNotificationSettings()
                            }}
                            borderWidth={0.2}
                            bgColor={colors.gradientLogin1}
                            // txtColor={colors.primary2}
                            label={"Stop notifications"}
                            borderColor={colors.white}
                            success={true}
                            style={{ marginTop: "0%", width: "100%" }}
                            txtColor={colors.white}
                          />
                          }

                        

                        <View>
                          <View style={styles.infoTextViewStyle}>
                            <TouchableOpacity
                              onPress={() => {
                                handleLogout().then(() => {
                                  setAsGuestUser(false).then(() => {
                                    navigation.navigate(
                                      screenName.SignInScreenClinic as any
                                    );
                                  });
                                });
                              }}
                            >
                              <H7fontMediumPrimary>
                                {i18n.translate("logOut")}
                              </H7fontMediumPrimary>
                            </TouchableOpacity>
                          </View>
                          <View style={styles.infoTextViewStyle}>
                            <TouchableOpacity
                              onPress={() =>
                                Alert.alert(
                                  "Are you sure you want to delete your account?",
                                  "You will have to register again",
                                  [
                                    {
                                      text: "Cancel",
                                      onPress: () =>
                                        console.log("Cancel Pressed"),
                                      style: "cancel",
                                    },
                                    {
                                      text: "Delete",
                                      onPress: () => handleDeleteModal(),
                                    },
                                  ]
                                )
                              }
                            >
                              <H7fontMediumPrimary>
                                {i18n.translate("deleteAccount")}
                              </H7fontMediumPrimary>
                            </TouchableOpacity>
                          </View>
                          {/* <View style={styles.borderLineStyle}>
                  <CommonLineView />
                </View> */}
                        </View>
                      </ScrollView>
                    </>
                  )}
                </View>
              </KeyboardAvoidingView>
              <CheckCurrentPasswordModal
                setIsModalVisible={setModalVisible}
                isModalVisible={modalVisible}
                setCurrentPassword={setCurrentPassword}
                handleSubmit={handleSubmit(onsubmit)}
              />
              <CheckCurrentPasswordModalDelete
                setIsModalVisible={setModalVisibleDelete}
                isModalVisible={modalVisibleDelete}
                setCurrentPassword={setCurrentPassword}
                handleSubmit={handleDelete}
              />
              {showSnackBar && (
                <SnackBar
                  showSnackBar={showSnackBar}
                  setShowSnackback={() => setShowSnackback(!showSnackBar)}
                  message={snackMessage}
                  // screen={screenName.SignInScreenClinic}
                  bottom={"13%"}
                />
              )}
            </ImageBackground>
          </LinearGradient>
        </MainContainer>
      </Fragment>
    </TouchableWithoutFeedback>
  );
};
export default TarrotSettings;

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    width: "100%",
    height: "100%",
    paddingBottom: 100,
    // Alte stiluri necesare pentru a pozitiona gradientul după cum este necesar
  },
  subContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 15,
    justifyContent: "center",
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

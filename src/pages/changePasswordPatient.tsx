import React, { Fragment, useState } from "react";
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
import { labels } from "../utils/labels";
import { screenName } from "../utils/screenName";
import { MaterialIcons } from "@expo/vector-icons";
import {
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
import { Ionicons } from "@expo/vector-icons";
import {
  alignItemsCenter,
  mb20,
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
  requiredValidation,
  validationSchema,
} from "../utils/validationConfig";
import { AntDesign } from "@expo/vector-icons";
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
import i18n from "../../i18n";

interface Props extends GeneralProps {
  route: Route<string, object | undefined>;
}

const ChangePasswordPatient: React.FC<Props> = ({
  navigation,
  route,
}): JSX.Element => {
  const [showSnackBar, setShowSnackback] = useState(false);
  const [updatePass, setUpdatedPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const formKeys = {
    curentPassword: "currentPassword",
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
  const user = auth.currentUser;

  const changePassword = async (currentPassword, newPassword) => {
    setIsLoading(true);
    const credential = EmailAuthProvider.credential(
      user.email,
      currentPassword
    );
    await reauthenticateWithCredential(user, credential)
      .then(async () => {
        // User re-authenticated.

        await updatePassword(user, newPassword)
          .then(() => {
            // // Update successful.
            // Alert.alert('Password changed successfuly', '', [

            //   {text: 'OK', onPress: () => navigation.navigate(screenName.ClinicDashBoard)},
            // ]);
            setIsLoading(false);
            setShowSnackback(true);
            // setTimeout(navigation.navigate(screenName.ClinicDashBoard), 1500);
          })
          .catch((error) => {
            setIsLoading(false);
            // An error ocurred
            // ...
            console.log("Error...on update..pass....", error);
          });

        setIsLoading(false);
      })
      .catch((err: FirebaseError) => {
        setIsLoading(false);
        // An error ocurred
        // ...

        if (err.code == "auth/wrong-password") {
          Alert.alert(
            "Wrong current password",
            "The current password you provided is not correct. Please provide your current password",
            [{ text: "OK", onPress: () => console.log("OK Pressed") }]
          );
        } else if (err.code == "auth/too-many-requests") {
          Alert.alert(
            "Too many wrong current password entries",
            "Access changing password has been temporarily disabled due to many failed current password entries. Please logout and login or reset your password to be able to change your password.",
            [
              {
                text: "Logout",
                onPress: () => handleSignOut(navigation, true),
              },
              { text: "OK", onPress: () => console.log("OK Pressed") },
            ]
          );
        }
      });
    setIsLoading(false);
  };

  const onsubmit = async (detaila) => {
    // console.log(detaila)
    await changePassword(detaila.currentPassword, detaila.password);
    //  console.log(updatePass)
    //  if(updatePass){
    //  setShowSnackback(true)
    // console.log(successUpdatePass)
    // setTimeout(navigation.navigate(screenName.ClinicDashBoard), 1300);

    // }
  };
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
                <Controller
                  name={formKeys.curentPassword}
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <InputFields
                      isPassword={true}
                      value={value}
                      isSecure={true}
                      onChangeText={onChange}
                      placeholder={i18n.translate("curentPassword")}
                      errorMessage={errors[
                        formKeys.curentPassword
                      ]?.message.toString()}
                      image={
                        <View style={styles.passwordIconStyle}>
                          <MaterialIcons name="lock" size={27} color="grey" />
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
                  name={formKeys.password}
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <InputFields
                      isPassword={true}
                      value={value}
                      isSecure={true}
                      onChangeText={onChange}
                      placeholder={i18n.translate("newPassword")}
                      errorMessage={errors[
                        formKeys.password
                      ]?.message.toString()}
                      image={
                        <View style={styles.passwordIconStyle}>
                          <MaterialIcons name="lock" size={27} color="grey" />
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
                      placeholder={i18n.translate("confirmNewPassword")}
                      errorMessage={errors[
                        formKeys.confirmPassword
                      ]?.message.toString()}
                      image={
                        <View style={styles.passwordIconStyle}>
                          <MaterialIcons name="lock" size={27} color="grey" />
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

              <View style={pv10}>
                <Button
                  disabled={false}
                  funCallback={handleSubmit(onsubmit)}
                  label={i18n.translate("changePassword")}
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
              Password changed!
            </Snackbar>
          </View>
        </ImageBackground>
      </MainContainer>
    </Fragment>
  );
};
export default ChangePasswordPatient;
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

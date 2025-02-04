import React, { Fragment, useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  Platform,
  Text,
} from "react-native";
import { Button } from "../components/commonButton";

import { InputFields } from "../components/commonInputFields";
import { GeneralProps } from "../interfaces/generalProps";
import { Route } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { MainContainer } from "../components/commonViews";
import { colors } from "../utils/colors";
import i18n from "../../i18n";
import { screenName } from "../utils/screenName";
import { useForm, Controller } from "react-hook-form";
import CustomLoader from "../components/customLoader";
import { H6fontBoldPrimary } from "../components/commonText";
import { handleResetPassword } from "../utils/authUtils";
import { emailValidation, requiredValidation } from "../utils/validationConfig";
import SnackBar from "../components/SnackBar";

interface Props extends GeneralProps {
  route: Route<string, object | undefined>;
}

const ForgotPasswordClinic: React.FC<Props> = ({
  navigation,
  route,
}): JSX.Element => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showSnackBar, setShowSnackback] = useState(false);
  const formKeys = {
    email: "email",
  };

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
    watch,
  } = useForm();

  const onsubmit = (detaila) => {
    console.log(detaila);
    handleResetPassword(detaila.email);
    setShowSnackback(!showSnackBar);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Fragment>
        <MainContainer>
          <CustomLoader isLoading={isLoading} />
          <LinearGradient
            colors={[
              colors.gradientLogin1,
              colors.gradientLogin2,
              colors.gradientLogin3,
            ]} // Înlocuiește cu culorile gradientului tău
            style={styles.gradient}
          >
            <View
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={{ flex: 1 }}
            >
              <View style={styles.subContainer}>
                <View
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "35%",
                    // backgroundColor: "green",
                  }}
                >
                  <H6fontBoldPrimary style={{ position: "relative", top: 20 }}>
                    {i18n.translate("resetPassword")}
                  </H6fontBoldPrimary>

                  <Image
                    source={require("../../assets/headerIcon.png")}
                    style={{
                      width: 300,
                      height: 200,
                      position: "relative",
                      top: 20,
                    }}
                    resizeMode="contain" // Aceasta va asigura că întreaga imagine se va încadra în spațiul disponibil, păstrând proporțiile.
                  />
                </View>

                <View
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    height: "50%",
                    // marginTop: 50,
                  }}
                >
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
                      required: requiredValidation(i18n.translate("email")),
                      validate: emailValidation,
                    }}
                  />

                  <Button
                    disabled={false}
                    funCallback={handleSubmit(onsubmit)}
                    borderWidth={0.2}
                    bgColor={colors.primary2}
                    label={i18n.translate("resetPassword")}
                    borderColor={colors.white}
                    success={true}
                  />

                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate(screenName.SignInScreenClinic as any)
                    }
                    style={styles.backToLogin}
                  >
                    <Text style={styles.backToLoginText}>
                      {i18n.translate("backToLogin")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <SnackBar
              showSnackBar={showSnackBar}
              setShowSnackback={() => setShowSnackback(!showSnackBar)}
              message={"E-mail sent, please check inbox and spam"}
              screen={screenName.SignInScreenClinic}
            />
          </LinearGradient>
        </MainContainer>
      </Fragment>
    </TouchableWithoutFeedback>
  );
};
export default ForgotPasswordClinic;

const styles = StyleSheet.create({
  subContainer: {
    flex: 1,
    paddingHorizontal: 20,
    // paddingVertical: 15,
    justifyContent: "center",
    // backgroundColor: "red",
  },
  gradient: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  headerIconStyle: {
    width: 300,
    height: 200,
  },
  backToLogin: {
    marginTop: 20,
  },
  backToLoginText: {
    color: colors.primary2,
  },
});

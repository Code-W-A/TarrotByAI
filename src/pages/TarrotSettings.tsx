import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  Text,
  ImageBackground,
  KeyboardAvoidingView,
  AppState,
} from "react-native";
import { Button, SocialMediaLogin } from "../components/commonButton";
import { GeneralProps } from "../interfaces/generalProps";
import { Route, useFocusEffect, useRoute } from "@react-navigation/native";
import * as WebBrowser from "expo-web-browser";
import * as Notifications from "expo-notifications";
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
  getCountryByCca2,
} from "react-native-international-phone-number";
import PhoneInput from "react-native-international-phone-number";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePushNotifications } from "../hooks/usePushNotifications";
import {
  getAuthEmailForAdminCheck,
  isAdminEmail,
} from "../features/adminPdf/adminAccess";
import {
  createPremiumBillingPortalSession,
  fetchPremiumPublicConfig,
  PremiumVideoApiError,
} from "../features/video-library/services/premiumVideoApi";
import { hasPremiumAccess } from "../features/video-library/utils/premiumAccess";
import { getPremiumSubscriptionUiState } from "../features/video-library/utils/premiumSubscriptionUi";
import PurchaseSupportModal from "../components/Astral/components/PurchaseSupportModal";

const tr = (key: string, def: string) => {
  const v = String(i18n.translate(key));
  return v && v !== key ? v : def;
};
const NOTIFICATION_REMINDER_LAST_SEEN_KEY = "pushNotifReminderLastSeenAt";
const NOTIFICATION_REMINDER_COOLDOWN_MS = 72 * 60 * 60 * 1000;

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
  const { currentUser, setAsGuestUser, isGuestUser, userData, setUserData, refreshUserDataFromServer } =
    useAuth() as {
      currentUser: unknown;
      setAsGuestUser: (v: boolean) => Promise<unknown>;
      isGuestUser: boolean;
      userData: Record<string, unknown> | null;
      setUserData: (v: unknown) => void;
      refreshUserDataFromServer?: () => Promise<unknown>;
    };
  const adminTapTimestampsRef = useRef<number[]>([]);
  const [currentPassword, setCurrentPassword] = useState("");
  const [registerType, setRegisterType] = useState("email");
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisibleDelete, setModalVisibleDelete] = useState(false);
  const [showSnackBar, setShowSnackback] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");
  const { isGranted, openNotificationSettings, requestNotificationPermission } =
    usePushNotifications();
  const [showNotificationReminder, setShowNotificationReminder] = useState(false);
  const insets = useSafeAreaInsets();
  const [subscriptionSystemEnabled, setSubscriptionSystemEnabled] = useState<
    boolean | null
  >(null);
  const [premiumPortalLoading, setPremiumPortalLoading] = useState(false);
  const [supportModalVisible, setSupportModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        try {
          const cfg = await fetchPremiumPublicConfig();
          if (active) {
            setSubscriptionSystemEnabled(cfg.subscriptionSystemEnabled === true);
          }
        } catch {
          if (active) {
            setSubscriptionSystemEnabled(null);
          }
        }
        try {
          await refreshUserDataFromServer?.();
        } catch {
          /* ignore */
        }
      })();
      return () => {
        active = false;
      };
    }, [refreshUserDataFromServer])
  );

  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      if (next === "active") {
        void refreshUserDataFromServer?.();
      }
    });
    return () => sub.remove();
  }, [refreshUserDataFromServer]);

  useEffect(() => {
    let active = true;

    const syncNotificationReminderVisibility = async () => {
      if (isGranted) {
        if (active) {
          setShowNotificationReminder(false);
        }
        return;
      }

      try {
        const raw = await AsyncStorage.getItem(NOTIFICATION_REMINDER_LAST_SEEN_KEY);
        const lastShownAt = raw ? Number(raw) : 0;
        const now = Date.now();
        const shouldShow =
          !lastShownAt ||
          Number.isNaN(lastShownAt) ||
          now - lastShownAt >= NOTIFICATION_REMINDER_COOLDOWN_MS;

        if (shouldShow) {
          await AsyncStorage.setItem(
            NOTIFICATION_REMINDER_LAST_SEEN_KEY,
            String(now)
          );
        }

        if (active) {
          setShowNotificationReminder(shouldShow);
        }
      } catch {
        if (active) {
          setShowNotificationReminder(true);
        }
      }
    };

    void syncNotificationReminderVisibility();
    return () => {
      active = false;
    };
  }, [isGranted]);

  const handleActivateNotifications = useCallback(async () => {
    try {
      const granted = await requestNotificationPermission?.();
      if (granted) {
        setShowNotificationReminder(false);
        return;
      }
      const { status } = await Notifications.getPermissionsAsync();
      if (status === "denied") {
        openNotificationSettings?.();
      }
    } catch {
      openNotificationSettings?.();
    }
  }, [openNotificationSettings, requestNotificationPermission]);

  const handleNotificationSettingsPress = useCallback(() => {
    openNotificationSettings?.();
  }, [openNotificationSettings]);

  const localeTag = i18n.locale?.split("-")[0] ?? "ro";
  const showPremiumSection =
    subscriptionSystemEnabled === true ||
    subscriptionSystemEnabled === null ||
    hasPremiumAccess(userData);
  const premiumSubUi =
    showPremiumSection && userData
      ? getPremiumSubscriptionUiState(userData, localeTag)
      : null;
  const showPremiumManagementBlock =
    !isGuestUser && Boolean(currentUser) && Boolean(userData) && premiumSubUi != null;

  const openPremiumPortalFlow = async (flow: "default" | "cancel") => {
    if (!currentUser) return;
    setPremiumPortalLoading(true);
    try {
      const { url } = await createPremiumBillingPortalSession(
        flow,
        currentUser as any
      );
      if (!url) {
        throw new Error("Missing portal URL");
      }
      await WebBrowser.openBrowserAsync(url);
      await refreshUserDataFromServer?.();
    } catch (e) {
      const msg =
        e instanceof PremiumVideoApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : "Could not open billing portal.";
      Alert.alert(
        String(i18n.translate("premiumManageErrorTitle")),
        msg
      );
    } finally {
      setPremiumPortalLoading(false);
    }
  };

  const adminEmail = useMemo(
    () => getAuthEmailForAdminCheck(currentUser?.email, userData?.email),
    [currentUser?.email, userData?.email]
  );
  const showFloatingAdminButton = useMemo(
    () => isAdminEmail(adminEmail),
    [adminEmail]
  );

  const handleFloatingAdminTap = () => {
    if (!showFloatingAdminButton) {
      return;
    }

    const now = Date.now();
    const recentTaps = adminTapTimestampsRef.current.filter(
      (timestamp) => now - timestamp <= 1000
    );
    recentTaps.push(now);
    adminTapTimestampsRef.current = recentTaps;

    if (recentTaps.length >= 3) {
      adminTapTimestampsRef.current = [];
      navigation.navigate(screenName.AdminPdfGate as any);
    }
  };

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
      userData?.owner_uid ? userData?.owner_uid : ""
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
        userData?.owner_uid ? userData?.owner_uid : ""
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
        userData?.owner_uid ? userData?.owner_uid : ""
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
        <MainContainer secondary={false} style={{ flex: 1 }}>
          <CustomLoader isLoading={isLoading} opacity={1} backgroundColor="transparent" backgroundSet={false} text="" />
          <ImageBackground
            source={require("../../assets/dashboardbg.jpg")}
            style={{ flex: 1, width: '100%', height: '100%' }}
            imageStyle={{ opacity: 1 }}
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
                      <View
                        style={{
                          height: "70%",
                          paddingTop: "20%",
                          display: "flex",
                          alignItems: "center",
                          width: "100%",
                        }}
                      >
                        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                          <H6fontBoldPrimary>
                            {i18n.translate("createAccountCTA")}
                          </H6fontBoldPrimary>
                        </View>

                        <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: "10%" }}>
                          <H7fontMediumPrimary>
                            {i18n.translate("createAccountCTAMessage")}
                          </H7fontMediumPrimary>
                        </View>
                        <View
                          style={{
                            width: "100%",
                            justifyContent: "center",
                            alignItems: "center",
                            height: "50%",
                          }}
                        >
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
                            bgColor={colors.gold}
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
                            label={"Privacy Policy & Terms"}
                            success={true}
                            bgColor={colors.gold}
                            borderColor={colors.white}
                            borderWidth={0.2}
                            txtColor={colors.white}
                            style={{ marginTop: 16, width: "100%" }}
                          />
                          {!isGranted && showNotificationReminder ? (
                            <View style={styles.notificationReminderCard}>
                              <Text style={styles.notificationReminderTitle}>
                                {tr("notificationsReminderTitle", "Enable notifications")}
                              </Text>
                              <Text style={styles.notificationReminderText}>
                                {tr(
                                  "notificationsReminderBody",
                                  "Turn on notifications to receive updates and reminders on time."
                                )}
                              </Text>
                            </View>
                          ) : null}
                          {!isGranted ? (
                            <Button
                              disabled={false}
                              funCallback={handleActivateNotifications}
                              borderWidth={0.2}
                              bgColor={colors.gold}
                              label={tr(
                                "notificationsActivateCta",
                                "Activate notifications"
                              )}
                              borderColor={colors.white}
                              success={true}
                              style={{ marginTop: 16, width: "100%" }}
                              txtColor={colors.white}
                            />
                          ) : (
                            <Button
                              disabled={false}
                              funCallback={handleNotificationSettingsPress}
                              borderWidth={0.2}
                              bgColor={colors.gold}
                              label={tr(
                                "notificationsDisableCta",
                                "Stop notifications"
                              )}
                              borderColor={colors.white}
                              success={true}
                              style={{ marginTop: 16, width: "100%" }}
                              txtColor={colors.white}
                            />
                          )}
                          <Button
                            disabled={false}
                            funCallback={() => setSupportModalVisible(true)}
                            borderWidth={0.2}
                            bgColor={colors.gold}
                            label={String(i18n.translate("settingsSupportButton"))}
                            borderColor={colors.white}
                            success={true}
                            style={{ marginTop: 16, width: "100%" }}
                            txtColor={colors.white}
                          />
                        </View>
                      </View>
                    </View>
                  </>
                ) : (
                  <View style={{ flex: 1, width: "100%" }}>
                    <View
                      style={{
                        paddingVertical: 16,
                        alignItems: "center",
                        flexShrink: 0,
                      }}
                    >
                      <H6fontBoldWhite>
                        {i18n.translate("myAccount")}
                      </H6fontBoldWhite>
                    </View>

                    <ScrollView
                      style={{ flex: 1 }}
                      contentContainerStyle={[
                        styles.settingsScrollContent,
                        {
                          paddingBottom:
                            24 + insets.bottom + 90,
                        },
                      ]}
                      keyboardShouldPersistTaps="handled"
                      showsVerticalScrollIndicator={false}
                    >
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
                        {registerType === "email" &&
                          !userData?.auth_provider && (
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
                                  ? requiredValidation(
                                      i18n.translate("email")
                                    )
                                  : undefined,
                                validate: emailValidation,
                              }}
                            />
                          )}

                        {registerType === "email" &&
                          !userData?.auth_provider && (
                            <Controller
                              name={formKeys.password}
                              control={control}
                              render={({ field: { onChange, value } }) => (
                                <InputFields
                                  isPassword={true}
                                  value={value}
                                  isSecure={true}
                                  onChangeText={onChange}
                                  placeholder={i18n.translate(
                                    "createPassword"
                                  )}
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

                        {registerType === "email" &&
                          !userData?.auth_provider && (
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
                      <CommonLineView />
                      <View style={styles.settingsActions}>
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
                          bgColor={colors.gold}
                          borderColor={colors.white}
                          borderWidth={0.2}
                          txtColor={colors.white}
                          style={{ marginTop: 16, width: "100%" }}
                        />
                        {!isGranted && showNotificationReminder ? (
                          <View style={styles.notificationReminderCard}>
                            <Text style={styles.notificationReminderTitle}>
                              {tr("notificationsReminderTitle", "Enable notifications")}
                            </Text>
                            <Text style={styles.notificationReminderText}>
                              {tr(
                                "notificationsReminderBody",
                                "Turn on notifications to receive updates and reminders on time."
                              )}
                            </Text>
                          </View>
                        ) : null}

                        {!isGranted ? (
                          <Button
                            disabled={false}
                            funCallback={handleActivateNotifications}
                            borderWidth={0.2}
                            bgColor={colors.gold}
                            label={tr(
                              "notificationsActivateCta",
                              "Activate notifications"
                            )}
                            borderColor={colors.white}
                            success={true}
                            style={{ marginTop: 16, width: "100%" }}
                            txtColor={colors.white}
                          />
                        ) : (
                          <Button
                            disabled={false}
                            funCallback={handleNotificationSettingsPress}
                            borderWidth={0.2}
                            bgColor={colors.gold}
                            label={tr(
                              "notificationsDisableCta",
                              "Stop notifications"
                            )}
                            borderColor={colors.white}
                            success={true}
                            style={{ marginTop: 16, width: "100%" }}
                            txtColor={colors.white}
                          />
                        )}
                        <Button
                          disabled={false}
                          funCallback={() => setSupportModalVisible(true)}
                          borderWidth={0.2}
                          bgColor={colors.gold}
                          label={String(i18n.translate("settingsSupportButton"))}
                          borderColor={colors.white}
                          success={true}
                          style={{ marginTop: 16, width: "100%" }}
                          txtColor={colors.white}
                        />
                        {showPremiumManagementBlock && premiumSubUi ? (
                          <>
                            {premiumSubUi.scheduledCancelBanner ? (
                              <>
                                <H6fontBoldPrimary
                                  style={{
                                    textAlign: "center",
                                    marginTop: 16,
                                    marginBottom: 8,
                                  }}
                                >
                                  {tr(
                                    "settingsPremiumScheduledCancelTitle",
                                    ""
                                  )}
                                </H6fontBoldPrimary>
                                <H7fontMediumPrimary
                                  style={{
                                    textAlign: "center",
                                    marginBottom: 16,
                                  }}
                                >
                                  {String(
                                    i18n.translate(
                                      "settingsPremiumScheduledCancelBody",
                                      {
                                        date:
                                          premiumSubUi.periodEndFormatted ||
                                          "—",
                                      }
                                    )
                                  )}
                                </H7fontMediumPrimary>
                              </>
                            ) : null}
                            {premiumSubUi.canceledWithResidualAccess &&
                            !premiumSubUi.scheduledCancelBanner ? (
                              <H7fontMediumPrimary
                                style={{
                                  textAlign: "center",
                                  marginTop: 16,
                                  marginBottom: 16,
                                }}
                              >
                                {String(
                                  i18n.translate(
                                    "settingsPremiumCanceledAccessUntil",
                                    {
                                      date:
                                        premiumSubUi.periodEndFormatted ||
                                        "—",
                                    }
                                  )
                                )}
                              </H7fontMediumPrimary>
                            ) : null}
                            {premiumSubUi.premiumNow &&
                            !premiumSubUi.showRenewHint &&
                            !premiumSubUi.scheduledCancelBanner &&
                            !premiumSubUi.canceledWithResidualAccess ? (
                              <H7fontMediumPrimary
                                style={{
                                  textAlign: "center",
                                  marginTop: 16,
                                  marginBottom: 16,
                                }}
                              >
                                {String(
                                  i18n.translate("settingsPremiumActiveUntil", {
                                    date:
                                      premiumSubUi.periodEndFormatted || "—",
                                  })
                                )}
                              </H7fontMediumPrimary>
                            ) : null}
                            {premiumSubUi.showRenewHint ? (
                              <H7fontMediumPrimary
                                style={{
                                  textAlign: "center",
                                  marginTop: 16,
                                  marginBottom: 12,
                                }}
                              >
                                {tr(
                                  "settingsPremiumRenewHint",
                                  "You don't have an active premium subscription."
                                )}
                              </H7fontMediumPrimary>
                            ) : null}
                            {premiumSubUi.showRenewHint ? (
                              <Button
                                disabled={false}
                                funCallback={() => {
                                  navigation.navigate(
                                    screenName.VideoPremiumSubscription as any
                                  );
                                }}
                                borderWidth={0.2}
                                bgColor={colors.gold}
                                label={tr(
                                  "settingsPremiumRenewCta",
                                  "Subscribe again"
                                )}
                                borderColor={colors.white}
                                success={true}
                                style={{ marginTop: 8, width: "100%" }}
                                txtColor={colors.white}
                              />
                            ) : null}
                            {premiumSubUi.scheduledCancelBanner ? (
                              <>
                                <Button
                                  disabled={premiumPortalLoading}
                                  funCallback={() => {
                                    void openPremiumPortalFlow("default");
                                  }}
                                  borderWidth={0.2}
                                  bgColor={colors.gold}
                                  label={tr(
                                    "settingsPremiumReactivateCta",
                                    "Reactivate subscription"
                                  )}
                                  borderColor={colors.white}
                                  success={true}
                                  style={{ marginTop: 8, width: "100%" }}
                                  txtColor={colors.white}
                                />
                                <Button
                                  disabled={premiumPortalLoading}
                                  funCallback={() => {
                                    void openPremiumPortalFlow("default");
                                  }}
                                  borderWidth={0.2}
                                  bgColor={colors.primary3}
                                  label={tr(
                                    "settingsPremiumOpenBillingPortal",
                                    "Open Stripe billing portal"
                                  )}
                                  borderColor={colors.white}
                                  success={true}
                                  style={{ marginTop: 16, width: "100%" }}
                                  txtColor={colors.white}
                                />
                              </>
                            ) : null}
                            {premiumSubUi.canceledWithResidualAccess &&
                            !premiumSubUi.scheduledCancelBanner ? (
                              <Button
                                disabled={premiumPortalLoading}
                                funCallback={() => {
                                  void openPremiumPortalFlow("default");
                                }}
                                borderWidth={0.2}
                                bgColor={colors.gold}
                                label={tr(
                                  "settingsPremiumOpenBillingPortal",
                                  "Open Stripe billing portal"
                                )}
                                borderColor={colors.white}
                                success={true}
                                style={{ marginTop: 8, width: "100%" }}
                                txtColor={colors.white}
                              />
                            ) : null}
                            {premiumSubUi.showCancelButton ? (
                              <Button
                                disabled={premiumPortalLoading}
                                funCallback={() => {
                                  void openPremiumPortalFlow("cancel");
                                }}
                                borderWidth={0.2}
                                bgColor={colors.primary3}
                                label={tr(
                                  "premiumCancelSubscription",
                                  "Cancel subscription"
                                )}
                                borderColor={colors.white}
                                success={true}
                                style={{ marginTop: 16, width: "100%" }}
                                txtColor={colors.white}
                              />
                            ) : null}
                            {!premiumSubUi.showRenewHint &&
                            !premiumSubUi.scheduledCancelBanner &&
                            !premiumSubUi.canceledWithResidualAccess &&
                            !premiumSubUi.showCancelButton ? (
                              <Button
                                disabled={premiumPortalLoading}
                                funCallback={() => {
                                  void openPremiumPortalFlow("default");
                                }}
                                borderWidth={0.2}
                                bgColor={colors.gold}
                                label={tr(
                                  "settingsPremiumOpenBillingPortal",
                                  "Open Stripe billing portal"
                                )}
                                borderColor={colors.white}
                                success={true}
                                style={{ marginTop: 16, width: "100%" }}
                                txtColor={colors.white}
                              />
                            ) : null}
                          </>
                        ) : null}
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
                      </View>
                    </ScrollView>
                  </View>
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
            <PurchaseSupportModal
              visible={supportModalVisible}
              onDismiss={() => setSupportModalVisible(false)}
              defaultProductCode="other"
              language={localeTag}
              supportScreenName="TarrotSettings"
              supportSourceSection="settings_app_support"
              titleTranslationKey="settingsSupportModalTitle"
              introTranslationKey="settingsSupportModalIntro"
            />
            {showSnackBar && (
              <SnackBar
                showSnackBar={showSnackBar}
                setShowSnackback={() => setShowSnackback(!showSnackBar)}
                message={snackMessage}
                bottom={"13%"}
              />
            )}
            {showFloatingAdminButton ? (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleFloatingAdminTap}
                style={styles.floatingAdminButton}
              >
                <MaterialIcons name="settings" size={22} color="#FFD700" />
              </TouchableOpacity>
            ) : null}
          </ImageBackground>
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
  },
  subContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 15,
    justifyContent: "center",
  },
  settingsScrollContent: {
    flexGrow: 1,
  },
  settingsActions: {
    width: "100%",
    alignSelf: "center",
    paddingTop: 24,
    alignItems: "center",
  },
  notificationReminderCard: {
    width: "100%",
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(191, 167, 106, 0.4)",
    backgroundColor: "rgba(191, 167, 106, 0.12)",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  notificationReminderTitle: {
    textAlign: "center",
    marginBottom: 6,
    color: colors.primary3,
    fontWeight: "700",
    fontSize: 14,
  },
  notificationReminderText: {
    textAlign: "center",
    lineHeight: 18,
    color: colors.primary3,
    fontSize: 13,
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
  inputWrapperNew: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#FFD700',
    borderRadius: 22,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginBottom: 18,
    width: '100%',
    shadowColor: '#FFD700',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  inputTextNew: {
    color: '#FFD700',
    fontSize: 17,
    fontFamily: 'Lora',
    backgroundColor: 'transparent',
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  buttonGold: {
    width: '100%',
    borderRadius: 22,
    marginBottom: 12,
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
    borderWidth: 1.5,
    shadowColor: '#FFD700',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonCream: {
    width: '100%',
    borderRadius: 22,
    marginBottom: 12,
    backgroundColor: '#FFFBEA',
    borderColor: '#FFD700',
    borderWidth: 1.5,
    shadowColor: '#FFD700',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonTextGold: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'LoraBold',
    letterSpacing: 0.1,
  },
  buttonTextCream: {
    color: '#FFD700',
    fontSize: 18,
    fontFamily: 'LoraBold',
    letterSpacing: 0.1,
  },
  floatingAdminButton: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#FFD700",
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
});

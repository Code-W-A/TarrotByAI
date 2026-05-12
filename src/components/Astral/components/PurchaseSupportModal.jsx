import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Dropdown } from "react-native-element-dropdown";
import { getFunctions, httpsCallable } from "firebase/functions";
import i18n from "../../../../i18n";
import { sendPurchaseSupportEmail } from "../../../utils/constant";

const PRIVACY_VERSION = "2026-04-05";
const DESCRIPTION_MIN_LENGTH = 10;
const DEFAULT_PRODUCT_CODE = "natal_astrogram";
const SUPPORT_SCREEN_NAME = "PersonsScreen";
const SUPPORT_SOURCE_SECTION = "digital_astrology_update_card";
const INITIAL_FORM_STATE = {
  fullName: "",
  replyEmail: "",
  phone: "",
  issueDescription: "",
  productCode: DEFAULT_PRODUCT_CODE,
  transactionId: "",
  analysisId: "",
  errorRef: "",
  gdprAccepted: false,
  ownerUid: "",
};

const parseStoredJson = (value) => {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
};

const sanitizeSingleLine = (value, maxLength = 240) => {
  const normalized = String(value || "")
    .replace(/\s+/g, " ")
    .trim();

  return normalized.slice(0, maxLength);
};

const sanitizeMultiline = (value, maxLength = 2000) => {
  const normalized = String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return normalized.slice(0, maxLength);
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const getAppVersion = () =>
  String(
    Constants.expoConfig?.version ||
      Constants.manifest2?.extra?.expoClient?.version ||
      Constants.manifest?.version ||
      "unknown"
  ).trim();

const PurchaseSupportModal = ({
  visible,
  onDismiss,
  defaultProductCode = DEFAULT_PRODUCT_CODE,
  language = "ro",
  supportScreenName = SUPPORT_SCREEN_NAME,
  supportSourceSection = SUPPORT_SOURCE_SECTION,
  titleTranslationKey = "purchaseSupportTitle",
  introTranslationKey = "purchaseSupportIntro",
}) => {
  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const languageCode = useMemo(
    () => String(language || i18n.locale || "ro").trim().toLowerCase(),
    [language]
  );

  const productOptions = useMemo(
    () => [
      {
        label: i18n.translate("purchaseSupportProductNatal"),
        value: "natal_astrogram",
      },
      {
        label: i18n.translate("purchaseSupportProductOtherNatal"),
        value: "other_person_astrogram",
      },
      {
        label: i18n.translate("purchaseSupportProductSynastryPersonal"),
        value: "synastry_personal",
      },
      {
        label: i18n.translate("purchaseSupportProductSynastryOthers"),
        value: "synastry_others",
      },
      {
        label: i18n.translate("purchaseSupportProductDailyHoroscope"),
        value: "daily_horoscope",
      },
      {
        label: i18n.translate("purchaseSupportProductPremiumVideoSubscription"),
        value: "premium_video_subscription",
      },
      {
        label: i18n.translate("purchaseSupportProductOther"),
        value: "other",
      },
    ],
    [languageCode]
  );

  useEffect(() => {
    if (!visible) {
      return undefined;
    }

    let isCancelled = false;

    const hydrateForm = async () => {
      const nextForm = {
        ...INITIAL_FORM_STATE,
        productCode: defaultProductCode || DEFAULT_PRODUCT_CODE,
      };

      try {
        const [storedUserDetails, storedUserData] = await Promise.all([
          AsyncStorage.getItem("userDetails"),
          AsyncStorage.getItem("userData"),
        ]);

        const userDetails = parseStoredJson(storedUserDetails) || {};
        const userData = parseStoredJson(storedUserData) || {};

        const fullNameFromUserData = sanitizeSingleLine(userData.full_name, 120);
        const fullNameFromUserDetails = sanitizeSingleLine(
          [userDetails.firstName, userDetails.lastName].filter(Boolean).join(" "),
          120
        );

        nextForm.fullName = fullNameFromUserData || fullNameFromUserDetails;
        nextForm.replyEmail = sanitizeSingleLine(
          userDetails.email || userData.email,
          120
        ).toLowerCase();
        nextForm.phone = sanitizeSingleLine(
          userDetails.phone || userData.phone,
          40
        );
        nextForm.ownerUid = sanitizeSingleLine(
          userData.owner_uid || userDetails.owner_uid,
          120
        );
      } catch (error) {
        console.error("[PurchaseSupportModal] prefill failed", error);
      }

      if (!isCancelled) {
        setForm(nextForm);
      }
    };

    hydrateForm();

    return () => {
      isCancelled = true;
    };
  }, [defaultProductCode, visible]);

  const handleChange = (field, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    const replyEmail = sanitizeSingleLine(form.replyEmail, 120).toLowerCase();
    const issueDescription = sanitizeMultiline(form.issueDescription, 2000);

    if (!replyEmail) {
      Alert.alert(
        i18n.translate("purchaseSupportFailureTitle"),
        i18n.translate("purchaseSupportEmailRequired")
      );
      return;
    }

    if (!isValidEmail(replyEmail)) {
      Alert.alert(
        i18n.translate("purchaseSupportFailureTitle"),
        i18n.translate("purchaseSupportEmailInvalid")
      );
      return;
    }

    if (!issueDescription) {
      Alert.alert(
        i18n.translate("purchaseSupportFailureTitle"),
        i18n.translate("purchaseSupportDescriptionRequired")
      );
      return;
    }

    if (issueDescription.length < DESCRIPTION_MIN_LENGTH) {
      Alert.alert(
        i18n.translate("purchaseSupportFailureTitle"),
        i18n.translate("purchaseSupportDescriptionTooShort")
      );
      return;
    }

    if (!form.gdprAccepted) {
      Alert.alert(
        i18n.translate("purchaseSupportFailureTitle"),
        i18n.translate("purchaseSupportGdprRequired")
      );
      return;
    }

    const submittedAt = new Date().toISOString();

    try {
      setIsSubmitting(true);
      const functions = getFunctions();
      const sendSupportEmailFn = httpsCallable(
        functions,
        sendPurchaseSupportEmail
      );

      const response = await sendSupportEmailFn({
        fullName: sanitizeSingleLine(form.fullName, 120),
        replyEmail,
        phone: sanitizeSingleLine(form.phone, 40),
        issueDescription,
        productCode: sanitizeSingleLine(form.productCode, 40) || DEFAULT_PRODUCT_CODE,
        transactionId: sanitizeSingleLine(form.transactionId, 120),
        analysisId: sanitizeSingleLine(form.analysisId, 120),
        errorRef: sanitizeSingleLine(form.errorRef, 120),
        gdprAccepted: true,
        gdprAcceptedAt: submittedAt,
        privacyVersion: PRIVACY_VERSION,
        screenName: supportScreenName,
        sourceSection: supportSourceSection,
        language: languageCode || "ro",
        platform: `${Platform.OS} ${String(Platform.Version)}`,
        appVersion: getAppVersion(),
        ownerUid: sanitizeSingleLine(form.ownerUid, 120),
        submittedAt,
      });

      const responseData = response?.data || {};

      if (!responseData.success || !responseData.ticketRef) {
        throw new Error("Support email response missing ticketRef");
      }

      Alert.alert(
        i18n.translate("purchaseSupportSuccessTitle"),
        `${i18n.translate("purchaseSupportSuccessMessage")} ${responseData.ticketRef}`
      );

      setForm({
        ...INITIAL_FORM_STATE,
        productCode: defaultProductCode || DEFAULT_PRODUCT_CODE,
      });
      onDismiss();
    } catch (error) {
      console.error("[PurchaseSupportModal] submit failed", error);
      Alert.alert(
        i18n.translate("purchaseSupportFailureTitle"),
        i18n.translate("purchaseSupportFailureMessage")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={() => {
        if (!isSubmitting) {
          onDismiss();
        }
      }}
      statusBarTranslucent
      presentationStyle="overFullScreen"
    >
      <View style={styles.overlay}>
        <View style={styles.modalWrapper}>
          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.modalScrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>
                {i18n.translate(titleTranslationKey)}
              </Text>
              <Text style={styles.modalIntro}>
                {i18n.translate(introTranslationKey)}
              </Text>

              <Text style={styles.fieldLabel}>{i18n.translate("email")}</Text>
              <TextInput
                style={styles.input}
                value={form.replyEmail}
                onChangeText={(value) => handleChange("replyEmail", value)}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder={i18n.translate("email")}
                placeholderTextColor="#8B7F75"
                maxLength={120}
              />

              <Text style={styles.fieldLabel}>
                {i18n.translate("purchaseSupportNameField")}
              </Text>
              <TextInput
                style={styles.input}
                value={form.fullName}
                onChangeText={(value) => handleChange("fullName", value)}
                placeholder={i18n.translate("purchaseSupportNameField")}
                placeholderTextColor="#8B7F75"
                maxLength={120}
              />

              <Text style={styles.fieldLabel}>
                {i18n.translate("purchaseSupportPhoneField")}
              </Text>
              <TextInput
                style={styles.input}
                value={form.phone}
                onChangeText={(value) => handleChange("phone", value)}
                placeholder={i18n.translate("purchaseSupportPhoneField")}
                placeholderTextColor="#8B7F75"
                keyboardType="phone-pad"
                maxLength={40}
              />

              <Text style={styles.fieldLabel}>
                {i18n.translate("purchaseSupportProductField")}
              </Text>
              <Dropdown
                style={styles.dropdown}
                containerStyle={styles.dropdownContainer}
                placeholderStyle={styles.dropdownPlaceholder}
                selectedTextStyle={styles.dropdownSelectedText}
                itemTextStyle={styles.dropdownItemText}
                data={productOptions}
                labelField="label"
                valueField="value"
                value={form.productCode}
                placeholder={i18n.translate("purchaseSupportProductPlaceholder")}
                onChange={(item) => handleChange("productCode", item.value)}
              />

              <Text style={styles.fieldLabel}>
                {i18n.translate("purchaseSupportTransactionIdField")}
              </Text>
              <TextInput
                style={styles.input}
                value={form.transactionId}
                onChangeText={(value) => handleChange("transactionId", value)}
                placeholder={i18n.translate("purchaseSupportTransactionIdField")}
                placeholderTextColor="#8B7F75"
                autoCapitalize="none"
                maxLength={120}
              />

              <Text style={styles.fieldLabel}>
                {i18n.translate("purchaseSupportAnalysisIdField")}
              </Text>
              <TextInput
                style={styles.input}
                value={form.analysisId}
                onChangeText={(value) => handleChange("analysisId", value)}
                placeholder={i18n.translate("purchaseSupportAnalysisIdField")}
                placeholderTextColor="#8B7F75"
                autoCapitalize="none"
                maxLength={120}
              />

              <Text style={styles.fieldLabel}>
                {i18n.translate("purchaseSupportErrorRefField")}
              </Text>
              <TextInput
                style={styles.input}
                value={form.errorRef}
                onChangeText={(value) => handleChange("errorRef", value)}
                placeholder={i18n.translate("purchaseSupportErrorRefField")}
                placeholderTextColor="#8B7F75"
                autoCapitalize="none"
                maxLength={120}
              />

              <Text style={styles.fieldLabel}>
                {i18n.translate("purchaseSupportIssueDescriptionField")}
              </Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                value={form.issueDescription}
                onChangeText={(value) =>
                  handleChange("issueDescription", value)
                }
                placeholder={i18n.translate(
                  "purchaseSupportIssueDescriptionPlaceholder"
                )}
                placeholderTextColor="#8B7F75"
                multiline
                textAlignVertical="top"
                maxLength={2000}
              />

              <TouchableOpacity
                style={styles.checkboxRow}
                activeOpacity={0.8}
                onPress={() =>
                  handleChange("gdprAccepted", !form.gdprAccepted)
                }
              >
                <View
                  style={[
                    styles.checkbox,
                    form.gdprAccepted && styles.checkboxChecked,
                  ]}
                >
                  {form.gdprAccepted ? (
                    <Text style={styles.checkboxCheckmark}>✓</Text>
                  ) : null}
                </View>
                <Text style={styles.checkboxText}>
                  {i18n.translate("purchaseSupportGdprConsent")}
                </Text>
              </TouchableOpacity>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={onDismiss}
                  disabled={isSubmitting}
                >
                  <Text style={styles.cancelButtonText}>
                    {i18n.translate("purchaseSupportCancel")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.submitButton]}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <View style={styles.loadingRow}>
                      <ActivityIndicator size="small" color="#FFFFFF" />
                      <Text style={styles.submitButtonText}>
                        {i18n.translate("purchaseSupportSending")}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.submitButtonText}>
                      {i18n.translate("purchaseSupportSubmit")}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default PurchaseSupportModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    paddingVertical: 24,
  },
  modalWrapper: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    maxHeight: "92%",
  },
  modalScroll: {
    width: "100%",
  },
  modalScrollContent: {
    paddingBottom: 18,
    alignItems: "center",
  },
  modalContainer: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#FAF7F2",
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "#FFD700",
    padding: 22,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFD700",
    textAlign: "center",
    marginBottom: 12,
    fontFamily: "Lora",
  },
  modalIntro: {
    fontSize: 14,
    lineHeight: 20,
    color: "#2C2C2C",
    marginBottom: 16,
    fontFamily: "Lora",
  },
  fieldLabel: {
    fontSize: 14,
    color: "#2C2C2C",
    marginBottom: 6,
    fontFamily: "Lora",
  },
  input: {
    backgroundColor: "#FFFBE6",
    borderWidth: 1,
    borderColor: "#FFD700",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontFamily: "Lora",
    color: "#131523",
    fontSize: 15,
  },
  multilineInput: {
    minHeight: 120,
  },
  dropdown: {
    backgroundColor: "#FFFBE6",
    borderWidth: 1,
    borderColor: "#FFD700",
    borderRadius: 8,
    paddingHorizontal: 12,
    minHeight: 48,
    marginBottom: 12,
  },
  dropdownContainer: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FFD700",
    backgroundColor: "#FFFBE6",
  },
  dropdownPlaceholder: {
    color: "#8B7F75",
    fontFamily: "Lora",
    fontSize: 15,
  },
  dropdownSelectedText: {
    color: "#131523",
    fontFamily: "Lora",
    fontSize: 15,
  },
  dropdownItemText: {
    color: "#131523",
    fontFamily: "Lora",
    fontSize: 15,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 6,
    marginBottom: 18,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#FFD700",
    borderRadius: 4,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: "#FFD700",
  },
  checkboxCheckmark: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  checkboxText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: "#2C2C2C",
    fontFamily: "Lora",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  cancelButton: {
    backgroundColor: "#F1E7C9",
    borderWidth: 1,
    borderColor: "#D4B24E",
  },
  submitButton: {
    backgroundColor: "#D4AF37",
  },
  cancelButtonText: {
    color: "#5C4B1D",
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Lora",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Lora",
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});

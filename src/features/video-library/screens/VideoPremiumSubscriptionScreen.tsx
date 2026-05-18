import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { useStripe } from "@stripe/stripe-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Dropdown } from "react-native-element-dropdown";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import i18n from "../../../../i18n";
import { screenName } from "../../../utils/screenName";
import { colors } from "../../../utils/colors";
import { useAuth } from "../../../context/AuthContext";
import { useNavBarVisibility } from "../../../context/NavbarVisibilityContext";
import type { BillingDetails } from "../../../types/courses";
import { courseT } from "../../courses/courseI18n";
import type { Video } from "../types/video";
import {
  confirmPremiumSubscription,
  createPremiumPaymentSheet,
} from "../services/premiumVideoApi";
import {
  fetchBillingAddressOptions,
  type BillingAddressOptionsResponse,
} from "../services/billingAddressOptionsApi";
import {
  getAddressSelectionAfterCountryChange,
  getAddressSelectionAfterCountyChange,
  getLocalitiesForCounty,
  isRomaniaCountry,
  isValidBucharestLocality,
  normalizeBillingFormAddressFields,
  normalizeCountrySelection,
  normalizeRomanianCounty,
  normalizeRomanianLocality,
  countryNameToIso2,
} from "../utils/billingAddressSelection";
import { getVideoById } from "../services/videoLibrary.service";

const PREMIUM_BILLING_STORAGE_KEY = "premiumSubscriptionBillingDetails";

/** Navbar ~74 + marginBottom 16 + room above CTA when bottom tabs are visible */
const TAB_BAR_SCROLL_CLEARANCE = 130;

type RouteParams = {
  video?: Video;
};

type BillingForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  line1: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

type DropdownItem = { label: string; value: string };

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const translate = (key: string, fallback: string): string => {
  const value = String(i18n.translate(key));
  return value && value !== key ? value : fallback;
};

const buildInitialForm = (userData: any, currentUser: any): BillingForm => ({
  firstName: userData?.firstName || userData?.prenume || "",
  lastName: userData?.lastName || userData?.nume || "",
  email: userData?.email || currentUser?.email || "",
  phone: userData?.phone || userData?.telefon || "",
  line1: userData?.address?.line1 || userData?.adresa || "",
  city: userData?.address?.city || userData?.city || "",
  state: userData?.address?.state || userData?.judet || "",
  postalCode: userData?.address?.postalCode || "",
  country: userData?.address?.country || "Romania",
});

const VideoPremiumSubscriptionScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = route.params as RouteParams | undefined;
  const video = params?.video;
  const locale = i18n.locale?.split("-")[0] ?? "ro";
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { currentUser, userData, refreshUserData, refreshUserDataFromServer } = useAuth() as any;
  const { setIsNavBarVisible } = useNavBarVisibility();
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      setIsNavBarVisible(false);
      return () => {
        setIsNavBarVisible(true);
      };
    }, [setIsNavBarVisible])
  );

  const [form, setForm] = useState<BillingForm>(() =>
    buildInitialForm(userData, currentUser)
  );
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [paymentSucceeded, setPaymentSucceeded] = useState(false);
  const [activating, setActivating] = useState(false);
  const [addressDataset, setAddressDataset] = useState<BillingAddressOptionsResponse | null>(
    null
  );
  const [addressOptionsLoading, setAddressOptionsLoading] = useState(true);
  const [addressOptionsError, setAddressOptionsError] = useState<string | null>(null);
  const premiumProfileMergedForUidRef = useRef<string | null>(null);

  const loadAddressOptions = useCallback(async () => {
    setAddressOptionsLoading(true);
    setAddressOptionsError(null);
    try {
      const dataset = await fetchBillingAddressOptions();
      setAddressDataset(dataset);
    } catch {
      setAddressOptionsError(courseT(locale, "billingAddressOptionsError"));
      setAddressDataset(null);
    } finally {
      setAddressOptionsLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    loadAddressOptions();
  }, [loadAddressOptions]);

  useEffect(() => {
    premiumProfileMergedForUidRef.current = null;
  }, [currentUser?.uid]);

  useEffect(() => {
    const loadStoredBilling = async () => {
      try {
        const raw = await AsyncStorage.getItem(PREMIUM_BILLING_STORAGE_KEY);
        if (!raw) return;
        const stored: Partial<BillingForm> = JSON.parse(raw);
        setForm((prev) => ({
          firstName: stored.firstName || prev.firstName,
          lastName: stored.lastName || prev.lastName,
          email: stored.email || prev.email,
          phone: stored.phone || prev.phone,
          line1: stored.line1 || prev.line1,
          city: stored.city || prev.city,
          state: stored.state || prev.state,
          postalCode: stored.postalCode ?? prev.postalCode,
          country: stored.country || prev.country,
        }));
      } catch {
        /* ignore */
      }
    };
    loadStoredBilling();
  }, []);

  useEffect(() => {
    const uid = currentUser?.uid;
    if (!uid) return;
    if (premiumProfileMergedForUidRef.current === uid) return;
    const b = userData?.premiumBillingProfile?.billing;
    if (!b || typeof b !== "object") return;
    premiumProfileMergedForUidRef.current = uid;
    const addr = b.address && typeof b.address === "object" ? b.address : {};
    setForm((prev) => ({
      ...prev,
      firstName:
        typeof b.firstName === "string" && b.firstName.trim()
          ? b.firstName.trim()
          : prev.firstName,
      lastName:
        typeof b.lastName === "string" && b.lastName.trim()
          ? b.lastName.trim()
          : prev.lastName,
      email: typeof b.email === "string" && b.email.trim() ? b.email.trim() : prev.email,
      phone: typeof b.phone === "string" && b.phone.trim() ? b.phone.trim() : prev.phone,
      line1:
        typeof addr.line1 === "string" && addr.line1.trim()
          ? addr.line1.trim()
          : prev.line1,
      city: typeof addr.city === "string" && addr.city.trim() ? addr.city.trim() : prev.city,
      state:
        typeof addr.state === "string" && addr.state.trim()
          ? addr.state.trim()
          : prev.state,
      postalCode:
        typeof addr.postalCode === "string" ? addr.postalCode.trim() : prev.postalCode,
      country:
        typeof addr.country === "string" && addr.country.trim()
          ? addr.country.trim()
          : prev.country,
    }));
  }, [currentUser?.uid, userData?.premiumBillingProfile, userData]);

  useEffect(() => {
    if (!addressDataset) return;
    setForm((prev) => ({
      ...prev,
      ...normalizeBillingFormAddressFields(
        { country: prev.country, state: prev.state, city: prev.city },
        addressDataset
      ),
    }));
  }, [addressDataset, userData?.premiumBillingProfile]);

  const title = useMemo(
    () => video?.title || translate("premiumPaywallTitle", "Premium content"),
    [video?.title]
  );

  const usesRomanianSelectors = useMemo(() => {
    if (!addressDataset) return false;
    return isRomaniaCountry(form.country, addressDataset.countries);
  }, [addressDataset, form.country]);

  const countryDropdownData: DropdownItem[] = useMemo(() => {
    if (!addressDataset) return [];
    return addressDataset.countries.map((c) => ({ label: c.name, value: c.name }));
  }, [addressDataset]);

  const countyDropdownData: DropdownItem[] = useMemo(() => {
    if (!addressDataset || !usesRomanianSelectors) return [];
    return addressDataset.romania.counties.map((c) => ({ label: c, value: c }));
  }, [addressDataset, usesRomanianSelectors]);

  const localityDropdownData: DropdownItem[] = useMemo(() => {
    if (!addressDataset || !usesRomanianSelectors) return [];
    const list = getLocalitiesForCounty(
      addressDataset.romania.localitiesByCounty,
      form.state
    );
    return list.map((loc) => ({ label: loc, value: loc }));
  }, [addressDataset, usesRomanianSelectors, form.state]);

  const countryFieldValue = useMemo(() => {
    if (!addressDataset) return form.country;
    return normalizeCountrySelection(form.country, addressDataset.countries);
  }, [addressDataset, form.country]);

  const countyFieldValue = useMemo(() => {
    if (!addressDataset || !usesRomanianSelectors) return "";
    return normalizeRomanianCounty(form.state, addressDataset.romania.counties);
  }, [addressDataset, usesRomanianSelectors, form.state]);

  const localityFieldValue = useMemo(() => {
    if (!addressDataset || !usesRomanianSelectors) return form.city;
    const opts = getLocalitiesForCounty(
      addressDataset.romania.localitiesByCounty,
      form.state
    );
    return normalizeRomanianLocality(form.city, opts);
  }, [addressDataset, usesRomanianSelectors, form.state, form.city]);

  const bucharestHint =
    usesRomanianSelectors && countyFieldValue === "Bucuresti"
      ? courseT(locale, "billingBucharestSectorHint")
      : null;

  const setField = (field: keyof BillingForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCountryChange = (nextName: string) => {
    if (!addressDataset) return;
    const sel = getAddressSelectionAfterCountryChange(nextName, addressDataset.countries);
    setForm((prev) => ({
      ...prev,
      country: sel.billingCountry,
      state: sel.billingCounty,
      city: sel.billingCity,
    }));
  };

  const handleCountyChange = (nextCounty: string) => {
    if (!addressDataset) return;
    const sel = getAddressSelectionAfterCountyChange({
      nextCounty,
      currentCity: form.city,
      localitiesByCounty: addressDataset.romania.localitiesByCounty,
    });
    setForm((prev) => ({
      ...prev,
      state: sel.billingCounty,
      city: sel.billingCity,
    }));
  };

  const handleLocalityChange = (nextCity: string) => {
    setForm((prev) => ({ ...prev, city: nextCity }));
  };

  const validate = (): string | null => {
    const required: Array<[keyof BillingForm, string]> = [
      ["firstName", courseT(locale, "billingFirstName")],
      ["lastName", courseT(locale, "billingLastName")],
      ["email", courseT(locale, "billingEmail")],
      ["phone", courseT(locale, "billingPhone")],
      ["line1", courseT(locale, "billingAddressLine1")],
      ["country", courseT(locale, "billingCountry")],
    ];

    const missing = required.find(([field]) => !String(form[field]).trim());
    if (missing) {
      return courseT(locale, "billingRequiredField", { field: missing[1] });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      return courseT(locale, "billingInvalidEmail");
    }

    if (!addressDataset) {
      return courseT(locale, "billingAddressOptionsError");
    }

    const normalizedCountry = normalizeCountrySelection(
      form.country,
      addressDataset.countries
    );

    if (isRomaniaCountry(normalizedCountry, addressDataset.countries)) {
      if (!form.state.trim()) {
        return courseT(locale, "billingRequiredField", {
          field: courseT(locale, "billingState"),
        });
      }
      if (!form.city.trim()) {
        return courseT(locale, "billingRequiredField", {
          field: courseT(locale, "billingSelectLocality"),
        });
      }
      if (!isValidBucharestLocality(form.country, form.state, form.city, addressDataset)) {
        return courseT(locale, "billingInvalidBucharestSector");
      }
    } else {
      if (!form.city.trim()) {
        return courseT(locale, "billingRequiredField", {
          field: courseT(locale, "billingCity"),
        });
      }
    }

    return null;
  };

  const buildBillingDetails = (): BillingDetails => {
    if (!addressDataset) {
      return {
        billingType: "individual",
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: {
          line1: form.line1.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          postalCode: form.postalCode.trim(),
          country: form.country.trim(),
        },
        invoicePreferences: {
          sendEmail: true,
          eInvoice: false,
          dueDays: null,
        },
      };
    }

    const normalizedCountry = normalizeCountrySelection(
      form.country,
      addressDataset.countries
    );
    const ro = isRomaniaCountry(normalizedCountry, addressDataset.countries);
    let state = form.state.trim();
    let city = form.city.trim();
    if (ro) {
      state = normalizeRomanianCounty(state, addressDataset.romania.counties);
      const locs = getLocalitiesForCounty(
        addressDataset.romania.localitiesByCounty,
        state
      );
      city = normalizeRomanianLocality(city, locs);
    }

    return {
      billingType: "individual",
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: {
        line1: form.line1.trim(),
        city,
        state,
        postalCode: form.postalCode.trim(),
        country: normalizedCountry,
      },
      invoicePreferences: {
        sendEmail: true,
        eInvoice: ro,
        dueDays: null,
      },
    };
  };

  const pollPremiumActivation = async (params: {
    subscriptionId?: string;
    paymentIntentId?: string;
  }): Promise<boolean> => {
    console.log("[Premium] Starting pollPremiumActivation", params);

    for (let attempt = 0; attempt < 10; attempt += 1) {
      try {
        console.log("[Premium] Calling confirmPremiumSubscription", { attempt, ...params });
        const result = await confirmPremiumSubscription(params, currentUser);
        console.log("[Premium] Poll result", {
          attempt,
          subscriptionId: result.subscriptionId,
          subscriptionStatus: result.subscriptionStatus,
          premiumActive: result.premiumActive,
        });
        if (result.premiumActive) {
          console.log("[Premium] Premium access confirmed!");
          return true;
        }
      } catch (err: any) {
        console.warn("[Premium] Poll error", {
          attempt,
          errorMessage: err?.message,
          errorStatus: err?.status,
          errorDetails: err?.details,
        });
      }
      if (attempt < 9) {
        await sleep(2500);
      }
    }
    console.warn("[Premium] Premium activation polling exhausted without success");
    return false;
  };

  const handleSubscribe = async () => {
    const validationError = validate();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    try {
      await AsyncStorage.setItem(PREMIUM_BILLING_STORAGE_KEY, JSON.stringify(form));
    } catch {
      /* ignore */
    }

    setSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const sheet = await createPremiumPaymentSheet(buildBillingDetails(), currentUser);

      console.log("[Premium] API response", {
        hasPaymentIntentClientSecret: !!sheet.paymentIntentClientSecret,
        hasCustomerEphemeralKeySecret: !!sheet.customerEphemeralKeySecret,
        hasCustomerId: !!sheet.customerId,
        subscriptionId: sheet.subscriptionId,
        premiumActive: sheet.premiumActive,
        subscriptionStatus: sheet.subscriptionStatus,
        keys: Object.keys(sheet),
      });

      if (sheet.premiumActive) {
        await refreshUserDataFromServer?.({ force: true });
        setSuccessMessage(
          translate("checkoutSuccessToast", "Payment confirmed. Access is updating.")
        );
        navigation.goBack();
        return;
      }

      // The server returns:
      //  - paymentIntentClientSecret: used by PaymentSheet (correct amount on the invoice)
      //  - subscriptionId: canonical identifier for confirm (preferred)
      //  - paymentIntentId: fallback for legacy/in-flight clients
      const clientSecret =
        sheet.paymentIntentClientSecret || sheet.setupIntentClientSecret;
      const confirmParams = {
        subscriptionId: sheet.subscriptionId,
        paymentIntentId: sheet.paymentIntentId,
        setupIntentId: sheet.setupIntentId,
      };

      console.log("[Premium] Intent IDs from response", {
        subscriptionId: sheet.subscriptionId || "none",
        paymentIntentId: sheet.paymentIntentId || "none",
        setupIntentId: sheet.setupIntentId || "none",
      });

      if (!clientSecret || !sheet.customerEphemeralKeySecret || !sheet.customerId) {
        console.warn("[Premium] Missing secrets in response", {
          paymentIntentClientSecret: sheet.paymentIntentClientSecret ? "present" : "MISSING",
          setupIntentClientSecret: sheet.setupIntentClientSecret ? "present" : "MISSING",
          customerEphemeralKeySecret: sheet.customerEphemeralKeySecret ? "present" : "MISSING",
          customerId: sheet.customerId || "MISSING",
        });
        throw new Error("PaymentSheet is missing required client secrets.");
      }

      const stripeCountry = countryNameToIso2(form.country, addressDataset);

      // Initialize PaymentSheet - works with PaymentIntent or SetupIntent
      const initParams: any = {
        merchantDisplayName: "Cristina Zurba",
        customerId: sheet.customerId,
        customerEphemeralKeySecret: sheet.customerEphemeralKeySecret,
        allowsDelayedPaymentMethods: false,
        defaultBillingDetails: {
          name: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          address: {
            line1: form.line1.trim(),
            city: form.city.trim(),
            state: form.state.trim(),
            postalCode: form.postalCode.trim(),
            country: stripeCountry,
          },
        },
      };

      // Use PaymentIntent (shows correct amount) or legacy SetupIntent
      if (sheet.paymentIntentClientSecret) {
        initParams.paymentIntentClientSecret = sheet.paymentIntentClientSecret;
      } else if (sheet.setupIntentClientSecret) {
        initParams.setupIntentClientSecret = sheet.setupIntentClientSecret;
      }

      const initResult = await initPaymentSheet(initParams);

      if (initResult.error) {
        throw new Error(initResult.error.message);
      }

      const presentResult = await presentPaymentSheet();
      if (presentResult.error) {
        if (String(presentResult.error.code || "").toLowerCase() === "canceled") {
          setErrorMessage(translate("checkoutCanceledToast", "Checkout canceled."));
          return;
        }
        throw new Error(presentResult.error.message);
      }

      // Payment succeeded! Show success UI immediately
      setPaymentSucceeded(true);
      setActivating(true);
      setSuccessMessage(translate("checkoutSuccessMessage", "Payment successful! Your premium access is being activated."));

      // Stripe auto-activates the subscription once the invoice PaymentIntent
      // is paid; we just poll our backend to mirror premium access into Firestore.
      const active = await pollPremiumActivation(confirmParams);
      await refreshUserDataFromServer?.({ force: true });
      setActivating(false);

      if (active) {
        setSuccessMessage(translate("checkoutActivatedMessage", "Premium access activated! Enjoy your videos."));
      } else {
        setSuccessMessage(translate("checkoutActivatingMessage", "Your premium access is being processed. It should be ready within a few minutes."));
      }
      // Stay on success screen - user can tap button to navigate
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : translate("checkoutErrorToast", "Checkout failed");
      setErrorMessage(message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderInput = (
    field: keyof BillingForm,
    label: string,
    options?: { keyboardType?: "default" | "email-address" | "phone-pad" }
  ) => (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={form[field]}
        onChangeText={(value) => setField(field, value)}
        style={styles.input}
        placeholderTextColor="#9b8a6d"
        keyboardType={options?.keyboardType || "default"}
        autoCapitalize={field === "email" ? "none" : "words"}
      />
    </View>
  );

  const canSubmit =
    Boolean(addressDataset) && !addressOptionsLoading && !addressOptionsError;

  const scrollContentStyle = useMemo(
    () => [
      styles.scrollContent,
      { paddingBottom: 20 + insets.bottom + TAB_BAR_SCROLL_CLEARANCE },
    ],
    [insets.bottom]
  );

  if (!currentUser) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={["#fffef9", "#faf6ed", "#f5ead9"]} style={styles.gradient}>
          <ImageBackground
            source={require("../../../../assets/dashboardbg.jpg")}
            resizeMode="cover"
            style={StyleSheet.absoluteFill}
            imageStyle={{ opacity: 0.35 }}
          />
          <View style={styles.header}>
            <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#5d4e37" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {translate("premiumPaywallCta", "Subscribe")}
            </Text>
            <View style={styles.headerIcon} />
          </View>

          <View style={styles.authGateContainer}>
            <Ionicons name="lock-closed" size={48} color="#bfa76a" />
            <Text style={styles.authGateTitle}>
              {translate("premiumAuthRequiredTitle", "Autentificare necesară")}
            </Text>
            <Text style={styles.authGateMessage}>
              {translate(
                "premiumAuthRequiredMessage",
                "Trebuie să fii autentificat pentru a te abona și a accesa conținutul premium."
              )}
            </Text>
            <TouchableOpacity
              style={styles.authGateButton}
              onPress={() => navigation.navigate(screenName.SignInScreenClinic)}
            >
              <Ionicons name="log-in-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.authGateButtonText}>
                {translate("premiumAuthSignIn", "Autentifică-te")}
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Success screen after payment
  if (paymentSucceeded) {
    const handleGoToVideos = async () => {
      // Make sure the library screen sees fresh premium status as soon as it re-focuses.
      try {
        await refreshUserDataFromServer?.({ force: true });
      } catch {
        /* non-blocking */
      }
      navigation.navigate(screenName.VideoLibrary);
    };

    const handleWatchVideo = async () => {
      // Refresh entitlements right before navigating so the player gets non-premium=false immediately.
      try {
        await refreshUserDataFromServer?.({ force: true });
      } catch {
        /* non-blocking */
      }
      if (video?.id) {
        try {
          const refreshedVideo = await getVideoById(video.id);
          navigation.replace(screenName.VideoPlayer, {
            video: refreshedVideo || video,
          });
        } catch {
          navigation.navigate(screenName.VideoLibrary);
        }
      } else {
        navigation.navigate(screenName.VideoLibrary);
      }
    };

    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={["#fffef9", "#faf6ed", "#f5ead9"]} style={styles.gradient}>
          <ImageBackground
            source={require("../../../../assets/dashboardbg.jpg")}
            resizeMode="cover"
            style={StyleSheet.absoluteFill}
            imageStyle={{ opacity: 0.35 }}
          />
          <View style={styles.successContainer}>
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
            </View>
            <Text style={styles.successTitle}>
              {translate("checkoutSuccessTitle", "Plată reușită!")}
            </Text>
            <Text style={styles.successMessage}>
              {successMessage || translate("checkoutSuccessMessage", "Mulțumim pentru abonament! Accesul tău premium este acum activ.")}
            </Text>
            
            {activating && (
              <View style={styles.successLoadingContainer}>
                <ActivityIndicator size="small" color="#bfa76a" />
                <Text style={styles.successLoadingText}>
                  {translate("checkoutActivatingAccess", "Se activează accesul...")}
                </Text>
              </View>
            )}

            <View style={styles.successButtonsContainer}>
              {video?.id && (
                <TouchableOpacity
                  style={[styles.successButton, styles.successButtonPrimary, activating && styles.buttonDisabled]}
                  onPress={handleWatchVideo}
                  disabled={activating}
                >
                  <Ionicons name="play-circle" size={24} color={activating ? "#999" : "#fff"} style={{ marginRight: 8 }} />
                  <Text style={[styles.successButtonPrimaryText, activating && styles.buttonTextDisabled]}>
                    {translate("checkoutWatchVideo", "Vizionează videoul")}
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[
                  styles.successButton, 
                  video?.id ? styles.successButtonSecondary : styles.successButtonPrimary,
                  activating && styles.buttonDisabled
                ]}
                onPress={handleGoToVideos}
                disabled={activating}
              >
                <Ionicons 
                  name="videocam" 
                  size={24} 
                  color={activating ? "#999" : (video?.id ? "#5d4e37" : "#fff")} 
                  style={{ marginRight: 8 }} 
                />
                <Text style={[
                  video?.id ? styles.successButtonSecondaryText : styles.successButtonPrimaryText,
                  activating && styles.buttonTextDisabled
                ]}>
                  {translate("checkoutGoToVideos", "Mergi la videoclipuri")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#fffef9", "#faf6ed", "#f5ead9"]} style={styles.gradient}>
        <ImageBackground
          source={require("../../../../assets/dashboardbg.jpg")}
          resizeMode="cover"
          style={StyleSheet.absoluteFill}
          imageStyle={{ opacity: 0.35 }}
        />
        <KeyboardAvoidingView
          style={styles.keyboard}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.header}>
            <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#5d4e37" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {translate("premiumPaywallCta", "Subscribe")}
            </Text>
            <View style={styles.headerIcon} />
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={scrollContentStyle}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.hero}>
              <Ionicons name="star" size={28} color="#bfa76a" />
              <Text style={styles.title}>{title}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.priceAmount}>5€</Text>
                <Text style={styles.pricePeriod}>
                  {translate("premiumPricePerMonth", "/month")}
                </Text>
              </View>
              <Text style={styles.subtitle}>
                {translate(
                  "premiumPaywallMessage",
                  "This video is available only to subscribers."
                )}
              </Text>
            </View>

            {addressOptionsLoading ? (
              <View style={styles.loadingBlock}>
                <ActivityIndicator size="small" color={colors.gold} />
                <Text style={styles.loadingText}>
                  {courseT(locale, "billingLoadingAddressOptions")}
                </Text>
              </View>
            ) : null}

            {addressOptionsError ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{addressOptionsError}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={loadAddressOptions}>
                  <Text style={styles.retryButtonText}>{courseT(locale, "billingRetry")}</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            <View style={styles.form}>
              <Text style={styles.formTitle}>{courseT(locale, "checkoutBillingTitle")}</Text>
              <Text style={styles.formSubtitle}>{courseT(locale, "checkoutBillingSubtitle")}</Text>
              {renderInput("firstName", courseT(locale, "billingFirstName"))}
              {renderInput("lastName", courseT(locale, "billingLastName"))}
              {renderInput("email", courseT(locale, "billingEmail"), {
                keyboardType: "email-address",
              })}
              {renderInput("phone", courseT(locale, "billingPhone"), {
                keyboardType: "phone-pad",
              })}

              {addressDataset ? (
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>{courseT(locale, "billingCountry")}</Text>
                  <Dropdown
                    style={styles.dropdown}
                    containerStyle={styles.dropdownContainer}
                    placeholderStyle={styles.dropdownPlaceholder}
                    selectedTextStyle={styles.dropdownSelectedText}
                    itemTextStyle={styles.dropdownItemText}
                    inputSearchStyle={styles.dropdownSearchInput}
                    data={countryDropdownData}
                    labelField="label"
                    valueField="value"
                    search
                    maxHeight={280}
                    placeholder={courseT(locale, "billingSelectCountry")}
                    value={countryFieldValue}
                    onChange={(item) => handleCountryChange(item.value)}
                  />
                </View>
              ) : null}

              {usesRomanianSelectors && addressDataset ? (
                <>
                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>{courseT(locale, "billingState")}</Text>
                    <Dropdown
                      style={styles.dropdown}
                      containerStyle={styles.dropdownContainer}
                      placeholderStyle={styles.dropdownPlaceholder}
                      selectedTextStyle={styles.dropdownSelectedText}
                      itemTextStyle={styles.dropdownItemText}
                      inputSearchStyle={styles.dropdownSearchInput}
                      data={countyDropdownData}
                      labelField="label"
                      valueField="value"
                      search
                      maxHeight={280}
                      placeholder={courseT(locale, "billingSelectCounty")}
                      value={countyFieldValue}
                      onChange={(item) => handleCountyChange(item.value)}
                    />
                  </View>
                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>{courseT(locale, "billingSelectLocality")}</Text>
                    {bucharestHint ? (
                      <Text style={styles.fieldHint}>{bucharestHint}</Text>
                    ) : null}
                    <Dropdown
                      style={styles.dropdown}
                      containerStyle={styles.dropdownContainer}
                      placeholderStyle={styles.dropdownPlaceholder}
                      selectedTextStyle={styles.dropdownSelectedText}
                      itemTextStyle={styles.dropdownItemText}
                      inputSearchStyle={styles.dropdownSearchInput}
                      data={localityDropdownData}
                      labelField="label"
                      valueField="value"
                      search
                      maxHeight={280}
                      placeholder={
                        form.state.trim()
                          ? courseT(locale, "billingSelectLocality")
                          : courseT(locale, "billingLocalityPickCountyFirst")
                      }
                      value={localityFieldValue}
                      disable={!form.state.trim() || localityDropdownData.length === 0}
                      onChange={(item) => handleLocalityChange(item.value)}
                    />
                  </View>
                </>
              ) : addressDataset ? (
                <>
                  {renderInput("state", courseT(locale, "billingState"))}
                  {renderInput("city", courseT(locale, "billingCity"))}
                </>
              ) : null}

              {renderInput("line1", courseT(locale, "billingAddressLine1"))}
              {renderInput("postalCode", courseT(locale, "billingPostalCode"))}
            </View>

            {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
            {successMessage ? <Text style={styles.success}>{successMessage}</Text> : null}

            <TouchableOpacity
              style={[
                styles.submitButton,
                submitting || !canSubmit ? styles.submitButtonDisabled : null,
              ]}
              onPress={handleSubscribe}
              disabled={submitting || !canSubmit}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {translate("premiumPaywallCta", "Subscribe")}
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fffbe6" },
  gradient: { flex: 1 },
  keyboard: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  headerIcon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "#5d4e37",
    fontSize: 18,
    fontWeight: "700",
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 20 },
  hero: {
    alignItems: "center",
    marginBottom: 22,
  },
  title: {
    marginTop: 10,
    color: "#3f3527",
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    marginTop: 6,
  },
  priceAmount: {
    fontSize: 30,
    fontWeight: "800",
    color: "#bfa76a",
    letterSpacing: -1,
  },
  pricePeriod: {
    marginLeft: 4,
    fontSize: 15,
    fontWeight: "600",
    color: "#8b7355",
  },
  subtitle: {
    marginTop: 8,
    color: "#6f604b",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  form: {
    gap: 12,
  },
  formTitle: {
    color: "#3f3527",
    fontSize: 18,
    fontWeight: "800",
  },
  formSubtitle: {
    color: "#6f604b",
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 2,
  },
  fieldGroup: { gap: 6 },
  fieldHint: {
    color: "#6f604b",
    fontSize: 12,
    lineHeight: 17,
  },
  label: {
    color: "#5d4e37",
    fontSize: 13,
    fontWeight: "700",
  },
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: "rgba(191,167,106,0.45)",
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.86)",
    paddingHorizontal: 12,
    color: "#3f3527",
    fontSize: 15,
  },
  dropdown: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: "rgba(191,167,106,0.45)",
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.86)",
    paddingHorizontal: 12,
  },
  dropdownContainer: {
    borderRadius: 8,
    marginTop: 4,
  },
  dropdownPlaceholder: {
    fontSize: 15,
    color: "#9b8a6d",
  },
  dropdownSelectedText: {
    fontSize: 15,
    color: "#3f3527",
  },
  dropdownItemText: {
    fontSize: 15,
    color: "#3f3527",
  },
  dropdownSearchInput: {
    borderRadius: 8,
    borderColor: "rgba(191,167,106,0.45)",
    color: "#3f3527",
  },
  loadingBlock: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  loadingText: {
    color: "#6f604b",
    fontSize: 14,
    marginLeft: 10,
  },
  errorBanner: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "rgba(159,47,47,0.08)",
    borderWidth: 1,
    borderColor: "rgba(159,47,47,0.25)",
  },
  errorBannerText: {
    color: "#9f2f2f",
    fontSize: 14,
    marginBottom: 8,
  },
  retryButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: colors.gold,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  error: {
    marginTop: 16,
    color: "#9f2f2f",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  success: {
    marginTop: 16,
    color: "#357a45",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  submitButton: {
    minHeight: 52,
    borderRadius: 8,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  submitButtonDisabled: {
    opacity: 0.65,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  authGateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  authGateTitle: {
    marginTop: 16,
    color: "#3f3527",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },
  authGateMessage: {
    marginTop: 10,
    color: "#6f604b",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  authGateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    borderRadius: 8,
    backgroundColor: colors.gold,
    paddingHorizontal: 28,
    marginTop: 28,
  },
  authGateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  // Success screen styles
  successContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  successIconContainer: {
    marginBottom: 24,
  },
  successTitle: {
    color: "#3f3527",
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
  },
  successMessage: {
    color: "#6f604b",
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 24,
  },
  successLoadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  successLoadingText: {
    color: "#6f604b",
    fontSize: 14,
    marginLeft: 10,
  },
  successButtonsContainer: {
    width: "100%",
    gap: 12,
    marginTop: 16,
  },
  successButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    borderRadius: 8,
    paddingHorizontal: 24,
  },
  successButtonPrimary: {
    backgroundColor: colors.gold,
  },
  successButtonSecondary: {
    backgroundColor: "rgba(255,255,255,0.8)",
    borderWidth: 1,
    borderColor: "rgba(191,167,106,0.5)",
  },
  successButtonPrimaryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  successButtonSecondaryText: {
    color: "#5d4e37",
    fontSize: 16,
    fontWeight: "700",
  },
  buttonDisabled: {
    backgroundColor: "#e0e0e0",
    borderColor: "#ccc",
  },
  buttonTextDisabled: {
    color: "#999",
  },
});

export default VideoPremiumSubscriptionScreen;

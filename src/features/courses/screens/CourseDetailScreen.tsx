import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Modal,
  NativeModules,
  Platform,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import * as Sharing from "expo-sharing";
import { Snackbar } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { WebView } from "react-native-webview";

import { useAuth } from "../../../context/AuthContext";
import { useLanguage } from "../../../context/LanguageContext";
import { useNavBarVisibility } from "../../../context/NavbarVisibilityContext";
import { logError, logInfo } from "../../../utils/Logger";
import type { BillingDetails, SafeCourseDetail } from "../../../types/courses";
import { CourseMaterialsPanel } from "../components/CourseMaterialsPanel";
import { CourseSidebarCurriculum } from "../components/CourseSidebarCurriculum";
import { CourseTabs, type CourseTabKey } from "../components/CourseTabs";
import { CourseVideoCard } from "../components/CourseVideoCard";
import { courseT } from "../courseI18n";
import { IOS_COURSES_FREE_MODE_ENABLED } from "../iosCoursesFreeMode";
import { useCourses } from "../useCourses";

const ROUTE_COURSE_LIST = "CoursesList";
const ROUTE_COURSE_PURCHASED = "CoursesPurchased";
const ROUTE_COURSE_DETAIL = "CoursesDetail";
const ROUTE_SIGN_IN = "SignInScreenClinic";
const ANDROID_APP_URL =
  "https://play.google.com/store/apps/details?id=com.cristina.zurba.tarot&hl=ro";
const IOS_APP_URL = "https://apps.apple.com/ro/app/cristina-zurba-tarot/id6475713937";
const BILLING_DETAILS_STORAGE_KEY = "coursesCheckoutBillingDetails";
const LEGACY_USER_DETAILS_STORAGE_KEY = "userDetails";

type CheckoutSnackbarTone = "info" | "success" | "warning" | "error";
type AndroidSoftInputMode = "adjustResize" | "adjustPan" | "adjustNothing";

type SoftInputModeModuleType = {
  set?: (mode: AndroidSoftInputMode) => void;
};

const softInputModeModule = NativeModules.SoftInputMode as SoftInputModeModuleType | undefined;

type BillingFormState = {
  billingType: "individual" | "corporate";
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  companyName: string;
  companyVat: string;
  companyReg: string;
  companyAddress: string;
};

type BillingFormErrors = Partial<Record<keyof BillingFormState, string>>;

type RouteParams = {
  courseId?: string;
  checkout?: string;
  success?: string;
  cancel?: string;
};

const DEFAULT_BILLING_FORM: BillingFormState = {
  billingType: "individual",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "RO",
  companyName: "",
  companyVat: "",
  companyReg: "",
  companyAddress: "",
};

const normalizeInputText = (value: unknown): string => {
  return typeof value === "string" ? value.trim() : "";
};

const splitDisplayName = (displayName: string | null | undefined): {
  firstName: string;
  lastName: string;
} => {
  const normalized = normalizeInputText(displayName);
  if (!normalized) {
    return { firstName: "", lastName: "" };
  }

  const parts = normalized.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "" };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
};

const mapBillingDetailsToForm = (raw: unknown): Partial<BillingFormState> => {
  if (!raw || typeof raw !== "object") {
    return {};
  }

  const billing = raw as BillingDetails;
  return {
    billingType: billing.billingType === "corporate" ? "corporate" : "individual",
    firstName: normalizeInputText(billing.firstName),
    lastName: normalizeInputText(billing.lastName),
    email: normalizeInputText(billing.email),
    phone: normalizeInputText(billing.phone),
    line1: normalizeInputText(billing.address?.line1),
    line2: normalizeInputText(billing.address?.line2),
    city: normalizeInputText(billing.address?.city),
    state: normalizeInputText(billing.address?.state),
    postalCode: normalizeInputText(billing.address?.postalCode),
    country: normalizeInputText(billing.address?.country),
    companyName: normalizeInputText(billing.company?.name),
    companyVat: normalizeInputText(billing.company?.vat),
    companyReg: normalizeInputText(billing.company?.reg),
    companyAddress: normalizeInputText(billing.company?.address),
  };
};

const mapLegacyBillingToForm = (raw: unknown): Partial<BillingFormState> => {
  if (!raw || typeof raw !== "object") {
    return {};
  }

  const source = raw as Record<string, unknown>;
  return {
    firstName: normalizeInputText(source.firstName),
    lastName: normalizeInputText(source.lastName),
    email: normalizeInputText(source.email),
    phone: normalizeInputText(source.phone),
    line1: normalizeInputText(source.line1),
    city: normalizeInputText(source.city),
    state: normalizeInputText(source.state),
    postalCode: normalizeInputText(source.postalCode),
    country: normalizeInputText(source.country),
  };
};

const normalizeBillingForm = (form: BillingFormState): BillingFormState => {
  return {
    ...form,
    firstName: normalizeInputText(form.firstName),
    lastName: normalizeInputText(form.lastName),
    email: normalizeInputText(form.email),
    phone: normalizeInputText(form.phone),
    line1: normalizeInputText(form.line1),
    line2: normalizeInputText(form.line2),
    city: normalizeInputText(form.city),
    state: normalizeInputText(form.state),
    postalCode: normalizeInputText(form.postalCode),
    country: normalizeInputText(form.country).toUpperCase(),
    companyName: normalizeInputText(form.companyName),
    companyVat: normalizeInputText(form.companyVat),
    companyReg: normalizeInputText(form.companyReg),
    companyAddress: normalizeInputText(form.companyAddress),
  };
};

const buildBillingPayload = (form: BillingFormState): BillingDetails => {
  return {
    billingType: form.billingType,
    firstName: form.firstName,
    lastName: form.lastName,
    email: form.email,
    phone: form.phone,
    address: {
      line1: form.line1,
      line2: form.line2 || undefined,
      city: form.city,
      state: form.state,
      postalCode: form.postalCode,
      country: form.country,
    },
    company:
      form.billingType === "corporate"
        ? {
            name: form.companyName,
            vat: form.companyVat,
            reg: form.companyReg,
            address: form.companyAddress,
          }
        : undefined,
    invoicePreferences: {
      sendEmail: true,
    },
  };
};

const formatPrice = (value: number, currency: string, locale: string): string => {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
};

const getFallbackText = (value: string | null | undefined, fallback: string): string => {
  const normalized = value?.trim();
  return normalized || fallback;
};

export const CourseDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const { setIsNavBarVisible } = useNavBarVisibility();
  const params = (route.params || {}) as RouteParams;
  const { width } = useWindowDimensions();

  const { language } = useLanguage() as { language: string };
  const { currentUser, userData } = useAuth() as {
    currentUser?: {
      getIdToken?: () => Promise<string>;
      email?: string | null;
      displayName?: string | null;
    };
    userData?: {
      first_name?: string;
      last_name?: string;
      email?: string;
      phone?: string;
    } | null;
  };
  const t = (
    key: Parameters<typeof courseT>[1],
    params?: Record<string, string | number>
  ) => courseT(language, key, params);

  const setAndroidSoftInputMode = useCallback((mode: AndroidSoftInputMode) => {
    if (Platform.OS !== "android" || !softInputModeModule?.set) {
      return;
    }

    try {
      softInputModeModule.set(mode);
    } catch (error) {
      logError("[CourseDetailScreen] Failed to set Android soft input mode", {
        mode,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }, []);

  const [activeTab, setActiveTab] = useState<CourseTabKey>("materials");
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [routeCheckoutState, setRouteCheckoutState] = useState<"success" | "cancel" | null>(
    null
  );
  const [checkoutSnackbarVisible, setCheckoutSnackbarVisible] = useState(false);
  const [checkoutSnackbarMessage, setCheckoutSnackbarMessage] = useState("");
  const [checkoutSnackbarTone, setCheckoutSnackbarTone] =
    useState<CheckoutSnackbarTone>("info");
  const [checkoutSnackbarDuration, setCheckoutSnackbarDuration] = useState(2800);
  const [billingModalVisible, setBillingModalVisible] = useState(false);
  const [checkoutWebViewVisible, setCheckoutWebViewVisible] = useState(false);
  const [checkoutWebViewUrl, setCheckoutWebViewUrl] = useState<string | null>(null);
  const [billingForm, setBillingForm] = useState<BillingFormState>(DEFAULT_BILLING_FORM);
  const [billingErrors, setBillingErrors] = useState<BillingFormErrors>({});

  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCheckoutToastKeyRef = useRef<string | null>(null);
  const checkoutCompletionRef = useRef(false);

  const courseId = params.courseId || "";

  const getAuthToken = useCallback(async () => {
    if (!currentUser?.getIdToken) {
      return null;
    }

    return currentUser.getIdToken();
  }, [currentUser]);

  const {
    courseState,
    playback,
    detailLoading,
    detailError,
    playbackLoading,
    playbackError,
    checkoutStatus,
    checkoutError,
    isAccessChecking,
    certificateDownloading,
    certificateError,
    loadCourseState,
    loadPlayback,
    startCheckout,
    finalizeCheckout,
    downloadCertificate,
    resetCheckoutState,
  } = useCourses({
    locale: language,
    getAuthToken,
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
  });

  const course = courseState?.course || null;
  const isIos = Platform.OS === "ios";
  const isIosCoursesFreeMode = IOS_COURSES_FREE_MODE_ENABLED;
  const effectiveHasAccess = isIosCoursesFreeMode ? true : Boolean(courseState?.hasAccess);
  const shouldAttemptPlaybackLoad = !isIosCoursesFreeMode || Boolean(currentUser);
  const isWideLayout = width >= 980;
  const floatingButtonVisible =
    !isIosCoursesFreeMode && Boolean(courseState?.isVisible === true && effectiveHasAccess === false);
  const floatingBottom = Math.max(insets.bottom, Platform.OS === "android" ? 16 : 12) + 12;
  const floatingButtonHeight = 52;
  const contentBottomPadding =
    Math.max(26, insets.bottom + (Platform.OS === "android" ? 24 : 12)) +
    (floatingButtonVisible ? floatingBottom + floatingButtonHeight + 24 : 0);
  const checkoutSnackbarBottom = floatingButtonVisible
    ? floatingBottom + floatingButtonHeight + 12
    : Math.max(insets.bottom, Platform.OS === "android" ? 16 : 12) + 8;
  const normalizedApiBaseUrl = useMemo(() => {
    const raw = process.env.EXPO_PUBLIC_API_BASE_URL || "";
    return raw.trim().replace(/\/+$/, "");
  }, []);
  const apiBaseHost = useMemo(() => {
    if (!normalizedApiBaseUrl) {
      return "";
    }

    const protocolMarker = "://";
    const protocolIndex = normalizedApiBaseUrl.indexOf(protocolMarker);
    if (protocolIndex === -1) {
      return "";
    }

    const hostWithPath = normalizedApiBaseUrl.slice(protocolIndex + protocolMarker.length);
    const slashIndex = hostWithPath.indexOf("/");
    return (slashIndex === -1 ? hostWithPath : hostWithPath.slice(0, slashIndex))
      .toLowerCase()
      .trim();
  }, [normalizedApiBaseUrl]);

  useFocusEffect(
    useCallback(() => {
      setIsNavBarVisible(false);
      return () => {
        setIsNavBarVisible(true);
      };
    }, [setIsNavBarVisible])
  );

  useEffect(() => {
    setAndroidSoftInputMode(checkoutWebViewVisible ? "adjustPan" : "adjustResize");
    return () => {
      setAndroidSoftInputMode("adjustResize");
    };
  }, [checkoutWebViewVisible, setAndroidSoftInputMode]);

  useEffect(() => {
    if (!courseId) {
      logInfo("[CourseDetailScreen] Missing courseId in route params", { params });
      return;
    }

    logInfo("[CourseDetailScreen] Load course state", {
      courseId,
      locale: language,
      checkoutParam: params.checkout,
      successParam: params.success,
      cancelParam: params.cancel,
    });
    void loadCourseState(courseId).catch((error) => {
      logError("[CourseDetailScreen] Load course state failed", {
        courseId,
        message: error instanceof Error ? error.message : String(error),
      });
    });
  }, [courseId, language, loadCourseState, params.cancel, params.checkout, params.success]);

  useEffect(() => {
    if (!courseId || !courseState || !effectiveHasAccess || !shouldAttemptPlaybackLoad) {
      return;
    }

    logInfo("[CourseDetailScreen] Load playback after access granted", {
      courseId,
      platform: Platform.OS,
      forcedAccess: isIosCoursesFreeMode && courseState?.hasAccess !== true,
    });
    void loadPlayback(courseId).catch((error) => {
      logError("[CourseDetailScreen] Load playback failed", {
        courseId,
        message: error instanceof Error ? error.message : String(error),
      });
    });
  }, [
    courseId,
    courseState,
    effectiveHasAccess,
    isIosCoursesFreeMode,
    loadPlayback,
    shouldAttemptPlaybackLoad,
  ]);

  useEffect(() => {
    const checkoutParam = params.checkout;

    if (checkoutParam === "success" || params.success === "1") {
      logInfo("[CourseDetailScreen] Checkout return detected", {
        courseId,
        outcome: "success",
      });
      setRouteCheckoutState("success");
      return;
    }

    if (checkoutParam === "cancel" || params.cancel === "1") {
      logInfo("[CourseDetailScreen] Checkout return detected", {
        courseId,
        outcome: "cancel",
      });
      setRouteCheckoutState("cancel");
      return;
    }

    setRouteCheckoutState(null);
  }, [params.cancel, params.checkout, params.success]);

  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    logInfo("[CourseDetailScreen] Checkout state changed", {
      courseId,
      checkoutStatus,
      hasCheckoutError: Boolean(checkoutError),
      isAccessChecking,
    });
  }, [checkoutError, checkoutStatus, courseId, isAccessChecking]);

  useEffect(() => {
    let isMounted = true;

    const loadStoredBilling = async () => {
      try {
        const [storedBillingRaw, legacyBillingRaw] = await Promise.all([
          AsyncStorage.getItem(BILLING_DETAILS_STORAGE_KEY),
          AsyncStorage.getItem(LEGACY_USER_DETAILS_STORAGE_KEY),
        ]);

        let nextFromStored: Partial<BillingFormState> = {};
        let nextFromLegacy: Partial<BillingFormState> = {};

        if (storedBillingRaw) {
          try {
            nextFromStored = mapBillingDetailsToForm(JSON.parse(storedBillingRaw));
          } catch (error) {
            logError("[CourseDetailScreen] Failed to parse stored billing details", {
              message: error instanceof Error ? error.message : String(error),
            });
          }
        }

        if (legacyBillingRaw) {
          try {
            nextFromLegacy = mapLegacyBillingToForm(JSON.parse(legacyBillingRaw));
          } catch (error) {
            logError("[CourseDetailScreen] Failed to parse legacy billing details", {
              message: error instanceof Error ? error.message : String(error),
            });
          }
        }

        if (!isMounted) {
          return;
        }

        setBillingForm((previous) => {
          const merged = {
            ...previous,
            ...nextFromLegacy,
            ...nextFromStored,
          };

          return normalizeBillingForm(merged);
        });
      } catch (error) {
        logError("[CourseDetailScreen] Failed to read billing details from storage", {
          message: error instanceof Error ? error.message : String(error),
        });
      }
    };

    void loadStoredBilling();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const fallbackName = splitDisplayName(currentUser?.displayName);
    const authFirstName =
      normalizeInputText(userData?.first_name) || normalizeInputText(fallbackName.firstName);
    const authLastName =
      normalizeInputText(userData?.last_name) || normalizeInputText(fallbackName.lastName);
    const authEmail =
      normalizeInputText(userData?.email) || normalizeInputText(currentUser?.email);
    const authPhone = normalizeInputText(userData?.phone);

    setBillingForm((previous) => {
      const next = { ...previous };

      if (!next.firstName && authFirstName) {
        next.firstName = authFirstName;
      }
      if (!next.lastName && authLastName) {
        next.lastName = authLastName;
      }
      if (!next.email && authEmail) {
        next.email = authEmail;
      }
      if (!next.phone && authPhone) {
        next.phone = authPhone;
      }

      return next;
    });
  }, [currentUser?.displayName, currentUser?.email, userData?.email, userData?.first_name, userData?.last_name, userData?.phone]);

  const setBillingField = useCallback(
    <K extends keyof BillingFormState>(field: K, value: BillingFormState[K]) => {
      setBillingForm((previous) => ({
        ...previous,
        [field]: value,
      }));
      setBillingErrors((previous) => {
        if (!previous[field]) {
          return previous;
        }
        const next = { ...previous };
        delete next[field];
        return next;
      });
    },
    []
  );

  const validateBilling = useCallback(
    (form: BillingFormState): boolean => {
      const errors: BillingFormErrors = {};
      const required = (field: keyof BillingFormState, labelKey: Parameters<typeof courseT>[1]) => {
        if (!normalizeInputText(form[field])) {
          errors[field] = t("billingRequiredField", { field: t(labelKey) });
        }
      };

      required("firstName", "billingFirstName");
      required("lastName", "billingLastName");
      required("email", "billingEmail");
      required("phone", "billingPhone");
      required("line1", "billingAddressLine1");
      required("city", "billingCity");
      required("state", "billingState");
      required("postalCode", "billingPostalCode");
      required("country", "billingCountry");

      const email = normalizeInputText(form.email);
      if (email && !/\S+@\S+\.\S+/.test(email)) {
        errors.email = t("billingInvalidEmail");
      }

      const phoneDigits = normalizeInputText(form.phone).replace(/[^\d+]/g, "");
      if (phoneDigits && phoneDigits.length < 7) {
        errors.phone = t("billingInvalidPhone");
      }

      if (form.billingType === "corporate") {
        required("companyName", "billingCompanyName");
        required("companyVat", "billingCompanyVat");
        required("companyReg", "billingCompanyReg");
        required("companyAddress", "billingCompanyAddress");
      }

      setBillingErrors(errors);
      return Object.keys(errors).length === 0;
    },
    [t]
  );

  const showCheckoutToast = useCallback(
    (
      key: string,
      message: string,
      tone: CheckoutSnackbarTone,
      duration: number
    ) => {
      if (!message || lastCheckoutToastKeyRef.current === key) {
        return;
      }
      lastCheckoutToastKeyRef.current = key;
      setCheckoutSnackbarMessage(message);
      setCheckoutSnackbarTone(tone);
      setCheckoutSnackbarDuration(duration);
      setCheckoutSnackbarVisible(true);
    },
    []
  );

  useEffect(() => {
    if (certificateDownloading) {
      showCheckoutToast(
        "certificate:downloading",
        t("certificateDownloadingToast"),
        "info",
        2200
      );
    }
  }, [certificateDownloading, showCheckoutToast, t]);

  useEffect(() => {
    if (checkoutStatus === "opening") {
      showCheckoutToast("opening", t("checkoutStarting"), "info", 2200);
      return;
    }

    if (checkoutStatus === "polling" || isAccessChecking) {
      showCheckoutToast("polling", t("checkoutAccessCheckingToast"), "info", 2600);
      return;
    }

    if (checkoutStatus === "returned_success" || routeCheckoutState === "success") {
      showCheckoutToast("success", t("checkoutSuccessToast"), "success", 3200);
      return;
    }

    if (checkoutStatus === "returned_cancel" || routeCheckoutState === "cancel") {
      showCheckoutToast("cancel", t("checkoutCanceledToast"), "warning", 3200);
      return;
    }

    if (checkoutStatus === "error") {
      const backendMessage = checkoutError?.message?.trim();
      const message = backendMessage
        ? `${t("checkoutErrorToast")}: ${backendMessage}`
        : t("checkoutErrorToast");
      showCheckoutToast(`error:${backendMessage || "unknown"}`, message, "error", 6200);
    }
  }, [
    checkoutError?.message,
    checkoutStatus,
    isAccessChecking,
    routeCheckoutState,
    showCheckoutToast,
    t,
  ]);

  const handleDismissCheckoutSnackbar = useCallback(() => {
    setCheckoutSnackbarVisible(false);
    if (
      checkoutStatus === "returned_success" ||
      checkoutStatus === "returned_cancel" ||
      checkoutStatus === "error"
    ) {
      resetCheckoutState();
    }
  }, [checkoutStatus, resetCheckoutState]);

  const parseWebCheckoutOutcome = useCallback(
    (url?: string): "success" | "cancel" | null => {
      if (!url || !apiBaseHost) {
        return null;
      }

      const normalizedUrl = url.trim();
      const [beforeQuery, queryString = ""] = normalizedUrl.split("?");
      const protocolMarker = "://";
      const protocolIndex = beforeQuery.indexOf(protocolMarker);
      if (protocolIndex === -1) {
        return null;
      }

      const hostWithPath = beforeQuery.slice(protocolIndex + protocolMarker.length);
      const slashIndex = hostWithPath.indexOf("/");
      const normalizedHost = (
        slashIndex === -1 ? hostWithPath : hostWithPath.slice(0, slashIndex)
      ).toLowerCase();
      const parsedPath = slashIndex === -1 ? "/" : hostWithPath.slice(slashIndex);
      const hostWithoutWww = normalizedHost.replace(/^www\./, "");
      const apiHostWithoutWww = apiBaseHost.replace(/^www\./, "");
      if (hostWithoutWww !== apiHostWithoutWww) {
        return null;
      }

      if (!parsedPath.startsWith("/courses/checkout")) {
        return null;
      }

      const params = new URLSearchParams(queryString);
      const checkout = params.get("checkout");
      const success = params.get("success");
      const cancel = params.get("cancel");
      const canceled = params.get("canceled");

      if (checkout === "success" || success === "1") {
        return "success";
      }

      if (checkout === "cancel" || cancel === "1" || canceled === "1") {
        return "cancel";
      }

      return null;
    },
    [apiBaseHost]
  );

  const completeCheckoutFromWebView = useCallback(
    async (outcome: "success" | "cancel") => {
      if (!courseId || checkoutCompletionRef.current) {
        return;
      }

      checkoutCompletionRef.current = true;
      setCheckoutWebViewVisible(false);
      setCheckoutWebViewUrl(null);

      try {
        await finalizeCheckout(courseId, outcome);
      } catch (error) {
        logError("[CourseDetailScreen] finalizeCheckout failed", {
          courseId,
          outcome,
          message: error instanceof Error ? error.message : String(error),
        });
      } finally {
        checkoutCompletionRef.current = false;
      }
    },
    [courseId, finalizeCheckout]
  );

  const handleCheckoutWebViewNavigationChange = useCallback(
    (navigationState: { url?: string }) => {
      const currentUrl = navigationState?.url || "";
      const outcome = parseWebCheckoutOutcome(currentUrl);
      if (!outcome) {
        return;
      }

      logInfo("[CourseDetailScreen] Checkout web return detected", {
        courseId,
        url: currentUrl,
        outcome,
      });
      void completeCheckoutFromWebView(outcome);
    },
    [completeCheckoutFromWebView, courseId, parseWebCheckoutOutcome]
  );

  const handleCloseCheckoutWebView = useCallback(() => {
    if (!checkoutWebViewVisible) {
      return;
    }

    logInfo("[CourseDetailScreen] Checkout webview closed by user", { courseId });
    void completeCheckoutFromWebView("cancel");
  }, [checkoutWebViewVisible, completeCheckoutFromWebView, courseId]);

  const handleBack = () => {
    logInfo("[CourseDetailScreen] Back pressed", { courseId });
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate(ROUTE_COURSE_LIST);
  };

  const handleRetryDetail = () => {
    if (!courseId) {
      return;
    }

    logInfo("[CourseDetailScreen] Retry detail load", { courseId });
    void loadCourseState(courseId, { force: true }).catch((error) => {
      logError("[CourseDetailScreen] Retry detail load failed", {
        courseId,
        message: error instanceof Error ? error.message : String(error),
      });
    });
  };

  const handleRetryPlayback = () => {
    if (!courseId) {
      return;
    }

    logInfo("[CourseDetailScreen] Retry playback load", { courseId });
    void loadPlayback(courseId, { force: true }).catch((error) => {
      logError("[CourseDetailScreen] Retry playback load failed", {
        courseId,
        message: error instanceof Error ? error.message : String(error),
      });
    });
  };

  const handleAddToCalendar = async (courseData: SafeCourseDetail) => {
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      courseData.title
    )}&details=${encodeURIComponent(courseData.description || t("courseSession"))}`;

    try {
      await Linking.openURL(url);
      logInfo("[CourseDetailScreen] Calendar link opened", { courseId: courseData.id });
    } catch {
      logError("[CourseDetailScreen] Calendar link failed", { courseId: courseData.id });
      Alert.alert(t("calendarTitle"), t("calendarOpenError"));
    }
  };

  const handleShare = async (courseData: SafeCourseDetail) => {
    const isIos = Platform.OS === "ios";
    const storeName = isIos ? t("storeAppStore") : t("storeGooglePlay");
    const storeUrl = isIos ? IOS_APP_URL : ANDROID_APP_URL;
    const courseTitle = courseData.title?.trim() || t("untitledCourse");
    const message = t("shareCourseAppTemplate", {
      courseTitle,
      storeName,
      storeUrl,
    });

    try {
      await Share.share({
        message,
      });
      logInfo("[CourseDetailScreen] Share success", {
        courseId: courseData.id,
        platform: Platform.OS,
        store: storeName,
        storeUrl,
      });

      setShareFeedback(t("courseShared"));
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
      feedbackTimeoutRef.current = setTimeout(() => setShareFeedback(null), 2000);
    } catch {
      logInfo("[CourseDetailScreen] Share canceled or failed", {
        courseId: courseData.id,
        platform: Platform.OS,
        store: storeName,
        storeUrl,
      });
      setShareFeedback(t("shareCanceled"));
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
      feedbackTimeoutRef.current = setTimeout(() => setShareFeedback(null), 2000);
    }
  };

  const handleStartCheckout = async (billingDetails?: BillingDetails) => {
    if (!course?.id) {
      return;
    }

    if (isIosCoursesFreeMode) {
      logInfo("[CourseDetailScreen] Checkout blocked on iOS", {
        courseId: course.id,
      });
      return;
    }

    try {
      logInfo("[CourseDetailScreen] Checkout start requested", {
        courseId: course.id,
        billingType: billingDetails?.billingType || "none",
      });
      const checkoutUrl = await startCheckout(course.id, billingDetails);
      checkoutCompletionRef.current = false;
      setCheckoutWebViewUrl(checkoutUrl);
      setCheckoutWebViewVisible(true);
      logInfo("[CourseDetailScreen] Checkout webview opened", {
        courseId: course.id,
        checkoutUrl,
      });
    } catch (error) {
      const candidate = error as {
        status?: unknown;
        message?: unknown;
        details?: unknown;
      };
      const errorStatus =
        typeof candidate?.status === "number" ? candidate.status : undefined;
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof candidate?.message === "string"
            ? candidate.message
            : String(error);
      const errorDetails =
        candidate?.details && typeof candidate.details === "object"
          ? {
              keys: Object.keys(candidate.details as Record<string, unknown>),
              message:
                typeof (candidate.details as { message?: unknown }).message === "string"
                  ? (candidate.details as { message?: string }).message
                  : undefined,
              error:
                typeof (candidate.details as { error?: unknown }).error === "string"
                  ? (candidate.details as { error?: string }).error
                  : undefined,
            }
          : undefined;

      logError("[CourseDetailScreen] Checkout start failed", {
        courseId: course.id,
        status: errorStatus,
        message: errorMessage,
        details: errorDetails,
      });

      if (errorStatus === 401) {
        navigation.navigate(ROUTE_SIGN_IN, {
          returnRoute: ROUTE_COURSE_DETAIL,
          returnParams: { courseId: course.id },
        });
      }
    }
  };

  const handleDownloadCertificate = async () => {
    if (!course?.id) {
      return;
    }

    try {
      logInfo("[CourseDetailScreen] Certificate download requested", {
        courseId: course.id,
        locale: language,
      });

      const certificate = await downloadCertificate(course.id);
      const sharingAvailable = await Sharing.isAvailableAsync();

      if (!sharingAvailable) {
        logError("[CourseDetailScreen] Sharing unavailable for certificate", {
          courseId: course.id,
        });
        showCheckoutToast(
          `certificate:error:no-sharing:${Date.now()}`,
          t("certificateDownloadErrorToast"),
          "error",
          6200
        );
        return;
      }

      await Sharing.shareAsync(certificate.uri, {
        mimeType: certificate.mimeType || "application/pdf",
        UTI: "com.adobe.pdf",
        dialogTitle: t("downloadCertificate"),
      });

      showCheckoutToast(
        `certificate:success:${Date.now()}`,
        t("certificateDownloadSuccessToast"),
        "success",
        3200
      );
      logInfo("[CourseDetailScreen] Certificate share sheet opened", {
        courseId: course.id,
        fileName: certificate.fileName,
        uri: certificate.uri,
      });
    } catch (error) {
      const candidate = error as {
        status?: unknown;
        message?: unknown;
      };
      const errorStatus =
        typeof candidate?.status === "number" ? candidate.status : undefined;
      const backendMessage =
        error instanceof Error
          ? error.message
          : typeof candidate?.message === "string"
            ? candidate.message
            : "";

      logError("[CourseDetailScreen] Certificate download failed", {
        courseId: course.id,
        status: errorStatus,
        message: backendMessage || undefined,
        hookErrorStatus: certificateError?.status,
        hookErrorMessage: certificateError?.message,
      });

      if (errorStatus === 401) {
        navigation.navigate(ROUTE_SIGN_IN, {
          returnRoute: ROUTE_COURSE_DETAIL,
          returnParams: { courseId: course.id },
        });
        return;
      }

      const unavailableStatus = errorStatus === 403 || errorStatus === 404 || errorStatus === 409;
      const localizedMessage = unavailableStatus
        ? t("certificateUnavailableToast")
        : backendMessage
          ? `${t("certificateDownloadErrorToast")}: ${backendMessage}`
          : t("certificateDownloadErrorToast");

      showCheckoutToast(
        `certificate:error:${errorStatus || "unknown"}:${Date.now()}`,
        localizedMessage,
        "error",
        6200
      );
    }
  };

  const isPurchaseBusy = checkoutStatus === "opening" || checkoutStatus === "polling";

  const handleSubmitBillingAndCheckout = async () => {
    if (!course?.id || isPurchaseBusy) {
      return;
    }

    const normalized = normalizeBillingForm(billingForm);
    setBillingForm(normalized);

    if (!validateBilling(normalized)) {
      return;
    }

    const billingPayload = buildBillingPayload(normalized);

    try {
      await AsyncStorage.setItem(
        BILLING_DETAILS_STORAGE_KEY,
        JSON.stringify(billingPayload)
      );
    } catch (error) {
      logError("[CourseDetailScreen] Failed to persist billing details", {
        message: error instanceof Error ? error.message : String(error),
      });
    }

    setBillingModalVisible(false);
    await handleStartCheckout(billingPayload);
  };

  const handleFloatingPurchasePress = () => {
    if (!courseId) {
      return;
    }

    if (isIosCoursesFreeMode) {
      logInfo("[CourseDetailScreen] Floating purchase blocked on iOS", { courseId });
      return;
    }

    if (!currentUser) {
      logInfo("[CourseDetailScreen] Floating purchase pressed without auth", { courseId });
      navigation.navigate(ROUTE_SIGN_IN, {
        returnRoute: ROUTE_COURSE_DETAIL,
        returnParams: { courseId },
      });
      return;
    }

    void handleStartCheckout();
  };

  const purchaseBox = useMemo(() => {
    if (!courseState || !course) {
      return null;
    }

    if (isIosCoursesFreeMode) {
      return null;
    }

    if (!courseState.isVisible && !courseState.hasAccess) {
      return (
        <View style={[styles.statusBox, styles.statusBoxWarning]}>
          <Text style={styles.statusTitle}>{t("courseUnavailableTitle")}</Text>
          <Text style={styles.statusText}>{t("courseUnavailableDescription")}</Text>
        </View>
      );
    }

    if (courseState.hasAccess) {
      return null;
    }

    if (currentUser) {
      return (
        <View style={[styles.statusBox, styles.statusBoxNeutral]}>
          <Text style={styles.statusTitle}>{t("purchaseCourseTitle")}</Text>
          <Text style={styles.statusText}>{t("purchaseCourseDescription")}</Text>
        </View>
      );
    }

    return (
      <View style={[styles.statusBox, styles.statusBoxNeutral]}>
        <Text style={styles.statusTitle}>{t("loginRequiredTitle")}</Text>
        <Text style={styles.statusText}>{t("loginRequiredDescription")}</Text>
      </View>
    );
  }, [
    course,
    courseState,
    currentUser,
    isIosCoursesFreeMode,
    t,
  ]);

  const renderBillingField = (
    field: keyof BillingFormState,
    label: string,
    options?: {
      autoCapitalize?: "none" | "sentences" | "words" | "characters";
      keyboardType?: "default" | "email-address" | "phone-pad";
      multiline?: boolean;
    }
  ) => {
    const multiline = Boolean(options?.multiline);
    return (
      <View style={styles.billingFieldGroup}>
        <Text style={styles.billingFieldLabel}>{label}</Text>
        <TextInput
          style={[
            styles.billingInput,
            multiline ? styles.billingInputMultiline : null,
            billingErrors[field] ? styles.billingInputError : null,
          ]}
          autoCapitalize={options?.autoCapitalize || "words"}
          keyboardType={options?.keyboardType || "default"}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
          value={billingForm[field]}
          onChangeText={(value) => setBillingField(field, value as BillingFormState[typeof field])}
          placeholder={label}
          placeholderTextColor="#a38f6d"
        />
        {billingErrors[field] ? (
          <Text style={styles.billingFieldError}>{billingErrors[field]}</Text>
        ) : null}
      </View>
    );
  };

  if (!courseId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centeredState}>
          <Text style={styles.centeredTitle}>{t("missingCourseId")}</Text>
          <TouchableOpacity onPress={handleBack} style={styles.backToListButton}>
            <Text style={styles.backToListButtonText}>{t("backToCourses")}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableOpacity
        style={[styles.topBackButton, { top: Math.max(insets.top, 8) }]}
        onPress={handleBack}
        accessibilityRole="button"
        accessibilityLabel={t("back")}
      >
        <Ionicons name="arrow-back" size={22} color="#4e3f2c" />
      </TouchableOpacity>

      <Modal
        visible={checkoutWebViewVisible}
        animationType="slide"
        onRequestClose={handleCloseCheckoutWebView}
      >
        <SafeAreaView style={styles.checkoutWebViewSafeArea}>
          <View style={styles.checkoutWebViewHeader}>
            <TouchableOpacity
              style={styles.checkoutWebViewCloseButton}
              onPress={handleCloseCheckoutWebView}
              accessibilityRole="button"
              accessibilityLabel={t("back")}
            >
              <Ionicons name="close" size={22} color="#4f3f2b" />
            </TouchableOpacity>
            <Text style={styles.checkoutWebViewTitle}>{t("purchase")}</Text>
            <View style={styles.checkoutWebViewHeaderSpacer} />
          </View>

          {checkoutWebViewUrl ? (
            <WebView
              source={{ uri: checkoutWebViewUrl }}
              onNavigationStateChange={handleCheckoutWebViewNavigationChange}
              onError={(event) => {
                logError("[CourseDetailScreen] Checkout webview error", {
                  courseId,
                  description: event.nativeEvent.description,
                  url: event.nativeEvent.url,
                });
              }}
              onHttpError={(event) => {
                logError("[CourseDetailScreen] Checkout webview http error", {
                  courseId,
                  statusCode: event.nativeEvent.statusCode,
                  url: event.nativeEvent.url,
                });
              }}
              startInLoadingState
              renderLoading={() => (
                <View style={styles.checkoutWebViewLoader}>
                  <ActivityIndicator size="large" color="#c69a45" />
                </View>
              )}
            />
          ) : (
            <View style={styles.checkoutWebViewLoader}>
              <ActivityIndicator size="large" color="#c69a45" />
            </View>
          )}
        </SafeAreaView>
      </Modal>

      <Modal
        visible={billingModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          if (!isPurchaseBusy) {
            setBillingModalVisible(false);
          }
        }}
      >
        <View style={styles.billingModalBackdrop}>
          <KeyboardAvoidingView
            style={styles.billingModalKeyboard}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <View style={styles.billingModalCard}>
              <Text style={styles.billingModalTitle}>{t("checkoutBillingTitle")}</Text>
              <Text style={styles.billingModalSubtitle}>{t("checkoutBillingSubtitle")}</Text>

              <View style={styles.billingTypeRow}>
                <TouchableOpacity
                  style={[
                    styles.billingTypeChip,
                    billingForm.billingType === "individual" ? styles.billingTypeChipActive : null,
                  ]}
                  onPress={() => setBillingField("billingType", "individual")}
                  disabled={isPurchaseBusy}
                >
                  <Text
                    style={[
                      styles.billingTypeChipText,
                      billingForm.billingType === "individual"
                        ? styles.billingTypeChipTextActive
                        : null,
                    ]}
                  >
                    {t("billingTypeIndividual")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.billingTypeChip,
                    billingForm.billingType === "corporate" ? styles.billingTypeChipActive : null,
                  ]}
                  onPress={() => setBillingField("billingType", "corporate")}
                  disabled={isPurchaseBusy}
                >
                  <Text
                    style={[
                      styles.billingTypeChipText,
                      billingForm.billingType === "corporate"
                        ? styles.billingTypeChipTextActive
                        : null,
                    ]}
                  >
                    {t("billingTypeCorporate")}
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.billingFormScroll}
                contentContainerStyle={styles.billingFormScrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {renderBillingField("firstName", t("billingFirstName"))}
                {renderBillingField("lastName", t("billingLastName"))}
                {renderBillingField("email", t("billingEmail"), {
                  autoCapitalize: "none",
                  keyboardType: "email-address",
                })}
                {renderBillingField("phone", t("billingPhone"), {
                  autoCapitalize: "none",
                  keyboardType: "phone-pad",
                })}
                {renderBillingField("line1", t("billingAddressLine1"), {
                  autoCapitalize: "sentences",
                })}
                {renderBillingField("line2", t("billingAddressLine2"), {
                  autoCapitalize: "sentences",
                })}
                {renderBillingField("city", t("billingCity"))}
                {renderBillingField("state", t("billingState"))}
                {renderBillingField("postalCode", t("billingPostalCode"), {
                  autoCapitalize: "characters",
                })}
                {renderBillingField("country", t("billingCountry"), {
                  autoCapitalize: "characters",
                })}

                {billingForm.billingType === "corporate" ? (
                  <View style={styles.billingCorporateSection}>
                    {renderBillingField("companyName", t("billingCompanyName"))}
                    {renderBillingField("companyVat", t("billingCompanyVat"), {
                      autoCapitalize: "characters",
                    })}
                    {renderBillingField("companyReg", t("billingCompanyReg"), {
                      autoCapitalize: "characters",
                    })}
                    {renderBillingField("companyAddress", t("billingCompanyAddress"), {
                      autoCapitalize: "sentences",
                      multiline: true,
                    })}
                  </View>
                ) : null}
              </ScrollView>

              <View style={styles.billingActionsRow}>
                <TouchableOpacity
                  style={styles.billingCancelButton}
                  disabled={isPurchaseBusy}
                  onPress={() => setBillingModalVisible(false)}
                >
                  <Text style={styles.billingCancelButtonText}>{t("billingCancel")}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.billingSubmitButton,
                    isPurchaseBusy ? styles.billingSubmitButtonDisabled : null,
                  ]}
                  disabled={isPurchaseBusy}
                  onPress={() => {
                    void handleSubmitBillingAndCheckout();
                  }}
                >
                  {isPurchaseBusy ? (
                    <ActivityIndicator size="small" color="#3d2f19" />
                  ) : (
                    <Text style={styles.billingSubmitButtonText}>
                      {t("billingContinueToPayment")}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: contentBottomPadding }]}
        scrollIndicatorInsets={{ bottom: contentBottomPadding }}
      >
        <View style={styles.topBar}>
          {course && !isIosCoursesFreeMode ? (
            <View style={styles.priceChip}>
              <Text style={styles.priceChipText}>
                {effectiveHasAccess
                  ? t("accessGrantedTitle")
                  : formatPrice(course.price, course.currency, language)}
              </Text>
            </View>
          ) : null}

          {!isIosCoursesFreeMode ? (
            <TouchableOpacity
              style={styles.purchasedLink}
              onPress={() => navigation.navigate(ROUTE_COURSE_PURCHASED)}
            >
              <Text style={styles.purchasedLinkText}>{t("purchased")}</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {detailLoading && !courseState ? (
          <View style={styles.centeredState}>
            <ActivityIndicator size="large" color="#c69a45" />
            <Text style={styles.centeredText}>{t("loadingCourse")}</Text>
          </View>
        ) : null}

        {detailError && !courseState ? (
          <View style={styles.errorStateBox}>
            <Text style={styles.centeredTitle}>{t("loadCourseErrorTitle")}</Text>
            <Text style={styles.centeredText}>{detailError.message}</Text>
            <TouchableOpacity style={styles.backToListButton} onPress={handleRetryDetail}>
              <Text style={styles.backToListButtonText}>{t("retry")}</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {course ? (
          <View style={[styles.layout, isWideLayout ? styles.layoutWide : styles.layoutMobile]}>
            <View style={styles.mainColumn}>
              <CourseVideoCard
                course={course}
                locale={language}
                hasAccess={effectiveHasAccess}
                playback={playback}
                playbackLoading={playbackLoading}
                playbackError={playbackError?.message || null}
                lockedMessage={
                  isIosCoursesFreeMode
                    ? undefined
                    : isIos && !currentUser
                      ? t("loginRequiredDescription")
                      : undefined
                }
                allowPreviewFallbackWhenUnlocked={isIosCoursesFreeMode}
                onRetryPlayback={handleRetryPlayback}
              />

              <View style={styles.contentCard}>
                <Text style={styles.courseTitle}>{course.title}</Text>
                <Text style={styles.courseSubtitle}>
                  {getFallbackText(course.description, t("courseDetailsSoon"))}
                </Text>

                <CourseTabs activeTab={activeTab} locale={language} onChange={setActiveTab} />

                <View style={styles.contentActionsRow}>
                  <TouchableOpacity
                    style={styles.contentActionButton}
                    onPress={() => handleAddToCalendar(course)}
                  >
                    <Ionicons name="calendar-outline" size={17} color="#4f3f2b" />
                    <Text style={styles.contentActionLabel}>{t("addToCalendar")}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.contentActionButton} onPress={() => handleShare(course)}>
                    <Ionicons name="share-social-outline" size={17} color="#4f3f2b" />
                    <Text style={styles.contentActionLabel}>{t("share")}</Text>
                  </TouchableOpacity>
                </View>

                {shareFeedback ? <Text style={styles.shareFeedback}>{shareFeedback}</Text> : null}

                {activeTab === "materials" ? (
                  <CourseMaterialsPanel
                    locale={language}
                    lessons={course.curriculumLessons || []}
                    sectionSummary={course.description}
                  />
                ) : null}

                {activeTab === "notes" ? (
                  <View style={styles.richTextBox}>
                    <Text style={styles.richText}>
                      {getFallbackText(course.notesContent, t("notesUnavailable"))}
                    </Text>
                  </View>
                ) : null}

                {activeTab === "curriculum" ? (
                  <View style={styles.curriculumTabContainer}>
                    <CourseSidebarCurriculum
                      locale={language}
                      lessons={course.curriculumLessons || []}
                      hasAccess={effectiveHasAccess}
                      onPressCertificate={() => {
                        void handleDownloadCertificate();
                      }}
                      certificateLoading={certificateDownloading}
                      certificateEnabled={effectiveHasAccess}
                    />
                  </View>
                ) : null}
              </View>

              {purchaseBox}
            </View>
          </View>
        ) : null}
      </ScrollView>

      <View pointerEvents="box-none" style={styles.overlayLayer}>
        {floatingButtonVisible ? (
          <TouchableOpacity
            style={[
              styles.floatingPurchaseButton,
              { bottom: floatingBottom },
              isPurchaseBusy ? styles.floatingPurchaseButtonDisabled : null,
            ]}
            disabled={isPurchaseBusy}
            onPress={handleFloatingPurchasePress}
          >
            {isPurchaseBusy ? (
              <ActivityIndicator size="small" color="#3d2f19" />
            ) : (
              <>
                <Ionicons name="card-outline" size={18} color="#3d2f19" />
                <Text style={styles.floatingPurchaseButtonText}>{t("purchase")}</Text>
              </>
            )}
          </TouchableOpacity>
        ) : null}

        {checkoutSnackbarVisible ? (
          <View style={[styles.checkoutSnackbarContainer, { bottom: checkoutSnackbarBottom }]}>
            <Snackbar
              visible={checkoutSnackbarVisible}
              onDismiss={handleDismissCheckoutSnackbar}
              duration={checkoutSnackbarDuration}
              style={[
                styles.checkoutSnackbar,
                checkoutSnackbarTone === "success" ? styles.checkoutSnackbarSuccess : null,
                checkoutSnackbarTone === "warning" ? styles.checkoutSnackbarWarning : null,
                checkoutSnackbarTone === "error" ? styles.checkoutSnackbarError : null,
                checkoutSnackbarTone === "info" ? styles.checkoutSnackbarInfo : null,
              ]}
              action={
                checkoutSnackbarTone === "error"
                  ? {
                      label: t("closeToast"),
                      onPress: handleDismissCheckoutSnackbar,
                    }
                  : undefined
              }
            >
              {checkoutSnackbarMessage}
            </Snackbar>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f9f3e5",
  },
  checkoutWebViewSafeArea: {
    flex: 1,
    backgroundColor: "#f9f3e5",
  },
  checkoutWebViewHeader: {
    minHeight: 52,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e3d5b8",
    backgroundColor: "#fff4df",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  checkoutWebViewCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3e6cf",
    borderWidth: 1,
    borderColor: "#deca9d",
  },
  checkoutWebViewTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4f3f2b",
  },
  checkoutWebViewHeaderSpacer: {
    width: 36,
    height: 36,
  },
  checkoutWebViewLoader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9f3e5",
  },
  topBackButton: {
    position: "absolute",
    left: 12,
    zIndex: 30,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#efe5d3",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#dec79a",
  },
  scrollContent: {
    padding: 12,
    paddingTop: 60,
    paddingBottom: 26,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  priceChip: {
    borderRadius: 999,
    backgroundColor: "#dfb96b",
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  priceChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#3d2f19",
  },
  purchasedLink: {
    marginLeft: "auto",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d4b780",
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  purchasedLinkText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#5b4731",
  },
  layout: {
    gap: 12,
  },
  layoutWide: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  layoutMobile: {
    flexDirection: "column",
  },
  mainColumn: {
    flex: 2,
    gap: 12,
  },
  contentCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5d8bf",
    backgroundColor: "#fff",
    padding: 14,
  },
  courseTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#3f3322",
  },
  courseSubtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: "#665b4b",
  },
  contentActionsRow: {
    marginTop: 14,
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  contentActionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 8,
    backgroundColor: "#efe3cc",
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  contentActionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4f3f2b",
  },
  shareFeedback: {
    marginTop: 8,
    fontSize: 12,
    color: "#78674d",
  },
  richTextBox: {
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5d8bf",
    backgroundColor: "#faf6ec",
    padding: 12,
  },
  richText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#5f5447",
  },
  curriculumTabContainer: {
    marginTop: 16,
  },
  statusBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 5,
  },
  statusBoxWarning: {
    borderColor: "#ead39a",
    backgroundColor: "#fff7dc",
  },
  statusBoxSuccess: {
    borderColor: "#b6e0bc",
    backgroundColor: "#ebf9ee",
  },
  statusBoxNeutral: {
    borderColor: "#d8c9aa",
    backgroundColor: "#f8f3e6",
  },
  statusTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#4a3b28",
  },
  statusText: {
    fontSize: 13,
    lineHeight: 18,
    color: "#655a49",
  },
  centeredState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
    gap: 10,
  },
  centeredTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#4b3f2d",
    textAlign: "center",
  },
  centeredText: {
    fontSize: 13,
    color: "#6d6353",
    textAlign: "center",
    lineHeight: 18,
  },
  backToListButton: {
    borderRadius: 8,
    backgroundColor: "#dfb66c",
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  backToListButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#3d2f19",
  },
  errorStateBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e4c8a2",
    backgroundColor: "#fff7e8",
    padding: 14,
    alignItems: "center",
    gap: 7,
  },
  billingModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 20,
  },
  billingModalKeyboard: {
    width: "100%",
    maxHeight: "96%",
    justifyContent: "center",
  },
  billingModalCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e0cc9f",
    backgroundColor: "#fffaf0",
    padding: 14,
    gap: 10,
  },
  billingModalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#453823",
    textAlign: "center",
  },
  billingModalSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    color: "#6d5a3f",
    textAlign: "center",
  },
  billingTypeRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 2,
  },
  billingTypeChip: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d9c39a",
    backgroundColor: "#f8efd9",
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  billingTypeChipActive: {
    backgroundColor: "#e5bb70",
    borderColor: "#cda15a",
  },
  billingTypeChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6a5538",
  },
  billingTypeChipTextActive: {
    color: "#3e301d",
  },
  billingFormScroll: {
    maxHeight: 420,
  },
  billingFormScrollContent: {
    paddingBottom: 6,
    gap: 8,
  },
  billingFieldGroup: {
    gap: 4,
  },
  billingFieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#69563a",
  },
  billingInput: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d8c5a0",
    backgroundColor: "#fff",
    color: "#453620",
    paddingHorizontal: 11,
    paddingVertical: 9,
    fontSize: 14,
  },
  billingInputMultiline: {
    minHeight: 74,
    textAlignVertical: "top",
  },
  billingInputError: {
    borderColor: "#b94747",
    backgroundColor: "#fff4f4",
  },
  billingFieldError: {
    fontSize: 11,
    color: "#b94747",
  },
  billingCorporateSection: {
    marginTop: 4,
    gap: 8,
  },
  billingActionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
  },
  billingCancelButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d5c19a",
    backgroundColor: "#f4ead4",
    alignItems: "center",
    justifyContent: "center",
  },
  billingCancelButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#5f4a31",
  },
  billingSubmitButton: {
    flex: 1.4,
    minHeight: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#c49a56",
    backgroundColor: "#e2b86f",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  billingSubmitButtonDisabled: {
    opacity: 0.7,
  },
  billingSubmitButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#3c2e1a",
    textAlign: "center",
  },
  overlayLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  floatingPurchaseButton: {
    position: "absolute",
    right: 16,
    zIndex: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 52,
    borderRadius: 999,
    paddingHorizontal: 18,
    backgroundColor: "#deb66c",
    borderWidth: 1,
    borderColor: "#c9a05b",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  floatingPurchaseButtonDisabled: {
    opacity: 0.75,
  },
  floatingPurchaseButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#3d2f19",
  },
  checkoutSnackbarContainer: {
    position: "absolute",
    left: 12,
    right: 12,
    zIndex: 35,
  },
  checkoutSnackbar: {
    borderRadius: 12,
  },
  checkoutSnackbarInfo: {
    backgroundColor: "#4d5f7f",
  },
  checkoutSnackbarSuccess: {
    backgroundColor: "#2d6c40",
  },
  checkoutSnackbarWarning: {
    backgroundColor: "#8d6a1b",
  },
  checkoutSnackbarError: {
    backgroundColor: "#8b2f2f",
  },
});

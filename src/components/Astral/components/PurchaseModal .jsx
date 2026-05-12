import React, { useEffect, useState } from "react";
import {
  Modal,
  Text,
  StyleSheet,
  View,
  TextInput,
  Alert,
  ScrollView,
  TouchableOpacity, // Importăm ScrollView
} from "react-native";
import PhoneInput from "react-native-international-phone-number";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc } from "firebase/firestore";
import { Dropdown } from "react-native-element-dropdown";
import { db } from "../../../../firebase";
import { Button } from "../../../components/commonButton";
import { colors } from "../../../utils/colors";
import { trackedGetDoc } from "../../../utils/firestoreReadTelemetry";
import { useTranslation } from "../../../utils/translateUtil";
import { useLanguage } from "../../../context/LanguageContext";

const COUPON_COLLECTION = "coupons";
const COUPON_DOC_ID = "singleton";
const HARDCODED_FIXED_COUPONS = {
  TEST2LEI: { finalBani: 100, finalLabel: "1.00 \u20ac" },
  TEST3LEI: { finalBani: 60, finalLabel: "0.60 \u20ac" }, // ~3 lei
};
const DEFAULT_INVOICE_COUNTRY = "Romania";
const TERMS_VERSION = "2026-04-02";
const PRIVACY_VERSION = "2026-04-02";
const ROMANIAN_COUNTY_OPTIONS = [
  { label: "Alba", value: "Alba" },
  { label: "Arad", value: "Arad" },
  { label: "Argeș", value: "Argeș" },
  { label: "Bacău", value: "Bacău" },
  { label: "Bihor", value: "Bihor" },
  { label: "Bistrița-Năsăud", value: "Bistrița-Năsăud" },
  { label: "Botoșani", value: "Botoșani" },
  { label: "Brăila", value: "Brăila" },
  { label: "Brașov", value: "Brașov" },
  { label: "București", value: "Bucuresti" },
  { label: "Buzău", value: "Buzău" },
  { label: "Călărași", value: "Călărași" },
  { label: "Caraș-Severin", value: "Caraș-Severin" },
  { label: "Cluj", value: "Cluj" },
  { label: "Constanța", value: "Constanța" },
  { label: "Covasna", value: "Covasna" },
  { label: "Dâmbovița", value: "Dâmbovița" },
  { label: "Dolj", value: "Dolj" },
  { label: "Galați", value: "Galați" },
  { label: "Giurgiu", value: "Giurgiu" },
  { label: "Gorj", value: "Gorj" },
  { label: "Harghita", value: "Harghita" },
  { label: "Hunedoara", value: "Hunedoara" },
  { label: "Ialomița", value: "Ialomița" },
  { label: "Iași", value: "Iași" },
  { label: "Ilfov", value: "Ilfov" },
  { label: "Maramureș", value: "Maramureș" },
  { label: "Mehedinți", value: "Mehedinți" },
  { label: "Mureș", value: "Mureș" },
  { label: "Neamț", value: "Neamț" },
  { label: "Olt", value: "Olt" },
  { label: "Prahova", value: "Prahova" },
  { label: "Sălaj", value: "Sălaj" },
  { label: "Satu Mare", value: "Satu Mare" },
  { label: "Sibiu", value: "Sibiu" },
  { label: "Suceava", value: "Suceava" },
  { label: "Teleorman", value: "Teleorman" },
  { label: "Timiș", value: "Timiș" },
  { label: "Tulcea", value: "Tulcea" },
  { label: "Vâlcea", value: "Vâlcea" },
  { label: "Vaslui", value: "Vaslui" },
  { label: "Vrancea", value: "Vrancea" },
];
const BUCHAREST_SECTOR_OPTIONS = Array.from({ length: 6 }, (_, index) => ({
  label: `Sector ${index + 1}`,
  value: `Sector ${index + 1}`,
}));
const COUNTRY_NAMES = [
  "Romania",
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Ivory Coast",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Kosovo",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Korea",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Palestine",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Korea",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Timor-Leste",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
];
const COUNTRY_SEARCH_ALIASES = {
  Romania: "romania românia ro roumania roumanie",
  Moldova: "moldova republic of moldova republica moldova md",
  Germany: "germany germania deutschland de",
  Italy: "italy italia it",
  Spain: "spain espana españa spania es",
  France: "france franta franța fr",
  "United Kingdom": "united kingdom uk great britain britain marea britanie anglia",
  "United States": "united states usa us america statele unite",
  Netherlands: "netherlands holland olanda nl",
  Austria: "austria at",
  Belgium: "belgium belgia be",
  Switzerland: "switzerland elvetia suisse schweiz ch",
  Greece: "greece grecia hellas gr",
  Hungary: "hungary ungaria hu",
  Poland: "poland polonia pl",
  Bulgaria: "bulgaria bg",
  Turkey: "turkey turcia tr",
  "Czech Republic": "czech republic czechia cehia cz",
  Slovakia: "slovakia slovacia sk",
  Slovenia: "slovenia si",
  Croatia: "croatia croatia hr",
  Serbia: "serbia rs",
  Ukraine: "ukraine ucraina ua",
  Russia: "russia rusia ru",
  Belarus: "belarus belarusia by",
  Norway: "norway norvegia no",
  Sweden: "sweden suedia se",
  Denmark: "denmark danemarca dk",
  Finland: "finland finlanda fi",
  Ireland: "ireland irlanda ie",
  Portugal: "portugal pt",
  Canada: "canada ca",
  Australia: "australia au",
  "New Zealand": "new zealand noua zeelanda nz",
  "United Arab Emirates": "uae emiratele arabe unite ae",
  "Saudi Arabia": "saudi arabia arabia saudita sa",
  Israel: "israel il",
};

const normalizeInvoiceText = (value) =>
  String(value || "")
    .trim()
    .replace(/\s+/g, " ");

const stripDiacritics = (value) =>
  normalizeInvoiceText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const extractBucharestSector = (value) => {
  const normalizedValue = stripDiacritics(value).toLowerCase();
  const sectorMatch = normalizedValue.match(/sector(?:ul)?\s*([1-6])/);
  return sectorMatch ? `Sector ${sectorMatch[1]}` : "";
};

const normalizeInvoiceCountry = (value) => {
  const cleanedValue = normalizeInvoiceText(value);
  const normalizedValue = stripDiacritics(cleanedValue).toLowerCase();

  if (!cleanedValue) {
    return "";
  }

  if (normalizedValue === "ro" || normalizedValue === "romania") {
    return DEFAULT_INVOICE_COUNTRY;
  }

  return cleanedValue;
};

const normalizeInvoiceState = (value) => {
  const cleanedValue = normalizeInvoiceText(value);
  const normalizedValue = stripDiacritics(cleanedValue).toLowerCase();
  const sector = extractBucharestSector(cleanedValue);

  if (!cleanedValue) {
    return "";
  }

  if (
    sector ||
    normalizedValue === "bucuresti" ||
    normalizedValue === "municipiul bucuresti" ||
    normalizedValue.startsWith("bucuresti sector")
  ) {
    return "Bucuresti";
  }

  return cleanedValue;
};

const normalizeInvoiceCity = (value, stateValue) => {
  const cleanedValue = normalizeInvoiceText(value);
  const sectorFromCity = extractBucharestSector(cleanedValue);
  const sectorFromState = extractBucharestSector(stateValue);

  if (sectorFromCity) {
    return sectorFromCity;
  }

  if (sectorFromState) {
    return sectorFromState;
  }

  return cleanedValue;
};

const normalizeInvoicePostalCode = (value) =>
  normalizeInvoiceText(value).replace(/\s+/g, "");

const findOptionValue = (options, value) => {
  const normalizedValue = stripDiacritics(value).toLowerCase();

  if (!normalizedValue) {
    return "";
  }

  const match = options.find((option) => {
    const normalizedOptionValue = stripDiacritics(option.value).toLowerCase();
    const normalizedOptionLabel = stripDiacritics(option.label).toLowerCase();

    return (
      normalizedValue === normalizedOptionValue ||
      normalizedValue === normalizedOptionLabel
    );
  });

  return match ? match.value : "";
};

const isInvoiceCountryRomania = (value) =>
  stripDiacritics(normalizeInvoiceCountry(value)).toLowerCase() === "romania";

const isInvoiceStateBucharest = (value) =>
  stripDiacritics(normalizeInvoiceState(value)).toLowerCase() === "bucuresti";

const COUNTRY_OPTIONS = COUNTRY_NAMES.map((name) => ({
  label: name,
  value: name,
  searchText: `${name} ${COUNTRY_SEARCH_ALIASES[name] || ""}`.trim(),
}));

const PurchaseModal = ({
  visible,
  onDismiss,
  onConfirm,
  baseAmountBani,
  email,
  setEmail,
  phone,
  setPhone,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  line1,
  setLine1,
  city,
  setCity,
  stateCounty,
  setStateCounty,
  postalCode,
  setPostalCode,
  country,
  setCountry,
  couponCode,
  setCouponCode,
  couponPercent,
  setCouponPercent,
  couponAllowed,
  setCouponAllowed,
}) => {
  const [emailError, setEmailError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [addressErrorMessage, setAddressErrorMessage] = useState("");

  const [isChecked, setIsChecked] = useState(false);
  const [isDigitalContentWaiverChecked, setIsDigitalContentWaiverChecked] =
    useState(false);
  const [termsVisible, setTermsVisible] = useState(false); // Modal pentru Terms & Conditions

  const [selectedCountry, setSelectedCountry] = useState(null);

  const { language } = useLanguage();

  const [couponInput, setCouponInput] = useState(couponCode || "");
  const [couponStatus, setCouponStatus] = useState(""); // message to display
  const [couponLoading, setCouponLoading] = useState(false);
  const addressError = Boolean(addressErrorMessage);

  const baseBani =
    typeof baseAmountBani === "number" && Number.isFinite(baseAmountBani)
      ? baseAmountBani
      : null;
  // Amounts are in minor units (cents) and currency is EUR.
  const baseEurText = baseBani !== null ? (baseBani / 100).toFixed(2) : null;
  const appliedPct = couponAllowed ? Number(couponPercent) : 0;
  const computedFinalBani =
    baseBani !== null && Number.isFinite(appliedPct) && appliedPct > 0
      ? Math.max(1, Math.round((baseBani * (100 - appliedPct)) / 100))
      : baseBani;
  const finalEurText =
    computedFinalBani !== null ? (computedFinalBani / 100).toFixed(2) : null;
  const stripeMinEur = 0.5;
  const isBelowStripeMin =
    finalEurText !== null ? Number(finalEurText) < stripeMinEur : false;
  const normalizedCountryValue = normalizeInvoiceCountry(country);
  const selectedCountryOptionValue =
    findOptionValue(COUNTRY_OPTIONS, normalizedCountryValue) || null;
  const isRomaniaSelected = isInvoiceCountryRomania(normalizedCountryValue);
  const selectedRomanianCountyValue = isRomaniaSelected
    ? findOptionValue(
        ROMANIAN_COUNTY_OPTIONS,
        normalizeInvoiceState(stateCounty)
      ) || null
    : null;
  const isBucharestSelected =
    isRomaniaSelected &&
    isInvoiceStateBucharest(selectedRomanianCountyValue || stateCounty);
  const selectedBucharestSectorValue = isBucharestSelected
    ? findOptionValue(
        BUCHAREST_SECTOR_OPTIONS,
        normalizeInvoiceCity(city, selectedRomanianCountyValue || stateCounty)
      ) || null
    : null;

  const normalizeCoupon = (s) => String(s || "").trim().toUpperCase();

  useEffect(() => {
    if (visible && !normalizeInvoiceText(country)) {
      setCountry(DEFAULT_INVOICE_COUNTRY);
    }
  }, [visible, country, setCountry]);

  const buildNormalizedInvoiceDetails = () => {
    const normalizedFirstName = normalizeInvoiceText(firstName);
    const normalizedLastName = normalizeInvoiceText(lastName);
    const normalizedEmail = normalizeInvoiceText(email).toLowerCase();
    const normalizedPhone = normalizeInvoiceText(phone);
    const normalizedLine1 = normalizeInvoiceText(line1);
    const normalizedCountry = normalizeInvoiceCountry(country);
    const normalizedCityCandidate = normalizeInvoiceCity(city, stateCounty);
    const sectorFromCity = extractBucharestSector(normalizedCityCandidate);
    const normalizedStateBase = normalizeInvoiceState(
      sectorFromCity && !normalizeInvoiceText(stateCounty)
        ? sectorFromCity
        : stateCounty
    );
    const isRomania = isInvoiceCountryRomania(normalizedCountry);
    const normalizedState = isRomania
      ? findOptionValue(ROMANIAN_COUNTY_OPTIONS, normalizedStateBase) ||
        normalizedStateBase
      : normalizedStateBase;
    const normalizedCityBase = normalizeInvoiceCity(
      normalizedCityCandidate,
      normalizedState
    );
    const normalizedCity =
      isRomania && isInvoiceStateBucharest(normalizedState)
        ? findOptionValue(BUCHAREST_SECTOR_OPTIONS, normalizedCityBase) ||
          normalizedCityBase
        : normalizedCityBase;
    const normalizedPostalCode = normalizeInvoicePostalCode(postalCode);
    const isBucharest = isRomania && isInvoiceStateBucharest(normalizedState);
    const hasValidBucharestSector = /^Sector [1-6]$/i.test(normalizedCity);
    const hasKnownRomanianCounty = !isRomania
      ? true
      : Boolean(findOptionValue(ROMANIAN_COUNTY_OPTIONS, normalizedState));

    return {
      firstName: normalizedFirstName,
      lastName: normalizedLastName,
      email: normalizedEmail,
      phone: normalizedPhone,
      line1: normalizedLine1,
      city: normalizedCity,
      state: normalizedState,
      postalCode: normalizedPostalCode,
      country: normalizedCountry,
      isRomania,
      isBucharest,
      hasValidBucharestSector,
      hasKnownRomanianCounty,
    };
  };

  const applyCoupon = async () => {
    try {
      setCouponLoading(true);
      setCouponStatus("");
      const entered = normalizeCoupon(couponInput);
      if (!entered) {
        setCouponStatus("Introdu un cod de cupon.");
        return;
      }

      const hardcoded = HARDCODED_FIXED_COUPONS[entered];
      if (hardcoded) {
        const finalBani = Number(hardcoded.finalBani) || 0;
        const derivedPercent =
          baseBani !== null &&
          Number.isFinite(baseBani) &&
          baseBani > finalBani
            ? Number(
                (
                  ((baseBani - finalBani) / baseBani) *
                  100
                ).toFixed(2)
              )
            : 0;
        console.log("[COUPON] hardcoded fixed coupon applied", {
          code: entered,
          baseBani,
          finalBani,
          percentUsedForUi: derivedPercent,
        });
        setCouponAllowed(true);
        setCouponPercent(derivedPercent);
        setCouponCode(entered);
        setCouponStatus(
          `Cupon aplicat: pre\u021b final ${hardcoded.finalLabel || ""}`.trim()
        );
        return;
      }

      console.log("[COUPON] fetching coupon doc", `${COUPON_COLLECTION}/${COUPON_DOC_ID}`);
      const ref = doc(db, COUPON_COLLECTION, COUPON_DOC_ID);
      const snap = await trackedGetDoc(ref);
      if (!snap.exists()) {
        setCouponStatus("Cupon indisponibil momentan.");
        setCouponAllowed(false);
        setCouponPercent(0);
        setCouponCode("");
        return;
      }

      const data = snap.data() || {};
      const allowed = data.isCuponUsed === true; // as specified: true => can be used
      const storedCode = normalizeCoupon(data.cuponCode);
      const percent = Number(data.discountPercent);

      console.log("[COUPON] doc", { allowed, storedCode, percent });

      if (!allowed) {
        setCouponStatus("Cupon dezactivat.");
        setCouponAllowed(false);
        setCouponPercent(0);
        setCouponCode("");
        return;
      }
      if (!storedCode || entered !== storedCode) {
        setCouponStatus("Cod cupon invalid.");
        setCouponAllowed(false);
        setCouponPercent(0);
        setCouponCode("");
        return;
      }
      if (!Number.isFinite(percent) || percent <= 0 || percent >= 100) {
        setCouponStatus("Cupon invalid (procent).");
        setCouponAllowed(false);
        setCouponPercent(0);
        setCouponCode("");
        return;
      }

      setCouponAllowed(true);
      setCouponPercent(percent);
      setCouponCode(entered);
      setCouponStatus(`Cupon aplicat: -${percent}%`);
    } catch (e) {
      console.error("[COUPON] applyCoupon error", e);
      setCouponStatus("Eroare la verificarea cuponului.");
      setCouponAllowed(false);
      setCouponPercent(0);
      setCouponCode("");
    } finally {
      setCouponLoading(false);
    }
  };

  // Funcție de validare simplă
  const validateFields = () => {
    const normalizedDetails = buildNormalizedInvoiceDetails();
    let valid = true;

    if (!normalizedDetails.firstName || !normalizedDetails.lastName) {
      setNameError(true);
      valid = false;
    } else {
      setNameError(false);
    }

    if (!normalizedDetails.email || !/\S+@\S+\.\S+/.test(normalizedDetails.email)) {
      setEmailError(true);
      valid = false;
    } else {
      setEmailError(false);
    }

    if (!normalizedDetails.phone || normalizedDetails.phone.length < 9) {
      setPhoneError(true);
      valid = false;
    } else {
      setPhoneError(false);
    }

    if (
      !normalizedDetails.line1 ||
      !normalizedDetails.city ||
      !normalizedDetails.state ||
      !normalizedDetails.postalCode ||
      !normalizedDetails.country
    ) {
      setAddressErrorMessage(completeazaInfoText6);
      valid = false;
    } else if (
      normalizedDetails.isRomania &&
      !normalizedDetails.hasKnownRomanianCounty
    ) {
      setAddressErrorMessage(romanianCountyValidationText);
      valid = false;
    } else if (
      normalizedDetails.isRomania &&
      normalizedDetails.isBucharest &&
      !normalizedDetails.hasValidBucharestSector
    ) {
      setAddressErrorMessage(bucharestValidationText);
      valid = false;
    } else {
      setAddressErrorMessage("");
    }

    if (!isChecked) {
      Alert.alert(
        "Terms & Conditions",
        "You must accept the Terms & Conditions to proceed."
      );
      valid = false;
    }

    if (!isDigitalContentWaiverChecked) {
      Alert.alert(
        "Digital content",
        "You must confirm immediate delivery of digital content and waiver of the withdrawal right to proceed."
      );
      valid = false;
    }

    return {
      valid,
      normalizedDetails,
    };
  };

  const handleConfirm = async () => {
    const { valid, normalizedDetails } = validateFields();
    if (valid) {
      try {
        const acceptedAt = new Date().toISOString();
        // Datele introduse de user
        const updatedUserDetails = {
          firstName: normalizedDetails.firstName,
          lastName: normalizedDetails.lastName,
          email: normalizedDetails.email,
          phone: normalizedDetails.phone,
          line1: normalizedDetails.line1,
          city: normalizedDetails.city,
          state: normalizedDetails.state,
          postalCode: normalizedDetails.postalCode,
          country: normalizedDetails.country,
          coupon: {
            code: Boolean(couponAllowed)
              ? normalizeCoupon(couponCode || couponInput)
              : "",
            percent: couponPercent || 0,
            allowed: Boolean(couponAllowed),
          },
          legalAcceptance: {
            termsAccepted: true,
            termsVersion: TERMS_VERSION,
            privacyVersion: PRIVACY_VERSION,
            digitalContentWaiverAccepted: true,
            legalAcceptedAt: acceptedAt,
            immediateExecutionAcceptedAt: acceptedAt,
            withdrawalWaiverAcceptedAt: acceptedAt,
          },
        };

        console.log("[PURCHASE_MODAL] confirmed legal acceptance", {
          termsVersion: updatedUserDetails.legalAcceptance.termsVersion,
          privacyVersion: updatedUserDetails.legalAcceptance.privacyVersion,
          legalAcceptedAt: updatedUserDetails.legalAcceptance.legalAcceptedAt,
        });

        setFirstName(updatedUserDetails.firstName);
        setLastName(updatedUserDetails.lastName);
        setEmail(updatedUserDetails.email);
        setPhone(updatedUserDetails.phone);
        setLine1(updatedUserDetails.line1);
        setCity(updatedUserDetails.city);
        setStateCounty(updatedUserDetails.state);
        setPostalCode(updatedUserDetails.postalCode);
        setCountry(updatedUserDetails.country);

        // Salvăm local, dacă dorim
        await AsyncStorage.setItem(
          "userDetails",
          JSON.stringify(updatedUserDetails)
        );

        onConfirm(updatedUserDetails);
        onDismiss();
      } catch (error) {
        Alert.alert(
          "Eroare",
          "A apărut o problemă la actualizarea datelor. Te rugăm să încerci din nou."
        );
      }
    }
  };

  // Traduceri inline text
  const AchiziționatText = useTranslation(
    "Achiziționat",
    language,
    "PurchaseModal"
  );
  const NeachiziționatText = useTranslation(
    "Anuleaza",
    language,
    "PurchaseModal"
  );
  const completeazaInfoText = useTranslation(
    "Completează informațiile",
    language,
    "PurchaseModal"
  );
  const completeazaInfoText2 = useTranslation(
    "Te rugăm să completezi prenumele și numele.",
    language,
    "PurchaseModal"
  );
  const completeazaInfoText3 = useTranslation(
    "Te rugăm să introduci un email valid.",
    language,
    "PurchaseModal"
  );
  const completeazaInfoText4 = useTranslation(
    "Număr de telefon.",
    language,
    "PurchaseModal"
  );
  const completeazaInfoText5 = useTranslation(
    "Te rugăm să introduci un număr de telefon valid.",
    language,
    "PurchaseModal"
  );
  const completeazaInfoText6 = useTranslation(
    "Te rugăm să completezi toate câmpurile de adresă.",
    language,
    "PurchaseModal"
  );
  const bucharestValidationText = useTranslation(
    'Pentru București, completează la "Oraș" un sector (Sector 1-6) și la "Județ" valoarea "București".',
    language,
    "PurchaseModal"
  );
  const romanianCountyValidationText = useTranslation(
    "Pentru România, selectează județul din listă.",
    language,
    "PurchaseModal"
  );
  const invoiceAddressHintText = useTranslation(
    'Pentru facturare PF, folosește adresa completă. Dacă adresa este în București, completează "Oraș" cu Sector 1-6 și "Județ" cu București.',
    language,
    "PurchaseModal"
  );
  const termsText1 = useTranslation(
    "By purchasing this analysis, you accept the",
    language,
    "PurchaseModal"
  );
  const termsText2 = useTranslation(
    "Terms & Conditions",
    language,
    "PurchaseModal"
  );

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onDismiss}
      statusBarTranslucent
      presentationStyle="overFullScreen"
    >
      <View style={styles.overlay}>
        {/* Wrapper cu înălțime limitată ca să permită scroll-ul în interiorul modalului */}
        <View style={styles.modalWrapperCustom}>
          <ScrollView
            style={styles.modalScrollCustom}
            contentContainerStyle={styles.modalScrollContentCustom}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          >
          <View style={styles.modalContainerCustom}>
            <Text style={styles.modalTitleCustom}>{completeazaInfoText}:</Text>

            {/* NUME */}
            <TextInput
              style={[styles.inputCustom, nameError && styles.errorInputCustom]}
              placeholder="Prenume"
              value={firstName}
              onChangeText={(text) => {
                setFirstName(text);
                setNameError(false);
              }}
              onEndEditing={(event) => {
                setFirstName(normalizeInvoiceText(event.nativeEvent.text));
              }}
            />
            <TextInput
              style={[styles.inputCustom, nameError && styles.errorInputCustom]}
              placeholder="Nume"
              value={lastName}
              onChangeText={(text) => {
                setLastName(text);
                setNameError(false);
              }}
              onEndEditing={(event) => {
                setLastName(normalizeInvoiceText(event.nativeEvent.text));
              }}
            />
            {nameError && (
              <Text style={styles.errorTextCustom}>{completeazaInfoText2}</Text>
            )}

            {/* EMAIL */}
            <TextInput
              style={[styles.inputCustom, emailError && styles.errorInputCustom]}
              placeholder="Email"
              keyboardType="email-address"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setEmailError(false);
              }}
              onEndEditing={(event) => {
                setEmail(normalizeInvoiceText(event.nativeEvent.text).toLowerCase());
              }}
            />
            {emailError && (
              <Text style={styles.errorTextCustom}>{completeazaInfoText3}</Text>
            )}

            {/* TELEFON */}
            <View style={styles.phoneInputContainerCustom}>
              <PhoneInput
                value={phone}
                onChangePhoneNumber={setPhone}
                selectedCountry={selectedCountry}
                onChangeSelectedCountry={setSelectedCountry}
                defaultCountry="RO"
                placeholder={completeazaInfoText4}
                containerStyle={[styles.inputCustom, phoneError && styles.errorInputCustom]}
              />
              {phoneError && (
                <Text style={styles.errorTextCustom}>{completeazaInfoText5}</Text>
              )}
            </View>

            {/* ADRESĂ */}
            <TextInput
              style={[styles.inputCustom, addressError && styles.errorInputCustom]}
              placeholder="Strada și numărul"
              value={line1}
              onChangeText={(text) => {
                setLine1(text);
                setAddressErrorMessage("");
              }}
              onEndEditing={(event) => {
                setLine1(normalizeInvoiceText(event.nativeEvent.text));
              }}
            />
            <Dropdown
              style={[
                styles.dropdownFieldCustom,
                addressError && styles.errorInputCustom,
              ]}
              containerStyle={styles.dropdownMenuCustom}
              placeholderStyle={styles.dropdownPlaceholderCustom}
              selectedTextStyle={styles.dropdownSelectedTextCustom}
              itemTextStyle={styles.dropdownItemTextCustom}
              inputSearchStyle={styles.dropdownSearchInputCustom}
              data={COUNTRY_OPTIONS}
              labelField="label"
              valueField="value"
              searchField="searchText"
              value={selectedCountryOptionValue}
              placeholder="Selectează țara"
              search
              searchPlaceholder="Caută țara"
              onChange={(item) => {
                setCountry(item.value);
                setAddressErrorMessage("");
              }}
            />
            {isBucharestSelected ? (
              <Dropdown
                style={[
                  styles.dropdownFieldCustom,
                  addressError && styles.errorInputCustom,
                ]}
                containerStyle={styles.dropdownMenuCustom}
                placeholderStyle={styles.dropdownPlaceholderCustom}
                selectedTextStyle={styles.dropdownSelectedTextCustom}
                itemTextStyle={styles.dropdownItemTextCustom}
                data={BUCHAREST_SECTOR_OPTIONS}
                labelField="label"
                valueField="value"
                value={selectedBucharestSectorValue}
                placeholder="Selectează sectorul"
                onChange={(item) => {
                  setCity(item.value);
                  setAddressErrorMessage("");
                }}
              />
            ) : (
              <TextInput
                style={[styles.inputCustom, addressError && styles.errorInputCustom]}
                placeholder="Oraș / Sector (pentru București)"
                value={city}
                onChangeText={(text) => {
                  setCity(text);
                  setAddressErrorMessage("");
                }}
                onEndEditing={(event) => {
                  setCity(
                    normalizeInvoiceCity(event.nativeEvent.text, stateCounty)
                  );
                }}
              />
            )}
            {isRomaniaSelected ? (
              <Dropdown
                style={[
                  styles.dropdownFieldCustom,
                  addressError && styles.errorInputCustom,
                ]}
                containerStyle={styles.dropdownMenuCustom}
                placeholderStyle={styles.dropdownPlaceholderCustom}
                selectedTextStyle={styles.dropdownSelectedTextCustom}
                itemTextStyle={styles.dropdownItemTextCustom}
                data={ROMANIAN_COUNTY_OPTIONS}
                labelField="label"
                valueField="value"
                value={selectedRomanianCountyValue}
                placeholder="Selectează județul"
                search
                searchPlaceholder="Caută județul"
                onChange={(item) => {
                  const nextCountyValue = item.value;
                  const nextIsBucharest = isInvoiceStateBucharest(nextCountyValue);
                  const currentSectorValue = findOptionValue(
                    BUCHAREST_SECTOR_OPTIONS,
                    normalizeInvoiceCity(city, stateCounty)
                  );

                  setStateCounty(nextCountyValue);
                  setAddressErrorMessage("");

                  if (nextIsBucharest) {
                    if (currentSectorValue) {
                      setCity(currentSectorValue);
                    } else if (normalizeInvoiceText(city)) {
                      setCity("");
                    }
                    return;
                  }

                  if (currentSectorValue) {
                    setCity("");
                  }
                }}
              />
            ) : (
              <TextInput
                style={[styles.inputCustom, addressError && styles.errorInputCustom]}
                placeholder="Județ / Stat / Provincie"
                value={stateCounty}
                onChangeText={(text) => {
                  setStateCounty(text);
                  setAddressErrorMessage("");
                }}
                onEndEditing={(event) => {
                  const normalizedState = normalizeInvoiceState(event.nativeEvent.text);
                  const normalizedCity = normalizeInvoiceCity(city, normalizedState);
                  setStateCounty(normalizedState);
                  if (normalizedCity && normalizedCity !== city) {
                    setCity(normalizedCity);
                  }
                }}
              />
            )}
            <TextInput
              style={[styles.inputCustom, addressError && styles.errorInputCustom]}
              placeholder="Cod Poștal"
              keyboardType="numbers-and-punctuation"
              value={postalCode}
              onChangeText={(text) => {
                setPostalCode(text);
                setAddressErrorMessage("");
              }}
              onEndEditing={(event) => {
                setPostalCode(normalizeInvoicePostalCode(event.nativeEvent.text));
              }}
            />
            <Text style={styles.addressHintTextCustom}>{invoiceAddressHintText}</Text>
            {addressError && (
              <Text style={styles.errorTextCustom}>{addressErrorMessage}</Text>
            )}

            <TextInput
              style={styles.inputCustom}
              placeholder="Cupon reducere"
              value={couponInput}
              onChangeText={(text) => setCouponInput(text)}
              autoCapitalize="characters"
            />
            
            <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
              <Button
                disabled={couponLoading}
                funCallback={applyCoupon}
                label={couponLoading ? "Verific..." : "Aplică cupon"}
                success={true}
                bgColor={colors.primary3}
                borderColor={colors.primary3}
                borderWidth={0.2}
                txtColor={colors.white}
              />
            </View>
            {couponStatus ? <Text style={styles.termsContentCustom}>{couponStatus}</Text> : null}
            {baseEurText ? (
              <View style={{ marginTop: 6 }}>
                <Text style={styles.priceTextCustom}>Preț: {baseEurText} €</Text>
                {couponAllowed && appliedPct > 0 && finalEurText ? (
                  <>
                    <Text style={styles.priceTextCustom}>
                      Preț final: {finalEurText} € (după -{appliedPct}%)
                    </Text>
                    {isBelowStripeMin ? (
                      <Text style={styles.priceWarnTextCustom}>
                        Atenție: Stripe are sumă minimă ~{stripeMinEur.toFixed(2)} €. Alege un cupon mai mic.
                      </Text>
                    ) : null}
                  </>
                ) : null}
              </View>
            ) : null}

            <View style={styles.checkboxContainerCustom}>
              <TouchableOpacity 
                style={styles.checkboxTouchableCustom}
                onPress={() => setIsChecked(!isChecked)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.checkboxCustom, 
                  isChecked && styles.checkboxCheckedCustom
                ]}>
                  {isChecked && (
                    <Text style={styles.checkmarkCustom}>✓</Text>
                  )}
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setTermsVisible(true)}>
                <Text style={styles.termsTextCustom}>
                  {termsText1}{" "}
                  <Text style={styles.termsLinkCustom}>{termsText2}</Text>
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.checkboxContainerCustom}>
              <TouchableOpacity
                style={styles.checkboxTouchableCustom}
                onPress={() =>
                  setIsDigitalContentWaiverChecked(!isDigitalContentWaiverChecked)
                }
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkboxCustom,
                    isDigitalContentWaiverChecked &&
                      styles.checkboxCheckedCustom,
                  ]}
                >
                  {isDigitalContentWaiverChecked && (
                    <Text style={styles.checkmarkCustom}>✓</Text>
                  )}
                </View>
              </TouchableOpacity>

              <View style={styles.checkboxTextBlockCustom}>
                <Text style={styles.termsTextCustom}>
                  Confirm că solicit livrarea imediată a conținutului digital și
                  înțeleg că îmi pierd dreptul de retragere după începerea
                  furnizării.
                </Text>
              </View>
            </View>

            <View style={styles.buttonContainerCustom}>
              <Button
                disabled={!isChecked || !isDigitalContentWaiverChecked}
                funCallback={handleConfirm}
                label={AchiziționatText}
                success={true}
                bgColor={
                  isChecked && isDigitalContentWaiverChecked
                    ? colors.primary3
                    : "#ccc"
                }
                borderColor={colors.white}
                borderWidth={0.2}
                txtColor={colors.white}
                style={styles.btnMargin}
              />

              <Button
                disabled={false}
                funCallback={onDismiss}
                label={NeachiziționatText}
                success={true}
                bgColor={colors.primary3}
                borderColor={colors.primary3}
                borderWidth={0.2}
                txtColor={colors.white}
              />
            </View>
          </View>
        </ScrollView>
        </View>

        <Modal
          transparent
          visible={termsVisible}
          animationType="slide"
          onRequestClose={() => setTermsVisible(false)}
        >
          <View style={styles.overlay}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
              <View style={styles.modalContainerCustom}>
                <Text style={styles.modalTitleCustom}>Terms & Conditions</Text>
                <Text style={styles.termsContentCustom}>
                  - By completing a purchase, you agree to the processing of
                  your personal data in accordance with our Privacy Policy and
                  applicable laws.
                  {"\n\n"}- Your email and phone number are collected solely for
                  the purpose of order confirmation, service delivery, and
                  customer support.
                  {"\n\n"}- We do not share your personal data with third
                  parties unless required by law or necessary for payment
                  processing and order fulfillment.
                  {"\n\n"}- Payments are processed securely through encrypted
                  channels. Refunds and cancellations are subject to our Refund
                  Policy.
                  {"\n\n"}- GDPR Compliance: You have the right to access,
                  modify, delete, or restrict the processing of your personal
                  data. You can exercise these rights by contacting our support
                  team.
                  {"\n\n"}- By confirming the purchase, you expressly request
                  immediate delivery of digital content and acknowledge that the
                  right of withdrawal ends once delivery has started.
                </Text>

                <Button
                  funCallback={() => setTermsVisible(false)}
                  label="Close"
                />
              </View>
            </ScrollView>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

export default PurchaseModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    paddingVertical: 24,
  },
  modalWrapperCustom: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    maxHeight: "92%",
  },
  modalScrollCustom: {
    width: "100%",
  },
  modalScrollContentCustom: {
    paddingBottom: 18,
    alignItems: "center",
  },
  modalContainerCustom: {
    backgroundColor: '#FAF7F2',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#FFD700',
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  modalTitleCustom: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFD700',
    fontFamily: 'Lora',
    marginBottom: 18,
    textAlign: 'center',
  },
  inputCustom: {
    backgroundColor: '#fffbe6',
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    fontFamily: 'Lora',
    color: '#131523',
    fontSize: 15,
  },
  dropdownFieldCustom: {
    backgroundColor: '#fffbe6',
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 8,
    width: '100%',
    paddingHorizontal: 10,
    minHeight: 46,
    marginBottom: 10,
  },
  dropdownMenuCustom: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFD700',
    backgroundColor: '#fffbe6',
  },
  dropdownPlaceholderCustom: {
    color: '#7a6d48',
    fontFamily: 'Lora',
    fontSize: 15,
  },
  dropdownSelectedTextCustom: {
    color: '#131523',
    fontFamily: 'Lora',
    fontSize: 15,
  },
  dropdownSearchInputCustom: {
    borderRadius: 8,
    borderColor: '#FFD700',
    fontFamily: 'Lora',
    color: '#131523',
    backgroundColor: '#fff',
  },
  dropdownItemTextCustom: {
    color: '#131523',
    fontFamily: 'Lora',
    fontSize: 15,
  },
  errorInputCustom: {
    borderColor: '#d9534f',
    backgroundColor: '#fff0f0',
  },
  errorTextCustom: {
    color: '#d9534f',
    fontSize: 13,
    marginBottom: 6,
    fontFamily: 'Lora',
  },
  addressHintTextCustom: {
    color: '#6b5f3c',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 8,
    fontFamily: 'Lora',
  },
  phoneInputContainerCustom: {
    marginBottom: 10,
  },
  checkboxContainerCustom: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  checkboxTouchableCustom: {
    marginRight: 8,
  },
  checkboxTextBlockCustom: {
    flex: 1,
  },
  checkboxCustom: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#FFD700',
    borderRadius: 4,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCheckedCustom: {
    backgroundColor: '#FFD700',
  },
  checkmarkCustom: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  termsTextCustom: {
    fontSize: 14,
    color: '#131523',
    fontFamily: 'Lora',
  },
  termsLinkCustom: {
    color: '#FFD700',
    textDecorationLine: 'underline',
    fontWeight: '700',
    fontFamily: 'Lora',
  },
  buttonContainerCustom: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
    marginTop: 18,
    gap: 10,
  },
  termsContentCustom: {
    fontSize: 14,
    marginVertical: 10,
    color: '#131523',
    fontFamily: 'Lora',
    textAlign: 'left',
  },
  priceTextCustom: {
    fontSize: 14,
    color: "#131523",
    fontFamily: "Lora",
    marginBottom: 4,
  },
  priceWarnTextCustom: {
    fontSize: 13,
    color: "#d9534f",
    fontFamily: "Lora",
    marginTop: 2,
  },
  btnMargin: {
    marginBottom: 10,
  },
});

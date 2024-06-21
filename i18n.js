import { getLocales, getCalendars } from "expo-localization";
import { I18n } from "i18n-js";
import { langObj } from "./src/utils/labels";
import { LocaleConfig } from "react-native-calendars";

const loc = getLocales();

const i18n = new I18n(langObj);

i18n.locale = loc[0].languageCode;

export default i18n;

export const actualLanguageCode = i18n.locale;

export let regionCode = loc[0].regionCode;

export let measurementSystem = loc[0].measurementSystem;

export let currencySymbol = loc[0].currencySymbol;

export let currencyCode = loc[0].currencyCode;

export let languageCode = loc[0].languageCode;

export let languageTag = loc[0].languageTag;

if (languageCode === "ro") {
  LocaleConfig.locales["ro"] = {
    monthNames: [
      "Ianuarie",
      "Februarie",
      "Martie",
      "Aprilie",
      "Mai",
      "Iunie",
      "Iulie",
      "August",
      "Septembrie",
      "Octombrie",
      "Noiembrie",
      "Decembrie",
    ],

    monthNamesShort: [
      "Ian",
      "Feb",
      "Mar",
      "Apr",
      "Mai",
      "Iun",
      "Iul",
      "Aug",
      "Sep",
      "Oct",
      "Noi",
      "Dec",
    ],
    dayNames: [
      "Duminică",
      "Luni",
      "Marți",
      "Miercuri",
      "Joi",
      "Vineri",
      "Sâmbătă",
    ],
    dayNamesShort: ["Dum", "Lun", "Mar", "Mie", "Joi", "Vin", "Sâm."],
    today: "Astăzi",
  };

  LocaleConfig.defaultLocale = languageCode;
}

export const getTimeZoneFromPhoneSettings = async () => {
  const locale = await getCalendars();
  const timeZone = locale[0].timeZone;

  return timeZone;
};

export const getUses24hourClockFromPhoneSettings = async () => {
  const locale = await getCalendars();
  const hourClock = locale[0].uses24hourClock;
  console.log("hour clock...");
  console.log(hourClock);

  return hourClock;
};

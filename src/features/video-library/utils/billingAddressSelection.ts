/**
 * Mirrors next-js/utils/billingAddressData.mjs selection + normalization (Expo client).
 * Country list comes from API; pass `countryOptions` into functions that need it.
 */

import type {
  BillingAddressOptionsResponse,
  BillingCountryOption,
} from "../services/billingAddressOptionsApi";

export const ROMANIA_COUNTRY_NAME = "Romania";
export const BUCHAREST_COUNTY_NAME = "Bucuresti";

export const BUCHAREST_SECTOR_OPTIONS = Object.freeze([
  "Sector 1",
  "Sector 2",
  "Sector 3",
  "Sector 4",
  "Sector 5",
  "Sector 6",
]);

const BUCHAREST_SECTOR_SET = new Set(BUCHAREST_SECTOR_OPTIONS);

function sanitizeString(value: unknown, maxLength = 255): string {
  if (typeof value !== "string") return "";
  const normalized = value.trim();
  if (!normalized) return "";
  return normalized.slice(0, maxLength);
}

function removeDiacritics(value: string): string {
  return sanitizeString(value, 255)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function simplifyValue(value: string): string {
  return removeDiacritics(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function normalizeOptionFromList(value: string, options: string[]): string {
  const normalizedValue = simplifyValue(value);
  if (!normalizedValue) return "";
  const match = options.find((option) => simplifyValue(option) === normalizedValue);
  return match || sanitizeString(value, 120);
}

export function normalizeCountrySelection(
  value: string,
  countryOptions: BillingCountryOption[]
): string {
  const sanitized = sanitizeString(value, 120);
  const simplified = simplifyValue(sanitized);
  if (!simplified) return "";
  if (simplified === "ro" || simplified === "romania") return ROMANIA_COUNTRY_NAME;

  const match = countryOptions.find(
    (option) =>
      simplifyValue(option.name) === simplified || simplifyValue(option.code) === simplified
  );

  return match?.name || sanitized;
}

export function isRomaniaCountry(value: string, countryOptions: BillingCountryOption[]): boolean {
  return normalizeCountrySelection(value, countryOptions) === ROMANIA_COUNTRY_NAME;
}

export function normalizeRomanianCounty(value: string, counties: string[]): string {
  const sanitized = sanitizeString(value, 120);
  const simplified = simplifyValue(sanitized);
  if (!simplified) return "";
  if (
    simplified === "bucuresti" ||
    simplified === "bucharest" ||
    simplified === "municipiul bucuresti"
  ) {
    return BUCHAREST_COUNTY_NAME;
  }
  return normalizeOptionFromList(sanitized, counties);
}

export function normalizeRomanianLocality(value: string, localities: string[]): string {
  const sanitized = sanitizeString(value, 120);
  const simplified = simplifyValue(sanitized);
  if (!simplified) return "";

  const sectorMatch = simplified.match(/^sector\s*([1-6])$/);
  if (sectorMatch) {
    return `Sector ${sectorMatch[1]}`;
  }
  if (simplified === "bucuresti" || simplified === "bucharest") {
    return BUCHAREST_COUNTY_NAME;
  }

  return normalizeOptionFromList(sanitized, localities);
}

export function getLocalitiesForCounty(
  localitiesByCounty: Record<string, string[]>,
  county: string
): string[] {
  const countyOptions = Object.keys(localitiesByCounty || {});
  const normalizedCounty = normalizeRomanianCounty(county, countyOptions);
  const list = localitiesByCounty[normalizedCounty];
  return Array.isArray(list) ? list : [];
}

export function getAddressSelectionAfterCountryChange(
  nextCountry: string,
  countryOptions: BillingCountryOption[]
): { billingCountry: string; billingCounty: string; billingCity: string } {
  return {
    billingCountry: normalizeCountrySelection(nextCountry, countryOptions),
    billingCounty: "",
    billingCity: "",
  };
}

export function getAddressSelectionAfterCountyChange({
  nextCounty,
  currentCity,
  localitiesByCounty,
}: {
  nextCounty: string;
  currentCity: string;
  localitiesByCounty: Record<string, string[]>;
}): { billingCounty: string; billingCity: string } {
  const countyOptions = Object.keys(localitiesByCounty || {});
  const normalizedCounty = normalizeRomanianCounty(nextCounty, countyOptions);
  const localityOptions = getLocalitiesForCounty(localitiesByCounty, normalizedCounty);
  const normalizedCity = normalizeRomanianLocality(currentCity, localityOptions);
  const isCurrentCityValid = localityOptions.some(
    (option) => simplifyValue(option) === simplifyValue(normalizedCity)
  );

  return {
    billingCounty: normalizedCounty,
    billingCity: isCurrentCityValid ? normalizedCity : "",
  };
}

export function normalizeBillingFormAddressFields(
  partial: { country: string; state: string; city: string },
  dataset: BillingAddressOptionsResponse
): { country: string; state: string; city: string } {
  const { countries, romania } = dataset;
  const country = normalizeCountrySelection(partial.country, countries);

  if (!isRomaniaCountry(country, countries)) {
    return {
      country,
      state: sanitizeString(partial.state, 120),
      city: sanitizeString(partial.city, 120),
    };
  }

  const countyList = romania.counties;
  const normalizedCounty = normalizeRomanianCounty(partial.state, countyList);
  const afterCounty = getAddressSelectionAfterCountyChange({
    nextCounty: normalizedCounty,
    currentCity: partial.city,
    localitiesByCounty: romania.localitiesByCounty,
  });

  return {
    country,
    state: afterCounty.billingCounty,
    city: afterCounty.billingCity,
  };
}

export function isValidBucharestLocality(
  country: string,
  state: string,
  city: string,
  dataset: BillingAddressOptionsResponse
): boolean {
  if (!isRomaniaCountry(country, dataset.countries)) return true;
  const county = normalizeRomanianCounty(state, dataset.romania.counties);
  if (county !== BUCHAREST_COUNTY_NAME) return true;
  const locality = normalizeRomanianLocality(city, [...BUCHAREST_SECTOR_OPTIONS]);
  return BUCHAREST_SECTOR_SET.has(locality);
}

export function countryNameToIso2(
  countryName: string,
  dataset: BillingAddressOptionsResponse | null
): string {
  if (!dataset?.countries?.length) {
    const simplified = simplifyValue(countryName);
    if (simplified === "romania" || simplified === "ro" || simplified === "românia") {
      return "RO";
    }
    const t = countryName.trim();
    return t.length === 2 ? t.toUpperCase() : "RO";
  }
  const normalized = normalizeCountrySelection(countryName, dataset.countries);
  const found = dataset.countries.find((c) => c.name === normalized);
  return found?.code?.toUpperCase() || "RO";
}

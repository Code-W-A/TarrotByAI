import { logError, logInfo, logWarn } from "../../../utils/Logger";
import { normalizeExpoApiBaseUrl } from "../../../utils/expoPublicApiBaseUrl";

export type BillingCountryOption = { code: string; name: string };

export type BillingAddressOptionsResponse = {
  countries: BillingCountryOption[];
  romania: {
    counties: string[];
    localitiesByCounty: Record<string, string[]>;
  };
};

export class BillingAddressOptionsError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "BillingAddressOptionsError";
    this.status = status;
  }
}

export function getApiBaseUrl(): string {
  const value =
    typeof process !== "undefined" ? process.env.EXPO_PUBLIC_API_BASE_URL : undefined;
  const resolved = normalizeExpoApiBaseUrl(String(value || ""));
  if (!resolved) {
    throw new BillingAddressOptionsError(0, "Missing EXPO_PUBLIC_API_BASE_URL");
  }
  return resolved;
}

export async function fetchBillingAddressOptions(): Promise<BillingAddressOptionsResponse> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/billing/address-options`;

  logInfo("[BillingAddressOptions] fetch start", { url });

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    const text = await response.text();
    let payload: unknown = null;
    try {
      payload = text ? JSON.parse(text) : null;
    } catch {
      payload = null;
    }

    if (!response.ok) {
      const message =
        typeof payload === "object" &&
        payload &&
        typeof (payload as Record<string, unknown>).error === "string"
          ? String((payload as Record<string, unknown>).error)
          : `Request failed with status ${response.status}`;
      logWarn("[BillingAddressOptions] fetch failed", { status: response.status, message });
      throw new BillingAddressOptionsError(response.status, message);
    }

    const record = payload as Record<string, unknown> | null;
    const countries = Array.isArray(record?.countries) ? record?.countries : [];
    const romaniaRaw =
      record?.romania && typeof record.romania === "object"
        ? (record.romania as Record<string, unknown>)
        : {};
    const counties = Array.isArray(romaniaRaw.counties) ? romaniaRaw.counties : [];
    const locMap =
      romaniaRaw.localitiesByCounty &&
      typeof romaniaRaw.localitiesByCounty === "object" &&
      !Array.isArray(romaniaRaw.localitiesByCounty)
        ? (romaniaRaw.localitiesByCounty as Record<string, unknown>)
        : {};

    const localitiesByCounty: Record<string, string[]> = {};
    Object.entries(locMap).forEach(([county, list]) => {
      localitiesByCounty[county] = Array.isArray(list)
        ? list.filter((item): item is string => typeof item === "string")
        : [];
    });

    const normalized: BillingAddressOptionsResponse = {
      countries: countries
        .map((item: unknown) => {
          if (!item || typeof item !== "object") return null;
          const o = item as Record<string, unknown>;
          const code = typeof o.code === "string" ? o.code.trim() : "";
          const name = typeof o.name === "string" ? o.name.trim() : "";
          if (!code || !name) return null;
          return { code, name };
        })
        .filter((item): item is BillingCountryOption => item !== null),
      romania: {
        counties: counties.filter((c): c is string => typeof c === "string"),
        localitiesByCounty,
      },
    };

    logInfo("[BillingAddressOptions] fetch ok", {
      countryCount: normalized.countries.length,
      countyCount: normalized.romania.counties.length,
    });

    return normalized;
  } catch (error) {
    if (error instanceof BillingAddressOptionsError) throw error;
    const message = error instanceof Error ? error.message : "Unknown request error";
    logError("[BillingAddressOptions] fetch error", { message });
    throw new BillingAddressOptionsError(0, message);
  }
}

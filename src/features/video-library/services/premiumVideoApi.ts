import { authentication } from "../../../../firebase";
import type { User } from "firebase/auth";
import type { BillingDetails } from "../../../types/courses";
import { normalizeExpoApiBaseUrl } from "../../../utils/expoPublicApiBaseUrl";
import { logError, logInfo, logWarn } from "../../../utils/Logger";
import type { Video, VideoLocales, VideoPlatform } from "../types/video";

export class PremiumVideoApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "PremiumVideoApiError";
    this.status = status;
    this.details = details;
  }
}

export interface PremiumVideoListResponse {
  videos: Video[];
  locale: string;
  premiumActive: boolean;
  loggedIn: boolean;
}

export interface PremiumVideoDetailResponse {
  video: Video;
  related: Video[];
  locale: string;
  availableLocales: string[];
  premiumActive: boolean;
  loggedIn: boolean;
}

export interface CreatePremiumPaymentSheetResponse {
  paymentIntentClientSecret?: string;
  customerEphemeralKeySecret?: string;
  customerId: string;
  paymentIntentId?: string;
  // Legacy fields for backwards compatibility
  setupIntentClientSecret?: string;
  setupIntentId?: string;
  subscriptionId?: string;
  premiumActive?: boolean;
  subscriptionStatus?: string | null;
}

export interface ConfirmPremiumSubscriptionResponse {
  subscriptionId: string;
  subscriptionStatus: string | null;
  premiumActive: boolean;
}

const DEFAULT_LOCALE = "ro";

const normalizeLocale = (value?: string | null): string => {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return DEFAULT_LOCALE;
  return raw.split("-")[0]?.toLowerCase() || DEFAULT_LOCALE;
};

const ensureBaseUrl = (): string => {
  const value =
    typeof process !== "undefined" ? process.env.EXPO_PUBLIC_API_BASE_URL : undefined;
  const resolved = normalizeExpoApiBaseUrl(String(value || ""));
  if (!resolved) {
    throw new PremiumVideoApiError(0, "Missing EXPO_PUBLIC_API_BASE_URL");
  }
  return resolved;
};

const joinUrl = (baseUrl: string, path: string): string =>
  path.startsWith("/") ? `${baseUrl}${path}` : `${baseUrl}/${path}`;

const withQuery = (
  url: string,
  query?: Record<string, string | number | boolean | undefined | null>
): string => {
  if (!query) return url;
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) params.append(key, String(value));
  });
  const queryString = params.toString();
  return queryString ? `${url}?${queryString}` : url;
};

const extractErrorMessage = (payload: unknown, fallback: string): string => {
  if (typeof payload === "string" && payload.trim()) return payload;
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (typeof record.error === "string" && record.error.trim()) return record.error;
    if (typeof record.message === "string" && record.message.trim()) return record.message;
  }
  return fallback;
};

const getAuthToken = async (
  authUser?: User | null,
  forceRefresh = false
): Promise<string | null> => {
  const user = authUser ?? authentication.currentUser;
  if (!user) return null;
  try {
    const token = await user.getIdToken(forceRefresh);
    if (typeof token !== "string" || !token.trim()) return null;
    return token.trim();
  } catch {
    return null;
  }
};

const normalizePlatform = (value: unknown): VideoPlatform => {
  return value === "bunny" || value === "vimeo" || value === "youtube"
    ? value
    : "youtube";
};

const mapLocalesFromApi = (raw: unknown): VideoLocales | undefined => {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const out: VideoLocales = {};
  for (const [key, val] of Object.entries(raw as Record<string, unknown>)) {
    if (!val || typeof val !== "object") continue;
    const v = val as Record<string, unknown>;
    const videoUrl = typeof v.videoUrl === "string" ? v.videoUrl.trim() : "";
    const title = typeof v.title === "string" ? v.title : "";
    const description = typeof v.description === "string" ? v.description : undefined;
    if (!videoUrl && !title.trim() && (description === undefined || description === "")) {
      continue;
    }
    out[key] = {
      title: title || "",
      ...(description !== undefined && description !== ""
        ? { description }
        : {}),
      ...(videoUrl ? { videoUrl } : {}),
    };
  }
  return Object.keys(out).length ? out : undefined;
};

const mapApiVideo = (raw: any): Video => {
  const embedSrc = typeof raw?.embedSrc === "string" && raw.embedSrc.trim()
    ? raw.embedSrc.trim()
    : null;

  /** Same raw URL as Next.js /videouri DTO and dashboard (Bunny play, YouTube, etc.) */
  const apiVideoUrl =
    typeof raw?.videoUrl === "string" && raw.videoUrl.trim()
      ? raw.videoUrl.trim()
      : "";

  const videoUrl = apiVideoUrl || embedSrc || "";

  return {
    id: String(raw?.id || ""),
    title: typeof raw?.title === "string" ? raw.title : "",
    description: typeof raw?.description === "string" ? raw.description : "",
    category: typeof raw?.category === "string" ? raw.category : "",
    thumbnailUrl:
      typeof raw?.thumbnailUrl === "string" && raw.thumbnailUrl.trim()
        ? raw.thumbnailUrl.trim()
        : undefined,
    platform: normalizePlatform(raw?.platform),
    videoUrl,
    locales: mapLocalesFromApi(raw?.locales),
    isPublished: true,
    isPremium: raw?.isPremium === true,
    durationSeconds:
      typeof raw?.durationSeconds === "number" ? raw.durationSeconds : null,
    order: typeof raw?.order === "number" ? raw.order : null,
    canPlay: raw?.canPlay !== false,
    embedSrc,
    lockedReason:
      typeof raw?.lockedReason === "string" && raw.lockedReason.trim()
        ? raw.lockedReason.trim()
        : null,
  };
};

const request = async <T,>(options: {
  method: "GET" | "POST";
  path: string;
  authMode?: "none" | "optional" | "required";
  authUser?: User | null;
  query?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
}): Promise<T> => {
  const { method, path, authMode = "none", authUser, query, body } = options;
  const baseUrl = ensureBaseUrl();
  const url = withQuery(joinUrl(baseUrl, path), query);
  const forceRefresh = authMode === "required";
  const token =
    authMode === "none" ? null : await getAuthToken(authUser, forceRefresh);

  if (authMode === "required" && !token) {
    throw new PremiumVideoApiError(401, "Authentication required");
  }

  /** Next.js / proxies: duplicate token so requireAuth can read body or x-firebase-id-token */
  const jsonBody = (() => {
    if (body === undefined) return undefined;
    if (
      token &&
      authMode === "required" &&
      body &&
      typeof body === "object" &&
      !Array.isArray(body)
    ) {
      return JSON.stringify({ ...(body as Record<string, unknown>), firebaseIdToken: token });
    }
    return JSON.stringify(body);
  })();

  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
    headers["X-Firebase-Id-Token"] = token;
  }
  if (body !== undefined) headers["Content-Type"] = "application/json";

  try {
    logInfo("[PremiumVideoApi] Request start", {
      method,
      path,
      hasAuth: Boolean(token),
      tokenLen: token ? token.length : 0,
      authUid: authUser?.uid ?? authentication.currentUser?.uid ?? null,
    });

    const response = await fetch(url, {
      method,
      headers,
      body: jsonBody,
    });

    const text = await response.text();
    let payload: unknown = null;
    try {
      payload = text ? JSON.parse(text) : null;
    } catch {
      payload = text;
    }

    logInfo("[PremiumVideoApi] Response received", {
      method,
      path,
      status: response.status,
      ok: response.ok,
      payloadKeys: payload && typeof payload === "object" ? Object.keys(payload as object) : null,
    });

    if (!response.ok) {
      const message = extractErrorMessage(
        payload,
        `Request failed with status ${response.status}`
      );
      logWarn("[PremiumVideoApi] Request failed", { method, path, status: response.status, message });
      if (
        response.status === 401 &&
        authMode === "required" &&
        (message === "Missing auth token" ||
          message === "Invalid auth token" ||
          message === "Unauthorized")
      ) {
        const retryToken = await getAuthToken(authUser, true);
        if (retryToken) {
          const retryJsonBody = (() => {
            if (body === undefined) return undefined;
            if (
              authMode === "required" &&
              body &&
              typeof body === "object" &&
              !Array.isArray(body)
            ) {
              return JSON.stringify({
                ...(body as Record<string, unknown>),
                firebaseIdToken: retryToken,
              });
            }
            return JSON.stringify(body);
          })();
          const retryHeaders: Record<string, string> = {
            Accept: "application/json",
            Authorization: `Bearer ${retryToken}`,
            "X-Firebase-Id-Token": retryToken,
          };
          if (body !== undefined) retryHeaders["Content-Type"] = "application/json";
          const retryResponse = await fetch(url, {
            method,
            headers: retryHeaders,
            body: retryJsonBody,
          });
          const retryText = await retryResponse.text();
          let retryPayload: unknown = null;
          try {
            retryPayload = retryText ? JSON.parse(retryText) : null;
          } catch {
            retryPayload = retryText;
          }
          if (retryResponse.ok) {
            return retryPayload as T;
          }
          const retryMessage = extractErrorMessage(
            retryPayload,
            `Request failed with status ${retryResponse.status}`
          );
          logWarn("[PremiumVideoApi] Request failed after token retry", {
            method,
            path,
            status: retryResponse.status,
            message: retryMessage,
          });
          throw new PremiumVideoApiError(retryResponse.status, retryMessage, retryPayload);
        }
      }
      throw new PremiumVideoApiError(response.status, message, payload);
    }

    return payload as T;
  } catch (error) {
    if (error instanceof PremiumVideoApiError) throw error;
    const message = error instanceof Error ? error.message : "Unknown request error";
    logError("[PremiumVideoApi] Request error", { method, path, message });
    throw new PremiumVideoApiError(0, message, error);
  }
};

export const getPremiumVideoLibrary = async (
  locale?: string | null
): Promise<PremiumVideoListResponse> => {
  const payload = await request<any>({
    method: "GET",
    path: "/api/premium/video-library",
    authMode: "optional",
    query: { locale: normalizeLocale(locale) },
  });

  return {
    videos: Array.isArray(payload?.videos) ? payload.videos.map(mapApiVideo) : [],
    locale: typeof payload?.locale === "string" ? payload.locale : normalizeLocale(locale),
    premiumActive: payload?.premiumActive === true,
    loggedIn: payload?.loggedIn === true,
  };
};

export const getPremiumVideoDetail = async (
  videoId: string,
  locale?: string | null
): Promise<PremiumVideoDetailResponse | null> => {
  if (!videoId?.trim()) return null;

  const payload = await request<any>({
    method: "GET",
    path: `/api/premium/video-library/${encodeURIComponent(videoId.trim())}`,
    authMode: "optional",
    query: { locale: normalizeLocale(locale) },
  });

  return {
    video: mapApiVideo(payload?.video),
    related: Array.isArray(payload?.related) ? payload.related.map(mapApiVideo) : [],
    locale: typeof payload?.locale === "string" ? payload.locale : normalizeLocale(locale),
    availableLocales: Array.isArray(payload?.availableLocales)
      ? payload.availableLocales.filter((item: unknown): item is string => typeof item === "string")
      : [],
    premiumActive: payload?.premiumActive === true,
    loggedIn: payload?.loggedIn === true,
  };
};

export const createPremiumPaymentSheet = (
  billingDetails: BillingDetails,
  authUser?: User | null
): Promise<CreatePremiumPaymentSheetResponse> => {
  return request<CreatePremiumPaymentSheetResponse>({
    method: "POST",
    path: "/api/stripe/premium/mobile/create-payment-sheet",
    authMode: "required",
    authUser,
    body: {
      platform: "expo",
      billingDetails,
    },
  });
};

export const confirmPremiumSubscription = (
  params: { paymentIntentId?: string; setupIntentId?: string; subscriptionId?: string },
  authUser?: User | null
): Promise<ConfirmPremiumSubscriptionResponse> => {
  return request<ConfirmPremiumSubscriptionResponse>({
    method: "POST",
    path: "/api/stripe/premium/mobile/confirm",
    authMode: "required",
    authUser,
    body: params,
  });
};

export interface PremiumPublicConfigResponse {
  subscriptionSystemEnabled: boolean;
}

export const fetchPremiumPublicConfig = (): Promise<PremiumPublicConfigResponse> => {
  return request<PremiumPublicConfigResponse>({
    method: "GET",
    path: "/api/premium/public-config",
    authMode: "none",
  });
};

export interface CreatePremiumPortalSessionResponse {
  url: string;
}

export const createPremiumBillingPortalSession = (
  flow: "default" | "cancel",
  authUser?: User | null
): Promise<CreatePremiumPortalSessionResponse> => {
  return request<CreatePremiumPortalSessionResponse>({
    method: "POST",
    path: "/api/stripe/premium/create-portal-session",
    authMode: "required",
    authUser,
    body: { flow },
  });
};

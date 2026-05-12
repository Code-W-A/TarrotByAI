import * as FileSystem from "expo-file-system";
import type {
  CourseCertificateDownloadResult,
  CourseStateResponse,
  CoursesHomeResponse,
  CoursesListResponse,
  CreateCheckoutSessionRequest,
  CreateCheckoutSessionResponse,
  PlaybackResponse,
  PurchasedCoursesResponse,
} from "../types/courses";
import { normalizeExpoApiBaseUrl } from "../utils/expoPublicApiBaseUrl";
import { logError, logInfo, logWarn } from "../utils/Logger";

export interface ListCoursesParams {
  locale?: string;
  featuredOnly?: boolean;
  limit?: number;
}

export interface CoursesApiConfig {
  baseUrl?: string;
  getAuthToken?: () => Promise<string | null>;
  fetchImpl?: typeof fetch;
}

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

type AuthMode = "none" | "optional" | "required";

const DEFAULT_LOCALE = "ro";
let requestSeq = 0;

export const normalizeLocale = (value?: string | null): string => {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) {
    return DEFAULT_LOCALE;
  }

  const [shortCode] = raw.split("-");
  return (shortCode || DEFAULT_LOCALE).toLowerCase();
};

const ensureBaseUrl = (baseUrl?: string): string => {
  const envBaseUrl =
    typeof process !== "undefined" ? process.env.EXPO_PUBLIC_API_BASE_URL : undefined;
  const resolved = normalizeExpoApiBaseUrl(
    (baseUrl || envBaseUrl || "").trim().replace(/\/+$/, "")
  );

  if (!resolved) {
    throw new Error("Missing EXPO_PUBLIC_API_BASE_URL");
  }

  return resolved;
};

const joinUrl = (baseUrl: string, path: string): string => {
  if (!path.startsWith("/")) {
    return `${baseUrl}/${path}`;
  }
  return `${baseUrl}${path}`;
};

const getAlternateBaseUrl = (baseUrl: string): string | null => {
  if (baseUrl.includes("://www.")) {
    return baseUrl.replace("://www.", "://");
  }

  const httpsPrefix = "https://";
  if (baseUrl.startsWith(httpsPrefix)) {
    const rest = baseUrl.slice(httpsPrefix.length);
    if (rest.length > 0 && !rest.startsWith("www.")) {
      return `${httpsPrefix}www.${rest}`;
    }
  }

  return null;
};

const withQuery = (
  base: string,
  queryParams?: Record<string, string | number | boolean | undefined | null>
): string => {
  if (!queryParams) {
    return base;
  }

  const query = new URLSearchParams();
  Object.entries(queryParams).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }
    query.append(key, String(value));
  });

  const queryString = query.toString();
  if (!queryString) {
    return base;
  }

  return `${base}?${queryString}`;
};

const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error) {
    return new ApiError(0, error.message, error);
  }

  return new ApiError(0, "Unknown request error", error);
};

const extractErrorMessage = (payload: unknown, fallback: string): string => {
  if (!payload) {
    return fallback;
  }

  if (typeof payload === "string") {
    return payload;
  }

  if (typeof payload === "object") {
    const maybeMessage = (payload as { message?: unknown }).message;
    if (typeof maybeMessage === "string" && maybeMessage.trim()) {
      return maybeMessage;
    }

    const maybeError = (payload as { error?: unknown }).error;
    if (typeof maybeError === "string" && maybeError.trim()) {
      return maybeError;
    }
  }

  return fallback;
};

const summarizePayload = (payload: unknown): Record<string, unknown> => {
  if (!payload || typeof payload !== "object") {
    return { type: typeof payload };
  }

  const candidate = payload as Record<string, unknown>;
  const summary: Record<string, unknown> = {
    keys: Object.keys(candidate),
  };

  if (Array.isArray(candidate.courses)) {
    summary.coursesCount = candidate.courses.length;
  }
  if (Array.isArray(candidate.purchases)) {
    summary.purchasesCount = candidate.purchases.length;
  }
  if (Array.isArray(candidate.latestCourses)) {
    summary.latestCoursesCount = candidate.latestCourses.length;
  }
  if (Array.isArray(candidate.featuredCourses)) {
    summary.featuredCoursesCount = candidate.featuredCourses.length;
  }
  if (candidate.course && typeof candidate.course === "object") {
    summary.courseId = (candidate.course as { id?: unknown }).id ?? null;
  }
  if (typeof candidate.hasAccess === "boolean") {
    summary.hasAccess = candidate.hasAccess;
  }
  if (typeof candidate.isVisible === "boolean") {
    summary.isVisible = candidate.isVisible;
  }
  if (typeof candidate.vimeoId === "string") {
    summary.hasPlaybackVimeoId = candidate.vimeoId.length > 0;
  }

  return summary;
};

const getHeaderValue = (
  headers: Record<string, string> | undefined,
  key: string
): string | null => {
  if (!headers) {
    return null;
  }

  const direct = headers[key];
  if (typeof direct === "string" && direct.trim()) {
    return direct.trim();
  }

  const lower = key.toLowerCase();
  const found = Object.entries(headers).find(
    ([headerKey, headerValue]) =>
      headerKey.toLowerCase() === lower &&
      typeof headerValue === "string" &&
      headerValue.trim().length > 0
  );

  return found ? found[1].trim() : null;
};

const sanitizeFileName = (value: string): string => {
  const safe = value.replace(/[^a-zA-Z0-9._-]+/g, "_").replace(/^_+|_+$/g, "");
  return safe || "course-certificate.pdf";
};

const extractFileNameFromDisposition = (disposition?: string | null): string | null => {
  if (!disposition) {
    return null;
  }

  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    try {
      return sanitizeFileName(decodeURIComponent(utf8Match[1]));
    } catch {
      return sanitizeFileName(utf8Match[1]);
    }
  }

  const filenameMatch = disposition.match(/filename=\"?([^\";]+)\"?/i);
  if (filenameMatch?.[1]) {
    return sanitizeFileName(filenameMatch[1]);
  }

  return null;
};

class CoursesApi {
  private readonly baseUrl: string;
  private readonly alternateBaseUrl: string | null;
  private readonly getAuthToken?: () => Promise<string | null>;
  private readonly fetchImpl: typeof fetch;

  constructor(config: CoursesApiConfig = {}) {
    this.baseUrl = ensureBaseUrl(config.baseUrl);
    this.alternateBaseUrl = getAlternateBaseUrl(this.baseUrl);
    this.getAuthToken = config.getAuthToken;
    this.fetchImpl = config.fetchImpl ?? fetch;

    logInfo("[CoursesApi] Initialized", {
      baseUrl: this.baseUrl,
      alternateBaseUrl: this.alternateBaseUrl,
      hasAuthTokenProvider: Boolean(this.getAuthToken),
    });
  }

  private async getAuthorizationHeader(authMode: AuthMode): Promise<string | null> {
    if (authMode === "none") {
      return null;
    }

    const token = this.getAuthToken ? await this.getAuthToken() : null;
    if (authMode === "required" && !token) {
      logWarn("[CoursesApi] Missing auth token for required endpoint");
      throw new ApiError(401, "Authentication required");
    }

    logInfo("[CoursesApi] Auth header resolution", {
      authMode,
      hasToken: Boolean(token),
    });

    return token ? `Bearer ${token}` : null;
  }

  private async request<T>(options: {
    method: "GET" | "POST";
    path: string;
    authMode?: AuthMode;
    query?: Record<string, string | number | boolean | undefined | null>;
    body?: unknown;
    baseUrlOverride?: string;
  }): Promise<T> {
    const {
      method,
      path,
      authMode = "none",
      query,
      body,
      baseUrlOverride,
    } = options;

    const requestId = `courses-${++requestSeq}-${Date.now().toString(36)}`;
    const startedAt = Date.now();
    const requestBaseUrl = (baseUrlOverride || this.baseUrl).replace(/\/+$/, "");

    try {
      const url = withQuery(joinUrl(requestBaseUrl, path), query);
      const authorization = await this.getAuthorizationHeader(authMode);

      logInfo("[CoursesApi] Request start", {
        requestId,
        method,
        path,
        baseUrl: requestBaseUrl,
        url,
        authMode,
        hasAuthorization: Boolean(authorization),
        queryKeys: query ? Object.keys(query).filter((key) => query[key] != null) : [],
        hasBody: body !== undefined,
      });

      const headers: Record<string, string> = {
        Accept: "application/json",
      };

      if (authorization) {
        headers.Authorization = authorization;
      }

      if (body !== undefined) {
        headers["Content-Type"] = "application/json";
      }

      const response = await this.fetchImpl(url, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });

      const text = await response.text();
      let payload: unknown = null;

      try {
        payload = text ? JSON.parse(text) : null;
      } catch {
        payload = text;
      }

      if (!response.ok) {
        logWarn("[CoursesApi] Request failed", {
          requestId,
          method,
          path,
          status: response.status,
          durationMs: Date.now() - startedAt,
          message: extractErrorMessage(payload, `Request failed with status ${response.status}`),
          payloadSummary: summarizePayload(payload),
        });
        throw new ApiError(
          response.status,
          extractErrorMessage(payload, `Request failed with status ${response.status}`),
          payload
        );
      }

      logInfo("[CoursesApi] Request success", {
        requestId,
        method,
        path,
        baseUrl: requestBaseUrl,
        status: response.status,
        durationMs: Date.now() - startedAt,
        payloadSummary: summarizePayload(payload),
      });

      return payload as T;
    } catch (error) {
      const apiError = toApiError(error);
      logError("[CoursesApi] Request error", {
        requestId,
        method,
        path,
        baseUrl: requestBaseUrl,
        status: apiError.status,
        message: apiError.message,
        durationMs: Date.now() - startedAt,
      });
      throw apiError;
    }
  }

  listCourses(params: ListCoursesParams = {}): Promise<CoursesListResponse> {
    const locale = normalizeLocale(params.locale);
    const limit =
      typeof params.limit === "number" && Number.isFinite(params.limit)
        ? Math.max(1, Math.floor(params.limit))
        : undefined;
    const query: Record<string, string | number | boolean | undefined | null> = {
      locale,
      limit,
    };

    if (params.featuredOnly === true) {
      // Send this flag only when true to avoid backend boolean parsing pitfalls
      // where the string "false" can be treated as truthy.
      query.featuredOnly = true;
    }

    return (async () => {
      const primary = await this.request<CoursesListResponse>({
        method: "GET",
        path: "/api/courses",
        authMode: "optional",
        query,
      });

      if ((primary.courses?.length ?? 0) > 0 || !this.alternateBaseUrl) {
        return primary;
      }

      logWarn("[CoursesApi] listCourses empty on primary host, retrying alternate host", {
        baseUrl: this.baseUrl,
        alternateBaseUrl: this.alternateBaseUrl,
        locale,
        limit,
      });

      const alternate = await this.request<CoursesListResponse>({
        method: "GET",
        path: "/api/courses",
        authMode: "optional",
        query,
        baseUrlOverride: this.alternateBaseUrl,
      });

      if ((alternate.courses?.length ?? 0) > 0) {
        logInfo("[CoursesApi] listCourses fallback host returned data", {
          baseUrl: this.baseUrl,
          alternateBaseUrl: this.alternateBaseUrl,
          locale,
          limit,
          coursesCount: alternate.courses.length,
        });
        return alternate;
      }

      return primary;
    })();
  }

  homeCourses(locale?: string): Promise<CoursesHomeResponse> {
    const normalizedLocale = normalizeLocale(locale);

    return (async () => {
      const primary = await this.request<CoursesHomeResponse>({
        method: "GET",
        path: "/api/courses/home",
        authMode: "optional",
        query: {
          locale: normalizedLocale,
        },
      });

      const primaryCount =
        (primary.latestCourses?.length ?? 0) + (primary.featuredCourses?.length ?? 0);
      if (primaryCount > 0 || !this.alternateBaseUrl) {
        return primary;
      }

      logWarn("[CoursesApi] homeCourses empty on primary host, retrying alternate host", {
        baseUrl: this.baseUrl,
        alternateBaseUrl: this.alternateBaseUrl,
        locale: normalizedLocale,
      });

      const alternate = await this.request<CoursesHomeResponse>({
        method: "GET",
        path: "/api/courses/home",
        authMode: "optional",
        query: {
          locale: normalizedLocale,
        },
        baseUrlOverride: this.alternateBaseUrl,
      });

      const alternateCount =
        (alternate.latestCourses?.length ?? 0) + (alternate.featuredCourses?.length ?? 0);
      if (alternateCount > 0) {
        logInfo("[CoursesApi] homeCourses fallback host returned data", {
          baseUrl: this.baseUrl,
          alternateBaseUrl: this.alternateBaseUrl,
          locale: normalizedLocale,
          latestCoursesCount: alternate.latestCourses?.length ?? 0,
          featuredCoursesCount: alternate.featuredCourses?.length ?? 0,
        });
        return alternate;
      }

      return primary;
    })();
  }

  getCourseState(courseId: string, locale?: string): Promise<CourseStateResponse> {
    if (!courseId?.trim()) {
      throw new ApiError(400, "Missing courseId");
    }

    return this.request<CourseStateResponse>({
      method: "GET",
      path: `/api/courses/${encodeURIComponent(courseId)}`,
      authMode: "optional",
      query: {
        locale: normalizeLocale(locale),
      },
    });
  }

  createCheckoutSession(
    payload: CreateCheckoutSessionRequest
  ): Promise<CreateCheckoutSessionResponse> {
    if (!payload?.courseId?.trim()) {
      throw new ApiError(400, "Missing courseId");
    }

    return this.request<CreateCheckoutSessionResponse>({
      method: "POST",
      path: "/api/stripe/courses/create-checkout-session",
      authMode: "required",
      body: payload,
    });
  }

  getPurchasedCourses(locale?: string): Promise<PurchasedCoursesResponse> {
    return this.request<PurchasedCoursesResponse>({
      method: "GET",
      path: "/api/courses/purchased",
      authMode: "required",
      query: {
        locale: normalizeLocale(locale),
      },
    });
  }

  getPlayback(courseId: string): Promise<PlaybackResponse> {
    if (!courseId?.trim()) {
      throw new ApiError(400, "Missing courseId");
    }

    return this.request<PlaybackResponse>({
      method: "GET",
      path: `/api/courses/${encodeURIComponent(courseId)}/playback`,
      authMode: "required",
    });
  }

  async downloadCourseCertificate(
    courseId: string,
    locale?: string
  ): Promise<CourseCertificateDownloadResult> {
    if (!courseId?.trim()) {
      throw new ApiError(400, "Missing courseId");
    }

    const requestId = `courses-${++requestSeq}-${Date.now().toString(36)}`;
    const startedAt = Date.now();
    const normalizedLocale = normalizeLocale(locale);
    const path = `/api/courses/${encodeURIComponent(courseId)}/certificate`;

    try {
      const authorization = await this.getAuthorizationHeader("required");
      const url = withQuery(joinUrl(this.baseUrl, path), {
        locale: normalizedLocale,
      });

      const cacheBaseDir = FileSystem.cacheDirectory || FileSystem.documentDirectory;
      if (!cacheBaseDir) {
        throw new ApiError(0, "File system cache directory is not available");
      }

      const certificatesDir = `${cacheBaseDir}courses/certificates/`;
      await FileSystem.makeDirectoryAsync(certificatesDir, { intermediates: true });

      const fallbackFileName = sanitizeFileName(
        `course-certificate-${courseId}-${Date.now()}.pdf`
      );
      const targetUri = `${certificatesDir}${fallbackFileName}`;

      logInfo("[CoursesApi] Certificate download start", {
        requestId,
        path,
        url,
        courseId,
        locale: normalizedLocale,
        targetUri,
      });

      const headers: Record<string, string> = {
        Accept: "application/pdf",
      };
      if (authorization) {
        headers.Authorization = authorization;
      }

      const downloadResult = await FileSystem.downloadAsync(url, targetUri, {
        headers,
      });

      const status = typeof downloadResult.status === "number" ? downloadResult.status : 0;
      const contentDisposition = getHeaderValue(
        downloadResult.headers as Record<string, string> | undefined,
        "content-disposition"
      );
      const contentType =
        getHeaderValue(
          downloadResult.headers as Record<string, string> | undefined,
          "content-type"
        ) || "application/pdf";

      if (status < 200 || status >= 300) {
        let payload: unknown = null;

        try {
          const text = await FileSystem.readAsStringAsync(downloadResult.uri);
          try {
            payload = text ? JSON.parse(text) : null;
          } catch {
            payload = text;
          }
        } catch {
          payload = null;
        }

        await FileSystem.deleteAsync(downloadResult.uri, { idempotent: true }).catch(() => {});

        const message = extractErrorMessage(payload, `Request failed with status ${status}`);
        logWarn("[CoursesApi] Certificate download failed", {
          requestId,
          path,
          status,
          durationMs: Date.now() - startedAt,
          message,
          payloadSummary: summarizePayload(payload),
        });
        throw new ApiError(status, message, payload);
      }

      const resolvedFileName =
        extractFileNameFromDisposition(contentDisposition) || fallbackFileName;
      const resolvedMimeType =
        contentType.toLowerCase().includes("pdf") ? "application/pdf" : contentType;

      logInfo("[CoursesApi] Certificate download success", {
        requestId,
        path,
        status,
        durationMs: Date.now() - startedAt,
        courseId,
        locale: normalizedLocale,
        fileName: resolvedFileName,
      });

      return {
        uri: downloadResult.uri,
        fileName: resolvedFileName,
        mimeType: resolvedMimeType,
      };
    } catch (error) {
      const apiError = toApiError(error);
      logError("[CoursesApi] Certificate download error", {
        requestId,
        path,
        status: apiError.status,
        message: apiError.message,
        durationMs: Date.now() - startedAt,
      });
      throw apiError;
    }
  }
}

export const createCoursesApi = (config: CoursesApiConfig = {}): CoursesApi => {
  return new CoursesApi(config);
};

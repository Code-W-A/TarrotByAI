import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ApiError,
  createCoursesApi,
  normalizeLocale,
  type ListCoursesParams,
} from "../../services/coursesApi";
import { logError, logInfo, logWarn } from "../../utils/Logger";
import type {
  BillingDetails,
  CourseCertificateDownloadResult,
  CourseStateResponse,
  CoursesHomeResponse,
  PlaybackResponse,
  PurchasedCourseItem,
  SafeCourse,
} from "../../types/courses";
const DEFAULT_POLLING_INTERVAL_MS = 2500;
const DEFAULT_POLLING_TIMEOUT_MS = 45000;
let hookInstanceSeq = 0;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type LoaderOptions = {
  force?: boolean;
};

export type CheckoutStatus =
  | "idle"
  | "opening"
  | "returned_success"
  | "returned_cancel"
  | "polling"
  | "error";

export interface UseCoursesOptions {
  locale: string;
  getAuthToken?: () => Promise<string | null>;
  apiBaseUrl?: string;
  pollingIntervalMs?: number;
  pollingTimeoutMs?: number;
}

export interface UseCoursesResult {
  locale: string;
  courses: SafeCourse[];
  home: CoursesHomeResponse | null;
  courseState: CourseStateResponse | null;
  purchases: PurchasedCourseItem[];
  playback: PlaybackResponse | null;

  listLoading: boolean;
  homeLoading: boolean;
  detailLoading: boolean;
  purchasedLoading: boolean;
  playbackLoading: boolean;

  listError: ApiError | null;
  homeError: ApiError | null;
  detailError: ApiError | null;
  purchasedError: ApiError | null;
  playbackError: ApiError | null;

  checkoutStatus: CheckoutStatus;
  checkoutError: ApiError | null;
  isAccessChecking: boolean;
  certificateDownloading: boolean;
  certificateError: ApiError | null;

  loadCourses: (
    params?: ListCoursesParams,
    options?: LoaderOptions
  ) => Promise<SafeCourse[]>;
  loadHome: (options?: LoaderOptions) => Promise<CoursesHomeResponse>;
  loadCourseState: (
    courseId: string,
    options?: LoaderOptions
  ) => Promise<CourseStateResponse>;
  loadPurchased: (options?: LoaderOptions) => Promise<PurchasedCourseItem[]>;
  loadPlayback: (
    courseId: string,
    options?: LoaderOptions
  ) => Promise<PlaybackResponse | null>;

  startCheckout: (courseId: string, billingDetails?: BillingDetails) => Promise<string>;
  finalizeCheckout: (courseId: string, outcome: "success" | "cancel") => Promise<void>;
  downloadCertificate: (courseId: string) => Promise<CourseCertificateDownloadResult>;
  invalidateCourseCaches: (targetLocale?: string) => void;
  resetCheckoutState: () => void;
}

const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error) {
    return new ApiError(0, error.message, error);
  }

  return new ApiError(0, "Unknown error", error);
};

const summarizeApiErrorDetails = (details: unknown): Record<string, unknown> | undefined => {
  if (!details || typeof details !== "object") {
    return undefined;
  }

  const source = details as Record<string, unknown>;
  return {
    keys: Object.keys(source),
    message: typeof source.message === "string" ? source.message : undefined,
    error: typeof source.error === "string" ? source.error : undefined,
  };
};

const listCacheKey = (locale: string, params: ListCoursesParams): string => {
  return [
    "list",
    `locale=${locale}`,
    `featured=${typeof params.featuredOnly === "boolean" ? String(params.featuredOnly) : "all"}`,
    `limit=${typeof params.limit === "number" ? String(params.limit) : "none"}`,
  ].join("|");
};

const homeCacheKey = (locale: string): string => `home|locale=${locale}`;
const stateCacheKey = (courseId: string, locale: string): string =>
  `state|course=${courseId}|locale=${locale}`;
const purchasedCacheKey = (locale: string): string => `purchased|locale=${locale}`;
const playbackCacheKey = (courseId: string): string => `playback|course=${courseId}`;

const buildLocaleFallbackChain = (locale: string): string[] => {
  const normalized = normalizeLocale(locale);
  return Array.from(new Set([normalized, "ro", "en"]));
};

const hasHomeCourses = (response: CoursesHomeResponse): boolean => {
  const latestCount = response.latestCourses?.length ?? 0;
  const featuredCount = response.featuredCourses?.length ?? 0;
  return latestCount + featuredCount > 0;
};

const normalizeBaseUrl = (value?: string): string => {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) {
    return "";
  }

  return raw.replace(/\/+$/, "");
};

export const useCourses = (options: UseCoursesOptions): UseCoursesResult => {
  const {
    locale,
    getAuthToken,
    apiBaseUrl,
    pollingIntervalMs = DEFAULT_POLLING_INTERVAL_MS,
    pollingTimeoutMs = DEFAULT_POLLING_TIMEOUT_MS,
  } = options;

  const normalizedLocale = useMemo(() => normalizeLocale(locale), [locale]);
  const hookInstanceIdRef = useRef(`courses-hook-${++hookInstanceSeq}`);
  const hookTag = hookInstanceIdRef.current;

  const api = useMemo(() => {
    return createCoursesApi({
      baseUrl: apiBaseUrl,
      getAuthToken,
    });
  }, [apiBaseUrl, getAuthToken]);
  const normalizedApiBaseUrl = useMemo(() => {
    const fallback =
      typeof process !== "undefined" ? process.env.EXPO_PUBLIC_API_BASE_URL : undefined;
    return normalizeBaseUrl(apiBaseUrl || fallback);
  }, [apiBaseUrl]);

  const [courses, setCourses] = useState<SafeCourse[]>([]);
  const [home, setHome] = useState<CoursesHomeResponse | null>(null);
  const [courseState, setCourseState] = useState<CourseStateResponse | null>(null);
  const [purchases, setPurchases] = useState<PurchasedCourseItem[]>([]);
  const [playback, setPlayback] = useState<PlaybackResponse | null>(null);

  const [listLoading, setListLoading] = useState(false);
  const [homeLoading, setHomeLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [purchasedLoading, setPurchasedLoading] = useState(false);
  const [playbackLoading, setPlaybackLoading] = useState(false);

  const [listError, setListError] = useState<ApiError | null>(null);
  const [homeError, setHomeError] = useState<ApiError | null>(null);
  const [detailError, setDetailError] = useState<ApiError | null>(null);
  const [purchasedError, setPurchasedError] = useState<ApiError | null>(null);
  const [playbackError, setPlaybackError] = useState<ApiError | null>(null);

  const [checkoutStatus, setCheckoutStatus] = useState<CheckoutStatus>("idle");
  const [checkoutError, setCheckoutError] = useState<ApiError | null>(null);
  const [isAccessChecking, setIsAccessChecking] = useState(false);
  const [certificateDownloading, setCertificateDownloading] = useState(false);
  const [certificateError, setCertificateError] = useState<ApiError | null>(null);

  const cacheRef = useRef<Map<string, unknown>>(new Map());
  const previousLocaleRef = useRef(normalizedLocale);

  const lastListParamsRef = useRef<ListCoursesParams | null>(null);
  const hasLoadedHomeRef = useRef(false);
  const lastCourseIdRef = useRef<string | null>(null);
  const hasLoadedPurchasedRef = useRef(false);

  useEffect(() => {
    logInfo("[useCourses] Hook initialized", {
      hookTag,
      locale,
      normalizedLocale,
      hasApiBaseUrl: Boolean(apiBaseUrl),
      hasAuthTokenProvider: Boolean(getAuthToken),
      pollingIntervalMs,
      pollingTimeoutMs,
    });
  }, [
    apiBaseUrl,
    getAuthToken,
    hookTag,
    locale,
    normalizedLocale,
    pollingIntervalMs,
    pollingTimeoutMs,
  ]);

  const invalidateCourseCaches = useCallback((targetLocale?: string) => {
    if (!targetLocale) {
      const sizeBeforeClear = cacheRef.current.size;
      cacheRef.current.clear();
      logInfo("[useCourses] Cache cleared", {
        hookTag,
        mode: "all",
        sizeBeforeClear,
      });
      return;
    }

    const normalizedTargetLocale = normalizeLocale(targetLocale);
    const keys = Array.from(cacheRef.current.keys());
    let removed = 0;

    keys.forEach((key) => {
      if (key.includes(`locale=${normalizedTargetLocale}`)) {
        cacheRef.current.delete(key);
        removed += 1;
      }
    });

    logInfo("[useCourses] Cache cleared by locale", {
      hookTag,
      targetLocale,
      normalizedTargetLocale,
      removed,
      remaining: cacheRef.current.size,
    });
  }, []);

  const loadCourses = useCallback(
    async (
      params: ListCoursesParams = {},
      loaderOptions: LoaderOptions = {}
    ): Promise<SafeCourse[]> => {
      const mergedParams: ListCoursesParams = {
        ...params,
        locale: normalizedLocale,
      };

      lastListParamsRef.current = params;
      const key = listCacheKey(normalizedLocale, mergedParams);

      setListLoading(true);
      setListError(null);
      logInfo("[useCourses] loadCourses start", {
        hookTag,
        params: mergedParams,
        force: Boolean(loaderOptions.force),
        cacheKey: key,
        cacheHit: cacheRef.current.has(key),
      });

      try {
        if (!loaderOptions.force && cacheRef.current.has(key)) {
          const cached = cacheRef.current.get(key) as SafeCourse[];
          setCourses(cached);
          logInfo("[useCourses] loadCourses cache hit", {
            hookTag,
            cacheKey: key,
            items: cached.length,
          });
          return cached;
        }

        const localeChain = buildLocaleFallbackChain(normalizedLocale);
        let nextCourses: SafeCourse[] = [];
        let resolvedLocale = normalizedLocale;

        for (let index = 0; index < localeChain.length; index += 1) {
          const candidateLocale = localeChain[index];
          const candidateParams: ListCoursesParams = {
            ...mergedParams,
            locale: candidateLocale,
          };
          const candidateKey = listCacheKey(candidateLocale, candidateParams);
          let candidateCourses: SafeCourse[] | null = null;

          if (!loaderOptions.force && cacheRef.current.has(candidateKey)) {
            candidateCourses = cacheRef.current.get(candidateKey) as SafeCourse[];
            logInfo("[useCourses] loadCourses candidate cache hit", {
              hookTag,
              requestedLocale: normalizedLocale,
              candidateLocale,
              cacheKey: candidateKey,
              items: candidateCourses.length,
            });
          } else {
            const response = await api.listCourses(candidateParams);
            candidateCourses = response.courses || [];
            cacheRef.current.set(candidateKey, candidateCourses);
            logInfo("[useCourses] loadCourses candidate fetched", {
              hookTag,
              requestedLocale: normalizedLocale,
              candidateLocale,
              cacheKey: candidateKey,
              items: candidateCourses.length,
            });
          }

          const isLastLocale = index === localeChain.length - 1;
          if ((candidateCourses?.length ?? 0) > 0 || isLastLocale) {
            nextCourses = candidateCourses || [];
            resolvedLocale = candidateLocale;
            break;
          }

          logWarn("[useCourses] loadCourses candidate empty, trying fallback locale", {
            hookTag,
            requestedLocale: normalizedLocale,
            candidateLocale,
          });
        }

        cacheRef.current.set(key, nextCourses);
        setCourses(nextCourses);
        logInfo("[useCourses] loadCourses success", {
          hookTag,
          cacheKey: key,
          requestedLocale: normalizedLocale,
          resolvedLocale,
          fallbackUsed: resolvedLocale !== normalizedLocale,
          items: nextCourses.length,
        });
        return nextCourses;
      } catch (error) {
        const apiError = toApiError(error);
        setListError(apiError);
        logError("[useCourses] loadCourses error", {
          hookTag,
          cacheKey: key,
          status: apiError.status,
          message: apiError.message,
        });
        throw apiError;
      } finally {
        setListLoading(false);
      }
    },
    [api, normalizedLocale]
  );

  const loadHome = useCallback(
    async (loaderOptions: LoaderOptions = {}): Promise<CoursesHomeResponse> => {
      hasLoadedHomeRef.current = true;
      const key = homeCacheKey(normalizedLocale);

      setHomeLoading(true);
      setHomeError(null);
      logInfo("[useCourses] loadHome start", {
        hookTag,
        locale: normalizedLocale,
        force: Boolean(loaderOptions.force),
        cacheKey: key,
        cacheHit: cacheRef.current.has(key),
      });

      try {
        if (!loaderOptions.force && cacheRef.current.has(key)) {
          const cached = cacheRef.current.get(key) as CoursesHomeResponse;
          setHome(cached);
          logInfo("[useCourses] loadHome cache hit", {
            hookTag,
            cacheKey: key,
            latestCoursesCount: cached.latestCourses?.length ?? 0,
            featuredCoursesCount: cached.featuredCourses?.length ?? 0,
          });
          return cached;
        }

        const localeChain = buildLocaleFallbackChain(normalizedLocale);
        let response: CoursesHomeResponse | null = null;
        let resolvedLocale = normalizedLocale;

        for (let index = 0; index < localeChain.length; index += 1) {
          const candidateLocale = localeChain[index];
          const candidateKey = homeCacheKey(candidateLocale);
          let candidateResponse: CoursesHomeResponse | null = null;

          if (!loaderOptions.force && cacheRef.current.has(candidateKey)) {
            candidateResponse = cacheRef.current.get(candidateKey) as CoursesHomeResponse;
            logInfo("[useCourses] loadHome candidate cache hit", {
              hookTag,
              requestedLocale: normalizedLocale,
              candidateLocale,
              cacheKey: candidateKey,
              latestCoursesCount: candidateResponse.latestCourses?.length ?? 0,
              featuredCoursesCount: candidateResponse.featuredCourses?.length ?? 0,
            });
          } else {
            candidateResponse = await api.homeCourses(candidateLocale);
            cacheRef.current.set(candidateKey, candidateResponse);
            logInfo("[useCourses] loadHome candidate fetched", {
              hookTag,
              requestedLocale: normalizedLocale,
              candidateLocale,
              cacheKey: candidateKey,
              latestCoursesCount: candidateResponse.latestCourses?.length ?? 0,
              featuredCoursesCount: candidateResponse.featuredCourses?.length ?? 0,
            });
          }

          const isLastLocale = index === localeChain.length - 1;
          if (hasHomeCourses(candidateResponse) || isLastLocale) {
            response = candidateResponse;
            resolvedLocale = candidateLocale;
            break;
          }

          logWarn("[useCourses] loadHome candidate empty, trying fallback locale", {
            hookTag,
            requestedLocale: normalizedLocale,
            candidateLocale,
          });
        }

        const resolvedResponse = response || { latestCourses: [], featuredCourses: [] };
        cacheRef.current.set(key, resolvedResponse);
        setHome(resolvedResponse);
        logInfo("[useCourses] loadHome success", {
          hookTag,
          cacheKey: key,
          requestedLocale: normalizedLocale,
          resolvedLocale,
          fallbackUsed: resolvedLocale !== normalizedLocale,
          latestCoursesCount: resolvedResponse.latestCourses?.length ?? 0,
          featuredCoursesCount: resolvedResponse.featuredCourses?.length ?? 0,
        });
        return resolvedResponse;
      } catch (error) {
        const apiError = toApiError(error);
        setHomeError(apiError);
        logError("[useCourses] loadHome error", {
          hookTag,
          cacheKey: key,
          status: apiError.status,
          message: apiError.message,
        });
        throw apiError;
      } finally {
        setHomeLoading(false);
      }
    },
    [api, normalizedLocale]
  );

  const loadCourseState = useCallback(
    async (
      courseId: string,
      loaderOptions: LoaderOptions = {}
    ): Promise<CourseStateResponse> => {
      if (!courseId?.trim()) {
        const error = new ApiError(400, "Missing courseId");
        setDetailError(error);
        logWarn("[useCourses] loadCourseState called without courseId", { hookTag });
        throw error;
      }

      lastCourseIdRef.current = courseId;
      const key = stateCacheKey(courseId, normalizedLocale);

      setDetailLoading(true);
      setDetailError(null);
      logInfo("[useCourses] loadCourseState start", {
        hookTag,
        courseId,
        locale: normalizedLocale,
        force: Boolean(loaderOptions.force),
        cacheKey: key,
        cacheHit: cacheRef.current.has(key),
      });

      try {
        if (!loaderOptions.force && cacheRef.current.has(key)) {
          const cached = cacheRef.current.get(key) as CourseStateResponse;
          setCourseState(cached);
          logInfo("[useCourses] loadCourseState cache hit", {
            hookTag,
            courseId,
            hasAccess: cached.hasAccess,
            isVisible: cached.isVisible,
          });
          return cached;
        }

        const response = await api.getCourseState(courseId, normalizedLocale);
        cacheRef.current.set(key, response);
        setCourseState(response);

        if (!response.hasAccess) {
          setPlayback(null);
        }

        logInfo("[useCourses] loadCourseState success", {
          hookTag,
          courseId,
          hasAccess: response.hasAccess,
          isVisible: response.isVisible,
        });

        return response;
      } catch (error) {
        const apiError = toApiError(error);
        setDetailError(apiError);
        logError("[useCourses] loadCourseState error", {
          hookTag,
          courseId,
          status: apiError.status,
          message: apiError.message,
        });
        throw apiError;
      } finally {
        setDetailLoading(false);
      }
    },
    [api, normalizedLocale]
  );

  const loadPurchased = useCallback(
    async (loaderOptions: LoaderOptions = {}): Promise<PurchasedCourseItem[]> => {
      hasLoadedPurchasedRef.current = true;
      const key = purchasedCacheKey(normalizedLocale);

      setPurchasedLoading(true);
      setPurchasedError(null);
      logInfo("[useCourses] loadPurchased start", {
        hookTag,
        locale: normalizedLocale,
        force: Boolean(loaderOptions.force),
        cacheKey: key,
        cacheHit: cacheRef.current.has(key),
      });

      try {
        if (!loaderOptions.force && cacheRef.current.has(key)) {
          const cached = cacheRef.current.get(key) as PurchasedCourseItem[];
          setPurchases(cached);
          logInfo("[useCourses] loadPurchased cache hit", {
            hookTag,
            items: cached.length,
          });
          return cached;
        }

        const response = await api.getPurchasedCourses(normalizedLocale);
        const nextPurchases = response.purchases || [];
        cacheRef.current.set(key, nextPurchases);
        setPurchases(nextPurchases);
        logInfo("[useCourses] loadPurchased success", {
          hookTag,
          items: nextPurchases.length,
        });
        return nextPurchases;
      } catch (error) {
        const apiError = toApiError(error);
        setPurchasedError(apiError);
        logError("[useCourses] loadPurchased error", {
          hookTag,
          status: apiError.status,
          message: apiError.message,
        });
        throw apiError;
      } finally {
        setPurchasedLoading(false);
      }
    },
    [api, normalizedLocale]
  );

  const loadPlayback = useCallback(
    async (
      courseId: string,
      loaderOptions: LoaderOptions = {}
    ): Promise<PlaybackResponse | null> => {
      if (!courseId?.trim()) {
        const error = new ApiError(400, "Missing courseId");
        setPlaybackError(error);
        logWarn("[useCourses] loadPlayback called without courseId", { hookTag });
        throw error;
      }

      const key = playbackCacheKey(courseId);
      setPlaybackLoading(true);
      setPlaybackError(null);
      logInfo("[useCourses] loadPlayback start", {
        hookTag,
        courseId,
        force: Boolean(loaderOptions.force),
        cacheKey: key,
        cacheHit: cacheRef.current.has(key),
      });

      try {
        if (!loaderOptions.force && cacheRef.current.has(key)) {
          const cached = cacheRef.current.get(key) as PlaybackResponse | null;
          setPlayback(cached);
          logInfo("[useCourses] loadPlayback cache hit", {
            hookTag,
            courseId,
            hasPlayback: Boolean(cached?.vimeoId),
          });
          return cached;
        }

        const response = await api.getPlayback(courseId);
        cacheRef.current.set(key, response);
        setPlayback(response);
        logInfo("[useCourses] loadPlayback success", {
          hookTag,
          courseId,
          hasPlayback: Boolean(response?.vimeoId),
        });
        return response;
      } catch (error) {
        const apiError = toApiError(error);
        setPlaybackError(apiError);
        logError("[useCourses] loadPlayback error", {
          hookTag,
          courseId,
          status: apiError.status,
          message: apiError.message,
        });
        throw apiError;
      } finally {
        setPlaybackLoading(false);
      }
    },
    [api]
  );

  const refreshAccessAfterCheckout = useCallback(
    async (courseId: string) => {
      setIsAccessChecking(true);
      setCheckoutStatus("polling");
      logInfo("[useCourses] refreshAccessAfterCheckout start", {
        hookTag,
        courseId,
        pollingIntervalMs,
        pollingTimeoutMs,
      });

      const startedAt = Date.now();

      try {
        let hasAccess = false;
        let attempts = 0;

        while (Date.now() - startedAt < pollingTimeoutMs) {
          attempts += 1;
          const updated = await loadCourseState(courseId, { force: true });
          logInfo("[useCourses] refreshAccessAfterCheckout poll", {
            hookTag,
            courseId,
            attempts,
            hasAccess: updated.hasAccess,
            elapsedMs: Date.now() - startedAt,
          });
          if (updated.hasAccess) {
            hasAccess = true;
            break;
          }
          await sleep(pollingIntervalMs);
        }

        if (hasAccess) {
          await loadPlayback(courseId, { force: true });
          logInfo("[useCourses] refreshAccessAfterCheckout success", {
            hookTag,
            courseId,
            attempts,
            elapsedMs: Date.now() - startedAt,
          });
        } else {
          logWarn("[useCourses] refreshAccessAfterCheckout timeout", {
            hookTag,
            courseId,
            attempts,
            elapsedMs: Date.now() - startedAt,
            pollingTimeoutMs,
          });
        }
      } finally {
        setIsAccessChecking(false);
      }
    },
    [hookTag, loadCourseState, loadPlayback, pollingIntervalMs, pollingTimeoutMs]
  );

  const startCheckout = useCallback(
    async (courseId: string, billingDetails?: BillingDetails): Promise<string> => {
      if (!courseId?.trim()) {
        const error = new ApiError(400, "Missing courseId");
        setCheckoutError(error);
        setCheckoutStatus("error");
        throw error;
      }

      if (!normalizedApiBaseUrl) {
        const error = new ApiError(0, "Missing EXPO_PUBLIC_API_BASE_URL");
        setCheckoutError(error);
        setCheckoutStatus("error");
        throw error;
      }

      const successUrl = `${normalizedApiBaseUrl}/courses/checkout?checkout=success`;
      const cancelUrl = `${normalizedApiBaseUrl}/courses/checkout?checkout=cancel`;

      setCheckoutError(null);
      setCheckoutStatus("opening");
      logInfo("[useCourses] startCheckout start", {
        hookTag,
        courseId,
        successUrl,
        cancelUrl,
        platform: "expo",
        hasBillingDetails: Boolean(billingDetails),
      });

      try {
        const session = await api.createCheckoutSession({
          courseId,
          successUrl,
          cancelUrl,
          platform: "expo",
          billingDetails,
        });
        logInfo("[useCourses] startCheckout session created", {
          hookTag,
          courseId,
          hasSessionUrl: Boolean(session?.url),
          hasSessionId: Boolean(session?.sessionId),
        });
        if (!session?.url?.trim()) {
          const error = new ApiError(0, "Missing checkout session url");
          setCheckoutError(error);
          setCheckoutStatus("error");
          throw error;
        }

        return session.url;
      } catch (error) {
        const apiError = toApiError(error);
        setCheckoutError(apiError);
        setCheckoutStatus("error");
        logError("[useCourses] startCheckout error", {
          hookTag,
          courseId,
          status: apiError.status,
          message: apiError.message,
          details: summarizeApiErrorDetails(apiError.details),
        });
        throw apiError;
      }
    },
    [api, hookTag, normalizedApiBaseUrl]
  );

  const finalizeCheckout = useCallback(
    async (courseId: string, outcome: "success" | "cancel"): Promise<void> => {
      if (!courseId?.trim()) {
        return;
      }

      logInfo("[useCourses] finalizeCheckout start", {
        hookTag,
        courseId,
        outcome,
      });

      if (outcome === "cancel") {
        setCheckoutStatus("returned_cancel");
        return;
      }

      setCheckoutStatus("returned_success");
      await refreshAccessAfterCheckout(courseId);
      setCheckoutStatus("returned_success");
    },
    [hookTag, refreshAccessAfterCheckout]
  );

  const downloadCertificate = useCallback(
    async (courseId: string): Promise<CourseCertificateDownloadResult> => {
      if (!courseId?.trim()) {
        const error = new ApiError(400, "Missing courseId");
        setCertificateError(error);
        logWarn("[useCourses] downloadCertificate called without courseId", { hookTag });
        throw error;
      }

      setCertificateDownloading(true);
      setCertificateError(null);
      logInfo("[useCourses] downloadCertificate start", {
        hookTag,
        courseId,
        locale: normalizedLocale,
      });

      try {
        const result = await api.downloadCourseCertificate(courseId, normalizedLocale);
        logInfo("[useCourses] downloadCertificate success", {
          hookTag,
          courseId,
          uri: result.uri,
          fileName: result.fileName,
        });
        return result;
      } catch (error) {
        const apiError = toApiError(error);
        setCertificateError(apiError);
        logError("[useCourses] downloadCertificate error", {
          hookTag,
          courseId,
          locale: normalizedLocale,
          status: apiError.status,
          message: apiError.message,
          details: summarizeApiErrorDetails(apiError.details),
        });
        throw apiError;
      } finally {
        setCertificateDownloading(false);
      }
    },
    [api, hookTag, normalizedLocale]
  );

  const resetCheckoutState = useCallback(() => {
    setCheckoutStatus("idle");
    setCheckoutError(null);
    logInfo("[useCourses] resetCheckoutState", { hookTag });
  }, []);

  useEffect(() => {
    const previousLocale = previousLocaleRef.current;

    if (previousLocale === normalizedLocale) {
      return;
    }

    logInfo("[useCourses] Locale changed", {
      hookTag,
      previousLocale,
      normalizedLocale,
      hasListHistory: Boolean(lastListParamsRef.current),
      hasHomeHistory: hasLoadedHomeRef.current,
      lastCourseId: lastCourseIdRef.current,
      hasPurchasedHistory: hasLoadedPurchasedRef.current,
    });

    invalidateCourseCaches(previousLocale);

    if (lastListParamsRef.current) {
      logInfo("[useCourses] Refetch list after locale change", {
        hookTag,
        locale: normalizedLocale,
      });
      void loadCourses(lastListParamsRef.current, { force: true });
    }

    if (hasLoadedHomeRef.current) {
      logInfo("[useCourses] Refetch home after locale change", {
        hookTag,
        locale: normalizedLocale,
      });
      void loadHome({ force: true });
    }

    if (lastCourseIdRef.current) {
      logInfo("[useCourses] Refetch detail after locale change", {
        hookTag,
        courseId: lastCourseIdRef.current,
        locale: normalizedLocale,
      });
      void loadCourseState(lastCourseIdRef.current, { force: true });
    }

    if (hasLoadedPurchasedRef.current) {
      logInfo("[useCourses] Refetch purchased after locale change", {
        hookTag,
        locale: normalizedLocale,
      });
      void loadPurchased({ force: true });
    }

    previousLocaleRef.current = normalizedLocale;
  }, [
    hookTag,
    invalidateCourseCaches,
    loadCourseState,
    loadCourses,
    loadHome,
    loadPurchased,
    normalizedLocale,
  ]);

  return {
    locale: normalizedLocale,
    courses,
    home,
    courseState,
    purchases,
    playback,

    listLoading,
    homeLoading,
    detailLoading,
    purchasedLoading,
    playbackLoading,

    listError,
    homeError,
    detailError,
    purchasedError,
    playbackError,

    checkoutStatus,
    checkoutError,
    isAccessChecking,
    certificateDownloading,
    certificateError,

    loadCourses,
    loadHome,
    loadCourseState,
    loadPurchased,
    loadPlayback,

    startCheckout,
    finalizeCheckout,
    downloadCertificate,
    invalidateCourseCaches,
    resetCheckoutState,
  };
};

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  showInterstitialAd,
  showRewardedAd,
  showAppOpenAd,
  isInterstitialAdLoaded,
  isRewardedAdLoaded,
  isAppOpenAdLoaded,
  getAdUnitId,
  AdsConfig,
} from "../utils/adsUtils";

export type UseAdsOptions = {
  /** When true, no interstitial/rewarded/app-open and canShowAds is false (active subscriber). */
  userHasPremiumAccess?: boolean;
};

interface UseAdsReturn {
  isInterstitialLoaded: boolean;
  isRewardedLoaded: boolean;
  isAppOpenLoaded: boolean;
  adsConfig: AdsConfig | null;

  showInterstitial: () => Promise<boolean>;
  showRewarded: () => Promise<boolean>;
  showAppOpen: () => Promise<boolean>;
  getBannerAdUnitId: () => string;
  getInterstitialAdUnitId: () => string;
  getRewardedAdUnitId: () => string;

  canShowAds: boolean;
}

export const useAds = (
  adsConfig?: AdsConfig | null,
  options?: UseAdsOptions | null
): UseAdsReturn => {
  const subscriberNoAds = options?.userHasPremiumAccess === true;
  const effectiveCanShowAds = useMemo(() => {
    return Boolean(adsConfig?.canShowAds) && !subscriberNoAds;
  }, [adsConfig?.canShowAds, subscriberNoAds]);

  const [isInterstitialLoaded, setIsInterstitialLoaded] = useState(false);
  const [isRewardedLoaded, setIsRewardedLoaded] = useState(false);
  const [isAppOpenLoaded, setIsAppOpenLoaded] = useState(false);

  useEffect(() => {
    const checkAdStatus = () => {
      setIsInterstitialLoaded(isInterstitialAdLoaded());
      setIsRewardedLoaded(isRewardedAdLoaded());
      setIsAppOpenLoaded(isAppOpenAdLoaded());
    };

    checkAdStatus();
    const interval = setInterval(checkAdStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const showInterstitial = useCallback(async (): Promise<boolean> => {
    if (!effectiveCanShowAds) {
      return false;
    }

    const result = await showInterstitialAd();
    setTimeout(() => {
      setIsInterstitialLoaded(isInterstitialAdLoaded());
    }, 1000);
    return result;
  }, [effectiveCanShowAds]);

  const showRewarded = useCallback(async (): Promise<boolean> => {
    if (!effectiveCanShowAds) {
      return false;
    }

    const result = await showRewardedAd();
    setTimeout(() => {
      setIsRewardedLoaded(isRewardedAdLoaded());
    }, 1000);
    return result;
  }, [effectiveCanShowAds]);

  const showAppOpen = useCallback(async (): Promise<boolean> => {
    if (!effectiveCanShowAds) {
      return false;
    }

    const result = await showAppOpenAd();
    setTimeout(() => {
      setIsAppOpenLoaded(isAppOpenAdLoaded());
    }, 1000);
    return result;
  }, [effectiveCanShowAds]);

  const getBannerAdUnitId = useCallback(() => {
    return getAdUnitId("banner");
  }, []);

  const getInterstitialAdUnitId = useCallback(() => {
    return getAdUnitId("interstitial");
  }, []);

  const getRewardedAdUnitId = useCallback(() => {
    return getAdUnitId("rewarded");
  }, []);

  return {
    isInterstitialLoaded,
    isRewardedLoaded,
    isAppOpenLoaded,
    adsConfig: adsConfig ?? null,

    showInterstitial,
    showRewarded,
    showAppOpen,
    getBannerAdUnitId,
    getInterstitialAdUnitId,
    getRewardedAdUnitId,

    canShowAds: effectiveCanShowAds,
  };
};

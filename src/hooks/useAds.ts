import { useState, useEffect, useCallback } from 'react';
import { 
  showInterstitialAd, 
  showRewardedAd, 
  isInterstitialAdLoaded, 
  isRewardedAdLoaded,
  getAdUnitId,
  AdsConfig 
} from '../utils/adsUtils';

interface UseAdsReturn {
  // State
  isInterstitialLoaded: boolean;
  isRewardedLoaded: boolean;
  adsConfig: AdsConfig | null;
  
  // Actions
  showInterstitial: () => Promise<boolean>;
  showRewarded: () => Promise<boolean>;
  getBannerAdUnitId: () => string;
  getInterstitialAdUnitId: () => string;
  getRewardedAdUnitId: () => string;
  
  // Utils
  canShowAds: boolean;
}

export const useAds = (adsConfig?: AdsConfig | null): UseAdsReturn => {
  const [isInterstitialLoaded, setIsInterstitialLoaded] = useState(false);
  const [isRewardedLoaded, setIsRewardedLoaded] = useState(false);
  
  // Check ad loading status periodically
  useEffect(() => {
    const checkAdStatus = () => {
      setIsInterstitialLoaded(isInterstitialAdLoaded());
      setIsRewardedLoaded(isRewardedAdLoaded());
    };
    
    // Check immediately
    checkAdStatus();
    
    // Check every 2 seconds
    const interval = setInterval(checkAdStatus, 2000);
    
    return () => clearInterval(interval);
  }, []);
  
  const showInterstitial = useCallback(async (): Promise<boolean> => {
    if (!adsConfig?.canShowAds) {
      console.log('Ads are disabled');
      return false;
    }
    
    const result = await showInterstitialAd();
    
    // Update loading status after showing
    setTimeout(() => {
      setIsInterstitialLoaded(isInterstitialAdLoaded());
    }, 1000);
    
    return result;
  }, [adsConfig]);
  
  const showRewarded = useCallback(async (): Promise<boolean> => {
    if (!adsConfig?.canShowAds) {
      console.log('Ads are disabled');
      return false;
    }
    
    const result = await showRewardedAd();
    
    // Update loading status after showing
    setTimeout(() => {
      setIsRewardedLoaded(isRewardedAdLoaded());
    }, 1000);
    
    return result;
  }, [adsConfig]);
  
  const getBannerAdUnitId = useCallback(() => {
    return getAdUnitId('banner');
  }, []);
  
  const getInterstitialAdUnitId = useCallback(() => {
    return getAdUnitId('interstitial');
  }, []);
  
  const getRewardedAdUnitId = useCallback(() => {
    return getAdUnitId('rewarded');
  }, []);
  
  const canShowAds = adsConfig?.canShowAds || false;
  
  return {
    // State
    isInterstitialLoaded,
    isRewardedLoaded,
    adsConfig,
    
    // Actions
    showInterstitial,
    showRewarded,
    getBannerAdUnitId,
    getInterstitialAdUnitId,
    getRewardedAdUnitId,
    
    // Utils
    canShowAds,
  };
}; 
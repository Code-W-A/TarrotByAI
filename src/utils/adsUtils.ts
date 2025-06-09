import { Platform } from 'react-native';

export interface AdsConfig {
  isPersonalized: boolean;
  canShowAds: boolean;
}

export const initializeAds = async (hasTrackingPermission: boolean): Promise<AdsConfig> => {
  console.log('Initializing ads with tracking permission:', hasTrackingPermission);
  
  const config: AdsConfig = {
    isPersonalized: hasTrackingPermission,
    canShowAds: true,
  };

  try {
    if (Platform.OS === 'ios') {
      // iOS Ad Configuration
      if (hasTrackingPermission) {
        console.log('iOS: Initializing personalized ads');
        // TODO: Initialize Google Mobile Ads with personalized ads
        // Example:
        // await mobileAds().initialize();
        // await mobileAds().setRequestConfiguration({
        //   requestNonPersonalizedAdsOnly: false,
        // });
      } else {
        console.log('iOS: Initializing non-personalized ads');
        // TODO: Initialize Google Mobile Ads with non-personalized ads
        // Example:
        // await mobileAds().initialize();
        // await mobileAds().setRequestConfiguration({
        //   requestNonPersonalizedAdsOnly: true,
        // });
      }
    } else if (Platform.OS === 'android') {
      // Android doesn't require ATT, but respect user's choice if available
      console.log('Android: Initializing ads');
      // TODO: Initialize Google Mobile Ads for Android
      // Example:
      // await mobileAds().initialize();
    }
    
    console.log('Ads initialized successfully:', config);
  } catch (error) {
    console.error('Error initializing ads:', error);
    config.canShowAds = false;
  }

  return config;
};

export const showInterstitialAd = (adUnitId: string) => {
  console.log('Showing interstitial ad:', adUnitId);
  // TODO: Implement interstitial ad display
};

export const showRewardedAd = (adUnitId: string) => {
  console.log('Showing rewarded ad:', adUnitId);
  // TODO: Implement rewarded ad display
};

export const showBannerAd = (adUnitId: string) => {
  console.log('Showing banner ad:', adUnitId);
  // TODO: Implement banner ad display
};

// Ad Unit IDs (to be replaced with real ones)
export const AD_UNIT_IDS = {
  ios: {
    banner: 'ca-app-pub-3940256099942544/2934735716', // Test ID
    interstitial: 'ca-app-pub-3940256099942544/4411468910', // Test ID
    rewarded: 'ca-app-pub-3940256099942544/1712485313', // Test ID
  },
  android: {
    banner: 'ca-app-pub-3940256099942544/6300978111', // Test ID
    interstitial: 'ca-app-pub-3940256099942544/1033173712', // Test ID
    rewarded: 'ca-app-pub-3940256099942544/5224354917', // Test ID
  },
}; 
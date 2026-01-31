import { Platform } from 'react-native';
import mobileAds, { 
  InterstitialAd, 
  RewardedAd, 
  BannerAd, 
  TestIds, 
  AdEventType,
  RewardedAdEventType,
  MaxAdContentRating 
} from 'react-native-google-mobile-ads';

export interface AdsConfig {
  isPersonalized: boolean;
  canShowAds: boolean;
}

// Singleton ads instances
let interstitialAd: InterstitialAd | null = null;
let rewardedAd: RewardedAd | null = null;

export const initializeAds = async (hasTrackingPermission: boolean): Promise<AdsConfig> => {
  console.log('Initializing ads with tracking permission:', hasTrackingPermission);
  
  const config: AdsConfig = {
    isPersonalized: hasTrackingPermission,
    canShowAds: true,
  };

  try {
    // Initialize the mobile ads SDK
    await mobileAds().initialize();
    
    // Configure ad requests based on personalization
    const requestConfiguration = {
      requestNonPersonalizedAdsOnly: !hasTrackingPermission,
      maxAdContentRating: MaxAdContentRating.T,
      tagForChildDirectedTreatment: false,
      tagForUnderAgeOfConsent: false,
    };
    
    await mobileAds().setRequestConfiguration(requestConfiguration);
    
    if (Platform.OS === 'ios') {
      // iOS Ad Configuration
      if (hasTrackingPermission) {
        console.log('iOS: Initializing personalized ads');
      } else {
        console.log('iOS: Initializing non-personalized ads');
      }
    } else if (Platform.OS === 'android') {
      // Android doesn't require ATT, but respect user's choice if available
      console.log('Android: Initializing ads');
    }
    
    // Pre-load interstitial + rewarded
    loadInterstitialAd();
    loadRewardedAd();
    
    console.log('Ads initialized successfully:', config);
  } catch (error) {
    console.error('Error initializing ads:', error);
    config.canShowAds = false;
  }

  return config;
};

const loadInterstitialAd = () => {
  const adUnitId = __DEV__ 
    ? TestIds.INTERSTITIAL 
    : Platform.OS === 'android' 
      ? AD_UNIT_IDS.android.interstitial 
      : AD_UNIT_IDS.ios.interstitial;

  console.log('🎯 Loading interstitial ad with ID:', adUnitId);
  
  interstitialAd = InterstitialAd.createForAdRequest(adUnitId);
  
  interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
    console.log('✅ Interstitial ad loaded and ready to show!');
  });
  
  interstitialAd.addAdEventListener(AdEventType.ERROR, (error) => {
    console.error('❌ Interstitial ad error:', error);
  });
  
  interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
    console.log('🔄 Interstitial ad closed, reloading for next use...');
    loadInterstitialAd(); // Reload for next use
  });
  
  interstitialAd.load();
};

const loadRewardedAd = () => {
  const adUnitId = __DEV__
    ? TestIds.REWARDED
    : Platform.OS === 'android'
      ? AD_UNIT_IDS.android.rewarded
      : AD_UNIT_IDS.ios.rewarded;

  console.log('🎁 Loading rewarded ad with ID:', adUnitId);

  rewardedAd = RewardedAd.createForAdRequest(adUnitId);

  rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
    console.log('✅ Rewarded ad loaded and ready to show!');
  });

  rewardedAd.addAdEventListener(AdEventType.ERROR, (error) => {
    console.error('❌ Rewarded ad error:', error);
  });

  rewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
    console.log('🔄 Rewarded ad closed, reloading for next use...');
    loadRewardedAd();
  });

  rewardedAd.load();
};

export const showInterstitialAd = async (): Promise<boolean> => {
  try {
    if (interstitialAd?.loaded) {
      console.log('🎬 Showing interstitial ad now!');
      await interstitialAd.show();
      console.log('✅ Interstitial ad shown successfully!');
      return true;
    } else {
      console.log('⏳ Interstitial ad not loaded yet, skipping...');
      return false;
    }
  } catch (error) {
    console.error('❌ Error showing interstitial ad:', error);
    return false;
  }
};

export const showRewardedAd = async (): Promise<boolean> => {
  if (!rewardedAd?.loaded) {
    console.log('⏳ Rewarded ad not loaded yet, skipping...');
    return false;
  }

  return await new Promise<boolean>(async (resolve) => {
    let earned = false;
    let resolved = false;

    const safeResolve = (value: boolean) => {
      if (resolved) return;
      resolved = true;
      resolve(value);
    };

    const unsubEarned = rewardedAd!.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      () => {
        earned = true;
      }
    );

    const unsubClosed = rewardedAd!.addAdEventListener(AdEventType.CLOSED, () => {
      unsubEarned();
      unsubClosed();
      unsubError();
      safeResolve(earned);
    });

    const unsubError = rewardedAd!.addAdEventListener(
      AdEventType.ERROR,
      (error) => {
        console.error('❌ Rewarded ad show error:', error);
        unsubEarned();
        unsubClosed();
        unsubError();
        safeResolve(false);
      }
    );

    try {
      await rewardedAd!.show();
    } catch (error) {
      console.error('❌ Error showing rewarded ad:', error);
      unsubEarned();
      unsubClosed();
      unsubError();
      safeResolve(false);
    }
  });
};

export const showBannerAd = (adUnitId?: string) => {
  console.log('Banner ad component should be used directly in components');
  // Banner ads are handled by BannerAd component directly in React components
};

// Check if ads are loaded
export const isInterstitialAdLoaded = (): boolean => {
  return interstitialAd?.loaded || false;
};

export const isRewardedAdLoaded = (): boolean => {
  return rewardedAd?.loaded || false;
};

// Get appropriate ad unit ID
export const getAdUnitId = (adType: 'banner' | 'interstitial' | 'rewarded'): string => {
  if (__DEV__) {
    switch (adType) {
      case 'banner': return TestIds.BANNER;
      case 'interstitial': return TestIds.INTERSTITIAL;
      case 'rewarded': return TestIds.REWARDED;
      default: return TestIds.BANNER;
    }
  }
  
  const platform = Platform.OS as 'android' | 'ios';
  return AD_UNIT_IDS[platform][adType];
};

// Ad Unit IDs - REAL Production IDs
export const AD_UNIT_IDS = {
  ios: {
    banner: 'ca-app-pub-9577714849380446/4894553547', // live ID (nu avem banner încă)
    interstitial: 'ca-app-pub-9577714849380446/5660268593', // REAL iOS Interstitial
    rewarded: 'ca-app-pub-9577714849380446/2684496636', // live ID (nu avem rewarded încă)
  },
  android: {
    banner: 'ca-app-pub-9577714849380446/1418342963', // live ID (nu avem banner încă)
    interstitial: 'ca-app-pub-9577714849380446/7080054250', // REAL Android Interstitial
    rewarded: 'ca-app-pub-9577714849380446/7936823313', // live ID (nu avem rewarded încă)
  },
}; 
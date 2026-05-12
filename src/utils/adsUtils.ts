import { Platform } from 'react-native';
import * as Device from 'expo-device';
import mobileAds, {
  InterstitialAd,
  RewardedAd,
  AppOpenAd,
  TestIds,
  AdEventType,
  RewardedAdEventType,
  MaxAdContentRating,
} from 'react-native-google-mobile-ads';

/** Use Google's test ad unit IDs (set EXPO_PUBLIC_USE_ADMOB_TEST_IDS=true for release/preview builds). */
const useTestAdUnits = (): boolean =>
  __DEV__ || process.env.EXPO_PUBLIC_USE_ADMOB_TEST_IDS === 'true';

let rewardedLoadRetries = 0;
const MAX_REWARDED_LOAD_RETRIES = 6;

export interface AdsConfig {
  isPersonalized: boolean;
  canShowAds: boolean;
}

// Singleton ads instances
let interstitialAd: InterstitialAd | null = null;
let rewardedAd: RewardedAd | null = null;
let appOpenAd: AppOpenAd | null = null;

// Prevent duplicate ad loads
let interstitialLoading = false;
let rewardedLoading = false;
let appOpenLoading = false;

/** When true, app open ads must never load or show (premium / active subscription). */
let suppressAppOpenForSubscriber = false;

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
    
    // Pre-load interstitial + rewarded + app open
    rewardedLoadRetries = 0;
    loadInterstitialAd();
    loadRewardedAd();
    loadAppOpenAd();
    
    console.log('Ads initialized successfully:', config);
  } catch (error) {
    console.error('Error initializing ads:', error);
    config.canShowAds = false;
  }

  return config;
};

const loadInterstitialAd = () => {
  if (interstitialLoading || interstitialAd?.loaded) {
    return;
  }
  
  const adUnitId = useTestAdUnits()
    ? TestIds.INTERSTITIAL
    : Platform.OS === 'android'
      ? AD_UNIT_IDS.android.interstitial
      : AD_UNIT_IDS.ios.interstitial;

  console.log('🎯 Loading interstitial ad with ID:', adUnitId);
  interstitialLoading = true;
  
  interstitialAd = InterstitialAd.createForAdRequest(adUnitId);
  
  interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
    interstitialLoading = false;
    console.log('✅ Interstitial ad loaded and ready to show!');
  });
  
  interstitialAd.addAdEventListener(AdEventType.ERROR, (error) => {
    interstitialLoading = false;
    console.error('❌ Interstitial ad error:', error);
  });
  
  interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
    console.log('🔄 Interstitial ad closed, reloading for next use...');
    interstitialLoading = false;
    loadInterstitialAd();
  });
  
  interstitialAd.load();
};

const loadRewardedAd = () => {
  if (rewardedLoading || rewardedAd?.loaded) {
    return;
  }
  
  const adUnitId = useTestAdUnits()
    ? TestIds.REWARDED
    : Platform.OS === 'android'
      ? AD_UNIT_IDS.android.rewarded
      : AD_UNIT_IDS.ios.rewarded;

  if (!Device.isDevice) {
    console.warn(
      '[Ads] Rewarded ads often return internal-error on emulators/simulators. Test on a real device.'
    );
  }

  console.log('🎁 Loading rewarded ad with ID:', adUnitId, {
    testMode: useTestAdUnits(),
    attempt: rewardedLoadRetries + 1,
  });
  rewardedLoading = true;

  rewardedAd = RewardedAd.createForAdRequest(adUnitId);

  rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
    rewardedLoading = false;
    rewardedLoadRetries = 0;
    console.log('✅ Rewarded ad loaded and ready to show!');
  });

  rewardedAd.addAdEventListener(AdEventType.ERROR, (error) => {
    rewardedLoading = false;
    const msg = error && typeof error === 'object' && 'message' in error ? String(error.message) : String(error);
    console.error('❌ Rewarded ad error:', msg, { code: (error as { code?: string })?.code });

    rewardedLoadRetries += 1;
    if (rewardedLoadRetries <= MAX_REWARDED_LOAD_RETRIES) {
      const delayMs = Math.min(30_000, 1500 * 2 ** (rewardedLoadRetries - 1));
      console.warn(`[Ads] Rewarded load retry ${rewardedLoadRetries}/${MAX_REWARDED_LOAD_RETRIES} in ${delayMs}ms`);
      setTimeout(() => loadRewardedAd(), delayMs);
    } else {
      console.error('[Ads] Rewarded ad: max load retries reached. Check AdMob unit type (must be Rewarded), app ID, and use a physical device.');
    }
  });

  rewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
    console.log('🔄 Rewarded ad closed, reloading for next use...');
    rewardedLoading = false;
    rewardedLoadRetries = 0;
    loadRewardedAd();
  });

  rewardedAd.load();
};

const loadAppOpenAd = () => {
  if (suppressAppOpenForSubscriber) {
    return;
  }
  if (appOpenLoading || appOpenAd?.loaded) {
    return;
  }
  
  const adUnitId = useTestAdUnits()
    ? TestIds.APP_OPEN
    : Platform.OS === 'android'
      ? AD_UNIT_IDS.android.appOpen
      : AD_UNIT_IDS.ios.appOpen;

  console.log('🚀 Loading app open ad with ID:', adUnitId);
  appOpenLoading = true;

  appOpenAd = AppOpenAd.createForAdRequest(adUnitId);

  appOpenAd.addAdEventListener(AdEventType.LOADED, () => {
    appOpenLoading = false;
    console.log('✅ App open ad loaded and ready to show!');
  });

  appOpenAd.addAdEventListener(AdEventType.ERROR, (error) => {
    appOpenLoading = false;
    console.error('❌ App open ad error:', error);
  });

  appOpenAd.addAdEventListener(AdEventType.CLOSED, () => {
    console.log('🔄 App open ad closed, reloading for next use...');
    appOpenLoading = false;
    loadAppOpenAd();
  });

  appOpenAd.load();
};

/**
 * Synced from AuthContext when subscription status changes. Resumes preloading when false.
 */
export const setAppOpenSuppressedForSubscriber = (suppress: boolean): void => {
  suppressAppOpenForSubscriber = Boolean(suppress);
  if (!suppressAppOpenForSubscriber) {
    loadAppOpenAd();
  }
};

export const showAppOpenAd = async (): Promise<boolean> => {
  try {
    if (suppressAppOpenForSubscriber) {
      console.log('[Ads] App open skipped — user has premium access');
      return false;
    }
    if (appOpenAd?.loaded) {
      console.log('🚀 Showing app open ad now!');
      await appOpenAd.show();
      console.log('✅ App open ad shown successfully!');
      return true;
    } else {
      console.log('⏳ App open ad not loaded yet, skipping...');
      return false;
    }
  } catch (error) {
    console.error('❌ Error showing app open ad:', error);
    return false;
  }
};

export const isAppOpenAdLoaded = (): boolean => {
  return appOpenAd?.loaded || false;
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
  if (useTestAdUnits()) {
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
    banner: 'ca-app-pub-9577714849380446/4894553547',
    interstitial: 'ca-app-pub-9577714849380446/5660268593',
    rewarded: 'ca-app-pub-9577714849380446/2684496636',
    appOpen: 'ca-app-pub-9577714849380446/2639694093', // TODO: Create in AdMob console
  },
  android: {
    banner: 'ca-app-pub-9577714849380446/1418342963',
    interstitial: 'ca-app-pub-9577714849380446/7080054250',
    rewarded: 'ca-app-pub-9577714849380446/7936823313',
    appOpen: 'ca-app-pub-9577714849380446/7369276598', // TODO: Create in AdMob console
  },
}; 
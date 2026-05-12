import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { useAds } from '../../hooks/useAds';
import { useAuth } from '../../context/AuthContext';
import { hasPremiumAccess } from '../../features/video-library/utils/premiumAccess';

interface AdBannerProps {
  size?: BannerAdSize;
  style?: any;
  adsConfig?: any;
}

export const AdBanner: React.FC<AdBannerProps> = ({ 
  size = BannerAdSize.ADAPTIVE_BANNER,
  style,
  adsConfig
}) => {
  const { userData } = useAuth();
  const { getBannerAdUnitId, canShowAds } = useAds(adsConfig, {
    userHasPremiumAccess: hasPremiumAccess(userData),
  });
  
  if (!canShowAds) {
    return null;
  }
  
  return (
    <View style={[styles.container, style]}>
      <BannerAd
        unitId={getBannerAdUnitId()}
        size={size}
        requestOptions={{
          requestNonPersonalizedAdsOnly: !adsConfig?.isPersonalized,
        }}
        onAdLoaded={() => {
          console.log('Banner ad loaded');
        }}
        onAdFailedToLoad={(error) => {
          console.error('Banner ad failed to load:', error);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
}); 
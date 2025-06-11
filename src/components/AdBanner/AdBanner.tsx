import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { useAds } from '../../hooks/useAds';

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
  // MOMENTAN NU AVEM BANNER ADS - returnăm null
  // Când vei avea banner ads, doar comentează linia de mai jos și decomentează codul
  return null;
  
  /*
  // DECOMENTEAZĂ CÂND AI BANNER ADS:
  const { getBannerAdUnitId, canShowAds } = useAds(adsConfig);
  
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
  */
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
}); 
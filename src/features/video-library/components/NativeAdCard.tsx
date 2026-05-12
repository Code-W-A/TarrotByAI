import React, { memo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../../utils/colors";
import { useAds } from "../../../hooks/useAds";
import { useAuth } from "../../../context/AuthContext";
import { hasPremiumAccess } from "../utils/premiumAccess";
import i18n from "../../../../i18n";

interface Props {
  adsConfig?: any;
}

const NativeAdCardComponent: React.FC<Props> = ({ adsConfig }) => {
  const { userData } = useAuth();
  const { getBannerAdUnitId, canShowAds } = useAds(adsConfig, {
    userHasPremiumAccess: hasPremiumAccess(userData),
  });
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  if (!canShowAds) {
    return null;
  }

  if (failed) {
    return null;
  }

  return (
    <View style={styles.card}>
      <View style={styles.adWrapper}>
        {!loaded && (
          <View style={styles.placeholder}>
            <Ionicons name="megaphone-outline" size={32} color="#8b7355" />
            <Text style={styles.placeholderText}>
              {i18n.translate("adLoading", "Loading...")}
            </Text>
          </View>
        )}
        <BannerAd
          unitId={getBannerAdUnitId()}
          size={BannerAdSize.MEDIUM_RECTANGLE}
          requestOptions={{
            requestNonPersonalizedAdsOnly: !adsConfig?.isPersonalized,
          }}
          onAdLoaded={() => setLoaded(true)}
          onAdFailedToLoad={() => setFailed(true)}
        />
        <View style={styles.sponsoredBadge}>
          <Text style={styles.sponsoredText}>
            {i18n.translate("adSponsored", "Ad")}
          </Text>
        </View>
      </View>
    </View>
  );
};

export const NativeAdCard = memo(NativeAdCardComponent);

const styles = StyleSheet.create({
  card: {
    width: 320,
    height: 240,
    borderRadius: 20,
    overflow: "hidden",
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    backgroundColor: "#faf7f2",
    borderWidth: 1,
    borderColor: "rgba(191, 167, 106, 0.2)",
  },
  adWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  placeholder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(250, 247, 242, 0.95)",
    zIndex: 0,
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 12,
    color: "#8b7355",
  },
  sponsoredBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sponsoredText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});

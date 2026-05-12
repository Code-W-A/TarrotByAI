import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import i18n from "../../../../i18n";
import { colors } from "../../../utils/colors";

interface Props {
  onSubscribe: () => void;
  onDismiss?: () => void;
}

export const VideoPremiumUpsell: React.FC<Props> = ({
  onSubscribe,
  onDismiss,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <LinearGradient
          colors={["rgba(191, 167, 106, 0.12)", "rgba(191, 167, 106, 0.03)"]}
          style={styles.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        <View style={styles.iconWrapper}>
          <Ionicons name="star" size={32} color="#bfa76a" />
        </View>

        <Text style={styles.title}>{i18n.translate("premiumPaywallTitle")}</Text>

        <View style={styles.priceContainer}>
          <Text style={styles.priceAmount}>5€</Text>
          <Text style={styles.pricePeriod}>
            {i18n.translate("premiumPricePerMonth")}
          </Text>
        </View>

        <View style={styles.benefitsContainer}>
          <View style={styles.benefitRow}>
            <View style={styles.benefitIcon}>
              <Ionicons name="refresh" size={18} color="#bfa76a" />
            </View>
            <Text style={styles.benefitText}>
              {i18n.translate("premiumBenefitNewVideos")}
            </Text>
          </View>

          <View style={styles.benefitRow}>
            <View style={styles.benefitIcon}>
              <Ionicons name="play-circle" size={18} color="#bfa76a" />
            </View>
            <Text style={styles.benefitText}>
              {i18n.translate("premiumBenefitAllAccess")}
            </Text>
          </View>

          <View style={styles.benefitRow}>
            <View style={styles.benefitIcon}>
              <Ionicons name="eye-off" size={18} color="#bfa76a" />
            </View>
            <Text style={styles.benefitText}>
              {i18n.translate("premiumBenefitNoAds")}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.ctaButton}
          onPress={onSubscribe}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={["#c9a94e", "#a88b3d"]}
            style={styles.ctaGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.ctaText}>
              {i18n.translate("premiumPaywallCta")}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {onDismiss ? (
          <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
            <Text style={styles.dismissText}>
              {i18n.translate("premiumPaywallClose")}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(191, 167, 106, 0.25)",
    shadowColor: "#5d4e37",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
    overflow: "hidden",
  },
  cardGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  iconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(191, 167, 106, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#3f3527",
    textAlign: "center",
    letterSpacing: -0.4,
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 20,
  },
  priceAmount: {
    fontSize: 36,
    fontWeight: "800",
    color: "#bfa76a",
    letterSpacing: -1,
  },
  pricePeriod: {
    fontSize: 15,
    fontWeight: "600",
    color: "#8b7355",
    marginLeft: 4,
  },
  benefitsContainer: {
    width: "100%",
    marginBottom: 24,
    gap: 12,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  benefitIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(191, 167, 106, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  benefitText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: "#5d4e37",
    lineHeight: 20,
  },
  ctaButton: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
  },
  ctaGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  ctaText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  dismissButton: {
    marginTop: 14,
    paddingVertical: 8,
  },
  dismissText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#8b7355",
  },
});

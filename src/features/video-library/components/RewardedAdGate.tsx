import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../../utils/colors";
import i18n from "../../../../i18n";
import { getPremiumBonusRewardUnlocksRemainingToday } from "../utils/videoAdPolicy";

interface Props {
  visible: boolean;
  /** Current gated video — analytics / future use */
  videoId: string;
  videoTitle: string;
  onWatchAd: () => Promise<boolean>;
  onSubscribe: () => void;
  onClose: () => void;
}

export const RewardedAdGate: React.FC<Props> = ({
  visible,
  videoId,
  videoTitle,
  onWatchAd,
  onSubscribe,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const remaining =
    videoId.length > 0 ? getPremiumBonusRewardUnlocksRemainingToday() : 0;

  const handleWatchAd = async () => {
    setLoading(true);
    try {
      const success = await onWatchAd();
      if (!success) {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#8b7355" />
          </TouchableOpacity>

          <View style={styles.iconContainer}>
            <Ionicons name="play-circle" size={64} color={colors.gold} />
          </View>

          <Text style={styles.title}>
            {i18n.translate("rewardedAdGateTitle", "Premium Video")}
          </Text>

          <Text style={styles.videoTitle} numberOfLines={2}>
            {videoTitle}
          </Text>

          <View style={styles.priceRow}>
            <Text style={styles.priceAmount}>5€</Text>
            <Text style={styles.pricePeriod}>
              {i18n.translate("premiumPricePerMonth")}
            </Text>
          </View>

          <Text style={styles.message}>
            {remaining > 0
              ? i18n.translate(
                  "rewardedAdGateMessage",
                  "Watch one short ad to unlock one premium video today, or subscribe for unlimited access without ads."
                )
              : i18n.translate(
                  "rewardedAdGateDailyLimitIntro",
                  "You have already used today's free unlock for bonus videos."
                )}
          </Text>

          {remaining > 0 ? (
            <TouchableOpacity
              style={[styles.watchButton, loading && styles.buttonDisabled]}
              onPress={handleWatchAd}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="videocam" size={20} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.watchButtonText}>
                    {i18n.translate("rewardedAdGateWatch", "Watch ad to unlock")}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          ) : null}

          {remaining > 0 ? (
            <Text style={styles.remainingText}>
              {i18n.translate(
                "rewardedAdGateRemainingDaily",
                "Without a subscription: one bonus video per day unlocked by watching an ad."
              )}
            </Text>
          ) : (
            <Text style={styles.noMoreText}>
              {i18n.translate(
                "rewardedAdGateDailyLimitReached",
                "Come back tomorrow for another unlock, or subscribe now for unlimited bonus videos without ads on all clips."
              )}
            </Text>
          )}

          <Text style={styles.subscribePitch}>
            {i18n.translate(
              "rewardedAdGateSubscribePitch",
              "Go Premium to remove ads and unlock all premium videos."
            )}
          </Text>

          <TouchableOpacity style={styles.subscribeButton} onPress={onSubscribe}>
            <Ionicons name="star" size={18} color={colors.gold} style={styles.buttonIcon} />
            <Text style={styles.subscribeButtonText}>
              {i18n.translate("rewardedAdGateSubscribe", "Get premium access")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modal: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#fffef9",
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(191, 167, 106, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(139, 115, 85, 0.1)",
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#5d4e37",
    textAlign: "center",
    marginBottom: 8,
  },
  videoTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.gold,
    textAlign: "center",
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    marginBottom: 16,
  },
  priceAmount: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.gold,
    letterSpacing: -0.4,
  },
  pricePeriod: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "600",
    color: "#8b7355",
  },
  message: {
    fontSize: 15,
    color: "#8b7355",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  watchButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gold,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonIcon: {
    marginRight: 8,
  },
  watchButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  remainingText: {
    fontSize: 13,
    color: "#8b7355",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 16,
  },
  noMoreText: {
    fontSize: 14,
    color: "#d94f45",
    textAlign: "center",
    marginBottom: 16,
    fontWeight: "600",
  },
  subscribePitch: {
    fontSize: 14,
    color: "#5d4e37",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 10,
    fontWeight: "600",
  },
  subscribeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(191, 167, 106, 0.12)",
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(191, 167, 106, 0.4)",
  },
  subscribeButtonText: {
    color: "#5d4e37",
    fontSize: 15,
    fontWeight: "700",
  },
});

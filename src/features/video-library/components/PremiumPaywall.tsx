import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import i18n from "../../../../i18n";
import { colors } from "../../../utils/colors";
import { screenName } from "../../../utils/screenName";

type Variant = "modal" | "inline";

interface Props {
  variant?: Variant;
  visible?: boolean;
  onClose?: () => void;
  onSubscribe?: () => void;
}

export const PremiumPaywall: React.FC<Props> = ({
  variant = "modal",
  visible = false,
  onClose,
  onSubscribe,
}) => {
  const navigation = useNavigation<any>();

  const handleSubscribe = () => {
    if (onSubscribe) {
      onSubscribe();
      return;
    }
    onClose?.();
    navigation.navigate(screenName.Subscription);
  };

  const content = (
    <View style={styles.card}>
      <Text style={styles.title}>{i18n.translate("premiumPaywallTitle")}</Text>
      <Text style={styles.message}>
        {i18n.translate("premiumPaywallMessage")}
      </Text>
      <TouchableOpacity style={styles.ctaButton} onPress={handleSubscribe}>
        <Text style={styles.ctaText}>
          {i18n.translate("premiumPaywallCta")}
        </Text>
      </TouchableOpacity>
      {onClose ? (
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeText}>
            {i18n.translate("premiumPaywallClose")}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );

  if (variant === "inline") {
    return <View style={styles.inlineWrapper}>{content}</View>;
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalWrapper}>{content}</View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalWrapper: {
    width: "100%",
    maxWidth: 420,
  },
  inlineWrapper: {
    width: "100%",
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderWidth: 1,
    borderColor: "rgba(191, 167, 106, 0.35)",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#5d4e37",
    marginBottom: 10,
    textAlign: "center",
  },
  message: {
    fontSize: 15,
    color: "#8b7355",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 18,
  },
  ctaButton: {
    backgroundColor: colors.goldDark,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  ctaText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 15,
  },
  closeButton: {
    marginTop: 12,
    alignItems: "center",
  },
  closeText: {
    color: "#5d4e37",
    fontSize: 14,
  },
});

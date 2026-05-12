import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import { useNavigation } from "@react-navigation/native";
import i18n from "../../../i18n";
import { colors } from "../../utils/colors";
import { screenName } from "../../utils/screenName";
import {
  createPremiumBillingPortalSession,
  PremiumVideoApiError,
} from "../../features/video-library/services/premiumVideoApi";
import type { PremiumSubscriptionUiState } from "../../features/video-library/utils/premiumSubscriptionUi";

type Props = {
  ui: PremiumSubscriptionUiState;
  currentUser: unknown;
};

const tr = (key: string, def: string) => {
  const v = String(i18n.translate(key));
  return v && v !== key ? v : def;
};

export const PremiumSubscriptionProfileSection: React.FC<Props> = ({ ui, currentUser }) => {
  const navigation = useNavigation<any>();
  const [portalLoading, setPortalLoading] = useState(false);

  const openPortal = useCallback(
    async (flow: "default" | "cancel") => {
      setPortalLoading(true);
      try {
        const { url } = await createPremiumBillingPortalSession(flow, currentUser as any);
        if (!url) {
          throw new Error(tr("premiumManageError", "We could not open the billing portal."));
        }
        await WebBrowser.openBrowserAsync(url);
      } catch (e) {
        const msg =
          e instanceof PremiumVideoApiError
            ? e.message
            : e instanceof Error
              ? e.message
              : tr("premiumManageError", "We could not open the billing portal.");
        Alert.alert(tr("premiumManageErrorTitle", "Billing portal"), msg);
      } finally {
        setPortalLoading(false);
      }
    },
    [currentUser]
  );

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{tr("profilePremiumSubscriptionTitle", "Subscription")}</Text>
      <Text style={styles.hint}>
        {tr(
          "premiumCancelAccessUntilPeriodEnd",
          "After changes in Stripe, this screen may update after you return or refresh. If you cancel, you keep premium access until the current paid period ends."
        )}
      </Text>

      {ui.showRenewHint ? (
        <View style={styles.bannerMuted}>
          <Text style={styles.bannerText}>
            {tr(
              "settingsPremiumRenewHint",
              "You don't have an active premium subscription."
            )}
          </Text>
          <TouchableOpacity
            style={styles.buttonPrimary}
            onPress={() => navigation.navigate(screenName.VideoPremiumSubscription)}
          >
            <Text style={styles.buttonPrimaryText}>
              {tr("settingsPremiumRenewCta", "Subscribe again")}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {ui.scheduledCancelBanner ? (
        <View style={styles.bannerAmber}>
          <Text style={styles.bannerTitle}>
            {tr("settingsPremiumScheduledCancelTitle", "")}
          </Text>
          <Text style={styles.bannerBody}>
            {String(
              i18n.translate("settingsPremiumScheduledCancelBody", {
                date: ui.periodEndFormatted || "—",
              })
            )}
          </Text>
          <View style={styles.rowGap}>
            <TouchableOpacity
              style={styles.buttonReactivate}
              onPress={() => openPortal("default")}
              disabled={portalLoading}
            >
              {portalLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonReactivateText}>
                  {tr("settingsPremiumReactivateCta", "Reactivate subscription")}
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buttonOutlineAmber}
              onPress={() => openPortal("default")}
              disabled={portalLoading}
            >
              <Text style={styles.buttonOutlineAmberText}>
                {tr("settingsPremiumOpenBillingPortal", "Open Stripe billing portal")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {ui.canceledWithResidualAccess ? (
        <View style={styles.bannerMuted}>
          <Text style={styles.bannerText}>
            {String(
              i18n.translate("settingsPremiumCanceledAccessUntil", {
                date: ui.periodEndFormatted || "—",
              })
            )}
          </Text>
        </View>
      ) : null}

      {ui.showCancelButton ? (
        <TouchableOpacity
          style={styles.buttonDanger}
          onPress={() => openPortal("cancel")}
          disabled={portalLoading}
        >
          {portalLoading ? (
            <ActivityIndicator color="#7f1d1d" size="small" />
          ) : (
            <Text style={styles.buttonDangerText}>
              {tr("premiumCancelSubscription", "Cancel subscription")}
            </Text>
          )}
        </TouchableOpacity>
      ) : null}

      {ui.premiumNow &&
      !ui.showRenewHint &&
      !ui.showCancelButton &&
      !ui.scheduledCancelBanner &&
      !ui.canceledWithResidualAccess ? (
        <TouchableOpacity
          style={styles.buttonOutlineAmber}
          onPress={() => openPortal("default")}
          disabled={portalLoading}
        >
          <Text style={styles.buttonOutlineAmberText}>
            {tr("settingsPremiumOpenBillingPortal", "Open Stripe billing portal")}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "rgba(191, 167, 106, 0.25)",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#5d4e37",
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    color: "#6b7280",
    lineHeight: 18,
    marginBottom: 12,
  },
  bannerMuted: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  bannerAmber: {
    backgroundColor: "rgba(254, 243, 199, 0.6)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#fcd34d",
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#78350f",
    marginBottom: 6,
  },
  bannerBody: {
    fontSize: 14,
    color: "#92400e",
    lineHeight: 20,
  },
  bannerText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  rowGap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  buttonPrimary: {
    marginTop: 12,
    alignSelf: "flex-start",
    backgroundColor: colors.gold || "#bfa76a",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  buttonPrimaryText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  buttonReactivate: {
    backgroundColor: "#059669",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  buttonReactivateText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  buttonOutlineAmber: {
    borderWidth: 1,
    borderColor: "#d97706",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  buttonOutlineAmberText: {
    color: "#92400e",
    fontWeight: "700",
    fontSize: 13,
  },
  buttonDanger: {
    borderWidth: 1,
    borderColor: "#fecaca",
    backgroundColor: "rgba(254, 242, 242, 0.9)",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonDangerText: {
    color: "#991b1b",
    fontWeight: "700",
    fontSize: 14,
  },
});

export default PremiumSubscriptionProfileSection;

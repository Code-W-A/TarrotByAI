import {
  currentPeriodEndToMillis,
  hasPremiumAccess,
  isStripeSubscriptionBilling,
} from "./premiumAccess";

function readStripeCustomerId(u: Record<string, unknown>): string {
  const raw =
    u.stripeCustomerId ??
    u.stripe_customer_id ??
    (u as { stripeCustomerID?: string }).stripeCustomerID;
  return typeof raw === "string" && raw.trim() ? raw.trim() : "";
}

function readStripeSubId(u: Record<string, unknown>): string {
  const raw = u.stripeSubscriptionId ?? u.stripe_subscription_id;
  return typeof raw === "string" && raw.trim() ? raw.trim() : "";
}

function readSubStatus(u: Record<string, unknown>): string {
  const raw = u.subscriptionStatus ?? u.subscription_status;
  return typeof raw === "string" ? raw.trim().toLowerCase() : "";
}

function parseCurrentPeriodEndDate(value: unknown): Date | null {
  if (value == null || value === undefined) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === "object" && value !== null && typeof (value as { toDate?: () => Date }).toDate === "function") {
    try {
      const d = (value as { toDate: () => Date }).toDate();
      return Number.isNaN(d?.getTime?.()) ? null : d;
    } catch {
      return null;
    }
  }
  const sec =
    typeof (value as { seconds?: number }).seconds === "number"
      ? (value as { seconds: number }).seconds
      : typeof (value as { _seconds?: number })._seconds === "number"
        ? (value as { _seconds: number })._seconds
        : null;
  if (sec != null) {
    const d = new Date(sec * 1000);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === "number") {
    const ms = value > 1e12 ? value : value * 1000;
    const d = new Date(ms);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === "string") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const ms = currentPeriodEndToMillis(value);
  if (ms == null) return null;
  const d = new Date(ms);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Calendar date in DD.MM.YYYY — no Intl (avoids i18n-js `%{…}` clashes on long month names). */
export function formatSubscriptionDisplayDate(date: Date | null, _locale: string): string {
  if (!date) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

export type PremiumSubscriptionUiState = {
  stripeCustomerId: string;
  stripeSubId: string;
  subStatus: string;
  premiumNow: boolean;
  cancelScheduled: boolean;
  periodEndDate: Date | null;
  periodEndFormatted: string;
  scheduledCancelBanner: boolean;
  canceledWithResidualAccess: boolean;
  showCancelButton: boolean;
  showRenewHint: boolean;
};

export function getPremiumSubscriptionUiState(
  userData: unknown,
  localeTag: string
): PremiumSubscriptionUiState | null {
  if (!userData || typeof userData !== "object") return null;
  const u = userData as Record<string, unknown>;
  if (!isStripeSubscriptionBilling(u)) {
    return null;
  }

  const stripeCustomerId = readStripeCustomerId(u);

  const stripeSubId = readStripeSubId(u);

  const subStatus = readSubStatus(u);
  const premiumNow = hasPremiumAccess(userData);

  // Portal API reads stripeCustomerId from Firestore server-side; client cache may lag.
  if (!premiumNow && !stripeCustomerId && !subStatus) {
    return null;
  }

  const cancelScheduled =
    u.premiumSubscriptionCancelAtPeriodEnd === true ||
    u.premiumSubscriptionCancelAtPeriodEnd === "true";

  const periodEndDate = parseCurrentPeriodEndDate(
    u.currentPeriodEnd ?? u.current_period_end
  );
  const periodEndFormatted = formatSubscriptionDisplayDate(periodEndDate, localeTag);

  const canceledWithResidualAccess = Boolean(
    premiumNow &&
      subStatus === "canceled" &&
      periodEndDate &&
      periodEndDate.getTime() > Date.now()
  );

  /** Match web hub: any cancel-at-period-end (not only when `subscriptionStatus === "active"`) so we show Reactivate, not Dezactivează. */
  const scheduledCancelBanner = Boolean(
    premiumNow && cancelScheduled && !canceledWithResidualAccess
  );

  const cancelBlockedStatus =
    subStatus === "canceled" || subStatus === "unpaid" || subStatus === "expired";
  /** Align with next-js `settings/index.jsx`: need subscription id + active status to offer cancel flow. */
  const showCancelButton = Boolean(
    stripeSubId &&
      premiumNow &&
      subStatus === "active" &&
      !cancelScheduled &&
      !cancelBlockedStatus &&
      !canceledWithResidualAccess
  );
  const showRenewHint = !premiumNow;

  return {
    stripeCustomerId,
    stripeSubId,
    subStatus,
    premiumNow,
    cancelScheduled,
    periodEndDate,
    periodEndFormatted,
    scheduledCancelBanner,
    canceledWithResidualAccess,
    showCancelButton,
    showRenewHint,
  };
}

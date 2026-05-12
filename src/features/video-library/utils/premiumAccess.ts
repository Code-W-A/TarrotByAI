type TimestampLike = {
  seconds?: number;
  _seconds?: number;
  toMillis?: () => number;
  toDate?: () => Date;
};

export const currentPeriodEndToMillis = (value: unknown): number | null => {
  if (value == null) return null;
  if (typeof value === "number") {
    return value > 1e12 ? value : value * 1000;
  }
  if (value instanceof Date) return value.getTime();
  if (typeof value === "object") {
    const timestamp = value as TimestampLike;
    if (typeof timestamp.toMillis === "function") return timestamp.toMillis();
    if (typeof timestamp.toDate === "function") return timestamp.toDate().getTime();
    if (typeof timestamp.seconds === "number") return timestamp.seconds * 1000;
    if (typeof timestamp._seconds === "number") return timestamp._seconds * 1000;
  }
  return null;
};

/** Normalize Firestore/string quirks (spacing, case, "true"). */
const normalizeStatus = (raw: unknown): string => {
  if (typeof raw !== "string") return "";
  return raw.trim().toLowerCase();
};

const readProvider = (data: Record<string, any>): string => {
  const p = data.subscriptionProvider ?? data.subscription_provider;
  return typeof p === "string" ? p.trim().toLowerCase() : "";
};

const readPremiumFlag = (data: Record<string, any>): boolean =>
  data.premium === true || data.premium === "true" || data.premium === 1;

export const hasPremiumAccess = (userData: unknown): boolean => {
  if (!userData || typeof userData !== "object") return false;

  const data = userData as Record<string, any>;
  const provider = readProvider(data);
  if (provider && provider !== "stripe") {
    const manualEnd = currentPeriodEndToMillis(data.manualPremiumExpiresAt);
    if (manualEnd != null && Date.now() >= manualEnd) return false;
    return readPremiumFlag(data);
  }

  const rawStatus = data.subscriptionStatus ?? data.subscription_status;
  const status = normalizeStatus(rawStatus);
  const endMs = currentPeriodEndToMillis(
    data.currentPeriodEnd ?? data.current_period_end
  );
  const now = Date.now();

  if (status === "active" || status === "past_due" || status === "trialing") {
    if (endMs != null && now >= endMs) return false;
    return true;
  }

  if (status === "canceled") {
    return endMs != null && now < endMs;
  }

  if (status === "unpaid" || status === "expired") {
    return false;
  }

  return readPremiumFlag(data);
};

/** Non-empty Stripe ids on the user doc (client may use snake_case). */
export const hasStripeSubscriptionHints = (userData: unknown): boolean => {
  if (!userData || typeof userData !== "object") return false;
  const u = userData as Record<string, unknown>;
  const c = u.stripeCustomerId ?? u.stripe_customer_id;
  const s = u.stripeSubscriptionId ?? u.stripe_subscription_id;
  return (
    (typeof c === "string" && c.trim().length > 0) ||
    (typeof s === "string" && s.trim().length > 0)
  );
};

/** True if billing is managed via Stripe (portal / cancel). */
export const isStripeSubscriptionBilling = (userData: unknown): boolean => {
  if (!userData || typeof userData !== "object") return false;
  const data = userData as Record<string, any>;
  const provider = readProvider(data);
  return !provider || provider === "stripe";
};

import AsyncStorage from "@react-native-async-storage/async-storage";

/** Daily cap: non-subscribers may unlock at most one premium (“bonus”) play via rewarded ad per local calendar day. */
const VIDEO_PREMIUM_BONUS_REWARD_DAILY_KEY =
  "@videoPremiumBonusRewardDaily_v1";

type DailyPremiumBonusRewardPersisted = {
  day: string;
  used: boolean;
};

type VideoAdPolicyState = {
  videoOpenCount: number;
  interstitialShownCount: number;
  lastInterstitialAtMs: number;
  lastAppOpenAtMs: number;
  premiumBonusRewardDaily: DailyPremiumBonusRewardPersisted;
};

const getLocalCalendarDay = (): string => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const emptyPremiumBonusDaily = (): DailyPremiumBonusRewardPersisted => ({
  day: getLocalCalendarDay(),
  used: false,
});

const state: VideoAdPolicyState = {
  videoOpenCount: 0,
  interstitialShownCount: 0,
  lastInterstitialAtMs: 0,
  lastAppOpenAtMs: 0,
  premiumBonusRewardDaily: emptyPremiumBonusDaily(),
};

const nowMs = () => Date.now();

let hydratePromise: Promise<void> | null = null;

const normalizePremiumBonusDaily = (
  raw: DailyPremiumBonusRewardPersisted | null
): DailyPremiumBonusRewardPersisted => {
  const today = getLocalCalendarDay();
  if (!raw || typeof raw.day !== "string" || typeof raw.used !== "boolean") {
    return { day: today, used: false };
  }
  if (raw.day !== today) {
    return { day: today, used: false };
  }
  return { day: raw.day, used: raw.used };
};

const persistPremiumBonusDaily = async (
  value: DailyPremiumBonusRewardPersisted
): Promise<void> => {
  await AsyncStorage.setItem(
    VIDEO_PREMIUM_BONUS_REWARD_DAILY_KEY,
    JSON.stringify(value)
  );
};

/** Load daily premium-bonus rewarded state from storage once (or until invalidate). */
export const ensureRewardedPolicyHydrated = (): Promise<void> => {
  if (!hydratePromise) {
    hydratePromise = (async () => {
      try {
        const json = await AsyncStorage.getItem(
          VIDEO_PREMIUM_BONUS_REWARD_DAILY_KEY
        );
        const parsed = json
          ? (JSON.parse(json) as DailyPremiumBonusRewardPersisted)
          : null;
        state.premiumBonusRewardDaily = normalizePremiumBonusDaily(parsed);
      } catch {
        state.premiumBonusRewardDaily = emptyPremiumBonusDaily();
      }
    })();
  }
  return hydratePromise;
};

/** Tests or force re-read from disk */
export const invalidateRewardedPolicyCache = (): void => {
  hydratePromise = null;
};

export const VIDEO_AD_POLICY = {
  interstitialEveryNVideoOpens: 3,
  interstitialCooldownMs: 120_000,
  interstitialMaxPerSession: 6,
  appOpenCooldownMs: 4 * 60 * 60_000,
} as const;

/** Resets interstitial / app-open session counters only — not daily premium bonus reward. */
export const resetVideoAdSession = (): void => {
  state.videoOpenCount = 0;
  state.interstitialShownCount = 0;
  state.lastInterstitialAtMs = 0;
  state.lastAppOpenAtMs = 0;
};

export const recordVideoOpen = (): void => {
  state.videoOpenCount += 1;
};

export const shouldShowVideoInterstitial = (): boolean => {
  if (state.interstitialShownCount >= VIDEO_AD_POLICY.interstitialMaxPerSession) {
    return false;
  }

  if (
    state.videoOpenCount % VIDEO_AD_POLICY.interstitialEveryNVideoOpens !==
    0
  ) {
    return false;
  }

  const elapsed = nowMs() - state.lastInterstitialAtMs;
  if (elapsed < VIDEO_AD_POLICY.interstitialCooldownMs) {
    return false;
  }

  return true;
};

export const recordVideoInterstitialShown = (): void => {
  state.interstitialShownCount += 1;
  state.lastInterstitialAtMs = nowMs();
};

export const shouldShowVideoAppOpen = (): boolean => {
  const elapsed = nowMs() - state.lastAppOpenAtMs;
  return elapsed >= VIDEO_AD_POLICY.appOpenCooldownMs;
};

export const recordVideoAppOpenShown = (): void => {
  state.lastAppOpenAtMs = nowMs();
};

/**
 * Non-subscribers: 1 while today's rewarded premium unlock slot is unused, otherwise 0.
 * Subscribers bypass rewarded premium in the UI.
 */
export const getPremiumBonusRewardUnlocksRemainingToday = (): number => {
  if (state.premiumBonusRewardDaily.used) return 0;
  return 1;
};

/** After user successfully completes rewarded ad that unlocks a premium video for a non-subscriber. */
export const recordPremiumBonusRewardUnlockConsumed =
  async (): Promise<void> => {
    const today = getLocalCalendarDay();
    state.premiumBonusRewardDaily = { day: today, used: true };
    await persistPremiumBonusDaily(state.premiumBonusRewardDaily);
  };

type VideoAdPolicyState = {
  videoOpenCount: number;
  interstitialShownCount: number;
  lastInterstitialAtMs: number;
  lastAppOpenAtMs: number;
};

// Session-only in-memory state (resets on app reload).
const state: VideoAdPolicyState = {
  videoOpenCount: 0,
  interstitialShownCount: 0,
  lastInterstitialAtMs: 0,
  lastAppOpenAtMs: 0,
};

const nowMs = () => Date.now();

export const VIDEO_AD_POLICY = {
  interstitialEveryNVideoOpens: 3,
  interstitialCooldownMs: 120_000,
  interstitialMaxPerSession: 6,
  appOpenCooldownMs: 10 * 60_000,
} as const;

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


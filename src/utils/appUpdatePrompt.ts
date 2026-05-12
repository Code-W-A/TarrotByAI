import type { Timestamp } from "firebase/firestore";

export const SHOULD_UPDATE_COLLECTION = "ShouldUpdate";
/** Document id matches dashboard / legacy expo screens */
export const SHOULD_UPDATE_DOC_ID = "unicde";

export const isShouldUpdateFlagEnabled = (data: Record<string, unknown> | undefined): boolean => {
  if (!data) return false;
  const v = data.update;
  return v === true || v === 1 || v === "true" || v === "1";
};

/** Optional helper for logging / analytics */
export const getShouldUpdateDocUpdatedAtMs = (data: Record<string, unknown>): number => {
  const u = data.updatedAt as Timestamp | undefined;
  if (u && typeof u.toMillis === "function") {
    return u.toMillis();
  }
  return 0;
};

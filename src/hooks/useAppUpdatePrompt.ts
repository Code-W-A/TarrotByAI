import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc } from "firebase/firestore";
import { db } from "../../firebase";
import { trackedGetDocFromServer } from "../utils/firestoreReadTelemetry";
import {
  isShouldUpdateFlagEnabled,
  SHOULD_UPDATE_COLLECTION,
  SHOULD_UPDATE_DOC_ID,
} from "../utils/appUpdatePrompt";

const UPDATE_PROMPT_CACHE_KEY = "appUpdatePrompt:lastCheck:v1";
const UPDATE_PROMPT_TTL_MS = 6 * 60 * 60 * 1000;

let sessionUpdatePromptDecision:
  | { checkedAt: number; shouldShow: boolean }
  | null = null;

const readCachedDecision = async () => {
  const now = Date.now();

  if (
    sessionUpdatePromptDecision &&
    now - sessionUpdatePromptDecision.checkedAt < UPDATE_PROMPT_TTL_MS
  ) {
    return sessionUpdatePromptDecision;
  }

  try {
    const cached = await AsyncStorage.getItem(UPDATE_PROMPT_CACHE_KEY);
    if (!cached) return null;

    const parsed = JSON.parse(cached) as {
      checkedAt?: number;
      shouldShow?: boolean;
    };

    if (
      typeof parsed.checkedAt === "number" &&
      now - parsed.checkedAt < UPDATE_PROMPT_TTL_MS
    ) {
      sessionUpdatePromptDecision = {
        checkedAt: parsed.checkedAt,
        shouldShow: parsed.shouldShow === true,
      };
      return sessionUpdatePromptDecision;
    }
  } catch (error) {
    console.log("[useAppUpdatePrompt] cache read failed:", error);
  }

  return null;
};

const writeCachedDecision = async (shouldShow: boolean) => {
  const decision = { checkedAt: Date.now(), shouldShow };
  sessionUpdatePromptDecision = decision;

  try {
    await AsyncStorage.setItem(UPDATE_PROMPT_CACHE_KEY, JSON.stringify(decision));
  } catch (error) {
    console.log("[useAppUpdatePrompt] cache write failed:", error);
  }
};

/**
 * On screen focus: checks ShouldUpdate/unicde with session + 6h local throttling.
 * While `update` is true, the modal is shown every time the user enters the screen.
 * Close only hides it until the next focus (or until the flag is turned off).
 */
export function useAppUpdatePrompt(): {
  visible: boolean;
  onClose: () => void;
  runCheck: () => Promise<void>;
} {
  const [visible, setVisible] = useState(false);

  const runCheck = useCallback(async () => {
    try {
      const cachedDecision = await readCachedDecision();
      if (cachedDecision) {
        setVisible(cachedDecision.shouldShow);
        return;
      }

      const docRef = doc(db, SHOULD_UPDATE_COLLECTION, SHOULD_UPDATE_DOC_ID);
      const docSnap = await trackedGetDocFromServer(docRef);
      if (!docSnap.exists()) {
        await writeCachedDecision(false);
        setVisible(false);
        return;
      }
      const data = docSnap.data() as Record<string, unknown>;
      if (!isShouldUpdateFlagEnabled(data)) {
        await writeCachedDecision(false);
        setVisible(false);
        return;
      }
      await writeCachedDecision(true);
      setVisible(true);
    } catch (e) {
      console.log("[useAppUpdatePrompt] check failed:", e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      runCheck();
    }, [runCheck])
  );

  const onClose = useCallback(() => {
    setVisible(false);
  }, []);

  return { visible, onClose, runCheck };
}

import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { doc } from "firebase/firestore";
import { db } from "../../firebase";
import { trackedGetDocFromServer } from "../utils/firestoreReadTelemetry";
import {
  isShouldUpdateFlagEnabled,
  SHOULD_UPDATE_COLLECTION,
  SHOULD_UPDATE_DOC_ID,
} from "../utils/appUpdatePrompt";

/**
 * On each screen focus: reads ShouldUpdate/unicde from server.
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
      const docRef = doc(db, SHOULD_UPDATE_COLLECTION, SHOULD_UPDATE_DOC_ID);
      const docSnap = await trackedGetDocFromServer(docRef);
      if (!docSnap.exists()) {
        setVisible(false);
        return;
      }
      const data = docSnap.data() as Record<string, unknown>;
      if (!isShouldUpdateFlagEnabled(data)) {
        setVisible(false);
        return;
      }
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

import { useEffect } from "react";
import { StackActions } from "@react-navigation/native";

export const useAnalysisBackNavigation = (navigation, targetRouteName) => {
  useEffect(() => {
    if (!navigation || !targetRouteName) {
      return undefined;
    }

    const unsubscribe = navigation.addListener("beforeRemove", (event) => {
      const actionType = event?.data?.action?.type;
      const isBackAction =
        actionType === "GO_BACK" ||
        actionType === "POP" ||
        actionType === "POP_TO_TOP";

      if (!isBackAction) {
        return;
      }

      event.preventDefault();
      navigation.dispatch(StackActions.replace(targetRouteName));
    });

    return unsubscribe;
  }, [navigation, targetRouteName]);
};


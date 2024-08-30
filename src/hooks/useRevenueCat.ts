import { useEffect } from "react";
import { useState } from "react";
import { Platform } from "react-native";
import Purchases, {
  CustomerInfo,
  PurchasesOffering,
} from "react-native-purchases";
// import Logger from "../utils/Logger";
// import Bugsnag from "@bugsnag/expo";

const APIKeys = {
  google: "goog_UHrsSHGQqgcuRaQShpRZulzKvbN",
};

function useRevenueCat() {
  const [currentOffering, setCurrentOffering] =
    useState<PurchasesOffering | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);

  console.log("setting isProMember", customerInfo?.entitlements.active.pro);

  const isProMember = customerInfo?.entitlements.active.pro;

  console.log("setting isProMember success", isProMember?.isActive);

  useEffect(() => {
    const fetchData = async () => {
      try {
        Purchases.setDebugLogsEnabled(true);
        await Purchases.configure({ apiKey: APIKeys.google });

        const offerings = await Purchases.getOfferings();
        setCurrentOffering(offerings.current);
        console.log("our offerings...", offerings.current);

        const customerInfomation = await Purchases.getCustomerInfo();
        // console.log("Customer Info...", customerInfomation);
        setCustomerInfo(customerInfomation);
      } catch (error) {
        console.log("Error on hook setup and fetch for Revenue Cat...", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const customerInfoUpdate = async (purchaseInfo: CustomerInfo) => {
      setCustomerInfo(purchaseInfo);
    };

    Purchases.addCustomerInfoUpdateListener(customerInfoUpdate);
  }, []);

  return { currentOffering, customerInfo, isProMember };
}

export default useRevenueCat;

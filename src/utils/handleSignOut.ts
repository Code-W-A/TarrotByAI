import { signOut } from "firebase/auth";
import { screenName } from "./screenName";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authentication } from "../../firebase";

export const handleSignOut = () => {
  const auth = authentication;
  return signOut(auth); // Returnează promisiunea
};

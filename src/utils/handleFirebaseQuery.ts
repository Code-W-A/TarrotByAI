import { collection, query, where, getDocsFromServer, limit } from "firebase/firestore";
import { authentication, db } from "../../firebase";
import { getDocsPreferCache } from "./firestoreCache";

export const handleGetUserInfo = async () => {
  let userData;
  let auth = authentication;
  try {
    const q = query(
      collection(db, "Users"),
      where("owner_uid", "==", auth.currentUser.uid),
      limit(1)
    );

    const querySnapshot = await getDocsPreferCache(q);
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      userData = doc.data();
    });
    return userData;
  } catch (err) {
    console.log("error...handleGetUserInfo...", err);
  }
};

export const handleGetUserInfoFromServer = async () => {
  let userData;
  let auth = authentication;
  try {
    if (!auth.currentUser?.uid) {
      return undefined;
    }
    const q = query(
      collection(db, "Users"),
      where("owner_uid", "==", auth.currentUser.uid),
      limit(1)
    );

    const querySnapshot = await getDocsFromServer(q);
    querySnapshot.forEach((doc) => {
      userData = doc.data();
    });
    return userData;
  } catch (err) {
    console.log("error...handleGetUserInfoFromServer...", err);
  }
};

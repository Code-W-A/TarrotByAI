import { collection, getDocs, query, where } from "firebase/firestore";
import { authentication, db } from "../../firebase";

export const handleGetUserInfo = async () => {
  let userData;
  let auth = authentication;
  try {
    const q = query(
      collection(db, "Users"),
      where("owner_uid", "==", auth.currentUser.uid)
    );

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      userData = doc.data();
    });
    return userData;
  } catch (err) {
    console.log("error...handleGetUserInfo...", err);
  }
};

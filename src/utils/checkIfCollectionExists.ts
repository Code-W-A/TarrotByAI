import { getDocs } from "firebase/firestore";

export const checkCollectionExists = async (collectionRef) => {
    try {
      const snapshot = await getDocs(collectionRef);
      return snapshot.size > 0;
    } catch (error) {
      return false;
    }
  };
  
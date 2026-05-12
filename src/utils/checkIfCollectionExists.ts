import { trackedGetDocs } from "./firestoreReadTelemetry";

export const checkCollectionExists = async (collectionRef) => {
  try {
    const snapshot = await trackedGetDocs(collectionRef);
    return snapshot.size > 0;
  } catch (error) {
    return false;
  }
};

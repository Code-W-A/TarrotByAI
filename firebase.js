import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage, ref, uploadBytes } from "firebase/storage";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB4zVjD4zGNdjXw90cMudPB74mE-FHRXkE",
  authDomain: "tarrot-590ee.firebaseapp.com",
  databaseURL:
    "https://tarrot-590ee-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "tarrot-590ee",
  storageBucket: "tarrot-590ee.appspot.com",
  messagingSenderId: "76318868979",
  appId: "1:76318868979:web:9c923de91e9d4795bdfe86",
  measurementId: "G-YJNE2J0837",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with persistence
const authentication = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
authentication.useDeviceLanguage();

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

//Storage
const storage = getStorage(app);
const analytics = getAnalytics(app);

export { db, authentication, storage, analytics };

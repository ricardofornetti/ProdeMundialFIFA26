import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import firebaseConfig from "./firebase-applet-config.json";

const app = initializeApp(firebaseConfig);
// Respect the named database if provided in the config
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);
export const auth = getAuth(app);

// Force session persistence to local storage to prevent session loss on mobile devices and PWAs
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.error("Firebase persistence initialization failed: ", err);
});

/**
 * Firebase client bootstrap.
 * Auth + Firestore only. Images go to Cloudinary — never Firebase Storage.
 */
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

export const isFirebaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== "demo"
);

function createApp(): FirebaseApp {
  if (getApps().length) return getApp();
  if (!isFirebaseConfigured) {
    return initializeApp({
      apiKey: "demo",
      authDomain: "demo.firebaseapp.com",
      projectId: "demo",
      appId: "1:0:web:demo",
    });
  }
  return initializeApp(firebaseConfig);
}

export const app: FirebaseApp = createApp();
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

export default app;

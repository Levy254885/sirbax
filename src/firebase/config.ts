/**
 * Firebase client bootstrap.
 * Auth + Firestore only. Images go to Cloudinary — never Firebase Storage.
 */
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBVnEVaJFqPqWfEbaqL2KX-WmijpFjM714",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "anonymous-e.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "anonymous-e",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "anonymous-e.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "348982931244",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:348982931244:web:18e7900edc6288ee924689",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-K4BZFX46PF",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://anonymous-e-default-rtdb.firebaseio.com",
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.apiKey !== "demo"
);

function createApp(): FirebaseApp {
  if (getApps().length) return getApp();
  return initializeApp(firebaseConfig);
}

export const app: FirebaseApp = createApp();
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

export default app;

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

/**
 * Firebase client configuration.
 *
 * In production, set these via environment variables (NEXT_PUBLIC_*) so you
 * don't commit secrets. Get the values from Firebase Console > Project
 * settings > Your apps > Web app config.
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "your-api-key",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "your-project.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "your-project.appspot.com",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "your-app-id",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };

import { initializeApp, getApps } from "firebase/app";
import { 
  getAuth, 
  browserLocalPersistence,
  setPersistence 
} from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase only if not already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Use browser local persistence for better performance
// This allows Firebase to cache authentication state properly
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence)
    .then(() => {
      console.log("✅ Firebase authentication configured");
    })
    .catch((error) => {
      console.warn("⚠️ Persistence setup warning:", error.message);
    });
}

export default app;

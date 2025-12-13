// Client-side Firebase configuration
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getAnalytics, Analytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
};

// Initialize Firebase (only if not already initialized and on client-side)
let app: FirebaseApp | null = null;

if (typeof window !== 'undefined') {
  if (!getApps().length) {
    try {
      app = initializeApp(firebaseConfig);
    } catch (error) {
      console.error('Firebase initialization error:', error);
    }
  } else {
    app = getApps()[0];
  }
}

// Initialize Firestore (only on client-side)
export const db: Firestore | null = 
  typeof window !== 'undefined' && app ? getFirestore(app) : null as any;

// Initialize Auth (only on client-side)
export const auth: Auth | null = 
  typeof window !== 'undefined' && app ? getAuth(app) : null as any;

// Initialize Analytics (only on client-side)
export const analytics: Analytics | null = 
  typeof window !== 'undefined' && app ? getAnalytics(app) : null;

export default app;


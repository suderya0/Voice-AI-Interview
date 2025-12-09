// Server-side Firebase Admin configuration
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let adminApp: App | null = null;
let adminDb: Firestore | null = null;

function initializeFirebaseAdmin() {
  if (adminDb) {
    return adminDb;
  }

  if (!getApps().length) {
    // Initialize Firebase Admin
    // Option 1: Use service account from environment variable (recommended for production)
    if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      try {
        adminApp = initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            privateKey: process.env.FIREBASE_PRIVATE_KEY,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          }),
        });
        adminDb = getFirestore(adminApp);
        console.log('Firebase Admin initialized with service account credentials');
      } catch (error: any) {
        console.error('Firebase Admin initialization error:', error.message);
        throw new Error(`Firebase Admin initialization failed: ${error.message}`);
      }
    } 
    // Option 2: Use default credentials (for local development with gcloud CLI)
    else {
      try {
        adminApp = initializeApp({
          projectId: 'movie-mania-68ffc',
        });
        adminDb = getFirestore(adminApp);
        console.log('Firebase Admin initialized with default credentials');
      } catch (error: any) {
        console.error('Firebase Admin initialization error:', error.message);
        // Don't throw - allow it to fail gracefully and use client SDK as fallback
        console.warn('Firebase Admin not initialized. Using client SDK may be required.');
      }
    }
  } else {
    adminApp = getApps()[0];
    adminDb = getFirestore(adminApp);
  }

  return adminDb;
}

// Initialize on module load
try {
  adminDb = initializeFirebaseAdmin();
} catch (error) {
  console.error('Failed to initialize Firebase Admin:', error);
}

export { adminApp, adminDb };
export default adminDb;


'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

// Check if auth is available (client-side only)
const isAuthAvailable = typeof window !== 'undefined' && auth !== null;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If auth is not available (server-side or Firebase not configured), skip auth check
    if (!isAuthAvailable) {
      setLoading(false);
      return;
    }

    // Set a timeout to prevent infinite loading if Firebase is slow
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('Auth check taking too long, setting loading to false');
        setLoading(false);
      }
    }, 3000); // 3 second timeout

    try {
      if (!auth) {
        clearTimeout(timeoutId);
        setLoading(false);
        return;
      }

      const unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          clearTimeout(timeoutId);
          setUser(user);
          setLoading(false);
        },
        (error) => {
          clearTimeout(timeoutId);
          console.error('Auth state change error:', error);
          setUser(null);
          setLoading(false);
        }
      );

      return () => {
        clearTimeout(timeoutId);
        unsubscribe();
      };
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Error setting up auth listener:', error);
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!auth) throw new Error('Firebase Auth is not available');
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, name: string) => {
    if (!auth) throw new Error('Firebase Auth is not available');
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Create user profile in Firestore
    await fetch('/api/user/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: userCredential.user.uid,
        email: userCredential.user.email,
        name,
      }),
    });
  };

  const signInWithGoogle = async () => {
    if (!auth) throw new Error('Firebase Auth is not available');
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    // Create or update user profile in Firestore
    await fetch('/api/user/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: userCredential.user.uid,
        email: userCredential.user.email,
        name: userCredential.user.displayName || '',
      }),
    });
  };

  const signOut = async () => {
    if (!auth) throw new Error('Firebase Auth is not available');
    await firebaseSignOut(auth);
  };

  const resetPassword = async (email: string) => {
    if (!auth) throw new Error('Firebase Auth is not available');
    await sendPasswordResetEmail(auth, email);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signInWithGoogle, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}


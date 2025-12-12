import { logger } from '@/utils/logger';
import { adminDb } from '@/lib/firebase-admin';
import { db as clientDb } from '@/lib/firebase';
import { collection, addDoc, doc, getDoc, getDocs, query, where, updateDoc, setDoc } from 'firebase/firestore';

export interface UserProfile {
  id?: string;
  userId: string; // Firebase Auth UID
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  feedbacks: InterviewFeedback[];
}

export interface InterviewFeedback {
  interviewId: string;
  jobTitle: string;
  difficulty: string;
  completedAt: Date;
  feedback: {
    overallScore: number;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    detailedAnalysis: string;
    generatedAt: Date;
  };
}

class UserProfileAdapter {
  private useAdmin: boolean;
  private adminDb: any;
  private clientDb: any;

  constructor() {
    this.useAdmin = !!adminDb;
    this.adminDb = adminDb;
    this.clientDb = clientDb;
    
    if (!this.useAdmin && !this.clientDb) {
      throw new Error('Firebase not initialized. Please check your Firebase configuration.');
    }
  }

  async createOrUpdate(data: Omit<UserProfile, 'id'>): Promise<string> {
    try {
      if (this.useAdmin && this.adminDb) {
        // Use Admin SDK
        const docRef = this.adminDb.collection('users').doc(data.userId);
        await docRef.set({
          ...data,
          createdAt: data.createdAt || new Date(),
          updatedAt: new Date(),
        }, { merge: true });
        return docRef.id;
      } else {
        // Use Client SDK
        const docRef = doc(this.clientDb, 'users', data.userId);
        await setDoc(docRef, {
          ...data,
          createdAt: data.createdAt || new Date(),
          updatedAt: new Date(),
        }, { merge: true });
        return docRef.id;
      }
    } catch (error: any) {
      logger.error('Error creating/updating user profile', { error: error.message });
      throw error;
    }
  }

  async findById(userId: string): Promise<UserProfile | null> {
    try {
      if (this.useAdmin && this.adminDb) {
        const docRef = this.adminDb.collection('users').doc(userId);
        const docSnap = await docRef.get();
        if (!docSnap.exists) {
          return null;
        }
        return { id: docSnap.id, ...docSnap.data() } as UserProfile;
      } else {
        const docRef = doc(this.clientDb, 'users', userId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          return null;
        }
        return { id: docSnap.id, ...docSnap.data() } as UserProfile;
      }
    } catch (error: any) {
      logger.error('Error finding user profile', { error: error.message });
      throw error;
    }
  }

  async addFeedback(userId: string, feedback: InterviewFeedback): Promise<void> {
    try {
      const userProfile = await this.findById(userId);
      if (!userProfile) {
        throw new Error('User profile not found');
      }

      const updatedFeedbacks = [...(userProfile.feedbacks || []), feedback];

      if (this.useAdmin && this.adminDb) {
        const docRef = this.adminDb.collection('users').doc(userId);
        await docRef.update({
          feedbacks: updatedFeedbacks,
          updatedAt: new Date(),
        });
      } else {
        const docRef = doc(this.clientDb, 'users', userId);
        await updateDoc(docRef, {
          feedbacks: updatedFeedbacks,
          updatedAt: new Date(),
        });
      }
    } catch (error: any) {
      logger.error('Error adding feedback to user profile', { error: error.message });
      throw error;
    }
  }
}

export const UserProfileModel = new UserProfileAdapter();


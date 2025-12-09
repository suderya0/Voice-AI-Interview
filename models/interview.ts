// Firestore implementation example
// For MongoDB, use mongoose or native driver

import { logger } from '@/utils/logger';
import { adminDb } from '@/lib/firebase-admin';
import { db as clientDb } from '@/lib/firebase';
import { collection, addDoc, doc, getDoc, getDocs, query, where, orderBy, limit, startAfter, updateDoc } from 'firebase/firestore';

// TypeScript interface for Interview
export interface Interview {
  id?: string;
  userId: string;
  jobTitle: string;
  jobDescription: string;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number; // minutes
  status: 'created' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  currentQuestion?: string;
  questions?: string[];
  transcript: string[];
  audioUrl?: string;
  feedback?: {
    overallScore: number;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    detailedAnalysis: string;
    generatedAt: Date;
  };
}

// Database adapter interface
interface DatabaseAdapter {
  create(data: Omit<Interview, 'id'>): Promise<string>;
  findById(id: string): Promise<Interview | null>;
  findMany(filters: any, options?: any): Promise<Interview[]>;
  update(id: string, data: Partial<Interview>): Promise<Interview>;
  count(filters: any): Promise<number>;
}

// Firestore implementation
class FirestoreAdapter implements DatabaseAdapter {
  private useAdmin: boolean;
  private adminDb: any;
  private clientDb: any;

  constructor() {
    // Try to use Admin SDK first, fallback to client SDK
    this.useAdmin = !!adminDb;
    this.adminDb = adminDb;
    this.clientDb = clientDb;
    
    if (!this.useAdmin && !this.clientDb) {
      throw new Error('Firebase not initialized. Please check your Firebase configuration.');
    }
  }

  async create(data: Omit<Interview, 'id'>): Promise<string> {
    try {
// models/interview.ts içindeki ilgili kısım

        if (this.adminDb) {
          // --- ADMIN SDK KISMI (Burada hata alıyordun) ---
          const docRef = await this.adminDb.collection('interviews').add({
            ...data,
            // Timestamp.fromDate(...) yerine direkt new Date() kullan
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          return docRef.id;
        } else {
          // --- CLIENT SDK KISMI ---
          // Burası için de new Date() kullanmak en güvenlisidir
          const docRef = await addDoc(collection(this.clientDb, 'interviews'), {
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          return docRef.id;
        }
    } catch (error: any) {
      logger.error('Error creating interview in Firestore', { error: error.message });
      throw error;
    }
  }

  async findById(id: string): Promise<Interview | null> {
    try {
      if (this.useAdmin && this.adminDb) {
        // Use Admin SDK
        const docRef = this.adminDb.collection('interviews').doc(id);
        const docSnap = await docRef.get();
        if (!docSnap.exists) {
          return null;
        }
        return { id: docSnap.id, ...docSnap.data() } as Interview;
      } else {
        // Use Client SDK
        const docRef = doc(this.clientDb, 'interviews', id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          return null;
        }
        return { id: docSnap.id, ...docSnap.data() } as Interview;
      }
    } catch (error: any) {
      logger.error('Error finding interview in Firestore', { error: error.message });
      throw error;
    }
  }

  async findMany(filters: any, options?: any): Promise<Interview[]> {
    try {
      if (this.useAdmin && this.adminDb) {
        // Use Admin SDK
        let firestoreQuery: any = this.adminDb.collection('interviews');

        if (filters.userId) {
          firestoreQuery = firestoreQuery.where('userId', '==', filters.userId);
        }
        if (filters.status) {
          firestoreQuery = firestoreQuery.where('status', '==', filters.status);
        }

        if (options?.sortBy) {
          const [field, direction] = Object.entries(options.sortBy)[0];
          firestoreQuery = firestoreQuery.orderBy(field, direction === -1 ? 'desc' : 'asc');
        }

        if (options?.offset) {
          firestoreQuery = firestoreQuery.offset(options.offset);
        }
        if (options?.limit) {
          firestoreQuery = firestoreQuery.limit(options.limit);
        }

        const snapshot = await firestoreQuery.get();
        return snapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
        })) as Interview[];
      } else {
        // Use Client SDK
        let firestoreQuery: any = collection(this.clientDb, 'interviews');

        if (filters.userId) {
          firestoreQuery = query(firestoreQuery, where('userId', '==', filters.userId));
        }
        if (filters.status) {
          firestoreQuery = query(firestoreQuery, where('status', '==', filters.status));
        }

        if (options?.sortBy) {
          const [field, direction] = Object.entries(options.sortBy)[0];
          firestoreQuery = query(firestoreQuery, orderBy(field as string, direction === -1 ? 'desc' : 'asc'));
        }

        if (options?.limit) {
          firestoreQuery = query(firestoreQuery, limit(options.limit));
        }

        const snapshot = await getDocs(firestoreQuery);
        return snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as any),
        })) as Interview[];
      }
    } catch (error: any) {
      logger.error('Error finding interviews in Firestore', { error: error.message });
      throw error;
    }
  }

  async update(id: string, data: Partial<Interview>): Promise<Interview> {
    try {
      if (this.useAdmin && this.adminDb) {
        // Use Admin SDK
        const docRef = this.adminDb.collection('interviews').doc(id);
        await docRef.update({
          ...(data as any),
          // Use plain Date to avoid cross-SDK Timestamp mismatch
          updatedAt: new Date(),
        });
        return this.findById(id) as Promise<Interview>;
      } else {
        // Use Client SDK
        const docRef = doc(this.clientDb, 'interviews', id);
        await updateDoc(docRef, {
          ...(data as any),
          // Pass Date; client SDK converts to Firestore Timestamp
          updatedAt: new Date(),
        });
        return this.findById(id) as Promise<Interview>;
      }
    } catch (error: any) {
      logger.error('Error updating interview in Firestore', { error: error.message });
      throw error;
    }
  }

  async count(filters: any): Promise<number> {
    try {
      if (this.useAdmin && this.adminDb) {
        // Use Admin SDK
        let firestoreQuery: any = this.adminDb.collection('interviews');

        if (filters.userId) {
          firestoreQuery = firestoreQuery.where('userId', '==', filters.userId);
        }
        if (filters.status) {
          firestoreQuery = firestoreQuery.where('status', '==', filters.status);
        }

        const snapshot = await firestoreQuery.count().get();
        return snapshot.data().count;
      } else {
        // Use Client SDK - get all and count (Firestore client SDK doesn't have count query)
        let firestoreQuery: any = collection(this.clientDb, 'interviews');

        if (filters.userId) {
          firestoreQuery = query(firestoreQuery, where('userId', '==', filters.userId));
        }
        if (filters.status) {
          firestoreQuery = query(firestoreQuery, where('status', '==', filters.status));
        }

        const snapshot = await getDocs(firestoreQuery);
        return snapshot.size;
      }
    } catch (error: any) {
      logger.error('Error counting interviews in Firestore', { error: error.message });
      throw error;
    }
  }
}

// MongoDB implementation (using Mongoose example)
class MongoDBAdapter implements DatabaseAdapter {
  private InterviewSchema: any; // Mongoose model

  constructor() {
    // Initialize MongoDB connection
    // const mongoose = require('mongoose');
    // mongoose.connect(process.env.MONGODB_URI);
    // this.InterviewSchema = mongoose.model('Interview', interviewSchema);
    this.InterviewSchema = null; // Placeholder - initialize with your Mongoose model
  }

  async create(data: Omit<Interview, 'id'>): Promise<string> {
    try {
      const interview = new this.InterviewSchema(data);
      const saved = await interview.save();
      return saved._id.toString();
    } catch (error) {
      logger.error('Error creating interview in MongoDB', { error });
      throw error;
    }
  }

  async findById(id: string): Promise<Interview | null> {
    try {
      const interview = await this.InterviewSchema.findById(id);
      return interview ? interview.toObject() : null;
    } catch (error) {
      logger.error('Error finding interview in MongoDB', { error });
      throw error;
    }
  }

  async findMany(filters: any, options?: any): Promise<Interview[]> {
    try {
      const query = this.InterviewSchema.find(filters);

      if (options?.sortBy) {
        const [field, direction] = Object.entries(options.sortBy)[0];
        query.sort({ [field]: direction });
      }

      if (options?.offset) {
        query.skip(options.offset);
      }
      if (options?.limit) {
        query.limit(options.limit);
      }

      return await query.exec();
    } catch (error) {
      logger.error('Error finding interviews in MongoDB', { error });
      throw error;
    }
  }

  async update(id: string, data: Partial<Interview>): Promise<Interview> {
    try {
      const interview = await this.InterviewSchema.findByIdAndUpdate(
        id,
        { ...data, updatedAt: new Date() },
        { new: true }
      );
      if (!interview) {
        throw new Error('Interview not found');
      }
      return interview.toObject();
    } catch (error) {
      logger.error('Error updating interview in MongoDB', { error });
      throw error;
    }
  }

  async count(filters: any): Promise<number> {
    try {
      return await this.InterviewSchema.countDocuments(filters);
    } catch (error) {
      logger.error('Error counting interviews in MongoDB', { error });
      throw error;
    }
  }
}

// Export the model with adapter
const dbType = process.env.DB_TYPE || 'firestore'; // 'firestore' or 'mongodb'

export const InterviewModel: DatabaseAdapter =
  dbType === 'mongodb' ? new MongoDBAdapter() : new FirestoreAdapter();


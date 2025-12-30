import { NextRequest, NextResponse } from 'next/server';
import { InterviewModel, Interview } from '@/models/interview';
import { logger } from '@/utils/logger';

/**
 * POST /api/interview/create
 * Creates a new interview session
 * Supports demo mode (isDemo: true) - doesn't require userId and doesn't save to database
 * 
 * 
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, jobTitle, jobDescription, difficulty, duration, isDemo } = body;

    // Demo mode: create interview without saving to database
    if (isDemo === true) {
      // Generate a temporary ID for demo purposes
      const demoInterviewId = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      logger.info('Demo interview created', { demoInterviewId });

      return NextResponse.json({
        success: true,
        interviewId: demoInterviewId,
        isDemo: true,
        interview: {
          id: demoInterviewId,
          userId: null,
          jobTitle: jobTitle || 'Demo Interview',
          jobDescription: jobDescription || '',
          difficulty: difficulty || 'medium',
          duration: duration || 30,
          status: 'created',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }

    // Real interview: requires userId and saves to database
    if (!userId || !jobTitle) {
      return NextResponse.json(
        { error: 'Missing required fields: userId and jobTitle' },
        { status: 400 }
      );
    }

    // Create interview document
    const interview: Omit<Interview, 'id'> = {
      userId,
      jobTitle,
      jobDescription: jobDescription || '',
      difficulty: (difficulty || 'medium') as 'easy' | 'medium' | 'hard',
      duration: duration || 30, // minutes
      status: 'created',
      createdAt: new Date(),
      updatedAt: new Date(),
      transcript: [],
    };

    // Save to database (Firestore or MongoDB)
    const interviewId = await InterviewModel.create(interview);

    logger.info('Interview created', { interviewId, userId });

    return NextResponse.json({
      success: true,
      interviewId,
      isDemo: false,
      interview: {
        ...interview,
        id: interviewId,
      },
    });
  } catch (error: any) {
    logger.error('Error creating interview', { error: error.message, stack: error.stack });
    return NextResponse.json(
      { 
        error: 'Failed to create interview',
        message: error.message || 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}


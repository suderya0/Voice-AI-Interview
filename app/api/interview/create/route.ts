import { NextRequest, NextResponse } from 'next/server';
import { InterviewModel } from '@/models/interview';
import { logger } from '@/utils/logger';

/**
 * POST /api/interview/create
 * Creates a new interview session
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, jobTitle, jobDescription, difficulty, duration } = body;

    // Validate required fields
    if (!userId || !jobTitle) {
      return NextResponse.json(
        { error: 'Missing required fields: userId and jobTitle' },
        { status: 400 }
      );
    }

    // Create interview document
    const interview = {
      userId,
      jobTitle,
      jobDescription: jobDescription || '',
      difficulty: difficulty || 'medium',
      duration: duration || 30, // minutes
      status: 'created',
      createdAt: new Date(),
      updatedAt: new Date(),
      feedback: null,
      transcript: [],
      audioUrl: null,
    };

    // Save to database (Firestore or MongoDB)
    const interviewId = await InterviewModel.create(interview);

    logger.info('Interview created', { interviewId, userId });

    return NextResponse.json({
      success: true,
      interviewId,
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


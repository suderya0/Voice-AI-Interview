import { NextRequest, NextResponse } from 'next/server';
import { UserProfileModel } from '@/models/user';
import { InterviewModel } from '@/models/interview';
import { logger } from '@/utils/logger';

/**
 * POST /api/user/feedback
 * Adds interview feedback to user profile
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, interviewId } = body;

    if (!userId || !interviewId) {
      return NextResponse.json(
        { error: 'Missing required fields: userId and interviewId' },
        { status: 400 }
      );
    }

    // Fetch interview to get feedback
    const interview = await InterviewModel.findById(interviewId);

    if (!interview) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      );
    }

    if (!interview.feedback) {
      return NextResponse.json(
        { error: 'Interview feedback not available yet' },
        { status: 400 }
      );
    }

    // Add feedback to user profile
    const feedback = {
      interviewId,
      jobTitle: interview.jobTitle,
      difficulty: interview.difficulty,
      completedAt: interview.completedAt || new Date(),
      feedback: interview.feedback,
    };

    await UserProfileModel.addFeedback(userId, feedback);

    logger.info('Feedback added to user profile', { userId, interviewId });

    return NextResponse.json({
      success: true,
      message: 'Feedback added to user profile',
    });
  } catch (error: any) {
    logger.error('Error adding feedback to user profile', { error: error.message });
    return NextResponse.json(
      { error: 'Failed to add feedback', message: error.message },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { InterviewModel } from '@/models/interview';
import { GeminiService } from '@/services/gemini';
import { logger } from '@/utils/logger';

/**
 * POST /api/interview/feedback
 * Submits interview feedback and generates AI evaluation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { interviewId, transcript, audioUrl } = body;

    if (!interviewId) {
      return NextResponse.json(
        { error: 'Missing interviewId' },
        { status: 400 }
      );
    }

    // Fetch interview from database
    const interview = await InterviewModel.findById(interviewId);

    if (!interview) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      );
    }

    // Generate feedback using Gemini
    const geminiService = new GeminiService();
    const feedback = await geminiService.generateFeedback({
      jobTitle: interview.jobTitle,
      jobDescription: interview.jobDescription,
      questions: interview.questions || [],
      transcript: transcript || interview.transcript,
      difficulty: interview.difficulty,
    });

    // Update interview with feedback
    const updatedInterview = await InterviewModel.update(interviewId, {
      status: 'completed',
      completedAt: new Date(),
      transcript: transcript || interview.transcript,
      audioUrl: audioUrl || interview.audioUrl,
      feedback: {
        ...feedback,
        generatedAt: new Date(),
      },
      updatedAt: new Date(),
    });

    logger.info('Interview feedback generated', { interviewId });

    // If interview has a userId (not demo), save feedback to user profile
    if (interview.userId && !interview.userId.startsWith('demo_')) {
      try {
        const { UserProfileModel } = await import('@/models/user');
        const feedbackData = {
          interviewId,
          jobTitle: interview.jobTitle,
          difficulty: interview.difficulty,
          completedAt: new Date(),
          feedback: {
            ...feedback,
            generatedAt: new Date(),
          },
        };
        await UserProfileModel.addFeedback(interview.userId, feedbackData);
        logger.info('Feedback saved to user profile', { userId: interview.userId, interviewId });
      } catch (profileError: any) {
        // Log error but don't fail the request
        logger.error('Error saving feedback to user profile', { 
          error: profileError.message,
          userId: interview.userId,
          interviewId 
        });
      }
    }

    return NextResponse.json({
      success: true,
      interviewId,
      feedback: updatedInterview.feedback,
    });
  } catch (error) {
    logger.error('Error generating feedback', { error });
    return NextResponse.json(
      { error: 'Failed to generate feedback' },
      { status: 500 }
    );
  }
}


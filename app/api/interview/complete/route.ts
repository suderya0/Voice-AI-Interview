import { NextRequest, NextResponse } from 'next/server';
import { InterviewModel } from '@/models/interview';
import { GeminiService } from '@/services/gemini';
import { UserProfileModel } from '@/models/user';
import { logger } from '@/utils/logger';

/**
 * POST /api/interview/complete
 * Completes an interview and generates feedback automatically
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { interviewId } = body;

    if (!interviewId) {
      return NextResponse.json(
        { error: 'Missing interviewId' },
        { status: 400 }
      );
    }

    // Check if this is a demo interview
    const isDemo = interviewId.startsWith('demo_');
    
    if (isDemo) {
      // For demo interviews, generate feedback from the transcript in the request body
      const { transcript, jobTitle, jobDescription, difficulty, questions } = body;
      
      if (!transcript || transcript.trim().length === 0) {
        return NextResponse.json({
          success: true,
          message: 'Demo interview completed (no transcript provided)',
          isDemo: true,
        });
      }

      try {
        // Generate feedback using Gemini
        const geminiService = new GeminiService();
        
        const transcriptText = Array.isArray(transcript) 
          ? transcript.join('\n')
          : transcript;

        const feedback = await geminiService.generateFeedback({
          jobTitle: jobTitle || 'Demo Interview',
          jobDescription: jobDescription || '',
          questions: questions || [],
          transcript: transcriptText,
          difficulty: difficulty || 'medium',
        });

        logger.info('Demo interview feedback generated', { interviewId });

        return NextResponse.json({
          success: true,
          interviewId,
          feedback: {
            ...feedback,
            generatedAt: new Date(),
          },
          isDemo: true,
        });
      } catch (error: any) {
        logger.error('Error generating demo feedback', { error: error.message, stack: error.stack });
        // Even if feedback generation fails, return success so user can still see the page
        return NextResponse.json({
          success: true,
          message: 'Demo interview completed (feedback generation failed)',
          isDemo: true,
          error: error.message,
        });
      }
    }

    // Fetch interview from database
    const interview = await InterviewModel.findById(interviewId);

    if (!interview) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      );
    }

    // If already completed, return existing feedback
    if (interview.status === 'completed' && interview.feedback) {
      return NextResponse.json({
        success: true,
        interviewId,
        feedback: interview.feedback,
        alreadyCompleted: true,
      });
    }

    // Generate feedback using Gemini
    const geminiService = new GeminiService();
    
    // Prepare transcript - convert array to string if needed
    const transcriptText = Array.isArray(interview.transcript) 
      ? interview.transcript.join('\n')
      : interview.transcript || '';

    // Only generate feedback if we have a transcript
    if (!transcriptText || transcriptText.trim().length === 0) {
      return NextResponse.json(
        { error: 'No transcript available to generate feedback' },
        { status: 400 }
      );
    }

    const feedback = await geminiService.generateFeedback({
      jobTitle: interview.jobTitle,
      jobDescription: interview.jobDescription || '',
      questions: interview.questions || [],
      transcript: transcriptText,
      difficulty: interview.difficulty,
    });

    // Update interview with feedback
    const updatedInterview = await InterviewModel.update(interviewId, {
      status: 'completed',
      completedAt: new Date(),
      feedback: {
        ...feedback,
        generatedAt: new Date(),
      },
      updatedAt: new Date(),
    });

    logger.info('Interview completed and feedback generated', { interviewId });

    // Save feedback to user profile
    if (interview.userId) {
      try {
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
  } catch (error: any) {
    logger.error('Error completing interview', { error: error.message, stack: error.stack });
    return NextResponse.json(
      { 
        error: 'Failed to complete interview',
        message: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { InterviewModel } from '@/models/interview';
import { GeminiService } from '@/services/gemini';
import { logger } from '@/utils/logger';

/**
 * POST /api/interview/respond
 * Stores the user's answer and generates the next question.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { interviewId, question, answer, audioUrl } = body;

    if (!interviewId || !question || !answer) {
      return NextResponse.json(
        { error: 'interviewId, question, and answer are required' },
        { status: 400 }
      );
    }

    // Check if this is a demo interview
    const isDemo = interviewId.startsWith('demo_');
    
    let interview: any;
    if (isDemo) {
      // Demo interviews don't exist in database, create a temporary object
      // Use demoJobTitle from request body if provided
      interview = {
        id: interviewId,
        userId: null,
        jobTitle: body.demoJobTitle || 'Demo Interview',
        jobDescription: '',
        difficulty: 'medium',
        questions: [],
        transcript: [],
      };
    } else {
      interview = await InterviewModel.findById(interviewId);

      if (!interview) {
        return NextResponse.json(
          { error: 'Interview not found' },
          { status: 404 }
        );
      }
    }

    const gemini = new GeminiService();
    // Use demoJobTitle if provided (for demo interviews), otherwise use interview.jobTitle
    const jobTitle = body.demoJobTitle || interview.jobTitle;
    const nextQuestion = await gemini.generateFollowUpQuestion(
      question,
      answer,
      jobTitle
    );

    const updatedQuestions = [...(interview.questions || []), question];
    const updatedTranscript = [...(interview.transcript || []), answer];

    // Only update database if not demo
    if (!isDemo) {
      await InterviewModel.update(interviewId, {
        questions: updatedQuestions,
        transcript: updatedTranscript,
        currentQuestion: nextQuestion,
        audioUrl: audioUrl || interview.audioUrl,
        updatedAt: new Date(),
        status: 'in_progress',
      });
    }

    return NextResponse.json({
      success: true,
      nextQuestion,
      transcript: updatedTranscript,
      questions: updatedQuestions,
    });
  } catch (error: any) {
    logger.error('Error handling interview response', {
      error: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      {
        error: 'Failed to process response',
        message: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}



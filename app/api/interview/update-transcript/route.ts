import { NextRequest, NextResponse } from 'next/server';
import { InterviewModel } from '@/models/interview';
import { logger } from '@/utils/logger';

/**
 * POST /api/interview/update-transcript
 * Updates interview transcript with Q&A pairs
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { interviewId, question, answer } = body;

    if (!interviewId || !question || !answer) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if this is a demo interview
    const isDemo = interviewId.startsWith('demo_');
    if (isDemo) {
      return NextResponse.json({
        success: true,
        message: 'Demo interview - transcript not saved',
      });
    }

    // Fetch current interview
    const interview = await InterviewModel.findById(interviewId);

    if (!interview) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      );
    }

    // Update transcript
    const currentTranscript = interview.transcript || [];
    const updatedTranscript = [...currentTranscript, `Q: ${question}\nA: ${answer}`];
    
    // Update questions array if not already present
    const currentQuestions = interview.questions || [];
    const updatedQuestions = currentQuestions.includes(question)
      ? currentQuestions
      : [...currentQuestions, question];

    await InterviewModel.update(interviewId, {
      transcript: updatedTranscript,
      questions: updatedQuestions,
      updatedAt: new Date(),
    });

    logger.info('Interview transcript updated', { interviewId });

    return NextResponse.json({
      success: true,
      message: 'Transcript updated',
    });
  } catch (error: any) {
    logger.error('Error updating transcript', { error: error.message });
    return NextResponse.json(
      { error: 'Failed to update transcript', message: error.message },
      { status: 500 }
    );
  }
}


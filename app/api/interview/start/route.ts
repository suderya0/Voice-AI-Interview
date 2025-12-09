import { NextRequest, NextResponse } from 'next/server';
import { InterviewModel } from '@/models/interview';
import { GeminiService } from '@/services/gemini';
import { DeepgramService } from '@/services/deepgram';
import { logger } from '@/utils/logger';

/**
 * POST /api/interview/start
 * Starts an interview session and initializes WebSocket for real-time STT
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

    // Fetch interview from database
    const interview = await InterviewModel.findById(interviewId);

    if (!interview) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      );
    }

    // If already in progress, return current question without failing
    if (interview.status === 'in_progress') {
      return NextResponse.json({
        success: true,
        interviewId,
        question: interview.currentQuestion || '',
        websocketUrl: process.env.WEBSOCKET_URL || 'ws://localhost:3000/ws/interview',
        deepgramApiKey: process.env.DEEPGRAM_API_KEY,
        message: 'Interview already in progress',
      });
    }

    if (interview.status === 'completed') {
      return NextResponse.json(
        { error: 'Interview already completed' },
        { status: 400 }
      );
    }

    // Initialize Gemini for interview questions
    const geminiService = new GeminiService();
    const initialQuestion = await geminiService.generateInterviewQuestion(
      interview.jobTitle,
      interview.jobDescription,
      interview.difficulty
    );

    // Update interview status
    await InterviewModel.update(interviewId, {
      status: 'in_progress',
      startedAt: new Date(),
      currentQuestion: initialQuestion,
      updatedAt: new Date(),
    });

    logger.info('Interview started', { interviewId });

    // Return WebSocket connection details for real-time STT
    return NextResponse.json({
      success: true,
      interviewId,
      question: initialQuestion,
      websocketUrl: process.env.WEBSOCKET_URL || 'ws://localhost:3000/ws/interview',
      deepgramApiKey: process.env.DEEPGRAM_API_KEY, // In production, use server-side only
    });
  } catch (error: any) {
    logger.error('Error starting interview', { 
      error: error.message || error,
      stack: error.stack,
      details: error.response?.data || error.cause
    });
    return NextResponse.json(
      { 
        error: 'Failed to start interview',
        message: error.message || 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/interview/start
 * WebSocket handler for real-time speech-to-text
 * This would typically be handled by a separate WebSocket server
 * or Next.js API route with WebSocket support
 */
export async function GET(request: NextRequest) {
  // WebSocket upgrade would be handled here
  // For Next.js, you might need a separate WebSocket server
  return NextResponse.json({
    message: 'WebSocket endpoint - use POST /api/interview/start to initialize',
  });
}


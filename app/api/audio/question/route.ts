import { NextRequest, NextResponse } from 'next/server';
import { TTSService } from '@/services/tts';
import { logger } from '@/utils/logger';

/**
 * POST /api/audio/question
 * Generates TTS audio for a question and returns a data URL.
 */
export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'text is required' },
        { status: 400 }
      );
    }

    const tts = new TTSService();
    const audioUrl = await tts.generateQuestionAudio(text);

    return NextResponse.json({ success: true, audioUrl });
  } catch (error: any) {
    logger.error('Question TTS failed', {
      error: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      {
        error: 'Failed to generate question audio',
        message: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}



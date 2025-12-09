import { NextRequest, NextResponse } from 'next/server';
import { DeepgramService } from '@/services/deepgram';
import { logger } from '@/utils/logger';

/**
 * POST /api/stt/transcribe
 * Accepts an audio blob (FormData field: "audio") and returns transcript text.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audio = formData.get('audio');

    if (!audio || typeof audio === 'string') {
      return NextResponse.json(
        { error: 'Audio blob is required (FormData field: audio)' },
        { status: 400 }
      );
    }

    const arrayBuffer = await audio.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = (audio as File).type || 'audio/webm';

    const deepgram = new DeepgramService();
    const transcript = await deepgram.transcribeAudioBuffer(buffer, mimeType);

    return NextResponse.json({ success: true, transcript });
  } catch (error: any) {
    logger.error('STT transcription failed', {
      error: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      {
        error: 'Failed to transcribe audio',
        message: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}



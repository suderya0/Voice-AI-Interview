import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';
import { logger } from '@/utils/logger';

export class DeepgramService {
  private deepgram: any;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.DEEPGRAM_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('DEEPGRAM_API_KEY is not set in environment variables');
    }

    this.deepgram = createClient(this.apiKey);
  }

  /**
   * Create a live transcription connection for real-time STT
   */
  createLiveConnection(callbacks: {
    onTranscript?: (transcript: string, isFinal: boolean) => void;
    onError?: (error: Error) => void;
    onClose?: () => void;
  }) {
    try {
      const connection = this.deepgram.listen.live({
        model: 'nova-2',
        language: 'en-US',
        smart_format: true,
        interim_results: true,
        punctuate: true,
        diarize: false,
      });

      // Handle transcript events
      connection.on(LiveTranscriptionEvents.Transcript, (data: any) => {
        const transcript = data.channel?.alternatives?.[0]?.transcript || '';
        const isFinal = data.is_final || false;

        if (transcript && callbacks.onTranscript) {
          callbacks.onTranscript(transcript, isFinal);
        }
      });

      // Handle errors
      connection.on(LiveTranscriptionEvents.Error, (error: any) => {
        logger.error('Deepgram connection error', { error });
        if (callbacks.onError) {
          callbacks.onError(new Error(error.message || 'Deepgram error'));
        }
      });

      // Handle close
      connection.on(LiveTranscriptionEvents.Close, () => {
        logger.info('Deepgram connection closed');
        if (callbacks.onClose) {
          callbacks.onClose();
        }
      });

      return connection;
    } catch (error) {
      logger.error('Error creating Deepgram connection', { error });
      throw new Error('Failed to create Deepgram connection');
    }
  }

  /**
   * Transcribe audio file (for post-interview processing)
   */
  async transcribeFile(audioUrl: string): Promise<string> {
    try {
      const response = await this.deepgram.listen.prerecorded.transcribeFile(
        audioUrl,
        {
          model: 'nova-2',
          language: 'en-US',
          smart_format: true,
          punctuate: true,
        }
      );

      const transcript =
        response.result?.results?.channels?.[0]?.alternatives?.[0]?.transcript ||
        '';

      logger.info('Audio file transcribed', { audioUrl });
      return transcript;
    } catch (error) {
      logger.error('Error transcribing file', { error });
      throw new Error('Failed to transcribe audio file');
    }
  }

  /**
   * Transcribe a raw audio buffer (used for mic recordings)
   */
  async transcribeAudioBuffer(
    audioBuffer: Buffer,
    mimeType: string = 'audio/webm'
  ): Promise<string> {
    try {
      const response = await fetch('https://api.deepgram.com/v1/listen', {
        method: 'POST',
        headers: {
          Authorization: `Token ${this.apiKey}`,
          'Content-Type': mimeType,
        },
        // Cast to BodyInit to satisfy TypeScript in both Node and Edge runtimes
        body: audioBuffer as unknown as BodyInit,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Deepgram HTTP ${response.status}: ${errorText}`);
      }

      const data = (await response.json()) as any;
      const transcript =
        data?.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';

      logger.info('Audio buffer transcribed', {
        mimeType,
        hasTranscript: !!transcript,
      });

      return transcript;
    } catch (error: any) {
      logger.error('Error transcribing audio buffer', {
        error: error.message,
        stack: error.stack,
      });
      throw new Error('Failed to transcribe audio buffer');
    }
  }

  /**
   * Get API key for client-side usage (use with caution)
   * In production, prefer server-side only usage
   */
  getApiKey(): string {
    return this.apiKey;
  }
}


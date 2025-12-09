import axios from 'axios';
import { logger } from '@/utils/logger';

export class TTSService {
  private apiKey: string;
  private baseUrl: string;
  private languageCode: string;
  private ssmlGender: 'NEUTRAL' | 'MALE' | 'FEMALE' | 'SSML_VOICE_GENDER_UNSPECIFIED';
  private voiceName: string;

  constructor() {
    this.apiKey = process.env.GOOGLE_TTS_API_KEY || '';
    this.baseUrl = 'https://texttospeech.googleapis.com/v1';
    
    if (!this.apiKey) {
      throw new Error('GOOGLE_TTS_API_KEY is not set in environment variables');
    }

    this.languageCode = process.env.GOOGLE_TTS_LANGUAGE_CODE || 'en-US';
    this.ssmlGender = (process.env.GOOGLE_TTS_GENDER as any) || 'NEUTRAL';
    this.voiceName = process.env.GOOGLE_TTS_VOICE_NAME || ''; // e.g., 'en-US-Standard-B'
  }

  /**
   * Convert text to speech and return audio URL or buffer
   */
  async textToSpeech(
    text: string,
    options: {
      languageCode?: string;
      voiceName?: string;
      ssmlGender?: 'NEUTRAL' | 'MALE' | 'FEMALE' | 'SSML_VOICE_GENDER_UNSPECIFIED';
      audioEncoding?: 'MP3' | 'LINEAR16' | 'OGG_OPUS';
      speakingRate?: number;
      pitch?: number;
      returnUrl?: boolean;
    } = {}
  ): Promise<{ audioUrl?: string; audioBuffer?: Buffer }> {
    try {
      const requestBody: any = {
        input: { text },
        voice: {
          languageCode: options.languageCode || this.languageCode,
          ssmlGender: options.ssmlGender || this.ssmlGender,
        },
        audioConfig: {
          audioEncoding: options.audioEncoding || 'MP3',
          speakingRate: options.speakingRate || 1.0,
          pitch: options.pitch || 0.0,
        },
      };

      // Add voice name if specified
      if (options.voiceName || this.voiceName) {
        requestBody.voice.name = options.voiceName || this.voiceName;
      }

      const url = `${this.baseUrl}/text:synthesize?key=${this.apiKey}`;

      const response = await axios.post(url, requestBody, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.data.audioContent) {
        throw new Error('No audio content returned from Google TTS');
      }

      // Decode base64 audio content
      const audioBuffer = Buffer.from(response.data.audioContent, 'base64');

      logger.info('Text converted to speech', { 
        textLength: text.length,
        audioEncoding: requestBody.audioConfig.audioEncoding 
      });

      if (options.returnUrl) {
        // In production, upload to cloud storage and return URL
        // For now, return base64 data URL
        const base64 = audioBuffer.toString('base64');
        const mimeType = options.audioEncoding === 'MP3' 
          ? 'audio/mpeg' 
          : options.audioEncoding === 'OGG_OPUS'
          ? 'audio/ogg'
          : 'audio/wav';
        const audioUrl = `data:${mimeType};base64,${base64}`;
        return { audioUrl };
      }

      return { audioBuffer };
    } catch (error: any) {
      logger.error('Error converting text to speech', { 
        error: error.message,
        response: error.response?.data 
      });
      throw new Error('Failed to convert text to speech');
    }
  }

  /**
   * Generate speech for interview questions
   */
  async generateQuestionAudio(question: string): Promise<string> {
    try {
      const result = await this.textToSpeech(question, { returnUrl: true });
      return result.audioUrl || '';
    } catch (error) {
      logger.error('Error generating question audio', { error });
      throw new Error('Failed to generate question audio');
    }
  }

  /**
   * Get available voices for a language
   */
  async getVoices(languageCode?: string): Promise<any[]> {
    try {
      const url = `${this.baseUrl}/voices?key=${this.apiKey}`;
      const params: any = {};
      
      if (languageCode || this.languageCode) {
        params.languageCode = languageCode || this.languageCode;
      }

      const response = await axios.get(url, { params });
      return response.data.voices || [];
    } catch (error: any) {
      logger.error('Error fetching voices', { 
        error: error.message,
        response: error.response?.data 
      });
      throw new Error('Failed to fetch voices');
    }
  }
}


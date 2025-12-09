import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '@/utils/logger';

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    // Model name - set GEMINI_MODEL in .env.local if needed
    // Try: 'gemini-1.0-pro', 'gemini-1.5-pro', 'gemini-1.5-flash', or 'gemini-pro'
    const modelName = 'gemini-2.5-flash';
    this.model = this.genAI.getGenerativeModel({ model: modelName });
    logger.info('Gemini model initialized', { model: modelName });
  }

  /**
   * Generate an interview question based on job details
   */
  async generateInterviewQuestion(
    jobTitle: string,
    jobDescription: string,
    difficulty: string = 'medium'
  ): Promise<string> {
    try {
      const prompt = `You are an expert interviewer. Generate a single, clear interview question for a ${jobTitle} position.

Job Description: ${jobDescription}
Difficulty Level: ${difficulty}

Generate a question that:
1. Is relevant to the job role
2. Matches the difficulty level (${difficulty})
3. Is clear and concise
4. Allows the candidate to demonstrate their skills

Return only the question, no additional text.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const question = response.text().trim();

      logger.info('Interview question generated', { jobTitle, difficulty });
      return question;
    } catch (error: any) {
      logger.error('Error generating interview question', { 
        error: error.message || error,
        stack: error.stack,
        details: error.response?.data || error.cause
      });
      throw new Error(`Failed to generate interview question: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Generate follow-up questions based on previous answers
   */
  async generateFollowUpQuestion(
    previousQuestion: string,
    answer: string,
    jobTitle: string
  ): Promise<string> {
    try {
      const prompt = `Based on the following interview exchange, generate a relevant follow-up question.

Previous Question: ${previousQuestion}
Candidate's Answer: ${answer}
Job Title: ${jobTitle}

Generate a follow-up question that:
1. Builds on the candidate's answer
2. Goes deeper into the topic
3. Is relevant to the role

Return only the question, no additional text.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const question = response.text().trim();

      return question;
    } catch (error) {
      logger.error('Error generating follow-up question', { error });
      throw new Error('Failed to generate follow-up question');
    }
  }

  /**
   * Generate comprehensive interview feedback
   */
  async generateFeedback(params: {
    jobTitle: string;
    jobDescription: string;
    questions: string[];
    transcript: string | string[];
    difficulty: string;
  }): Promise<{
    overallScore: number;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    detailedAnalysis: string;
  }> {
    try {
      const transcriptText =
        typeof params.transcript === 'string'
          ? params.transcript
          : params.transcript.join('\n');

      const prompt = `You are an expert interview evaluator. Analyze the following interview and provide comprehensive feedback.

Job Title: ${params.jobTitle}
Job Description: ${params.jobDescription}
Difficulty Level: ${params.difficulty}

Questions Asked:
${params.questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

Interview Transcript:
${transcriptText}

Provide feedback in the following JSON format:
{
  "overallScore": <number 0-100>,
  "strengths": [<array of strengths>],
  "weaknesses": [<array of areas for improvement>],
  "recommendations": [<array of recommendations>],
  "detailedAnalysis": "<detailed text analysis>"
}

Return only valid JSON, no additional text.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const feedbackText = response.text().trim();

      // Parse JSON response (handle markdown code blocks if present)
      const jsonMatch = feedbackText.match(/\{[\s\S]*\}/);
      const feedback = jsonMatch
        ? JSON.parse(jsonMatch[0])
        : JSON.parse(feedbackText);

      logger.info('Feedback generated', { jobTitle: params.jobTitle });
      return feedback;
    } catch (error: any) {
      logger.error('Error generating feedback', { 
        error: error.message || error,
        stack: error.stack,
        details: error.response?.data || error.cause
      });
      throw new Error(`Failed to generate feedback: ${error.message || 'Unknown error'}`);
    }
  }
}


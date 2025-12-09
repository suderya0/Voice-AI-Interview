# AI Interview Platform - Backend

A Node.js/Next.js backend for an AI-powered interview platform with real-time speech-to-text, AI question generation, and automated feedback.

## Project Structure

```
.
├── app/
│   └── api/
│       └── interview/
│           ├── create.ts      # Create new interview
│           ├── start.ts       # Start interview + WebSocket setup
│           ├── feedback.ts    # Submit feedback
│           └── list.ts        # List user interviews
├── services/
│   ├── gemini.ts              # Gemini Pro API wrapper
│   ├── deepgram.ts            # Deepgram Nova streaming STT
│   └── tts.ts                 # Google Cloud TTS wrapper
├── models/
│   └── interview.ts           # Firestore/MongoDB schema
├── utils/
│   ├── logger.ts              # Logging utility
│   └── randomCover.ts         # Random cover image generator
├── package.json
└── tsconfig.json
```

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Create a `.env.local` file with:
   ```env
   # Required API Keys
   GEMINI_API_KEY=your_gemini_api_key
   DEEPGRAM_API_KEY=your_deepgram_api_key
   GOOGLE_TTS_API_KEY=your_google_tts_api_key
   
   # Optional Google TTS settings
   GOOGLE_TTS_LANGUAGE_CODE=en-US
   GOOGLE_TTS_GENDER=NEUTRAL
   GOOGLE_TTS_VOICE_NAME=en-US-Standard-B
   
   # Database Configuration
   DB_TYPE=firestore  # or 'mongodb'
   MONGODB_URI=mongodb://localhost:27017/ai-interview
   
   # Firebase Configuration (Client-side - NEXT_PUBLIC_ prefix required)
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   
   # Firebase Admin (Server-side - for Firestore Admin SDK)
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
   ```
   
   **⚠️ Important:** 
   - Variables starting with `NEXT_PUBLIC_` are exposed to the browser
   - Never commit `.env.local` to git
   - Keep all API keys secure

3. **Run development server:**
   ```bash
   npm run dev
   ```

## API Endpoints

### POST `/api/interview/create`
Creates a new interview session.

**Request Body:**
```json
{
  "userId": "user123",
  "jobTitle": "Software Engineer",
  "jobDescription": "Full-stack developer...",
  "difficulty": "medium",
  "duration": 30
}
```

### POST `/api/interview/start`
Starts an interview and initializes WebSocket for real-time STT.

**Request Body:**
```json
{
  "interviewId": "interview123"
}
```

### POST `/api/interview/feedback`
Submits interview transcript and generates AI feedback.

**Request Body:**
```json
{
  "interviewId": "interview123",
  "transcript": ["Q: ...", "A: ..."],
  "audioUrl": "https://..."
}
```

### GET `/api/interview/list?userId=user123&status=completed`
Lists all interviews for a user.

## Services

### GeminiService
- `generateInterviewQuestion()` - Generate interview questions
- `generateFollowUpQuestion()` - Generate follow-up questions
- `generateFeedback()` - Generate comprehensive feedback

### DeepgramService
- `createLiveConnection()` - Real-time STT WebSocket connection
- `transcribeFile()` - Transcribe audio files

### TTSService
- `textToSpeech()` - Convert text to speech
- `generateQuestionAudio()` - Generate audio for questions

## Database Models

The `InterviewModel` supports both Firestore and MongoDB. Set `DB_TYPE` environment variable to switch between them.

## Notes

- API keys should be stored securely in environment variables
- WebSocket implementation may require a separate server or Next.js API route with WebSocket support
- Database adapters need to be initialized with your actual database credentials
- All services include error handling and logging


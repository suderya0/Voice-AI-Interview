'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';

type Turn = { question: string; answer: string };

export default function InterviewSession() {
  const params = useParams();
  const router = useRouter();
  const interviewId = useMemo(() => (params.id as string) || '', [params]);

  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string>('Soruyu dinleyin ve cevaplayın.');
  const [liveText, setLiveText] = useState<string>('');
  const [aiCaption, setAiCaption] = useState<string>('');

  const deepgramKeyRef = useRef<string>('');
  const liveFinalRef = useRef<string>('');
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isStoppingRef = useRef<boolean>(false);
  const isStreamingRef = useRef<boolean>(false);
  const isStartingRef = useRef<boolean>(false); // Prevent multiple simultaneous starts

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const deepgramConnRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const initializeRef = useRef<boolean>(false);

  useEffect(() => {
    if (!interviewId) return;
    
    // Prevent double initialization in React strict mode
    if (initializeRef.current) return;
    initializeRef.current = true;
    
    initialize();
    
    // Cleanup function
    return () => {
      initializeRef.current = false;
      isStoppingRef.current = true; // Prevent any new operations
      
      // Stop any playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      
      // Clear timers
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      
      // Directly clean up resources without calling stopLiveAnswer
      // to avoid state update issues during unmount
      if (mediaRecorderRef.current) {
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {
          // Ignore errors during cleanup
        }
        mediaRecorderRef.current = null;
      }
      
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
        micStreamRef.current = null;
      }
      
      if (deepgramConnRef.current) {
        try {
          deepgramConnRef.current.finish();
        } catch (e) {
          // Ignore errors during cleanup
        }
        deepgramConnRef.current = null;
      }
      
      isStreamingRef.current = false;
      setStreaming(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewId]);

  const initialize = async () => {
    setLoading(true);
    setError(null);
    
    // Check if this is a demo interview
    const isDemo = interviewId.startsWith('demo_');
    
    // For demo interviews, get data from sessionStorage
    let demoData = null;
    if (isDemo) {
      const stored = sessionStorage.getItem('demoInterview');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.interviewId === interviewId) {
          demoData = {
            jobTitle: parsed.jobTitle,
            jobDescription: parsed.jobDescription,
            difficulty: parsed.difficulty,
          };
        }
      }
    }
    
    try {
      const response = await fetch('/api/interview/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          interviewId,
          ...(isDemo && demoData ? { demoData } : {})
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        // For demo interviews, don't fail - just use the question
        if (isDemo && data.question) {
          setCurrentQuestion(data.question);
          setAiCaption(data.question);
          if (data.deepgramApiKey) {
            deepgramKeyRef.current = data.deepgramApiKey;
          }
          setInfo('Görüşme başlıyor...');
          await playSequence(['Hello, the interview is starting.', data.question], () => {
            console.log('🎵 All audio finished, starting microphone...');
            setTimeout(() => {
              if (!isStartingRef.current && !isStreamingRef.current && !streaming) {
                startLiveAnswer();
              } else {
                console.log('⚠️ Skipping startLiveAnswer - already active');
              }
            }, 100);
          });
          setLoading(false);
          return;
        }
        // If interview already in progress, fall back to fetching interview and proceed
        throw new Error(data.error || data.message || 'Interview start failed');
      }

      setCurrentQuestion(data.question);
      setAiCaption(data.question);
      if (data.deepgramApiKey) {
        deepgramKeyRef.current = data.deepgramApiKey;
      }
      setInfo('Görüşme başlıyor...');
      // playSequence sonrası startLiveAnswer'ı çağırmıyoruz
      // Çünkü mikrofon sadece ses TAMAMEN bittikten sonra açılmalı
      // playSequence içinde son audio bittiğinde callback olarak startLiveAnswer çağrılacak
      await playSequence(['Hello, the interview is starting.', data.question], () => {
        console.log('🎵 All audio finished, starting microphone...');
        // Use setTimeout to ensure audio channel is fully released
        // Only start if not already starting/streaming
        setTimeout(() => {
          if (!isStartingRef.current && !isStreamingRef.current && !streaming) {
            startLiveAnswer();
          } else {
            console.log('⚠️ Skipping startLiveAnswer - already active');
          }
        }, 100);
      });
    } catch (err: any) {
      // For demo interviews, don't try to fetch from database
      if (isDemo) {
        setError('Demo interview initialization failed. Please try creating a new demo interview.');
        setLoading(false);
        return;
      }
      
      // Try to recover if already in progress (only for real interviews)
      const fallback = await fetch(`/api/interview/${interviewId}`);
      if (fallback.ok) {
        const data = await fallback.json();
        const q = data?.interview?.currentQuestion || '';
        setCurrentQuestion(q);
        setAiCaption(q);
        if (deepgramKeyRef.current) {
          // continue
        }
        setInfo('Görüşme devam ediyor...');
        if (q) {
          await playSequence(['Resuming the interview.', q], () => {
            console.log('🎵 Resume audio finished, starting microphone...');
            setTimeout(() => {
              // Force reset any stuck flags
              isStartingRef.current = false;
              isStoppingRef.current = false;
              if (!streaming && !isStreamingRef.current) {
                startLiveAnswer();
              } else {
                console.log('⚠️ Skipping startLiveAnswer - already active');
              }
            }, 300);
          });
        }
      } else {
        setError(err.message || 'Başlatma hatası');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Play a single audio text and return a promise that resolves when audio finishes
   * This ensures proper sequential playback without overlap
   */
  const playQuestionAudio = async (text: string): Promise<void> => {
    // Stop any currently playing audio to prevent overlap
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null; // Remove old handlers
      audioRef.current.onerror = null;
      audioRef.current = null;
    }
    
    setPlaying(true);
    
    // Create and return a promise that resolves when audio finishes
    return new Promise<void>(async (resolve, reject) => {
      let resolved = false;
      const resolveOnce = () => {
        if (resolved) return;
        resolved = true;
        setPlaying(false);
        audioRef.current = null;
        resolve();
      };
      
      const rejectOnce = (error: Error) => {
        if (resolved) return;
        resolved = true;
        setPlaying(false);
        if (audioRef.current) {
          audioRef.current = null;
        }
        setError(error.message || 'Ses çalma hatası');
        reject(error);
      };
      
      try {
        // Fetch audio URL
        const res = await fetch('/api/audio/question', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        });
        
        const data = await res.json();
        if (!res.ok || !data.audioUrl) {
          throw new Error(data.error || 'Ses üretilemedi');
        }
        
        // Create audio element
        const audio = new Audio(data.audioUrl);
        audioRef.current = audio;
        
        // Handle successful playback end
        audio.onended = () => {
          resolveOnce();
        };
        
        // Handle playback errors
        audio.onerror = (e) => {
          const error = new Error('Ses çalma hatası');
          rejectOnce(error);
        };
        
        // Start playback
        try {
          await audio.play();
        } catch (playError: any) {
          // Playback failed (e.g., autoplay blocked)
          rejectOnce(new Error(playError.message || 'Ses oynatılamadı'));
        }
      } catch (err: any) {
        // Network or other error
        rejectOnce(err instanceof Error ? err : new Error(err.message || 'Ses üretilemedi'));
      }
    });
  };

  /**
   * Play multiple audio texts in sequence, one after another
   * Only calls onComplete after ALL audio has finished + 500ms delay
   * Guarantees no overlap and single callback execution
   */
  const playSequence = async (texts: (string | number)[], onComplete?: () => void): Promise<void> => {
    // Filter out numbers (delays) and convert to strings
    const audioTexts = texts.filter((t): t is string => typeof t === 'string');
    
    if (audioTexts.length === 0) {
      // No audio to play, call onComplete immediately
      if (onComplete) {
        onComplete();
      }
      return;
    }
    
    let onCompleteCalled = false;
    const safeOnComplete = () => {
      if (onCompleteCalled) {
        console.log('⚠️ playSequence onComplete already called, ignoring duplicate');
        return;
      }
      onCompleteCalled = true;
      if (onComplete) {
        onComplete();
      }
    };
    
    try {
      // Play each audio sequentially - await ensures each finishes before next starts
      for (let i = 0; i < audioTexts.length; i++) {
        const text = audioTexts[i];
        
        console.log(`🎵 Playing audio ${i + 1}/${audioTexts.length}: ${text.substring(0, 50)}...`);
        
        // Wait for this audio to completely finish before moving to next
        await playQuestionAudio(text);
        
        // Small delay between audio clips for smooth transition (except after last)
        if (i < audioTexts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
      
      console.log('🎵 All audio finished playing');
      
      // All audio finished - wait 500ms for Chrome audio channel to release
      // Then call onComplete callback (microphone will start after this)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Call onComplete once, guaranteed
      safeOnComplete();
      
    } catch (error: any) {
      console.error('❌ Error in playSequence:', error);
      setError(error.message || 'Ses sırası hatası');
      
      // Even on error, call onComplete to allow recovery
      safeOnComplete();
    }
  };

  const startLiveAnswer = async () => {
    console.log('🎤 startLiveAnswer called');
    console.log('🎤 Current state:', {
      streaming,
      isStreamingRef: isStreamingRef.current,
      isStoppingRef: isStoppingRef.current,
      isStartingRef: isStartingRef.current,
      hasDeepgramKey: !!deepgramKeyRef.current,
      hasDeepgramConn: !!deepgramConnRef.current,
      hasMicStream: !!micStreamRef.current,
      hasMediaRecorder: !!mediaRecorderRef.current
    });
    
    // Prevent multiple simultaneous start attempts
    if (isStartingRef.current) {
      console.log('⚠️ Already starting, ignoring duplicate call');
      return;
    }
    
    // If already streaming, don't start again
    // Use ref as source of truth since state updates are async
    // Don't check streaming state - it may be stale
    if (isStreamingRef.current) {
      console.log('⚠️ Already streaming (ref check), cannot start');
      return;
    }
    
    // If state says streaming but ref says not, reset state
    if (streaming && !isStreamingRef.current) {
      console.log('⚠️ State says streaming but ref says not - resetting state');
      setStreaming(false);
    }
    
    // Clean up any leftover resources before starting
    if (deepgramConnRef.current) {
      console.log('🧹 Cleaning up leftover Deepgram connection before start');
      try {
        deepgramConnRef.current.finish();
      } catch (e) {
        console.warn('Error cleaning up Deepgram:', e);
      }
      deepgramConnRef.current = null;
    }
    
    if (micStreamRef.current) {
      console.log('🧹 Cleaning up leftover microphone stream before start');
      try {
        micStreamRef.current.getTracks().forEach(t => t.stop());
      } catch (e) {
        console.warn('Error cleaning up microphone:', e);
      }
      micStreamRef.current = null;
    }
    
    if (mediaRecorderRef.current) {
      console.log('🧹 Cleaning up leftover MediaRecorder before start');
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.warn('Error cleaning up MediaRecorder:', e);
      }
      mediaRecorderRef.current = null;
    }
    
    // If stopping flag is true but we're not actually streaming, reset it
    if (isStoppingRef.current && !streaming && !isStreamingRef.current) {
      console.log('🔄 Resetting stuck isStoppingRef flag');
      isStoppingRef.current = false;
    }
    
    // Set starting flag to prevent duplicate calls
    isStartingRef.current = true;
    
    setError(null);
    setLiveText('');
    liveFinalRef.current = '';
    isStoppingRef.current = false; // Explicitly reset
    isStreamingRef.current = false; // Explicitly reset
    
    // Wait a moment to ensure cleanup is complete
    await new Promise(resolve => setTimeout(resolve, 100));

    if (!deepgramKeyRef.current) {
      const errorMsg = 'Deepgram anahtarı alınamadı.';
      console.error('❌', errorMsg);
      setError(errorMsg);
      return;
    }

    try {
      console.log('🎤 Requesting microphone access...');
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('✅ Microphone access granted');
      micStreamRef.current = micStream;

      // Setup Deepgram live connection
      const dg = createClient(deepgramKeyRef.current);
      const connection = dg.listen.live({
        model: 'nova-2',
        language: 'en-US',
        smart_format: true,
        interim_results: true,
        punctuate: true,
        endpointing: 300, // Auto-endpoint after 300ms of silence
      });

      // Wait for connection to open - this is when we can start sending data
      let connectionOpenedRef = { value: false };
      
      connection.on(LiveTranscriptionEvents.Open, () => {
        console.log('✅ Deepgram connection opened - ready to receive audio');
        connectionOpenedRef.value = true;
        setInfo('Mikrofon aktif, konuşabilirsiniz...');
      });

      connection.on(LiveTranscriptionEvents.Transcript, (data: any) => {
        const transcript = data.channel?.alternatives?.[0]?.transcript || '';
        if (!transcript || transcript.trim().length === 0) return;
        
        const isFinal = data.is_final || false;
        const confidence = data.channel?.alternatives?.[0]?.confidence || 0;
        console.log('Transcript received:', { 
          transcript, 
          isFinal, 
          length: transcript.length,
          confidence 
        });
        
        if (isFinal) {
          // Final transcript - save it (use best confidence)
          const finalTranscript = transcript.trim();
          if (confidence > 0.5) { // Only use if confidence is reasonable
            liveFinalRef.current = finalTranscript;
          } else if (!liveFinalRef.current) {
            // Use even low confidence if we have nothing else
            liveFinalRef.current = finalTranscript;
          }
          setLiveText(finalTranscript);
          console.log('✅ Final transcript saved:', finalTranscript);
          
          // Always start timer for auto-submit when we have any final transcript
          if (finalTranscript.length > 3) {
            console.log('⏱️ Starting silence timer for final transcript...');
            resetSilenceTimer();
          }
        } else {
          // Interim transcript - show live and save as fallback
          const interimTranscript = transcript.trim();
          setLiveText(interimTranscript);
          // Save interim as fallback if we don't have a final yet
          if (!liveFinalRef.current && interimTranscript.length > 5) {
            liveFinalRef.current = interimTranscript;
          }
          console.log('📝 Interim transcript:', interimTranscript);
          
          // Start timer for interim transcripts too - if we have meaningful text
          if (interimTranscript.length > 5) {
            resetSilenceTimer();
          }
        }
      });

      connection.on(LiveTranscriptionEvents.Error, (err: any) => {
        console.error('❌ Deepgram error:', err);
        setError('Canlı STT hatası: ' + (err?.message || 'Bilinmeyen hata'));
        // Try to restart if error occurs
        setTimeout(() => {
          if (!streaming && !isStreamingRef.current && !isStoppingRef.current) {
            startLiveAnswer();
          }
        }, 2000);
      });

      connection.on(LiveTranscriptionEvents.Close, (event: any) => {
        console.log('🔌 Deepgram connection closed', event);
        // This can happen if:
        // 1. We called finish() intentionally (normal)
        // 2. Connection timed out due to no data
        // 3. Network error
        // 4. Server closed connection
        
        // If we're still supposed to be streaming, this is unexpected
        if (isStreamingRef.current || streaming) {
          console.warn('⚠️ Deepgram closed unexpectedly while streaming!');
          // Reset state so we can restart if needed
          isStreamingRef.current = false;
          setStreaming(false);
          isStoppingRef.current = false;
          isStartingRef.current = false;
        }
      });

      deepgramConnRef.current = connection;

      // Wait for connection to open (Open event fires)
      // We'll wait max 2 seconds for connection to open
      let openTimeout: NodeJS.Timeout;
      await new Promise<void>((resolve) => {
        if (connectionOpenedRef.value) {
          resolve();
          return;
        }
        
        // Check if connection opened
        const checkOpened = setInterval(() => {
          if (connectionOpenedRef.value) {
            clearInterval(checkOpened);
            if (openTimeout) clearTimeout(openTimeout);
            resolve();
          }
        }, 50);
        
        // Timeout after 2 seconds - start anyway
        openTimeout = setTimeout(() => {
          clearInterval(checkOpened);
          console.warn('⚠️ Deepgram Open event not received in 2s, starting anyway...');
          resolve();
        }, 2000);
      });

      console.log('📡 Deepgram ready, starting MediaRecorder...');

      // MediaRecorder MIME type - cross-browser compatibility
      // Chrome/Edge: audio/webm;codecs=opus ✓
      // Safari: doesn't support webm, will use default
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : undefined; // Browser will use default
      
      const recorder = new MediaRecorder(micStream, {
        mimeType: mimeType,
      });
      mediaRecorderRef.current = recorder;
      
      console.log('📹 MediaRecorder created with mimeType:', mimeType || 'default');

      recorder.ondataavailable = async (e) => {
        if (!e.data || e.data.size === 0) {
          console.log('⚠️ MediaRecorder: Empty data chunk received');
          return;
        }
        
        try {
          const buf = await e.data.arrayBuffer();
          if (deepgramConnRef.current && connection.getReadyState() === 1) {
            connection.send(buf);
            console.log(`📤 Sent ${buf.byteLength} bytes to Deepgram`);
          } else {
            console.warn('⚠️ Cannot send data - connection not open');
          }
        } catch (sendError) {
          console.error('❌ Error sending data to Deepgram:', sendError);
        }
      };

      // Start recorder immediately - it will send data every 300ms
      // Deepgram needs continuous data stream to keep connection alive
      recorder.start(300);
      console.log('🎙️ MediaRecorder started, sending data every 300ms');
      
      isStreamingRef.current = true;
      setStreaming(true);
      isStartingRef.current = false; // Clear starting flag - we're now streaming
      setInfo('Mikrofon aktif, konuşabilirsiniz...');
      
      console.log('✅ Microphone recording started successfully - waiting for speech...');
    } catch (err: any) {
      console.error('❌ Error starting microphone:', err);
      isStartingRef.current = false; // Clear starting flag on error
      setError('Canlı kayıt başlatılamadı: ' + (err.message || ''));
      stopLiveAnswer(false);
    }
  };

  const stopLiveAnswer = async (send: boolean = true) => {
    // Prevent multiple calls - check both state and ref
    if (isStoppingRef.current || (!streaming && !isStreamingRef.current)) {
      if (isStoppingRef.current) {
        console.log('⚠️ Already stopping, ignoring duplicate stopLiveAnswer call');
      } else {
        console.log('⚠️ Already stopped, ignoring stopLiveAnswer call');
      }
      return;
    }
    
    isStoppingRef.current = true;
    console.log('🛑 Stopping live answer, send:', send);
    
    // Clear silence timer first
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    
    // Get the best transcript we have BEFORE stopping
    const transcriptToSend = liveFinalRef.current || liveText || '';
    const trimmedTranscript = transcriptToSend.trim();
    console.log('📤 Transcript to send:', trimmedTranscript, 'send:', send, 'length:', trimmedTranscript.length);
    
    // Store in const for use in async closure
    const finalTranscriptToSend = trimmedTranscript;
    
    // Stop recording first (this will stop sending data to Deepgram)
    if (mediaRecorderRef.current) {
      try {
        mediaRecorderRef.current.stop();
        console.log('🛑 MediaRecorder stopped');
      } catch (e) {
        console.warn('Error stopping MediaRecorder:', e);
      }
      mediaRecorderRef.current = null;
    }
    
    // Wait a bit for any remaining data to be sent, then close Deepgram connection
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Close Deepgram connection properly
    if (deepgramConnRef.current) {
      try {
        const readyState = deepgramConnRef.current.getReadyState();
        console.log('🔌 Deepgram connection state before close:', readyState);
        
        if (readyState === 1) { // OPEN
          deepgramConnRef.current.finish();
          console.log('✅ Deepgram connection finished');
        } else {
          console.log('⚠️ Deepgram connection already closed or closing');
        }
      } catch (e) {
        console.warn('Error finishing Deepgram connection:', e);
      }
      deepgramConnRef.current = null;
    }
    
    // Stop microphone tracks completely
    if (micStreamRef.current) {
      try {
        micStreamRef.current.getTracks().forEach((track) => {
          track.stop();
          console.log('🛑 Microphone track stopped:', track.kind);
        });
        micStreamRef.current = null;
        console.log('✅ Microphone stream released');
      } catch (e) {
        console.warn('Error stopping microphone tracks:', e);
      }
    }
    
    // Wait a bit more to ensure all resources are released
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Reset all state flags - do refs first (synchronous)
    isStreamingRef.current = false;
    isStoppingRef.current = false;
    isStartingRef.current = false; // Reset starting flag when stopped
    
    // Then update state (asynchronous, but refs are already updated)
    setStreaming(false);
    
    console.log('✅ All resources cleaned up, state reset');
    
    // Process transcript after everything is stopped
    if (send && finalTranscriptToSend.length > 0) {
      console.log('✅ Sending answer to server:', finalTranscriptToSend);
      setInfo('Cevap analiz ediliyor...');
      sendAnswer(finalTranscriptToSend);
    } else if (send) {
      console.warn('⚠️ No transcript to send, restarting...');
      setInfo('Cevap alınamadı, tekrar dinleniyor...');
      // Restart listening if no answer was captured
      setTimeout(() => {
        if (!streaming && !isStreamingRef.current && !isStoppingRef.current) {
          startLiveAnswer();
        }
      }, 1000);
    }
  };

  const resetSilenceTimer = () => {
    // Clear existing timer
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    
    // Don't start timer if already stopping or not streaming
    if (isStoppingRef.current || !streaming || !isStreamingRef.current) {
      console.log('⏱️ Cannot start silence timer - not streaming or stopping');
      return;
    }
    
    console.log('⏱️ Starting 3-second silence timer...');
    
    // Start new timer
    silenceTimerRef.current = setTimeout(() => {
      console.log('⏱️ Silence timer fired - checking for transcript...');
      
      // Double-check we're still streaming and not stopping
      if (isStoppingRef.current || !streaming || !isStreamingRef.current) {
        console.log('⏱️ Silence timer cancelled - no longer streaming');
        return;
      }
      
      // Get the best transcript we have
      const transcriptToSubmit = liveFinalRef.current || liveText || '';
      const trimmedTranscript = transcriptToSubmit.trim();
      
      if (trimmedTranscript.length > 0) {
        console.log('⏱️ Silence detected (3s) - submitting transcript:', trimmedTranscript);
        console.log('📤 Transcript length:', trimmedTranscript.length);
        stopLiveAnswer(true);
      } else {
        console.log('⏱️ Silence detected but no transcript found, continuing to listen...');
        // Restart timer to keep listening
        resetSilenceTimer();
      }
    }, 3000); // Submit after 3s of silence after speech
  };

  const sendAnswer = async (answer: string) => {
    if (!currentQuestion || !answer || answer.trim().length === 0) {
      console.log('Cannot send answer - missing question or answer');
      setInfo('Cevap alınamadı, tekrar dinleniyor...');
      setTimeout(() => {
        if (!streaming && !isStreamingRef.current && !isStoppingRef.current) {
          startLiveAnswer();
        }
      }, 1000);
      return;
    }
    
    // Reset all flags before sending answer to ensure clean state for next question
    console.log('🔄 Resetting flags before sending answer');
    isStartingRef.current = false;
    isStoppingRef.current = false;
    isStreamingRef.current = false;
    // Also reset state to ensure it's in sync
    setStreaming(false);
    
    console.log('Sending answer:', answer, 'for question:', currentQuestion);
    setLoading(true);
    setError(null);
    setLiveText(''); // Clear live text
    liveFinalRef.current = ''; // Clear final ref
    
    // For demo interviews, get job title from sessionStorage
    let demoJobTitle = null;
    if (interviewId.startsWith('demo_')) {
      const stored = sessionStorage.getItem('demoInterview');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.interviewId === interviewId) {
          demoJobTitle = parsed.jobTitle;
        }
      }
    }
    
    try {
      const res = await fetch('/api/interview/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewId,
          question: currentQuestion,
          answer: answer.trim(),
          ...(demoJobTitle ? { demoJobTitle } : {}),
        }),
      });
      
      const data = await res.json();
      console.log('Response from server:', data);
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || data.message || 'Yanıt işlenemedi');
      }

      if (!data.nextQuestion) {
        throw new Error('Sonraki soru alınamadı');
      }

      // Save the turn
      const newTurn = { question: currentQuestion, answer: answer.trim() };
      setTurns((prev) => [...prev, newTurn]);
      
      // Update interview transcript in database (for real interviews only)
      if (!interviewId.startsWith('demo_')) {
        try {
          // Update transcript in background (don't wait for it)
          fetch('/api/interview/update-transcript', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              interviewId,
              question: currentQuestion,
              answer: answer.trim(),
            }),
          }).catch(err => console.error('Error updating transcript:', err));
        } catch (err) {
          console.error('Error updating transcript:', err);
        }
      }
      
      // Update to next question
      setCurrentQuestion(data.nextQuestion);
      setAiCaption(data.nextQuestion);
      setInfo('Yeni soru oynatılıyor...');
      
      // Play thank you message and next question
      // Mikrofon sadece tüm sesler bittikten sonra açılmalı
      console.log('🎵 Starting to play next question sequence...');
      console.log('🎵 Next question:', data.nextQuestion);
      
      await playSequence([
        'Thank you for your answer. Here is the next question.',
        data.nextQuestion
      ], () => {
        console.log('🎵 Question audio finished, starting microphone...');
        // Restart listening for next answer - only after all audio finishes
        // Wait longer to ensure all state is cleared and resources are released
        setTimeout(() => {
          console.log('🎤 Checking state before starting microphone...', {
            isStartingRef: isStartingRef.current,
            isStreamingRef: isStreamingRef.current,
            streaming,
            isStoppingRef: isStoppingRef.current,
            hasDeepgramConn: !!deepgramConnRef.current,
            hasMicStream: !!micStreamRef.current,
            hasMediaRecorder: !!mediaRecorderRef.current
          });
          
          // Force cleanup any remaining resources
          if (deepgramConnRef.current) {
            console.log('🔄 Cleaning up leftover Deepgram connection');
            try {
              deepgramConnRef.current.finish();
            } catch (e) {
              console.warn('Error cleaning up Deepgram:', e);
            }
            deepgramConnRef.current = null;
          }
          
          if (micStreamRef.current) {
            console.log('🔄 Cleaning up leftover microphone stream');
            try {
              micStreamRef.current.getTracks().forEach(t => t.stop());
            } catch (e) {
              console.warn('Error cleaning up microphone:', e);
            }
            micStreamRef.current = null;
          }
          
          if (mediaRecorderRef.current) {
            console.log('🔄 Cleaning up leftover MediaRecorder');
            try {
              mediaRecorderRef.current.stop();
            } catch (e) {
              console.warn('Error cleaning up MediaRecorder:', e);
            }
            mediaRecorderRef.current = null;
          }
          
          // Force reset ALL flags and state - use refs as source of truth
          isStartingRef.current = false;
          isStreamingRef.current = false;
          isStoppingRef.current = false;
          
          // Force state update - use functional update to ensure it happens
          setStreaming((prev) => {
            if (prev) {
              console.log('🔄 Resetting streaming state from', prev, 'to false');
            }
            return false;
          });
          
          // Wait a bit more to ensure cleanup is complete and state is updated
          setTimeout(() => {
            // Use refs as source of truth, not state (state updates are async)
            // Double-check and force reset if needed
            if (isStreamingRef.current) {
              console.log('🔄 Force resetting isStreamingRef in timeout');
              isStreamingRef.current = false;
            }
            if (isStoppingRef.current) {
              console.log('🔄 Force resetting isStoppingRef in timeout');
              isStoppingRef.current = false;
            }
            if (isStartingRef.current) {
              console.log('🔄 Force resetting isStartingRef in timeout');
              isStartingRef.current = false;
            }
            
            // Now check again with fresh refs
            if (!isStreamingRef.current && !isStoppingRef.current && !isStartingRef.current) {
              console.log('🎤 Starting microphone for next question...');
              startLiveAnswer();
            } else {
              console.log('⚠️ Skipping startLiveAnswer - refs indicate still active:', {
                isStreamingRef: isStreamingRef.current,
                isStoppingRef: isStoppingRef.current,
                isStartingRef: isStartingRef.current
              });
            }
          }, 300);
        }, 500); // Increased delay to ensure state is cleared
      });
      
      console.log('✅ sendAnswer completed successfully');
    } catch (err: any) {
      console.error('❌ Error in sendAnswer:', err);
      console.error('❌ Error stack:', err.stack);
      setError(err.message || 'Yanıt gönderme hatası');
      setInfo('Hata oluştu, tekrar dinleniyor...');
      
      // Even if there's an error, try to restart listening
      // This ensures the interview can continue even if one question fails
      setTimeout(() => {
        // Use refs as source of truth
        if (!isStreamingRef.current && !isStoppingRef.current && !isStartingRef.current) {
          console.log('🔄 Attempting to restart after error...');
          startLiveAnswer();
        }
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 white-700 py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href={`/interview/${interviewId}`}
            className="text-sm text-blue-600 hover:underline"
          >
            ← Interview Details
          </Link>
          <span className="text-sm text-gray-600">{info}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* User column */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-lg p-6 space-y-4 border border-white/40">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white font-semibold flex items-center justify-center">
                U
              </div>
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                Kullanıcı
              </span>
              {streaming && <span className="text-xs text-gray-500">Dinleniyor...</span>}
            </div>

            <div className="min-h-[60px] rounded-2xl bg-gray-50 border border-gray-200 p-4">
              <p className="text-xs text-gray-500 mb-1">Altyazı (canlı)</p>
              <p className="text-gray-800">
                {liveText || 'Konuşmaya başlayın...'}
              </p>
            </div>
            
            {/* Manual submit button */}
            {streaming && liveText && liveText.trim().length > 0 && (
              <button
                onClick={() => {
                  console.log('📤 Manual submit clicked');
                  const transcriptToSend = liveFinalRef.current || liveText;
                  if (transcriptToSend && transcriptToSend.trim().length > 0) {
                    stopLiveAnswer(true);
                  }
                }}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
              >
                Cevabı Gönder
              </button>
            )}
          </div>

          {/* AI column */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-lg p-6 space-y-4 border border-white/40">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-700 text-white font-semibold flex items-center justify-center">
                AI
              </div>
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-700">
                AI
              </span>
              {playing && <span className="text-xs text-gray-500">Ses oynatılıyor...</span>}
            </div>

            <div className="flex gap-3 flex-wrap">
              {/* Soruyu tekrar oynatmak isterseniz yukarıdaki buton kaldırıldı; otomatik akış */}
            </div>

            <div className="min-h-[60px] rounded-2xl bg-gray-50 border border-gray-200 p-4">
              <p className="text-xs text-gray-500 mb-1">Altyazı (AI)</p>
              <p className="text-gray-800">
                {aiCaption || currentQuestion || 'Soru yükleniyor...'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Diyalog Geçmişi
          </h3>
          {turns.length === 0 ? (
            <p className="text-sm text-gray-500">Henüz bir yanıt yok.</p>
          ) : (
            <div className="space-y-4">
              {turns.map((turn, idx) => (
                <div key={idx} className="border rounded-2xl p-4">
                  <p className="text-sm text-gray-500 mb-2">
                    Soru {idx + 1}
                  </p>
                  <p className="text-gray-800 font-medium mb-2">
                    {turn.question}
                  </p>
                  <p className="text-gray-700">
                    <span className="text-gray-500 font-semibold mr-2">
                      Cevap:
                    </span>
                    {turn.answer}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-4">
          <button
            onClick={async () => {
              // Check if this is a demo interview
              const isDemo = interviewId.startsWith('demo_');
              
              if (isDemo) {
                // For demo interviews, generate feedback and redirect to demo feedback page
                try {
                  setLoading(true);
                  setInfo('Görüşme tamamlanıyor ve geri bildirim oluşturuluyor...');
                  
                  // Stop any active recording
                  if (streaming || isStreamingRef.current) {
                    stopLiveAnswer(false);
                  }

                  // Get demo data from sessionStorage
                  const demoData = sessionStorage.getItem('demoInterview');
                  let jobTitle = 'Demo Interview';
                  let jobDescription = '';
                  let difficulty = 'medium';
                  
                  if (demoData) {
                    const parsed = JSON.parse(demoData);
                    if (parsed.interviewId === interviewId) {
                      jobTitle = parsed.jobTitle || jobTitle;
                      jobDescription = parsed.jobDescription || jobDescription;
                      difficulty = parsed.difficulty || difficulty;
                    }
                  }

                  // Collect all turns into transcript format
                  const transcript = turns.map(t => `Q: ${t.question}\nA: ${t.answer}`).join('\n\n');
                  const questions = turns.map(t => t.question);
                  
                  // Complete interview and generate feedback
                  const response = await fetch('/api/interview/complete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                      interviewId,
                      transcript,
                      questions,
                      jobTitle,
                      jobDescription,
                      difficulty,
                    }),
                  });

                  const data = await response.json();
                  
                  if (data.success && data.feedback) {
                    // Store feedback in sessionStorage for the demo feedback page
                    sessionStorage.setItem('demoFeedback', JSON.stringify({
                      feedback: data.feedback,
                      jobTitle,
                      jobDescription,
                      difficulty,
                    }));
                    
                    // Redirect to demo feedback page
                    router.push('/demo/feedback');
                  } else {
                    // If feedback generation failed, still redirect but show message
                    console.warn('Demo feedback generation failed:', data.error || data.message);
                    router.push('/demo/feedback');
                  }
                } catch (error) {
                  console.error('Error completing demo interview:', error);
                  // Still redirect to feedback page even on error
                  router.push('/demo/feedback');
                } finally {
                  setLoading(false);
                }
                return;
              }

              // For real interviews, complete and generate feedback
              try {
                setLoading(true);
                setInfo('Görüşme tamamlanıyor ve geri bildirim oluşturuluyor...');
                
                // Stop any active recording
                if (streaming || isStreamingRef.current) {
                  stopLiveAnswer(false);
                }

                // Collect all turns into transcript format
                const transcript = turns.map(t => `Q: ${t.question}\nA: ${t.answer}`).join('\n\n');
                
                // Complete interview and generate feedback
                const response = await fetch('/api/interview/complete', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ interviewId }),
                });

                const data = await response.json();
                
                if (data.success) {
                  // Redirect to interview detail page to show feedback
                  router.push(`/interview/${interviewId}`);
                } else {
                  alert('Görüşme tamamlanırken bir hata oluştu: ' + data.error);
                  router.push(`/interview/${interviewId}`);
                }
              } catch (error) {
                console.error('Error completing interview:', error);
                alert('Görüşme tamamlanırken bir hata oluştu');
                router.push(`/interview/${interviewId}`);
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Tamamlanıyor...' : 'Görüşmeyi Bitir ve Geri Bildirim Al'}
          </button>
        </div>
      </div>
    </div>
  );
}



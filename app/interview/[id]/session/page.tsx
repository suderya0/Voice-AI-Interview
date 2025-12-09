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

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const deepgramConnRef = useRef<any>(null);

  useEffect(() => {
    if (!interviewId) return;
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewId]);

  const initialize = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/interview/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interviewId }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        // If interview already in progress, fall back to fetching interview and proceed
        throw new Error(data.error || data.message || 'Interview start failed');
      }

      setCurrentQuestion(data.question);
      setAiCaption(data.question);
      if (data.deepgramApiKey) {
        deepgramKeyRef.current = data.deepgramApiKey;
      }
      setInfo('Görüşme başlıyor...');
      await playSequence(['Hello, the interview is starting.', data.question]);
      await startLiveAnswer();
    } catch (err: any) {
      // Try to recover if already in progress
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
          await playSequence(['Resuming the interview.', q]);
          await startLiveAnswer();
        }
      } else {
        setError(err.message || 'Başlatma hatası');
      }
    } finally {
      setLoading(false);
    }
  };

  const playQuestionAudio = async (text: string) => {
    setPlaying(true);
    try {
      const res = await fetch('/api/audio/question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok || !data.audioUrl) {
        throw new Error(data.error || 'Ses üretilemedi');
      }
      const audio = new Audio(data.audioUrl);
      audio.onended = () => setPlaying(false);
      await audio.play();
    } catch (err: any) {
      setPlaying(false);
      setError(err.message || 'Ses çalma hatası');
    }
  };

  const playSequence = async (texts: string[]) => {
    for (const t of texts) {
      await playQuestionAudio(t);
    }
  };

  const startLiveAnswer = async () => {
    if (streaming) return;
    setError(null);
    setLiveText('');
    liveFinalRef.current = '';

    if (!deepgramKeyRef.current) {
      setError('Deepgram anahtarı alınamadı.');
      return;
    }

    try {
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = micStream;

      // Setup Deepgram live connection
      const dg = createClient(deepgramKeyRef.current);
      const connection = dg.listen.live({
        model: 'nova-2',
        language: 'en-US',
        smart_format: true,
        interim_results: true,
        punctuate: true,
      });

      connection.on(LiveTranscriptionEvents.Transcript, (data: any) => {
        const transcript = data.channel?.alternatives?.[0]?.transcript || '';
        if (!transcript) return;
        
        const isFinal = data.is_final || false;
        
        if (isFinal) {
          // Final transcript - save it
          liveFinalRef.current = transcript;
          setLiveText(transcript);
          console.log('Final transcript received:', transcript);
          // Wait a bit then auto-submit
          setTimeout(() => {
            if (streaming) {
              stopLiveAnswer(true);
            }
          }, 1500);
        } else {
          // Interim transcript - show live
          setLiveText(transcript);
          resetSilenceTimer();
        }
      });

      connection.on(LiveTranscriptionEvents.Error, (err: any) => {
        setError(err?.message || 'Canlı STT hatası');
      });

      deepgramConnRef.current = connection;

      const recorder = new MediaRecorder(micStream, {
        mimeType: 'audio/webm;codecs=opus',
      });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = async (e) => {
        if (!e.data || e.data.size === 0) return;
        const buf = await e.data.arrayBuffer();
        connection.send(buf);
      };

      recorder.start(300);
      setStreaming(true);
      setInfo('Dinleniyor, konuşabilirsiniz...');
    } catch (err: any) {
      setError('Canlı kayıt başlatılamadı: ' + (err.message || ''));
      stopLiveAnswer(false);
    }
  };

  const stopLiveAnswer = (send: boolean = true) => {
    if (!streaming) return; // Already stopped
    
    // Clear silence timer
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
    micStreamRef.current?.getTracks().forEach((t) => t.stop());
    micStreamRef.current = null;
    if (deepgramConnRef.current) {
      deepgramConnRef.current.close();
      deepgramConnRef.current = null;
    }
    setStreaming(false);
    
    const transcriptToSend = liveFinalRef.current || liveText;
    console.log('Stopping live answer, transcript:', transcriptToSend, 'send:', send);
    
    if (send && transcriptToSend && transcriptToSend.trim().length > 0) {
      setInfo('Cevap analiz ediliyor...');
      sendAnswer(transcriptToSend.trim());
    } else if (send) {
      setInfo('Cevap alınamadı, tekrar dinleniyor...');
      // Restart listening if no answer was captured
      setTimeout(() => {
        if (!streaming) {
          startLiveAnswer();
        }
      }, 1000);
    }
  };

  const resetSilenceTimer = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      // If we have any transcript (final or interim), submit it
      const transcriptToSubmit = liveFinalRef.current || liveText;
      if (transcriptToSubmit && transcriptToSubmit.trim().length > 0 && streaming) {
        console.log('Silence detected, submitting:', transcriptToSubmit);
        stopLiveAnswer(true);
      }
    }, 3000); // stop after ~3s of silence after speech
  };

  const sendAnswer = async (answer: string) => {
    if (!currentQuestion || !answer || answer.trim().length === 0) {
      console.log('Cannot send answer - missing question or answer');
      setInfo('Cevap alınamadı, tekrar dinleniyor...');
      setTimeout(() => {
        if (!streaming) {
          startLiveAnswer();
        }
      }, 1000);
      return;
    }
    
    console.log('Sending answer:', answer, 'for question:', currentQuestion);
    setLoading(true);
    setError(null);
    setLiveText(''); // Clear live text
    liveFinalRef.current = ''; // Clear final ref
    
    try {
      const res = await fetch('/api/interview/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewId,
          question: currentQuestion,
          answer: answer.trim(),
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
      setTurns((prev) => [...prev, { question: currentQuestion, answer: answer.trim() }]);
      
      // Update to next question
      setCurrentQuestion(data.nextQuestion);
      setAiCaption(data.nextQuestion);
      setInfo('Yeni soru oynatılıyor...');
      
      // Play thank you message and next question
      await playQuestionAudio(`Thank you for your answer. Here is the next question.`);
      await playQuestionAudio(data.nextQuestion);
      
      // Restart listening for next answer
      await startLiveAnswer();
    } catch (err: any) {
      console.error('Error sending answer:', err);
      setError(err.message || 'Yanıt gönderme hatası');
      setInfo('Hata oluştu, tekrar dinleniyor...');
      // Try to restart listening after error
      setTimeout(() => {
        if (!streaming) {
          startLiveAnswer();
        }
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-10 px-4">
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
          <div className="bg-white rounded-3xl shadow-lg p-6 space-y-4">
            <div className="flex items-center gap-3">
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
          </div>

          {/* AI column */}
          <div className="bg-white rounded-3xl shadow-lg p-6 space-y-4">
            <div className="flex items-center gap-3">
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

        <div className="flex justify-end">
          <button
            onClick={() => router.push(`/interview/${interviewId}`)}
            className="text-sm text-gray-600 hover:underline"
          >
            Görüşmeyi Bitir
          </button>
        </div>
      </div>
    </div>
  );
}



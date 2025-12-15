'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Interview {
  id: string;
  userId: string;
  jobTitle: string;
  jobDescription: string;
  difficulty: string;
  duration: number;
  status: string;
  createdAt: string;
  currentQuestion?: string;
  feedback?: any;
}

export default function InterviewDetail() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params.id as string;
  
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (interviewId) {
      fetchInterview();
    }
  }, [interviewId]);

  const fetchInterview = async () => {
    try {
      setLoading(true);
      
      // Check if this is a demo interview
      const isDemo = interviewId.startsWith('demo_');
      
      if (isDemo) {
        // For demo interviews, check sessionStorage
        const demoData = sessionStorage.getItem('demoInterview');
        if (demoData) {
          const demo = JSON.parse(demoData);
          if (demo.interviewId === interviewId) {
            setInterview({
              id: demo.interviewId,
              userId: '',
              jobTitle: demo.jobTitle,
              jobDescription: demo.jobDescription,
              difficulty: demo.difficulty,
              duration: demo.duration,
              status: 'created',
              createdAt: new Date().toISOString(),
            });
            setLoading(false);
            return;
          }
        }
        // If demo data not found, redirect to session directly
        router.push(`/interview/${interviewId}/session`);
        return;
      }
      
      // For real interviews, fetch from API
      const response = await fetch(`/api/interview/${interviewId}`);
      
      if (!response.ok) {
        throw new Error('Interview not found');
      }
      
      const data = await response.json();
      const apiInterview = data.interview;

      // Normalize createdAt to an ISO string to avoid "Invalid Date" issues
      let normalizedCreatedAt = new Date().toISOString();
      const rawCreatedAt = apiInterview?.createdAt;

      if (typeof rawCreatedAt === 'string' || typeof rawCreatedAt === 'number') {
        const d = new Date(rawCreatedAt);
        if (!isNaN(d.getTime())) {
          normalizedCreatedAt = d.toISOString();
        }
      } else if (rawCreatedAt && typeof rawCreatedAt.toDate === 'function') {
        // Support Firestore Timestamp-like objects
        const d = rawCreatedAt.toDate();
        if (!isNaN(d.getTime())) {
          normalizedCreatedAt = d.toISOString();
        }
      }

      setInterview({
        ...apiInterview,
        createdAt: normalizedCreatedAt,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load interview');
    } finally {
      setLoading(false);
    }
  };

  const handleStartInterview = async () => {
    try {
      const response = await fetch('/api/interview/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ interviewId }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Redirect directly to the live session
        router.push(`/interview/${interviewId}/session`);
      } else {
        alert('Failed to start interview: ' + data.error);
      }
    } catch (error) {
      console.error('Error starting interview:', error);
      alert('An error occurred while starting the interview');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-400 to-white dark:from-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-100">Loading interview...</p>
        </div>
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-400 to-white dark:from-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center bg-white/95 dark:bg-slate-900/90 rounded-2xl shadow-xl p-8 max-w-md">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100 mb-4">Interview Not Found</h1>
          <p className="text-gray-600 dark:text-slate-300 mb-6">{error || 'The interview you are looking for does not exist.'}</p>
          <Link
            href="/interview/create"
            className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-xl hover:shadow-lg transition"
          >
            Create New Interview
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 to-white dark:from-slate-900 dark:to-slate-950 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
          <h1
            className="text-4xl font-bold mb-2 text-white font-concretica"
          >
            {interview.jobTitle} Interview
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-white/90">
            <span className={`px-3 py-1 rounded-full ${
              interview.status === 'created' ? 'bg-yellow-100 text-yellow-800' :
              interview.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
              interview.status === 'completed' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {interview.status.replace('_', ' ').toUpperCase()}
            </span>
            <span>Duration: {interview.duration} minutes</span>
            <span>Difficulty: {interview.difficulty}</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column - Interview Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Job Description */}
            {interview.jobDescription && (
              <div className="bg-white/95 dark:bg-slate-900/90 rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-slate-100 mb-4">Job Description</h2>
                <p className="text-gray-600 dark:text-slate-300 whitespace-pre-wrap">{interview.jobDescription}</p>
              </div>
            )}

            {/* Current Question */}
            {interview.currentQuestion && (
              <div className="bg-white/95 dark:bg-slate-900/90 rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-slate-100 mb-4">Current Question</h2>
                <p className="text-gray-700 dark:text-slate-100 text-lg">{interview.currentQuestion}</p>
              </div>
            )}

            {/* Feedback */}
            {interview.feedback && (
              <div className="bg-white/95 dark:bg-slate-900/90 rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-slate-100 mb-4">Feedback</h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-slate-300">Overall Score</span>
                      <span className="text-2xl font-bold text-cyan-500">{interview.feedback.overallScore}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-slate-800 rounded-full h-2">
                      <div
                        className="bg-cyan-500 h-2 rounded-full"
                        style={{ width: `${interview.feedback.overallScore}%` }}
                      ></div>
                    </div>
                  </div>

                  {interview.feedback.strengths && interview.feedback.strengths.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-green-700 mb-2">Strengths</h3>
                      <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-slate-200">
                        {interview.feedback.strengths.map((strength: string, idx: number) => (
                          <li key={idx}>{strength}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {interview.feedback.weaknesses && interview.feedback.weaknesses.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-red-700 mb-2">Areas for Improvement</h3>
                      <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-slate-200">
                        {interview.feedback.weaknesses.map((weakness: string, idx: number) => (
                          <li key={idx}>{weakness}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {interview.feedback.detailedAnalysis && (
                    <div>
                      <h3 className="font-semibold text-gray-700 dark:text-slate-100 mb-2">Detailed Analysis</h3>
                      <p className="text-gray-600 dark:text-slate-200 whitespace-pre-wrap">{interview.feedback.detailedAnalysis}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-6">
            <div className="bg-white/95 dark:bg-slate-900/90 rounded-2xl shadow-lg p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-slate-100 mb-4">Actions</h2>
              
              {interview.status === 'created' && (
                <button
                  onClick={handleStartInterview}
                  className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-medium mb-4"
                >
                  Start Interview
                </button>
              )}

              {interview.status === 'in_progress' && (
                <div className="text-sm text-gray-600 dark:text-slate-300">
                  Interview is in progress. Refresh to resume automatically.
                </div>
              )}

              <div className="space-y-2 text-sm text-gray-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-medium">{interview.status.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Created:</span>
                  <span className="font-medium">
                    {(() => {
                      const d = new Date(interview.createdAt);
                      return isNaN(d.getTime()) ? '-' : d.toLocaleDateString();
                    })()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { InterviewFeedback } from '@/models/user';
import { useToast, ToastContainer } from '@/components/Toast';

export default function FeedbackDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const interviewId = params.id as string;
  
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/sign-in');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user && interviewId) {
      fetchFeedback();
    }
  }, [user, interviewId]);

  const fetchFeedback = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/user/profile?userId=${user.uid}`);
      const data = await response.json();
      
      if (data.success && data.profile?.feedbacks) {
        const foundFeedback = data.profile.feedbacks.find(
          (f: InterviewFeedback) => f.interviewId === interviewId
        );
        
        if (foundFeedback) {
          setFeedback(foundFeedback);
        } else {
          // Try to fetch from interview if not in profile
          const interviewResponse = await fetch(`/api/interview/${interviewId}`);
          const interviewData = await interviewResponse.json();
          
          if (interviewData.success && interviewData.interview?.feedback) {
            setFeedback({
              interviewId,
              jobTitle: interviewData.interview.jobTitle,
              difficulty: interviewData.interview.difficulty,
              completedAt: interviewData.interview.completedAt || new Date(),
              feedback: interviewData.interview.feedback,
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFeedback = async () => {
    if (!user) return;
    
    if (!confirm('Are you sure you want to delete this feedback? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/user/feedback/${interviewId}?userId=${user.uid}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Feedback deleted successfully');
        // Redirect to feedbacks page after a short delay
        setTimeout(() => {
          router.push('/feedbacks');
        }, 1000);
      } else {
        toast.error(data.error || 'Failed to delete feedback');
      }
    } catch (error) {
      console.error('Error deleting feedback:', error);
      toast.error('An error occurred while deleting the feedback');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-400 to-white dark:from-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!feedback) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-400 to-white dark:from-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="bg-white/95 dark:bg-slate-900/90 rounded-3xl shadow-xl p-12 text-center max-w-md">
          <h2 className="text-2xl font-extralight text-gray-800 dark:text-slate-100 mb-4 font-concretica">
            Feedback Not Found
          </h2>
          <p className="text-gray-600 dark:text-slate-300 mb-8">
            The feedback you're looking for doesn't exist or you don't have access to it.
          </p>
          <Link href="/feedbacks">
            <button className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-full hover:shadow-lg transition-all duration-300 font-medium">
              Back to Feedbacks
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 to-white dark:from-slate-900 dark:to-slate-950">
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
      {/* Header */}
      <header className="bg-white/30 dark:bg-slate-900/80 backdrop-blur-sm border-b border-white/20 dark:border-slate-800/80">
        <div className="container mx-auto px-6 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <img 
                  src="/images/logo.png" 
                  alt="Icareerly Logo" 
                  width={48} 
                  height={48} 
                  className="cursor-pointer"
                />
              </Link>
              <span className="text-2xl font-extralight tracking-wide text-white font-concretica">
                icareerly
              </span>
            </div>
            <Link
              href="/feedbacks"
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-full text-sm transition-colors"
            >
              ← Back to Feedbacks
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-extralight text-white mb-2 font-concretica">
                Interview Feedback
              </h1>
              <h2 className="text-2xl font-light text-white/90 mb-4">
                {feedback.jobTitle}
              </h2>
              <div className="flex items-center gap-4 text-white/80 text-sm">
                <span className="px-3 py-1 bg-white/20 rounded-full">
                  {feedback.difficulty}
                </span>
                <span>
                  {new Date(feedback.completedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-6xl font-bold text-white mb-2">
                {feedback.feedback.overallScore}
              </div>
              <div className="text-white/80 text-lg">/100</div>
              <div className="w-32 h-2 bg-white/20 rounded-full mt-4">
                <div
                  className="h-2 bg-white rounded-full transition-all duration-500"
                  style={{ width: `${feedback.feedback.overallScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Content */}
        <div className="space-y-6">
          {/* Strengths */}
          {feedback.feedback.strengths && feedback.feedback.strengths.length > 0 && (
            <div className="bg-white/95 dark:bg-slate-900/90 rounded-3xl shadow-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-extralight text-gray-800 dark:text-slate-100 font-concretica">Strengths</h3>
              </div>
              <ul className="space-y-3">
                {feedback.feedback.strengths.map((strength, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-green-600 mt-1">✓</span>
                    <span className="text-gray-700 dark:text-slate-200 text-lg">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Areas for Improvement */}
          {feedback.feedback.weaknesses && feedback.feedback.weaknesses.length > 0 && (
            <div className="bg-white/95 dark:bg-slate-900/90 rounded-3xl shadow-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-extralight text-gray-800 dark:text-slate-100 font-concretica">Areas for Improvement</h3>
              </div>
              <ul className="space-y-3">
                {feedback.feedback.weaknesses.map((weakness, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-amber-600 mt-1">•</span>
                    <span className="text-gray-700 dark:text-slate-200 text-lg">{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {feedback.feedback.recommendations && feedback.feedback.recommendations.length > 0 && (
            <div className="bg-white/95 dark:bg-slate-900/90 rounded-3xl shadow-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-extralight text-gray-800 dark:text-slate-100 font-concretica">Recommendations</h3>
              </div>
              <ul className="space-y-3">
                {feedback.feedback.recommendations.map((recommendation, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-blue-600 mt-1">→</span>
                    <span className="text-gray-700 dark:text-slate-200 text-lg">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Detailed Analysis */}
          {feedback.feedback.detailedAnalysis && (
            <div className="bg-white/95 dark:bg-slate-900/90 rounded-3xl shadow-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-extralight text-gray-800 dark:text-slate-100 font-concretica">Detailed Analysis</h3>
              </div>
              <div className="prose max-w-none">
                <p className="text-gray-700 dark:text-slate-200 text-lg leading-relaxed whitespace-pre-wrap">
                  {feedback.feedback.detailedAnalysis}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Link href="/feedbacks" className="flex-1">
              <button className="w-full px-6 py-3 border-2 border-white text-white rounded-full hover:bg-white/20 transition-all duration-300 font-medium">
                Back to All Feedbacks
              </button>
            </Link>
            <button
              onClick={handleDeleteFeedback}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all duration-300 font-medium"
            >
              Delete Feedback
            </button>
            <Link href="/interview/create" className="flex-1">
              <button className="w-full px-6 py-3 bg-white text-cyan-600 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-medium">
                Create New Interview
              </button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}


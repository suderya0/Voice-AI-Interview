'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfile, InterviewFeedback } from '@/models/user';
import { useToast, ToastContainer } from '@/components/Toast';

export default function FeedbacksPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/sign-in');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/user/profile?userId=${user.uid}`);
      const data = await response.json();
      
      if (data.success) {
        setProfile(data.profile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFeedback = async (interviewId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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
        // Refresh profile to update the list
        await fetchProfile();
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
      <div className="min-h-screen bg-gradient-to-br from-cyan-400 to-white flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const feedbacks = profile?.feedbacks || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 to-white">
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
      {/* Header */}
      <header className="bg-white/30 backdrop-blur-sm border-b border-white/20">
        <div className="container mx-auto px-6 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <img 
                  src="/images/logo.png" 
                  alt="Intervai Logo" 
                  width={48} 
                  height={48} 
                  className="cursor-pointer"
                />
              </Link>
              <span className="text-2xl font-extralight tracking-wide text-white font-concretica">
                intervai
              </span>
            </div>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-full text-sm transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-extralight text-white mb-2 font-concretica">
            Your Interview Feedbacks
          </h1>
          <p className="text-white/90 text-lg">
            Review detailed feedback from all your completed interviews
          </p>
        </div>

        {feedbacks.length === 0 ? (
          <div className="bg-white/95 rounded-3xl shadow-xl p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-extralight text-gray-800 mb-4 font-concretica">
              No Feedbacks Yet
            </h2>
            <p className="text-gray-600 mb-8">
              Complete an interview to receive detailed feedback on your performance.
            </p>
            <Link href="/interview/create">
              <button className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-medium">
                Create Your First Interview
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {feedbacks.map((feedback, idx) => (
              <div key={idx} className="relative">
                <Link href={`/feedbacks/${feedback.interviewId}`}>
                  <div className="bg-white/95 rounded-3xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-2xl font-extralight text-gray-800 mb-2 font-concretica">
                          {feedback.jobTitle}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="px-3 py-1 bg-gray-100 rounded-full">
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
                        <div className="text-4xl font-bold text-cyan-600">
                          {feedback.feedback.overallScore}
                        </div>
                        <div className="text-sm text-gray-600">/100</div>
                      </div>
                    </div>

                  {/* Quick Preview */}
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    {feedback.feedback.strengths && feedback.feedback.strengths.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-green-700 mb-2">Top Strengths</p>
                        <ul className="text-sm text-gray-700 space-y-1">
                          {feedback.feedback.strengths.slice(0, 2).map((strength, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <span className="text-green-600 mt-0.5">•</span>
                              <span>{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {feedback.feedback.weaknesses && feedback.feedback.weaknesses.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-amber-700 mb-2">Areas to Improve</p>
                        <ul className="text-sm text-gray-700 space-y-1">
                          {feedback.feedback.weaknesses.slice(0, 2).map((weakness, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <span className="text-amber-600 mt-0.5">•</span>
                              <span>{weakness}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500 text-right">
                        Click to view full details →
                      </p>
                    </div>
                  </div>
                </Link>
                <button
                  onClick={(e) => handleDeleteFeedback(feedback.interviewId, e)}
                  className="absolute top-4 right-4 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors shadow-lg z-10"
                  title="Delete feedback"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}


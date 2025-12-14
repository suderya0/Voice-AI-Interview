'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfile, InterviewFeedback } from '@/models/user';
import UserMenu from '@/components/UserMenu';

export default function Dashboard() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only redirect if auth is loaded and user is not authenticated
    // Don't redirect during sign out process
    if (!authLoading && !user && window.location.pathname === '/dashboard') {
      router.push('/');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 to-white">
      {/* Header */}
      <header className="bg-white/30 backdrop-blur-sm border-b border-white/20">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <nav className="flex items-center justify-between">
            {/* Logo and Brand Name */}
            <div className="flex items-center gap-2 sm:gap-3">
              <img 
                src="/images/logo.png" 
                alt="Intervai Logo" 
                width={32}
                height={32}
                className="w-8 h-8 sm:w-12 sm:h-12"
              />
              <span className="text-xl sm:text-2xl font-extralight tracking-wide text-white font-concretica">
                intervai
              </span>
            </div>

            {/* User Menu */}
            <UserMenu user={user} profile={profile} />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8 md:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extralight text-white mb-1 sm:mb-2 font-concretica">
            Welcome back, {profile?.name || user.email?.split('@')[0]}!
          </h1>
          <p className="text-white/90 text-sm sm:text-base md:text-lg">
            Ready to practice your interview skills?
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8 md:mb-12">
          {/* Create Interview Card */}
          <Link href="/interview/create">
            <div className="bg-white/95 rounded-2xl sm:rounded-3xl shadow-xl p-5 sm:p-6 md:p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer">
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-extralight text-gray-800 font-concretica">Create Interview</h2>
                  <p className="text-gray-600 text-xs sm:text-sm">Start a new practice session</p>
                </div>
              </div>
              <p className="text-gray-700 mt-3 sm:mt-4 text-sm sm:text-base">
                Create a customized interview session tailored to your job role and difficulty level.
              </p>
            </div>
          </Link>

          {/* Profile Stats Card */}
          <div className="bg-white/95 rounded-2xl sm:rounded-3xl shadow-xl p-5 sm:p-6 md:p-8">
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-extralight text-gray-800 font-concretica">Your Stats</h2>
                <p className="text-gray-600 text-xs sm:text-sm">Interview performance</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6">
              <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                <p className="text-2xl sm:text-3xl font-bold text-cyan-600">{profile?.feedbacks?.length || 0}</p>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Interviews</p>
              </div>
              <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                <p className="text-2xl sm:text-3xl font-bold text-purple-600">
                  {profile?.feedbacks && profile.feedbacks.length > 0
                    ? Math.round(
                        profile.feedbacks.reduce((sum, f) => sum + f.feedback.overallScore, 0) /
                          profile.feedbacks.length
                      )
                    : 0}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Avg Score</p>
              </div>
            </div>
          </div>
        </div>

        {/* Feedbacks */}
        <div className="max-w-4xl">
          <div className="bg-white/95 rounded-2xl sm:rounded-3xl shadow-xl p-5 sm:p-6 md:p-8">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-extralight text-gray-800 font-concretica">Your Feedbacks</h2>
              {profile?.feedbacks && profile.feedbacks.length > 0 && (
                <Link href="/feedbacks">
                  <button className="text-xs sm:text-sm text-cyan-600 hover:text-cyan-700 font-medium transition-colors">
                    View All →
                  </button>
                </Link>
              )}
            </div>
            {loading ? (
              <div className="text-gray-500 text-center py-8">Loading...</div>
            ) : !profile?.feedbacks || profile.feedbacks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No feedbacks yet</p>
                <p className="text-sm text-gray-600 mb-6">
                  Complete an interview to receive detailed feedback on your performance.
                </p>
                <Link href="/interview/create">
                  <button className="px-6 py-2 bg-cyan-600 text-white rounded-full hover:bg-cyan-700 transition-colors text-sm font-medium">
                    Create Interview
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {profile.feedbacks.slice(0, 5).map((feedback, idx) => (
                  <Link key={idx} href={`/feedbacks/${feedback.interviewId}`}>
                    <div className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-800">{feedback.jobTitle}</h3>
                          <p className="text-xs text-gray-600 mt-1">
                            {new Date(feedback.completedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-cyan-600">
                            {feedback.feedback.overallScore}
                          </p>
                          <p className="text-xs text-gray-600">/100</p>
                        </div>
                      </div>
                      
                      {feedback.feedback.strengths && feedback.feedback.strengths.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-semibold text-green-700 mb-1">Strengths</p>
                          <ul className="text-xs text-gray-700 space-y-1">
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
                          <p className="text-xs font-semibold text-amber-700 mb-1">Areas to Improve</p>
                          <ul className="text-xs text-gray-700 space-y-1">
                            {feedback.feedback.weaknesses.slice(0, 2).map((weakness, i) => (
                              <li key={i} className="flex items-start gap-1">
                                <span className="text-amber-600 mt-0.5">•</span>
                                <span>{weakness}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-cyan-600 text-right">Click to view details →</p>
                      </div>
                    </div>
                  </Link>
                ))}
                {profile.feedbacks.length > 5 && (
                  <div className="text-center pt-4">
                    <Link href="/feedbacks">
                      <button className="text-sm text-cyan-600 hover:text-cyan-700 font-medium">
                        View {profile.feedbacks.length - 5} more feedbacks →
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}


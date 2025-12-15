'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface DemoFeedback {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  detailedAnalysis: string;
}

export default function DemoFeedbackPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [feedback, setFeedback] = useState<DemoFeedback | null>(null);
  const [jobTitle, setJobTitle] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If user is already signed in, redirect to dashboard
    if (!authLoading && user) {
      router.push('/dashboard');
      return;
    }

    // Get feedback from sessionStorage
    const feedbackData = sessionStorage.getItem('demoFeedback');
    if (feedbackData) {
      try {
        const parsed = JSON.parse(feedbackData);
        if (parsed.feedback) {
          setFeedback(parsed.feedback);
          setJobTitle(parsed.jobTitle || 'Demo Interview');
        } else {
          console.error('No feedback found in demo data');
        }
      } catch (error) {
        console.error('Error parsing demo feedback:', error);
      }
    }
    setLoading(false);
  }, [authLoading, user, router]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-400 to-white dark:from-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading your feedback...</p>
        </div>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-400 to-white dark:from-slate-900 dark:to-slate-950 flex items-center justify-center px-4">
        <div className="text-center bg-white/95 dark:bg-slate-900/90 rounded-2xl shadow-xl p-6 sm:p-8 max-w-md w-full">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-slate-100 mb-4">No Feedback Found</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-slate-300 mb-6">We couldn't find your demo feedback. Please try the demonstration again.</p>
          <Link
            href="/interview/create?demo=true"
            className="inline-block w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-xl hover:shadow-lg transition"
          >
            Try Demonstration Again
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 to-white dark:from-slate-900 dark:to-slate-950">
      {/* Header */}
      <header className="bg-white/30 dark:bg-slate-900/80 backdrop-blur-sm border-b border-white/20 dark:border-slate-800/80">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <img 
                src="/images/logo.png" 
                alt="Icareerly Logo" 
                width={40}
                height={40}
                className="w-8 h-8 sm:w-12 sm:h-12"
              />
              <span className="text-xl sm:text-2xl font-extralight tracking-wide text-white font-concretica">
                icareerly
              </span>
            </div>
            <Link
              href="/auth/sign-in"
              className="px-4 py-1.5 sm:px-6 sm:py-2 bg-white rounded-full text-xs sm:text-sm font-medium text-cyan-600 shadow-md hover:shadow-lg transition-all duration-200"
            >
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12 max-w-4xl">
        {/* Sign Up Prompt Banner */}
        <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 mb-6 sm:mb-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1 w-full md:w-auto">
              <h2 className="text-2xl sm:text-3xl font-extralight mb-2 sm:mb-3 font-concretica">
                Save Your Progress!
              </h2>
              <p className="text-white/90 text-base sm:text-lg mb-4">
                Sign up now to save your feedbacks and track your interview performance over time. 
                Build your interview history and watch your skills improve.
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mt-4">
                <Link
                  href="/auth/sign-up"
                  className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-white text-cyan-600 rounded-full font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-center"
                >
                  Sign Up Free
                </Link>
                <Link
                  href="/auth/sign-in"
                  className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-white/20 text-white border-2 border-white rounded-full font-medium hover:bg-white/30 transition-all duration-300 text-center"
                >
                  Sign In
                </Link>
              </div>
            </div>
            <div className="flex-shrink-0 hidden md:flex">
              <div className="w-20 h-20 lg:w-24 lg:h-24 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 lg:w-12 lg:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Content */}
        <div className="bg-white/95 dark:bg-slate-900/90 rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 mb-6 sm:mb-8">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extralight text-gray-800 dark:text-slate-100 mb-2 font-concretica">
              Your Interview Feedback
            </h1>
            <h2 className="text-xl sm:text-2xl font-light text-gray-600 dark:text-slate-300 mb-3 sm:mb-4">
              {jobTitle}
            </h2>
            <div className="flex items-center gap-4 text-gray-600 dark:text-slate-300 text-xs sm:text-sm">
              <span className="px-3 py-1 bg-gray-100 dark:bg-slate-800 rounded-full">
                Demo Interview
              </span>
            </div>
          </div>

          {/* Score Section */}
          <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-slate-800 dark:to-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div className="w-full sm:w-auto">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-slate-300 mb-1">Overall Score</p>
                <p className="text-4xl sm:text-5xl font-bold text-cyan-600">{feedback.overallScore}</p>
              </div>
              <div className="w-full sm:w-auto sm:text-right">
                <p className="text-xl sm:text-2xl font-light text-gray-600 dark:text-slate-300 mb-2 sm:mb-0">/100</p>
                <div className="w-full sm:w-48 h-3 bg-white/80 dark:bg-slate-700 rounded-full mt-2 sm:mt-4">
                  <div
                    className="h-3 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-full transition-all duration-500"
                    style={{ width: `${feedback.overallScore}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Strengths */}
          {feedback.strengths && feedback.strengths.length > 0 && (
            <div className="mb-6 sm:mb-8">
              <h3 className="text-xl sm:text-2xl font-extralight text-gray-800 dark:text-slate-100 mb-3 sm:mb-4 font-concretica flex items-center gap-2 sm:gap-3">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Strengths
              </h3>
              <ul className="space-y-2 sm:space-y-3">
                {feedback.strengths.map((strength, idx) => (
                  <li key={idx} className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg sm:rounded-xl border border-green-200 dark:border-green-500/40">
                    <span className="text-green-600 font-bold mt-0.5 flex-shrink-0">•</span>
                    <span className="text-sm sm:text-base text-gray-700 dark:text-slate-200 flex-1">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Areas for Improvement */}
          {feedback.weaknesses && feedback.weaknesses.length > 0 && (
            <div className="mb-6 sm:mb-8">
              <h3 className="text-xl sm:text-2xl font-extralight text-gray-800 dark:text-slate-100 mb-3 sm:mb-4 font-concretica flex items-center gap-2 sm:gap-3">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Areas for Improvement
              </h3>
              <ul className="space-y-2 sm:space-y-3">
                {feedback.weaknesses.map((weakness, idx) => (
                  <li key={idx} className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg sm:rounded-xl border border-amber-200 dark:border-amber-500/40">
                    <span className="text-amber-600 font-bold mt-0.5 flex-shrink-0">•</span>
                    <span className="text-sm sm:text-base text-gray-700 dark:text-slate-200 flex-1">{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {feedback.recommendations && feedback.recommendations.length > 0 && (
            <div className="mb-6 sm:mb-8">
              <h3 className="text-xl sm:text-2xl font-extralight text-gray-800 dark:text-slate-100 mb-3 sm:mb-4 font-concretica flex items-center gap-2 sm:gap-3">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Recommendations
              </h3>
              <ul className="space-y-2 sm:space-y-3">
                {feedback.recommendations.map((recommendation, idx) => (
                  <li key={idx} className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg sm:rounded-xl border border-blue-200 dark:border-blue-500/40">
                    <span className="text-blue-600 font-bold mt-0.5 flex-shrink-0">•</span>
                    <span className="text-sm sm:text-base text-gray-700 dark:text-slate-200 flex-1">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Detailed Analysis */}
          {feedback.detailedAnalysis && (
            <div className="mb-6 sm:mb-8">
              <h3 className="text-xl sm:text-2xl font-extralight text-gray-800 dark:text-slate-100 mb-3 sm:mb-4 font-concretica">
                Detailed Analysis
              </h3>
              <div className="bg-gray-50 dark:bg-slate-800 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-slate-700">
                <p className="text-sm sm:text-base text-gray-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {feedback.detailedAnalysis}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Call to Action Section */}
        <div className="bg-white/95 dark:bg-slate-900/90 rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-extralight text-gray-800 dark:text-slate-100 mb-3 sm:mb-4 font-concretica">
            Ready to Save Your Progress?
          </h2>
          <p className="text-gray-600 dark:text-slate-300 mb-6 sm:mb-8 text-base sm:text-lg">
            Create an account to save all your interview feedbacks, track your progress, and improve your skills over time.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link
              href="/auth/sign-up"
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-full font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Sign Up Free
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-full font-medium transition-all duration-300 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>

      {/* Footer - match homepage styling in light & dark mode */}
      <footer className="bg-white/30 dark:bg-transparent backdrop-blur-sm border-t border-white/20 dark:border-slate-800/60 py-6 sm:py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6">
            <div className="col-span-2 sm:col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <img 
                  src="/images/logo.png" 
                  alt="Icareerly Logo" 
                  width={28}
                  height={28}
                  className="w-7 h-7 sm:w-8 sm:h-8"
                />
                <span className="text-lg sm:text-xl font-extralight tracking-wide text-gray-800 dark:text-slate-100 font-concretica">
                  icareerly  
                </span>
              </div>
              <p className="text-gray-600 dark:text-slate-300 text-xs sm:text-sm">
                Stress-free simulations. Real-world impact.
              </p>
            </div>

            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-slate-100 mb-2 sm:mb-3 font-concretica">Platform</h4>
              <ul className="space-y-1.5 sm:space-y-2">
                <li>
                  <a href="/interview/create" className="text-gray-600 dark:text-slate-300 hover:text-cyan-600 text-xs sm:text-sm transition-colors">
                    Create Interview
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 dark:text-slate-300 hover:text-cyan-600 text-xs sm:text-sm transition-colors">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 dark:text-slate-300 hover:text-cyan-600 text-xs sm:text-sm transition-colors">
                    Features
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-slate-100 mb-2 sm:mb-3 font-concretica">Support</h4>
              <ul className="space-y-1.5 sm:space-y-2">
                <li>
                  <a href="/faq" className="text-gray-600 dark:text-slate-300 hover:text-cyan-600 text-xs sm:text-sm transition-colors">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 dark:text-slate-300 hover:text-cyan-600 text-xs sm:text-sm transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 dark:text-slate-300 hover:text-cyan-600 text-xs sm:text-sm transition-colors">
                    Help Center
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-slate-100 mb-2 sm:mb-3 font-concretica">Account</h4>
              <ul className="space-y-1.5 sm:space-y-2">
                <li>
                  <a href="/auth/sign-in" className="text-gray-600 dark:text-slate-300 hover:text-cyan-600 text-xs sm:text-sm transition-colors">
                    Sign In
                  </a>
                </li>
                <li>
                  <a href="/auth/sign-up" className="text-gray-600 dark:text-slate-300 hover:text-cyan-600 text-xs sm:text-sm transition-colors">
                    Sign Up
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-4 sm:pt-6 border-t border-white/20 dark:border-slate-800/60 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <p className="text-gray-600 dark:text-slate-400 text-xs sm:text-sm text-center sm:text-left">
              © {new Date().getFullYear()} icareerly. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-4 sm:gap-6 justify-center sm:justify-end">
              <a href="#" className="text-gray-600 dark:text-slate-300 hover:text-cyan-600 text-xs sm:text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-600 dark:text-slate-300 hover:text-cyan-600 text-xs sm:text-sm transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

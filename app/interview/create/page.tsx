'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast, ToastContainer } from '@/components/Toast';

export default function CreateInterview() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const isDemo = searchParams.get('demo') === 'true';
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    jobTitle: '',
    jobDescription: '',
    difficulty: 'Beginner',
    duration: 30,
  });
  const toast = useToast();

  useEffect(() => {
    // If not demo and user is not logged in, redirect to sign in
    if (!isDemo && !authLoading && !user) {
      router.push('/auth/sign-in?redirect=/interview/create');
    }
  }, [isDemo, authLoading, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const requestBody: any = {
        ...formData,
        isDemo: isDemo || false,
      };

      // Only include userId if user is logged in and not demo
      if (!isDemo && user) {
        requestBody.userId = user.uid;
      }

      const response = await fetch('/api/interview/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Interview created successfully!');
        // For demo interviews, store data in sessionStorage and go directly to session
        if (isDemo || data.isDemo) {
          sessionStorage.setItem('demoInterview', JSON.stringify({
            interviewId: data.interviewId,
            jobTitle: formData.jobTitle,
            jobDescription: formData.jobDescription,
            difficulty: formData.difficulty,
            duration: formData.duration,
          }));
          setTimeout(() => {
            router.push(`/interview/${data.interviewId}/session`);
          }, 500);
        } else {
          setTimeout(() => {
            router.push(`/interview/${data.interviewId}`);
          }, 500);
        }
      } else {
        toast.error('Failed to create interview: ' + data.error);
      }
    } catch (error) {
      console.error('Error creating interview:', error);
      toast.error('An error occurred while creating the interview');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 to-white dark:from-slate-900 dark:to-slate-950 flex flex-col">
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-6xl mx-auto w-full">
          {/* Info Cards Section */}


          {/* Form Section */}
          <div className="bg-white/95 dark:bg-slate-900/90 rounded-3xl shadow-xl p-8 md:p-12">
            <h1 className="text-3xl font-extralight text-gray-800 dark:text-slate-100 mb-2 font-concretica">
              {isDemo ? 'Try Demonstration' : 'Create New Interview'}
            </h1>
            <p className="text-gray-600 dark:text-slate-300 mb-8">
              {isDemo 
                ? 'Try out our AI interview platform. This demo won\'t be saved.'
                : 'Fill in the details to start your practice interview'}
            </p>

            {isDemo && (
              <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 px-4 py-3 text-sm flex items-start gap-3">
                <span className="mt-0.5 h-2 w-2 rounded-full bg-amber-500 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Demo Mode</p>
                  <p>This interview is for demonstration purposes only. Sign in to save your interviews and receive feedback.</p>
                </div>
              </div>
            )}

          <form onSubmit={handleSubmit} className="space-y-6">

            <div>
              <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                id="jobTitle"
                required
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900/80 text-gray-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition"
                placeholder="e.g., Software Engineer, Product Manager"
              />
            </div>

            <div>
              <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
                Job Description
              </label>
              <textarea
                id="jobDescription"
                value={formData.jobDescription}
                onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900/80 text-gray-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition resize-none"
                placeholder="Describe the role and requirements..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
                  Difficulty Level
                </label>
                <select
                  id="difficulty"
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900/80 text-gray-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Upper Intermediate">Upper Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>

              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  id="duration"
                  min="10"
                  max="60"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900/80 text-gray-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-100 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Interview'}
              </button>
            </div>
          </form>
          </div>
        </div>
      </div>

      {/* Footer */}
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


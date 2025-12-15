"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function SignUp() {
  const router = useRouter();
  const { signUp, signInWithGoogle } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      setLoading(false);
      return;
    }

    try {
      await signUp(formData.email, formData.password, formData.name);
      router.push('/dashboard');
    } catch (err: any) {
      // Handle Firebase auth errors with user-friendly messages
      let errorMessage = 'Sign up failed. Please try again.';
      
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already in use. Please use a different email or sign in instead.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address. Please check your email and try again.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      console.error('Sign up error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    setError('');

    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Google sign up failed. Please try again.');
      console.error('Google sign up error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 to-white dark:from-slate-900 dark:to-slate-950 flex flex-col">
      {/* Blurry Navbar */}
      <header className="backdrop-blur-md border-b border-white/10 bg-cyan-400/80 dark:bg-slate-900/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 sm:gap-3">
            <img 
              src="/images/logo.png" 
              alt="Icareerly Logo" 
              width={32}
              height={32}
              className="w-8 h-8 sm:w-10 sm:h-10"
            />
            <span className="text-lg sm:text-2xl font-extralight tracking-wide text-white font-concretica">
              icareerly
            </span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            <ThemeToggle />
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/faq"
              className="hidden sm:inline-block text-white/90 hover:text-white text-xs sm:text-sm font-light tracking-wide transition-colors"
            >
              FAQ
            </Link>
            <Link
              href="/auth/sign-in"
              className="px-4 py-1.5 bg-white/90 text-cyan-600 rounded-full text-xs sm:text-sm font-medium shadow-sm hover:shadow-md hover:bg-white transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-6 sm:py-12">
        <div className="max-w-md w-full">
        {/* Sign Up Card */}
        <div className="bg-white/95 dark:bg-slate-900/90 rounded-2xl sm:rounded-3xl shadow-xl p-5 sm:p-8 md:p-10">
          <h1 className="text-2xl sm:text-3xl font-extralight text-gray-800 dark:text-slate-100 mb-1 sm:mb-2 font-concretica">
            Sign Up
          </h1>
          <p className="text-gray-600 dark:text-slate-300 mb-4 sm:mb-8 text-xs sm:text-sm">
            Create your account to get started with icareerly.
          </p>

          {error && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-500/60 rounded-lg sm:rounded-xl text-red-700 dark:text-red-200 text-xs sm:text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-slate-200 mb-1.5 sm:mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900/80 text-gray-900 dark:text-slate-100 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-slate-200 mb-1.5 sm:mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900/80 text-gray-900 dark:text-slate-100 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-slate-200 mb-1.5 sm:mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900/80 text-gray-900 dark:text-slate-100 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition"
                placeholder="Create a password (min. 8 characters)"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-slate-200 mb-1.5 sm:mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900/80 text-gray-900 dark:text-slate-100 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition"
                placeholder="Confirm your password"
              />
            </div>

            <div className="flex items-start text-xs sm:text-sm">
              <input type="checkbox" id="terms" required className="mt-1 mr-1.5 sm:mr-2 rounded border-gray-300 dark:border-slate-600" />
              <label htmlFor="terms" className="text-gray-600 dark:text-slate-300">
                I agree to the{' '}
                <Link href="#" className="text-cyan-600 hover:text-cyan-700 transition-colors">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="#" className="text-cyan-600 hover:text-cyan-700 transition-colors">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-full shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-4 sm:mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className="px-2 bg-white dark:bg-slate-900 text-gray-500 dark:text-slate-400">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={loading}
              className="mt-3 sm:mt-4 w-full px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-300 dark:border-slate-700 rounded-full text-gray-700 dark:text-slate-100 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:gap-3"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign up with Google
            </button>
          </div>

          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-gray-600 dark:text-slate-300 text-xs sm:text-sm">
              Already have an account?{' '}
              <Link href="/auth/sign-in" className="text-cyan-600 hover:text-cyan-700 font-medium transition-colors">
                Sign In
              </Link>
            </p>
          </div>

          <div className="mt-4 sm:mt-6 text-center">
          <Link 
            href="/" 
            className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 text-xs sm:text-sm transition-colors"
          >
            ← Back to home
          </Link>
        </div>
        </div>
        </div>
      </main>
    </div>
  );
}


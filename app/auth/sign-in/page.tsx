"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function SignIn() {
  const router = useRouter();
  const { signIn, signInWithGoogle } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signIn(formData.email, formData.password);
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Sign in error:', err);
      // Map Firebase auth errors to user-friendly messages
      const code = err?.code as string | undefined;
      if (
        code === 'auth/invalid-credential' ||
        code === 'auth/wrong-password' ||
        code === 'auth/user-not-found'
      ) {
        setError('Wrong email or password');
      } else if (code === 'auth/invalid-email') {
        setError('Invalid email address. Please check and try again.');
      } else {
        setError('Sign in failed. Please check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Google sign in failed. Please try again.');
      console.error('Google sign in error:', err);
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
              href="/auth/sign-up"
              className="px-4 py-1.5 bg-white/90 text-cyan-600 rounded-full text-xs sm:text-sm font-medium shadow-sm hover:shadow-md hover:bg-white transition-all"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-6 sm:py-12">
        <div className="max-w-md w-full">
        {/* Sign In Card */}
        <div className="bg-white/95 dark:bg-slate-900/90 rounded-2xl sm:rounded-3xl shadow-xl p-5 sm:p-8 md:p-10">
          <h1 className="text-2xl sm:text-3xl font-extralight text-gray-800 dark:text-slate-100 mb-1 sm:mb-2 font-concretica">
            Sign In
          </h1>
          <p className="text-gray-600 dark:text-slate-300 mb-4 sm:mb-8 text-xs sm:text-sm">
            Welcome back! Please sign in to your account.
          </p>

          {error && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-500/60 rounded-lg sm:rounded-xl text-red-700 dark:text-red-200 text-xs sm:text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
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
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm">
              <label className="flex items-center">
                <input type="checkbox" className="mr-1.5 sm:mr-2 rounded border-gray-300 dark:border-slate-600" />
                <span className="text-gray-600 dark:text-slate-300">Remember me</span>
              </label>
              <Link href="#" className="text-cyan-600 hover:text-cyan-700 transition-colors">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-full shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
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
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="mt-3 sm:mt-4 w-full px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-300 dark:border-slate-700 rounded-full text-gray-700 dark:text-slate-100 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:gap-3"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>
          </div>

          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-gray-600 dark:text-slate-300 text-xs sm:text-sm">
              Don't have an account?{' '}
              <Link href="/auth/sign-up" className="text-cyan-600 hover:text-cyan-700 font-medium transition-colors">
                Sign Up
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


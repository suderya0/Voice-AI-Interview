'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  // All hooks must be declared before any conditional returns
  const [bubble1Visible, setBubble1Visible] = useState(false);
  const [bubble2Visible, setBubble2Visible] = useState(false);
  const [bubble3Visible, setBubble3Visible] = useState(false);
  
  const [bubble1Text, setBubble1Text] = useState('');
  const [bubble2Text, setBubble2Text] = useState('');
  const [bubble3Text, setBubble3Text] = useState('');
  
  const [bubble1Typing, setBubble1Typing] = useState(false);
  const [bubble2Typing, setBubble2Typing] = useState(false);
  const [bubble3Typing, setBubble3Typing] = useState(false);

  const fullTexts = {
    bubble1: "Hello, and welcome. I'll be guiding you through this interview today. Don't worry—this will feel like a simple conversation. Let's begin",
    bubble2: "Thank you for the introduction. I'm prepared to start.",
    bubble3: "Excellent. Here's the first question: Walk me through your experience so far."
  };

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [authLoading, user, router]);

  // Typing animation effect - only run when not authenticated
  useEffect(() => {
    // Don't start animation if user is authenticated or still loading
    if (authLoading || user) {
      return;
    }

    // Start typing bubble 1 after a short delay
    const timer1 = setTimeout(() => {
      setBubble1Visible(true);
      typeText(fullTexts.bubble1, setBubble1Text, setBubble1Typing, () => {
        // After bubble 1 finishes, start bubble 2
        setTimeout(() => {
          setBubble2Visible(true);
          typeText(fullTexts.bubble2, setBubble2Text, setBubble2Typing, () => {
            // After bubble 2 finishes, start bubble 3
            setTimeout(() => {
              setBubble3Visible(true);
              typeText(fullTexts.bubble3, setBubble3Text, setBubble3Typing);
            }, 500);
          });
        }, 500);
      });
    }, 500);

    return () => {
      clearTimeout(timer1);
    };
  }, [authLoading, user]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-400 to-white flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Don't render home page if user is authenticated (will redirect)
  if (user) {
    return null;
  }

  const typeText = (text: string, setText: (text: string) => void, setTyping: (typing: boolean) => void, onComplete?: () => void) => {
    setTyping(true);
    let currentIndex = 0;
    
    const typingInterval = setInterval(() => {
      if (currentIndex < text.length) {
        setText(text.substring(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setTyping(false);
        if (onComplete) onComplete();
      }
    }, 30); // Adjust speed: lower number = faster typing
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <nav className="flex items-center justify-between">
          {/* Logo and Brand Name */}
          <div className="flex items-center gap-2 sm:gap-3">
            <img 
              src="/images/logo.png" 
              alt="Intervai Logo" 
              width={40}
              height={40}
              className="w-8 h-8 sm:w-12 sm:h-12"
            />
            <span className="text-xl sm:text-2xl font-extralight tracking-wide text-white font-concretica">
              intervai
            </span>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-4 sm:gap-8 lg:gap-12">
            <Link 
              href="#" 
              className="hidden sm:inline-block text-white/90 hover:text-white text-xs sm:text-sm font-light tracking-wide transition-colors"
              style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
            > 
              About
            </Link>
            <Link 
              href="/faq" 
              className="hidden sm:inline-block text-white/90 hover:text-white text-xs sm:text-sm font-light tracking-wide transition-colors"
              style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
            >
              FAQ
            </Link>
            <Link 
              href="/auth/sign-in"
              className="px-4 sm:px-6 py-1.5 sm:py-2 bg-white rounded-full text-xs sm:text-sm font-medium text-cyan-600 shadow-md hover:shadow-lg transition-all duration-200"
            >
              <span className="hidden sm:inline">Sign In / Up</span>
              <span className="sm:hidden">Sign In</span>
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[60vh] lg:min-h-[70vh]">
          {/* Left Side - Branding */}
          <div className="flex flex-col items-start space-y-6 sm:space-y-8 text-center lg:text-left">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3 sm:space-x-4 w-full lg:w-auto justify-center lg:justify-start">
              <img 
                src="/images/logo.png" 
                alt="Intervai Logo" 
                width={80}
                height={80}
                className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28"
              />
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extralight tracking-tight text-white font-concretica">
                intervai
              </h1>
            </div>
            
            {/* Tagline */}
            <p className="text-lg sm:text-xl md:text-2xl font-light text-white/90 leading-relaxed font-concretica w-full lg:w-auto">
              Stress-free simulations. Real-world impact.
            </p>
            
            {/* Start Interview Button */}
            <Link href="/interview/create?demo=true" className="w-full lg:w-auto">
              <button className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 bg-white rounded-full text-base sm:text-lg font-medium text-cyan-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                Try Demonstration
              </button>
            </Link>
          </div>
          {/* Right Side - Chat Bubbles */}
          <div className="relative flex flex-col items-center lg:items-end space-y-4 sm:space-y-6 mt-8 lg:mt-0">
            {/* Chat Bubble 1 - Female Avatar */}
            {bubble1Visible && (
              <div className={`relative w-full sm:w-80 max-w-sm lg:max-w-none bg-white/95 rounded-2xl sm:rounded-3xl rounded-tr-sm p-4 sm:p-5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fadeIn`}>
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex-shrink-0">
                    <img 
                      src="/images/aiavatar2.png" 
                      alt="AI Avatar" 
                      width={60}
                      height={60}
                      className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-700 text-xs sm:text-sm leading-relaxed break-words">
                      {bubble1Text}
                      {bubble1Typing && <span className="animate-blink">|</span>}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Chat Bubble 2 - Female Avatar */}
            {bubble2Visible && (
              <div className={`relative w-full sm:w-80 max-w-sm lg:max-w-none bg-white/95 rounded-2xl sm:rounded-3xl rounded-tr-sm p-4 sm:p-5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 lg:ml-12 animate-fadeIn`}>
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-700 text-xs sm:text-sm leading-relaxed break-words">
                      {bubble2Text}
                      {bubble2Typing && <span className="animate-blink">|</span>}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <img 
                      src="/images/aiavatar4.png" 
                      alt="AI Avatar" 
                      width={60}
                      height={60}
                      className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Chat Bubble 3 - Male Avatar */}
            {bubble3Visible && (
              <div className={`relative w-full sm:w-80 max-w-sm lg:max-w-none bg-white/95 rounded-2xl sm:rounded-3xl rounded-tr-sm p-4 sm:p-5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fadeIn`}>
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex-shrink-0">
                    <img 
                      src="/images/aiavatar2.png" 
                      alt="AI Avatar" 
                      width={60}
                      height={60}
                      className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-700 text-xs sm:text-sm leading-relaxed break-words">
                      {bubble3Text}
                      {bubble3Typing && <span className="animate-blink">|</span>}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Cards Section */}
        <div className="mt-12 sm:mt-16 lg:mt-24 mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extralight text-white mb-8 sm:mb-12 text-center font-concretica px-4">
            Why Choose intervai?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto px-4">
            <div className="bg-white/95 rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="flex flex-col items-center text-center mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-extralight text-gray-800 font-concretica mb-2 sm:mb-3">AI-Powered Practice</h3>
              </div>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed text-center">
                Practice with our advanced AI interviewer that adapts to your responses and provides realistic interview scenarios.
              </p>
            </div>

            <div className="bg-white/95 rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="flex flex-col items-center text-center mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-extralight text-gray-800 font-concretica mb-2 sm:mb-3">Customizable Difficulty</h3>
              </div>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed text-center">
                Choose from 5 difficulty levels - from Beginner to Expert - to match your current skill level and career goals.
              </p>
            </div>

            <div className="bg-white/95 rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 sm:col-span-2 lg:col-span-1">
              <div className="flex flex-col items-center text-center mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-extralight text-gray-800 font-concretica mb-2 sm:mb-3">Stress-Free Learning</h3>
              </div>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed text-center">
                Build confidence in a safe, judgment-free environment. Practice as many times as you need to perfect your interview skills.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/30 backdrop-blur-sm border-t border-white/20 py-6 sm:py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6">
            <div className="col-span-2 sm:col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <img 
                  src="/images/logo.png" 
                  alt="Intervai Logo" 
                  width={28}
                  height={28}
                  className="w-7 h-7 sm:w-8 sm:h-8"
                />
                <span className="text-lg sm:text-xl font-extralight tracking-wide text-gray-800 font-concretica">
                  intervai
                </span>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm">
                Stress-free simulations. Real-world impact.
              </p>
            </div>

            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-gray-800 mb-2 sm:mb-3 font-concretica">Platform</h4>
              <ul className="space-y-1.5 sm:space-y-2">
                <li>
                  <a href="/interview/create" className="text-gray-600 hover:text-cyan-600 text-xs sm:text-sm transition-colors">
                    Create Interview
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-cyan-600 text-xs sm:text-sm transition-colors">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-cyan-600 text-xs sm:text-sm transition-colors">
                    Features
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-gray-800 mb-2 sm:mb-3 font-concretica">Support</h4>
              <ul className="space-y-1.5 sm:space-y-2">
                <li>
                  <a href="/faq" className="text-gray-600 hover:text-cyan-600 text-xs sm:text-sm transition-colors">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-cyan-600 text-xs sm:text-sm transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-cyan-600 text-xs sm:text-sm transition-colors">
                    Help Center
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-gray-800 mb-2 sm:mb-3 font-concretica">Account</h4>
              <ul className="space-y-1.5 sm:space-y-2">
                <li>
                  <a href="/auth/sign-in" className="text-gray-600 hover:text-cyan-600 text-xs sm:text-sm transition-colors">
                    Sign In
                  </a>
                </li>
                <li>
                  <a href="/auth/sign-up" className="text-gray-600 hover:text-cyan-600 text-xs sm:text-sm transition-colors">
                    Sign Up
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-4 sm:pt-6 border-t border-white/20 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <p className="text-gray-600 text-xs sm:text-sm text-center sm:text-left">
              © {new Date().getFullYear()} intervai. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-4 sm:gap-6 justify-center sm:justify-end">
              <a href="#" className="text-gray-600 hover:text-cyan-600 text-xs sm:text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-600 hover:text-cyan-600 text-xs sm:text-sm transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

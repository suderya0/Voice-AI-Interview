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
      <div className="min-h-screen bg-gradient-to-br from-cyan-400 white-700 flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 white-700">
      {/* Header */}
      <header className="container mx-auto px-6 py-6">
        <nav className="flex items-center justify-between">
          {/* Logo and Brand Name */}
          <div className="flex items-center gap-3">
            {/* Hexagon Logo */}
            <div>
            <img 
                src="/images/logo.png" 
                alt="Intervai Logo" 
                width={48} 
                height={48} 
            />
            </div>
            <span className="text-2xl font-extralight tracking-wide text-white font-concretica" >
              intervai
            </span>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-12">
            <Link 
              href="#" 
              className="text-white/90 hover:text-white text-sm font-light tracking-wide transition-colors"
              style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
            > 
              About
            </Link>
            <Link 
              href="/faq" 
              className="text-white/90 hover:text-white text-sm font-light tracking-wide transition-colors"
              style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
            >
              FAQ
            </Link>
            <Link 
              href="/auth/sign-in"
              className="px-6 py-2 bg-white rounded-full text-sm font-medium text-cyan-600 shadow-md hover:shadow-lg transition-all duration-200"
            >
              Sign In / Up
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[70vh]">
          {/* Left Side - Branding */}
          <div className="flex flex-col items-start space-y-8">
    
              {/* LOGO ve BAŞLIK BÖLÜMÜ (Aynı Satır) */}
              <div className="flex items-center space-x-4"> {/* space-x-4 ile logo ve başlık arasına boşluk ekledik */}
                  {/* Logo */}  
                  <img 
                      src="/images/logo.png" 
                      alt="Intervai Logo" 
                      width={100} 
                      height={100} 
                  />
                  
                  {/* Başlık */}
                  <h1 className="text-7xl font-extralight tracking-tight text-white font-concretica">
                      intervai
                  </h1>
              </div>
              
              {/* Tagline (Başlığın Altında, Soldan Boşluklu) */}
              {/* ml-1: margin-left ile 0.25rem (4px) boşluk bıraktık. İhtiyacınıza göre bu değeri (örneğin ml-4, ml-8) değiştirebilirsiniz. */}
              <p className="text-2xl font-light text-white/90 leading-relaxed font-concretica ml-1">
                  Stress-free simulations. Real-world impact.
              </p>
              
              {/* Start Interview Button */}
              <Link href="/interview/create?demo=true">
                  <button className="px-10 py-4 bg-white rounded-full text-lg font-medium text-cyan-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                      Try Demonstration
                  </button>
              </Link>
          </div>
          {/* Right Side - Chat Bubbles */}
          <div className="relative flex flex-col items-end space-y-6">
            {/* Chat Bubble 1 - Female Avatar */}
            {bubble1Visible && (
              <div className={`relative w-80 bg-white/95 rounded-3xl rounded-tr-sm p-5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fadeIn`}>
                <div className="flex items-start gap-4">
                  <div >
                  <img 
                      src="/images/aiavatar2.png" 
                      alt="AI Avatar" 
                      width={80} 
                      height={80} 
                  />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {bubble1Text}
                      {bubble1Typing && <span className="animate-blink">|</span>}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Chat Bubble 2 - Female Avatar */}
            {bubble2Visible && (
              <div className={`relative w-80 bg-white/95 rounded-3xl rounded-tr-sm p-5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ml-12 animate-fadeIn`}>
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {bubble2Text}
                      {bubble2Typing && <span className="animate-blink">|</span>}
                    </p>
                  </div>
                  <div>
                  <img 
                      src="/images/aiavatar4.png" 
                      alt="AI Avatar" 
                      width={80} 
                      height={80} 
                  />
                  </div>
                </div>
              </div>
            )}

            {/* Chat Bubble 3 - Male Avatar */}
            {bubble3Visible && (
              <div className={`relative w-80 bg-white/95 rounded-3xl rounded-tr-sm p-5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fadeIn`}>
                <div className="flex items-start gap-4">
                  <div>
                    <img 
                        src="/images/aiavatar2.png" 
                        alt="AI Avatar" 
                        width={80} 
                        height={80} 
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700 text-sm leading-relaxed">
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
        <div className="mt-24 mb-16">
          <h2 className="text-4xl font-extralight text-white mb-12 text-center font-concretica">
            Why Choose intervai?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white/95 rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-2xl flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-extralight text-gray-800 font-concretica mb-3">AI-Powered Practice</h3>
              </div>
              <p className="text-gray-600 text-base leading-relaxed text-center">
                Practice with our advanced AI interviewer that adapts to your responses and provides realistic interview scenarios.
              </p>
            </div>

            <div className="bg-white/95 rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-2xl flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-extralight text-gray-800 font-concretica mb-3">Customizable Difficulty</h3>
              </div>
              <p className="text-gray-600 text-base leading-relaxed text-center">
                Choose from 5 difficulty levels - from Beginner to Expert - to match your current skill level and career goals.
              </p>
            </div>

            <div className="bg-white/95 rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-2xl flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-extralight text-gray-800 font-concretica mb-3">Stress-Free Learning</h3>
              </div>
              <p className="text-gray-600 text-base leading-relaxed text-center">
                Build confidence in a safe, judgment-free environment. Practice as many times as you need to perfect your interview skills.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/30 backdrop-blur-sm border-t border-white/20 py-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img 
                  src="/images/logo.png" 
                  alt="Intervai Logo" 
                  width={32} 
                  height={32} 
                />
                <span className="text-xl font-extralight tracking-wide text-gray-800 font-concretica">
                  intervai
                </span>
              </div>
              <p className="text-gray-600 text-sm">
                Stress-free simulations. Real-world impact.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-3 font-concretica">Platform</h4>
              <ul className="space-y-2">
                <li>
                  <a href="/interview/create" className="text-gray-600 hover:text-cyan-600 text-sm transition-colors">
                    Create Interview
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-cyan-600 text-sm transition-colors">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-cyan-600 text-sm transition-colors">
                    Features
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-3 font-concretica">Support</h4>
              <ul className="space-y-2">
                <li>
                  <a href="/faq" className="text-gray-600 hover:text-cyan-600 text-sm transition-colors">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-cyan-600 text-sm transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-cyan-600 text-sm transition-colors">
                    Help Center
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-3 font-concretica">Account</h4>
              <ul className="space-y-2">
                <li>
                  <a href="/auth/sign-in" className="text-gray-600 hover:text-cyan-600 text-sm transition-colors">
                    Sign In
                  </a>
                </li>
                <li>
                  <a href="/auth/sign-up" className="text-gray-600 hover:text-cyan-600 text-sm transition-colors">
                    Sign Up
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-white/20 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-sm">
              © {new Date().getFullYear()} intervai. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-gray-600 hover:text-cyan-600 text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-600 hover:text-cyan-600 text-sm transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Home() {
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

  useEffect(() => {
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
  }, []);

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
              href="#" 
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
              <Link href="/interview/create">
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
      </main>
    </div>
  );
}

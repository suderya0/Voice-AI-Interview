'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-teal-300 to-blue-200">
      {/* Header */}
      <header className="container mx-auto px-6 py-6">
        <nav className="flex items-center justify-between">
          {/* Logo and Brand Name */}
          <div className="flex items-center gap-3">
            {/* Hexagon Logo */}
            <div className="w-10 h-10 bg-white/90 rounded-lg flex items-center justify-center shadow-md transform rotate-45">
              <div className="w-6 h-6 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-sm transform -rotate-45"></div>
            </div>
            <span className="text-2xl font-extralight tracking-wide text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              Intervai
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
            <button className="px-6 py-2 bg-white rounded-full text-sm font-medium text-cyan-600 shadow-md hover:shadow-lg transition-all duration-200">
              Sign In / Up
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[70vh]">
          {/* Left Side - Branding */}
          <div className="flex flex-col items-start space-y-8">
            {/* Large Logo */}

            <h1 className="text-7xl font-extralight tracking-tight text-white **font-concretica**">
              intervai
            </h1>
                        
            {/* Tagline */}
            <p className="text-2xl font-light text-white/90 leading-relaxed **font-concretica**">
              Stress-free simulations. Real-world impact.
            </p>
            {/* Start Interview Button */}
            <Link href="/interview/create">
              <button className="px-10 py-4 bg-white rounded-full text-lg font-medium text-cyan-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                Start Interview
              </button>
            </Link>
          </div>

          {/* Right Side - Chat Bubbles */}
          <div className="relative flex flex-col items-end space-y-6">
            {/* Chat Bubble 1 - Female Avatar */}
            <div className="relative w-80 bg-white/95 rounded-3xl rounded-tr-sm p-5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-300 to-pink-400 flex items-center justify-center flex-shrink-0">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Hello. I’ll be guiding you through this interview today. Let’s begin.
                  </p>
                </div>
              </div>
            </div>

            {/* Chat Bubble 2 - Female Avatar */}
            <div className="relative w-80 bg-white/95 rounded-3xl rounded-tr-sm p-5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ml-12">
              <div className="flex items-start gap-4">

                <div className="flex-1">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Thank you for the introduction. I’m prepared to start.
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-300 to-purple-400 flex items-center justify-center flex-shrink-0">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Chat Bubble 3 - Male Avatar */}
            <div className="relative w-80 bg-white/95 rounded-3xl rounded-tr-sm p-5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-300 to-pink-400 flex items-center justify-center flex-shrink-0">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Great. Let’s begin with the first question: Could you tell me a little about yourself?
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

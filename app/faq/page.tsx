"use client";

import Link from 'next/link';
import { useState } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "What is icareerly?",
      answer: "icareerly is an AI-powered interview practice platform that helps you prepare for job interviews in a stress-free environment. Our advanced AI interviewer adapts to your responses and provides realistic interview scenarios tailored to your chosen difficulty level."
    },
    {
      question: "How does the AI interviewer work?",
      answer: "Our AI interviewer uses advanced natural language processing to conduct realistic interviews. It adapts to your responses, asks follow-up questions, and provides feedback based on your performance. You can practice as many times as you need to build confidence."
    },
    {
      question: "What difficulty levels are available?",
      answer: "We offer 5 difficulty levels: Beginner, Intermediate, Upper Intermediate, Advanced, and Expert. Choose the level that matches your current skill level and career goals. You can always adjust the difficulty for your next practice session."
    },
    {
      question: "How long does an interview session last?",
      answer: "Interview sessions can be customized from 10 to 60 minutes. You can set the duration when creating a new interview session to match your schedule and practice needs."
    },
    {
      question: "Do I need to create an account?",
      answer: "While you can try a demonstration without an account, creating an account allows you to save your interview history, track your progress, and access personalized feedback. Signing up is free and takes just a few moments."
    },
    {
      question: "Can I practice for specific job roles?",
      answer: "Yes! When creating an interview, you can specify the job title and provide a detailed job description. Our AI will tailor the questions to match the requirements of that specific role, making your practice more relevant and effective."
    },
    {
      question: "Is my interview data private?",
      answer: "Absolutely. We take your privacy seriously. All interview sessions are private and secure. Your data is encrypted and we never share your information with third parties. You can review our Privacy Policy for more details."
    },
    {
      question: "What kind of feedback do I receive?",
      answer: "After each interview session, you'll receive comprehensive feedback on your performance, including areas of strength and suggestions for improvement. This helps you identify what to work on before your real interviews."
    },
    {
      question: "Can I retake interviews?",
      answer: "Yes! One of the key benefits of icareerly is that you can practice as many times as you want. Each session is a new opportunity to improve your interview skills and build confidence."
    },
    {
      question: "How do I get started?",
      answer: "Getting started is easy! Simply click the 'Try Demonstration' button on our homepage, or create an account to access all features. Then create your first interview session by selecting your job title, difficulty level, and duration."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 to-white dark:from-slate-900 dark:to-slate-950 flex flex-col">
      {/* Header */}
      <header className="backdrop-blur-md border-b border-white/10 bg-cyan-400/80 dark:bg-slate-900/80">
        <nav className="container mx-auto px-6 py-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img 
              src="/images/logo.png" 
              alt="icareerly Logo" 
              width={48} 
              height={48} 
            />
            <span className="text-2xl font-extralight tracking-wide text-white font-concretica">
              icareerly
            </span>
          </Link>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
            <Link 
              href="/faq" 
              className="text-white hover:text-white text-sm font-light tracking-wide transition-colors hidden sm:inline-block"
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
      <main className="flex-1 container mx-auto px-6 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extralight text-white mb-4 font-concretica">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-white/90 font-light">
            Everything you need to know about icareerly
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white/95 dark:bg-slate-900/90 rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-8 py-6 flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded-2xl"
              >
                <h3 className="text-lg font-medium text-gray-800 dark:text-slate-100 pr-8 font-concretica">
                  {faq.question}
                </h3>
                <div className="flex-shrink-0">
                  <svg
                    className={`w-6 h-6 text-cyan-600 transition-transform duration-300 ${
                      openIndex === index ? 'transform rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-8 pb-6">
                  <p className="text-gray-600 dark:text-slate-200 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-16 bg-white/95 dark:bg-slate-900/90 rounded-3xl shadow-xl p-8 text-center">
          <h2 className="text-2xl font-extralight text-gray-800 dark:text-slate-100 mb-3 font-concretica">
            Still have questions?
          </h2>
          <p className="text-gray-600 dark:text-slate-300 mb-6">
            Can't find the answer you're looking for? Please reach out to our friendly support team.
          </p>
          <Link
            href="#"
            className="inline-block px-8 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-medium"
          >
            Contact Us
          </Link>
        </div>

        {/* Get Started Section */}
        <div className="mt-6 bg-white/95 dark:bg-slate-900/90 rounded-3xl shadow-xl p-8 text-center">
          <h2 className="text-2xl font-extralight text-gray-800 dark:text-slate-100 mb-3 font-concretica">
            If you're ready, let's get started.
          </h2>
          <p className="text-gray-600 dark:text-slate-300 mb-6">
            Create your account or sign in to start your first AI-powered interview session.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth/sign-in"
              className="px-6 py-2.5 rounded-full border border-cyan-600 text-cyan-600 hover:bg-cyan-50 text-sm font-medium transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/sign-up"
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-600 text-white hover:shadow-lg text-sm font-medium transition-all"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </main>

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


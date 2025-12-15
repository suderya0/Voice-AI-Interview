"use client";

import { useTheme } from '@/contexts/ThemeContext';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className="inline-flex items-center justify-center rounded-full border border-white/40 bg-white/20 p-1.5 text-xs text-white shadow-sm backdrop-blur-md transition hover:bg-white/30 hover:border-white/70 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100 dark:hover:bg-slate-700"
    >
      {theme === 'dark' ? (
        // Moon icon
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M21 12.79C20.24 13.05 19.44 13.2 18.62 13.2C13.96 13.2 10.2 9.44 10.2 4.78C10.2 3.96 10.35 3.16 10.61 2.4C7.33 3.54 5 6.72 5 10.38C5 15.04 8.76 18.8 13.42 18.8C17.08 18.8 20.26 16.47 21.4 13.19C21.28 13.06 21.15 12.93 21 12.79Z"
            fill="currentColor"
          />
        </svg>
      ) : (
        // Sun icon
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 4V2M18.36 5.64L19.78 4.22M20 12H22M18.36 18.36L19.78 19.78M12 20V22M4.22 19.78L5.64 18.36M2 12H4M4.22 4.22L5.64 5.64M16 12C16 14.21 14.21 16 12 16C9.79 16 8 14.21 8 12C8 9.79 9.79 8 12 8C14.21 8 16 9.79 16 12Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
};



import React, { useEffect, useState } from "react";

const SplashScreen: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Hide splash screen after 3 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="flex items-center justify-center h-screen w-screen bg-white relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-white to-red-100 opacity-50"></div>

      <div className="text-center text-red-600 z-10">
        {/* Blood Drop Logo */}
        <div className="animate-bounce mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-24 w-24 mx-auto drop-shadow-lg"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill="#e53e3e"
            />
            <path
              d="M14.5 8.5c0 1.39-1.11 2.5-2.5 2.5S9.5 9.89 9.5 8.5 10.61 6 12 6s2.5 1.11 2.5 2.5z"
              fill="#f56565"
            />
          </svg>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-wide drop-shadow-lg animate-fade-in animate-bounce-text">
          The Life Savers
        </h1>
        <p className="mt-3 text-base sm:text-lg text-red-700 font-light tracking-wider drop-shadow-md animate-fade-in animate-bounce-text delay-200">
        Together for a Healthier Tomorrow
        </p>
      </div>

      {/* Decorative blood drops */}
      <div
        className="absolute bottom-0 left-0 w-12 h-12 bg-red-500 rounded-full animate-float drop-shadow-lg"
        aria-hidden="true"
      ></div>
      <div
        className="absolute top-0 right-0 w-20 h-20 bg-red-300 rounded-full animate-float-slow drop-shadow-lg"
        aria-hidden="true"
      ></div>
      <div
        className="absolute top-1/3 left-1/4 w-16 h-16 bg-red-400 rounded-full animate-float drop-shadow-lg"
        aria-hidden="true"
      ></div>
      <div
        className="absolute top-1/2 right-1/4 w-8 h-8 bg-red-600 rounded-full animate-float-slow drop-shadow-lg"
        aria-hidden="true"
      ></div>

      {/* Disable animations for users with prefers-reduced-motion */}
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .animate-bounce, .animate-float, .animate-float-slow {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;

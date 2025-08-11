import React, { useState, useEffect } from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import { FaRedoAlt } from "react-icons/fa"; // Added retry icon
import { Link } from "react-router-dom"; // For 'Contact Support' link

const ErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false); // State for retry action

  const resetError = () => {
    setHasError(false);
    setIsRetrying(true);
    // Simulate a retry process (e.g., reloading the app or retrying a specific action)
    setTimeout(() => {
      setIsRetrying(false);
      window.location.reload(); // Optional: you could also reset specific state instead of reloading the page
    }, 2000);
  };

  useEffect(() => {
    // Error handler for ErrorEvent
    const errorHandler = (ev: ErrorEvent) => {
      setHasError(true);
      console.error("Error caught in boundary:", ev.message);
    };

    window.addEventListener("error", errorHandler);

    return () => window.removeEventListener("error", errorHandler);
  }, []);

  return hasError ? (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate__animated animate__fadeIn animate-fade-in">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-400 text-white text-center py-8 px-6 rounded-t-3xl">
          <FaExclamationTriangle size={64} className="mx-auto mb-4" />
          <h1 className="text-5xl font-extrabold mb-4 animate__animated animate__fadeIn animate__delay-1s">
            Oops! Something Went Wrong
          </h1>
          <p className="text-lg max-w-md mx-auto leading-relaxed mb-6 animate__animated animate__fadeIn animate__delay-2s">
            We encountered an unexpected issue. Please try again, or if the problem persists, contact support.
          </p>
        </div>

        {/* Action Section */}
        <div className="flex flex-col justify-center items-center py-6 space-y-4">
          <button
            onClick={resetError}
            className="px-8 py-3 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-all transform hover:scale-105 flex items-center space-x-2"
          >
            {isRetrying ? (
              <span>Retrying...</span>
            ) : (
              <>
                <FaRedoAlt className="animate-spin" />
                <span>Retry</span>
              </>
            )}
          </button>
          {/* Contact Support */}
          <Link
            to="/contact-support"
            className="text-sm text-gray-800 underline hover:text-red-500 transition"
          >
            Need help? Contact Support
          </Link>
        </div>
      </div>
    </div>
  ) : (
    <>{children}</>
  );
};

export default ErrorBoundary;

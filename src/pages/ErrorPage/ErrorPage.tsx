import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { FaExclamationTriangle } from "react-icons/fa"; // Added an icon for visual appeal

const ErrorPage: React.FC = () => {
  // Automatically focus the 'Go to Home' button for accessibility
  useEffect(() => {
    const focusButton = document.getElementById("go-home-button");
    focusButton?.focus();
  }, []);

  return (
    <div
      className="min-h-screen bg-gradient-to-r flex items-center justify-center p-4"
      style={{ paddingTop: "4rem", paddingBottom: "4rem" }}
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full overflow-hidden relative animate__animated animate__fadeIn animate__delay-1s animate-fade-in">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-400 text-white text-center py-10 px-6 rounded-t-3xl">
          <FaExclamationTriangle
            size={80}
            className="mx-auto mb-4 animate__animated animate__fadeIn animate__delay-2s"
          />
          <h1 className="text-6xl font-extrabold mb-2 animate__animated animate__fadeIn animate__delay-2s">
            404
          </h1>
          <h2 className="text-3xl font-semibold mb-6 animate__animated animate__fadeIn animate__delay-3s">
            Oops! Page Not Found
          </h2>
        </div>

        {/* Content Section */}
        <div className="text-center p-8 max-w-lg mx-auto bg-white animate__animated animate__fadeIn animate__delay-4s">
          <p className="text-gray-600 mb-8 text-lg">
            The page you are looking for might have been removed, had its name
            changed, or is temporarily unavailable.
          </p>
          <Link
            to="/admin-dashboard"
            id="go-home-button"
            className="inline-block px-8 py-3 text-white bg-red-600 hover:bg-red-700 rounded-full shadow-lg transition-transform duration-300 transform hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            aria-label="Go to Dashboard"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;

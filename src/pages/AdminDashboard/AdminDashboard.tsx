import React from "react";
import {
  FaArrowLeft,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen bg-white flex items-center justify-center p-6"
      style={{ paddingTop: "4rem", paddingBottom: "4rem" }}
    >
      <div className="bg-white rounded-2xl shadow-lg max-w-5xl w-full overflow-hidden relative animate-fade-in">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-400 text-white text-center py-8 px-6 relative">
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 sm:top-1/2 sm:left-6 transform sm:-translate-y-1/2 p-2 bg-red-600 text-white rounded-full shadow-md hover:bg-red-700 transition"
            aria-label="Go back"
          >
            <FaArrowLeft size={18} />
          </button>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 mt-4 sm:mt-0">
            Admin Dashboard
          </h1>
        </div>

        {/* Content Section */}
        <div className="py-10 px-6 space-y-8">
          <p className="text-lg sm:text-xl text-gray-700 leading-relaxed">
            At <strong>The Life Savers</strong>, your privacy is a top priority.
            This Privacy Policy explains how we collect, store, use, and protect
            your personal information when you interact with our platform.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

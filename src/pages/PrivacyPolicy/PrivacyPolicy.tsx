import React from "react";
import {
  FaArrowLeft,
  FaShieldAlt,
  FaKey,
  FaDatabase,
  FaUserSecret,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy: React.FC = () => {
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
            Privacy Policy
          </h1>
        </div>

        {/* Content Section */}
        <div className="py-10 px-6 space-y-8">
          <p className="text-lg sm:text-xl text-gray-700 leading-relaxed">
            At <strong>The Life Savers</strong>, your privacy is a top priority.
            This Privacy Policy explains how we collect, store, use, and protect
            your personal information when you interact with our platform.
          </p>

          {/* Icon Grid Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            <div className="text-center space-y-4">
              <div className="text-red-600">
                <FaKey size={50} />
              </div>
              <h2 className="text-xl font-semibold">Information We Collect</h2>
              <p className="text-md text-gray-600">
                We collect personal data, including your name, contact details,
                blood group, and location, along with account and usage
                information for platform functionality.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="text-red-500">
                <FaUserSecret size={50} />
              </div>
              <h2 className="text-xl font-semibold">
                How We Use Your Information
              </h2>
              <p className="text-md text-gray-600">
                We use your data to connect donors and recipients, manage your
                account, communicate with you, and ensure the security of our
                platform.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="text-red-400">
                <FaShieldAlt size={50} />
              </div>
              <h2 className="text-xl font-semibold">
                How We Protect Your Data
              </h2>
              <p className="text-md text-gray-600">
                We employ encryption, access control, and regular security
                monitoring to safeguard your information from unauthorized
                access.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="text-red-500">
                <FaDatabase size={50} />
              </div>
              <h2 className="text-xl font-semibold">Data Retention</h2>
              <p className="text-md text-gray-600">
                We retain your personal information as long as your account is
                active or needed for our services, after which it is securely
                deleted.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="text-red-600">
                <FaUserSecret size={50} />
              </div>
              <h2 className="text-xl font-semibold">Your Rights</h2>
              <p className="text-md text-gray-600">
                You have the right to access, correct, or delete your data. You
                can also request data portability or object to data processing.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="text-red-400">
                <FaArrowLeft size={50} />
              </div>
              <h2 className="text-xl font-semibold">Third-Party Links</h2>
              <p className="text-md text-gray-600">
                We may include links to third-party websites, but we are not
                responsible for their privacy practices. We encourage you to
                review their policies.
              </p>
            </div>
          </div>

          <div className="flex justify-center py-6">
            <button className="px-6 py-3 bg-red-600 text-white rounded-full shadow-md hover:bg-red-700 transition">
              Contact Us: thelifesaversofficials@gmail.com
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

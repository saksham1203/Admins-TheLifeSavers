import React, { memo } from "react";
import { FaClock } from "react-icons/fa";

const ComingSoon: React.FC<{
  timeLeft: { days: number; hours: number; minutes: number; seconds: number };
}> = memo(({ timeLeft }) => {
  const { days, hours, minutes, seconds } = timeLeft;

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-2">
      <div className="bg-white rounded-2xl shadow-lg max-w-3xl w-full overflow-hidden">
        {/* Header Section */}
        <div className="bg-red-600 text-white text-center py-6 px-4">
          <h1 className="text-4xl font-bold mb-2">The Life Savers</h1>
          <p className="text-base font-medium mb-4">
            Together for a Healthier Tomorrow
          </p>
          <p className="text-sm">
            Launching on <strong>1st November 2024</strong> at{" "}
            <strong>1:30 PM IST</strong>!
          </p>
        </div>

        {/* Countdown Section */}
        <div className="flex flex-col items-center py-8 px-6 space-y-4">
          <FaClock size={60} className="text-red-500" />
          <h2 className="text-2xl font-semibold text-gray-800">Launching in</h2>
          <h2 className="text-2xl font-semibold text-gray-800">
            <span className="text-red-600">{days}</span>d{" "}
            <span className="text-red-600">{hours}</span>h{" "}
            <span className="text-red-600">{minutes}</span>m{" "}
            <span className="text-red-600">{seconds}</span>s
          </h2>
          <p className="text-sm text-gray-600 text-center max-w-md">
            Stay tuned! We're preparing something exciting to help you on your health journey.
          </p>
        </div>

        {/* Footer Section */}
        <footer className="bg-red-600 text-white text-center py-3">
          <p className="text-xs">© 2024 The Life Savers | All Rights Reserved</p>
        </footer>
      </div>
    </div>
  );
});

export default ComingSoon;

import React from "react";
import { RiWhatsappFill } from "react-icons/ri"; // Clean and modern WhatsApp icon

const WhatsAppIcon: React.FC = () => {
  const whatsappLink = "https://whatsapp.com/channel/YOUR_CHANNEL_ID"; // Replace with your actual link

  const handleClick = () => {
    window.open(whatsappLink, "_blank");
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <div className="relative group">
        {/* Tooltip on hover (desktop only) */}
        <div className="absolute right-16 bottom-1/2 translate-y-1/2 bg-white text-green-600 border border-green-500 font-medium text-sm px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md hidden md:block">
          Join WhatsApp Channel
        </div>

        {/* Icon Button */}
        <button
          onClick={handleClick}
          className="p-4 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 hover:scale-105 transition-transform duration-200 ease-in-out focus:outline-none"
          aria-label="Join WhatsApp Channel"
        >
          <RiWhatsappFill size={28} />
        </button>
      </div>
    </div>
  );
};

export default WhatsAppIcon;

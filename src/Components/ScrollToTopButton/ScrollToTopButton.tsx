import React, { useEffect, useState } from "react";
import { FaArrowUp } from "react-icons/fa";

const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    setIsVisible(window.scrollY > 300);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return (
    isVisible && (
      <div className="fixed bottom-14 left-4 flex flex-col items-center z-50">
        <button
          onClick={scrollToTop}
          className="p-3 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors duration-300 ease-in-out"
          aria-label="Scroll to top"
        >
          <FaArrowUp size={20} />
        </button>
      </div>
    )
  );
};

export default ScrollToTopButton;

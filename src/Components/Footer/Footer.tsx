import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebook,
  faInstagram,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import { faUserShield } from "@fortawesome/free-solid-svg-icons"; // Correct import
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false); // Track scroll

  // Detect scroll to adjust footer size
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50); // Shrink when scrolled more than 50px
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <footer
      className={`fixed bottom-0 left-0 right-0 transition-all duration-[800ms] ease-in-out ${
        isScrolled
          ? "w-[85%] rounded-l-full rounded-r-full mx-auto h-12 bg-white/95 shadow-md"
          : "w-full h-12 bg-white"
      } border-t border-gray-300 z-10`}
      aria-label="Main Footer"
    >
      <div className="flex justify-between items-center h-full px-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-800">
            © 2025 <span className="text-red-600">The Life Savers</span>. All
            rights reserved.
          </span>

          {/* Links to Privacy Policy and Terms */}
          <div className="flex space-x-2">
            {/* You can uncomment and customize these links as needed */}
            {/* <Link
              to="/terms-and-conditions"
              className="text-sm text-gray-800 underline hover:text-red-500 transition"
            >
              Terms & Conditions
            </Link>
            <span>|</span> */}
            {/* <Link
              to="/privacy-policy"
              className="text-sm text-gray-800 underline hover:text-red-500 transition"
            >
              Privacy Policy
            </Link> */}
          </div>
        </div>

        <div className="flex space-x-4">
          {/* Internal Route for Privacy Policy (use Link for React Router) */}
          <Link
            to="/privacy-policy"
            className="transform transition-transform duration-300 hover:scale-125"
            aria-label="Privacy Policy"
          >
            <FontAwesomeIcon
              icon={faUserShield}
              className="h-6 w-6 text-gray-800 hover:text-red-500"
            />
          </Link>

          {/* External Links (use 'a' tag for external URLs) */}
          <a
            href="https://www.facebook.com/thelifesavers.official?mibextid=LQQJ4d"
            target="_blank"
            rel="noopener noreferrer"
            className="transform transition-transform duration-300 hover:scale-125"
            aria-label="Facebook"
          >
            <FontAwesomeIcon
              icon={faFacebook}
              className="text-gray-800 hover:text-red-500 h-6 w-6"
            />
          </a>

          <a
            href="https://youtube.com/@thelifesavers.officials?si=MuZrUQREdDAPXoGY"
            target="_blank"
            rel="noopener noreferrer"
            className="transform transition-transform duration-300 hover:scale-125"
            aria-label="YouTube"
          >
            <FontAwesomeIcon
              icon={faYoutube}
              className="text-gray-800 hover:text-red-500 h-6 w-6"
            />
          </a>

          <a
            href="https://www.instagram.com/thelifesavers.official/profilecard/?igsh=aGhncG5id2c1cmxh"
            target="_blank"
            rel="noopener noreferrer"
            className="transform transition-transform duration-300 hover:scale-125"
            aria-label="Instagram"
          >
            <FontAwesomeIcon
              icon={faInstagram}
              className="text-gray-800 hover:text-red-500 h-6 w-6"
            />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

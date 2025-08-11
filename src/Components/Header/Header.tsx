import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSignOutAlt,
  FaInfoCircle,
  FaTimes,
  FaBars,
  FaBook,
  FaFileContract,
  FaShieldAlt,
  FaSignInAlt,
  FaSearch,
  FaEnvelope,
  FaTint,
} from "react-icons/fa";
import toast from "react-hot-toast";
import { useAuth } from "../../Context/AuthContext";
import Notification from "../Notification/Notification";
import { Device } from "@capacitor/device";
import { useLocation } from "react-router-dom";

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false); // Mobile sidebar state
  const [isScrolled, setIsScrolled] = useState(false);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const mobileSidebarRef = useRef<HTMLDivElement>(null);
  const [platform, setPlatform] = useState("web");

  // Toggle the main sidebar
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  // Toggle the mobile sidebar
  const toggleMobileSidebar = () => setIsMobileSidebarOpen((prev) => !prev);

  useEffect(() => {
    const detectPlatform = async () => {
      const info = await Device.getInfo();
      setPlatform(info.platform);
      console.log(`Detected Platform: ${info.platform}`);
    };
    detectPlatform();
  }, []);

  // Detect scroll to adjust header state
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle clicking outside to close both sidebars
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setIsSidebarOpen(false);
      }
      if (
        mobileSidebarRef.current &&
        !mobileSidebarRef.current.contains(event.target as Node)
      ) {
        setIsMobileSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavigate = (path: string) => {
    setIsSidebarOpen(false);
    setIsMobileSidebarOpen(false); // Close both sidebars after navigation
    navigate(path);
  };

  const handleLogout = () => {
    toast.success("👋 You've successfully logged out. See you again soon!");
    setIsSidebarOpen(false);
    logout();
    navigate("/login");
  };

  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  return (
    <header>
      {/* <div
        className={`fixed top-0 left-0 right-0 transition-all duration-[800ms] ease-in-out shadow-md ${
          isScrolled
            ? "w-[85%] rounded-l-full rounded-r-full mx-auto bg-white/95 shadow-md"
            : "w-full bg-white"
        } h-12 text-gray-800 z-10`}
      > */}
      <div
        className={`fixed top-0 left-0 right-0 transition-all duration-[800ms] ease-in-out shadow-md ${
          isScrolled
            ? "w-[85%] rounded-l-full rounded-r-full mx-auto bg-white/95 shadow-md"
            : "w-full bg-white"
        } h-12 text-gray-800 z-10`}
        style={{
          marginTop: platform === "android" ? "26px" : "",
        }}
      >
        <div className="flex justify-between items-center h-full px-4">
          {/* Logo and Title */}
          <div className="flex items-center">
            <img
              src="https://res.cloudinary.com/dqm7wf4zi/image/upload/v1734541684/thelifesaverslogo_odohxz.png"
              alt="The Life Savers Logo"
              className={`transition-transform duration-500 ${
                isScrolled ? "h-7 w-7" : "h-12 w-16"
              }`}
              loading="eager" // This helps to prioritize loading the image as soon as possible
            />

            <div className="relative ml-2">
              <span
                className={`font-bold transition-all duration-500 ${
                  isScrolled ? "text-lg" : "text-xl"
                }`}
              >
                The Life Savers Labs
              </span>
              {/* <span
                className="absolute right-0 text-xs font-medium text-red-500"
                style={{ transform: "translateY(1.3rem)" }}
              >
                Beta
              </span> */}
            </div>
          </div>

          {/* Right-side Buttons */}
          <div className="flex items-center space-x-4">
            <Notification />

            {/* Hamburger Menu for Mobile Sidebar (visible for all screen sizes when user is not authenticated) */}
            {!isAuthenticated && (
              <button className="text-gray-800" onClick={toggleMobileSidebar}>
                <FaBars size={24} />
              </button>
            )}

            {/* User Avatar and Name to Open Sidebar */}
            {isAuthenticated && user && (
              <div
                className="flex items-center cursor-pointer"
                onClick={toggleSidebar}
              >
                <span className="hidden md:inline text-sm font-medium mr-2 text-gray-800">
                  {`${user.firstName} ${user.lastName}`}
                </span>

                <div className="h-8 w-8 flex items-center justify-center bg-gray-800 text-white rounded-full">
                  {user.firstName.charAt(0)}
                  {user.lastName.charAt(0)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Sidebar Section (only for authenticated users) */}
      {isAuthenticated && (
        <div
          ref={sidebarRef}
          className={`fixed top-0 right-0 h-full bg-white shadow-lg z-20 transform transition-transform duration-500 ${
            isSidebarOpen ? "translate-x-0" : "translate-x-full"
          }`}
          style={{
            width: "250px",
            borderRadius: "15px 0 0 15px",
          }}
        >
          <div className="p-4">
            {/* Close Button */}
            <div className="flex justify-end">
              <button
                className="text-black hover:bg-red-600 hover:text-white p-2 rounded-full transition duration-300"
                onClick={toggleSidebar}
              >
                <FaTimes size={24} />
              </button>
            </div>

            {/* Heading */}
            <h2 className="text-black text-2xl font-bold mb-6 tracking-wider">
              Explore More
            </h2>

            {[
              {
                to: "/dashboard",
                icon: <FaSearch className="mr-2 text-xl" />,
                label: "Find Donors",
              },
              {
                to: "/blogs",
                icon: <FaBook className="mr-2 text-xl" />,
                label: "Blogs",
              },
              {
                to: "/contact-us",
                icon: <FaEnvelope className="mr-2 text-xl" />,
                label: "Contact Us",
              },
              {
                to: "/about-us",
                icon: <FaInfoCircle className="mr-2 text-xl" />,
                label: "About Us",
              },
              {
                to: "/learn-about-donation",
                icon: <FaTint className="mr-2 text-xl" />,
                label: "Learn About Donation",
              },
              {
                to: "/terms-and-conditions",
                icon: <FaFileContract className="mr-2 text-xl" />,
                label: "Terms and Conditions",
              },
              {
                to: "/privacy-policy",
                icon: <FaShieldAlt className="mr-2 text-xl" />,
                label: "Privacy Policy",
              },
            ].map(({ to, icon, label }) => (
              <button
                key={to}
                className={`w-full text-left px-4 py-2 text-sm flex items-center mb-2 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 ${
                  isActive(to)
                    ? "bg-red-600 text-white font-semibold"
                    : "text-black hover:bg-red-600 hover:text-white"
                }`}
                onClick={() => handleNavigate(to)}
              >
                {icon}
                {label}
              </button>
            ))}

            <button
              className="w-full text-left px-4 py-2 text-sm text-black hover:bg-red-600 hover:text-white flex items-center rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
              onClick={handleLogout}
            >
              <FaSignOutAlt className="mr-2 text-xl" /> Logout
            </button>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Section (visible for all screen sizes if not authenticated) */}
      {!isAuthenticated && (
        <div
          ref={mobileSidebarRef}
          className={`fixed top-0 right-0 h-full bg-white shadow-lg z-20 transform transition-transform duration-500 ${
            isMobileSidebarOpen ? "translate-x-0" : "translate-x-full"
          }`}
          style={{
            width: "250px",
            borderRadius: "15px 0 0 15px",
          }}
        >
          <div className="p-4">
            <div className="flex justify-end">
              <button
                className="text-black hover:bg-red-600 hover:text-white p-2 rounded-full transition duration-300"
                onClick={toggleMobileSidebar}
              >
                <FaTimes size={24} />
              </button>
            </div>

            <h2 className="text-black text-2xl font-bold mb-6 tracking-wider">
              Quick Access
            </h2>

            {[
              {
                to: "/login",
                icon: <FaSignInAlt className="mr-2 text-xl" />,
                label: "Login",
              },
              {
                to: "/learn-about-donation",
                icon: <FaTint className="mr-2 text-xl" />,
                label: "Learn About Donation",
              },
              {
                to: "/blogs",
                icon: <FaBook className="mr-2 text-xl" />,
                label: "Blogs",
              },
              {
                to: "/about-us",
                icon: <FaInfoCircle className="mr-2 text-xl" />,
                label: "About Us",
              },
              {
                to: "/contact-us",
                icon: <FaEnvelope className="mr-2 text-xl" />,
                label: "Contact Us",
              },
              {
                to: "/terms-and-conditions",
                icon: <FaFileContract className="mr-2 text-xl" />,
                label: "Terms and Conditions",
              },
              {
                to: "/privacy-policy",
                icon: <FaShieldAlt className="mr-2 text-xl" />,
                label: "Privacy Policy",
              },
            ].map(({ to, icon, label }) => (
              <button
                key={to}
                onClick={() => handleNavigate(to)}
                className={`w-full text-left px-4 py-2 text-sm flex items-center mb-2 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 ${
                  location.pathname === to
                    ? "bg-red-600 text-white"
                    : "text-black hover:bg-red-600 hover:text-white"
                }`}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Overlay for Mobile Sidebar */}
      {isMobileSidebarOpen && !isAuthenticated && (
        <div className="fixed inset-0 z-10" onClick={toggleMobileSidebar}></div>
      )}
    </header>
  );
};

export default Header;

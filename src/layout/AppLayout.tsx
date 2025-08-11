import { useState, useEffect, useMemo } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AuthProvider } from "../Context/AuthContext";
import Header from "../Components/Header/Header";
import Footer from "../Components/Footer/Footer";
import ContactIcon from "../Components/ContactIcon/ContactIcon";
import ScrollToTopButton from "../Components/ScrollToTopButton/ScrollToTopButton";
import SplashScreen from "../Components/SplashScreen/SplashScreen";
import ErrorBoundary from "../Components/ErrorBoundary";
import DisclaimerModal from "../Components/Models/DisclaimerModel";
import { HelmetProvider } from "react-helmet-async";
import { HelmetConfig } from "../seo/HelmetConfig";

const AppLayout = () => {
  const location = useLocation();
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [isDisclaimerVisible, setIsDisclaimerVisible] = useState(false);

  useEffect(() => {
    const splashShown = sessionStorage.getItem("splashShown");
    const disclaimerShown = sessionStorage.getItem("disclaimerShown");

    if (!splashShown && location.pathname !== "/") {
      const timer = setTimeout(() => {
        setIsSplashVisible(false);
        sessionStorage.setItem("splashShown", "true");

        if (!disclaimerShown) {
          setIsDisclaimerVisible(true);
        }
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      setIsSplashVisible(false);

      if (!disclaimerShown && location.pathname !== "/") {
        setIsDisclaimerVisible(true);
      }
    }
  }, []);

  const handleDisclaimerClose = () => {
    setIsDisclaimerVisible(false);
    sessionStorage.setItem("disclaimerShown", "true");
  };

  const memoizedHeader = useMemo(() => <Header />, []);
  const memoizedFooter = useMemo(() => <Footer />, []);
  const memoizedContactIcon = useMemo(() => <ContactIcon />, []);
  const memoizedScrollToTopButton = useMemo(() => <ScrollToTopButton />, []);

  return (
    <HelmetProvider>
      <AuthProvider>
        <ErrorBoundary>
          <HelmetConfig />
          <div className="flex flex-col min-h-screen">
            {isSplashVisible ? (
              <SplashScreen />
            ) : (
              <>
                {/* Show the disclaimer modal if needed */}
                {isDisclaimerVisible && (
                  <DisclaimerModal
                    isOpen={isDisclaimerVisible}
                    onClose={handleDisclaimerClose}
                  />
                )}

                {/* Render the rest of the app with the content still visible in the background */}
                <div
                  className={`flex-1 ${
                    isDisclaimerVisible ? "opacity-50" : "opacity-100"
                  }`}
                >
                  {memoizedHeader}
                  <main className="flex-1">
                    <Outlet />
                  </main>
                  {memoizedContactIcon}
                  {memoizedScrollToTopButton}
                  {memoizedFooter}
                </div>
              </>
            )}
          </div>
        </ErrorBoundary>
      </AuthProvider>
    </HelmetProvider>
  );
};

export default AppLayout;

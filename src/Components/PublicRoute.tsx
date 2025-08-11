import React, { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

// Add props type to accept children
interface PublicRouteProps {
  children?: ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Whitelist certain public pages that authenticated users can access
  const allowedPublicPaths = ["/about-us", "/terms-and-conditions", "/blogs", "/privacy-policy", "/contact-us", "/blogs/:title", "/learn-about-donation"];

    // Check if the path is a blog post, using '/blogs/' as the prefix
    const isBlogPost = location.pathname.startsWith("/blogs/");


  // If the user is authenticated and not on a whitelisted page or a blog post page, redirect to admin-dashboard
  if (isAuthenticated && !allowedPublicPaths.includes(location.pathname) && !isBlogPost) {
    return <Navigate to="/admin-dashboard" />;
  }

  // Render children or outlet if the route is allowed
  return children ? <>{children}</> : <Outlet />;
};

export default PublicRoute;



// src/seo/metaTags.ts

type MetaData = {
  title: string;
  description: string;
  canonical: string;
  keywords?: string;
};

export const metaTags: Record<string, MetaData> = {
  "/": {
    title: "The Life Savers | Donate Blood | Together for a Healthier Tomorrow",
    description: "The Life Savers connects blood donors with those in urgent need. Join our life-saving community today.",
    canonical: "https://thelifesavers.in/",
    keywords: "donate blood, blood donors India, urgent blood need, life savers, blood donation app",
  },
  "/login": {
    title: "Login | The Life Savers",
    description: "Log in to your Life Savers account and access donor features, recipient requests, and more.",
    canonical: "https://thelifesavers.in/login",
  },
  "/forgot-password": {
    title: "Reset Password | The Life Savers",
    description: "Forgot your password? Reset it securely to continue saving lives with The Life Savers.",
    canonical: "https://thelifesavers.in/forgot-password",
  },
  "/admin-dashboard": {
    title: "Dashboard | The Life Savers",
    description: "Access your dashboard to view your donation stats, notifications, and urgent blood requests.",
    canonical: "https://thelifesavers.in/admin-dashboard",
  },
  "/profile": {
    title: "My Profile | The Life Savers",
    description: "Manage your donor profile and update your availability to help those in need.",
    canonical: "https://thelifesavers.in/profile",
  },
  "/reviews": {
    title: "User Reviews | The Life Savers",
    description: "Read testimonials and experiences from real donors and recipients who’ve used The Life Savers.",
    canonical: "https://thelifesavers.in/reviews",
  },
  "/about-us": {
    title: "About Us | The Life Savers",
    description: "Learn about the mission and people behind The Life Savers — uniting communities to save lives.",
    canonical: "https://thelifesavers.in/about-us",
  },
  "/terms-and-conditions": {
    title: "Terms & Conditions | The Life Savers",
    description: "Understand the legal terms and usage guidelines for using The Life Savers platform.",
    canonical: "https://thelifesavers.in/terms-and-conditions",
  },
  "/privacy-policy": {
    title: "Privacy Policy | The Life Savers",
    description: "We value your privacy. Read how The Life Savers handles user data and protection.",
    canonical: "https://thelifesavers.in/privacy-policy",
  },
  "/blogs": {
    title: "Blood Donation Blogs | The Life Savers",
    description: "Explore blogs about blood donation awareness, real-life stories, health tips, and more.",
    canonical: "https://thelifesavers.in/blogs",
  },
  "/contact-us": {
    title: "Contact Us | The Life Savers",
    description: "Need help or have questions? Contact The Life Savers team — we’re here to support you.",
    canonical: "https://thelifesavers.in/contact-us",
  },
  "/learn-about-donation": {
    title: "Learn About Donation | The Life Savers",
    description: "Discover the process and importance of blood donation. Get answers to common questions.",
    canonical: "https://thelifesavers.in/learn-about-donation",
  },
};

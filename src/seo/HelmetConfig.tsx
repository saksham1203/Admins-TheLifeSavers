import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { metaTags } from "./metaTags";

export const HelmetConfig = () => {
  const { pathname } = useLocation();

  // ✅ Normalize trailing slash
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";

  // ✅ Fallback meta
  const meta = metaTags[normalizedPath] ?? {
    title: "The Life Savers",
    description: "Join The Life Savers to donate blood and save lives.",
    canonical: `https://thelifesavers.in${normalizedPath}`,
  };

  // ✅ Log if metadata missing
  if (!metaTags[normalizedPath]) {
    console.warn(`⚠️ No SEO metadata found for route: ${normalizedPath}`);
  }

  // ✅ JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "The Life Savers",
    url: "https://thelifesavers.in",
    logo: "https://thelifesavers.in/thelifesaverslogo.png",
    sameAs: [
      "https://www.facebook.com/thelifesavers.in",
      "https://www.instagram.com/thelifesavers.in"
    ],
    description: "The Life Savers connects blood donors with recipients in need across India. Join a life-saving community now."
  };

  return (
    <Helmet>
      {/* Title & Basic Meta */}
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <link rel="canonical" href={meta.canonical} />
      {meta.keywords && <meta name="keywords" content={meta.keywords} />}

      {/* Open Graph */}
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:url" content={meta.canonical} />
      <meta property="og:image" content="https://thelifesavers.in/thelifesaverslogo.png" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content="https://thelifesavers.in/thelifesaverslogo.png" />

      {/* JSON-LD Schema.org */}
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
};

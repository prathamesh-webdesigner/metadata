import type { Metadata } from "next";
import Script from "next/script";
import { Header } from "@/components/site-header";
import { Footer } from "@/components/site-shell";
import { SITE_URL, BRAND_NAME } from "@/lib/site-seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Free On-Page SEO Analyzer & Website SEO Checker | Metadata", template: "%s | Metadata" },
  description: "Free on-page SEO analyzer to check website titles, meta descriptions, headings, links, images, and technical SEO. Get a clear SEO report in seconds.",
  applicationName: BRAND_NAME,
  openGraph: {
    type: "website",
    siteName: BRAND_NAME,
    title: "Free SEO Analyzer & Website SEO Checker | Metadata",
    description: "Free on-page SEO analyzer to check website titles, meta descriptions, headings, links, images, and technical SEO.",
    url: SITE_URL,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Metadata — Free On-Page SEO Analyzer" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free SEO Analyzer & Website SEO Checker | Metadata",
    description: "Free on-page SEO analyzer for titles, descriptions, headings, links, images, and technical checks.",
    images: ["/opengraph-image"],
  },
  icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: "NivishDigital", url: "https://nivishdigital.com/" },
      { "@type": "WebSite", "@id": `${SITE_URL}/#website`, name: "Metadata", url: SITE_URL, publisher: { "@id": `${SITE_URL}/#organization` } },
    ],
  };
  return <html lang="en"><head>
    <Script async src="https://www.googletagmanager.com/gtm.js?id=GTM-KJJ2C73X" strategy="beforeInteractive" />
    <Script id="google-analytics-init" strategy="beforeInteractive">{`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());`}</Script>
  </head><body><Header />{children}<Footer /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} /></body></html>;
}

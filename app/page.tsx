import type { Metadata } from "next";
import { HomeContent } from "@/components/home-content";
import { StructuredData } from "@/components/structured-data";
import { pageMetadata, SITE_URL } from "@/lib/site-seo";

export const metadata: Metadata = {
  ...pageMetadata(
    "Free On-Page SEO Analyzer & Website SEO Checker",
    "Check any website's meta title, meta description, headings, keywords, internal and external links, image alt text, and technical SEO for free. Get a clear SEO report in seconds.",
    "/",
  ),
  title: { absolute: "Free On-Page SEO Analyzer & Website SEO Checker | Metadata" },
};

export default function HomePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": `${SITE_URL}/#seo-analyzer`,
    name: "Metadata Free On-Page SEO Analyzer",
    url: SITE_URL,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript and an internet connection",
    description: "A free website SEO checker for on-page metadata, headings, links, images, and selected technical SEO signals.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
  return <main><HomeContent /><StructuredData data={structuredData} /></main>;
}

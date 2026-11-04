import type { Metadata } from "next";
import { Suspense } from "react";
import { AnalyzerDashboard } from "@/components/analyzer-dashboard";
import { pageMetadata } from "@/lib/site-seo";

export const metadata: Metadata = {
  ...pageMetadata("Website SEO Analysis Report", "View the results of your Metadata on-page SEO analysis, including meta tags, headings, keywords, links, image alt text, and technical checks.", "/analyzer/"),
  robots: { index: false, follow: false },
};

export default function AnalyzerPage() {
  return <Suspense fallback={<main className="container dashboard-page"><div className="loading-panel"><h1>Loading your report…</h1></div></main>}><AnalyzerDashboard /></Suspense>;
}

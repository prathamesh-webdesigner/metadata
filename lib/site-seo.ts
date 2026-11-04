import type { Metadata } from "next";

export const SITE_URL = "https://metadata.nivishdigital.com";
export const SITE_NAME = "Metadata";
export const BRAND_NAME = "Metadata by NivishDigital";

export function pageMetadata(title: string, description: string, path: string): Metadata {
  const url = new URL(path, SITE_URL).toString();
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: BRAND_NAME,
      title: `${title} | Metadata`,
      description,
      url,
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Metadata — Free On-Page SEO Analyzer" }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Metadata`,
      description,
      images: ["/opengraph-image"],
    },
  };
}

export const siteFaqs = [
  {
    question: "What is an SEO metadata analyzer?",
    answer: "It inspects the HTML a page makes publicly available and summarizes on-page elements like titles, descriptions, headings, links, and image alt text. It is an audit aid, not a search ranking predictor.",
  },
  {
    question: "How can I check my website meta title?",
    answer: "Enter your page address above. Metadata fetches the public HTML and shows its title in the report, along with its character count and practical display guidance.",
  },
  {
    question: "What is an ideal meta description length?",
    answer: "There is no universal fixed length. Search engines may change or truncate snippets; a concise, accurate summary is more useful than targeting a guaranteed character threshold.",
  },
  {
    question: "What are internal and external links?",
    answer: "Internal links point to pages on the same hostname as the analyzed page. External links point to a different hostname. This report does not probe those destinations for broken links.",
  },
  {
    question: "Does this tool check keywords?",
    answer: "It counts recurring words and two- or three-word phrases from visible text where possible. These are content observations, not necessarily your target keywords or Google's ranking keywords.",
  },
  {
    question: "Is this SEO analyzer free?",
    answer: "Yes. No account is required. Usage is rate-limited to help keep the service available.",
  },
  {
    question: "Does the tool store my website data?",
    answer: "Reports are returned to your browser and are not saved to an account. The application does not persist submitted URLs or generated reports. Hosting providers may retain standard request logs.",
  },
  {
    question: "Why was my page not analyzed?",
    answer: "The page may be unavailable, block automated access in robots.txt, require authentication, return non-HTML content, or exceed the request limits. The analyzer will not bypass access restrictions.",
  },
];

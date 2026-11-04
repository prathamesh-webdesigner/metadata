import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-seo";

const pages = [
  { path: "", priority: 1, changeFrequency: "monthly" as const },
  { path: "about-us/", priority: 0.7, changeFrequency: "yearly" as const },
  { path: "contact-us/", priority: 0.6, changeFrequency: "yearly" as const },
  { path: "faq/", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "privacy-policy/", priority: 0.3, changeFrequency: "yearly" as const },
  { path: "terms-and-conditions/", priority: 0.3, changeFrequency: "yearly" as const },
  { path: "disclaimer/", priority: 0.3, changeFrequency: "yearly" as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}/${path}`,
    changeFrequency,
    priority,
  }));
}

export type FindingStatus = "pass" | "warning" | "fail";
export type Priority = "Critical" | "High" | "Medium" | "Low" | "Passed";

export interface Check {
  label: string;
  status: FindingStatus;
  detail: string;
  weight: number;
}

export interface HeadingItem {
  level: number;
  text: string;
}

export interface LinkItem {
  text: string;
  url: string;
  follow: boolean;
  target: string;
  rel: string;
  internal: boolean;
}

export interface ImageItem {
  src: string;
  alt: string | null;
  title: string;
  loading: string;
}

export interface KeywordItem {
  phrase: string;
  count: number;
  density: number;
}

export interface Recommendation {
  priority: Priority;
  title: string;
  issue: string;
  action: string;
}

export interface SeoReport {
  analyzedUrl: string;
  finalUrl: string;
  analyzedAt: string;
  response: { status: number; durationMs: number; bytes: number; redirects: string[] };
  score: number;
  checks: Check[];
  meta: {
    title: string;
    description: string;
    keywords: string;
    canonical: string;
    robots: string;
    viewport: string;
    charset: string;
    language: string;
    author: string;
    generator: string;
    themeColor: string;
  };
  headings: HeadingItem[];
  keywords: KeywordItem[];
  links: LinkItem[];
  images: ImageItem[];
  social: Record<string, string>;
  technical: {
    https: boolean;
    xRobotsTag: string;
    sitemap: { status: number | null; available: boolean };
    robotsTxt: { status: number | null; available: boolean; blocked: boolean };
    structuredData: number;
    favicon: { url: string; status: number | null; available: boolean };
  };
  recommendations: Recommendation[];
  contentWords: number;
}

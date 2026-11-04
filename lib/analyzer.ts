import * as cheerio from "cheerio";
import type { Check, KeywordItem, Recommendation, SeoReport } from "@/types/seo";

const stopWords = new Set(
  "a an and are as at be been but by can could did do does for from had has have he her here hers him his how i if in into is it its may me might more most my no not of on one or our out over she should so some such than that the their them then there these they this those through to too under up us was we were what when where which who will with would you your".split(" "),
);
const MAX_HTML_BYTES = 2 * 1024 * 1024;
const MAX_TABLE_ITEMS = 500;

function clean(value: string | undefined | null, max = 500): string {
  return (value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

function statusCheck(label: string, weight: number, status: Check["status"], detail: string): Check {
  return { label, weight, status, detail };
}

function buildKeywords(text: string, wordCount: number): KeywordItem[] {
  const words = text.toLowerCase().match(/[a-z0-9][a-z0-9'-]{1,}/g) ?? [];
  const results: KeywordItem[] = [];
  for (const size of [1, 2, 3]) {
    const counts = new Map<string, number>();
    for (let i = 0; i <= words.length - size; i += 1) {
      const phraseWords = words.slice(i, i + size);
      if (phraseWords.some((word) => stopWords.has(word) || /^\d+$/.test(word))) continue;
      const phrase = phraseWords.join(" ");
      counts.set(phrase, (counts.get(phrase) ?? 0) + 1);
    }
    for (const [phrase, count] of counts) {
      if (count < (size === 1 ? 2 : 2)) continue;
      results.push({ phrase, count, density: wordCount ? Number(((count * size * 100) / wordCount).toFixed(2)) : 0 });
    }
  }
  return results.sort((a, b) => b.count - a.count || a.phrase.localeCompare(b.phrase)).slice(0, 100);
}

function recommendations(checks: Check[], data: {
  images: SeoReport["images"];
  h1Count: number;
  headings: SeoReport["headings"];
  links: SeoReport["links"];
  social: Record<string, string>;
  structuredData: number;
}): Recommendation[] {
  const list: Recommendation[] = [];
  const add = (priority: Recommendation["priority"], title: string, issue: string, action: string) =>
    list.push({ priority, title, issue, action });
  const check = (label: string) => checks.find((item) => item.label === label);
  if (check("Page title")?.status !== "pass") add("High", "Review the page title", check("Page title")?.detail ?? "The title needs attention.", "Write a unique, descriptive title that accurately represents this page. Keep it concise; search results may truncate titles differently.");
  if (check("Meta description")?.status !== "pass") add("Medium", "Add or refine the meta description", check("Meta description")?.detail ?? "A description was not found.", "Summarize the page clearly and invite a click. Treat length as a practical display guideline, not a ranking guarantee.");
  if (data.h1Count === 0) add("High", "Add a main page heading", "No H1 heading was found.", "Add one descriptive H1 that tells visitors what this page is about.");
  if (data.h1Count > 1) add("Medium", "Review multiple H1 headings", `Found ${data.h1Count} H1 headings. Multiple H1s can be valid HTML, but may make the page outline less clear.`, "Check that the page has one clear primary heading and that other sections use appropriate levels.");
  if (check("Canonical URL")?.status !== "pass") add("Medium", "Set a canonical URL", "A canonical link was not found or does not resolve to an absolute URL.", "Add a canonical link pointing to the preferred version of this page.");
  const missingAlt = data.images.filter((image) => image.alt === null || image.alt.trim() === "").length;
  if (missingAlt) add("Medium", "Improve image alternative text", `${missingAlt} of ${data.images.length} images have missing or empty alt text.`, "Provide concise, useful alt text for informative images. Use empty alt text only for decorative images.");
  const emptyHeadings = data.headings.filter((heading) => !heading.text).length;
  if (emptyHeadings) add("Low", "Add text to empty headings", `Found ${emptyHeadings} heading elements without readable text.`, "Give headings meaningful text, or use a non-heading element when the element is only for styling.");
  const sequence = data.headings.map((item) => item.level);
  if (sequence.some((level, index) => index > 0 && level > sequence[index - 1] + 1)) add("Low", "Review heading hierarchy", "One or more heading levels were skipped in document order.", "Use headings in a logical nested order so people and assistive technologies can follow the page structure.");
  if (check("Mobile viewport")?.status !== "pass") add("High", "Add a mobile viewport", "No viewport meta tag was detected.", "Add a responsive viewport declaration so the page uses the device width.");
  for (const key of ["og:title", "og:description", "og:image"]) {
    if (!data.social[key]) add("Low", `Add ${key} social metadata`, `The ${key} property was not detected.`, "Set a page-appropriate Open Graph value to improve how the page may appear when shared.");
  }
  if (!data.structuredData) add("Low", "Consider structured data", "No JSON-LD script was detected in the fetched HTML.", "Add valid structured data only when it accurately describes visible page content and is appropriate for the page.");
  if (!data.links.some((link) => link.internal)) add("Low", "Review internal linking", "No internal anchor links were detected in the page HTML.", "Link to relevant pages on the same site where it helps visitors navigate.");
  if (!list.length) add("Passed", "No major checks need attention", "The checks in this report did not find a priority issue.", "Continue reviewing your content and search appearance; this automated report is not a ranking prediction.");
  return list;
}

export function analyzeHtml(input: {
  html: string;
  analyzedUrl: string;
  finalUrl: string;
  status: number;
  durationMs: number;
  bytes: number;
  redirects: string[];
  headers: Headers;
  sitemap: SeoReport["technical"]["sitemap"];
  robotsTxt: SeoReport["technical"]["robotsTxt"];
}): SeoReport {
  if (Buffer.byteLength(input.html, "utf8") > MAX_HTML_BYTES) throw new Error("The webpage is larger than the allowed analysis limit.");
  const $ = cheerio.load(input.html);
  const pageUrl = new URL(input.finalUrl);
  const metaContent = (selector: string) => clean($(selector).first().attr("content"), 1000);
  const title = clean($("title").first().text(), 300);
  const description = metaContent('meta[name="description" i]');
  const canonicalHref = clean($('link[rel~="canonical" i]').first().attr("href"), 1000);
  let canonical = "";
  try { canonical = canonicalHref ? new URL(canonicalHref, pageUrl).href : ""; } catch { canonical = canonicalHref; }
  const language = clean($("html").attr("lang"), 100);
  const headings = $("h1,h2,h3,h4,h5,h6").toArray().slice(0, MAX_TABLE_ITEMS).map((el) => ({
    level: Number(el.tagName.slice(1)),
    text: clean($(el).text(), 500),
  }));
  const h1Count = headings.filter((heading) => heading.level === 1).length;
  const hierarchyProblem = headings.some((heading, index) => index > 0 && heading.level > headings[index - 1].level + 1);
  const links = $("a[href]").toArray().slice(0, MAX_TABLE_ITEMS).flatMap((element) => {
    const href = clean($(element).attr("href"), 2000);
    try {
      const resolved = new URL(href, pageUrl);
      if (!["http:", "https:"].includes(resolved.protocol)) return [];
      const rel = clean($(element).attr("rel"), 200);
      return [{
        text: clean($(element).text() || $(element).attr("aria-label"), 300),
        url: resolved.href,
        follow: !rel.toLowerCase().split(/\s+/).some((value) => ["nofollow", "sponsored", "ugc"].includes(value)),
        target: clean($(element).attr("target"), 40),
        rel,
        internal: resolved.hostname.toLowerCase() === pageUrl.hostname.toLowerCase(),
      }];
    } catch { return []; }
  });
  const images = $("img").toArray().slice(0, MAX_TABLE_ITEMS).map((element) => {
    const src = clean($(element).attr("src") || $(element).attr("data-src") || $(element).attr("srcset")?.split(",")[0]?.trim().split(/\s+/)[0], 2000);
    let resolvedSrc = src;
    try { if (src) resolvedSrc = new URL(src, pageUrl).href; } catch { /* Keep the source as found for review. */ }
    return {
      src: resolvedSrc,
      alt: $(element).attr("alt") === undefined ? null : clean($(element).attr("alt"), 500),
      title: clean($(element).attr("title"), 300),
      loading: clean($(element).attr("loading"), 50),
    };
  });
  const social: Record<string, string> = {};
  const socialKeys = ["og:title", "og:description", "og:image", "og:url", "og:type", "og:site_name", "twitter:card", "twitter:title", "twitter:description", "twitter:image"];
  for (const key of socialKeys) social[key] = metaContent(`meta[property="${key}" i],meta[name="${key}" i]`);

  const textRoot = $("body").clone();
  textRoot.find("script,style,noscript,svg,nav,footer,header,form,iframe,canvas,template").remove();
  const text = clean(textRoot.text(), 200000);
  const wordCount = text.match(/\b[\p{L}\p{N}'-]+\b/gu)?.length ?? 0;
  const keywords = buildKeywords(text, wordCount);
  const titleStatus: Check["status"] = !title ? "fail" : title.length < 20 || title.length > 70 ? "warning" : "pass";
  const descriptionStatus: Check["status"] = !description ? "fail" : description.length < 50 || description.length > 180 ? "warning" : "pass";
  const checks: Check[] = [
    statusCheck("Page title", 12, titleStatus, title ? `${title.length} characters. A concise, descriptive title is useful; display can vary.` : "No title element was found."),
    statusCheck("Meta description", 12, descriptionStatus, description ? `${description.length} characters. Practical display guidance is roughly 50–160 characters; snippets can vary.` : "No meta description was found."),
    statusCheck("H1 heading", 10, h1Count === 1 ? "pass" : h1Count === 0 ? "fail" : "warning", `${h1Count} H1 heading${h1Count === 1 ? "" : "s"} found.`),
    statusCheck("Canonical URL", 7, canonical ? "pass" : "warning", canonical || "No canonical URL was found."),
    statusCheck("Mobile viewport", 7, metaContent('meta[name="viewport" i]') ? "pass" : "fail", metaContent('meta[name="viewport" i]') || "No viewport meta tag found."),
    statusCheck("HTML language", 5, language ? "pass" : "warning", language || "The HTML lang attribute was not found."),
    statusCheck("HTTPS", 8, pageUrl.protocol === "https:" ? "pass" : "fail", pageUrl.protocol === "https:" ? "The final page URL uses HTTPS." : "The final page URL does not use HTTPS."),
    statusCheck("Image alt text", 8, images.length === 0 || images.every((image) => image.alt !== null && image.alt.length > 0) ? "pass" : images.some((image) => image.alt === null) ? "warning" : "warning", images.length ? `${images.filter((image) => image.alt?.length).length} of ${images.length} images have non-empty alt text.` : "No images found in the fetched HTML."),
    statusCheck("Heading structure", 8, headings.length && !headings.some((h) => !h.text) && !hierarchyProblem ? "pass" : "warning", headings.length ? `${headings.length} headings found${hierarchyProblem ? "; heading levels may skip a level" : ""}${headings.some((h) => !h.text) ? "; empty heading text found" : ""}.` : "No headings found."),
    statusCheck("Open Graph", 6, social["og:title"] && social["og:description"] ? "pass" : "warning", social["og:title"] && social["og:description"] ? "Open Graph title and description are present." : "Open Graph title or description is missing."),
    statusCheck("Robots directives", 5, metaContent('meta[name="robots" i]') ? "pass" : "warning", metaContent('meta[name="robots" i]') || "No robots meta directive found (the default behavior is generally index, follow)."),
    statusCheck("Page content", 5, wordCount >= 100 ? "pass" : wordCount > 0 ? "warning" : "fail", `${wordCount} readable words were extracted from the page body.`),
    statusCheck("Internal links", 4, links.some((link) => link.internal) ? "pass" : "warning", `${links.filter((link) => link.internal).length} internal anchor links found.`),
    statusCheck("Structured data", 3, $('script[type="application/ld+json" i]').length ? "pass" : "warning", `${$('script[type="application/ld+json" i]').length} JSON-LD script(s) detected in HTML.`),
  ];
  const earned = checks.reduce((sum, check) => sum + (check.status === "pass" ? check.weight : check.status === "warning" ? check.weight * 0.5 : 0), 0);
  const total = checks.reduce((sum, check) => sum + check.weight, 0);
  const structuredData = $('script[type="application/ld+json" i]').length;
  const recommendationsList = recommendations(checks, { images, h1Count, headings, links, social, structuredData });
  let favicon = "";
  const faviconHref = clean($('link[rel~="icon" i]').first().attr("href"), 1000);
  try {
    const resolved = faviconHref ? new URL(faviconHref, pageUrl) : new URL("/favicon.ico", pageUrl);
    favicon = ["http:", "https:"].includes(resolved.protocol) ? resolved.href : new URL("/favicon.ico", pageUrl).href;
  } catch { favicon = new URL("/favicon.ico", pageUrl).href; }
  return {
    analyzedUrl: input.analyzedUrl,
    finalUrl: input.finalUrl,
    analyzedAt: new Date().toISOString(),
    response: { status: input.status, durationMs: input.durationMs, bytes: input.bytes, redirects: input.redirects },
    score: Math.round((earned / total) * 100),
    checks,
    meta: {
      title,
      description,
      keywords: metaContent('meta[name="keywords" i]'),
      canonical,
      robots: metaContent('meta[name="robots" i]'),
      viewport: metaContent('meta[name="viewport" i]'),
      charset: clean($("meta[charset]").first().attr("charset") || $('meta[http-equiv="content-type" i]').attr("content"), 100),
      language,
      author: metaContent('meta[name="author" i]'),
      generator: metaContent('meta[name="generator" i]'),
      themeColor: metaContent('meta[name="theme-color" i]'),
    },
    headings,
    keywords,
    links,
    images,
    social,
    technical: {
      https: pageUrl.protocol === "https:",
      xRobotsTag: clean(input.headers.get("x-robots-tag"), 500),
      sitemap: input.sitemap,
      robotsTxt: input.robotsTxt,
      structuredData,
      favicon: { url: favicon, status: null, available: false },
    },
    recommendations: recommendationsList,
    contentWords: wordCount,
  };
}

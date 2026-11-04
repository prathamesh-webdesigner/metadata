import { NextRequest, NextResponse } from "next/server";
import { analyzeHtml } from "@/lib/analyzer";
import { FetchProblem, safeGet, validateInputUrl } from "@/lib/safe-fetch";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const rateBuckets = new Map<string, { startedAt: number; count: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 12;

function robotsPatternMatches(rule: string, value: string): boolean {
  const anchored = rule.endsWith("$");
  const pattern = anchored ? rule.slice(0, -1) : rule;
  let patternIndex = 0;
  let valueIndex = 0;
  let starIndex = -1;
  let retryIndex = 0;
  while (patternIndex < pattern.length && valueIndex < value.length) {
    if (pattern[patternIndex] === value[valueIndex]) {
      patternIndex += 1;
      valueIndex += 1;
    } else if (pattern[patternIndex] === "*") {
      starIndex = patternIndex;
      retryIndex = valueIndex;
      patternIndex += 1;
    } else if (starIndex !== -1) {
      patternIndex = starIndex + 1;
      retryIndex += 1;
      valueIndex = retryIndex;
    } else {
      return false;
    }
  }
  while (pattern[patternIndex] === "*") patternIndex += 1;
  return patternIndex === pattern.length && (!anchored || valueIndex === value.length);
}

function takeRateLimit(key: string): boolean {
  const now = Date.now();
  const previous = rateBuckets.get(key);
  if (!previous || now - previous.startedAt >= WINDOW_MS) {
    rateBuckets.set(key, { startedAt: now, count: 1 });
    if (rateBuckets.size > 2000) {
      for (const [bucketKey, value] of rateBuckets) if (now - value.startedAt >= WINDOW_MS) rateBuckets.delete(bucketKey);
    }
    return true;
  }
  if (previous.count >= LIMIT) return false;
  previous.count += 1;
  return true;
}

function robotsAllows(contents: string, pathname: string): boolean {
  const groups: { agents: string[]; rules: { allow: boolean; path: string }[] }[] = [];
  let current: { agents: string[]; rules: { allow: boolean; path: string }[] } | null = null;
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.split("#", 1)[0].trim();
    const separator = line.indexOf(":");
    if (separator < 0) continue;
    const name = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();
    if (name === "user-agent") {
      if (!current || current.rules.length) {
        current = { agents: [], rules: [] };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
    } else if ((name === "allow" || name === "disallow") && current && value) {
      current.rules.push({ allow: name === "allow", path: value });
    }
  }
  const specific = groups.filter((group) => group.agents.includes("metadataseoanalyzer"));
  const relevant = specific.length ? specific : groups.filter((group) => group.agents.includes("*"));
  const rules = relevant.flatMap((group) => group.rules).filter((rule) => {
    return robotsPatternMatches(rule.path, pathname);
  });
  rules.sort((a, b) => b.path.replace(/[*$]/g, "").length - a.path.replace(/[*$]/g, "").length || Number(b.allow) - Number(a.allow));
  return rules[0]?.allow ?? true;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") || "unknown";
  if (!takeRateLimit(ip)) return NextResponse.json({ error: "Analysis limit reached. Please try again in a few minutes." }, { status: 429 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Send a valid JSON request with a URL." }, { status: 400 }); }
  if (!body || typeof body !== "object" || !("url" in body) || typeof body.url !== "string" || body.url.length > 2048) {
    return NextResponse.json({ error: "Provide a website URL under 2,048 characters." }, { status: 400 });
  }

  const startedAt = performance.now();
  try {
    const requestedUrl = validateInputUrl(body.url);
    const robotsUrl = new URL("/robots.txt", requestedUrl.origin);
    const robotsResponse = await safeGet(robotsUrl.href, 128 * 1024);
    const robotsAvailable = robotsResponse.status >= 200 && robotsResponse.status < 300;
    if (robotsResponse.status === 401 || robotsResponse.status === 403 || robotsResponse.status >= 500) {
      return NextResponse.json({ error: "The website's robots.txt could not be read safely, so analysis was stopped." }, { status: 403 });
    }
    const robotsBody = robotsAvailable ? robotsResponse.body.toString("utf8") : "";
    if (robotsAvailable && !robotsAllows(robotsBody, requestedUrl.pathname)) {
      return NextResponse.json({ error: "This website's robots.txt disallows automated analysis of this URL." }, { status: 403 });
    }
    const page = await safeGet(requestedUrl.href);
    if (page.status < 200 || page.status >= 400) {
      return NextResponse.json({ error: `The website responded with HTTP ${page.status}. The page could not be analyzed.` }, { status: 502 });
    }
    const contentType = String(page.headers["content-type"] ?? "").toLowerCase();
    if (contentType && !contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
      return NextResponse.json({ error: "The URL did not return an HTML webpage that can be analyzed." }, { status: 415 });
    }

    const origin = page.url.origin;
    const [sitemapResult] = await Promise.allSettled([
      safeGet(new URL("/sitemap.xml", origin).href, 128 * 1024),
    ]);
    const sitemapResponse = sitemapResult.status === "fulfilled" ? sitemapResult.value : null;
    const sitemap = {
      status: sitemapResponse?.status ?? null,
      available: Boolean(sitemapResponse && sitemapResponse.status >= 200 && sitemapResponse.status < 300),
    };
    const report = analyzeHtml({
      html: page.body.toString("utf8"),
      analyzedUrl: requestedUrl.href,
      finalUrl: page.url.href,
      status: page.status,
      durationMs: Math.round(performance.now() - startedAt),
      bytes: page.body.length,
      redirects: page.redirects,
      headers: new Headers(Object.entries(page.headers).flatMap(([key, value]) => value === undefined ? [] : [[key, Array.isArray(value) ? value.join(", ") : String(value)]])),
      sitemap,
      robotsTxt: { status: robotsResponse.status, available: robotsAvailable, blocked: false },
    });
    if (/^https?:\/\//i.test(report.technical.favicon.url)) {
      try {
        const favicon = await safeGet(report.technical.favicon.url, 128 * 1024);
        report.technical.favicon.status = favicon.status;
        report.technical.favicon.available = favicon.status >= 200 && favicon.status < 300;
      } catch {
        report.technical.favicon.status = null;
        report.technical.favicon.available = false;
      }
    }
    if (!report.technical.favicon.available) {
      report.recommendations.push({
        priority: "Low",
        title: "Check the favicon",
        issue: report.technical.favicon.status === null ? "A favicon URL could not be verified." : `The favicon request returned HTTP ${report.technical.favicon.status}.`,
        action: "Set a working favicon URL in the page head and verify that it is publicly accessible.",
      });
    }
    return NextResponse.json(report, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof FetchProblem) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("SEO analysis failed", error instanceof Error ? error.message : "Unknown failure");
    return NextResponse.json({ error: "The website could not be analyzed right now. Check the URL and try again." }, { status: 502 });
  }
}

import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";

const MAX_BYTES = 2 * 1024 * 1024;
const TIMEOUT_MS = 9000;
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

export class FetchProblem extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "FetchProblem";
  }
}

function isPublicAddress(address: string): boolean {
  const version = isIP(address);
  if (version === 4) {
    const octets = address.split(".").map(Number);
    const [a, b, c] = octets;
    return !(
      a === 0 || a === 10 || a === 127 || a >= 224 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && (b === 0 || b === 168 || (b === 88 && c === 99))) ||
      (a === 198 && (b === 18 || b === 19 || b === 51)) ||
      (a === 203 && b === 0 && c === 113)
    );
  }
  if (version === 6) {
    const first = parseInt(address.split(":")[0] || "0", 16);
    return first >= 0x2000 && first <= 0x3fff;
  }
  return false;
}

export function validateInputUrl(raw: string): URL {
  let url: URL;
  try { url = new URL(raw); } catch { throw new FetchProblem("Enter a valid website URL, including its domain name.", 400); }
  if (!["http:", "https:"].includes(url.protocol)) throw new FetchProblem("Only HTTP and HTTPS website URLs can be analyzed.", 400);
  if (url.username || url.password) throw new FetchProblem("URLs containing usernames or passwords are not accepted.", 400);
  if (url.port && url.port !== "80" && url.port !== "443") throw new FetchProblem("Only standard HTTP and HTTPS ports are supported.", 400);
  if (url.hostname === "metadata.google.internal" || url.hostname.toLowerCase().endsWith(".localhost") || url.hostname.toLowerCase().endsWith(".local")) {
    throw new FetchProblem("This hostname is not publicly accessible.", 400);
  }
  return url;
}

async function resolvePublic(hostname: string): Promise<{ address: string; family: 4 | 6 }> {
  const version = isIP(hostname);
  if (version) {
    if (!isPublicAddress(hostname)) throw new FetchProblem("Private or reserved network addresses cannot be analyzed.", 400);
    return { address: hostname, family: version as 4 | 6 };
  }
  let addresses;
  try { addresses = await lookup(hostname, { all: true, verbatim: true }); } catch { throw new FetchProblem("The website hostname could not be resolved.", 502); }
  if (!addresses.length || addresses.some((entry) => !isPublicAddress(entry.address))) {
    throw new FetchProblem("This website resolves to a private or restricted network address.", 400);
  }
  return { address: addresses[0].address, family: addresses[0].family as 4 | 6 };
}

interface ResponseData {
  status: number;
  headers: import("node:http").IncomingHttpHeaders;
  body: Buffer;
}

async function requestOnce(url: URL, maxBytes: number): Promise<ResponseData> {
  const destination = await resolvePublic(url.hostname);
  const transport = url.protocol === "https:" ? httpsRequest : httpRequest;
  return new Promise((resolve, reject) => {
    const request = transport({
      protocol: url.protocol,
      hostname: destination.address,
      family: destination.family,
      port: url.port || (url.protocol === "https:" ? 443 : 80),
      path: `${url.pathname}${url.search}`,
      method: "GET",
      servername: url.protocol === "https:" && !isIP(url.hostname) ? url.hostname : undefined,
      headers: {
        host: url.host,
        "user-agent": "MetadataSEOAnalyzer/1.0 (+https://metadata.nivishdigital.com; public-page-analysis)",
        accept: "text/html,application/xhtml+xml,text/plain;q=0.8,*/*;q=0.2",
        "accept-encoding": "identity",
        connection: "close",
      },
    }, (response) => {
      const chunks: Buffer[] = [];
      let size = 0;
      response.on("data", (chunk: Buffer | string) => {
        const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        size += buffer.length;
        if (size > maxBytes) {
          request.destroy(new FetchProblem("The webpage is larger than the allowed analysis limit.", 413));
          return;
        }
        chunks.push(buffer);
      });
      response.on("end", () => resolve({
        status: response.statusCode ?? 502,
        headers: response.headers,
        body: Buffer.concat(chunks),
      }));
      response.on("error", reject);
    });
    request.setTimeout(TIMEOUT_MS, () => request.destroy(new FetchProblem("The website took too long to respond. Try again later.", 504)));
    request.on("error", reject);
    request.end();
  });
}

export interface SafeResponse {
  url: URL;
  status: number;
  headers: import("node:http").IncomingHttpHeaders;
  body: Buffer;
  redirects: string[];
}

export async function safeGet(raw: string, maxBytes = MAX_BYTES): Promise<SafeResponse> {
  let url = validateInputUrl(raw);
  const redirects: string[] = [];
  for (let hop = 0; hop <= 5; hop += 1) {
    const response = await requestOnce(url, maxBytes);
    const location = response.headers.location;
    if (REDIRECT_STATUSES.has(response.status) && location) {
      if (hop === 5) throw new FetchProblem("The website redirected too many times.", 502);
      let next: URL;
      try { next = new URL(location, url); } catch { throw new FetchProblem("The website returned an invalid redirect.", 502); }
      validateInputUrl(next.href);
      redirects.push(next.href);
      url = next;
      continue;
    }
    return { url, status: response.status, headers: response.headers, body: response.body, redirects };
  }
  throw new FetchProblem("The website could not be reached.", 502);
}

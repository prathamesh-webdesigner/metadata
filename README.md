# Metadata

Metadata is a Next.js on-page SEO analyzer. It fetches publicly accessible HTML, analyzes page metadata and content, and returns a report with a weighted score and recommendations.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production

```bash
npm run lint
npm run build
npm run start
```

Set the canonical production origin in `app/layout.tsx`, `app/sitemap.ts`, and `app/robots.ts` before deploying to a different domain.

## Analyzer behavior

- The API accepts only HTTP(S) URLs on standard ports, rejects private/reserved IP addresses, resolves and pins public addresses for each request, and revalidates every redirect.
- Requests are size- and time-limited. Robots rules for the submitted path are checked before page analysis. HTML is parsed without executing scripts.
- The report includes the response headers and a limited number of separate requests for `robots.txt`, `sitemap.xml`, and the favicon. Link destinations are not probed.
- The SEO score is calculated from weighted checks shown in the report. It is not a ranking prediction, Core Web Vitals result, or Google indexing check.
- Rate limiting is process-local and intended as a basic safeguard. Use a shared rate-limit store and trusted client-IP configuration for multi-instance production deployments.
- Reports and submitted URLs are not written to an application database. The contact form uses a `mailto:` link rather than a server-side email provider.

"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LoaderCircle, Search, ShieldCheck } from "lucide-react";

export function UrlAnalyzerForm({ compact = false }: { compact?: boolean }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    let parsed: URL;
    try { parsed = new URL(url.trim().includes("://") ? url.trim() : `https://${url.trim()}`); }
    catch { setError("Enter a valid website address, such as example.com."); return; }
    if (!["http:", "https:"].includes(parsed.protocol) || !parsed.hostname.includes(".")) {
      setError("Please enter a public website using HTTP or HTTPS."); return;
    }
    setLoading(true);
    router.push(`/analyzer/?url=${encodeURIComponent(parsed.href)}`);
  }

  return (
    <div className={`analyzer-form-wrap ${compact ? "analyzer-form-compact" : ""}`}>
      <form className="analyzer-form" onSubmit={submit}>
        <Search className="input-search" size={20} aria-hidden="true" />
        <label className="sr-only" htmlFor={compact ? "url-compact" : "url-main"}>Website URL to analyze</label>
        <input id={compact ? "url-compact" : "url-main"} type="text" inputMode="url" autoComplete="url" placeholder="https://example.com" value={url} onChange={(event) => setUrl(event.target.value)} aria-invalid={Boolean(error)} aria-describedby={error ? "url-error" : undefined} required />
        <button type="submit" className="button form-submit" disabled={loading}>{loading ? <><LoaderCircle className="spin" size={18} /> Scanning…</> : <>Analyze Website <ArrowRight size={18} /></>}</button>
      </form>
      {error && <p className="form-error" id="url-error" role="alert">{error}</p>}
      {!compact && <div className="trust-row"><span><ShieldCheck size={15} /> Free SEO analysis</span><i /> <span>No registration required</span><i /> <span>Instant results</span></div>}
    </div>
  );
}

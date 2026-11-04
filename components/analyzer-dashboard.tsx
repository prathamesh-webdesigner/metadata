"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Activity, ArrowLeft, ArrowRight, Check, ChevronDown, CircleAlert, Clipboard, Download, ExternalLink, FileDown, Globe2, Image as ImageIcon, LoaderCircle, Search, ShieldCheck, Sparkles, X } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { FindingStatus, LinkItem, SeoReport } from "@/types/seo";

const tabs = ["Overview", "Meta Tags", "Headings", "Keywords", "Internal Links", "External Links", "Images", "Social Metadata", "Technical SEO", "Recommendations"];
const stopRows = [
  { priority: "Critical", className: "priority-critical" },
  { priority: "High", className: "priority-high" },
  { priority: "Medium", className: "priority-medium" },
  { priority: "Low", className: "priority-low" },
  { priority: "Passed", className: "priority-passed" },
];

function StatusPill({ status }: { status: FindingStatus }) {
  const label = status === "pass" ? "Passed" : status === "warning" ? "Review" : "Missing";
  return <span className={`status-pill status-${status}`}>{label}</span>;
}

function Empty({ text }: { text: string }) {
  return <div className="empty-state"><Search size={20} /><p>{text}</p></div>;
}

function downloadCsv(report: SeoReport) {
  const rows = [
    ["Section", "Item", "Value", "Status"],
    ...report.checks.map((check) => ["SEO checks", check.label, check.detail, check.status]),
    ["Meta", "Title", report.meta.title, ""],
    ["Meta", "Description", report.meta.description, ""],
    ["Meta", "Canonical", report.meta.canonical, ""],
    ...report.headings.map((item) => ["Headings", `H${item.level}`, item.text, ""]),
    ...report.links.map((item) => [item.internal ? "Internal links" : "External links", item.text, item.url, item.follow ? "Follow" : "Nofollow"]),
    ...report.images.map((item) => ["Images", item.src, item.alt ?? "Alt attribute missing", ""]),
    ...report.recommendations.map((item) => ["Recommendations", item.title, `${item.issue} Fix: ${item.action}`, item.priority]),
  ];
  const csv = rows.map((row) => row.map((field) => `"${String(field ?? "").replaceAll('"', '""')}"`).join(",")).join("\r\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const anchor = document.createElement("a");
  anchor.href = URL.createObjectURL(blob);
  anchor.download = `metadata-seo-report-${new URL(report.finalUrl).hostname}.csv`;
  anchor.click();
  URL.revokeObjectURL(anchor.href);
}

function LinkTable({ links }: { links: LinkItem[] }) {
  const [query, setQuery] = useState("");
  const [order, setOrder] = useState<"text" | "url">("text");
  const filtered = useMemo(() => links.filter((link) => `${link.text} ${link.url} ${link.rel}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => a[order].localeCompare(b[order])), [links, query, order]);
  return <div className="data-card">
    <div className="table-toolbar"><div><h3>{links.length} links found</h3><span>Link targets are extracted only; destination status is not checked.</span></div><label className="table-search"><Search size={15} /><input placeholder="Search links" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search links" /></label></div>
    {!filtered.length ? <Empty text="No links match your search." /> : <div className="table-scroll"><table><thead><tr><th><button onClick={() => setOrder("text")}>Link text ↕</button></th><th><button onClick={() => setOrder("url")}>Destination ↕</button></th><th>Follow</th><th>Target</th><th>Rel</th></tr></thead><tbody>{filtered.slice(0, 250).map((link, index) => <tr key={`${link.url}-${index}`}><td>{link.text || <span className="muted">No anchor text</span>}</td><td><a className="table-url" href={link.url} target="_blank" rel="noopener noreferrer">{link.url}<ExternalLink size={12} /></a></td><td><span className={`follow-badge ${link.follow ? "follow" : "nofollow"}`}>{link.follow ? "Follow" : "Nofollow"}</span></td><td>{link.target || "—"}</td><td>{link.rel || "—"}</td></tr>)}</tbody></table></div>}
  </div>;
}

export function AnalyzerDashboard() {
  const params = useSearchParams();
  const url = params.get("url") ?? "";
  const [report, setReport] = useState<SeoReport | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Overview");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    async function run() {
      if (!url) { setError("Enter a website URL to start an analysis."); setLoading(false); return; }
      setLoading(true); setError(""); setReport(null);
      try {
        const response = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url }) });
        const body = await response.json() as SeoReport | { error?: string };
        if (!response.ok) throw new Error("error" in body ? body.error || "The analysis could not be completed." : "The analysis could not be completed.");
        if (active) setReport(body as SeoReport);
      } catch (reason) {
        if (active) setError(reason instanceof Error ? reason.message : "The analysis could not be completed.");
      } finally { if (active) setLoading(false); }
    }
    void run();
    return () => { active = false; };
  }, [url]);

  async function copyUrl() {
    if (!report) return;
    await navigator.clipboard.writeText(report.finalUrl);
    setCopied(true); window.setTimeout(() => setCopied(false), 1800);
  }

  if (loading) return <main className="container dashboard-page"><div className="loading-panel"><div className="loading-orbit"><LoaderCircle size={28} className="spin" /></div><h1>Looking at your webpage…</h1><p>Checking public page details and organizing your report.</p><div className="loading-steps"><span className="step-active"><i /> Validating URL</span><span className="step-active"><i /> Reading page HTML</span><span><i /> Building your report</span></div><div className="skeleton-line" /><div className="skeleton-block" /></div></main>;
  if (error || !report) return <main className="container dashboard-page"><div className="error-panel"><span><CircleAlert size={25} /></span><h1>We couldn't analyze that page</h1><p>{error || "No report data was returned."}</p><p className="error-hint">Make sure the URL is publicly accessible, uses HTTP or HTTPS, and permits automated analysis in its robots.txt file.</p><Link className="button" href="/#analyzer"><ArrowLeft size={17} /> Try another URL</Link></div></main>;

  const internalLinks = report.links.filter((link) => link.internal);
  const externalLinks = report.links.filter((link) => !link.internal);
  const passed = report.checks.filter((item) => item.status === "pass").length;
  const warnings = report.checks.filter((item) => item.status === "warning").length;
  const failed = report.checks.filter((item) => item.status === "fail").length;
  const statusText = report.score >= 80 ? "Looking good" : report.score >= 60 ? "Room to improve" : "Needs attention";
  const ringStyle = { background: `conic-gradient(#2563eb ${report.score * 3.6}deg, #e8eef7 0deg)` };
  const keywordRows = report.keywords;
  const chartData = report.checks.map((item) => ({ name: item.label, score: item.status === "pass" ? item.weight : item.status === "warning" ? item.weight / 2 : 0, full: item.weight }));

  return <main className="container dashboard-page">
    <div className="dashboard-breadcrumb"><Link href="/"><ArrowLeft size={15} /> Home</Link><span>/</span><span>SEO report</span></div>
    <div className="dashboard-title-row"><div><span className="section-label">YOUR WEBSITE REPORT</span><h1>SEO analysis</h1><div className="analyzed-url"><Globe2 size={15} /><span>{report.finalUrl}</span><button onClick={copyUrl} aria-label="Copy analyzed URL">{copied ? <Check size={15} /> : <Clipboard size={15} />}</button><a href={report.finalUrl} target="_blank" rel="noopener noreferrer" aria-label="Open website"><ExternalLink size={14} /></a></div></div><div className="export-actions"><button className="button button-outline" onClick={() => window.print()}><FileDown size={16} /> Export PDF</button><button className="button" onClick={() => downloadCsv(report)}><Download size={16} /> Export CSV</button></div></div>
    {copied && <span className="copy-toast" role="status">URL copied</span>}
    <div className="report-meta-line"><span>Analyzed {new Date(report.analyzedAt).toLocaleString()}</span><span>HTTP {report.response.status}</span><span>{report.response.durationMs} ms response</span><span>{(report.response.bytes / 1024).toFixed(1)} KB HTML</span></div>

    <div className="dashboard-tabs" role="tablist" aria-label="Report sections">{tabs.map((tab) => <button key={tab} role="tab" aria-selected={activeTab === tab} className={activeTab === tab ? "tab-active" : ""} onClick={() => setActiveTab(tab)}>{tab}</button>)}</div>
    {activeTab === "Overview" && <div className="report-content">
      <div className="overview-top">
        <section className="score-card data-card"><div className="score-card-heading"><div><span className="section-label">ON-PAGE HEALTH</span><h2>Your SEO snapshot</h2></div><span className="score-spark"><Activity size={17} /></span></div><div className="score-main"><div className="score-ring large" style={ringStyle}><div><b>{report.score}</b><small>out of 100</small></div></div><div><h3>{statusText}</h3><p>This score summarizes the checks below. It is an audit score—not a Google ranking or performance metric.</p><span className="score-counts"><b>{passed} passed</b><i />{warnings} to review<i />{failed} missing</span></div></div><div className="score-method"><ShieldCheck size={16} /><span>Score from {report.checks.length} weighted HTML checks. Pass earns full points, review earns half, and missing earns none.</span></div></section>
        <section className="summary-card data-card"><div className="section-title-row"><div><span className="section-label">PAGE CONTENT</span><h2>At a glance</h2></div><Sparkles size={18} /></div><div className="summary-grid"><div><b>{report.headings.length}</b><span>Headings</span></div><div><b>{report.links.length}</b><span>Links</span></div><div><b>{report.images.length}</b><span>Images</span></div><div><b>{report.contentWords.toLocaleString()}</b><span>Words</span></div></div><div className="summary-url"><span>Final page URL</span><a href={report.finalUrl} target="_blank" rel="noopener noreferrer">{report.finalUrl}<ExternalLink size={12} /></a></div></section>
      </div>
      <div className="overview-bottom"><section className="data-card chart-card"><div className="section-title-row"><div><span className="section-label">CHECK BREAKDOWN</span><h2>Signals checked</h2></div></div><div className="chart-box"><ResponsiveContainer width="100%" height={260}><BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 16 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#edf1f7" /><XAxis type="number" domain={[0, "dataMax"]} hide /><YAxis dataKey="name" type="category" width={130} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} /><Tooltip formatter={(value) => [`${value} pts`, "Earned"]} /><Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={13}>{chartData.map((item, index) => <Cell key={item.name} fill={report.checks[index].status === "pass" ? "#2563eb" : report.checks[index].status === "warning" ? "#f5a623" : "#ef6461"} />)}</Bar></BarChart></ResponsiveContainer></div></section>
        <section className="data-card check-card"><div className="section-title-row"><div><span className="section-label">CHECK RESULTS</span><h2>Quick review</h2></div></div><div className="check-list">{report.checks.map((check) => <div className="check-list-row" key={check.label}><span className={`check-list-icon ${check.status}`}>{check.status === "pass" ? <Check size={13} /> : check.status === "warning" ? <ChevronDown size={13} /> : <X size={13} />}</span><div><b>{check.label}</b><span>{check.detail}</span></div><StatusPill status={check.status} /></div>)}</div></section></div>
      <section className="data-card recommendations-preview"><div className="section-title-row"><div><span className="section-label">NEXT BEST ACTIONS</span><h2>Recommended improvements</h2></div><button className="text-button" onClick={() => setActiveTab("Recommendations")}>View all <ArrowRight size={15} /></button></div><div className="recommendation-grid">{report.recommendations.slice(0, 3).map((item) => <div className="mini-recommendation" key={item.title}><span className={`priority-dot priority-${item.priority.toLowerCase()}`} /><div><b>{item.title}</b><p>{item.issue}</p></div></div>)}</div></section>
    </div>}

    {activeTab === "Meta Tags" && <div className="report-content"><div className="section-page-heading"><span className="section-label">ON-PAGE METADATA</span><h2>Meta tags &amp; page details</h2><p>Metadata found in the initial HTML response. Title and description length are practical guidance, not ranking thresholds.</p></div><div className="meta-grid">{Object.entries({ "Page title": report.meta.title, "Meta description": report.meta.description, "Meta keywords": report.meta.keywords, "Canonical URL": report.meta.canonical, "Robots meta": report.meta.robots, "Viewport": report.meta.viewport, "Character set": report.meta.charset, "HTML language": report.meta.language, "Author": report.meta.author, "Generator": report.meta.generator, "Theme color": report.meta.themeColor }).map(([label, value]) => <article className="meta-card data-card" key={label}><div><h3>{label}</h3><StatusPill status={value ? "pass" : "warning"} /></div><p>{value || "Not detected in the page HTML"}</p>{label === "Page title" && value && <small>{value.length} characters · concise, descriptive titles display best</small>}{label === "Meta description" && value && <small>{value.length} characters · snippet length can vary by query and device</small>}</article>)}</div></div>}

    {activeTab === "Headings" && <div className="report-content"><div className="section-page-heading"><span className="section-label">CONTENT OUTLINE</span><h2>Heading structure</h2><p>Heading text and levels as found in the HTML, in document order.</p></div><div className="heading-summary">{[1,2,3,4,5,6].map((level) => <div className="data-card" key={level}><span>H{level}</span><b>{report.headings.filter((heading) => heading.level === level).length}</b></div>)}</div><details className="data-card heading-list" open><summary><span>Document outline · {report.headings.length} headings</span><ChevronDown size={16} /></summary>{!report.headings.length ? <Empty text="No heading elements were detected." /> : report.headings.map((item, index) => <div className={`heading-row level-${item.level}`} key={`${item.level}-${index}`}><span>H{item.level}</span><b>{item.text || <em>Empty heading</em>}</b><span className="heading-length">{item.text.length} chars</span></div>)}</details></div>}

    {activeTab === "Keywords" && <KeywordPanel report={report} />}
    {activeTab === "Internal Links" && <div className="report-content"><div className="section-page-heading"><span className="section-label">SITE NAVIGATION</span><h2>Internal links</h2><p>Links whose hostname matches this page. Destination availability is not checked.</p></div><div className="link-summary"><div className="data-card"><span>Internal link instances</span><b>{internalLinks.length}</b></div><div className="data-card"><span>Unique destinations</span><b>{new Set(internalLinks.map((link) => link.url)).size}</b></div></div><LinkTable links={internalLinks} /></div>}
    {activeTab === "External Links" && <div className="report-content"><div className="section-page-heading"><span className="section-label">OUTBOUND LINKS</span><h2>External links</h2><p>Links to other hostnames. We do not probe links, so no broken-link status is inferred.</p></div><div className="link-summary"><div className="data-card"><span>External link instances</span><b>{externalLinks.length}</b></div><div className="data-card"><span>External domains</span><b>{new Set(externalLinks.map((link) => new URL(link.url).hostname)).size}</b></div></div><LinkTable links={externalLinks} /></div>}
    {activeTab === "Images" && <div className="report-content"><div className="section-page-heading"><span className="section-label">IMAGE ACCESSIBILITY</span><h2>Image SEO</h2><p>Alt text can improve accessibility when it describes the image's purpose. Decorative images can use an empty alt attribute. A non-empty value is not a guarantee that the text is descriptive.</p></div><div className="link-summary"><div className="data-card"><span>Images detected</span><b>{report.images.length}</b></div><div className="data-card"><span>Non-empty alt coverage</span><b>{report.images.length ? Math.round((report.images.filter((image) => image.alt?.trim()).length / report.images.length) * 100) : 0}%</b></div><div className="data-card"><span>Missing alt attribute</span><b>{report.images.filter((image) => image.alt === null).length}</b></div><div className="data-card"><span>Empty alt attribute</span><b>{report.images.filter((image) => image.alt === "").length}</b></div></div><div className="data-card table-scroll"><table><thead><tr><th>Image source</th><th>Alt text</th><th>Title</th><th>Loading</th></tr></thead><tbody>{report.images.map((image, index) => <tr key={`${image.src}-${index}`}><td><a className="table-url" href={image.src} target="_blank" rel="noopener noreferrer">{image.src || "No source"}<ExternalLink size={12} /></a></td><td>{image.alt === null ? <span className="status-pill status-fail">Missing</span> : image.alt ? image.alt : <span className="muted">Empty (possibly decorative)</span>}</td><td>{image.title || "—"}</td><td>{image.loading || "—"}</td></tr>)}</tbody></table>{!report.images.length && <Empty text="No images were detected in the page HTML." />}</div></div>}

    {activeTab === "Social Metadata" && <div className="report-content"><div className="section-page-heading"><span className="section-label">SHARING PREVIEW SIGNALS</span><h2>Social metadata</h2><p>Open Graph and Twitter Card values present in the fetched HTML.</p></div><div className="meta-grid">{Object.entries(report.social).map(([label, value]) => <article className="meta-card data-card" key={label}><div><h3>{label}</h3><StatusPill status={value ? "pass" : "warning"} /></div><p>{value || "Not detected"}</p></article>)}</div></div>}

    {activeTab === "Technical SEO" && <div className="report-content"><div className="section-page-heading"><span className="section-label">TECHNICAL SNAPSHOT</span><h2>Technical SEO checks</h2><p>Initial HTML response and a small set of additional URL requests. No Core Web Vitals, Google indexing status, or mobile usability measurement is performed.</p></div><div className="technical-grid">{[
      ["Page response", `HTTP ${report.response.status}`, "Fetched page status"],
      ["HTTPS", report.technical.https ? "Available" : "Not used", "Final page URL protocol"],
      ["Request time", `${report.response.durationMs} ms`, "Time for these requests; not a page speed test"],
      ["HTML size", `${(report.response.bytes / 1024).toFixed(1)} KB`, "Fetched document size"],
      ["Robots.txt", report.technical.robotsTxt.available ? "Found" : "Not found", `HTTP ${report.technical.robotsTxt.status ?? "unavailable"} · checked separately`],
      ["Sitemap.xml", report.technical.sitemap.available ? "Found" : "Not found", `HTTP ${report.technical.sitemap.status ?? "unavailable"} · checked separately`],
      ["X-Robots-Tag", report.technical.xRobotsTag || "Not detected", "Response header"],
      ["Redirects", report.response.redirects.length ? `${report.response.redirects.length} redirect(s)` : "None", report.response.redirects.join(" → ") || "Final page URL"],
      ["Structured data", `${report.technical.structuredData} JSON-LD script(s)`, "Detected in initial HTML"],
      ["Favicon", report.technical.favicon.available ? "Available" : "Not verified", `${report.technical.favicon.url}${report.technical.favicon.status ? ` · HTTP ${report.technical.favicon.status}` : ""} · checked separately`],
      ["Canonical URL", report.meta.canonical || "Not detected", "HTML link element"],
      ["Mobile viewport", report.meta.viewport || "Not detected", "HTML meta element"],
    ].map(([label, value, note]) => <article className="data-card technical-card" key={label}><span>{label}</span><b>{value}</b><small>{note}</small></article>)}</div></div>}

    {activeTab === "Recommendations" && <div className="report-content"><div className="section-page-heading"><span className="section-label">NEXT STEPS</span><h2>Recommendations</h2><p>Suggestions based on this HTML snapshot. Review each item against your site context before making changes.</p></div><div className="recommendation-list">{report.recommendations.map((item, index) => <article className="data-card recommendation-item" key={`${item.title}-${index}`}><span className={`priority-tag ${stopRows.find((row) => row.priority === item.priority)?.className}`}>{item.priority}</span><div><h3>{item.title}</h3><p>{item.issue}</p><div className="recommendation-action"><b>What to do</b><span>{item.action}</span></div></div></article>)}</div></div>}

    <div className="report-bottom"><span>Automated findings describe the fetched HTML, not search ranking outcomes.</span><Link className="button button-outline" href="/#analyzer">Analyze another website <ArrowRight size={15} /></Link></div>
  </main>;
}

function KeywordPanel({ report }: { report: SeoReport }) {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"count" | "phrase" | "density">("count");
  const rows = useMemo(() => report.keywords.filter((item) => item.phrase.includes(query.toLowerCase())).sort((a, b) => sortBy === "phrase" ? a.phrase.localeCompare(b.phrase) : b[sortBy] - a[sortBy]), [report.keywords, query, sortBy]);
  return <div className="report-content"><div className="section-page-heading"><span className="section-label">VISIBLE PAGE TEXT</span><h2>Keyword &amp; phrase frequency</h2><p>Recurring terms extracted from readable page text. They are not necessarily target keywords or Google's ranking keywords. Common stop words and site chrome are filtered where possible.</p></div><div className="keyword-toolbar data-card"><span>{rows.length} phrases · {report.contentWords.toLocaleString()} words scanned</span><label className="table-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter phrases" aria-label="Filter keyword phrases" /></label></div><div className="data-card table-scroll">{rows.length ? <table><thead><tr><th><button onClick={() => setSortBy("phrase")}>Phrase ↕</button></th><th><button onClick={() => setSortBy("count")}>Frequency ↕</button></th><th><button onClick={() => setSortBy("density")}>Estimated density ↕</button></th></tr></thead><tbody>{rows.map((item) => <tr key={item.phrase}><td><b>{item.phrase}</b><span className="phrase-kind">{item.phrase.split(" ").length === 1 ? "word" : `${item.phrase.split(" ").length}-word phrase`}</span></td><td>{item.count}</td><td>{item.density}%</td></tr>)}</tbody></table> : <Empty text="No recurring words or phrases matched this filter." />}</div></div>;
}

"use client";

import Link from "next/link";
import { Activity, ArrowDown, ArrowRight, ArrowUpRight, BarChart3, Check, ChevronDown, CircleGauge, Code2, FileSearch, Globe2, Image, Link2, ListChecks, LockKeyhole, SearchCheck, ShieldCheck, Sparkles, Tags, Type, Zap } from "lucide-react";
import { UrlAnalyzerForm } from "@/components/url-analyzer-form";
import { StructuredData } from "@/components/structured-data";
import { siteFaqs } from "@/lib/site-seo";

const features = [
  { icon: Type, title: "Meta title analysis", text: "Check title presence, length, and clarity at a glance." },
  { icon: FileSearch, title: "Meta description", text: "Review your page summary and get practical guidance." },
  { icon: Tags, title: "Keyword detection", text: "Explore repeated words and phrases from visible page text." },
  { icon: ListChecks, title: "Heading structure", text: "See every H1–H6 and spot gaps in the outline." },
  { icon: Link2, title: "Internal link analysis", text: "Review same-site links, destinations, and follow attributes." },
  { icon: ArrowUpRight, title: "External link analysis", text: "See linked domains and outbound link attributes." },
  { icon: Image, title: "Image alt text", text: "Find images with missing or empty alternative text." },
  { icon: Globe2, title: "Canonical URL checker", text: "Check whether a canonical page reference is present." },
  { icon: ShieldCheck, title: "Robots meta checker", text: "Review page-level robots directives and response headers." },
  { icon: Sparkles, title: "Open Graph analysis", text: "Inspect metadata used in social sharing previews." },
  { icon: Activity, title: "Technical SEO checks", text: "Check HTTPS, viewport, response, sitemap, and more." },
  { icon: CircleGauge, title: "SEO recommendations", text: "Prioritized next steps explain what to review and why." },
];
export function HomeContent() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: siteFaqs.slice(0, 5).map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
  return (
    <>
      <section className="hero-section">
        <div className="hero-orb hero-orb-one" /><div className="hero-orb hero-orb-two" />
        <div className="hero-inner container">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> FREE ON-PAGE SEO ANALYZER</div>
            <h1>Free on-page SEO analyzer.<br /><span>Clear answers. Better next steps.</span></h1>
            <p className="hero-subtitle">Use this website SEO checker to review meta titles and descriptions, headings, keywords, internal and external links, image alt text, and technical SEO—all in one practical report.</p>
            <div id="analyzer" className="hero-analyzer"><UrlAnalyzerForm /></div>
            <div className="hero-footnote"><ShieldCheck size={16} /> No sign-up. Your report stays in your browser.</div>
          </div>
          <div className="hero-visual" aria-label="Illustration of an SEO report dashboard">
            <div className="visual-glow" />
            <div className="floating-chip chip-one"><span className="chip-check"><Check size={13} /></span> Meta title <strong>Healthy</strong></div>
            <div className="floating-chip chip-two"><span className="chip-icon"><BarChart3 size={15} /></span> Keywords <strong>Analyzed</strong></div>
            <div className="report-card">
              <div className="report-top"><span className="report-badge"><CircleGauge size={16} /></span><span><b>Report preview</b><small>Example layout · live results vary</small></span><span className="report-menu">•••</span></div>
              <div className="report-score-row"><div className="score-ring"><div><b>SEO</b><small>page checks</small></div></div><div className="score-words"><b>Clear on-page insights</b><span>Based on actual HTML checks</span><div className="report-progress"><i /></div></div></div>
              <div className="report-divider" />
              <div className="report-check"><span className="check-dot good"><Check size={11} /></span><span>Meta description</span><b>Present</b></div>
              <div className="report-check"><span className="check-dot good"><Check size={11} /></span><span>Heading structure</span><b>Good</b></div>
              <div className="report-check"><span className="check-dot warn"><ArrowDown size={11} /></span><span>Image alt text</span><b>Review</b></div>
            </div>
            <div className="decorative-dots" />
          </div>
        </div>
        <div className="hero-bottom container"><span>THE SIMPLE WAY TO A CLEARER WEBSITE</span><div><span>On-page signals</span><i /><span>Technical checks</span><i /><span>Practical guidance</span></div></div>
      </section>

      <section className="trust-strip"><div className="container trust-strip-inner"><span><LockKeyhole size={17} /> Private by design</span><span><Zap size={17} /> Fast, focused reports</span><span><SearchCheck size={17} /> Real page data</span><span><Code2 size={17} /> No account needed</span></div></section>

      <section className="section features-section" id="features">
        <div className="container">
          <div className="section-heading"><span className="section-label">WHAT YOU CAN CHECK</span><h2>Everything important.<br /><span>Nothing overwhelming.</span></h2><p>Run a free on-page SEO audit of your title tag, meta description, heading structure, keyword usage, internal links, image alt text, and technical SEO signals. Get clear findings you can use on a blog, business site, or client project.</p></div>
          <div className="feature-grid">{features.map(({ icon: Icon, title, text }, index) => <article className="feature-card" key={title}><span className="feature-icon"><Icon size={20} /></span><span className="feature-index">0{index + 1}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
        </div>
      </section>

      <section className="section process-section"><div className="container process-layout"><div><span className="section-label">A SIMPLE WORKFLOW</span><h2>From URL to<br /><span>useful insight.</span></h2><p className="process-intro">No setup, no noise. Start with a public webpage and get a clear snapshot of what its HTML tells search engines and visitors.</p><Link className="text-link" href="/#analyzer">Try the analyzer <ArrowRight size={17} /></Link></div><div className="steps-list"><div className="step-card"><span>01</span><div><h3>Enter a website URL</h3><p>Paste a public page address. We validate it before making a request.</p></div><Globe2 size={21} /></div><div className="step-card"><span>02</span><div><h3>We inspect the page</h3><p>Our analyzer reads the HTML and checks relevant on-page signals.</p></div><FileSearch size={21} /></div><div className="step-card"><span>03</span><div><h3>Get your report</h3><p>Review real page findings, understand priorities, and export your report.</p></div><BarChart3 size={21} /></div></div></div></section>

      <section className="section why-section"><div className="container why-layout"><div className="why-card"><div className="why-icon"><ShieldCheck size={23} /></div><h3>Built for clarity,<br />not just crawlers.</h3><p>SEO can feel complicated. Metadata turns page-level signals into a readable checklist so you can focus on changes that help real people.</p><span className="why-url">metadata.nivishdigital.com <ArrowUpRight size={14} /></span></div><div className="why-copy"><span className="section-label">WHY METADATA</span><h2>A helpful starting point<br />for better on-page SEO.</h2><p>Understand what is present, what may need attention, and why. Use findings as a starting point for your own review—not a substitute for context or expertise.</p><ul>{["Completely free, no account required", "Fast checks from actual public HTML", "Recommendations in plain language", "Shareable, downloadable report"].map((item) => <li key={item}><span><Check size={14} /></span>{item}</li>)}</ul></div></div></section>

      <section className="section related-tool-section">
        <div className="container section-heading">
          <span className="section-label">RELATED FREE TOOL</span>
          <h2>Make your website images <span>lighter to load.</span></h2>
          <p>Large image files can slow down a page. Before publishing, use our <a href="https://compress.nivishdigital.com/" target="_blank" rel="noopener noreferrer">free image and PDF compressor</a> to reduce file sizes, then add descriptive alt text to help people understand each image.</p>
        </div>
      </section>

      <section className="section faq-section" id="faq"><div className="container faq-layout"><div className="faq-side"><span className="section-label">GOOD TO KNOW</span><h2>Questions,<br /><span>answered.</span></h2><p>Want to know more about how an analysis works?</p><Link className="text-link" href="/faq/">Visit the FAQ <ArrowRight size={17} /></Link></div>      <div className="faq-list">{siteFaqs.slice(0, 5).map(({ question, answer }) => <details className="faq-item" key={question}><summary>{question}<ChevronDown size={17} /></summary><p>{answer}</p></details>)}</div></div></section>

      <section className="cta-section"><div className="cta-inner container"><div><span className="section-label">YOUR NEXT STEP</span><h2>See your website<br />with fresh eyes.</h2><p>Get a clear snapshot of your on-page SEO. Free, fast, and ready when you are.</p></div><Link className="button cta-button" href="/#analyzer">Analyze a website <ArrowRight size={18} /></Link></div></section>
      <StructuredData data={faqSchema} />
    </>
  );
}

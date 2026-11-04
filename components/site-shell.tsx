import Link from "next/link";
import { ArrowUpRight, BarChart3, FileCheck2, Gauge, Image, Link2, ShieldCheck } from "lucide-react";

const tools = [
  { label: "Meta Tag Checker", icon: FileCheck2 },
  { label: "Keyword Analyzer", icon: BarChart3 },
  { label: "Link Analyzer", icon: Link2 },
  { label: "Image SEO Checker", icon: Image },
];

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid container">
        <div className="footer-about">
          <Link className="brand footer-brand" href="/">
            <span className="brand-mark"><Gauge size={21} strokeWidth={2.5} /></span>
            <span>meta<span className="brand-blue">data</span><small>by NivishDigital</small></span>
          </Link>
          <p>Clear, practical SEO insights to help you make your website easier to understand and improve.</p>
          <a className="external-link" href="https://nivishdigital.com/" target="_blank" rel="noopener noreferrer">NivishDigital <ArrowUpRight size={14} /></a>
        </div>
        <div><h3>Quick links</h3><Link href="/">Home</Link><Link href="/#analyzer">SEO Analyzer</Link><Link href="/about-us/">About Us</Link><Link href="/contact-us/">Contact Us</Link></div>
        <div><h3>Legal</h3><Link href="/privacy-policy/">Privacy Policy</Link><Link href="/terms-and-conditions/">Terms &amp; Conditions</Link><Link href="/disclaimer/">Disclaimer</Link><Link href="/faq/">FAQs</Link></div>
        <div><h3>SEO tools</h3>{tools.map(({ label, icon: Icon }) => <Link key={label} href="/#features"><Icon size={15} />{label}</Link>)}</div>
      </div>
      <div className="footer-bottom container"><span>© 2026 Metadata by NivishDigital. All rights reserved.</span><span className="footer-note"><ShieldCheck size={14} /> Free on-page SEO analysis</span></div>
    </footer>
  );
}

export function Breadcrumbs({ current }: { current: string }) {
  return <div className="breadcrumbs container"><Link href="/">Home</Link><span>/</span><span>{current}</span></div>;
}

export function PageFrame({ children, current }: { children: React.ReactNode; current: string }) {
  return <><Breadcrumbs current={current} /><main className="container page-frame">{children}</main></>;
}

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { PageFrame } from "@/components/site-shell";
import { StructuredData } from "@/components/structured-data";
import { SITE_URL } from "@/lib/site-seo";

type Section = { title: string; paragraphs: string[]; bullets?: string[] };
const paths: Record<string, string> = {
  "About Us": "/about-us/",
  "Contact Us": "/contact-us/",
  "Privacy Policy": "/privacy-policy/",
  "Terms & Conditions": "/terms-and-conditions/",
  Disclaimer: "/disclaimer/",
  FAQs: "/faq/",
};

export function InfoPage({ title, eyebrow, intro, sections, current }: {
  title: string;
  eyebrow: string;
  intro: string;
  sections: Section[];
  current: string;
}) {
  const path = paths[current];
  const breadcrumbSchema = path ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: current, item: new URL(path, SITE_URL).toString() },
    ],
  } : null;
  return <PageFrame current={current}>
    <article className="info-page">
      <div className="info-hero"><span className="section-label">{eyebrow}</span><h1>{title}</h1><p>{intro}</p></div>
      <div className="info-body">{sections.map((section) => <section key={section.title}><h2>{section.title}</h2>{section.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}{section.bullets && <ul>{section.bullets.map((item) => <li key={item}><CheckCircle2 size={16} />{item}</li>)}</ul>}</section>)}
      </div>
      <div className="info-contact"><div><h2>Need more information?</h2><p>We’re happy to hear from you.</p></div><Link className="button" href="/contact-us/">Contact our team <ArrowRight size={16} /></Link></div>
    </article>
    {breadcrumbSchema && <StructuredData data={breadcrumbSchema} />}
  </PageFrame>;
}

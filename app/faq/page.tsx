import { InfoPage } from "@/components/info-page";
import { StructuredData } from "@/components/structured-data";
import { pageMetadata, siteFaqs } from "@/lib/site-seo";

export const metadata = pageMetadata("SEO Analyzer FAQs", "Answers about checking website meta titles, meta descriptions, keywords, internal links, SEO scores, and privacy with Metadata.", "/faq/");

export default function FaqPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: siteFaqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
  return <>
    <InfoPage current="FAQs" eyebrow="HELP CENTER" title="Frequently asked questions" intro="Answers about Metadata's free website SEO checker, on-page analysis, report data, and privacy." sections={siteFaqs.map((faq) => ({ title: faq.question, paragraphs: [faq.answer] }))} />
    <StructuredData data={faqSchema} />
  </>;
}

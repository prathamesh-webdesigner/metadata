import { InfoPage } from "@/components/info-page";
import { pageMetadata } from "@/lib/site-seo";

export const metadata = pageMetadata("Terms & Conditions", "Review the terms for using Metadata's free website SEO analyzer, reports, and related services.", "/terms-and-conditions/");

export default function TermsPage() {
  return <InfoPage current="Terms & Conditions" eyebrow="SERVICE TERMS" title="Terms & Conditions" intro="Last updated: November 4, 2026. By accessing Metadata by NivishDigital, you agree to these terms." sections={[
    { title: "1. The service", paragraphs: ["Metadata provides a free, automated analysis of selected HTML and related public page signals. The service is offered for informational purposes and may change, be interrupted, or be withdrawn without notice."] },
    { title: "2. Acceptable use", paragraphs: ["Use the analyzer only for lawful purposes and only with websites you are authorized to analyze or that are publicly accessible. You must not interfere with the service or other networks.", "You must not use Metadata to attempt access to private or internal systems, evade access controls, perform high-volume scraping, send malicious traffic, or violate a website's applicable policies. Automated usage is rate limited."] },
    { title: "3. Limitations of analysis", paragraphs: ["Reports are based on HTML and a limited number of public requests available at the time of analysis. They may be incomplete or inaccurate due to caching, client-side rendering, network conditions, server responses, or restrictions imposed by the website.", "A score is a weighted summary of selected checks, not a Google score, ranking forecast, Core Web Vitals measurement, indexing check, or substitute for professional advice. No destination link is labeled broken unless independently verified; this service does not currently verify destination links."] },
    { title: "4. Intellectual property", paragraphs: ["The Metadata service, its original design, and its content belong to NivishDigital or its licensors. You retain ownership of content on websites you submit. You grant no ownership rights in submitted URLs or page content by using the analyzer."] },
    { title: "5. Availability and warranty disclaimer", paragraphs: ["The service is provided on an “as is” and “as available” basis to the extent permitted by law. We do not warrant uninterrupted availability, error-free results, or that following a recommendation will improve search visibility."] },
    { title: "6. Limitation of liability", paragraphs: ["To the extent permitted by law, NivishDigital is not liable for indirect, incidental, special, consequential, or punitive damages arising from use of the service, including reliance on an automated report or interruption of access. These terms do not exclude rights or liabilities that cannot lawfully be excluded."] },
    { title: "7. Changes and contact", paragraphs: ["We may revise these terms as the service evolves. Continued use after an update means you accept the revised terms. For questions, email info@nivishdigital.com."] },
  ]} />;
}

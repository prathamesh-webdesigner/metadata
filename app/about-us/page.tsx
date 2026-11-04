import { InfoPage } from "@/components/info-page";
import { pageMetadata } from "@/lib/site-seo";

export const metadata = pageMetadata("About Us", "Learn how the free Metadata on-page SEO analyzer helps website owners, developers, bloggers, and SEO professionals understand page-level SEO.", "/about-us/");

export default function AboutPage() {
  return <InfoPage current="About Us" eyebrow="ABOUT METADATA" title="SEO insights, made easier to understand." intro="Metadata by NivishDigital is a free on-page SEO analyzer created to help people make sense of the details in their webpages." sections={[
    { title: "Our purpose", paragraphs: ["A webpage contains many small clues: a title, a description, a content outline, links, images, and technical signals. Finding these details should not require an expensive subscription or specialist knowledge.", "Metadata brings those visible page elements into one straightforward report. It is designed to help you see what is there, understand what may deserve attention, and decide what to do next."] },
    { title: "Who we help", paragraphs: ["Website owners, developers, bloggers, small businesses, and SEO professionals can use the tool as a practical first look at a publicly accessible page.", "The report is intentionally transparent about its limits. It analyzes HTML we can fetch; it does not predict rankings, replace a full technical audit, or report Google's private indexing and performance data."] },
    { title: "Our approach", paragraphs: ["We value useful explanations over intimidating jargon, real page evidence over made-up scores, and privacy-conscious defaults. Recommendations are starting points to review in context, not one-size-fits-all instructions."] },
  ]} />;
}

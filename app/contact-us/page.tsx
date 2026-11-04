import { ContactForm } from "@/components/contact-form";
import { pageMetadata } from "@/lib/site-seo";

export const metadata = pageMetadata("Contact Us", "Contact Metadata by NivishDigital with questions about the free website SEO checker, feedback, or feature suggestions.", "/contact-us/");

export default function ContactPage() { return <ContactForm />; }

import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";

export default function NotFound() {
  return <main className="container not-found-page"><span className="not-found-icon"><SearchX size={29} /></span><span className="section-label">404 · PAGE NOT FOUND</span><h1>That page went<br /><span>off the map.</span></h1><p>We couldn't find the page you were looking for. It may have moved or the link may be incorrect.</p><Link className="button" href="/"><ArrowLeft size={17} /> Back to Metadata</Link></main>;
}

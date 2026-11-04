"use client";

import { useState, type FormEvent } from "react";
import { ArrowUpRight, Mail, MapPin, Send } from "lucide-react";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const subject = encodeURIComponent(String(data.get("subject")));
    const body = encodeURIComponent(`Name: ${data.get("name")}\nEmail: ${data.get("email")}\n\n${data.get("message")}`);
    window.location.href = `mailto:info@nivishdigital.com?subject=${subject}&body=${body}`;
    setSubmitted(true);
  }

  return <main className="container contact-page">
    <div className="contact-intro"><span className="section-label">GET IN TOUCH</span><h1>We’d love to<br /><span>hear from you.</span></h1><p>Have a question about Metadata, feedback, or an idea for a feature? Send a note to our team.</p><div className="contact-details"><a href="mailto:info@nivishdigital.com"><span><Mail size={18} /></span><div><small>Email us</small><b>info@nivishdigital.com</b></div><ArrowUpRight size={15} /></a><div className="contact-note"><span><MapPin size={18} /></span><div><small>By NivishDigital</small><b>Built for a better web</b></div></div></div></div>
    <div className="contact-form-card"><h2>Send us a message</h2><p>We’ll get back to you as soon as we can.</p><form onSubmit={submit}><div className="form-two"><label>Your name<input name="name" autoComplete="name" required maxLength={100} placeholder="Jane Smith" /></label><label>Email address<input name="email" type="email" autoComplete="email" required maxLength={254} placeholder="jane@example.com" /></label></div><label>Subject<input name="subject" required maxLength={160} placeholder="How can we help?" /></label><label>Message<textarea name="message" rows={6} required minLength={10} maxLength={5000} placeholder="Tell us a little more…" /></label><button className="button" type="submit"><Send size={16} /> Open email app</button><small className="contact-form-help">This opens your default email application to send the message to info@nivishdigital.com. Metadata does not submit or store form contents.</small>{submitted && <p className="success-message" role="status">Your email app should open with your message addressed to us. If it didn’t, email <a href="mailto:info@nivishdigital.com">info@nivishdigital.com</a>.</p>}</form></div>
  </main>;
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Gauge, Menu, X } from "lucide-react";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="nav-wrap">
        <Link className="brand" href="/" aria-label="Metadata home">
          <span className="brand-mark"><Gauge size={22} strokeWidth={2.5} /></span>
          <span>meta<span className="brand-blue">data</span><small>by NivishDigital</small></span>
        </Link>
        <nav className={`main-nav ${menuOpen ? "nav-open" : ""}`} aria-label="Main navigation">
          <Link onClick={() => setMenuOpen(false)} href="/">Home</Link>
          <Link onClick={() => setMenuOpen(false)} href="/#analyzer">SEO Analyzer</Link>
          <Link onClick={() => setMenuOpen(false)} href="/about-us/">About Us</Link>
          <Link onClick={() => setMenuOpen(false)} href="/contact-us/">Contact Us</Link>
          <Link onClick={() => setMenuOpen(false)} href="/privacy-policy/">Privacy</Link>
        </nav>
        <Link className="button button-small" href="/#analyzer" onClick={() => setMenuOpen(false)}>Analyze Website <ArrowUpRight size={16} /></Link>
        <button className="nav-toggle" type="button" aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
      </div>
    </header>
  );
}

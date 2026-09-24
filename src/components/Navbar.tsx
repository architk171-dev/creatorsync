"use client";

import { useState, useEffect } from "react";
import { Shield, Menu, X } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollTo(id: string) {
    setOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300"
      style={{
        backgroundColor: scrolled ? "rgba(10,10,10,0.85)" : "rgba(10,10,10,0.4)",
        backdropFilter: scrolled ? "blur(16px)" : "blur(8px)",
        borderColor: scrolled ? "var(--border)" : "transparent",
        boxShadow: scrolled ? "0 4px 30px rgba(0,0,0,0.3)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 group">
          <Shield className="w-6 h-6 text-accent group-hover:rotate-12 transition-transform" />
          <span className="text-lg font-bold tracking-tight">
            Creator<span className="text-accent">Sync</span>
          </span>
        </a>

        <div className="hidden md:flex items-center gap-6 text-sm text-muted">
          {[
            { label: "How It Works", id: "how-it-works" },
            { label: "Sample Report", id: "sample" },
            { label: "Verify Creator", id: "generate" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="hover:text-foreground transition relative group/link"
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover/link:w-full" />
            </button>
          ))}
          <a
            href="/how-we-verify"
            className="hover:text-foreground transition relative group/link"
          >
            How We Verify
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover/link:w-full" />
          </a>
          <a
            href="/competitor"
            className="hover:text-foreground transition relative group/link"
          >
            Competitor Intel
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover/link:w-full" />
          </a>
          <button
            onClick={() => scrollTo("pricing")}
            className="hover:text-foreground transition relative group/link"
          >
            Pricing
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover/link:w-full" />
          </button>
          <a
            href="/campaign"
            className="bg-accent hover:bg-accent-light text-white px-4 py-2 rounded-full text-sm font-medium transition hover:scale-105 hover:shadow-lg hover:shadow-accent/20"
          >
            Plan Campaign
          </a>
        </div>

        <button
          className="md:hidden text-muted"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu with slide animation */}
      <div
        className="md:hidden overflow-hidden transition-all duration-300"
        style={{
          maxHeight: open ? "400px" : "0",
          opacity: open ? 1 : 0,
        }}
      >
        <div className="bg-card border-t border-border px-4 py-4 flex flex-col gap-4">
          {[
            { label: "How It Works", action: () => scrollTo("how-it-works") },
            { label: "Sample Report", action: () => scrollTo("sample") },
            { label: "Verify Creator", action: () => scrollTo("generate") },
            { label: "Pricing", action: () => scrollTo("pricing") },
          ].map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="text-sm text-muted hover:text-foreground text-left transition"
            >
              {item.label}
            </button>
          ))}
          <a
            href="/how-we-verify"
            className="text-sm text-muted hover:text-foreground"
            onClick={() => setOpen(false)}
          >
            How We Verify
          </a>
          <a
            href="/competitor"
            className="text-sm text-muted hover:text-foreground"
            onClick={() => setOpen(false)}
          >
            Competitor Intel
          </a>
          <a
            href="/campaign"
            className="bg-accent text-white px-4 py-2 rounded-full text-sm font-medium text-center"
            onClick={() => setOpen(false)}
          >
            Plan Campaign
          </a>
        </div>
      </div>
    </nav>
  );
}

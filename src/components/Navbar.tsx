"use client";

import { useState } from "react";
import { Shield, Menu, X } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  function scrollTo(id: string) {
    setOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-accent" />
          <span className="text-lg font-bold tracking-tight">
            Creator<span className="text-accent">Sync</span>
          </span>
        </a>

        <div className="hidden md:flex items-center gap-6 text-sm text-muted">
          <button
            onClick={() => scrollTo("how-it-works")}
            className="hover:text-foreground transition"
          >
            How It Works
          </button>
          <button
            onClick={() => scrollTo("sample")}
            className="hover:text-foreground transition"
          >
            Sample Report
          </button>
          <button
            onClick={() => scrollTo("generate")}
            className="hover:text-foreground transition"
          >
            Verify Creator
          </button>
          <a
            href="/how-we-verify"
            className="hover:text-foreground transition"
          >
            How We Verify
          </a>
          <a
            href="/competitor"
            className="hover:text-foreground transition"
          >
            Competitor Intel
          </a>
          <button
            onClick={() => scrollTo("pricing")}
            className="hover:text-foreground transition"
          >
            Pricing
          </button>
          <a
            href="/campaign"
            className="bg-accent hover:bg-accent-light text-white px-4 py-2 rounded-full text-sm font-medium transition"
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

      {open && (
        <div className="md:hidden bg-card border-t border-border px-4 py-4 flex flex-col gap-4">
          <button
            onClick={() => scrollTo("how-it-works")}
            className="text-sm text-muted hover:text-foreground text-left"
          >
            How It Works
          </button>
          <button
            onClick={() => scrollTo("sample")}
            className="text-sm text-muted hover:text-foreground text-left"
          >
            Sample Report
          </button>
          <button
            onClick={() => scrollTo("generate")}
            className="text-sm text-muted hover:text-foreground text-left"
          >
            Verify Creator
          </button>
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
          <button
            onClick={() => scrollTo("pricing")}
            className="text-sm text-muted hover:text-foreground text-left"
          >
            Pricing
          </button>
          <a
            href="/campaign"
            className="bg-accent text-white px-4 py-2 rounded-full text-sm font-medium text-center"
            onClick={() => setOpen(false)}
          >
            Plan Campaign
          </a>
        </div>
      )}
    </nav>
  );
}

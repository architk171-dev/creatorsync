"use client";

import { Zap, Target } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

export default function CTASection() {
  return (
    <section className="py-20 px-4 gradient-section">
      <div className="max-w-2xl mx-auto text-center">
        <ScrollReveal direction="scale">
          <Target className="w-12 h-12 text-accent mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to find your perfect creators?
          </h2>
          <p className="text-muted text-base mb-8 max-w-lg mx-auto">
            Describe your campaign. AI discovers creators, scores their fit, and
            generates deliverable briefs — all with API-verified metrics.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="/campaign"
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent-light text-white px-10 py-4 rounded-full font-semibold text-lg transition-all animate-pulse-glow hover:scale-105"
            >
              <Zap className="w-5 h-5" />
              Plan Your Campaign
            </a>
            <button
              onClick={() => {
                const el = document.getElementById("generate");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex items-center gap-2 border border-border hover:border-accent/50 text-foreground px-8 py-4 rounded-full font-semibold text-lg transition-all cursor-pointer hover:bg-card hover:scale-105"
            >
              Verify a Creator
            </button>
          </div>
          <p className="text-xs text-muted mt-4">
            Campaign Planner is free. Individual verified reports at ₹2,500
            (launch offer).
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}

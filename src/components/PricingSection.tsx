"use client";

import { Check, Zap } from "lucide-react";

function scrollToGenerate() {
  const el = document.getElementById("generate");
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

export default function PricingSection() {
  return (
    <section id="pricing" className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <p className="text-accent text-xs font-semibold tracking-widest uppercase text-center mb-2">
          Pricing
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">
          Simple Pricing
        </h2>
        <p className="text-muted text-sm text-center mb-12">
          Pay per report. No subscriptions, no hidden fees.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Single Report */}
          <div className="bg-card border border-accent/30 rounded-2xl p-6 relative">
            <div className="absolute -top-3 left-6 bg-accent text-white text-[10px] font-bold px-3 py-1 rounded-full">
              LAUNCH OFFER
            </div>
            <h3 className="text-sm font-bold text-muted uppercase mb-2 mt-1">
              Single Report
            </h3>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-bold">₹2,500</span>
              <span className="text-sm text-muted line-through">₹5,000</span>
            </div>
            <ul className="space-y-2.5 mb-6 text-sm text-muted">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-success shrink-0" />
                YouTube + Instagram metrics
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-success shrink-0" />
                Plain-English verdict
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-success shrink-0" />
                PDF export
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-success shrink-0" />
                GST invoice
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-success shrink-0" />
                30-day shareable link
              </li>
            </ul>
            <button
              onClick={scrollToGenerate}
              className="w-full bg-accent hover:bg-accent-light text-white py-3.5 rounded-xl font-semibold text-center transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Get Started
            </button>
          </div>

          {/* 3-Report Pack */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="text-sm font-bold text-muted uppercase mb-2">
              Agency Pack
            </h3>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-bold">₹12,500</span>
              <span className="text-sm text-muted">3 reports</span>
            </div>
            <ul className="space-y-2.5 mb-6 text-sm text-muted">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-success shrink-0" />
                Everything in Single
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-success shrink-0" />
                Buy 3, effectively 1 free
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-success shrink-0" />
                Priority support
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-success shrink-0" />
                Branded PDF reports
              </li>
            </ul>
            <button
              onClick={scrollToGenerate}
              className="w-full border border-border hover:border-accent/50 text-foreground py-3.5 rounded-xl font-semibold text-center transition cursor-pointer"
            >
              Get Agency Pack
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

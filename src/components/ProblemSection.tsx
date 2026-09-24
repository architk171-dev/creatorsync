"use client";

import { AlertTriangle, X, ArrowRight } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

export default function ProblemSection() {
  return (
    <section className="py-20 px-4 border-t border-border">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <ScrollReveal direction="left">
            <div>
              <div className="inline-flex items-center gap-2 bg-danger/10 border border-danger/20 rounded-full px-3 py-1 mb-4">
                <AlertTriangle className="w-3.5 h-3.5 text-danger" />
                <span className="text-xs font-medium text-danger">
                  The Problem
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 leading-tight">
                Brands lose <span className="text-danger">₹5L–₹50L</span> on
                creators with fake metrics
              </h2>
              <p className="text-sm text-muted leading-relaxed mb-6">
                YouTube Studio screenshots are trivially faked. Inflated follower
                counts, bought engagement, and self-reported numbers cost brands
                real money. There&apos;s no fast way to verify before signing.
              </p>

              <div className="space-y-3">
                {[
                  "Screenshots can be edited in 30 seconds",
                  "Bought followers inflate counts by 10-50x",
                  "Self-reported engagement rates are unreliable",
                  "No standard verification before deals close",
                ].map((item, i) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 text-sm opacity-0 animate-fade-in-up"
                    style={{ animationDelay: `${0.3 + i * 0.1}s` }}
                  >
                    <X className="w-4 h-4 text-danger shrink-0" />
                    <span className="text-muted">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right" delay={200}>
            <div className="bg-card border border-accent/20 rounded-2xl p-6 hover:border-accent/40 transition-all duration-500">
              <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-3 py-1 mb-4">
                <ArrowRight className="w-3.5 h-3.5 text-accent" />
                <span className="text-xs font-medium text-accent">
                  The Solution
                </span>
              </div>
              <h3 className="text-xl font-bold mb-3">
                API-verified reports that brands{" "}
                <span className="text-accent">trust enough to pay for</span>
              </h3>
              <p className="text-sm text-muted leading-relaxed mb-4">
                CreatorSync pulls every metric directly from the platform API —
                not from screenshots, not from the creator, not from third-party
                estimates.
              </p>

              <div className="space-y-4">
                {[
                  { metric: "Subscribers", source: "YouTube Data API v3" },
                  { metric: "Engagement Rate", source: "Computed from last 10 videos" },
                  { metric: "Growth Trend", source: "Recent vs. historical views" },
                  { metric: "Upload Frequency", source: "Video publish timestamps" },
                ].map((item) => (
                  <div
                    key={item.metric}
                    className="flex items-center justify-between text-sm group/row hover:bg-accent/5 rounded-lg px-2 py-1 -mx-2 transition-colors"
                  >
                    <span className="font-medium">{item.metric}</span>
                    <span className="flex items-center gap-1.5 text-[11px] text-muted">
                      <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                      {item.source}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

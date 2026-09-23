"use client";

import { Shield, Zap, FileText, BarChart3, Target, Users } from "lucide-react";

const features = [
  {
    icon: <Target className="w-6 h-6 text-accent" />,
    title: "AI Campaign Analysis",
    description:
      "Describe your campaign and our AI identifies the ideal creator profile, content strategy, budget allocation, and expected outcomes — instantly.",
    tag: "Campaign",
  },
  {
    icon: <Users className="w-6 h-6 text-success" />,
    title: "Cross-Platform Discovery",
    description:
      "Find creators on both YouTube and Instagram simultaneously. AI suggests real handles, fetches live metrics, and scores each creator's campaign fit.",
    tag: "Discovery",
  },
  {
    icon: <FileText className="w-6 h-6 text-[#E4405F]" />,
    title: "Deliverable Briefs",
    description:
      "Generate ready-to-send briefs for each creator — content format, key messaging, do's & don'ts, timeline, deliverables, hashtags, and CTA.",
    tag: "Briefs",
  },
  {
    icon: <Shield className="w-6 h-6 text-accent" />,
    title: "API-Verified Data",
    description:
      "Every metric pulled directly from YouTube Data API v3 and Instagram APIs. No screenshots, no self-reported numbers. Timestamped and traceable.",
    tag: "Trust",
  },
  {
    icon: <Zap className="w-6 h-6 text-warning" />,
    title: "Real-Time Results",
    description:
      "Campaign analysis, creator discovery, and scoring all happen in real time. No cached databases or stale data — live metrics from live APIs.",
    tag: "Speed",
  },
  {
    icon: <BarChart3 className="w-6 h-6 text-accent-light" />,
    title: "Fit Scoring & Insights",
    description:
      "AI scores each creator's fit (0–100%) with specific reasoning. Get engagement benchmarks, growth flags, and actionable campaign strategy.",
    tag: "Insight",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-20 px-4 border-t border-border">
      <div className="max-w-5xl mx-auto">
        <p className="text-accent text-xs font-semibold tracking-widest uppercase text-center mb-2">
          Why CreatorSync
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">
          Campaign Intelligence, Not Guesswork
        </h2>
        <p className="text-muted text-sm text-center mb-14 max-w-md mx-auto">
          AI-powered campaign planning with API-verified creator data. Every number comes from the source.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-card border border-border rounded-2xl p-6 hover:border-accent/30 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-background flex items-center justify-center border border-border group-hover:border-accent/20 transition">
                  {f.icon}
                </div>
                <span className="text-[10px] text-muted font-mono uppercase tracking-wider">
                  {f.tag}
                </span>
              </div>
              <h3 className="text-sm font-bold mb-2">{f.title}</h3>
              <p className="text-xs text-muted leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

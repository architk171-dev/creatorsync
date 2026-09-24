"use client";

import {
  IndianRupee,
  ShieldCheck,
  Percent,
  Eye,
  GitCompareArrows,
  Target,
  Users,
  FileText,
  Zap,
  Shield,
} from "lucide-react";

const coreFeatures = [
  {
    icon: <IndianRupee className="w-6 h-6 text-accent" />,
    title: "Creator Pricing Estimates",
    description:
      "Instantly see what a creator charges for Reels, Stories, YouTube integrations, and dedicated videos. Rates adjust for engagement, category premiums, and follower tier — from Nano (₹1K) to Mega (₹25L+).",
    tag: "Pricing",
    highlight: true,
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-success" />,
    title: "Fake Follower & Engagement Audit",
    description:
      "Every creator gets a Trust Score (0–100) with detailed flags. We check engagement-to-follower ratios, follower/following anomalies, post count patterns, and verified status to flag bought audiences.",
    tag: "Audit",
    highlight: true,
  },
  {
    icon: <Percent className="w-6 h-6 text-warning" />,
    title: "Campaign ROI Calculator",
    description:
      "See estimated impressions, CPM, cost-per-engagement, and reach percentage before you spend a rupee. ROI ratings (Excellent to Below Average) help you pick the best value creators.",
    tag: "ROI",
    highlight: true,
  },
  {
    icon: <Eye className="w-6 h-6 text-[#E4405F]" />,
    title: "Competitor Campaign Tracking",
    description:
      "Enter up to 3 competitor brands and see which creators they work with, what content types they use, and their estimated reach — powered by AI analysis of the Indian creator ecosystem.",
    tag: "Intel",
    highlight: true,
  },
  {
    icon: <GitCompareArrows className="w-6 h-6 text-accent-light" />,
    title: "Multi-Creator Comparison",
    description:
      "Select any creators from your results and compare them side-by-side across 14 metrics — followers, engagement, pricing, trust score, ROI, content style, and more in one table.",
    tag: "Compare",
    highlight: true,
  },
];

const platformFeatures = [
  {
    icon: <Target className="w-6 h-6 text-accent" />,
    title: "AI Campaign Analysis",
    description:
      "Describe your campaign and our AI identifies the ideal creator profile, content strategy, budget allocation, and expected outcomes.",
    tag: "Campaign",
  },
  {
    icon: <Users className="w-6 h-6 text-success" />,
    title: "YouTube + Instagram Discovery",
    description:
      "Find creators on both platforms simultaneously. AI suggests real handles, fetches live metrics, and scores each creator's campaign fit.",
    tag: "Discovery",
  },
  {
    icon: <FileText className="w-6 h-6 text-[#E4405F]" />,
    title: "Deliverable Briefs",
    description:
      "Generate ready-to-send briefs — content format, key messaging, do's & don'ts, timeline, deliverables, hashtags, and CTA.",
    tag: "Briefs",
  },
  {
    icon: <Shield className="w-6 h-6 text-accent" />,
    title: "API-Verified Data",
    description:
      "Every metric pulled directly from YouTube Data API v3 and Instagram APIs. No screenshots, no self-reported numbers.",
    tag: "Trust",
  },
  {
    icon: <Zap className="w-6 h-6 text-warning" />,
    title: "Real-Time Results",
    description:
      "Campaign analysis, creator discovery, and scoring happen in real time. No cached databases — live metrics from live APIs.",
    tag: "Speed",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-20 px-4 border-t border-border">
      <div className="max-w-5xl mx-auto">
        <p className="text-accent text-xs font-semibold tracking-widest uppercase text-center mb-2">
          Platform Features
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">
          Everything You Need to Vet Creators
        </h2>
        <p className="text-muted text-sm text-center mb-14 max-w-lg mx-auto">
          Pricing, trust audits, ROI projections, competitor tracking, and
          side-by-side comparisons — all in one platform.
        </p>

        {/* Core monetization features — highlighted */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {coreFeatures.slice(0, 3).map((f) => (
            <div
              key={f.title}
              className="bg-card border border-accent/20 rounded-2xl p-6 hover:border-accent/40 transition-all group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20 group-hover:border-accent/40 transition">
                    {f.icon}
                  </div>
                  <span className="text-[10px] text-accent font-semibold uppercase tracking-wider bg-accent/10 px-2 py-0.5 rounded-full">
                    {f.tag}
                  </span>
                </div>
                <h3 className="text-sm font-bold mb-2">{f.title}</h3>
                <p className="text-xs text-muted leading-relaxed">
                  {f.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          {coreFeatures.slice(3).map((f) => (
            <div
              key={f.title}
              className="bg-card border border-accent/20 rounded-2xl p-6 hover:border-accent/40 transition-all group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20 group-hover:border-accent/40 transition">
                    {f.icon}
                  </div>
                  <span className="text-[10px] text-accent font-semibold uppercase tracking-wider bg-accent/10 px-2 py-0.5 rounded-full">
                    {f.tag}
                  </span>
                </div>
                <h3 className="text-sm font-bold mb-2">{f.title}</h3>
                <p className="text-xs text-muted leading-relaxed">
                  {f.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Platform features */}
        <p className="text-muted text-xs font-semibold tracking-widest uppercase text-center mb-6">
          Also Included
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {platformFeatures.map((f) => (
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

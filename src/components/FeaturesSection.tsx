"use client";

import { useRef, useState, useCallback } from "react";
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
import ScrollReveal from "./ScrollReveal";

function TiltCard({
  children,
  className = "",
  glowColor = "59,130,246",
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});

  const handleMove = useCallback(
    (e: React.MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rotateX = ((y - cy) / cy) * -4;
      const rotateY = ((x - cx) / cx) * 4;

      setStyle({
        transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`,
        backgroundImage: `radial-gradient(circle at ${x}px ${y}px, rgba(${glowColor},0.08), transparent 60%)`,
      });
    },
    [glowColor]
  );

  const handleLeave = useCallback(() => {
    setStyle({
      transform: "perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)",
      backgroundImage: "none",
    });
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        ...style,
        transition: "transform 0.25s ease-out",
        willChange: "transform",
      }}
    >
      {children}
    </div>
  );
}

const coreFeatures = [
  {
    icon: <IndianRupee className="w-6 h-6 text-accent" />,
    title: "Creator Pricing Estimates",
    description:
      "Instantly see what a creator charges for Reels, Stories, YouTube integrations, and dedicated videos. Rates adjust for engagement, category premiums, and follower tier — from Nano (₹1K) to Mega (₹25L+).",
    tag: "Pricing",
    glow: "59,130,246",
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-success" />,
    title: "Fake Follower & Engagement Audit",
    description:
      "Every creator gets a Trust Score (0–100) with detailed flags. We check engagement-to-follower ratios, follower/following anomalies, post count patterns, and verified status to flag bought audiences.",
    tag: "Audit",
    glow: "34,197,94",
  },
  {
    icon: <Percent className="w-6 h-6 text-warning" />,
    title: "Campaign ROI Calculator",
    description:
      "See estimated impressions, CPM, cost-per-engagement, and reach percentage before you spend a rupee. ROI ratings (Excellent to Below Average) help you pick the best value creators.",
    tag: "ROI",
    glow: "234,179,8",
  },
  {
    icon: <Eye className="w-6 h-6 text-[#E4405F]" />,
    title: "Competitor Campaign Tracking",
    description:
      "Enter up to 3 competitor brands and see which creators they work with, what content types they use, and their estimated reach — powered by AI analysis of the Indian creator ecosystem.",
    tag: "Intel",
    glow: "228,64,95",
  },
  {
    icon: <GitCompareArrows className="w-6 h-6 text-accent-light" />,
    title: "Multi-Creator Comparison",
    description:
      "Select any creators from your results and compare them side-by-side across 14 metrics — followers, engagement, pricing, trust score, ROI, content style, and more in one table.",
    tag: "Compare",
    glow: "96,165,250",
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
        <ScrollReveal>
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
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {coreFeatures.slice(0, 3).map((f, i) => (
            <ScrollReveal key={f.title} delay={i * 100}>
              <TiltCard
                glowColor={f.glow}
                className="bg-card border border-accent/20 rounded-2xl p-6 hover:border-accent/40 transition-colors group relative overflow-hidden h-full"
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
              </TiltCard>
            </ScrollReveal>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          {coreFeatures.slice(3).map((f, i) => (
            <ScrollReveal key={f.title} delay={(i + 3) * 100}>
              <TiltCard
                glowColor={f.glow}
                className="bg-card border border-accent/20 rounded-2xl p-6 hover:border-accent/40 transition-colors group relative overflow-hidden h-full"
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
              </TiltCard>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal>
          <p className="text-muted text-xs font-semibold tracking-widest uppercase text-center mb-6">
            Also Included
          </p>
        </ScrollReveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {platformFeatures.map((f, i) => (
            <ScrollReveal key={f.title} delay={i * 80}>
              <div className="bg-card border border-border rounded-2xl p-6 hover:border-accent/30 transition-all group hover:-translate-y-1 duration-300 h-full">
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
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

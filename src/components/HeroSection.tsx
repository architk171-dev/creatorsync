"use client";

import {
  Shield,
  CheckCircle,
  Zap,
  ArrowDown,
  Target,
  IndianRupee,
  ShieldCheck,
  Percent,
  Eye,
  GitCompareArrows,
} from "lucide-react";

export default function HeroSection() {
  return (
    <section className="gradient-hero pt-28 pb-20 px-4 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-1.5 mb-6 animate-fade-in-up">
          <Target className="w-4 h-4 text-accent" />
          <span className="text-xs font-medium text-accent">
            AI-Powered Influencer Intelligence Platform
          </span>
        </div>

        <h1
          className="text-4xl md:text-6xl font-bold leading-tight mb-5 animate-fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          Discover, Price, Audit &
          <br />
          <span className="text-accent">Compare Creators</span> with AI.
        </h1>

        <p
          className="text-muted text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          The complete creator due diligence platform. Get pricing estimates,
          fake follower audits, ROI projections, competitor intel, and
          side-by-side comparisons — all from one campaign brief.
        </p>

        <div
          className="flex flex-col sm:flex-row justify-center gap-4 mb-10 animate-fade-in-up"
          style={{ animationDelay: "0.3s" }}
        >
          <a
            href="/campaign"
            className="bg-accent hover:bg-accent-light text-white px-8 py-4 rounded-full font-semibold transition-all flex items-center justify-center gap-2 text-base animate-pulse-glow"
          >
            <Zap className="w-5 h-5" />
            Plan Your Campaign
          </a>
          <a
            href="/competitor"
            className="border border-accent/30 hover:border-accent text-accent px-8 py-4 rounded-full font-semibold transition-all flex items-center justify-center gap-2 text-base"
          >
            <Eye className="w-5 h-5" />
            Competitor Intel
          </a>
          <button
            onClick={() => {
              const el = document.getElementById("generate");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="border border-border hover:border-accent/50 text-foreground px-8 py-4 rounded-full font-semibold transition-all flex items-center justify-center gap-2 text-base cursor-pointer"
          >
            <Shield className="w-5 h-5" />
            Verify a Creator
          </button>
        </div>

        <div
          className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-muted mb-12 animate-fade-in-up"
          style={{ animationDelay: "0.4s" }}
        >
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-success" />
            Creator Pricing
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-success" />
            Fake Follower Audit
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-success" />
            ROI Calculator
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-success" />
            Competitor Tracking
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-success" />
            Multi-Creator Compare
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-success" />
            API-Verified Data
          </span>
        </div>

        {/* Value props */}
        <div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 max-w-3xl mx-auto animate-fade-in-up"
          style={{ animationDelay: "0.5s" }}
        >
          <div className="flex flex-col items-center bg-card/50 border border-border rounded-xl p-4 hover:border-accent/30 transition">
            <IndianRupee className="w-5 h-5 text-accent mb-2" />
            <p className="text-sm font-bold">Pricing</p>
            <p className="text-[9px] text-muted mt-0.5">Rate Estimates</p>
          </div>
          <div className="flex flex-col items-center bg-card/50 border border-border rounded-xl p-4 hover:border-accent/30 transition">
            <ShieldCheck className="w-5 h-5 text-success mb-2" />
            <p className="text-sm font-bold">Audit</p>
            <p className="text-[9px] text-muted mt-0.5">Trust Scores</p>
          </div>
          <div className="flex flex-col items-center bg-card/50 border border-border rounded-xl p-4 hover:border-accent/30 transition">
            <Percent className="w-5 h-5 text-warning mb-2" />
            <p className="text-sm font-bold">ROI</p>
            <p className="text-[9px] text-muted mt-0.5">CPM & Reach</p>
          </div>
          <div className="flex flex-col items-center bg-card/50 border border-border rounded-xl p-4 hover:border-accent/30 transition">
            <Eye className="w-5 h-5 text-[#E4405F] mb-2" />
            <p className="text-sm font-bold">Compete</p>
            <p className="text-[9px] text-muted mt-0.5">Brand Tracking</p>
          </div>
          <div className="flex flex-col items-center bg-card/50 border border-border rounded-xl p-4 hover:border-accent/30 transition sm:col-span-1 col-span-2 sm:col-auto">
            <GitCompareArrows className="w-5 h-5 text-accent-light mb-2" />
            <p className="text-sm font-bold">Compare</p>
            <p className="text-[9px] text-muted mt-0.5">Side-by-Side</p>
          </div>
        </div>

        <div className="mt-12 flex justify-center animate-bounce">
          <button
            onClick={() => {
              const el = document.getElementById("how-it-works");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="text-muted hover:text-accent transition cursor-pointer"
          >
            <ArrowDown className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}

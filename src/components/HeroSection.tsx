"use client";

import { Shield, CheckCircle, Zap, ArrowDown, Target, Users, FileText } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="gradient-hero pt-28 pb-20 px-4 relative overflow-hidden">
      {/* Background grid pattern */}
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
            AI-Powered Campaign Planner
          </span>
        </div>

        <h1
          className="text-4xl md:text-6xl font-bold leading-tight mb-5 animate-fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          Find the
          <span className="text-accent"> perfect creators</span>
          <br />
          for your campaign with
          <span className="text-accent"> AI.</span>
        </h1>

        <p
          className="text-muted text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          Describe your campaign. Our AI analyzes your brief, discovers creators
          on YouTube & Instagram, scores their fit, and generates deliverable
          briefs — all backed by API-verified data.
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
          className="flex flex-wrap justify-center gap-6 text-xs text-muted mb-12 animate-fade-in-up"
          style={{ animationDelay: "0.4s" }}
        >
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-success" />
            AI Creator Discovery
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-success" />
            YouTube + Instagram
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-success" />
            API-Verified Data
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-success" />
            Deliverable Briefs
          </span>
        </div>

        {/* Value props */}
        <div
          className="grid grid-cols-3 gap-4 max-w-lg mx-auto animate-fade-in-up"
          style={{ animationDelay: "0.5s" }}
        >
          <div className="flex flex-col items-center">
            <Target className="w-6 h-6 text-accent mb-2" />
            <p className="text-xl md:text-2xl font-bold stat-number">AI</p>
            <p className="text-[10px] text-muted mt-1">Creator Matching</p>
          </div>
          <div className="flex flex-col items-center">
            <Users className="w-6 h-6 text-accent mb-2" />
            <p className="text-xl md:text-2xl font-bold stat-number">YT+IG</p>
            <p className="text-[10px] text-muted mt-1">Cross-Platform</p>
          </div>
          <div className="flex flex-col items-center">
            <FileText className="w-6 h-6 text-accent mb-2" />
            <p className="text-xl md:text-2xl font-bold stat-number">Brief</p>
            <p className="text-[10px] text-muted mt-1">Ready Deliverables</p>
          </div>
        </div>

        {/* Scroll indicator */}
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

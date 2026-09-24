"use client";

import {
  Shield,
  TrendingUp,
  Users,
  Eye,
  Video,
  Clock,
  CheckCircle,
  Lock,
  Zap,
} from "lucide-react";
import ScrollReveal from "./ScrollReveal";

export default function SampleReport() {
  return (
    <section id="sample" className="py-20 px-4 gradient-section">
      <div className="max-w-4xl mx-auto">
        <ScrollReveal>
          <p className="text-accent text-xs font-semibold tracking-widest uppercase text-center mb-2">
            See What You Get
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">
            Sample Verified Report
          </h2>
          <p className="text-muted text-sm text-center mb-12 max-w-md mx-auto">
            Here&apos;s what a real CreatorSync report looks like — this one was
            generated for a public tech channel.
          </p>
        </ScrollReveal>

        <div className="max-w-2xl mx-auto space-y-4">
          <ScrollReveal delay={100}>
            <div className="bg-card rounded-2xl border border-border p-6 hover:border-accent/20 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-xl shrink-0">
                  T
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold">TechCreator Pro</h3>
                    <Shield className="w-4 h-4 text-accent shrink-0" />
                  </div>
                  <p className="text-sm text-muted">
                    youtube.com/@techcreatorpro · @techcreatorpro
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                      Verified via YouTube Data API
                    </span>
                    <span className="text-[10px] text-muted">22 Sep 2026</span>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-muted mt-3 font-mono">
                Report ID: A3F8K2D1
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div className="bg-gradient-to-br from-accent/10 to-card rounded-2xl border border-accent/20 p-6 hover:border-accent/30 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-accent">
                  Verdict
                </h3>
                <span className="text-success border border-success/30 bg-success/10 rounded-full px-3 py-1 text-sm font-bold">
                  78/100
                </span>
              </div>

              <p className="text-sm mb-4 leading-relaxed text-foreground/90">
                Solid, consistently growing mid-tier tech creator with
                above-average engagement. Posts regularly with strong comment
                ratios. Metrics are API-verified.
              </p>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-background/50 rounded-xl p-3 hover:bg-background/70 transition-colors">
                  <p className="text-[10px] text-muted mb-1">Engagement</p>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-success" />
                    <span className="text-sm font-semibold">Above avg</span>
                  </div>
                </div>
                <div className="bg-background/50 rounded-xl p-3 hover:bg-background/70 transition-colors">
                  <p className="text-[10px] text-muted mb-1">Growth</p>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-success" />
                    <span className="text-sm font-semibold">Growing</span>
                  </div>
                </div>
                <div className="bg-background/50 rounded-xl p-3 hover:bg-background/70 transition-colors">
                  <p className="text-[10px] text-muted mb-1">Consistency</p>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-accent" />
                    <span className="text-sm font-semibold">Regular</span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={300}>
            <div className="bg-card rounded-2xl border border-border p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted mb-4">
                YouTube Metrics
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Stat icon={<Users className="w-4 h-4" />} label="Subscribers" value="342K" />
                <Stat icon={<Eye className="w-4 h-4" />} label="Total Views" value="48.2M" blurred />
                <Stat icon={<Video className="w-4 h-4" />} label="Videos" value="287" />
                <Stat icon={<TrendingUp className="w-4 h-4" />} label="Engagement" value="4.2%" blurred />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <Stat icon={<Eye className="w-4 h-4" />} label="Last 30d Views" value="1.8M" blurred />
                <Stat icon={<Clock className="w-4 h-4" />} label="Upload Freq" value="2-3x/week" />
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={400}>
            <div className="bg-card rounded-2xl border border-border p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted mb-4">
                Top 5 Videos
              </h3>
              <div className="space-y-3">
                {[
                  { title: "Why I Switched to This Phone", views: "2.1M", eng: "5.8%" },
                  { title: "Best Laptops Under 50K — 2026", views: "1.4M", eng: "4.3%" },
                ].map((v, i) => (
                  <div key={i} className="flex items-center gap-3 hover:bg-accent/5 rounded-lg px-2 py-1 -mx-2 transition-colors">
                    <div className="w-20 h-12 rounded-lg bg-border shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{v.title}</p>
                      <p className="text-[11px] text-muted">{v.views} views</p>
                    </div>
                    <span className="text-xs text-accent font-medium">{v.eng}</span>
                  </div>
                ))}
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 blur-metric">
                    <div className="w-20 h-12 rounded-lg bg-border shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">Hidden Video Title Here</p>
                      <p className="text-[11px] text-muted">XXX views</p>
                    </div>
                    <span className="text-xs text-accent font-medium">X.X%</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={500} direction="scale">
            <div className="bg-card rounded-2xl border border-accent/30 p-8 text-center animate-pulse-glow">
              <Lock className="w-10 h-10 text-accent mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">
                This is a sample — want your own?
              </h3>
              <p className="text-sm text-muted mb-6 max-w-sm mx-auto">
                Generate a verified report on any YouTube creator. Real data, real
                verdicts, delivered in under 2 minutes.
              </p>
              <button
                onClick={() => {
                  const el = document.getElementById("generate");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent-light text-white px-8 py-3 rounded-full font-semibold transition cursor-pointer hover:scale-105"
              >
                <Zap className="w-4 h-4" />
                Generate Your Report — ₹2,500
              </button>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

function Stat({
  icon,
  label,
  value,
  blurred = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  blurred?: boolean;
}) {
  return (
    <div className="bg-background/50 rounded-xl p-3 hover:bg-background/70 transition-colors">
      <div className="flex items-center gap-1.5 text-muted mb-1">
        {icon}
        <span className="text-[10px]">{label}</span>
      </div>
      <p className={`text-lg font-bold ${blurred ? "blur-metric" : ""}`}>
        {value}
      </p>
    </div>
  );
}

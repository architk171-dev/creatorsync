"use client";

import { useState, useEffect, useCallback } from "react";
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

const ROTATING_WORDS = ["Discover", "Price", "Audit", "Compare"];
const WORD_DURATION = 2400;

function RotatingWord() {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    function cycle() {
      setPhase("in");
      timers.push(setTimeout(() => setPhase("hold"), 400));
      timers.push(
        setTimeout(() => {
          setPhase("out");
        }, WORD_DURATION - 400)
      );
      timers.push(
        setTimeout(() => {
          setIndex((i) => (i + 1) % ROTATING_WORDS.length);
          cycle();
        }, WORD_DURATION)
      );
    }
    cycle();
    return () => timers.forEach(clearTimeout);
  }, []);

  const style: React.CSSProperties = {
    display: "inline-block",
    transition: "opacity 0.35s, transform 0.35s",
    opacity: phase === "hold" || phase === "in" ? 1 : 0,
    transform:
      phase === "in"
        ? "translateY(0)"
        : phase === "out"
          ? "translateY(-12px)"
          : "none",
  };

  return (
    <span className="text-accent inline-block min-w-[180px] md:min-w-[240px] text-left" style={style}>
      {ROTATING_WORDS[index]}
    </span>
  );
}

function FloatingParticles() {
  const [particles, setParticles] = useState<
    { id: number; x: number; y: number; size: number; duration: number; delay: number; opacity: number }[]
  >([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 2 + Math.random() * 3,
        duration: 15 + Math.random() * 25,
        delay: Math.random() * 10,
        opacity: 0.15 + Math.random() * 0.25,
      }))
    );
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" suppressHydrationWarning>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-accent"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animation: `particle-float ${p.duration}s ease-in-out ${p.delay}s infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}

function AnimatedStat({ label, target, suffix = "" }: { label: string; target: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let frame: number;
    const start = performance.now();
    const dur = 2000;
    function tick(now: number) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(eased * target));
      if (p < 1) frame = requestAnimationFrame(tick);
    }
    const delay = setTimeout(() => {
      frame = requestAnimationFrame(tick);
    }, 600);
    return () => {
      clearTimeout(delay);
      cancelAnimationFrame(frame);
    };
  }, [target]);

  return (
    <div className="text-center">
      <p className="text-2xl md:text-3xl font-bold stat-number">
        {count.toLocaleString()}{suffix}
      </p>
      <p className="text-[10px] text-muted mt-0.5">{label}</p>
    </div>
  );
}

export default function HeroSection() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 20,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * 20,
    });
  }, []);

  return (
    <section
      className="gradient-hero pt-28 pb-20 px-4 relative overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <FloatingParticles />

      {/* Glowing cursor orb */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none opacity-20 blur-[120px]"
        style={{
          background: "radial-gradient(circle, rgba(59,130,246,0.4), transparent 70%)",
          left: `calc(50% + ${mousePos.x * 3}px)`,
          top: `calc(40% + ${mousePos.y * 3}px)`,
          transform: "translate(-50%, -50%)",
          transition: "left 0.3s ease-out, top 0.3s ease-out",
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
          <RotatingWord /> Creators
          <br />
          with <span className="text-accent">AI.</span>
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
            className="group bg-accent hover:bg-accent-light text-white px-8 py-4 rounded-full font-semibold transition-all flex items-center justify-center gap-2 text-base animate-pulse-glow hover:scale-105"
          >
            <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            Plan Your Campaign
          </a>
          <a
            href="/competitor"
            className="border border-accent/30 hover:border-accent text-accent px-8 py-4 rounded-full font-semibold transition-all flex items-center justify-center gap-2 text-base hover:bg-accent/5 hover:scale-105"
          >
            <Eye className="w-5 h-5" />
            Competitor Intel
          </a>
          <button
            onClick={() => {
              const el = document.getElementById("generate");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="border border-border hover:border-accent/50 text-foreground px-8 py-4 rounded-full font-semibold transition-all flex items-center justify-center gap-2 text-base cursor-pointer hover:bg-card hover:scale-105"
          >
            <Shield className="w-5 h-5" />
            Verify a Creator
          </button>
        </div>

        <div
          className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-muted mb-12 animate-fade-in-up"
          style={{ animationDelay: "0.4s" }}
        >
          {[
            "Creator Pricing",
            "Fake Follower Audit",
            "ROI Calculator",
            "Competitor Tracking",
            "Multi-Creator Compare",
            "API-Verified Data",
          ].map((label) => (
            <span key={label} className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-success" />
              {label}
            </span>
          ))}
        </div>

        {/* Animated stats bar */}
        <div
          className="flex justify-center gap-8 md:gap-14 mb-8 animate-fade-in-up"
          style={{ animationDelay: "0.5s" }}
        >
          <AnimatedStat label="Creators Analyzed" target={2400} suffix="+" />
          <AnimatedStat label="Campaigns Run" target={580} suffix="+" />
          <AnimatedStat label="Brands Trust Us" target={120} suffix="+" />
        </div>

        {/* Value props */}
        <div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 max-w-3xl mx-auto animate-fade-in-up"
          style={{ animationDelay: "0.6s" }}
        >
          {[
            { icon: <IndianRupee className="w-5 h-5 text-accent mb-2" />, label: "Pricing", sub: "Rate Estimates" },
            { icon: <ShieldCheck className="w-5 h-5 text-success mb-2" />, label: "Audit", sub: "Trust Scores" },
            { icon: <Percent className="w-5 h-5 text-warning mb-2" />, label: "ROI", sub: "CPM & Reach" },
            { icon: <Eye className="w-5 h-5 text-[#E4405F] mb-2" />, label: "Compete", sub: "Brand Tracking" },
            { icon: <GitCompareArrows className="w-5 h-5 text-accent-light mb-2" />, label: "Compare", sub: "Side-by-Side" },
          ].map((item) => (
            <div
              key={item.label}
              className="group flex flex-col items-center bg-card/50 border border-border rounded-xl p-4 hover:border-accent/30 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/5 cursor-default"
            >
              {item.icon}
              <p className="text-sm font-bold">{item.label}</p>
              <p className="text-[9px] text-muted mt-0.5">{item.sub}</p>
            </div>
          ))}
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

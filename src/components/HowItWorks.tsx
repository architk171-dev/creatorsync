"use client";

import { FileText, Cpu, Users, ClipboardCheck } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: <FileText className="w-6 h-6" />,
    title: "Describe Your Campaign",
    description:
      "Fill in your brand, category, goal, audience, budget, and platforms. Our AI understands what you need — from awareness campaigns to product launches.",
    accent: "text-accent",
    bg: "bg-accent/10",
  },
  {
    number: "02",
    icon: <Cpu className="w-6 h-6" />,
    title: "AI Discovers Creators",
    description:
      "Gemini analyzes your brief, searches YouTube & Instagram in real time, and scores every creator's fit for your campaign — with API-verified metrics.",
    accent: "text-success",
    bg: "bg-success/10",
  },
  {
    number: "03",
    icon: <Users className="w-6 h-6" />,
    title: "Review Recommendations",
    description:
      "Get a ranked list of creators with fit scores, engagement rates, estimated reach, and AI-generated reasons why each creator works for your brand.",
    accent: "text-warning",
    bg: "bg-warning/10",
  },
  {
    number: "04",
    icon: <ClipboardCheck className="w-6 h-6" />,
    title: "Generate Deliverable Briefs",
    description:
      "Click 'Deep Report' on any creator to get a full campaign deliverable brief — content format, key messaging, do's & don'ts, timeline, and hashtags.",
    accent: "text-[#E4405F]",
    bg: "bg-[#E4405F]/10",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <p className="text-accent text-xs font-semibold tracking-widest uppercase text-center mb-2">
          How It Works
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">
          Campaign to Creators in 4 Steps
        </h2>
        <p className="text-muted text-sm text-center mb-14 max-w-md mx-auto">
          From campaign brief to creator shortlist with deliverable briefs — powered by AI and real-time API data.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {steps.map((step) => (
            <div
              key={step.number}
              className="bg-card border border-border rounded-2xl p-6 hover:border-accent/20 transition-all group relative overflow-hidden"
            >
              <span className="absolute -right-2 -top-4 text-[80px] font-black text-white/[0.02] group-hover:text-white/[0.04] transition-all select-none">
                {step.number}
              </span>

              <div className="relative z-10">
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${step.bg} ${step.accent} mb-4`}
                >
                  {step.icon}
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className={`text-xs font-mono font-bold ${step.accent}`}
                  >
                    {step.number}
                  </span>
                  <h3 className="text-base font-bold">{step.title}</h3>
                </div>
                <p className="text-sm text-muted leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA after steps */}
        <div className="text-center mt-10">
          <a
            href="/campaign"
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-light text-white px-8 py-4 rounded-full font-semibold transition-all text-base"
          >
            Try the Campaign Planner
          </a>
        </div>
      </div>
    </section>
  );
}

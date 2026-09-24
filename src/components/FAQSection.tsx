"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

const faqs = [
  {
    q: "What is the Campaign Planner?",
    a: "The Campaign Planner lets you describe your brand, campaign goal, target audience, and budget — and AI discovers the best creators on YouTube and Instagram for your specific campaign. It scores their fit, explains why, and generates deliverable briefs you can send directly to creators.",
  },
  {
    q: "How does AI find the right creators?",
    a: "Our AI (Gemini) analyzes your campaign brief to identify ideal creator criteria — content keywords, audience match, follower range, and engagement benchmarks. It then searches YouTube and Instagram in real time, fetches live API data for each creator, and scores their fit against your brief.",
  },
  {
    q: "What's in a deliverable brief?",
    a: "A deliverable brief is a ready-to-send document for the creator that includes: campaign overview, content format, key messaging points, brand guidelines, do's & don'ts, timeline with phases, specific deliverables with specs, campaign hashtags, call to action, and compensation notes.",
  },
  {
    q: "Where does the data come from?",
    a: "Every metric is fetched directly from the YouTube Data API v3 and Instagram APIs at the time of your request. We never use cached databases, scraped data, or creator-submitted numbers. Each data point is live and API-verified.",
  },
  {
    q: "Is the Campaign Planner free?",
    a: "Yes — the Campaign Planner including creator discovery, fit scoring, and deliverable briefs is free to use. Individual deep-dive verified reports (with full engagement analysis, growth trends, and PDF export) are available at ₹2,500 per report.",
  },
  {
    q: "Can I verify a specific creator without running a campaign?",
    a: "Absolutely. Use the 'Verify a Creator' form on this page to generate an API-verified report on any YouTube or Instagram creator. You'll get a blurred preview for free and can unlock the full report with payment.",
  },
  {
    q: "What platforms are supported?",
    a: "Currently YouTube and Instagram. The Campaign Planner discovers creators on both platforms simultaneously, and individual reports support YouTube channels and Instagram profiles.",
  },
];

function AccordionItem({
  faq,
  isOpen,
  onToggle,
}: {
  faq: { q: string; a: string };
  isOpen: boolean;
  onToggle: () => void;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen]);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-accent/20 transition-colors">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left group cursor-pointer"
      >
        <span className="text-sm font-medium pr-4 group-hover:text-accent transition-colors">
          {faq.q}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-muted shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-accent" : ""}`}
        />
      </button>
      <div
        style={{
          height,
          opacity: isOpen ? 1 : 0,
          transition: "height 0.3s cubic-bezier(0.16,1,0.3,1), opacity 0.25s",
          overflow: "hidden",
        }}
      >
        <div ref={contentRef} className="px-5 pb-4">
          <p className="text-sm text-muted leading-relaxed">{faq.a}</p>
        </div>
      </div>
    </div>
  );
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20 px-4 border-t border-border">
      <div className="max-w-2xl mx-auto">
        <ScrollReveal>
          <p className="text-accent text-xs font-semibold tracking-widest uppercase text-center mb-2">
            Questions
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Frequently Asked
          </h2>
        </ScrollReveal>

        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <ScrollReveal key={i} delay={i * 60}>
              <AccordionItem
                faq={faq}
                isOpen={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

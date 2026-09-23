"use client";

import { useState } from "react";
import {
  Shield,
  Target,
  Users,
  Zap,
  TrendingUp,
  Eye,
  Star,
  ChevronRight,
  Loader2,
  Search,
  BarChart3,
  Lightbulb,
  DollarSign,
  ArrowLeft,
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  Hash,
} from "lucide-react";
import { CampaignBrief, CampaignAnalysis, CreatorRecommendation } from "@/lib/types";
import Link from "next/link";

const CATEGORIES = [
  "Tech & Gadgets",
  "Gaming",
  "Beauty & Skincare",
  "Fashion & Lifestyle",
  "Food & Cooking",
  "Fitness & Health",
  "Finance & Investing",
  "Education",
  "Travel",
  "Entertainment & Comedy",
  "Music",
  "Automotive",
  "Real Estate",
  "Parenting & Family",
  "Sports",
  "Other",
];

const GOALS = [
  { value: "awareness", label: "Brand Awareness", icon: Eye, desc: "Maximize reach and impressions" },
  { value: "conversions", label: "Conversions / Sales", icon: TrendingUp, desc: "Drive purchases and sign-ups" },
  { value: "ugc", label: "User-Generated Content", icon: Users, desc: "Get authentic creator content" },
  { value: "engagement", label: "Community Engagement", icon: MessageIcon, desc: "Boost likes, comments, shares" },
  { value: "launches", label: "Product Launch", icon: Zap, desc: "Create buzz for a new product" },
];

const BUDGETS = [
  { value: "under-1L", label: "Under ₹1 Lakh", desc: "Nano/micro creators" },
  { value: "1L-5L", label: "₹1-5 Lakhs", desc: "Micro/mid-tier mix" },
  { value: "5L-15L", label: "₹5-15 Lakhs", desc: "Mid-tier + macro" },
  { value: "15L-50L", label: "₹15-50 Lakhs", desc: "Macro + celebrity" },
  { value: "above-50L", label: "₹50 Lakhs+", desc: "Celebrity & mega" },
];

function MessageIcon({ className }: { className?: string }) {
  return <Users className={className} />;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

interface DeliverableBrief {
  overview: string;
  contentFormat: string[];
  keyMessaging: string[];
  brandGuidelines: string[];
  dosAndDonts: { dos: string[]; donts: string[] };
  timeline: { phase: string; duration: string; details: string }[];
  deliverables: { type: string; quantity: number; specs: string }[];
  compensationNotes: string;
  hashtags: string[];
  callToAction: string;
}

export default function CampaignPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState<CampaignAnalysis | null>(null);
  const [selectedCreator, setSelectedCreator] = useState<CreatorRecommendation | null>(null);
  const [deliverableBrief, setDeliverableBrief] = useState<DeliverableBrief | null>(null);
  const [briefLoading, setBriefLoading] = useState(false);
  const [briefError, setBriefError] = useState("");

  const [brief, setBrief] = useState<CampaignBrief>({
    brandName: "",
    category: "",
    campaignGoal: "awareness",
    targetAudience: "",
    platforms: ["youtube", "instagram"],
    budgetRange: "1L-5L",
    geography: "India",
    description: "",
  });

  function updateBrief(updates: Partial<CampaignBrief>) {
    setBrief((prev) => ({ ...prev, ...updates }));
  }

  function togglePlatform(p: "youtube" | "instagram") {
    setBrief((prev) => {
      const platforms = prev.platforms.includes(p)
        ? prev.platforms.filter((x) => x !== p)
        : [...prev.platforms, p];
      if (platforms.length === 0) return prev;
      return { ...prev, platforms };
    });
  }

  async function handleDeepReport(creator: CreatorRecommendation) {
    setSelectedCreator(creator);
    setDeliverableBrief(null);
    setBriefError("");
    setBriefLoading(true);

    try {
      const res = await fetch("/api/campaign/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brief,
          creator: {
            name: creator.name,
            handle: creator.handle,
            platform: creator.platform,
            subscribers: creator.subscriberCount,
            engagement: creator.engagementRate,
            category: creator.category,
            fitReason: creator.fitReason,
            contentStyle: creator.contentStyle,
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate brief");
      }

      const data: DeliverableBrief = await res.json();
      setDeliverableBrief(data);
    } catch (err) {
      setBriefError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBriefLoading(false);
    }
  }

  async function handleSubmit() {
    if (!brief.brandName || !brief.category || !brief.targetAudience) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(brief),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Analysis failed");
      }

      const data: CampaignAnalysis = await res.json();
      setAnalysis(data);
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-accent" />
            <span className="text-lg font-bold tracking-tight">
              Creator<span className="text-accent">Sync</span>
            </span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-muted hover:text-foreground transition">
              Home
            </Link>
            <span className="text-accent font-medium">Campaign Planner</span>
          </div>
        </div>
      </nav>

      <main className="pt-20 pb-20 px-4">
        {/* Progress Steps */}
        {!analysis && (
          <div className="max-w-2xl mx-auto mb-10">
            <div className="flex items-center justify-center gap-2">
              {[
                { num: 1, label: "Campaign Brief" },
                { num: 2, label: "Details & Budget" },
              ].map((s, i) => (
                <div key={s.num} className="flex items-center gap-2">
                  {i > 0 && (
                    <div
                      className={`w-12 h-0.5 ${step >= s.num ? "bg-accent" : "bg-border"}`}
                    />
                  )}
                  <button
                    onClick={() => s.num < step && setStep(s.num)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
                      step === s.num
                        ? "bg-accent text-white"
                        : step > s.num
                          ? "bg-accent/20 text-accent cursor-pointer"
                          : "bg-card text-muted"
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs">
                      {s.num}
                    </span>
                    {s.label}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Campaign Brief */}
        {step === 1 && !analysis && (
          <div className="max-w-2xl mx-auto animate-fade-in-up">
            <div className="text-center mb-8">
              <Target className="w-10 h-10 text-accent mx-auto mb-3" />
              <h1 className="text-3xl font-bold mb-2">Plan Your Campaign</h1>
              <p className="text-muted text-sm">
                Tell us about your campaign and our AI will find the best
                creators for you.
              </p>
            </div>

            <div className="space-y-6">
              {/* Brand Name */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Brand Name <span className="text-accent">*</span>
                </label>
                <input
                  type="text"
                  value={brief.brandName}
                  onChange={(e) => updateBrief({ brandName: e.target.value })}
                  placeholder="e.g. BoAt, Mamaearth, Zerodha"
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Campaign Category <span className="text-accent">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => updateBrief({ category: cat })}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition border ${
                        brief.category === cat
                          ? "bg-accent/20 border-accent text-accent"
                          : "bg-card border-border text-muted hover:border-accent/50"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Campaign Goal */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Campaign Goal <span className="text-accent">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {GOALS.map((goal) => (
                    <button
                      key={goal.value}
                      onClick={() =>
                        updateBrief({
                          campaignGoal: goal.value as CampaignBrief["campaignGoal"],
                        })
                      }
                      className={`flex items-start gap-3 p-4 rounded-xl border transition text-left ${
                        brief.campaignGoal === goal.value
                          ? "bg-accent/10 border-accent"
                          : "bg-card border-border hover:border-accent/50"
                      }`}
                    >
                      <goal.icon
                        className={`w-5 h-5 mt-0.5 shrink-0 ${
                          brief.campaignGoal === goal.value
                            ? "text-accent"
                            : "text-muted"
                        }`}
                      />
                      <div>
                        <p className="text-sm font-semibold">{goal.label}</p>
                        <p className="text-xs text-muted mt-0.5">
                          {goal.desc}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Platforms */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Target Platforms <span className="text-accent">*</span>
                </label>
                <div className="flex gap-3">
                  {(["youtube", "instagram"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => togglePlatform(p)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border font-medium transition ${
                        brief.platforms.includes(p)
                          ? "bg-accent/10 border-accent text-accent"
                          : "bg-card border-border text-muted hover:border-accent/50"
                      }`}
                    >
                      {p === "youtube" ? "▶ YouTube" : "📷 Instagram"}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  if (!brief.brandName || !brief.category) {
                    setError("Please fill in brand name and category");
                    return;
                  }
                  setError("");
                  setStep(2);
                }}
                className="w-full bg-accent hover:bg-accent-light text-white py-4 rounded-xl font-semibold text-base transition flex items-center justify-center gap-2 cursor-pointer"
              >
                Continue
                <ChevronRight className="w-5 h-5" />
              </button>
              {error && (
                <p className="text-danger text-sm text-center">{error}</p>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Details & Budget */}
        {step === 2 && !analysis && (
          <div className="max-w-2xl mx-auto animate-fade-in-up">
            <div className="text-center mb-8">
              <DollarSign className="w-10 h-10 text-accent mx-auto mb-3" />
              <h1 className="text-3xl font-bold mb-2">Campaign Details</h1>
              <p className="text-muted text-sm">
                Help our AI understand your audience and budget.
              </p>
            </div>

            <div className="space-y-6">
              {/* Target Audience */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Target Audience <span className="text-accent">*</span>
                </label>
                <input
                  type="text"
                  value={brief.targetAudience}
                  onChange={(e) =>
                    updateBrief({ targetAudience: e.target.value })
                  }
                  placeholder="e.g. 18-35 year old males interested in tech, college students"
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition"
                />
              </div>

              {/* Geography */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Geography
                </label>
                <input
                  type="text"
                  value={brief.geography}
                  onChange={(e) => updateBrief({ geography: e.target.value })}
                  placeholder="e.g. India, Tier 1 cities, Pan-India Hindi speaking"
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition"
                />
              </div>

              {/* Budget */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Campaign Budget
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {BUDGETS.map((b) => (
                    <button
                      key={b.value}
                      onClick={() =>
                        updateBrief({
                          budgetRange:
                            b.value as CampaignBrief["budgetRange"],
                        })
                      }
                      className={`px-3 py-3 rounded-xl text-sm font-medium transition border text-left ${
                        brief.budgetRange === b.value
                          ? "bg-accent/20 border-accent text-accent"
                          : "bg-card border-border text-muted hover:border-accent/50"
                      }`}
                    >
                      <p className="font-semibold">{b.label}</p>
                      <p className="text-[10px] opacity-70 mt-0.5">
                        {b.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Campaign Description
                </label>
                <textarea
                  value={brief.description}
                  onChange={(e) =>
                    updateBrief({ description: e.target.value })
                  }
                  rows={3}
                  placeholder="Describe what you're promoting, key messaging, any specific requirements..."
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-4 rounded-xl border border-border text-muted hover:text-foreground transition cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-accent hover:bg-accent-light text-white py-4 rounded-xl font-semibold text-base transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      AI is analyzing your campaign...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      Find Creators with AI
                    </>
                  )}
                </button>
              </div>
              {error && (
                <p className="text-danger text-sm text-center">{error}</p>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Results */}
        {analysis && (
          <div className="max-w-4xl mx-auto animate-fade-in-up">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold">
                  Campaign Plan for{" "}
                  <span className="text-accent">
                    {analysis.brief.brandName}
                  </span>
                </h1>
                <p className="text-sm text-muted mt-1">
                  {analysis.brief.category} · {analysis.brief.campaignGoal} ·{" "}
                  {analysis.recommendations.length} creators found
                </p>
              </div>
              <button
                onClick={() => {
                  setAnalysis(null);
                  setStep(1);
                }}
                className="text-sm text-accent hover:text-accent-light transition"
              >
                New Campaign
              </button>
            </div>

            {/* AI Insights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <InsightCard
                icon={<Lightbulb className="w-5 h-5" />}
                title="Campaign Strategy"
                text={analysis.aiInsights.campaignStrategy}
              />
              <InsightCard
                icon={<Users className="w-5 h-5" />}
                title="Ideal Creator Profile"
                text={analysis.aiInsights.idealCreatorProfile}
              />
              <InsightCard
                icon={<DollarSign className="w-5 h-5" />}
                title="Budget Allocation"
                text={analysis.aiInsights.budgetAllocation}
              />
              <InsightCard
                icon={<BarChart3 className="w-5 h-5" />}
                title="Expected Outcomes"
                text={analysis.aiInsights.expectedOutcomes}
              />
            </div>

            {/* Creator Selection Criteria */}
            <div className="bg-card rounded-2xl border border-border p-6 mb-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-accent mb-3">
                AI-Generated Creator Criteria
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-[10px] text-muted mb-1">Subscriber Range</p>
                  <p className="font-semibold">
                    {formatNumber(analysis.criteria.subscriberRange.min)} -{" "}
                    {formatNumber(analysis.criteria.subscriberRange.max)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted mb-1">Min. Engagement</p>
                  <p className="font-semibold">
                    {analysis.criteria.engagementMin}%
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted mb-1">Audience</p>
                  <p className="font-semibold text-xs">
                    {analysis.criteria.audienceMatch}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted mb-1">Platform Focus</p>
                  <p className="font-semibold text-xs">
                    {analysis.criteria.platformFocus}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted mt-3 border-t border-border pt-3">
                {analysis.criteria.reasoning}
              </p>
            </div>

            {/* Creator Recommendations */}
            <h3 className="text-lg font-bold mb-4">
              <Star className="w-5 h-5 text-accent inline mr-2" />
              Recommended Creators
            </h3>

            {analysis.recommendations.length === 0 ? (
              <div className="bg-card rounded-2xl border border-border p-10 text-center">
                <Search className="w-10 h-10 text-muted mx-auto mb-3" />
                <p className="text-muted">
                  No creators found matching the criteria. Try broadening your
                  category or budget range.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {analysis.recommendations.map((creator, i) => (
                  <CreatorCard
                    key={creator.handle + i}
                    creator={creator}
                    onDeepReport={handleDeepReport}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Deliverable Brief Modal */}
        {selectedCreator && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 overflow-y-auto">
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setSelectedCreator(null)}
            />
            <div className="relative bg-card border border-border rounded-2xl w-full max-w-3xl mb-16 shadow-2xl">
              {/* Modal Header */}
              <div className="sticky top-0 bg-card rounded-t-2xl border-b border-border px-6 py-4 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <FileText className="w-5 h-5 text-accent" />
                    Deliverable Brief
                  </h2>
                  <p className="text-xs text-muted mt-0.5">
                    For {selectedCreator.name} (@{selectedCreator.handle}) · {selectedCreator.platform}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCreator(null)}
                  className="text-muted hover:text-foreground transition p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                {briefLoading && (
                  <div className="flex flex-col items-center py-16 gap-4">
                    <Loader2 className="w-8 h-8 text-accent animate-spin" />
                    <p className="text-sm text-muted">
                      AI is crafting the deliverable brief...
                    </p>
                  </div>
                )}

                {briefError && (
                  <div className="flex flex-col items-center py-16 gap-3">
                    <AlertTriangle className="w-8 h-8 text-danger" />
                    <p className="text-sm text-danger">{briefError}</p>
                  </div>
                )}

                {deliverableBrief && (
                  <div className="space-y-6 animate-fade-in-up">
                    {/* Overview */}
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-accent mb-2">
                        Campaign Overview
                      </h3>
                      <p className="text-sm text-muted leading-relaxed">
                        {deliverableBrief.overview}
                      </p>
                    </div>

                    {/* Content Format */}
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-accent mb-2">
                        Content Format
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {deliverableBrief.contentFormat.map((f, i) => (
                          <span
                            key={i}
                            className="text-xs bg-accent/10 text-accent px-3 py-1.5 rounded-full"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Key Messaging */}
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-accent mb-2">
                        Key Messaging Points
                      </h3>
                      <ul className="space-y-2">
                        {deliverableBrief.keyMessaging.map((msg, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted">
                            <span className="text-accent font-bold mt-0.5">{i + 1}.</span>
                            {msg}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Brand Guidelines */}
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-accent mb-2">
                        Brand Guidelines
                      </h3>
                      <ul className="space-y-1.5">
                        {deliverableBrief.brandGuidelines.map((g, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted">
                            <Shield className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                            {g}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Do's and Don'ts */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-success/5 border border-success/20 rounded-xl p-4">
                        <h4 className="text-sm font-bold text-success mb-2 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          Do&apos;s
                        </h4>
                        <ul className="space-y-1.5">
                          {deliverableBrief.dosAndDonts.dos.map((d, i) => (
                            <li key={i} className="text-xs text-muted flex items-start gap-1.5">
                              <span className="text-success">+</span> {d}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-danger/5 border border-danger/20 rounded-xl p-4">
                        <h4 className="text-sm font-bold text-danger mb-2 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4" />
                          Don&apos;ts
                        </h4>
                        <ul className="space-y-1.5">
                          {deliverableBrief.dosAndDonts.donts.map((d, i) => (
                            <li key={i} className="text-xs text-muted flex items-start gap-1.5">
                              <span className="text-danger">-</span> {d}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-accent mb-2">
                        Timeline
                      </h3>
                      <div className="space-y-2">
                        {deliverableBrief.timeline.map((t, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-3 bg-background/50 rounded-xl p-3"
                          >
                            <Clock className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-semibold">
                                {t.phase}{" "}
                                <span className="text-xs text-muted font-normal">
                                  ({t.duration})
                                </span>
                              </p>
                              <p className="text-xs text-muted mt-0.5">{t.details}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Deliverables */}
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-accent mb-2">
                        Deliverables
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {deliverableBrief.deliverables.map((d, i) => (
                          <div
                            key={i}
                            className="bg-background/50 rounded-xl p-3 border border-border"
                          >
                            <p className="text-sm font-semibold">
                              {d.quantity}x {d.type}
                            </p>
                            <p className="text-xs text-muted mt-0.5">{d.specs}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Hashtags */}
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-accent mb-2 flex items-center gap-1.5">
                        <Hash className="w-4 h-4" />
                        Campaign Hashtags
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {deliverableBrief.hashtags.map((h, i) => (
                          <span
                            key={i}
                            className="text-xs bg-card border border-border text-muted px-3 py-1.5 rounded-full"
                          >
                            {h.startsWith("#") ? h : `#${h}`}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="bg-accent/10 border border-accent/30 rounded-xl p-4">
                      <h3 className="text-sm font-bold text-accent mb-1">
                        Call to Action
                      </h3>
                      <p className="text-sm text-foreground">
                        {deliverableBrief.callToAction}
                      </p>
                    </div>

                    {/* Compensation */}
                    <div className="bg-background/50 rounded-xl p-4 border border-border">
                      <h3 className="text-sm font-bold text-foreground mb-1 flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4 text-accent" />
                        Compensation
                      </h3>
                      <p className="text-sm text-muted">
                        {deliverableBrief.compensationNotes}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function InsightCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="bg-card rounded-2xl border border-border p-5">
      <div className="flex items-center gap-2 mb-2 text-accent">
        {icon}
        <h4 className="text-sm font-bold">{title}</h4>
      </div>
      <p className="text-sm text-muted leading-relaxed">{text}</p>
    </div>
  );
}

function CreatorCard({
  creator,
  onDeepReport,
}: {
  creator: CreatorRecommendation;
  onDeepReport: (creator: CreatorRecommendation) => void;
}) {
  const scoreColor =
    creator.fitScore >= 70
      ? "text-success border-success/30 bg-success/10"
      : creator.fitScore >= 40
        ? "text-warning border-warning/30 bg-warning/10"
        : "text-danger border-danger/30 bg-danger/10";

  return (
    <div className="bg-card rounded-2xl border border-border p-5 hover:border-accent/30 transition">
      <div className="flex items-start gap-3 mb-3">
        {creator.thumbnailUrl ? (
          <img
            src={creator.thumbnailUrl}
            alt={creator.name}
            className="w-12 h-12 rounded-full border border-border object-cover shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold shrink-0">
            {creator.name.charAt(0)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold truncate">{creator.name}</h4>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${scoreColor}`}
            >
              {creator.fitScore}%
            </span>
          </div>
          <p className="text-xs text-muted">
            @{creator.handle} ·{" "}
            <span className="capitalize">{creator.platform}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-background/50 rounded-lg p-2">
          <p className="text-[9px] text-muted">Followers</p>
          <p className="text-sm font-bold">
            {formatNumber(creator.subscriberCount)}
          </p>
        </div>
        <div className="bg-background/50 rounded-lg p-2">
          <p className="text-[9px] text-muted">Engagement</p>
          <p className="text-sm font-bold">{creator.engagementRate}%</p>
        </div>
        <div className="bg-background/50 rounded-lg p-2">
          <p className="text-[9px] text-muted">Est. Reach</p>
          <p className="text-sm font-bold">
            {formatNumber(creator.estimatedReach)}
          </p>
        </div>
      </div>

      <p className="text-xs text-muted mb-3 leading-relaxed">
        {creator.fitReason}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          <span className="text-[9px] bg-accent/10 text-accent px-2 py-0.5 rounded-full">
            {creator.category}
          </span>
          {creator.contentStyle && (
            <span className="text-[9px] bg-card border border-border text-muted px-2 py-0.5 rounded-full">
              {creator.contentStyle}
            </span>
          )}
        </div>
        <button
          onClick={() => onDeepReport(creator)}
          className="text-[10px] text-accent font-semibold hover:text-accent-light transition flex items-center gap-0.5 cursor-pointer"
        >
          Deep Report <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

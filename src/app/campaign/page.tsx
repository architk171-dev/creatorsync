"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Shield,
  Target,
  Users,
  Zap,
  TrendingUp,
  Eye,
  Star,
  ChevronRight,
  ChevronDown,
  ChevronUp,
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
  BadgeCheck,
  Briefcase,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  IndianRupee,
  Percent,
  SquareCheck,
  Square,
  GitCompareArrows,
  Ban,
  Sparkles,
  Clapperboard,
  Camera,
  Flame,
  Grid3X3,
  Activity,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { CampaignBrief, CampaignAnalysis, CampaignGoal, CreatorRecommendation, PlatformNote } from "@/lib/types";
import { estimateCreatorPricing, formatPrice } from "@/lib/pricing";
import { auditCreator, AuditResult } from "@/lib/audit";
import { calculateROI, getBudgetNumber, formatCurrency } from "@/lib/roi";
import Link from "next/link";

const PLATFORM_GRADIENTS: Record<string, string> = {
  youtube: "from-red-500/80 to-red-700/80",
  instagram: "from-pink-500/80 to-purple-600/80",
  twitter: "from-sky-400/80 to-sky-600/80",
  linkedin: "from-blue-500/80 to-blue-700/80",
};

function CreatorAvatar({ src, name, platform, size = "md" }: { src?: string; name: string; platform: string; size?: "sm" | "md" }) {
  const [failed, setFailed] = useState(false);
  const dim = size === "sm" ? "w-10 h-10" : "w-12 h-12";
  const textSize = size === "sm" ? "text-sm" : "text-base";
  const gradient = PLATFORM_GRADIENTS[platform] || "from-accent/60 to-accent/90";
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={name}
        className={`${dim} rounded-full border border-border object-cover shrink-0`}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div className={`${dim} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 border border-white/10`}>
      <span className={`${textSize} font-bold text-white drop-shadow-sm`}>{initials}</span>
    </div>
  );
}

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

const GOALS: { value: CampaignGoal; label: string; icon: React.ComponentType<{ className?: string }>; desc: string }[] = [
  { value: "awareness", label: "Brand Awareness", icon: Eye, desc: "Maximize reach and impressions" },
  { value: "conversions", label: "Conversions / Sales", icon: TrendingUp, desc: "Drive purchases and sign-ups" },
  { value: "ugc", label: "User-Generated Content", icon: Users, desc: "Get authentic creator content" },
  { value: "engagement", label: "Community Engagement", icon: MessageIcon, desc: "Boost likes, comments, shares" },
  { value: "launches", label: "Product Launch", icon: Zap, desc: "Create buzz for a new product" },
];

const BUDGETS = [
  { value: "under-50K", label: "Under ₹50K", desc: "Nano creators / barter" },
  { value: "under-1L", label: "₹50K-1 Lakh", desc: "Nano/micro creators" },
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
  creatorScript?: {
    hook: string;
    body: string[];
    cta: string;
    notes: string;
  };
}

export default function CampaignPage() {
  const { data: session, status } = useSession();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState<CampaignAnalysis | null>(null);
  const [selectedCreator, setSelectedCreator] = useState<CreatorRecommendation | null>(null);
  const [deliverableBrief, setDeliverableBrief] = useState<DeliverableBrief | null>(null);
  const [briefLoading, setBriefLoading] = useState(false);
  const [briefError, setBriefError] = useState("");
  const [compareIds, setCompareIds] = useState<Set<string>>(new Set());
  const [showCompare, setShowCompare] = useState(false);

  const [brief, setBrief] = useState<CampaignBrief>({
    brandName: "",
    category: "",
    campaignGoals: [],
    campaignGoal: "awareness",
    targetAudience: "",
    platforms: ["youtube", "instagram"],
    budgetRange: "1L-5L",
    geography: "India",
    description: "",
    competitorBrands: [],
  });

  // Persist state to sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("campaign-state");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.brief) setBrief(parsed.brief);
        if (parsed.step) setStep(parsed.step);
        if (parsed.analysis) setAnalysis(parsed.analysis);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem("campaign-state", JSON.stringify({ brief, step, analysis }));
    } catch {}
  }, [brief, step, analysis]);

  function updateBrief(updates: Partial<CampaignBrief>) {
    setBrief((prev) => ({ ...prev, ...updates }));
  }

  function toggleGoal(goal: CampaignGoal) {
    setBrief((prev) => {
      const goals = prev.campaignGoals.includes(goal)
        ? prev.campaignGoals.filter((g) => g !== goal)
        : [...prev.campaignGoals, goal];
      return {
        ...prev,
        campaignGoals: goals,
        campaignGoal: goals[0] || "awareness",
      };
    });
  }

  function togglePlatform(p: "youtube" | "instagram" | "twitter" | "linkedin") {
    setBrief((prev) => {
      const platforms = prev.platforms.includes(p)
        ? prev.platforms.filter((x) => x !== p)
        : [...prev.platforms, p];
      if (platforms.length === 0) return prev;
      return { ...prev, platforms };
    });
  }

  function toggleCompare(handle: string) {
    setCompareIds((prev) => {
      const next = new Set(prev);
      if (next.has(handle)) next.delete(handle);
      else next.add(handle);
      return next;
    });
  }

  function getCreatorKey(c: CreatorRecommendation) {
    return `${c.platform}:${c.handle}`;
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
    if (brief.campaignGoals.length === 0) {
      setError("Please select at least one campaign goal");
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

  const compareCreators = analysis?.recommendations.filter((c) =>
    compareIds.has(getCreatorKey(c))
  ) || [];

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <Shield className="w-12 h-12 text-accent mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Sign in to plan campaigns</h1>
          <p className="text-sm text-muted mb-6">
            Campaign planning is available for signed-in users. Create a free account to get started.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/auth/signin?callbackUrl=/campaign"
              className="bg-accent hover:bg-accent-light text-white px-6 py-3 rounded-xl font-medium text-sm transition text-center"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup?callbackUrl=/campaign"
              className="border border-border hover:border-accent/40 text-muted hover:text-foreground px-6 py-3 rounded-xl text-sm transition text-center"
            >
              Create Account
            </Link>
          </div>
          <Link href="/" className="inline-block text-xs text-muted hover:text-foreground mt-6 transition">
            ← Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-accent" />
            <span className="text-lg font-bold tracking-tight">
              NoCap<span className="text-accent">Verify</span>
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
        {!analysis && (
          <div className="max-w-2xl mx-auto mb-10">
            <div className="flex items-center justify-center gap-2">
              {[
                { num: 1, label: "Campaign Brief" },
                { num: 2, label: "Details & Budget" },
              ].map((s, i) => (
                <div key={s.num} className="flex items-center gap-2">
                  {i > 0 && (
                    <div className={`w-12 h-0.5 ${step >= s.num ? "bg-accent" : "bg-border"}`} />
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

        {/* Step 1 */}
        {step === 1 && !analysis && (
          <div className="max-w-2xl mx-auto animate-fade-in-up">
            <div className="text-center mb-8">
              <Target className="w-10 h-10 text-accent mx-auto mb-3" />
              <h1 className="text-3xl font-bold mb-2">Plan Your Campaign</h1>
              <p className="text-muted text-sm">Tell us about your campaign and our AI will find the best creators for you.</p>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Brand Name <span className="text-accent">*</span></label>
                <input type="text" value={brief.brandName} onChange={(e) => updateBrief({ brandName: e.target.value })} placeholder="e.g. BoAt, Mamaearth, Zerodha" className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Campaign Category <span className="text-accent">*</span></label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button key={cat} onClick={() => updateBrief({ category: cat })} className={`px-3 py-2 rounded-lg text-sm font-medium transition border ${brief.category === cat ? "bg-accent/20 border-accent text-accent" : "bg-card border-border text-muted hover:border-accent/50"}`}>{cat}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Campaign Goals <span className="text-accent">*</span>
                  <span className="text-xs text-muted font-normal ml-2">(select one or more)</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {GOALS.map((goal) => {
                    const isSelected = brief.campaignGoals.includes(goal.value);
                    return (
                      <button key={goal.value} onClick={() => toggleGoal(goal.value)} className={`flex items-start gap-3 p-4 rounded-xl border transition text-left ${isSelected ? "bg-accent/10 border-accent" : "bg-card border-border hover:border-accent/50"}`}>
                        <div className="relative mt-0.5 shrink-0">
                          <goal.icon className={`w-5 h-5 ${isSelected ? "text-accent" : "text-muted"}`} />
                          {isSelected && (
                            <CheckCircle2 className="w-3 h-3 text-accent absolute -top-1 -right-1" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{goal.label}</p>
                          <p className="text-xs text-muted mt-0.5">{goal.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {brief.campaignGoals.length > 1 && (
                  <p className="text-xs text-accent mt-2">{brief.campaignGoals.length} goals selected — AI will optimize for all of them</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Target Platforms <span className="text-accent">*</span></label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(["youtube", "instagram", "twitter", "linkedin"] as const).map((p) => (
                    <button key={p} onClick={() => togglePlatform(p)} className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-medium transition text-sm ${brief.platforms.includes(p) ? "bg-accent/10 border-accent text-accent" : "bg-card border-border text-muted hover:border-accent/50"}`}>
                      {p === "youtube" ? "▶ YouTube" : p === "instagram" ? "📷 Instagram" : p === "twitter" ? "𝕏 Twitter" : "💼 LinkedIn"}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={() => { if (!brief.brandName || !brief.category) { setError("Please fill in brand name and category"); return; } if (brief.campaignGoals.length === 0) { setError("Please select at least one campaign goal"); return; } setError(""); setStep(2); }} className="w-full bg-accent hover:bg-accent-light text-white py-4 rounded-xl font-semibold text-base transition flex items-center justify-center gap-2 cursor-pointer">
                Continue <ChevronRight className="w-5 h-5" />
              </button>
              {error && <p className="text-danger text-sm text-center">{error}</p>}
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && !analysis && (
          <div className="max-w-2xl mx-auto animate-fade-in-up">
            <div className="text-center mb-8">
              <DollarSign className="w-10 h-10 text-accent mx-auto mb-3" />
              <h1 className="text-3xl font-bold mb-2">Campaign Details</h1>
              <p className="text-muted text-sm">Help our AI understand your audience and budget.</p>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Target Audience <span className="text-accent">*</span></label>
                <input type="text" value={brief.targetAudience} onChange={(e) => updateBrief({ targetAudience: e.target.value })} placeholder="e.g. 18-35 year old males interested in tech, college students" className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Geography</label>
                <input type="text" value={brief.geography} onChange={(e) => updateBrief({ geography: e.target.value })} placeholder="e.g. India, Tier 1 cities, Pan-India Hindi speaking" className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Campaign Budget</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {BUDGETS.map((b) => (
                    <button key={b.value} onClick={() => updateBrief({ budgetRange: b.value as CampaignBrief["budgetRange"] })} className={`px-3 py-3 rounded-xl text-sm font-medium transition border text-left ${brief.budgetRange === b.value ? "bg-accent/20 border-accent text-accent" : "bg-card border-border text-muted hover:border-accent/50"}`}>
                      <p className="font-semibold">{b.label}</p>
                      <p className="text-[10px] opacity-70 mt-0.5">{b.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Campaign Description</label>
                <textarea value={brief.description} onChange={(e) => updateBrief({ description: e.target.value })} rows={3} placeholder="Describe what you're promoting, key messaging, any specific requirements..." className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Competitor Brands <span className="text-xs text-muted font-normal">(optional — helps AI generate unique ideas)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Noise, Fire-Boltt, boAt (comma-separated)"
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition"
                  onBlur={(e) => {
                    const brands = e.target.value
                      .split(",")
                      .map((b) => b.trim())
                      .filter(Boolean);
                    updateBrief({ competitorBrands: brands });
                  }}
                  defaultValue={brief.competitorBrands?.join(", ") || ""}
                />
                <p className="text-[10px] text-muted mt-1">AI will analyze their campaigns and generate ideas that stand apart</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="px-6 py-4 rounded-xl border border-border text-muted hover:text-foreground transition cursor-pointer">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button onClick={handleSubmit} disabled={loading} className="flex-1 bg-accent hover:bg-accent-light text-white py-4 rounded-xl font-semibold text-base transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
                  {loading ? (<><Loader2 className="w-5 h-5 animate-spin" /> AI is analyzing your campaign...</>) : (<><Sparkles className="w-5 h-5" /> Generate Campaign Ideas &amp; Find Creators</>)}
                </button>
              </div>
              {error && <p className="text-danger text-sm text-center">{error}</p>}
            </div>
          </div>
        )}

        {/* Step 3: Results */}
        {analysis && !showCompare && (
          <div className="max-w-4xl mx-auto animate-fade-in-up">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold">
                  Campaign Plan for <span className="text-accent">{analysis.brief.brandName}</span>
                </h1>
                <p className="text-sm text-muted mt-1">
                  {analysis.brief.category} · {(analysis.brief.campaignGoals || [analysis.brief.campaignGoal]).join(", ")} · {analysis.recommendations.length} creators found
                </p>
              </div>
              <button onClick={() => { setAnalysis(null); setStep(1); setCompareIds(new Set()); }} className="text-sm text-accent hover:text-accent-light transition">
                New Campaign
              </button>
            </div>

            <CollapsibleSection
              title="AI Strategy & Insights"
              icon={<Lightbulb className="w-4 h-4" />}
              preview={analysis.aiInsights.campaignStrategy.slice(0, 120) + "..."}
              defaultOpen={false}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <InsightCard icon={<Lightbulb className="w-5 h-5" />} title="Campaign Strategy" text={analysis.aiInsights.campaignStrategy} />
                <InsightCard icon={<Users className="w-5 h-5" />} title="Ideal Creator Profile" text={analysis.aiInsights.idealCreatorProfile} />
                <InsightCard icon={<DollarSign className="w-5 h-5" />} title="Budget Allocation" text={analysis.aiInsights.budgetAllocation} />
                <InsightCard icon={<BarChart3 className="w-5 h-5" />} title="Expected Outcomes" text={analysis.aiInsights.expectedOutcomes} />
              </div>

              {analysis.aiInsights.creativeIdeas && analysis.aiInsights.creativeIdeas.length > 0 && (
                <div className="bg-gradient-to-br from-accent/5 to-accent/10 border border-accent/20 rounded-2xl p-6 mb-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-accent mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Creative Campaign Ideas
                  </h3>
                  <div className="space-y-4">
                    {analysis.aiInsights.creativeIdeas.map((idea, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="w-7 h-7 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                        <p className="text-sm text-foreground leading-relaxed">{idea}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analysis.aiInsights.antiPatterns && analysis.aiInsights.antiPatterns.length > 0 && (
                <div className="bg-danger/5 border border-danger/20 rounded-2xl p-6 mb-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-danger mb-4 flex items-center gap-2">
                    <Ban className="w-4 h-4" /> What NOT to Do
                  </h3>
                  <div className="space-y-3">
                    {analysis.aiInsights.antiPatterns.map((pattern, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="text-danger font-bold shrink-0 mt-0.5">✕</span>
                        <p className="text-sm text-muted leading-relaxed">{pattern}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analysis.aiInsights.clicheApproaches && analysis.aiInsights.clicheApproaches.length > 0 && (
                <div className="bg-warning/5 border border-warning/20 rounded-2xl p-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-warning mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Cliché Approaches We Avoided
                  </h3>
                  <p className="text-[10px] text-muted mb-3">The AI identified these overdone approaches in {analysis.brief.category} and explicitly avoided them when generating ideas above.</p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.aiInsights.clicheApproaches.map((cliche, i) => (
                      <span key={i} className="text-[10px] bg-warning/10 text-warning/80 px-2.5 py-1 rounded-full border border-warning/20 line-through decoration-warning/40">
                        {cliche}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CollapsibleSection>

            {/* Feature 1: Creative Performance Benchmarks */}
            {analysis.aiInsights.benchmarks && analysis.aiInsights.benchmarks.topFormats.length > 0 && (
              <CollapsibleSection
                title={`Category Benchmarks — ${analysis.brief.category}`}
                icon={<Activity className="w-4 h-4" />}
                preview={`Top formats: ${analysis.aiInsights.benchmarks.topFormats.slice(0, 2).join(", ")}`}
                defaultOpen={false}
              >
              <div className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-blue-500/20 rounded-2xl p-6">
                <div className="hidden"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-[10px] text-muted font-bold uppercase tracking-wider mb-2">Top Content Formats</p>
                    <div className="space-y-1.5">
                      {analysis.aiInsights.benchmarks.topFormats.map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-bold shrink-0">{i + 1}</span>
                          <span className="text-foreground">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted font-bold uppercase tracking-wider mb-2">Engagement by Creator Tier</p>
                    <div className="space-y-1.5">
                      {analysis.aiInsights.benchmarks.engagementByTier.map((t, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-muted">{t.tier}</span>
                          <span className="font-bold text-accent">{t.rate}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {analysis.aiInsights.benchmarks.bestPostingCadence && (
                  <div className="bg-background/50 rounded-xl p-3 mb-2">
                    <p className="text-[10px] text-muted font-bold uppercase tracking-wider mb-1">Optimal Posting Cadence</p>
                    <p className="text-sm text-foreground">{analysis.aiInsights.benchmarks.bestPostingCadence}</p>
                  </div>
                )}
                {analysis.aiInsights.benchmarks.platformTip && (
                  <div className="bg-background/50 rounded-xl p-3">
                    <p className="text-[10px] text-muted font-bold uppercase tracking-wider mb-1">Platform Insight</p>
                    <p className="text-sm text-foreground">{analysis.aiInsights.benchmarks.platformTip}</p>
                  </div>
                )}
              </div>
              </CollapsibleSection>
            )}

            {/* Feature 2: Campaign Performance Predictor + Heatmap */}
            <CollapsibleSection
              title="Performance Predictions & Fit Heatmap"
              icon={<TrendingUp className="w-4 h-4" />}
              preview={`Budget: ${brief.budgetRange} · ${analysis.recommendations.length} creators scored`}
              defaultOpen={false}
            >
            {analysis.recommendations.length > 0 && (() => {
              const totalBudget = getBudgetNumber(brief.budgetRange);
              const perCreator = totalBudget / Math.min(analysis.recommendations.length, 5);
              const topCreators = analysis.recommendations.slice(0, 5);
              const aggregateROI = topCreators.map(c =>
                calculateROI(c.platform as "youtube" | "instagram" | "twitter" | "linkedin", c.subscriberCount, c.engagementRate, perCreator)
              );
              const totalImpressions = aggregateROI.reduce((s, r) => s + r.estimatedImpressions, 0);
              const totalEngagements = aggregateROI.reduce((s, r) => s + r.estimatedEngagements, 0);
              const avgCPM = totalImpressions > 0 ? Math.round((totalBudget / totalImpressions) * 1000) : 0;
              const avgCostPerEng = totalEngagements > 0 ? Math.round(totalBudget / totalEngagements) : 0;
              const ratingCounts = { Excellent: 0, Good: 0, Average: 0, "Below Average": 0 };
              aggregateROI.forEach(r => ratingCounts[r.roiRating]++);
              const overallRating = ratingCounts.Excellent >= 3 ? "Excellent" : ratingCounts.Good + ratingCounts.Excellent >= 3 ? "Good" : "Average";

              return (
                <div className="bg-gradient-to-br from-success/5 to-accent/5 border border-success/20 rounded-2xl p-6 mb-8">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-success mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> Predicted Campaign Outcomes
                  </h3>
                  <p className="text-[10px] text-muted mb-3">Based on top {topCreators.length} creators · Budget: {formatCurrency(totalBudget)}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-background/50 rounded-xl p-3">
                      <p className="text-[9px] text-muted">Total Est. Reach</p>
                      <p className="text-lg font-bold">{formatNumber(totalImpressions)}</p>
                    </div>
                    <div className="bg-background/50 rounded-xl p-3">
                      <p className="text-[9px] text-muted">Total Est. Engagements</p>
                      <p className="text-lg font-bold">{formatNumber(totalEngagements)}</p>
                    </div>
                    <div className="bg-background/50 rounded-xl p-3">
                      <p className="text-[9px] text-muted">Blended CPM</p>
                      <p className="text-lg font-bold">{formatCurrency(avgCPM)}</p>
                    </div>
                    <div className="bg-background/50 rounded-xl p-3">
                      <p className="text-[9px] text-muted">Cost/Engagement</p>
                      <p className="text-lg font-bold">{formatCurrency(avgCostPerEng)}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-[10px] text-muted">Overall ROI Rating:</span>
                    <span className={`text-sm font-bold ${overallRating === "Excellent" ? "text-success" : overallRating === "Good" ? "text-accent" : "text-warning"}`}>{overallRating}</span>
                  </div>
                </div>
              );
            })()}

            {/* Feature 5: Creator-Brand Fit Heatmap */}
            {analysis.recommendations.some(c => c.fitDimensions) && (
              <div className="bg-card rounded-2xl border border-border p-6 mb-8 overflow-x-auto">
                <h3 className="text-sm font-bold uppercase tracking-wider text-accent mb-4 flex items-center gap-2">
                  <Grid3X3 className="w-4 h-4" /> Creator-Brand Fit Heatmap
                </h3>
                <table className="w-full border-collapse min-w-[600px]">
                  <thead>
                    <tr>
                      <th className="text-left text-[10px] font-bold text-muted p-2 border-b border-border">Creator</th>
                      <th className="text-center text-[10px] font-bold text-muted p-2 border-b border-border">Audience</th>
                      <th className="text-center text-[10px] font-bold text-muted p-2 border-b border-border">Engagement</th>
                      <th className="text-center text-[10px] font-bold text-muted p-2 border-b border-border">Content</th>
                      <th className="text-center text-[10px] font-bold text-muted p-2 border-b border-border">Safety</th>
                      <th className="text-center text-[10px] font-bold text-muted p-2 border-b border-border">Value</th>
                      <th className="text-center text-[10px] font-bold text-muted p-2 border-b border-border">Overall</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.recommendations.filter(c => c.fitDimensions).slice(0, 10).map((c) => {
                      const d = c.fitDimensions!;
                      const cellColor = (v: number) =>
                        v >= 70 ? "bg-success/20 text-success" : v >= 40 ? "bg-warning/20 text-warning" : "bg-danger/20 text-danger";
                      return (
                        <tr key={c.handle} className="hover:bg-card/50">
                          <td className="p-2 border-b border-border/50">
                            <p className="text-xs font-bold truncate max-w-[120px]">{c.name}</p>
                            <p className="text-[9px] text-muted">@{c.handle}</p>
                          </td>
                          {[d.audienceMatch, d.engagementQuality, d.contentRelevance, d.brandSafety, d.valueForMoney].map((v, i) => (
                            <td key={i} className="p-2 border-b border-border/50 text-center">
                              <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded ${cellColor(v)}`}>{v}</span>
                            </td>
                          ))}
                          <td className="p-2 border-b border-border/50 text-center">
                            <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded ${cellColor(c.fitScore)}`}>{c.fitScore}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            </CollapsibleSection>

            <div className="bg-card rounded-2xl border border-border p-6 mb-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-accent mb-3">AI-Generated Creator Criteria</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-[10px] text-muted mb-1">Subscriber Range</p>
                  <p className="font-semibold">{formatNumber(analysis.criteria.subscriberRange.min)} - {formatNumber(analysis.criteria.subscriberRange.max)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted mb-1">Min. Engagement</p>
                  <p className="font-semibold">{analysis.criteria.engagementMin}%</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted mb-1">Audience</p>
                  <p className="font-semibold text-xs">{analysis.criteria.audienceMatch}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted mb-1">Platform Focus</p>
                  <p className="font-semibold text-xs">{analysis.criteria.platformFocus}</p>
                </div>
              </div>
              <p className="text-xs text-muted mt-3 border-t border-border pt-3">{analysis.criteria.reasoning}</p>
            </div>

            {compareIds.size >= 2 && (
              <div className="sticky top-14 z-40 bg-accent/10 border border-accent/30 rounded-xl p-3 mb-4 flex items-center justify-between backdrop-blur-md">
                <p className="text-sm font-medium text-accent">
                  <GitCompareArrows className="w-4 h-4 inline mr-1.5" />
                  {compareIds.size} creators selected for comparison
                </p>
                <button onClick={() => setShowCompare(true)} className="bg-accent text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-accent-light transition cursor-pointer">
                  Compare Now
                </button>
              </div>
            )}

            {analysis.platformNotes && analysis.platformNotes.length > 0 && (
              <div className="mb-4 space-y-2">
                {analysis.platformNotes.map((note, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-xl border px-4 py-3"
                    style={{
                      borderColor: note.type === "weak_category" ? "rgba(234,179,8,0.3)" : "rgba(59,130,246,0.3)",
                      background: note.type === "weak_category" ? "rgba(234,179,8,0.06)" : "rgba(59,130,246,0.06)",
                    }}
                  >
                    <AlertTriangle
                      className="w-4 h-4 mt-0.5 shrink-0"
                      style={{ color: note.type === "weak_category" ? "#eab308" : "#3b82f6" }}
                    />
                    <p className="text-sm text-muted">{note.message}</p>
                  </div>
                ))}
              </div>
            )}

            <h3 className="text-lg font-bold mb-4">
              <Star className="w-5 h-5 text-accent inline mr-2" />
              Recommended Creators
            </h3>

            {analysis.recommendations.length === 0 ? (
              <div className="bg-card rounded-2xl border border-border p-10 text-center">
                <Search className="w-10 h-10 text-muted mx-auto mb-3" />
                <p className="text-muted">No creators found matching the criteria. Try broadening your category or budget range.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {analysis.recommendations.map((creator, i) => (
                  <CreatorCard
                    key={creator.handle + i}
                    creator={creator}
                    budgetRange={brief.budgetRange}
                    onDeepReport={handleDeepReport}
                    isComparing={compareIds.has(getCreatorKey(creator))}
                    onToggleCompare={() => toggleCompare(getCreatorKey(creator))}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Comparison View */}
        {analysis && showCompare && (
          <ComparisonView creators={compareCreators} budgetRange={brief.budgetRange} onBack={() => setShowCompare(false)} />
        )}

        {/* Deliverable Brief Modal */}
        {selectedCreator && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 overflow-y-auto">
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedCreator(null)} />
            <div className="relative bg-card border border-border rounded-2xl w-full max-w-3xl mb-16 shadow-2xl">
              <div className="sticky top-0 bg-card rounded-t-2xl border-b border-border px-6 py-4 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <FileText className="w-5 h-5 text-accent" />
                    Deliverable Brief
                  </h2>
                  <p className="text-xs text-muted mt-0.5">For {selectedCreator.name} (@{selectedCreator.handle}) · {selectedCreator.platform}</p>
                </div>
                <button onClick={() => setSelectedCreator(null)} className="text-muted hover:text-foreground transition p-1"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6">
                {briefLoading && (
                  <div className="flex flex-col items-center py-16 gap-4">
                    <Loader2 className="w-8 h-8 text-accent animate-spin" />
                    <p className="text-sm text-muted">AI is crafting the deliverable brief &amp; creator script...</p>
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
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-accent mb-2">Campaign Overview</h3>
                      <p className="text-sm text-muted leading-relaxed">{deliverableBrief.overview}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-accent mb-2">Content Format</h3>
                      <div className="flex flex-wrap gap-2">
                        {deliverableBrief.contentFormat.map((f, i) => (
                          <span key={i} className="text-xs bg-accent/10 text-accent px-3 py-1.5 rounded-full">{f}</span>
                        ))}
                      </div>
                    </div>

                    {/* Creator Script */}
                    {deliverableBrief.creatorScript && (
                      <div className="bg-gradient-to-br from-accent/5 to-accent/10 border border-accent/30 rounded-xl p-5">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-accent mb-4 flex items-center gap-2">
                          <Clapperboard className="w-4 h-4" /> Creator Script
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <p className="text-[10px] text-accent font-bold uppercase tracking-wider mb-1">Hook (First 3 Seconds)</p>
                            <p className="text-sm text-foreground font-medium bg-background/50 rounded-lg p-3 border border-accent/20 italic">&ldquo;{deliverableBrief.creatorScript.hook}&rdquo;</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-accent font-bold uppercase tracking-wider mb-2">Talking Points</p>
                            <div className="space-y-2">
                              {deliverableBrief.creatorScript.body.map((point, i) => (
                                <div key={i} className="flex items-start gap-2 text-sm text-muted">
                                  <span className="w-5 h-5 rounded-full bg-accent/20 text-accent flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</span>
                                  {point}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-[10px] text-accent font-bold uppercase tracking-wider mb-1">Closing &amp; CTA</p>
                            <p className="text-sm text-foreground bg-background/50 rounded-lg p-3 border border-accent/20">{deliverableBrief.creatorScript.cta}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted font-bold uppercase tracking-wider mb-1">Production Notes</p>
                            <p className="text-xs text-muted leading-relaxed">{deliverableBrief.creatorScript.notes}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-accent mb-2">Key Messaging Points</h3>
                      <ul className="space-y-2">
                        {deliverableBrief.keyMessaging.map((msg, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted"><span className="text-accent font-bold mt-0.5">{i + 1}.</span>{msg}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-accent mb-2">Brand Guidelines</h3>
                      <ul className="space-y-1.5">
                        {deliverableBrief.brandGuidelines.map((g, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted"><Shield className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />{g}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-success/5 border border-success/20 rounded-xl p-4">
                        <h4 className="text-sm font-bold text-success mb-2 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" />Do&apos;s</h4>
                        <ul className="space-y-1.5">
                          {deliverableBrief.dosAndDonts.dos.map((d, i) => (
                            <li key={i} className="text-xs text-muted flex items-start gap-1.5"><span className="text-success">+</span> {d}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-danger/5 border border-danger/20 rounded-xl p-4">
                        <h4 className="text-sm font-bold text-danger mb-2 flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" />Don&apos;ts</h4>
                        <ul className="space-y-1.5">
                          {deliverableBrief.dosAndDonts.donts.map((d, i) => (
                            <li key={i} className="text-xs text-muted flex items-start gap-1.5"><span className="text-danger">-</span> {d}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-accent mb-2">Timeline</h3>
                      <div className="space-y-2">
                        {deliverableBrief.timeline.map((t, i) => (
                          <div key={i} className="flex items-start gap-3 bg-background/50 rounded-xl p-3">
                            <Clock className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-semibold">{t.phase} <span className="text-xs text-muted font-normal">({t.duration})</span></p>
                              <p className="text-xs text-muted mt-0.5">{t.details}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-accent mb-2">Deliverables</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {deliverableBrief.deliverables.map((d, i) => (
                          <div key={i} className="bg-background/50 rounded-xl p-3 border border-border">
                            <p className="text-sm font-semibold">{d.quantity}x {d.type}</p>
                            <p className="text-xs text-muted mt-0.5">{d.specs}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-accent mb-2 flex items-center gap-1.5"><Hash className="w-4 h-4" />Campaign Hashtags</h3>
                      <div className="flex flex-wrap gap-2">
                        {deliverableBrief.hashtags.map((h, i) => (
                          <span key={i} className="text-xs bg-card border border-border text-muted px-3 py-1.5 rounded-full">{h.startsWith("#") ? h : `#${h}`}</span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-accent/10 border border-accent/30 rounded-xl p-4">
                      <h3 className="text-sm font-bold text-accent mb-1">Call to Action</h3>
                      <p className="text-sm text-foreground">{deliverableBrief.callToAction}</p>
                    </div>
                    <div className="bg-background/50 rounded-xl p-4 border border-border">
                      <h3 className="text-sm font-bold text-foreground mb-1 flex items-center gap-1.5"><DollarSign className="w-4 h-4 text-accent" />Compensation</h3>
                      <p className="text-sm text-muted">{deliverableBrief.compensationNotes}</p>
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

function InsightCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  const sentences = text.split(/(?<=\.)\s+/).filter(Boolean);
  const highlight = sentences[0] || text;
  const rest = sentences.slice(1).join(" ");
  return (
    <div className="bg-card rounded-2xl border border-border p-5">
      <div className="flex items-center gap-2 mb-3 text-accent">{icon}<h4 className="text-xs font-bold uppercase tracking-wider">{title}</h4></div>
      <p className="text-sm text-foreground font-medium leading-relaxed mb-1">{highlight}</p>
      {rest && <p className="text-xs text-muted leading-relaxed">{rest}</p>}
    </div>
  );
}

function CollapsibleSection({ title, icon, preview, defaultOpen, children }: {
  title: string;
  icon: React.ReactNode;
  preview: string;
  defaultOpen: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-card rounded-2xl border border-border mb-6 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-card/80 transition"
      >
        <div className="flex items-center gap-2 text-accent">
          {icon}
          <h3 className="text-sm font-bold uppercase tracking-wider">{title}</h3>
        </div>
        <div className="flex items-center gap-3">
          {!open && <p className="text-xs text-muted hidden sm:block max-w-[300px] truncate">{preview}</p>}
          {open ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
        </div>
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}

function TrustBadge({ audit }: { audit: AuditResult }) {
  const config = {
    Trusted: { icon: ShieldCheck, color: "text-success", bg: "bg-success/10 border-success/30" },
    Caution: { icon: ShieldAlert, color: "text-warning", bg: "bg-warning/10 border-warning/30" },
    Suspicious: { icon: ShieldX, color: "text-danger", bg: "bg-danger/10 border-danger/30" },
  }[audit.verdict];
  const Icon = config.icon;
  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold ${config.bg} ${config.color}`}>
      <Icon className="w-3 h-3" />{audit.trustScore}% {audit.verdict}
    </div>
  );
}

function CreatorCard({ creator, budgetRange, onDeepReport, isComparing, onToggleCompare }: {
  creator: CreatorRecommendation;
  budgetRange: string;
  onDeepReport: (creator: CreatorRecommendation) => void;
  isComparing: boolean;
  onToggleCompare: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const scoreColor =
    creator.fitScore >= 70 ? "text-success border-success/30 bg-success/10"
    : creator.fitScore >= 40 ? "text-warning border-warning/30 bg-warning/10"
    : "text-danger border-danger/30 bg-danger/10";

  const pricing = estimateCreatorPricing(
    creator.platform as "youtube" | "instagram" | "twitter" | "linkedin",
    creator.subscriberCount,
    creator.engagementRate,
    creator.category
  );

  const audit = auditCreator(
    creator.platform as "youtube" | "instagram" | "twitter" | "linkedin",
    creator.subscriberCount,
    0,
    creator.engagementRate,
    creator.postCount || 0,
    creator.isVerified || false
  );

  const totalBudget = getBudgetNumber(budgetRange);
  const perCreatorBudget = totalBudget / 5;
  const roi = calculateROI(
    creator.platform as "youtube" | "instagram" | "twitter" | "linkedin",
    creator.subscriberCount,
    creator.engagementRate,
    perCreatorBudget
  );

  const mainRate = pricing.rates[0];

  const igUrl = creator.instagramUrl || (creator.platform === "instagram" ? `https://instagram.com/${creator.handle}` : null);

  return (
    <div className={`bg-card rounded-2xl border transition ${isComparing ? "border-accent" : "border-border hover:border-accent/30"}`}>
      <div className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <button onClick={onToggleCompare} className="mt-1 shrink-0 cursor-pointer">
            {isComparing ? <SquareCheck className="w-5 h-5 text-accent" /> : <Square className="w-5 h-5 text-muted hover:text-accent transition" />}
          </button>
          <CreatorAvatar src={creator.thumbnailUrl} name={creator.name} platform={creator.platform} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold truncate">{creator.name}</h4>
              {creator.isVerified && <BadgeCheck className="w-4 h-4 text-accent shrink-0" />}
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${scoreColor}`}>{creator.fitScore}%</span>
              <TrustBadge audit={audit} />
            </div>
            <div className="flex items-center gap-2 flex-wrap mt-0.5">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                creator.platform === "youtube" ? "bg-red-500/15 text-red-400 border border-red-500/30" :
                creator.platform === "instagram" ? "bg-pink-500/15 text-pink-400 border border-pink-500/30" :
                creator.platform === "twitter" ? "bg-sky-500/15 text-sky-400 border border-sky-500/30" :
                "bg-blue-500/15 text-blue-400 border border-blue-500/30"
              }`}>
                {creator.platform === "youtube" ? "▶ YouTube" : creator.platform === "instagram" ? "📷 Instagram" : creator.platform === "twitter" ? "𝕏 Twitter" : "💼 LinkedIn"}
              </span>
              {creator.otherPlatforms && creator.otherPlatforms.length > 0 && creator.otherPlatforms.map((p) => (
                <span key={p} className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  p === "youtube" ? "bg-red-500/10 text-red-400/70 border border-red-500/20" :
                  p === "instagram" ? "bg-pink-500/10 text-pink-400/70 border border-pink-500/20" :
                  p === "twitter" ? "bg-sky-500/10 text-sky-400/70 border border-sky-500/20" :
                  "bg-blue-500/10 text-blue-400/70 border border-blue-500/20"
                }`}>
                  {p === "youtube" ? "▶ YT" : p === "instagram" ? "📷 IG" : p === "twitter" ? "𝕏" : "💼 LI"}
                </span>
              ))}
              <p className="text-xs text-muted">
                @{creator.handle}
                {creator.isBusinessAccount && <span className="ml-1 text-accent">· Business</span>}
              </p>
              {igUrl && (
                <a
                  href={igUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] text-pink-400 hover:text-pink-300 transition"
                >
                  <Camera className="w-3 h-3" />
                  Instagram
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-3">
          <div className="bg-background/50 rounded-lg p-2">
            <p className="text-[9px] text-muted">{creator.platform === "youtube" ? "Subscribers" : "Followers"}</p>
            <p className="text-sm font-bold">{formatNumber(creator.subscriberCount)}</p>
          </div>
          <div className="bg-background/50 rounded-lg p-2">
            <p className="text-[9px] text-muted">Engagement</p>
            <p className="text-sm font-bold">{creator.engagementRate}%</p>
          </div>
          <div className="bg-background/50 rounded-lg p-2">
            <p className="text-[9px] text-muted">Est. Reach</p>
            <p className="text-sm font-bold">{formatNumber(creator.estimatedReach)}</p>
          </div>
          <div className="bg-background/50 rounded-lg p-2">
            <p className="text-[9px] text-muted flex items-center gap-0.5"><IndianRupee className="w-2.5 h-2.5" /> Est. Rate</p>
            <p className="text-sm font-bold text-accent">{formatPrice(mainRate.min)}-{formatPrice(mainRate.max)}</p>
          </div>
          <div className="bg-background/50 rounded-lg p-2">
            <p className="text-[9px] text-muted">ROI Rating</p>
            <p className={`text-sm font-bold ${roi.roiRating === "Excellent" ? "text-success" : roi.roiRating === "Good" ? "text-accent" : roi.roiRating === "Average" ? "text-warning" : "text-danger"}`}>
              {roi.roiRating}
            </p>
          </div>
        </div>

        {creator.performance && (
          <div className="mb-3 bg-background/30 rounded-lg p-3 border border-border/50">
            <p className="text-[9px] font-bold uppercase tracking-wider text-accent mb-2">Creator Performance</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {creator.performance.avgViews != null && (
                <div>
                  <p className="text-[9px] text-muted">Avg. Views</p>
                  <p className="text-sm font-bold">{formatNumber(creator.performance.avgViews)}</p>
                </div>
              )}
              <div>
                <p className="text-[9px] text-muted">Avg. Likes</p>
                <p className="text-sm font-bold">{formatNumber(creator.performance.avgLikes || 0)}</p>
              </div>
              <div>
                <p className="text-[9px] text-muted">Avg. Comments</p>
                <p className="text-sm font-bold">{formatNumber(creator.performance.avgComments || 0)}</p>
              </div>
              <div>
                <p className="text-[9px] text-muted">Engagement Rate</p>
                <p className="text-sm font-bold">{creator.engagementRate}%</p>
              </div>
            </div>
            {creator.performance.postsSampled && (
              <p className="text-[8px] text-muted mt-1.5">Based on {creator.performance.postsSampled} recent {creator.platform === "youtube" ? "videos" : "posts"}</p>
            )}
          </div>
        )}

        {/* Feature 3: Content Format Scoring */}
        {creator.formatScores && creator.formatScores.length > 0 && (
          <div className="mb-3 bg-background/30 rounded-lg p-3 border border-border/50">
            <p className="text-[9px] font-bold uppercase tracking-wider text-accent mb-2 flex items-center gap-1">
              <Flame className="w-3 h-3" /> Content Format Scores
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {creator.formatScores.map((fs, i) => (
                <div key={i} className="bg-background/50 rounded-lg p-2">
                  <div className="flex items-center gap-1">
                    <p className="text-[10px] font-semibold">{fs.format}</p>
                    {i === 0 && <span className="text-[8px] bg-accent/20 text-accent px-1 rounded">Best</span>}
                  </div>
                  <p className="text-xs font-bold">{fs.avgEngagement}% eng.</p>
                  {fs.avgViews != null && <p className="text-[9px] text-muted">{formatNumber(fs.avgViews)} avg views</p>}
                  <p className="text-[8px] text-muted">{fs.count} {creator.platform === "youtube" ? "videos" : "posts"}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-muted mb-3 leading-relaxed">{creator.fitReason}</p>

        <div className="flex items-center justify-between">
          <div className="flex gap-1.5 flex-wrap">
            <span className="text-[9px] bg-accent/10 text-accent px-2 py-0.5 rounded-full">{creator.category}</span>
            <span className="text-[9px] bg-accent/10 text-accent px-2 py-0.5 rounded-full">{pricing.tier} Tier</span>
            {creator.bestFormat && <span className="text-[9px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full">Best: {creator.bestFormat}</span>}
            {creator.contentStyle && <span className="text-[9px] bg-card border border-border text-muted px-2 py-0.5 rounded-full">{creator.contentStyle}</span>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => setExpanded(!expanded)} className="text-[10px] text-muted hover:text-foreground transition flex items-center gap-0.5 cursor-pointer">
              {expanded ? "Less" : "More"}{expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            <button onClick={() => onDeepReport(creator)} className="text-[10px] text-accent font-semibold hover:text-accent-light transition flex items-center gap-0.5 cursor-pointer">
              Deep Report <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border px-5 py-4 space-y-4 animate-fade-in-up">
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-accent mb-2 flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5" /> Pricing Estimates ({pricing.tier})
            </h5>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {pricing.rates.map((r) => (
                <div key={r.type} className="bg-background/50 rounded-lg p-2">
                  <p className="text-[9px] text-muted">{r.type}</p>
                  <p className="text-xs font-bold">{formatPrice(r.min)} - {formatPrice(r.max)}</p>
                </div>
              ))}
            </div>
            {pricing.premiumFactors.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {pricing.premiumFactors.map((f, i) => (
                  <span key={i} className="text-[9px] bg-accent/5 text-accent px-2 py-0.5 rounded-full border border-accent/20">{f}</span>
                ))}
              </div>
            )}
          </div>

          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-accent mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Trust Audit
            </h5>
            <p className="text-xs text-muted mb-2">{audit.summary}</p>
            <div className="space-y-1">
              {audit.flags.map((flag, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className={`shrink-0 mt-0.5 ${flag.type === "positive" ? "text-success" : flag.type === "warning" ? "text-warning" : "text-danger"}`}>
                    {flag.type === "positive" ? "+" : flag.type === "warning" ? "!" : "✕"}
                  </span>
                  <div><span className="font-medium">{flag.label}</span><span className="text-muted"> — {flag.detail}</span></div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-accent mb-2 flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5" /> ROI Estimate (per {formatCurrency(perCreatorBudget)} spend)
            </h5>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-background/50 rounded-lg p-2">
                <p className="text-[9px] text-muted">Est. Impressions</p>
                <p className="text-xs font-bold">{formatNumber(roi.estimatedImpressions)}</p>
              </div>
              <div className="bg-background/50 rounded-lg p-2">
                <p className="text-[9px] text-muted">Est. Engagements</p>
                <p className="text-xs font-bold">{formatNumber(roi.estimatedEngagements)}</p>
              </div>
              <div className="bg-background/50 rounded-lg p-2">
                <p className="text-[9px] text-muted">CPM</p>
                <p className="text-xs font-bold">{formatCurrency(roi.estimatedCPM)}</p>
              </div>
              <div className="bg-background/50 rounded-lg p-2">
                <p className="text-[9px] text-muted">Cost/Engagement</p>
                <p className="text-xs font-bold">{formatCurrency(roi.costPerEngagement)}</p>
              </div>
            </div>
          </div>

          {creator.topHashtags && creator.topHashtags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {creator.topHashtags.map((tag, i) => (
                <span key={i} className="text-[9px] bg-background/50 text-muted px-2 py-0.5 rounded-full">#{tag}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ComparisonView({ creators, budgetRange, onBack }: {
  creators: CreatorRecommendation[];
  budgetRange: string;
  onBack: () => void;
}) {
  const totalBudget = getBudgetNumber(budgetRange);
  const perCreator = totalBudget / creators.length;

  const data = creators.map((c) => ({
    creator: c,
    pricing: estimateCreatorPricing(c.platform as "youtube" | "instagram" | "twitter" | "linkedin", c.subscriberCount, c.engagementRate, c.category),
    audit: auditCreator(c.platform as "youtube" | "instagram" | "twitter" | "linkedin", c.subscriberCount, 0, c.engagementRate, c.postCount || 0, c.isVerified || false),
    roi: calculateROI(c.platform as "youtube" | "instagram" | "twitter" | "linkedin", c.subscriberCount, c.engagementRate, perCreator),
  }));

  const rows: { label: string; values: (d: typeof data[0]) => string }[] = [
    { label: "Platform", values: (d) => d.creator.platform.charAt(0).toUpperCase() + d.creator.platform.slice(1) },
    { label: "Followers", values: (d) => formatNumber(d.creator.subscriberCount) },
    { label: "Engagement", values: (d) => d.creator.engagementRate + "%" },
    { label: "Fit Score", values: (d) => d.creator.fitScore + "%" },
    { label: "Trust Score", values: (d) => d.audit.trustScore + "% " + d.audit.verdict },
    { label: "Tier", values: (d) => d.pricing.tier },
    { label: "Est. Rate", values: (d) => `${formatPrice(d.pricing.rates[0].min)}-${formatPrice(d.pricing.rates[0].max)}` },
    { label: "Est. Impressions", values: (d) => formatNumber(d.roi.estimatedImpressions) },
    { label: "CPM", values: (d) => formatCurrency(d.roi.estimatedCPM) },
    { label: "Cost/Engagement", values: (d) => formatCurrency(d.roi.costPerEngagement) },
    { label: "ROI Rating", values: (d) => d.roi.roiRating },
    { label: "Category", values: (d) => d.creator.category },
    { label: "Content Style", values: (d) => d.creator.contentStyle || "—" },
    { label: "Avg. Views", values: (d) => d.creator.performance?.avgViews != null ? formatNumber(d.creator.performance.avgViews) : "—" },
    { label: "Avg. Likes", values: (d) => d.creator.performance?.avgLikes != null ? formatNumber(d.creator.performance.avgLikes) : "—" },
    { label: "Avg. Comments", values: (d) => d.creator.performance?.avgComments != null ? formatNumber(d.creator.performance.avgComments) : "—" },
    { label: "Verified", values: (d) => d.creator.isVerified ? "Yes" : "No" },
  ];

  return (
    <div className="max-w-6xl mx-auto animate-fade-in-up">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 rounded-lg border border-border text-muted hover:text-foreground transition cursor-pointer">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GitCompareArrows className="w-6 h-6 text-accent" />Creator Comparison
          </h1>
          <p className="text-sm text-muted mt-0.5">Comparing {data.length} creators · Budget per creator: {formatCurrency(perCreator)}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left text-xs font-bold uppercase tracking-wider text-muted p-3 border-b border-border sticky left-0 bg-background min-w-[140px]">Metric</th>
              {data.map((d) => (
                <th key={d.creator.handle} className="text-center p-3 border-b border-border min-w-[160px]">
                  <div className="flex flex-col items-center gap-1">
                    <CreatorAvatar src={d.creator.thumbnailUrl} name={d.creator.name} platform={d.creator.platform} size="sm" />
                    <p className="text-xs font-bold truncate max-w-[140px]">{d.creator.name}</p>
                    <p className="text-[10px] text-muted">@{d.creator.handle}</p>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="hover:bg-card/50 transition">
                <td className="text-xs font-medium text-muted p-3 border-b border-border/50 sticky left-0 bg-background">{row.label}</td>
                {data.map((d) => {
                  const val = row.values(d);
                  let highlight = "";
                  if (row.label === "Trust Score") {
                    highlight = d.audit.verdict === "Trusted" ? "text-success" : d.audit.verdict === "Caution" ? "text-warning" : "text-danger";
                  } else if (row.label === "ROI Rating") {
                    highlight = val === "Excellent" ? "text-success" : val === "Good" ? "text-accent" : val === "Average" ? "text-warning" : "text-danger";
                  }
                  return (
                    <td key={d.creator.handle} className={`text-center text-xs font-semibold p-3 border-b border-border/50 ${highlight}`}>{val}</td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8">
        <h3 className="text-sm font-bold uppercase tracking-wider text-accent mb-4">Trust Audit Flags</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((d) => (
            <div key={d.creator.handle} className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-3">
                <p className="text-sm font-bold">{d.creator.name}</p>
                <TrustBadge audit={d.audit} />
              </div>
              <div className="space-y-1">
                {d.audit.flags.map((flag, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-[11px]">
                    <span className={`shrink-0 ${flag.type === "positive" ? "text-success" : flag.type === "warning" ? "text-warning" : "text-danger"}`}>
                      {flag.type === "positive" ? "+" : flag.type === "warning" ? "!" : "✕"}
                    </span>
                    <span className="text-muted">{flag.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

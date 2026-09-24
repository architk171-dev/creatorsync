"use client";

import { useState } from "react";
import {
  Shield,
  Search,
  Loader2,
  TrendingUp,
  Users,
  Eye,
  Hash,
  ArrowLeft,
  AlertTriangle,
  BarChart3,
} from "lucide-react";
import Link from "next/link";

interface CompetitorResult {
  brandName: string;
  mentions: CreatorMention[];
  summary: string;
}

interface CreatorMention {
  creatorName: string;
  platform: string;
  handle: string;
  followerCount: number;
  contentType: string;
  estimatedReach: number;
  context: string;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

export default function CompetitorPage() {
  const [brandNames, setBrandNames] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CompetitorResult[] | null>(null);
  const [error, setError] = useState("");

  async function handleSearch() {
    const brands = brandNames.split(",").map((b) => b.trim()).filter(Boolean);
    if (brands.length === 0) {
      setError("Enter at least one competitor brand name");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/competitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brands, category }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Search failed");
      }

      const data = await res.json();
      setResults(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-accent" />
            <span className="text-lg font-bold tracking-tight">
              Creator<span className="text-accent">Sync</span>
            </span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/campaign" className="text-muted hover:text-foreground transition">Campaign</Link>
            <span className="text-accent font-medium">Competitor Intel</span>
          </div>
        </div>
      </nav>

      <main className="pt-20 pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          {!results ? (
            <div className="animate-fade-in-up">
              <div className="text-center mb-8">
                <Eye className="w-10 h-10 text-accent mx-auto mb-3" />
                <h1 className="text-3xl font-bold mb-2">Competitor Campaign Tracker</h1>
                <p className="text-muted text-sm">See which creators your competitors are working with and what campaigns they&apos;re running.</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Competitor Brands <span className="text-accent">*</span></label>
                  <input
                    type="text"
                    value={brandNames}
                    onChange={(e) => setBrandNames(e.target.value)}
                    placeholder="e.g. BoAt, Noise, Fire-Boltt (comma-separated)"
                    className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition"
                  />
                  <p className="text-[10px] text-muted mt-1">Enter up to 3 competitor brand names, separated by commas</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Industry / Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Consumer Electronics, Beauty, Finance"
                    className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition"
                  />
                </div>

                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="w-full bg-accent hover:bg-accent-light text-white py-4 rounded-xl font-semibold text-base transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing competitor campaigns...</>
                  ) : (
                    <><Search className="w-5 h-5" /> Track Competitor Campaigns</>
                  )}
                </button>
                {error && <p className="text-danger text-sm text-center">{error}</p>}
              </div>
            </div>
          ) : (
            <div className="animate-fade-in-up">
              <div className="flex items-center gap-3 mb-8">
                <button onClick={() => setResults(null)} className="p-2 rounded-lg border border-border text-muted hover:text-foreground transition cursor-pointer">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold">Competitor Intelligence</h1>
                  <p className="text-sm text-muted mt-0.5">{results.length} brands analyzed</p>
                </div>
              </div>

              {results.map((result, idx) => (
                <div key={idx} className="mb-8">
                  <div className="bg-card rounded-2xl border border-border p-6 mb-4">
                    <h2 className="text-lg font-bold text-accent mb-2 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      {result.brandName}
                    </h2>
                    <p className="text-sm text-muted leading-relaxed">{result.summary}</p>
                    <div className="grid grid-cols-3 gap-3 mt-4">
                      <div className="bg-background/50 rounded-lg p-3 text-center">
                        <p className="text-[10px] text-muted">Creators Found</p>
                        <p className="text-xl font-bold text-accent">{result.mentions.length}</p>
                      </div>
                      <div className="bg-background/50 rounded-lg p-3 text-center">
                        <p className="text-[10px] text-muted">Total Reach</p>
                        <p className="text-xl font-bold">{formatNumber(result.mentions.reduce((s, m) => s + m.estimatedReach, 0))}</p>
                      </div>
                      <div className="bg-background/50 rounded-lg p-3 text-center">
                        <p className="text-[10px] text-muted">Platforms</p>
                        <p className="text-xl font-bold">{new Set(result.mentions.map((m) => m.platform)).size}</p>
                      </div>
                    </div>
                  </div>

                  {result.mentions.length > 0 ? (
                    <div className="space-y-3">
                      {result.mentions.map((mention, i) => (
                        <div key={i} className="bg-card rounded-xl border border-border p-4 hover:border-accent/30 transition">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="text-sm font-bold">{mention.creatorName}</h4>
                              <p className="text-xs text-muted">@{mention.handle} · <span className="capitalize">{mention.platform}</span></p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-bold">{formatNumber(mention.followerCount)} followers</p>
                              <p className="text-[10px] text-muted">{formatNumber(mention.estimatedReach)} reach</p>
                            </div>
                          </div>
                          <p className="text-xs text-muted leading-relaxed">{mention.context}</p>
                          <div className="flex gap-1.5 mt-2">
                            <span className="text-[9px] bg-accent/10 text-accent px-2 py-0.5 rounded-full">{mention.contentType}</span>
                            <span className="text-[9px] bg-card border border-border text-muted px-2 py-0.5 rounded-full capitalize">{mention.platform}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-card rounded-xl border border-border p-6 text-center">
                      <AlertTriangle className="w-6 h-6 text-muted mx-auto mb-2" />
                      <p className="text-sm text-muted">No creator campaigns found for this brand.</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

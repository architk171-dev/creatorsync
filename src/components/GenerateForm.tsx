"use client";

import { useState } from "react";
import { Play, Camera, Mail, Loader2, AlertCircle } from "lucide-react";
import { ReportData } from "@/lib/types";
import ReportPreview from "./ReportPreview";

export default function GenerateForm() {
  const [youtubeHandle, setYoutubeHandle] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState<ReportData | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ youtubeHandle, instagramHandle, email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setReport(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (report) {
    return <ReportPreview report={report} />;
  }

  return (
    <section id="generate" className="py-16 px-4">
      <div className="max-w-lg mx-auto">
        <h2 className="text-2xl font-bold text-center mb-2">
          Generate Verified Report
        </h2>
        <p className="text-muted text-sm text-center mb-8">
          Enter a creator&apos;s handle to generate an API-verified report
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-muted mb-1.5 block">
              YouTube Channel *
            </label>
            <div className="relative">
              <Play className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-danger" />
              <input
                type="text"
                placeholder="@handle or channel URL"
                value={youtubeHandle}
                onChange={(e) => setYoutubeHandle(e.target.value)}
                className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent transition"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-muted mb-1.5 block">
              Instagram Handle (optional)
            </label>
            <div className="relative">
              <Camera className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E4405F]" />
              <input
                type="text"
                placeholder="@handle"
                value={instagramHandle}
                onChange={(e) => setInstagramHandle(e.target.value)}
                className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent transition"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-muted mb-1.5 block">
              Your Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="email"
                required
                placeholder="you@agency.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent transition"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-danger text-sm bg-danger/10 border border-danger/20 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (!youtubeHandle && !instagramHandle)}
            className="w-full bg-accent hover:bg-accent-light disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Fetching live data...
              </>
            ) : (
              "Generate Report"
            )}
          </button>

          <p className="text-xs text-muted text-center">
            Preview is free. Full report unlocked after payment.
          </p>
        </form>
      </div>
    </section>
  );
}

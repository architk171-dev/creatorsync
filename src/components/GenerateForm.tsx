"use client";

import { useState } from "react";
import { Play, Camera, Mail, Loader2, AlertCircle, X } from "lucide-react";
import { ReportData } from "@/lib/types";
import ReportPreview from "./ReportPreview";

export default function GenerateForm() {
  const [youtubeHandle, setYoutubeHandle] = useState("");
  const [instagramHandles, setInstagramHandles] = useState<string[]>([]);
  const [igInput, setIgInput] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState<ReportData | null>(null);

  function addInstagramHandle() {
    const handle = igInput.trim().replace(/^@/, "");
    if (handle && !instagramHandles.includes(handle)) {
      setInstagramHandles((prev) => [...prev, handle]);
    }
    setIgInput("");
  }

  function removeHandle(handle: string) {
    setInstagramHandles((prev) => prev.filter((h) => h !== handle));
  }

  function handleIgKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addInstagramHandle();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          youtubeHandle,
          instagramHandle: instagramHandles[0] || "",
          instagramHandles,
          email,
        }),
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
              Instagram Handles <span className="text-muted/50">(optional, add multiple)</span>
            </label>
            <div className="relative">
              <Camera className="absolute left-3 top-3 w-4 h-4 text-[#E4405F]" />
              <div className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2 min-h-[44px] flex flex-wrap gap-1.5 items-center focus-within:border-accent transition">
                {instagramHandles.map((handle) => (
                  <span
                    key={handle}
                    className="inline-flex items-center gap-1 bg-accent/10 text-accent text-xs px-2.5 py-1 rounded-full"
                  >
                    @{handle}
                    <button
                      type="button"
                      onClick={() => removeHandle(handle)}
                      className="hover:text-danger transition cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder={instagramHandles.length === 0 ? "Type handle and press Enter" : "Add another..."}
                  value={igInput}
                  onChange={(e) => setIgInput(e.target.value.replace(",", ""))}
                  onKeyDown={handleIgKeyDown}
                  onBlur={addInstagramHandle}
                  className="flex-1 min-w-[120px] bg-transparent text-sm text-foreground placeholder:text-muted/50 focus:outline-none py-1"
                />
              </div>
            </div>
            <p className="text-[10px] text-muted mt-1">Press Enter or comma to add each handle. No @ needed.</p>
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
            disabled={loading || (!youtubeHandle && instagramHandles.length === 0)}
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
            Free preview with all metrics visible.
          </p>
        </form>
      </div>
    </section>
  );
}

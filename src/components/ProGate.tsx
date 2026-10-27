"use client";

import { Sparkles, Loader2 } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function ProGate({ feature }: { feature: string }) {
  const [loading, setLoading] = useState(false);

  async function upgrade() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <Sparkles className="w-12 h-12 text-accent mx-auto mb-4" />
        <h1 className="text-xl font-bold mb-2">{feature} is a Pro feature</h1>
        <p className="text-sm text-muted mb-6">
          Upgrade to NoCap Verify Pro for unlimited access to {feature.toLowerCase()} and more.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={upgrade}
            disabled={loading}
            className="bg-accent hover:bg-accent-light text-white px-6 py-3 rounded-xl font-medium text-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upgrade to Pro"}
          </button>
          <Link
            href="/pricing"
            className="border border-border hover:border-accent/40 text-muted hover:text-foreground px-6 py-3 rounded-xl text-sm transition text-center"
          >
            See pricing
          </Link>
        </div>
        <Link href="/" className="inline-block text-xs text-muted hover:text-foreground mt-6 transition">
          ← Back to home
        </Link>
      </div>
    </div>
  );
}

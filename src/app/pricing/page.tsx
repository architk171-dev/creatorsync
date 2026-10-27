"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Check, Loader2, Shield } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

const FREE_FEATURES = [
  "Creator pricing estimates",
  "Fake follower & engagement audit",
  "ROI calculator",
  "Verified creator reports",
];

const PRO_FEATURES = [
  "Everything in Free",
  "AI Campaign Planner",
  "Competitor Campaign Tracker",
  "Unlimited verified reports",
  "Priority support",
];

export default function PricingPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const upgraded = searchParams.get("upgraded");
  const [loading, setLoading] = useState(false);

  const isPro = session?.user?.plan === "pro";

  async function upgrade() {
    if (status === "unauthenticated") {
      window.location.href = "/auth/signin?callbackUrl=/pricing";
      return;
    }
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
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-28 pb-20 px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Simple, transparent pricing</h1>
          <p className="text-muted text-sm">
            Start free. Upgrade when you need campaign planning and competitor intel.
          </p>
          {upgraded && (
            <p className="mt-4 inline-flex items-center gap-2 text-xs bg-accent/10 text-accent px-3 py-1.5 rounded-full">
              <Check className="w-3.5 h-3.5" /> Checkout complete — your plan updates once payment is confirmed.
            </p>
          )}
        </div>

        <div className="max-w-3xl mx-auto grid sm:grid-cols-2 gap-6">
          {/* Free */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-1">Free</h2>
            <p className="text-3xl font-bold font-mono mb-4">
              ₹0<span className="text-sm font-normal text-muted">/mo</span>
            </p>
            <ul className="space-y-2.5 mb-6">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-muted">
                  <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/"
              className="block text-center border border-border hover:border-accent/40 text-foreground px-5 py-2.5 rounded-xl text-sm font-medium transition"
            >
              {isPro ? "Included" : "Current plan"}
            </Link>
          </div>

          {/* Pro */}
          <div className="bg-gradient-to-br from-accent/10 to-card border-2 border-accent/40 rounded-2xl p-6 relative">
            <span className="absolute -top-3 left-6 bg-accent text-white text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full">
              Recommended
            </span>
            <h2 className="text-lg font-bold mb-1 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-accent" /> Pro
            </h2>
            <p className="text-3xl font-bold font-mono mb-4">
              ₹999<span className="text-sm font-normal text-muted">/mo</span>
            </p>
            <ul className="space-y-2.5 mb-6">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                  <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={upgrade}
              disabled={loading || isPro}
              className="w-full bg-accent hover:bg-accent-light text-white px-5 py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isPro ? (
                "Current plan"
              ) : (
                "Upgrade to Pro"
              )}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { CheckCircle2, Loader2, Target, Eye, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";

const POLL_INTERVAL_MS = 2000;
const MAX_ATTEMPTS = 10; // ~20s — webhook usually lands in a couple of seconds

export default function UpgradeSuccessPage() {
  const { data: session, status, update } = useSession();
  const [attempts, setAttempts] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isPro = session?.user?.plan === "pro";
  const timedOut = attempts >= MAX_ATTEMPTS && !isPro;

  useEffect(() => {
    if (status !== "authenticated" || isPro || attempts >= MAX_ATTEMPTS) return;

    timerRef.current = setTimeout(async () => {
      await update();
      setAttempts((a) => a + 1);
    }, POLL_INTERVAL_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [status, isPro, attempts, update]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background flex items-center justify-center px-4 pt-20 pb-16">
        <div className="max-w-md w-full text-center">
          {status === "unauthenticated" ? (
            <>
              <CheckCircle2 className="w-14 h-14 text-accent mx-auto mb-4" />
              <h1 className="text-xl font-bold mb-2">Payment received</h1>
              <p className="text-sm text-muted mb-6">
                Sign in to see your updated plan.
              </p>
              <Link
                href="/auth/signin?callbackUrl=/upgrade/success"
                className="bg-accent hover:bg-accent-light text-white px-6 py-3 rounded-xl font-medium text-sm transition inline-block"
              >
                Sign In
              </Link>
            </>
          ) : status === "loading" || (!isPro && !timedOut) ? (
            <>
              <Loader2 className="w-10 h-10 text-accent mx-auto mb-4 animate-spin" />
              <h1 className="text-xl font-bold mb-2">Confirming your payment</h1>
              <p className="text-sm text-muted">
                This usually takes a few seconds while we verify it with Dodo Payments.
              </p>
            </>
          ) : isPro ? (
            <>
              <CheckCircle2 className="w-14 h-14 text-success mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">You&apos;re on Pro</h1>
              <p className="text-sm text-muted mb-8">
                Payment confirmed. Here&apos;s what just unlocked:
              </p>

              <div className="space-y-3 mb-8 text-left">
                <div className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
                  <Target className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold">AI Campaign Planner</p>
                    <p className="text-xs text-muted mt-0.5">
                      Describe a campaign and get a ranked creator shortlist with deliverable briefs.
                    </p>
                  </div>
                </div>
                <div className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
                  <Eye className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold">Competitor Campaign Tracker</p>
                    <p className="text-xs text-muted mt-0.5">
                      See which creators your competitors work with and what they're running.
                    </p>
                  </div>
                </div>
                <div className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold">Unlimited verified reports</p>
                    <p className="text-xs text-muted mt-0.5">
                      No cap on creator reports, trust scores, or ROI calculations.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Link
                  href="/campaign"
                  className="bg-accent hover:bg-accent-light text-white px-6 py-3 rounded-xl font-medium text-sm transition"
                >
                  Plan your first campaign
                </Link>
                <Link
                  href="/competitor"
                  className="border border-border hover:border-accent/40 text-foreground px-6 py-3 rounded-xl font-medium text-sm transition"
                >
                  Track a competitor
                </Link>
              </div>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-14 h-14 text-accent mx-auto mb-4" />
              <h1 className="text-xl font-bold mb-2">Payment received</h1>
              <p className="text-sm text-muted mb-6">
                We&apos;re still confirming it on our end — this can occasionally take a minute.
                Your account will unlock automatically once it's done.
              </p>
              <button
                onClick={() => {
                  setAttempts(0);
                }}
                className="bg-accent hover:bg-accent-light text-white px-6 py-3 rounded-xl font-medium text-sm transition"
              >
                Check again
              </button>
            </>
          )}
        </div>
      </main>
    </>
  );
}

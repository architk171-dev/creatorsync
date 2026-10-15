"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  User,
  Mail,
  Calendar,
  Target,
  FileText,
  Activity,
  ArrowLeft,
  Loader2,
  LogIn,
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

interface ProfileData {
  user: {
    id: string;
    name: string;
    email: string;
    avatar_url: string | null;
    provider: string;
    created_at: string;
  };
  campaigns: Array<{
    id: string;
    created_at: string;
    properties: Record<string, any>;
  }>;
  reports: Array<{
    id: string;
    created_at: string;
    properties: Record<string, any>;
  }>;
  totalEvents: number;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") return;
    if (status === "authenticated") {
      fetch("/api/profile")
        .then((r) => r.json())
        .then(setProfile)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [status]);

  if (status === "loading" || (status === "authenticated" && loading)) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-accent" />
        </div>
      </>
    );
  }

  if (status === "unauthenticated") {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
          <div className="text-center">
            <User className="w-12 h-12 text-muted mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">Sign in to view your profile</h1>
            <p className="text-sm text-muted mb-6">
              Track your campaigns, reports, and account details.
            </p>
            <Link
              href="/auth/signin"
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent-light text-white px-6 py-3 rounded-xl font-medium text-sm transition"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-20 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground transition mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          {/* User Info Card */}
          <div className="bg-card border border-border rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-4">
              {profile?.user.avatar_url ? (
                <img
                  src={profile.user.avatar_url}
                  alt=""
                  className="w-16 h-16 rounded-full border-2 border-border"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
                  <User className="w-8 h-8 text-accent" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold truncate">
                  {profile?.user.name || "User"}
                </h1>
                <div className="flex items-center gap-1.5 text-sm text-muted mt-1">
                  <Mail className="w-3.5 h-3.5" />
                  <span className="truncate">{profile?.user.email}</span>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Joined{" "}
                    {profile?.user.created_at
                      ? new Date(profile.user.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </span>
                  <span className="px-2 py-0.5 bg-accent/10 text-accent rounded-full capitalize">
                    {profile?.user.provider || "email"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <Target className="w-5 h-5 text-accent mx-auto mb-1" />
              <p className="text-2xl font-bold font-mono">
                {profile?.campaigns.length || 0}
              </p>
              <p className="text-xs text-muted">Campaigns</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <FileText className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <p className="text-2xl font-bold font-mono">
                {profile?.reports.length || 0}
              </p>
              <p className="text-xs text-muted">Reports</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <Activity className="w-5 h-5 text-green-400 mx-auto mb-1" />
              <p className="text-2xl font-bold font-mono">
                {profile?.totalEvents || 0}
              </p>
              <p className="text-xs text-muted">Total Actions</p>
            </div>
          </div>

          {/* Campaign History */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Target className="w-4 h-4 text-accent" />
                Campaign History
              </h2>
            </div>

            {profile?.campaigns && profile.campaigns.length > 0 ? (
              <div className="divide-y divide-border">
                {profile.campaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="px-5 py-3.5 hover:bg-background/50 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">
                          {campaign.properties?.brand_name ||
                            campaign.properties?.category ||
                            "Campaign"}
                        </p>
                        <p className="text-xs text-muted mt-0.5">
                          {campaign.properties?.category && (
                            <span className="mr-2">{campaign.properties.category}</span>
                          )}
                          {campaign.properties?.platforms && (
                            <span className="text-muted/60">
                              {(campaign.properties.platforms as string[])?.join(", ")}
                            </span>
                          )}
                        </p>
                      </div>
                      <span className="text-xs text-muted whitespace-nowrap">
                        {new Date(campaign.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-5 py-12 text-center">
                <Target className="w-8 h-8 text-muted/30 mx-auto mb-2" />
                <p className="text-sm text-muted">No campaigns yet</p>
                <Link
                  href="/campaign"
                  className="inline-block text-xs text-accent hover:underline mt-1"
                >
                  Plan your first campaign
                </Link>
              </div>
            )}
          </div>

          {/* Reports History */}
          {profile?.reports && profile.reports.length > 0 && (
            <div className="bg-card border border-border rounded-2xl overflow-hidden mt-4">
              <div className="px-5 py-4 border-b border-border">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  Creator Reports
                </h2>
              </div>
              <div className="divide-y divide-border">
                {profile.reports.map((report) => (
                  <div
                    key={report.id}
                    className="px-5 py-3.5 hover:bg-background/50 transition"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">
                        {report.properties?.creator_name ||
                          report.properties?.youtube_handle ||
                          "Creator Report"}
                      </p>
                      <span className="text-xs text-muted whitespace-nowrap">
                        {new Date(report.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

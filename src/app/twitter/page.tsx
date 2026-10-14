"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Search, AtSign, Users, MessageSquare, BadgeCheck, Shield, Loader2 } from "lucide-react";

interface TwitterProfile {
  userId: string;
  username: string;
  name: string;
  bio: string | null;
  location: string | null;
  profileImageUrl: string;
  bannerUrl: string | null;
  isVerified: boolean;
  followerCount: number;
  followingCount: number;
  tweetCount: number;
  mediaCount: number;
  createdAt: string;
  isProtected: boolean;
  profileUrl: string;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

export default function TwitterPage() {
  const [input, setInput] = useState("");
  const [profiles, setProfiles] = useState<TwitterProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const handles = input
        .split(/[,\n]+/)
        .map((h) => h.trim())
        .filter(Boolean);

      const res = await fetch("/api/twitter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handles }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch");
      setProfiles(data.profiles || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 pt-24 pb-16">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-card border border-border rounded-full px-4 py-1.5 text-sm text-muted mb-4">
            <AtSign className="w-4 h-4 text-accent" />
            Twitter / X Creator Discovery
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Discover <span className="text-accent">Twitter</span> Creators
          </h1>
          <p className="text-muted max-w-xl mx-auto">
            Look up Twitter/X profiles by handle. Enter one or more usernames
            (comma or newline separated) to pull live profile data.
          </p>
        </div>

        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={"@elonmusk, @mkbhd, @naval\nor paste handles one per line..."}
              rows={3}
              className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="mt-3 w-full bg-accent hover:bg-accent-light disabled:opacity-50 text-white py-3 rounded-xl font-medium transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Fetching profiles...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Look Up Profiles
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="max-w-2xl mx-auto mb-8 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {searched && !loading && profiles.length === 0 && !error && (
          <div className="text-center text-muted py-12">
            <Shield className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>No profiles found. Check the handles and try again.</p>
          </div>
        )}

        {profiles.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {profiles.map((p) => (
              <a
                key={p.userId}
                href={p.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-card border border-border rounded-2xl p-5 hover:border-accent/40 transition group"
              >
                <div className="flex items-start gap-3 mb-3">
                  {p.profileImageUrl ? (
                    <img
                      src={p.profileImageUrl}
                      alt={p.name}
                      className="w-12 h-12 rounded-full object-cover border border-border"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                      <AtSign className="w-5 h-5 text-accent" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold truncate">{p.name}</span>
                      {p.isVerified && (
                        <BadgeCheck className="w-4 h-4 text-accent flex-shrink-0" />
                      )}
                    </div>
                    <span className="text-sm text-muted">@{p.username}</span>
                  </div>
                </div>

                {p.bio && (
                  <p className="text-sm text-muted mb-3 line-clamp-2">{p.bio}</p>
                )}

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-background/50 rounded-lg py-2">
                    <div className="flex items-center justify-center gap-1 text-xs text-muted mb-0.5">
                      <Users className="w-3 h-3" />
                      Followers
                    </div>
                    <span className="text-sm font-semibold">{formatCount(p.followerCount)}</span>
                  </div>
                  <div className="bg-background/50 rounded-lg py-2">
                    <div className="flex items-center justify-center gap-1 text-xs text-muted mb-0.5">
                      <MessageSquare className="w-3 h-3" />
                      Tweets
                    </div>
                    <span className="text-sm font-semibold">{formatCount(p.tweetCount)}</span>
                  </div>
                  <div className="bg-background/50 rounded-lg py-2">
                    <div className="text-xs text-muted mb-0.5">Media</div>
                    <span className="text-sm font-semibold">{formatCount(p.mediaCount)}</span>
                  </div>
                </div>

                {p.location && (
                  <p className="text-xs text-muted mt-2">📍 {p.location}</p>
                )}
              </a>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

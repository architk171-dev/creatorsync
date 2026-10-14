"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Search, Link2, Users, Briefcase, BadgeCheck, Shield, Loader2 } from "lucide-react";

interface LinkedInProfile {
  publicIdentifier: string;
  linkedinUrl: string;
  firstName: string;
  lastName: string;
  fullName: string;
  headline: string;
  about: string | null;
  location: string | null;
  industry: string | null;
  followerCount: number;
  connectionsCount: number;
  isVerified: boolean;
  isInfluencer: boolean;
  isCreator: boolean;
  isPremium: boolean;
  profilePicUrl: string | null;
  currentPosition: { title: string; company: string } | null;
  topSkills: string[];
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

export default function LinkedInPage() {
  const [input, setInput] = useState("");
  const [profiles, setProfiles] = useState<LinkedInProfile[]>([]);
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

      const res = await fetch("/api/linkedin", {
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
            <Link2 className="w-4 h-4 text-accent" />
            LinkedIn Creator Discovery
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Discover <span className="text-accent">LinkedIn</span> Creators
          </h1>
          <p className="text-muted max-w-xl mx-auto">
            Look up LinkedIn profiles by URL or username. Enter profile URLs
            or usernames (comma or newline separated) to pull live data.
          </p>
        </div>

        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={"https://linkedin.com/in/satyanadella\nhttps://linkedin.com/in/garyvee\nor just: satyanadella, garyvee"}
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
            <p>No profiles found. Check the URLs/usernames and try again.</p>
          </div>
        )}

        {profiles.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {profiles.map((p) => (
              <a
                key={p.publicIdentifier}
                href={p.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-card border border-border rounded-2xl p-5 hover:border-accent/40 transition group"
              >
                <div className="flex items-start gap-3 mb-3">
                  {p.profilePicUrl ? (
                    <img
                      src={p.profilePicUrl}
                      alt={p.fullName}
                      className="w-12 h-12 rounded-full object-cover border border-border"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                      <Link2 className="w-5 h-5 text-accent" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold truncate">{p.fullName}</span>
                      {(p.isInfluencer || p.isPremium) && (
                        <BadgeCheck className="w-4 h-4 text-accent flex-shrink-0" />
                      )}
                    </div>
                    {p.headline && (
                      <p className="text-xs text-muted truncate">{p.headline}</p>
                    )}
                  </div>
                </div>

                {p.currentPosition && (
                  <div className="flex items-center gap-1.5 text-sm text-muted mb-2">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span className="truncate">
                      {p.currentPosition.title} at {p.currentPosition.company}
                    </span>
                  </div>
                )}

                {p.about && (
                  <p className="text-sm text-muted mb-3 line-clamp-2">{p.about}</p>
                )}

                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-background/50 rounded-lg py-2">
                    <div className="flex items-center justify-center gap-1 text-xs text-muted mb-0.5">
                      <Users className="w-3 h-3" />
                      Followers
                    </div>
                    <span className="text-sm font-semibold">{formatCount(p.followerCount)}</span>
                  </div>
                  <div className="bg-background/50 rounded-lg py-2">
                    <div className="text-xs text-muted mb-0.5">Connections</div>
                    <span className="text-sm font-semibold">{formatCount(p.connectionsCount)}</span>
                  </div>
                </div>

                {p.topSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {p.topSkills.slice(0, 4).map((skill) => (
                      <span
                        key={skill}
                        className="text-xs bg-accent/10 text-accent rounded-full px-2 py-0.5"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

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

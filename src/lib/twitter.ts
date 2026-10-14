export interface TwitterProfile {
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

const APIFY_TOKEN = process.env.APIFY_API_TOKEN;

export async function getTwitterProfiles(
  usernames: string[]
): Promise<TwitterProfile[]> {
  const cleaned = usernames
    .map((u) =>
      u.trim()
        .replace(/^@/, "")
        .replace(/^https?:\/\/(www\.)?(twitter\.com|x\.com)\//, "")
        .replace(/[?#/].*$/, "")
    )
    .filter(Boolean);

  if (cleaned.length === 0) return [];

  const batch = cleaned.slice(0, 3);
  console.log(`Apify Twitter: fetching ${batch.length} profiles: ${batch.join(", ")}`);
  const startTime = Date.now();

  try {
    const res = await fetch(
      "https://api.apify.com/v2/acts/igview-owner~x-twitter-profile-viewer/run-sync-get-dataset-items?token=" +
        APIFY_TOKEN +
        "&timeout=15",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernames: batch }),
        signal: AbortSignal.timeout(18000),
        cache: "no-store",
      }
    );

    console.log(`Apify Twitter responded: ${res.status} in ${Date.now() - startTime}ms`);

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`Apify Twitter error: ${res.status} - ${text.slice(0, 200)}`);
      return [];
    }

    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data
      .filter((p: Record<string, unknown>) => p.username && p.followers_count !== undefined)
      .map((p: Record<string, unknown>) => parseTwitterProfile(p));
  } catch (e) {
    console.error(`Apify Twitter failed after ${Date.now() - startTime}ms:`, e);
    return [];
  }
}

function parseTwitterProfile(raw: Record<string, unknown>): TwitterProfile {
  return {
    userId: String(raw.user_id || ""),
    username: String(raw.username || ""),
    name: String(raw.name || raw.username || ""),
    bio: raw.bio ? String(raw.bio) : null,
    location: raw.location ? String(raw.location) : null,
    profileImageUrl: String(raw.profile_image || ""),
    bannerUrl: raw.profile_banner ? String(raw.profile_banner) : null,
    isVerified: Boolean(raw.is_blue_verified),
    followerCount: Number(raw.followers_count) || 0,
    followingCount: Number(raw.following_count) || 0,
    tweetCount: Number(raw.tweets_count) || 0,
    mediaCount: Number(raw.media_count) || 0,
    createdAt: String(raw.created_at || ""),
    isProtected: Boolean(raw.is_protected),
    profileUrl: `https://x.com/${raw.username}`,
  };
}

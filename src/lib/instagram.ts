import { InstagramProfile, InstagramPost } from "./types";

const APIFY_TOKEN = process.env.APIFY_API_TOKEN;

export async function getInstagramProfiles(
  usernames: string[]
): Promise<InstagramProfile[]> {
  const cleaned = usernames.map((u) =>
    u.trim()
      .replace(/^@/, "")
      .replace(/^https?:\/\/(www\.)?instagram\.com\//, "")
      .replace(/[?#].*$/, "")
      .replace(/\/$/, "")
  ).filter(Boolean);

  if (cleaned.length === 0) return [];

  const batch = cleaned.slice(0, 1);

  console.log(`Apify IG batch: fetching ${batch.length} profiles: ${batch.join(", ")}`);
  const startTime = Date.now();

  try {
    const res = await fetch(
      "https://api.apify.com/v2/acts/apify~instagram-profile-scraper/run-sync-get-dataset-items?token=" +
        APIFY_TOKEN +
        "&timeout=15",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernames: batch, resultsLimit: 3 }),
        signal: AbortSignal.timeout(18000),
        cache: "no-store",
      }
    );

    console.log(`Apify IG batch responded: ${res.status} in ${Date.now() - startTime}ms`);

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`Apify batch error: ${res.status} - ${text.slice(0, 200)}`);
      return [];
    }

    const data = await res.json();
    if (!Array.isArray(data)) {
      console.error("Apify returned non-array:", JSON.stringify(data).slice(0, 200));
      return [];
    }

    console.log(`Apify IG batch: got ${data.length} profiles in ${Date.now() - startTime}ms`);

    return data
      .filter((profile: { followersCount?: number; postsCount?: number }) =>
        profile.followersCount || profile.postsCount
      )
      .map((profile: Record<string, unknown>) => parseInstagramProfile(profile));
  } catch (e) {
    console.error(`Apify batch failed after ${Date.now() - startTime}ms:`, e);
    return [];
  }
}

export async function getInstagramProfile(
  username: string
): Promise<InstagramProfile> {
  const cleaned = username
    .trim()
    .replace(/^@/, "")
    .replace(/^https?:\/\/(www\.)?instagram\.com\//, "")
    .replace(/[?#].*$/, "")
    .replace(/\/$/, "");

  const runInput = {
    usernames: [cleaned],
    resultsLimit: 12,
  };

  const res = await fetch(
    "https://api.apify.com/v2/acts/apify~instagram-profile-scraper/run-sync-get-dataset-items?token=" +
      APIFY_TOKEN,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(runInput),
    }
  );

  if (!res.ok) {
    throw new Error(`Apify error: ${res.status}`);
  }

  const data = await res.json();

  if (!data.length) {
    throw new Error(`Instagram profile not found: ${cleaned}`);
  }

  const profile = data[0];

  if (!profile.followersCount && !profile.postsCount) {
    throw new Error(
      `Could not fetch data for @${cleaned} — the account may be private or the handle may be incorrect`
    );
  }

  return parseInstagramProfile(profile, cleaned);
}

function parseInstagramProfile(
  profile: Record<string, unknown>,
  usernameOverride?: string
): InstagramProfile {
  const username = usernameOverride || (profile.username as string) || "unknown";

  const posts: InstagramPost[] = ((profile.latestPosts as Array<Record<string, unknown>>) || [])
    .slice(0, 12)
    .map(
      (p) => ({
        id: p.id as string,
        caption: ((p.caption as string) || "").slice(0, 100),
        likeCount: (p.likesCount as number) || 0,
        commentCount: (p.commentsCount as number) || 0,
        timestamp: p.timestamp as string,
        type: (p.type as string) || "image",
        hashtags: (p.hashtags as string[]) || [],
        mentions: (p.mentions as string[]) || [],
        url: (p.url as string) || "",
      })
    );

  const totalEngagement = posts.reduce(
    (sum, p) => sum + p.likeCount + p.commentCount,
    0
  );
  const avgEngagement = posts.length > 0 ? totalEngagement / posts.length : 0;
  const followersCount = (profile.followersCount as number) || 0;
  const engagementRate = followersCount > 0
    ? (avgEngagement / followersCount) * 100
    : 0;

  const postFrequency = calculatePostFrequency(posts);

  const rawExtUrls = profile.externalUrls || profile.externalUrl;
  const externalUrls: string[] = Array.isArray(rawExtUrls)
    ? rawExtUrls.filter((u: unknown) => typeof u === "string")
    : typeof rawExtUrls === "string"
      ? [rawExtUrls]
      : [];
  const relatedProfiles = ((profile.relatedProfiles as Array<Record<string, unknown>>) || []).slice(0, 5).map(
    (rp) => ({
      username: rp.username as string,
      fullName: (rp.full_name as string) || (rp.username as string),
      isVerified: (rp.is_verified as boolean) || false,
    })
  );

  return {
    username,
    fullName: (profile.fullName as string) || username,
    biography: (profile.biography as string) || "",
    followerCount: followersCount,
    followingCount: (profile.followsCount as number) || 0,
    postCount: (profile.postsCount as number) || 0,
    profilePicUrl: (profile.profilePicUrl as string) || "",
    profilePicUrlHD: (profile.profilePicUrlHD as string) || (profile.profilePicUrl as string) || "",
    isVerified: (profile.verified as boolean) || false,
    isBusinessAccount: (profile.isBusinessAccount as boolean) || false,
    businessCategoryName: (profile.businessCategoryName as string) || null,
    externalUrl: externalUrls.length > 0 ? externalUrls[0] : null,
    highlightReelCount: (profile.highlightReelCount as number) || 0,
    igtvVideoCount: (profile.igtvVideoCount as number) || 0,
    relatedProfiles,
    recentPosts: posts,
    engagementRate: Math.round(engagementRate * 100) / 100,
    postFrequency,
  };
}

function calculatePostFrequency(posts: InstagramPost[]): string {
  if (posts.length < 2) return "Insufficient data";

  const sorted = [...posts].sort(
    (a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const gaps: number[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const diff =
      new Date(sorted[i].timestamp).getTime() -
      new Date(sorted[i + 1].timestamp).getTime();
    gaps.push(diff / (1000 * 60 * 60 * 24));
  }

  const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;

  if (avgGap <= 1.5) return "Daily";
  if (avgGap <= 4) return "2-3 times/week";
  if (avgGap <= 8) return "Weekly";
  if (avgGap <= 16) return "Bi-weekly";
  return "Irregular";
}

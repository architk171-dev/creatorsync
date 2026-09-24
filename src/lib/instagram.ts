import { InstagramProfile, InstagramPost } from "./types";

const APIFY_TOKEN = process.env.APIFY_API_TOKEN;

export async function getInstagramProfile(
  username: string
): Promise<InstagramProfile> {
  const cleaned = username
    .trim()
    .replace(/^@/, "")
    .replace(/^https?:\/\/(www\.)?instagram\.com\//, "")
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
  const posts: InstagramPost[] = (profile.latestPosts || [])
    .slice(0, 12)
    .map(
      (p: {
        id: string;
        caption: string;
        likesCount: number;
        commentsCount: number;
        timestamp: string;
        type: string;
        hashtags: string[];
        mentions: string[];
        url: string;
      }) => ({
        id: p.id,
        caption: (p.caption || "").slice(0, 100),
        likeCount: p.likesCount || 0,
        commentCount: p.commentsCount || 0,
        timestamp: p.timestamp,
        type: p.type || "image",
        hashtags: p.hashtags || [],
        mentions: p.mentions || [],
        url: p.url || "",
      })
    );

  const totalEngagement = posts.reduce(
    (sum, p) => sum + p.likeCount + p.commentCount,
    0
  );
  const avgEngagement =
    posts.length > 0 ? totalEngagement / posts.length : 0;
  const engagementRate =
    profile.followersCount > 0
      ? (avgEngagement / profile.followersCount) * 100
      : 0;

  const postFrequency = calculatePostFrequency(posts);

  const externalUrls: string[] = profile.externalUrls || [];
  const relatedProfiles = (profile.relatedProfiles || []).slice(0, 5).map(
    (rp: { username: string; full_name: string; is_verified: boolean }) => ({
      username: rp.username,
      fullName: rp.full_name || rp.username,
      isVerified: rp.is_verified || false,
    })
  );

  return {
    username: cleaned,
    fullName: profile.fullName || cleaned,
    biography: profile.biography || "",
    followerCount: profile.followersCount || 0,
    followingCount: profile.followsCount || 0,
    postCount: profile.postsCount || 0,
    profilePicUrl: profile.profilePicUrl || "",
    profilePicUrlHD: profile.profilePicUrlHD || profile.profilePicUrl || "",
    isVerified: profile.verified || false,
    isBusinessAccount: profile.isBusinessAccount || false,
    businessCategoryName: profile.businessCategoryName || null,
    externalUrl: externalUrls.length > 0 ? externalUrls[0] : null,
    highlightReelCount: profile.highlightReelCount || 0,
    igtvVideoCount: profile.igtvVideoCount || 0,
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

import { getInstagramProfile } from "./instagram";
import { CreatorRecommendation } from "./types";

const API_KEY = process.env.YOUTUBE_API_KEY;
const APIFY_TOKEN = process.env.APIFY_API_TOKEN;
const YT_BASE = "https://www.googleapis.com/youtube/v3";

export async function searchYouTubeCreators(
  keywords: string[],
  maxResults = 10
): Promise<CreatorRecommendation[]> {
  const queries = keywords.slice(0, 3).map((kw) => kw.trim());
  const allChannelIds = new Set<string>();
  const recommendations: CreatorRecommendation[] = [];

  for (const query of queries) {
    if (allChannelIds.size >= maxResults) break;

    const url = new URL(`${YT_BASE}/search`);
    url.searchParams.set("key", API_KEY!);
    url.searchParams.set("part", "snippet");
    url.searchParams.set("q", query);
    url.searchParams.set("type", "channel");
    url.searchParams.set("maxResults", "5");
    url.searchParams.set("order", "relevance");

    const res = await fetch(url.toString());
    if (!res.ok) continue;
    const data = await res.json();
    if (!data.items?.length) continue;

    for (const item of data.items) {
      allChannelIds.add(item.snippet.channelId);
    }
  }

  if (allChannelIds.size === 0) return [];

  const channelIds = [...allChannelIds].slice(0, maxResults);
  const channelsUrl = new URL(`${YT_BASE}/channels`);
  channelsUrl.searchParams.set("key", API_KEY!);
  channelsUrl.searchParams.set("part", "snippet,statistics");
  channelsUrl.searchParams.set("id", channelIds.join(","));

  const channelsRes = await fetch(channelsUrl.toString());
  if (!channelsRes.ok) throw new Error(`YouTube channels error: ${channelsRes.status}`);
  const channelsData = await channelsRes.json();

  for (const item of channelsData.items || []) {
    const subs = parseInt(item.statistics.subscriberCount || "0");
    if (subs < 1000) continue;

    const views = parseInt(item.statistics.viewCount || "0");
    const videoCount = parseInt(item.statistics.videoCount || "0");
    const avgViews = videoCount > 0 ? views / videoCount : 0;
    const estEngagement = avgViews > 0 ? Math.min(((avgViews * 0.04) / subs) * 100, 15) : 2;

    recommendations.push({
      platform: "youtube",
      handle: item.snippet.customUrl || item.id,
      name: item.snippet.title,
      thumbnailUrl:
        item.snippet.thumbnails?.high?.url ||
        item.snippet.thumbnails?.default?.url || "",
      subscriberCount: subs,
      engagementRate: Math.round(estEngagement * 100) / 100,
      category: extractCategory(item.snippet.description, item.snippet.title),
      fitScore: 0,
      fitReason: item.snippet.description?.slice(0, 200) || "",
      estimatedReach: Math.round(subs * 0.1),
      contentStyle: "",
    });
  }

  return recommendations;
}

export async function searchInstagramCreators(
  usernames: string[],
  maxResults = 5
): Promise<CreatorRecommendation[]> {
  const results: CreatorRecommendation[] = [];
  const handles = usernames.slice(0, maxResults + 3);

  for (const handle of handles) {
    if (results.length >= maxResults) break;
    try {
      const profile = await getInstagramProfile(handle);
      if (profile.followerCount > 1000) {
        const posts = profile.recentPosts || [];
        const contentStyle =
          posts.length > 0
            ? posts.filter((p) => p.type === "Reel" || p.type === "Video").length > posts.length / 2
              ? "Video-heavy"
              : "Mixed content"
            : "Unknown";

        const allHashtags = posts.flatMap((p) => p.hashtags || []);
        const hashtagCounts = new Map<string, number>();
        for (const tag of allHashtags) {
          hashtagCounts.set(tag, (hashtagCounts.get(tag) || 0) + 1);
        }
        const topHashtags = [...hashtagCounts.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([tag]) => tag);

        results.push({
          platform: "instagram",
          handle: profile.username,
          name: profile.fullName,
          thumbnailUrl: profile.profilePicUrlHD || profile.profilePicUrl,
          subscriberCount: profile.followerCount,
          engagementRate: profile.engagementRate,
          category: extractCategory(profile.biography, ""),
          fitScore: 0,
          fitReason: profile.biography?.slice(0, 200) || "",
          estimatedReach: Math.round(profile.followerCount * 0.05),
          contentStyle,
          isVerified: profile.isVerified,
          isBusinessAccount: profile.isBusinessAccount,
          businessCategory: profile.businessCategoryName || undefined,
          externalUrl: profile.externalUrl || undefined,
          postCount: profile.postCount,
          topHashtags,
        });
      }
    } catch {
      continue;
    }
  }

  return results;
}

function extractCategory(description: string, titles: string): string {
  const text = `${description} ${titles}`.toLowerCase();
  const categories: [string, string[]][] = [
    ["Tech", ["tech", "gadget", "phone", "laptop", "software", "coding", "programming"]],
    ["Gaming", ["gaming", "game", "esports", "playstation", "xbox", "gamer"]],
    ["Beauty", ["beauty", "makeup", "skincare", "cosmetic", "salon"]],
    ["Fashion", ["fashion", "style", "outfit", "clothing", "wear"]],
    ["Food", ["food", "cook", "recipe", "kitchen", "restaurant", "chef"]],
    ["Fitness", ["fitness", "gym", "workout", "health", "yoga", "diet"]],
    ["Finance", ["finance", "invest", "money", "stock", "crypto", "trading"]],
    ["Education", ["education", "learn", "study", "tutorial", "course"]],
    ["Travel", ["travel", "vlog", "explore", "destination", "trip"]],
    ["Entertainment", ["comedy", "funny", "entertainment", "prank", "skit"]],
    ["Music", ["music", "song", "singer", "rapper", "musician", "band"]],
    ["Lifestyle", ["lifestyle", "daily", "routine", "life", "family"]],
  ];

  for (const [cat, kws] of categories) {
    if (kws.some((kw) => text.includes(kw))) return cat;
  }
  return "General";
}

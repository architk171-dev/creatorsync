import { getInstagramProfile, getInstagramProfiles } from "./instagram";
import { getRecentVideos } from "./youtube";
import { getTwitterProfiles } from "./twitter";
import { getLinkedInProfiles } from "./linkedin";
import { CreatorRecommendation } from "./types";

const API_KEY = process.env.YOUTUBE_API_KEY;
const YT_BASE = "https://www.googleapis.com/youtube/v3";

export async function searchYouTubeCreators(
  keywords: string[],
  maxResults = 10
): Promise<CreatorRecommendation[]> {
  const queries = keywords.slice(0, 5).map((kw) => kw.trim());
  const allChannelIds = new Set<string>();
  const recommendations: CreatorRecommendation[] = [];

  const searchPromises = queries.map(async (query) => {
    const url = new URL(`${YT_BASE}/search`);
    url.searchParams.set("key", API_KEY!);
    url.searchParams.set("part", "snippet");
    url.searchParams.set("q", query);
    url.searchParams.set("type", "channel");
    url.searchParams.set("maxResults", "8");
    url.searchParams.set("order", "relevance");
    url.searchParams.set("regionCode", "IN");

    try {
      const res = await fetch(url.toString(), { cache: "no-store" });
      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        console.error(`YT search failed for "${query}": ${res.status} ${errText.slice(0, 100)}`);
        return [];
      }
      const data = await res.json();
      return (data.items || []).map((item: { snippet: { channelId: string } }) => item.snippet.channelId);
    } catch {
      return [];
    }
  });

  const searchResults = await Promise.all(searchPromises);
  for (const ids of searchResults) {
    for (const id of ids) allChannelIds.add(id);
  }

  if (allChannelIds.size === 0) return [];

  const channelIds = [...allChannelIds].slice(0, maxResults);
  const channelsUrl = new URL(`${YT_BASE}/channels`);
  channelsUrl.searchParams.set("key", API_KEY!);
  channelsUrl.searchParams.set("part", "snippet,statistics");
  channelsUrl.searchParams.set("id", channelIds.join(","));

  const channelsRes = await fetch(channelsUrl.toString(), { cache: "no-store" });
  if (!channelsRes.ok) throw new Error(`YouTube channels error: ${channelsRes.status}`);
  const channelsData = await channelsRes.json();

  const channelItems = (channelsData.items || []).filter(
    (item: { statistics: { subscriberCount?: string } }) =>
      parseInt(item.statistics.subscriberCount || "0") >= 1000
  );

  const videoPromises = channelItems.map((item: { id: string }) =>
    getRecentVideos(item.id, 10).catch(() => [])
  );
  const allVideos = await Promise.all(videoPromises);

  for (let i = 0; i < channelItems.length; i++) {
    const item = channelItems[i];
    const subs = parseInt(item.statistics.subscriberCount || "0");
    const recentVideos = allVideos[i];

    let engagementRate = 0;
    let performance: CreatorRecommendation["performance"];

    let formatScores: CreatorRecommendation["formatScores"];
    let bestFormat: string | undefined;

    if (recentVideos.length > 0) {
      const totalViews = recentVideos.reduce((s: number, v: { viewCount: number }) => s + v.viewCount, 0);
      const totalLikes = recentVideos.reduce((s: number, v: { likeCount: number }) => s + v.likeCount, 0);
      const totalComments = recentVideos.reduce((s: number, v: { commentCount: number }) => s + v.commentCount, 0);
      engagementRate = totalViews > 0
        ? Math.round(((totalLikes + totalComments) / totalViews) * 10000) / 100
        : 0;
      performance = {
        avgViews: Math.round(totalViews / recentVideos.length),
        avgLikes: Math.round(totalLikes / recentVideos.length),
        avgComments: Math.round(totalComments / recentVideos.length),
        totalViews,
        totalLikes,
        totalComments,
        postsSampled: recentVideos.length,
      };

      const formatGroups: Record<string, { views: number; likes: number; comments: number; count: number }> = {};
      for (const v of recentVideos as { viewCount: number; likeCount: number; commentCount: number; title: string }[]) {
        const isShort = v.title?.includes("#shorts") || v.title?.includes("#short");
        const fmt = isShort ? "Shorts" : "Long-form";
        if (!formatGroups[fmt]) formatGroups[fmt] = { views: 0, likes: 0, comments: 0, count: 0 };
        formatGroups[fmt].views += v.viewCount;
        formatGroups[fmt].likes += v.likeCount;
        formatGroups[fmt].comments += v.commentCount;
        formatGroups[fmt].count++;
      }
      formatScores = Object.entries(formatGroups).map(([format, g]) => ({
        format,
        avgViews: Math.round(g.views / g.count),
        avgLikes: Math.round(g.likes / g.count),
        avgEngagement: g.views > 0 ? Math.round(((g.likes + g.comments) / g.views) * 10000) / 100 : 0,
        count: g.count,
      }));
      formatScores.sort((a, b) => b.avgEngagement - a.avgEngagement);
      bestFormat = formatScores[0]?.format;
    }

    recommendations.push({
      platform: "youtube",
      handle: item.snippet.customUrl || item.id,
      name: item.snippet.title,
      thumbnailUrl:
        item.snippet.thumbnails?.high?.url ||
        item.snippet.thumbnails?.default?.url || "",
      subscriberCount: subs,
      engagementRate,
      category: extractCategory(item.snippet.description, item.snippet.title),
      fitScore: 0,
      fitReason: item.snippet.description?.slice(0, 200) || "",
      estimatedReach: performance?.avgViews || Math.round(subs * 0.1),
      contentStyle: "",
      performance,
      formatScores,
      bestFormat,
    });
  }

  return recommendations;
}

export async function searchInstagramCreators(
  usernames: string[],
  maxResults = 5,
  relevanceKeywords: string[] = []
): Promise<CreatorRecommendation[]> {
  const handles = usernames.slice(0, maxResults + 5);
  const keywords = relevanceKeywords.map((k) => k.toLowerCase());

  const profiles = await getInstagramProfiles(handles);
  const results: CreatorRecommendation[] = [];

  for (const profile of profiles) {
    if (results.length >= maxResults) break;
    if (profile.followerCount < 100) continue;

    // Keyword matching is used for scoring, not filtering — Gemini already picked relevant handles

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

    let performance: CreatorRecommendation["performance"];
    let formatScores: CreatorRecommendation["formatScores"];
    let bestFormat: string | undefined;
    if (posts.length > 0) {
      const totalLikes = posts.reduce((s, p) => s + (p.likeCount || 0), 0);
      const totalComments = posts.reduce((s, p) => s + (p.commentCount || 0), 0);
      performance = {
        avgLikes: Math.round(totalLikes / posts.length),
        avgComments: Math.round(totalComments / posts.length),
        totalLikes,
        totalComments,
        postsSampled: posts.length,
      };

      const fmtGroups: Record<string, { likes: number; comments: number; count: number }> = {};
      for (const p of posts) {
        const fmt = p.type || "Image";
        if (!fmtGroups[fmt]) fmtGroups[fmt] = { likes: 0, comments: 0, count: 0 };
        fmtGroups[fmt].likes += p.likeCount || 0;
        fmtGroups[fmt].comments += p.commentCount || 0;
        fmtGroups[fmt].count++;
      }
      formatScores = Object.entries(fmtGroups).map(([format, g]) => ({
        format,
        avgLikes: Math.round(g.likes / g.count),
        avgEngagement: profile.followerCount > 0
          ? Math.round(((g.likes / g.count + g.comments / g.count) / profile.followerCount) * 10000) / 100
          : 0,
        count: g.count,
      }));
      formatScores.sort((a, b) => b.avgEngagement - a.avgEngagement);
      bestFormat = formatScores[0]?.format;
    }

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
      performance,
      formatScores,
      bestFormat,
    });
  }

  return results;
}

export async function searchTwitterCreators(
  handles: string[],
  maxResults = 5
): Promise<CreatorRecommendation[]> {
  const profiles = await getTwitterProfiles(handles.slice(0, maxResults + 3));
  const results: CreatorRecommendation[] = [];

  for (const p of profiles) {
    if (results.length >= maxResults) break;
    if (p.followerCount < 100) continue;

    const ageDays = p.createdAt
      ? Math.floor((Date.now() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    const tweetsPerDay = ageDays > 0 ? p.tweetCount / ageDays : 0;
    const engRate = p.followerCount > 0
      ? Math.round((tweetsPerDay * 50) / Math.log10(p.followerCount + 1) * 100) / 100
      : 0;

    results.push({
      platform: "twitter",
      handle: p.username,
      name: p.name,
      thumbnailUrl: p.profileImageUrl || "",
      subscriberCount: p.followerCount,
      engagementRate: Math.min(engRate, 10),
      category: extractCategory(p.bio || "", p.name),
      fitScore: 0,
      fitReason: p.bio?.slice(0, 200) || "",
      estimatedReach: Math.round(p.followerCount * 0.08),
      contentStyle: tweetsPerDay >= 5 ? "Very Active" : tweetsPerDay >= 1 ? "Active" : "Moderate",
      isVerified: p.isVerified,
      postCount: p.tweetCount,
    });
  }

  return results;
}

export async function searchLinkedInCreators(
  handles: string[],
  maxResults = 5
): Promise<CreatorRecommendation[]> {
  const profiles = await getLinkedInProfiles(handles.slice(0, maxResults + 3));
  const results: CreatorRecommendation[] = [];

  for (const p of profiles) {
    if (results.length >= maxResults) break;
    if (p.followerCount < 100) continue;

    const engRate = p.connectionsCount > 0
      ? Math.round((p.followerCount / p.connectionsCount) * 100) / 100
      : 1;

    results.push({
      platform: "linkedin",
      handle: p.publicIdentifier,
      name: p.fullName,
      thumbnailUrl: p.profilePicUrl || "",
      subscriberCount: p.followerCount,
      engagementRate: Math.min(engRate, 10),
      category: p.industry || extractCategory(p.headline || "", p.fullName),
      fitScore: 0,
      fitReason: (p.headline || "") + (p.about ? " — " + p.about.slice(0, 150) : ""),
      estimatedReach: Math.round(p.followerCount * 0.1),
      contentStyle: p.isCreator ? "Creator Mode" : p.isInfluencer ? "Top Voice" : "Professional",
      isVerified: p.isInfluencer || p.isPremium,
    });
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

import { getInstagramProfile } from "./instagram";
import { getRecentVideos } from "./youtube";
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

  for (const query of queries) {
    if (allChannelIds.size >= maxResults) break;

    const url = new URL(`${YT_BASE}/search`);
    url.searchParams.set("key", API_KEY!);
    url.searchParams.set("part", "snippet");
    url.searchParams.set("q", query);
    url.searchParams.set("type", "channel");
    url.searchParams.set("maxResults", "8");
    url.searchParams.set("order", "relevance");
    url.searchParams.set("regionCode", "IN");

    const res = await fetch(url.toString(), { cache: "no-store" });
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
  const results: CreatorRecommendation[] = [];
  const handles = usernames.slice(0, maxResults + 5);
  const keywords = relevanceKeywords.map((k) => k.toLowerCase());

  for (const handle of handles) {
    if (results.length >= maxResults) break;
    try {
      const profile = await getInstagramProfile(handle);
      if (profile.followerCount < 10000 || (profile.postCount || 0) < 10 || profile.engagementRate < 1.0) continue;

      if (keywords.length > 0) {
        const bioText = `${profile.biography || ""} ${profile.fullName || ""} ${profile.businessCategoryName || ""}`.toLowerCase();
        const postText = (profile.recentPosts || []).map((p: { caption?: string }) => p.caption || "").join(" ").toLowerCase();
        const allText = `${bioText} ${postText}`;
        const matchCount = keywords.filter((kw) => allText.includes(kw)).length;
        if (matchCount === 0) continue;
      }

      {
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

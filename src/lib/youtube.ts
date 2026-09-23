import { YouTubeChannel, YouTubeVideo } from "./types";

const API_KEY = process.env.YOUTUBE_API_KEY;
const BASE = "https://www.googleapis.com/youtube/v3";

async function ytFetch(endpoint: string, params: Record<string, string>) {
  const url = new URL(`${BASE}/${endpoint}`);
  url.searchParams.set("key", API_KEY!);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  const res = await fetch(url.toString());
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      `YouTube API error: ${res.status} — ${JSON.stringify(err)}`
    );
  }
  return res.json();
}

export async function resolveChannelId(input: string): Promise<string> {
  const cleaned = input.trim().replace(/\/$/, "");

  const channelIdMatch = cleaned.match(
    /(?:youtube\.com\/channel\/|^)(UC[\w-]{22})$/
  );
  if (channelIdMatch) return channelIdMatch[1];

  let handle = "";
  const handleMatch = cleaned.match(
    /(?:youtube\.com\/@|^@?)([\w.-]+)$/
  );
  if (handleMatch) {
    handle = handleMatch[1];
  } else {
    handle = cleaned;
  }

  const data = await ytFetch("channels", {
    part: "id",
    forHandle: handle,
  });

  if (!data.items?.length) {
    const searchData = await ytFetch("search", {
      part: "snippet",
      q: handle,
      type: "channel",
      maxResults: "1",
    });
    if (!searchData.items?.length) {
      throw new Error(`Channel not found: ${input}`);
    }
    return searchData.items[0].snippet.channelId;
  }

  return data.items[0].id;
}

export async function getChannelData(
  channelId: string
): Promise<YouTubeChannel> {
  const data = await ytFetch("channels", {
    part: "snippet,statistics,brandingSettings",
    id: channelId,
  });

  if (!data.items?.length) {
    throw new Error(`Channel not found: ${channelId}`);
  }

  const item = data.items[0];
  return {
    id: item.id,
    title: item.snippet.title,
    description: item.snippet.description,
    customUrl: item.snippet.customUrl || "",
    publishedAt: item.snippet.publishedAt,
    thumbnailUrl:
      item.snippet.thumbnails?.high?.url ||
      item.snippet.thumbnails?.default?.url,
    subscriberCount: parseInt(item.statistics.subscriberCount || "0"),
    viewCount: parseInt(item.statistics.viewCount || "0"),
    videoCount: parseInt(item.statistics.videoCount || "0"),
    country: item.snippet.country,
  };
}

export async function getRecentVideos(
  channelId: string,
  maxResults = 10
): Promise<YouTubeVideo[]> {
  const searchData = await ytFetch("search", {
    part: "id",
    channelId,
    order: "date",
    type: "video",
    maxResults: String(maxResults),
  });

  if (!searchData.items?.length) return [];

  const videoIds = searchData.items
    .map((i: { id: { videoId: string } }) => i.id.videoId)
    .join(",");

  const videoData = await ytFetch("videos", {
    part: "snippet,statistics",
    id: videoIds,
  });

  return videoData.items.map(
    (v: {
      id: string;
      snippet: {
        title: string;
        publishedAt: string;
        thumbnails: { high?: { url: string }; default: { url: string } };
      };
      statistics: {
        viewCount?: string;
        likeCount?: string;
        commentCount?: string;
      };
    }) => {
      const views = parseInt(v.statistics.viewCount || "0");
      const likes = parseInt(v.statistics.likeCount || "0");
      const comments = parseInt(v.statistics.commentCount || "0");
      const engagement = views > 0 ? ((likes + comments) / views) * 100 : 0;

      return {
        id: v.id,
        title: v.snippet.title,
        publishedAt: v.snippet.publishedAt,
        thumbnailUrl:
          v.snippet.thumbnails?.high?.url || v.snippet.thumbnails.default.url,
        viewCount: views,
        likeCount: likes,
        commentCount: comments,
        engagementRate: Math.round(engagement * 100) / 100,
      } satisfies YouTubeVideo;
    }
  );
}

export function calculateUploadFrequency(
  videos: YouTubeVideo[]
): string {
  if (videos.length < 2) return "Insufficient data";

  const sorted = [...videos].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  const gaps: number[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const diff =
      new Date(sorted[i].publishedAt).getTime() -
      new Date(sorted[i + 1].publishedAt).getTime();
    gaps.push(diff / (1000 * 60 * 60 * 24));
  }

  const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;

  if (avgGap <= 1.5) return "Daily";
  if (avgGap <= 4) return "2-3 times/week";
  if (avgGap <= 8) return "Weekly";
  if (avgGap <= 16) return "Bi-weekly";
  if (avgGap <= 35) return "Monthly";
  return "Irregular";
}

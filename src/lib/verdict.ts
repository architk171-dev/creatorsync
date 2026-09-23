import { YouTubeVideo, VerdictData } from "./types";

const CATEGORY_BENCHMARKS: Record<string, number> = {
  default: 3.5,
  gaming: 4.0,
  tech: 3.2,
  beauty: 4.5,
  education: 3.8,
  entertainment: 3.0,
  music: 2.5,
  news: 2.0,
  sports: 3.5,
  food: 4.2,
  travel: 3.8,
  comedy: 4.0,
  lifestyle: 3.5,
};

export function generateVerdict(
  avgEngagement: number,
  recentVideos: YouTubeVideo[],
  subscriberCount: number,
  uploadFrequency: string,
  category = "default"
): VerdictData {
  const benchmark =
    CATEGORY_BENCHMARKS[category.toLowerCase()] ||
    CATEGORY_BENCHMARKS.default;

  let engagementVerdict: "above" | "below" | "average";
  let engagementBenchmark: string;
  if (avgEngagement >= benchmark * 1.1) {
    engagementVerdict = "above";
    engagementBenchmark = `This creator's ${avgEngagement.toFixed(1)}% engagement is above the ${category} median of ${benchmark}%`;
  } else if (avgEngagement <= benchmark * 0.9) {
    engagementVerdict = "below";
    engagementBenchmark = `This creator's ${avgEngagement.toFixed(1)}% engagement is below the ${category} median of ${benchmark}%`;
  } else {
    engagementVerdict = "average";
    engagementBenchmark = `This creator's ${avgEngagement.toFixed(1)}% engagement is on par with the ${category} median of ${benchmark}%`;
  }

  const growthFlag = calculateGrowthFlag(recentVideos);
  const consistencyFlag = calculateConsistencyFlag(uploadFrequency);

  const tierLabel = getTierLabel(subscriberCount);
  const growthWord =
    growthFlag === "Growing"
      ? "growing"
      : growthFlag === "Flat"
        ? "stable"
        : "declining";
  const engagementWord =
    engagementVerdict === "above"
      ? "above-average"
      : engagementVerdict === "below"
        ? "below-average"
        : "average";
  const consistencyWord =
    consistencyFlag === "Posts regularly"
      ? "consistently active"
      : "irregularly posting";

  const summary = `${growthWord === "growing" ? "Solid, " : ""}${growthWord} ${tierLabel} creator with ${engagementWord} engagement. ${consistencyWord === "consistently active" ? "Posts regularly." : "Uploads are irregular."} Metrics are API-verified.`;

  const overallScore = calculateOverallScore(
    avgEngagement,
    benchmark,
    growthFlag,
    consistencyFlag
  );

  return {
    engagementBenchmark,
    engagementVerdict,
    growthFlag,
    consistencyFlag,
    summary,
    overallScore,
  };
}

function calculateGrowthFlag(
  videos: YouTubeVideo[]
): "Growing" | "Flat" | "Declining" {
  if (videos.length < 4) return "Flat";

  const half = Math.floor(videos.length / 2);
  const sorted = [...videos].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  const recentAvgViews =
    sorted.slice(0, half).reduce((s, v) => s + v.viewCount, 0) / half;
  const olderAvgViews =
    sorted.slice(half).reduce((s, v) => s + v.viewCount, 0) /
    (sorted.length - half);

  if (olderAvgViews === 0) return "Flat";

  const changePercent =
    ((recentAvgViews - olderAvgViews) / olderAvgViews) * 100;

  if (changePercent > 15) return "Growing";
  if (changePercent < -15) return "Declining";
  return "Flat";
}

function calculateConsistencyFlag(
  uploadFrequency: string
): "Posts regularly" | "Irregular" {
  const regular = ["Daily", "2-3 times/week", "Weekly", "Bi-weekly"];
  return regular.includes(uploadFrequency)
    ? "Posts regularly"
    : "Irregular";
}

function getTierLabel(subscribers: number): string {
  if (subscribers >= 10_000_000) return "mega-tier";
  if (subscribers >= 1_000_000) return "macro-tier";
  if (subscribers >= 100_000) return "mid-tier";
  if (subscribers >= 10_000) return "micro-tier";
  return "nano-tier";
}

function calculateOverallScore(
  engagement: number,
  benchmark: number,
  growth: string,
  consistency: string
): number {
  let score = 50;
  const engagementRatio = engagement / benchmark;
  score += Math.min(20, Math.max(-20, (engagementRatio - 1) * 40));
  if (growth === "Growing") score += 15;
  else if (growth === "Declining") score -= 15;
  if (consistency === "Posts regularly") score += 10;
  else score -= 5;
  return Math.max(0, Math.min(100, Math.round(score)));
}

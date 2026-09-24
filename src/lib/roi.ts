export interface ROIEstimate {
  estimatedImpressions: number;
  estimatedEngagements: number;
  estimatedCPM: number;
  costPerEngagement: number;
  estimatedCost: number;
  reachPercentage: number;
  roiRating: "Excellent" | "Good" | "Average" | "Below Average";
}

const REACH_RATES: Record<string, { min: number; max: number }> = {
  instagram_reel: { min: 0.15, max: 0.35 },
  instagram_story: { min: 0.05, max: 0.15 },
  instagram_post: { min: 0.08, max: 0.20 },
  youtube_video: { min: 0.20, max: 0.45 },
  youtube_short: { min: 0.25, max: 0.50 },
};

export function calculateROI(
  platform: "youtube" | "instagram",
  followers: number,
  engagementRate: number,
  estimatedCost: number,
  contentType?: string
): ROIEstimate {
  const key = contentType || (platform === "youtube" ? "youtube_video" : "instagram_reel");
  const reachRate = REACH_RATES[key] || REACH_RATES[platform === "youtube" ? "youtube_video" : "instagram_reel"];

  const avgReach = (reachRate.min + reachRate.max) / 2;
  const reachMultiplier = engagementRate > 3 ? 1.2 : engagementRate < 1 ? 0.7 : 1;
  const reachPercentage = Math.min(avgReach * reachMultiplier, 0.6);

  const estimatedImpressions = Math.round(followers * reachPercentage);
  const estimatedEngagements = Math.round(estimatedImpressions * (engagementRate / 100));
  const estimatedCPM = estimatedImpressions > 0 ? (estimatedCost / estimatedImpressions) * 1000 : 0;
  const costPerEngagement = estimatedEngagements > 0 ? estimatedCost / estimatedEngagements : 0;

  let roiRating: ROIEstimate["roiRating"];
  if (estimatedCPM < 100) roiRating = "Excellent";
  else if (estimatedCPM < 250) roiRating = "Good";
  else if (estimatedCPM < 500) roiRating = "Average";
  else roiRating = "Below Average";

  return {
    estimatedImpressions,
    estimatedEngagements,
    estimatedCPM: Math.round(estimatedCPM),
    costPerEngagement: Math.round(costPerEngagement),
    estimatedCost,
    reachPercentage: Math.round(reachPercentage * 100),
    roiRating,
  };
}

export function getBudgetNumber(budgetRange: string): number {
  const map: Record<string, number> = {
    "under-1L": 75_000,
    "1L-5L": 300_000,
    "5L-15L": 1_000_000,
    "15L-50L": 3_000_000,
    "above-50L": 7_500_000,
  };
  return map[budgetRange] || 300_000;
}

export function formatCurrency(n: number): string {
  if (n >= 10_000_000) return "₹" + (n / 10_000_000).toFixed(1) + "Cr";
  if (n >= 100_000) return "₹" + (n / 100_000).toFixed(1) + "L";
  if (n >= 1_000) return "₹" + (n / 1_000).toFixed(0) + "K";
  return "₹" + n;
}

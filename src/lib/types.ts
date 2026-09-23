export interface YouTubeChannel {
  id: string;
  title: string;
  description: string;
  customUrl: string;
  publishedAt: string;
  thumbnailUrl: string;
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
  country?: string;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  publishedAt: string;
  thumbnailUrl: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  engagementRate: number;
}

export interface InstagramProfile {
  username: string;
  fullName: string;
  biography: string;
  followerCount: number;
  followingCount: number;
  postCount: number;
  profilePicUrl: string;
  isVerified: boolean;
  recentPosts: InstagramPost[];
  engagementRate: number;
  postFrequency: string;
}

export interface InstagramPost {
  id: string;
  caption: string;
  likeCount: number;
  commentCount: number;
  timestamp: string;
  type: string;
}

// Campaign types
export interface CampaignBrief {
  brandName: string;
  category: string;
  campaignGoal: "awareness" | "conversions" | "ugc" | "engagement" | "launches";
  targetAudience: string;
  platforms: ("youtube" | "instagram")[];
  budgetRange: "under-1L" | "1L-5L" | "5L-15L" | "15L-50L" | "above-50L";
  geography: string;
  description: string;
}

export interface CreatorCriteria {
  subscriberRange: { min: number; max: number };
  engagementMin: number;
  contentKeywords: string[];
  instagramUsernames?: string[];
  audienceMatch: string;
  platformFocus: string;
  reasoning: string;
}

export interface CreatorRecommendation {
  platform: "youtube" | "instagram";
  handle: string;
  name: string;
  thumbnailUrl: string;
  subscriberCount: number;
  engagementRate: number;
  category: string;
  fitScore: number;
  fitReason: string;
  estimatedReach: number;
  contentStyle: string;
}

export interface CampaignAnalysis {
  id: string;
  brief: CampaignBrief;
  criteria: CreatorCriteria;
  recommendations: CreatorRecommendation[];
  aiInsights: {
    campaignStrategy: string;
    idealCreatorProfile: string;
    budgetAllocation: string;
    expectedOutcomes: string;
  };
  createdAt: string;
}

export interface GrowthData {
  label: string;
  subscribers?: number;
  views?: number;
}

export interface VerdictData {
  engagementBenchmark: string;
  engagementVerdict: "above" | "below" | "average";
  growthFlag: "Growing" | "Flat" | "Declining";
  consistencyFlag: "Posts regularly" | "Irregular";
  summary: string;
  overallScore: number;
}

export interface ReportData {
  id: string;
  createdAt: string;
  status: "preview" | "paid" | "failed";
  buyerEmail: string;
  youtube?: {
    channel: YouTubeChannel;
    recentVideos: YouTubeVideo[];
    topVideos: YouTubeVideo[];
    avgEngagementRate: number;
    last30DayViews: number;
    uploadFrequency: string;
    growthTrend: GrowthData[];
  };
  instagram?: InstagramProfile;
  verdict: VerdictData;
}

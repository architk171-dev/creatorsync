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
  profilePicUrlHD: string;
  isVerified: boolean;
  isBusinessAccount: boolean;
  businessCategoryName: string | null;
  externalUrl: string | null;
  highlightReelCount: number;
  igtvVideoCount: number;
  relatedProfiles: { username: string; fullName: string; isVerified: boolean }[];
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
  hashtags: string[];
  mentions: string[];
  url: string;
}

// Campaign types
export type CampaignGoal = "awareness" | "conversions" | "ugc" | "engagement" | "launches";

export interface CampaignBrief {
  brandName: string;
  category: string;
  campaignGoals: CampaignGoal[];
  campaignGoal: CampaignGoal;
  targetAudience: string;
  platforms: ("youtube" | "instagram" | "twitter" | "linkedin")[];
  budgetRange: "under-1L" | "under-50K" | "1L-5L" | "5L-15L" | "15L-50L" | "above-50L";
  geography: string;
  description: string;
  competitorBrands?: string[];
}

export interface CreatorCriteria {
  subscriberRange: { min: number; max: number };
  engagementMin: number;
  contentKeywords: string[];
  instagramUsernames?: string[];
  twitterHandles?: string[];
  linkedinHandles?: string[];
  audienceMatch: string;
  platformFocus: string;
  reasoning: string;
}

export interface CreatorRecommendation {
  platform: "youtube" | "instagram" | "twitter" | "linkedin";
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
  isVerified?: boolean;
  isBusinessAccount?: boolean;
  businessCategory?: string;
  externalUrl?: string;
  postCount?: number;
  topHashtags?: string[];
  instagramUrl?: string;
  performance?: {
    avgViews?: number;
    avgLikes?: number;
    avgComments?: number;
    totalViews?: number;
    totalLikes?: number;
    totalComments?: number;
    postsSampled?: number;
  };
  formatScores?: {
    format: string;
    avgViews?: number;
    avgLikes?: number;
    avgEngagement: number;
    count: number;
  }[];
  bestFormat?: string;
  fitDimensions?: {
    audienceMatch: number;
    engagementQuality: number;
    contentRelevance: number;
    brandSafety: number;
    valueForMoney: number;
  };
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
    creativeIdeas?: string[];
    clicheApproaches?: string[];
    antiPatterns?: string[];
    benchmarks?: {
      topFormats: string[];
      engagementByTier: { tier: string; rate: string }[];
      bestPostingCadence: string;
      platformTip: string;
    };
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

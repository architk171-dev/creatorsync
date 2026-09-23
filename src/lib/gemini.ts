import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  CampaignBrief,
  CreatorCriteria,
  CreatorRecommendation,
} from "./types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const MODELS = ["gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-flash-latest"];

async function generateWithRetry(prompt: string): Promise<string> {
  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("503") || msg.includes("429") || msg.includes("unavailable")) {
        continue;
      }
      throw e;
    }
  }
  throw new Error("All Gemini models unavailable");
}

export async function analyzeCampaignBrief(
  brief: CampaignBrief
): Promise<{
  criteria: CreatorCriteria;
  insights: {
    campaignStrategy: string;
    idealCreatorProfile: string;
    budgetAllocation: string;
    expectedOutcomes: string;
  };
}> {
  const budgetLabels: Record<string, string> = {
    "under-1L": "Under ₹1 Lakh",
    "1L-5L": "₹1-5 Lakhs",
    "5L-15L": "₹5-15 Lakhs",
    "15L-50L": "₹15-50 Lakhs",
    "above-50L": "Above ₹50 Lakhs",
  };

  const prompt = `You are an influencer marketing strategist for Indian brands. Analyze this campaign brief and provide creator selection criteria and strategic insights.

CAMPAIGN BRIEF:
- Brand: ${brief.brandName}
- Category: ${brief.category}
- Goal: ${brief.campaignGoal}
- Target Audience: ${brief.targetAudience}
- Platforms: ${brief.platforms.join(", ")}
- Budget: ${budgetLabels[brief.budgetRange] || brief.budgetRange}
- Geography: ${brief.geography}
- Description: ${brief.description}

Respond ONLY with valid JSON (no markdown, no code fences):
{
  "criteria": {
    "subscriberRange": { "min": <number>, "max": <number> },
    "engagementMin": <number between 1-10>,
    "contentKeywords": [<5-8 search keywords for finding creators in this niche>],
    "instagramUsernames": [<5-8 real Instagram usernames/handles of popular Indian creators in this niche who would be a good fit — no @ prefix, just the username>],
    "audienceMatch": "<one sentence describing ideal audience>",
    "platformFocus": "<which platform is more important and why>",
    "reasoning": "<2-3 sentences on why these criteria>"
  },
  "insights": {
    "campaignStrategy": "<3-4 sentences on how to run this campaign effectively>",
    "idealCreatorProfile": "<2-3 sentences describing the perfect creator for this campaign>",
    "budgetAllocation": "<2-3 sentences on how to split budget across creators and platforms>",
    "expectedOutcomes": "<2-3 sentences on realistic KPIs and expected results>"
  }
}`;

  const text = await generateWithRetry(prompt);

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse Gemini response");

  return JSON.parse(jsonMatch[0]);
}

export async function scoreCreatorFit(
  brief: CampaignBrief,
  creators: {
    name: string;
    handle: string;
    platform: string;
    subscribers: number;
    engagement: number;
    description: string;
    category: string;
    recentContent: string;
  }[]
): Promise<
  {
    handle: string;
    fitScore: number;
    fitReason: string;
    contentStyle: string;
    estimatedReach: number;
  }[]
> {
  if (!creators.length) return [];

  const creatorsText = creators
    .map(
      (c, i) =>
        `${i + 1}. ${c.name} (@${c.handle}) on ${c.platform} — ${c.subscribers} subscribers, ${c.engagement}% engagement. Category: ${c.category}. Description: ${c.description?.slice(0, 150)}. Recent content: ${c.recentContent?.slice(0, 150)}`
    )
    .join("\n");

  const prompt = `You are an influencer marketing expert. Score each creator's fit for this campaign.

CAMPAIGN:
- Brand: ${brief.brandName} (${brief.category})
- Goal: ${brief.campaignGoal}
- Target Audience: ${brief.targetAudience}
- Geography: ${brief.geography}
- Description: ${brief.description}

CREATORS:
${creatorsText}

For each creator, respond ONLY with a valid JSON array (no markdown, no code fences):
[
  {
    "handle": "<handle>",
    "fitScore": <0-100>,
    "fitReason": "<1-2 sentences explaining why this creator fits or doesn't fit the campaign>",
    "contentStyle": "<brief description of their content style>",
    "estimatedReach": <estimated total reach for a sponsored post/video>
  }
]`;

  const text = await generateWithRetry(prompt);

  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];

  return JSON.parse(jsonMatch[0]);
}

export async function generateDeliverableBrief(
  brief: CampaignBrief,
  creator: {
    name: string;
    handle: string;
    platform: string;
    subscribers: number;
    engagement: number;
    category: string;
    fitReason: string;
    contentStyle: string;
  }
): Promise<{
  overview: string;
  contentFormat: string[];
  keyMessaging: string[];
  brandGuidelines: string[];
  dosAndDonts: { dos: string[]; donts: string[] };
  timeline: { phase: string; duration: string; details: string }[];
  deliverables: { type: string; quantity: number; specs: string }[];
  compensationNotes: string;
  hashtags: string[];
  callToAction: string;
}> {
  const budgetLabels: Record<string, string> = {
    "under-1L": "Under ₹1 Lakh",
    "1L-5L": "₹1-5 Lakhs",
    "5L-15L": "₹5-15 Lakhs",
    "15L-50L": "₹15-50 Lakhs",
    "above-50L": "Above ₹50 Lakhs",
  };

  const prompt = `You are an influencer marketing expert creating a deliverable brief for a brand to give to a creator. This brief tells the creator exactly how to execute their content deliverable for the campaign.

CAMPAIGN:
- Brand: ${brief.brandName}
- Category: ${brief.category}
- Goal: ${brief.campaignGoal}
- Target Audience: ${brief.targetAudience}
- Budget: ${budgetLabels[brief.budgetRange] || brief.budgetRange}
- Geography: ${brief.geography}
- Description: ${brief.description}

CREATOR:
- Name: ${creator.name} (@${creator.handle})
- Platform: ${creator.platform}
- Followers: ${creator.subscribers}
- Engagement: ${creator.engagement}%
- Category: ${creator.category}
- Style: ${creator.contentStyle}
- Fit: ${creator.fitReason}

Generate a comprehensive deliverable brief. Respond ONLY with valid JSON (no markdown, no code fences):
{
  "overview": "<2-3 sentences summarizing the campaign and what the creator needs to do>",
  "contentFormat": ["<specific content formats e.g. Instagram Reel, YouTube Short, Story series>"],
  "keyMessaging": ["<3-5 key messaging points the creator must include>"],
  "brandGuidelines": ["<3-5 brand guidelines for tone, visual style, and messaging>"],
  "dosAndDonts": {
    "dos": ["<5-6 specific things the creator should do>"],
    "donts": ["<4-5 things the creator must avoid>"]
  },
  "timeline": [
    { "phase": "<phase name>", "duration": "<e.g. Day 1-3>", "details": "<what happens>" }
  ],
  "deliverables": [
    { "type": "<e.g. Reel, Story, Post>", "quantity": <number>, "specs": "<specs like duration, dimensions>" }
  ],
  "compensationNotes": "<1-2 sentences about payment structure based on budget>",
  "hashtags": ["<5-8 relevant campaign hashtags>"],
  "callToAction": "<the specific CTA the creator should use>"
}`;

  const text = await generateWithRetry(prompt);
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to generate deliverable brief");
  return JSON.parse(jsonMatch[0]);
}

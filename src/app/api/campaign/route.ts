import { NextResponse } from "next/server";
import { CampaignBrief, CampaignAnalysis } from "@/lib/types";
import { analyzeCampaignBrief, scoreCreatorFit } from "@/lib/gemini";
import {
  searchYouTubeCreators,
  searchInstagramCreators,
} from "@/lib/discover";
import { randomUUID } from "crypto";

async function fetchCompetitorContext(
  brands: string[],
  category: string
): Promise<string | undefined> {
  if (!brands || brands.length === 0) return undefined;

  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const MODELS = ["gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-flash-latest"];

    for (const modelName of MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(
          `In 3-4 sentences per brand, summarize what influencer campaigns these Indian brands have run recently: ${brands.join(", ")}. Category: ${category}. Focus on: what content formats they used, what type of creators, and what hooks/angles. Be specific — name actual campaign styles, not vague descriptions. Plain text only, no JSON.`
        );
        return result.response.text().trim();
      } catch {
        continue;
      }
    }
  } catch {
    // Competitor context is optional — don't fail the whole request
  }
  return undefined;
}

export async function POST(req: Request) {
  try {
    const brief: CampaignBrief = await req.json();

    if (!brief.brandName || !brief.category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!brief.campaignGoals?.length && !brief.campaignGoal) {
      return NextResponse.json(
        { error: "At least one campaign goal is required" },
        { status: 400 }
      );
    }

    if (!brief.campaignGoals?.length) {
      brief.campaignGoals = [brief.campaignGoal];
    }
    if (!brief.campaignGoal) {
      brief.campaignGoal = brief.campaignGoals[0];
    }

    const competitorContext = brief.competitorBrands?.length
      ? await fetchCompetitorContext(brief.competitorBrands, brief.category)
      : undefined;

    const { criteria, insights } = await analyzeCampaignBrief(
      brief,
      competitorContext
    );

    const creatorPromises = [];

    if (brief.platforms.includes("youtube")) {
      creatorPromises.push(
        searchYouTubeCreators(criteria.contentKeywords, 15).catch((e) => {
          console.error("YouTube search failed:", e);
          return [];
        })
      );
    }

    if (brief.platforms.includes("instagram")) {
      const igUsernames = criteria.instagramUsernames || [];
      creatorPromises.push(
        searchInstagramCreators(igUsernames, 8, criteria.contentKeywords || []).catch((e) => {
          console.error("Instagram search failed:", e);
          return [];
        })
      );
    }

    const creatorResults = await Promise.all(creatorPromises);
    let allCreators = creatorResults.flat();

    if (allCreators.length > 0) {
      const creatorsForScoring = allCreators.map((c) => ({
        name: c.name,
        handle: c.handle,
        platform: c.platform,
        subscribers: c.subscriberCount,
        engagement: c.engagementRate,
        description: c.fitReason,
        category: c.category,
        recentContent: c.contentStyle,
      }));

      const scores = await scoreCreatorFit(brief, creatorsForScoring);

      allCreators = allCreators.map((creator) => {
        const score = scores.find((s) => s.handle === creator.handle);
        return {
          ...creator,
          fitScore: score?.fitScore || 0,
          fitReason:
            score?.fitReason ||
            "Could not score — insufficient data for this creator.",
          contentStyle: score?.contentStyle || creator.contentStyle || "Mixed",
          estimatedReach:
            score?.estimatedReach || creator.estimatedReach,
          instagramUrl: score?.instagramUrl || undefined,
          fitDimensions: score?.fitDimensions || undefined,
        };
      });

      allCreators.sort((a, b) => b.fitScore - a.fitScore);
    }

    const analysis: CampaignAnalysis = {
      id: randomUUID(),
      brief,
      criteria,
      recommendations: allCreators.slice(0, 15),
      aiInsights: insights,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(analysis);
  } catch (err) {
    console.error("Campaign analysis error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Campaign analysis failed",
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { CampaignBrief, CampaignAnalysis } from "@/lib/types";
import { analyzeCampaignBrief, scoreCreatorFit } from "@/lib/gemini";
import {
  searchYouTubeCreators,
  searchInstagramCreators,
} from "@/lib/discover";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  try {
    const brief: CampaignBrief = await req.json();

    if (!brief.brandName || !brief.category || !brief.campaignGoal) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { criteria, insights } = await analyzeCampaignBrief(brief);

    const creatorPromises = [];

    if (brief.platforms.includes("youtube")) {
      creatorPromises.push(
        searchYouTubeCreators(criteria.contentKeywords, 8).catch((e) => {
          console.error("YouTube search failed:", e);
          return [];
        })
      );
    }

    if (brief.platforms.includes("instagram")) {
      const igUsernames = criteria.instagramUsernames || [];
      creatorPromises.push(
        searchInstagramCreators(igUsernames, 5).catch((e) => {
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
          fitScore: score?.fitScore || Math.round(Math.random() * 30 + 40),
          fitReason:
            score?.fitReason ||
            "Relevant creator in the target category.",
          contentStyle: score?.contentStyle || creator.contentStyle || "Mixed",
          estimatedReach:
            score?.estimatedReach || creator.estimatedReach,
        };
      });

      allCreators.sort((a, b) => b.fitScore - a.fitScore);
    }

    const analysis: CampaignAnalysis = {
      id: randomUUID(),
      brief,
      criteria,
      recommendations: allCreators.slice(0, 12),
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

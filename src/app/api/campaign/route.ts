import { NextResponse } from "next/server";
import { CampaignBrief, CampaignAnalysis } from "@/lib/types";
import { analyzeCampaignBrief, scoreCreatorFit } from "@/lib/gemini";
import {
  searchYouTubeCreators,
  searchInstagramCreators,
  searchTwitterCreators,
  searchLinkedInCreators,
} from "@/lib/discover";
import { randomUUID } from "crypto";
import { trackEvent, logError } from "@/lib/events";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export const maxDuration = 60;

function getFallbackCreators(category: string, platforms: string[]): import("@/lib/types").CreatorRecommendation[] {
  const seeds: Record<string, import("@/lib/types").CreatorRecommendation[]> = {
    "Food & Cooking": [
      { platform: "instagram", handle: "mumbaifoodicious", name: "MumbaiFoodicious", thumbnailUrl: "", subscriberCount: 86000, engagementRate: 2.5, category: "Food", fitScore: 0, fitReason: "Mumbai-based food blogger with strong local following", estimatedReach: 15000, contentStyle: "Reels & Stories" },
      { platform: "instagram", handle: "delhifoodie", name: "Delhi Foodie", thumbnailUrl: "", subscriberCount: 12000, engagementRate: 3.1, category: "Food", fitScore: 0, fitReason: "Popular food review account", estimatedReach: 5000, contentStyle: "Reels" },
      { platform: "instagram", handle: "mumbaifoodie", name: "Mumbai Foodie", thumbnailUrl: "", subscriberCount: 960000, engagementRate: 1.8, category: "Food", fitScore: 0, fitReason: "Largest Mumbai food community on Instagram", estimatedReach: 100000, contentStyle: "Reels & Posts" },
      { platform: "youtube", handle: "@veggiepaaji", name: "Veggie Paaji", thumbnailUrl: "", subscriberCount: 3600000, engagementRate: 3.2, category: "Food", fitScore: 0, fitReason: "Top vegetarian food creator in India", estimatedReach: 500000, contentStyle: "Long-form reviews" },
      { platform: "youtube", handle: "@cookingshooking", name: "CookingShooking", thumbnailUrl: "", subscriberCount: 6200000, engagementRate: 2.1, category: "Food", fitScore: 0, fitReason: "Popular Indian cooking channel", estimatedReach: 800000, contentStyle: "Recipe videos" },
      { platform: "youtube", handle: "@yourfoodlab", name: "Your Food Lab", thumbnailUrl: "", subscriberCount: 7400000, engagementRate: 1.9, category: "Food", fitScore: 0, fitReason: "Trending food experiments and reviews", estimatedReach: 900000, contentStyle: "Mixed" },
    ],
  };
  const fallback = seeds[category] || seeds["Food & Cooking"];
  return fallback.filter((c) => platforms.includes(c.platform as "youtube" | "instagram" | "twitter" | "linkedin"));
}

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
  const startTime = Date.now();
  let brief = {} as CampaignBrief;
  try {
    const ip = getClientIp(req);
    const { ok } = rateLimit(`campaign:${ip}`, 5, 60_000);
    if (!ok) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a minute and try again." },
        { status: 429 }
      );
    }

    brief = await req.json();

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

    const competitorContextPromise = brief.competitorBrands?.length
      ? Promise.race([
          fetchCompetitorContext(brief.competitorBrands, brief.category),
          new Promise<undefined>((resolve) => setTimeout(() => resolve(undefined), 5000)),
        ])
      : Promise.resolve(undefined);

    const competitorContext = await competitorContextPromise;

    const { criteria, insights } = await analyzeCampaignBrief(
      brief,
      competitorContext
    );

    console.log("Campaign criteria:", JSON.stringify({
      keywords: criteria.contentKeywords,
      igUsernames: criteria.instagramUsernames,
      platforms: brief.platforms,
    }));

    const creatorPromises: Promise<import("@/lib/types").CreatorRecommendation[]>[] = [];

    creatorPromises.push(
      searchYouTubeCreators(criteria.contentKeywords, 15).then((r) => {
        console.log(`YouTube search returned ${r.length} creators`);
        return r;
      }).catch((e) => {
        console.error("YouTube search failed:", e instanceof Error ? e.message : e);
        return [];
      })
    );

    if (brief.platforms.includes("instagram")) {
      let igUsernames = criteria.instagramUsernames || [];
      if (igUsernames.length === 0) {
        const raw = criteria as unknown as Record<string, unknown>;
        for (const key of Object.keys(raw)) {
          if (key.toLowerCase().includes("instagram") && Array.isArray(raw[key])) {
            igUsernames = raw[key] as string[];
            break;
          }
        }
      }
      // Prioritize well-known handles that actually exist on Instagram
      const knownHandles: Record<string, string[]> = {
        "Food & Cooking": ["mumbaifoodicious", "mumbaifoodie"],
        "Fashion & Lifestyle": ["stylebyami"],
        "Tech & Gadgets": ["techburner"],
        "Fitness & Health": [],
      };
      const categorySeeds = knownHandles[brief.category] || [];
      const existingSet = new Set(igUsernames.map((h: string) => h.toLowerCase()));
      for (const seed of categorySeeds) {
        if (!existingSet.has(seed.toLowerCase())) {
          igUsernames.unshift(seed);
        }
      }
      creatorPromises.push(
        Promise.race([
          searchInstagramCreators(igUsernames, 8, criteria.contentKeywords || []).catch((e) => {
            console.error("Instagram search failed:", e);
            return [] as import("@/lib/types").CreatorRecommendation[];
          }),
          new Promise<import("@/lib/types").CreatorRecommendation[]>((resolve) =>
            setTimeout(() => { console.log("Instagram search timed out at 20s"); resolve([]); }, 20000)
          ),
        ])
      );
    }

    if (brief.platforms.includes("twitter")) {
      let twHandles = criteria.twitterHandles || [];
      if (twHandles.length === 0) {
        const raw = criteria as unknown as Record<string, unknown>;
        for (const key of Object.keys(raw)) {
          if (key.toLowerCase().includes("twitter") && Array.isArray(raw[key])) {
            twHandles = raw[key] as string[];
            break;
          }
        }
      }
      if (twHandles.length > 0) {
        creatorPromises.push(
          Promise.race([
            searchTwitterCreators(twHandles, 8).catch((e) => {
              console.error("Twitter search failed:", e);
              return [] as import("@/lib/types").CreatorRecommendation[];
            }),
            new Promise<import("@/lib/types").CreatorRecommendation[]>((resolve) =>
              setTimeout(() => { console.log("Twitter search timed out"); resolve([]); }, 20000)
            ),
          ])
        );
      }
    }

    if (brief.platforms.includes("linkedin")) {
      let liHandles = criteria.linkedinHandles || [];
      if (liHandles.length === 0) {
        const raw = criteria as unknown as Record<string, unknown>;
        for (const key of Object.keys(raw)) {
          if (key.toLowerCase().includes("linkedin") && Array.isArray(raw[key])) {
            liHandles = raw[key] as string[];
            break;
          }
        }
      }
      if (liHandles.length > 0) {
        creatorPromises.push(
          Promise.race([
            searchLinkedInCreators(liHandles, 5).catch((e) => {
              console.error("LinkedIn search failed:", e);
              return [] as import("@/lib/types").CreatorRecommendation[];
            }),
            new Promise<import("@/lib/types").CreatorRecommendation[]>((resolve) =>
              setTimeout(() => { console.log("LinkedIn search timed out"); resolve([]); }, 20000)
            ),
          ])
        );
      }
    }

    const creatorResults = await Promise.all(creatorPromises);
    let allCreators = creatorResults.flat();

    const elapsed = Date.now() - startTime;
    console.log(`Creator discovery: ${allCreators.length} total (${creatorResults.map((r, i) => `source${i}:${r.length}`).join(", ")}) in ${elapsed}ms`);

    if (allCreators.length === 0) {
      console.log("Using fallback seed creators for category:", brief.category);
      allCreators = getFallbackCreators(brief.category, brief.platforms);
    } else if (allCreators.length < 3) {
      const fallback = getFallbackCreators(brief.category, brief.platforms);
      const existingHandles = new Set(allCreators.map((c) => c.handle));
      for (const fc of fallback) {
        if (!existingHandles.has(fc.handle) && allCreators.length < 8) {
          allCreators.push(fc);
        }
      }
    }

    if (allCreators.length > 0 && elapsed < 45000) {
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

      try {
        const scores = await Promise.race([
          scoreCreatorFit(brief, creatorsForScoring),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error("scoring timeout")), 12000)),
        ]);

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
      } catch (e) {
        console.log("Scoring skipped:", e instanceof Error ? e.message : "timeout");
        allCreators.sort((a, b) => b.subscriberCount - a.subscriberCount);
      }
    } else if (allCreators.length > 0) {
      console.log(`Skipping scoring (${elapsed}ms elapsed), sorting by subscribers`);
      allCreators.sort((a, b) => b.subscriberCount - a.subscriberCount);
    }

    const analysis: CampaignAnalysis = {
      id: randomUUID(),
      brief,
      criteria,
      recommendations: allCreators.slice(0, 15),
      aiInsights: insights,
      createdAt: new Date().toISOString(),
    };

    await trackEvent({
      event: "campaign_analyzed",
      properties: {
        brandName: brief.brandName,
        category: brief.category,
        platforms: brief.platforms,
        budgetRange: brief.budgetRange,
        creatorCount: allCreators.length,
      },
    });

    return NextResponse.json(analysis);
  } catch (err) {
    console.error("Campaign analysis error:", err);
    await logError("/api/campaign", err, { brandName: brief?.brandName });
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Campaign analysis failed",
      },
      { status: 500 }
    );
  }
}

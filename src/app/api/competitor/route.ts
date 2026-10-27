import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { requirePro } from "@/lib/require-pro";

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

export async function POST(req: Request) {
  const gate = await requirePro();
  if (gate) return gate;

  try {
    const { brands, category } = await req.json();

    if (!brands || !Array.isArray(brands) || brands.length === 0) {
      return NextResponse.json({ error: "At least one brand name is required" }, { status: 400 });
    }

    const brandList = brands.slice(0, 3);

    const prompt = `You are an Indian influencer marketing expert. For each brand below, identify real Indian YouTube and Instagram creators who have likely done sponsored/paid collaborations with them in the last year. Use your knowledge of the Indian creator ecosystem.

Brands to analyze: ${brandList.join(", ")}
${category ? `Industry: ${category}` : ""}

For each brand, provide:
1. A 2-sentence summary of their influencer marketing strategy
2. Up to 5 creators who have collaborated with them

Respond ONLY with valid JSON (no markdown, no code blocks):
{
  "results": [
    {
      "brandName": "Brand Name",
      "summary": "Summary of their influencer marketing approach...",
      "mentions": [
        {
          "creatorName": "Creator Full Name",
          "platform": "youtube" or "instagram",
          "handle": "their_handle",
          "followerCount": 500000,
          "contentType": "Dedicated Video" or "Reel" or "Story" or "Integration",
          "estimatedReach": 100000,
          "context": "Brief description of the collaboration/campaign"
        }
      ]
    }
  ]
}

Important: Use REAL Indian creators who are known to have worked with these brands. If you're not sure about a brand, still provide your best analysis based on the brand's category and typical marketing approach. Follower counts should be realistic estimates.`;

    const text = await generateWithRetry(prompt);

    let cleaned = text;
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const data = JSON.parse(cleaned);

    const YT_KEY = process.env.YOUTUBE_API_KEY;
    if (YT_KEY && data.results) {
      for (const result of data.results) {
        if (!result.mentions) continue;
        const verified: typeof result.mentions = [];
        for (const m of result.mentions) {
          try {
            if (m.platform === "youtube" && m.handle) {
              const handle = m.handle.startsWith("@") ? m.handle : `@${m.handle}`;
              const searchUrl = `https://www.googleapis.com/youtube/v3/search?key=${YT_KEY}&part=snippet&q=${encodeURIComponent(handle)}&type=channel&maxResults=1`;
              const sRes = await fetch(searchUrl, { cache: "no-store" });
              if (sRes.ok) {
                const sData = await sRes.json();
                const chId = sData.items?.[0]?.snippet?.channelId;
                if (chId) {
                  const chUrl = `https://www.googleapis.com/youtube/v3/channels?key=${YT_KEY}&part=statistics&id=${chId}`;
                  const chRes = await fetch(chUrl, { cache: "no-store" });
                  if (chRes.ok) {
                    const chData = await chRes.json();
                    const stats = chData.items?.[0]?.statistics;
                    if (stats) {
                      m.followerCount = parseInt(stats.subscriberCount || "0");
                      m.estimatedReach = Math.round(m.followerCount * 0.1);
                      m.verified = true;
                    }
                  }
                }
              }
            }
          } catch {
            // verification is best-effort
          }
          verified.push(m);
        }
        result.mentions = verified;
      }
    }

    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to analyze competitors";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

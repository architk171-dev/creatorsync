import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

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
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to analyze competitors";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

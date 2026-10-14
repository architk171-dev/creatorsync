import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  CampaignBrief,
  CreatorCriteria,
  CreatorRecommendation,
} from "./types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

function safeParseJSON(raw: string): any {
  try {
    return JSON.parse(raw);
  } catch {
    // Clean common LLM JSON issues: trailing commas, unescaped newlines in strings, control chars
    let cleaned = raw
      .replace(/,\s*([\]}])/g, "$1") // trailing commas
      .replace(/[\x00-\x1f]/g, (ch) => {
        if (ch === "\n" || ch === "\r" || ch === "\t") return ch;
        return "";
      });
    // Try to fix unescaped newlines inside string values
    cleaned = cleaned.replace(/"([^"]*?)"/g, (match) => {
      return match.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t");
    });
    try {
      return JSON.parse(cleaned);
    } catch (e2) {
      throw new Error(`JSON parse failed after cleanup: ${(e2 as Error).message}`);
    }
  }
}

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

function getGoalLabels(brief: CampaignBrief): string {
  const goalMap: Record<string, string> = {
    awareness: "Brand Awareness",
    conversions: "Conversions / Sales",
    ugc: "User-Generated Content",
    engagement: "Community Engagement",
    launches: "Product Launch",
  };
  const goals = brief.campaignGoals?.length
    ? brief.campaignGoals
    : [brief.campaignGoal];
  return goals.map((g) => goalMap[g] || g).join(" + ");
}

const BANNED_PHRASES = `
CRITICAL: Your output must NOT contain any of these phrases or close variants:
"leverage the creator's authentic voice", "resonate with the target audience",
"create meaningful connections", "drive awareness", "build brand affinity",
"tap into", "align with", "foster engagement", "craft compelling content",
"elevate the brand", "maximize impact", "curate content", "amplify reach",
"harness the power of", "create a buzz", "seamlessly integrate",
"authentic engagement", "organic reach", "brand synergy".
If you catch yourself writing any corporate-sounding filler, delete it and write what you actually mean in plain Hindi-English (Hinglish) or direct English.
`.trim();

export async function analyzeCampaignBrief(
  brief: CampaignBrief,
  competitorContext?: string
): Promise<{
  criteria: CreatorCriteria;
  insights: {
    campaignStrategy: string;
    idealCreatorProfile: string;
    budgetAllocation: string;
    expectedOutcomes: string;
    creativeIdeas: string[];
    antiPatterns: string[];
  };
}> {
  const budgetLabels: Record<string, string> = {
    "under-50K": "Under ₹50,000",
    "under-1L": "Under ₹1 Lakh",
    "1L-5L": "₹1-5 Lakhs",
    "5L-15L": "₹5-15 Lakhs",
    "15L-50L": "₹15-50 Lakhs",
    "above-50L": "Above ₹50 Lakhs",
  };

  const competitorBlock = competitorContext
    ? `\nCOMPETITOR INTEL (what similar brands are already doing — your ideas MUST be different):\n${competitorContext}\n\nIMPORTANT: Every creative idea you suggest must explicitly NOT repeat what these competitors have done. Reference what they did and explain why your idea is different.`
    : "";

  const prompt = `You are a senior influencer marketing strategist who has run 200+ campaigns for Indian D2C brands. You hate generic advice. You speak in specifics — exact video formats, exact hooks, exact scenes.

${BANNED_PHRASES}

CAMPAIGN BRIEF:
- Brand: ${brief.brandName}
- Category: ${brief.category}
- Goals: ${getGoalLabels(brief)}
- Target Audience: ${brief.targetAudience}
- Platforms: ${brief.platforms.join(", ")}
- Budget: ${budgetLabels[brief.budgetRange] || brief.budgetRange}
- Geography: ${brief.geography}
- Description: ${brief.description}
${competitorBlock}

STEP 1 — ANTI-PATTERN FILTER (do this mentally before generating ideas):
First, list the 10-15 most common, cliché, overdone influencer campaign approaches in the ${brief.category} category in India. Examples of cliché approaches: unboxing with fake surprise, "a day in my life" with forced product placement, discount code videos, generic "honest review" that's obviously scripted, "morning routine" with product plug.
These are your BLOCKED approaches. NONE of your creative ideas may use any of these cliché formats. If an idea even slightly resembles a blocked approach, discard it and think of something genuinely different.

STEP 2 — GENERATE:
YOUR JOB: Give specific, surprising, actually-executable campaign ideas that AVOID every cliché you identified above. Not "create engaging content" — instead "Creator opens video unboxing a competitor's product, uses it for 30 seconds, then switches to ${brief.brandName} and shows the exact difference."

Respond ONLY with valid JSON (no markdown, no code fences):
{
  "criteria": {
    "subscriberRange": { "min": <number>, "max": <number> },
    "engagementMin": <number between 1-10>,
    "contentKeywords": [<8-12 search keywords for finding creators in this niche — be specific, include both broad and niche terms>],
    "instagramUsernames": [<10-15 real Instagram usernames/handles of popular Indian creators in this niche who would be a good fit — no @ prefix, just the username. Include a mix of nano, micro, and mid-tier creators>],
    "twitterHandles": [<5-10 real Twitter/X handles of popular creators in this niche — no @ prefix. Include thought leaders, commentators, and content creators active on X>],
    "linkedinHandles": [<5-8 real LinkedIn profile usernames of thought leaders, industry experts, and professional influencers in this niche — just the slug from linkedin.com/in/SLUG>],
    "audienceMatch": "<one sentence describing ideal audience>",
    "platformFocus": "<which platform is more important and why>",
    "reasoning": "<2-3 sentences on why these criteria>"
  },
  "insights": {
    "campaignStrategy": "<3-4 sentences. Be specific: name exact content formats (YouTube Shorts vs long-form, Reels vs carousel), exact posting cadence (e.g. 'Drop teaser Reel on Monday, full video Thursday, Story poll Friday'), and why this sequence works for ${brief.brandName} specifically — not any random brand>",
    "idealCreatorProfile": "<2-3 sentences. Don't say 'tech creator with engaged audience'. Say 'A creator who does comparison/review content, has done at least 2 brand deals in the last 3 months but NOT with ${brief.brandName}'s direct competitors, and whose comment section shows real product questions not just fire emojis'>",
    "budgetAllocation": "<2-3 sentences with actual percentage splits and reasoning. e.g. '60% on 2 mid-tier creators (5-15L subs) for dedicated videos, 30% on 5 nano creators (10-50K) for Instagram Reels creating a wave effect, 10% for boosting the best-performing piece'>",
    "expectedOutcomes": "<2-3 sentences with specific number ranges, not vague promises. e.g. 'With this budget and creator mix, expect 5-8L total views across YouTube, 15K-25K profile visits, and a 2-3x spike in brand search volume within 2 weeks of launch'>",
    "clicheApproaches": [
      "<List 5-8 of the most overdone approaches in ${brief.category} influencer campaigns that you are explicitly avoiding>"
    ],
    "creativeIdeas": [
      "<Idea 1: A specific, scene-by-scene content concept that is NOT a cliché. Start with the hook, describe the middle, end with the CTA. 2-3 sentences. Must be something this specific brand can do that a generic brand cannot. End with: 'Why this works: [reason]'>",
      "<Idea 2: A different format/angle entirely. If Idea 1 is a YouTube video, make this an Instagram series or a challenge. End with why this avoids the usual pattern.>",
      "<Idea 3: An unconventional idea that breaks the category norm. What would make someone screenshot this and share it? End with why it's different.>"
    ],
    "antiPatterns": [
      "<What NOT to do: A specific mistake brands in ${brief.category} commonly make with influencer campaigns, and why it backfires. Be concrete — name the exact format/hook that fails.>",
      "<Another common mistake to avoid — name the cliché and explain what happens when brands do it>"
    ],
    "benchmarks": {
      "topFormats": ["<Top 3-4 content formats that perform best in ${brief.category} on ${brief.platforms.join(" and ")}, ranked by typical engagement. e.g. 'YouTube Shorts (2.3x avg engagement)', 'Instagram Reels (1.8x)'>"],
      "engagementByTier": [
        { "tier": "Nano (1K-10K)", "rate": "<typical engagement rate for nano creators in ${brief.category}>" },
        { "tier": "Micro (10K-100K)", "rate": "<rate>" },
        { "tier": "Mid (100K-500K)", "rate": "<rate>" },
        { "tier": "Macro (500K+)", "rate": "<rate>" }
      ],
      "bestPostingCadence": "<Optimal posting schedule for ${brief.category} campaigns. e.g. 'Drop teaser Monday, main video Wednesday, recap Reel Friday'>",
      "platformTip": "<One specific platform insight for ${brief.category}. e.g. 'YouTube Shorts outperform long-form for awareness in tech by 2.3x'>"
    }
  }
}`;

  const text = await generateWithRetry(prompt);

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse Gemini response");

  const parsed = safeParseJSON(jsonMatch[0]);

  if (!parsed.insights.creativeIdeas) {
    parsed.insights.creativeIdeas = [];
  }
  if (!parsed.insights.clicheApproaches) {
    parsed.insights.clicheApproaches = [];
  }
  if (!parsed.insights.antiPatterns) {
    parsed.insights.antiPatterns = [];
  }
  if (!parsed.insights.benchmarks) {
    parsed.insights.benchmarks = { topFormats: [], engagementByTier: [], bestPostingCadence: "", platformTip: "" };
  }

  return parsed;
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
    instagramUrl?: string;
    fitDimensions?: {
      audienceMatch: number;
      engagementQuality: number;
      contentRelevance: number;
      brandSafety: number;
      valueForMoney: number;
    };
  }[]
> {
  if (!creators.length) return [];

  const creatorsText = creators
    .map(
      (c, i) =>
        `${i + 1}. ${c.name} (@${c.handle}) on ${c.platform} — ${c.subscribers} subscribers, ${c.engagement}% engagement. Category: ${c.category}. Description: ${c.description?.slice(0, 150)}. Recent content: ${c.recentContent?.slice(0, 150)}`
    )
    .join("\n");

  const prompt = `You are an influencer marketing expert who scores creators based on REAL fit, not vibes. A creator with 500K followers and 8% engagement in the wrong niche scores lower than a 50K creator with 3% engagement in the exact right niche.

${BANNED_PHRASES}

CAMPAIGN:
- Brand: ${brief.brandName} (${brief.category})
- Goals: ${getGoalLabels(brief)}
- Target Audience: ${brief.targetAudience}
- Geography: ${brief.geography}
- Description: ${brief.description}

CREATORS:
${creatorsText}

Score each creator honestly. If they're a bad fit, say so — don't sugarcoat with "while not a perfect match, they bring unique value." Just say "Poor fit because X."

For each creator, also try to provide their Instagram handle/URL if you know it (even if they were found on YouTube).

Respond ONLY with a valid JSON array (no markdown, no code fences):
[
  {
    "handle": "<handle>",
    "fitScore": <0-100>,
    "fitReason": "<1-2 direct sentences. Be blunt. 'Great fit because their last 5 videos were gadget reviews and their audience comments about purchase decisions' or 'Poor fit — lifestyle creator whose audience cares about fashion, not finance'>",
    "contentStyle": "<brief description of their content style>",
    "estimatedReach": <estimated total reach for a sponsored post/video>,
    "instagramUrl": "<their Instagram profile URL if known, e.g. https://instagram.com/username, or null>",
    "fitDimensions": {
      "audienceMatch": <0-100 how well their audience matches target>,
      "engagementQuality": <0-100 real engagement vs vanity metrics>,
      "contentRelevance": <0-100 how relevant their content is to the brand>,
      "brandSafety": <0-100 how brand-safe their content is>,
      "valueForMoney": <0-100 bang for buck given their rates vs reach>
    }
  }
]`;

  const text = await generateWithRetry(prompt);

  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];

  return safeParseJSON(jsonMatch[0]);
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
  creatorScript: {
    hook: string;
    body: string[];
    cta: string;
    notes: string;
  };
}> {
  const budgetLabels: Record<string, string> = {
    "under-50K": "Under ₹50,000",
    "under-1L": "Under ₹1 Lakh",
    "1L-5L": "₹1-5 Lakhs",
    "5L-15L": "₹5-15 Lakhs",
    "15L-50L": "₹15-50 Lakhs",
    "above-50L": "Above ₹50 Lakhs",
  };

  const prompt = `You are a creative director writing a deliverable brief AND a creator script for a brand campaign. The script should feel like something the creator would actually say — not a corporate press release read aloud.

${BANNED_PHRASES}

CAMPAIGN:
- Brand: ${brief.brandName}
- Category: ${brief.category}
- Goals: ${getGoalLabels(brief)}
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

SCRIPT GUIDELINES:
- Write the hook as exactly what the creator says in the first 3 seconds. It should stop the scroll. Not "Hey guys, today I'm going to..." — instead a question, a bold claim, or a visual hook description.
- The body should be 4-6 bullet points, each one being a talking point (not word-for-word script — creators hate that). Each point is 1-2 sentences describing what to say/show.
- The CTA should be natural, not "Link in bio, use code XYZ for 10% off." Think about what would actually make the viewer act.
- Notes are production tips: lighting, b-roll suggestions, transitions, music mood.

Respond ONLY with valid JSON (no markdown, no code fences):
{
  "overview": "<2-3 sentences summarizing the campaign and what the creator needs to do — be specific about the content piece, not vague 'create engaging content'>",
  "contentFormat": ["<specific content formats e.g. Instagram Reel, YouTube Short, Story series>"],
  "keyMessaging": ["<3-5 key messaging points — written as actual talking points, not corporate bullet points>"],
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
  "callToAction": "<the specific CTA the creator should use>",
  "creatorScript": {
    "hook": "<The exact opening line/scene. 1-2 sentences. This is what stops the scroll.>",
    "body": [
      "<Talking point 1: What to say and what to show on screen. 1-2 sentences.>",
      "<Talking point 2>",
      "<Talking point 3>",
      "<Talking point 4>"
    ],
    "cta": "<The natural closing + call to action. 1-2 sentences.>",
    "notes": "<Production notes: suggested b-roll, transitions, music mood, lighting tips. 2-3 sentences.>"
  }
}`;

  const text = await generateWithRetry(prompt);
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to generate deliverable brief");
  return safeParseJSON(jsonMatch[0]);
}

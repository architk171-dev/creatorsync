import { NextResponse } from "next/server";
import { getLinkedInProfiles } from "@/lib/linkedin";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { getCached, setCache } from "@/lib/cache";

export const maxDuration = 30;

const CACHE_TTL = 10 * 60 * 1000;

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const { ok } = rateLimit(`linkedin:${ip}`, 20, 60_000);
    if (!ok) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a minute and try again." },
        { status: 429 }
      );
    }
    const { handles } = await req.json();

    if (!handles || !Array.isArray(handles) || handles.length === 0) {
      return NextResponse.json(
        { error: "Provide at least one LinkedIn profile URL or username" },
        { status: 400 }
      );
    }

    const sorted = handles.slice(0, 5).map((h: string) => h.trim().toLowerCase()).sort();
    const cacheKey = `linkedin:${sorted.join(",")}`;
    const cached = getCached<{ profiles: unknown[] }>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const profiles = await getLinkedInProfiles(sorted);
    const result = { profiles };
    if (profiles.length > 0) setCache(cacheKey, result, CACHE_TTL);
    return NextResponse.json(result);
  } catch (err) {
    console.error("LinkedIn API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch LinkedIn profiles" },
      { status: 500 }
    );
  }
}

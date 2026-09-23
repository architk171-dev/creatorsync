import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import {
  resolveChannelId,
  getChannelData,
  getRecentVideos,
  calculateUploadFrequency,
} from "@/lib/youtube";
import { getInstagramProfile } from "@/lib/instagram";
import { generateVerdict } from "@/lib/verdict";
import { ReportData } from "@/lib/types";

const reportCache = new Map<string, { data: ReportData; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { youtubeHandle, instagramHandle, email } = body;

    if (!youtubeHandle && !instagramHandle) {
      return NextResponse.json(
        { error: "At least one platform handle is required" },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const cacheKey = `${youtubeHandle || ""}_${instagramHandle || ""}`;
    const cached = reportCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      const report = {
        ...cached.data,
        id: randomUUID(),
        createdAt: new Date().toISOString(),
        buyerEmail: email,
        status: "preview" as const,
      };
      return NextResponse.json(report);
    }

    const reportId = randomUUID();
    const report: ReportData = {
      id: reportId,
      createdAt: new Date().toISOString(),
      status: "preview",
      buyerEmail: email,
      verdict: {
        engagementBenchmark: "",
        engagementVerdict: "average",
        growthFlag: "Flat",
        consistencyFlag: "Irregular",
        summary: "",
        overallScore: 50,
      },
    };

    if (youtubeHandle) {
      try {
        const channelId = await resolveChannelId(youtubeHandle);
        const channel = await getChannelData(channelId);
        const recentVideos = await getRecentVideos(channelId, 10);

        const topVideos = [...recentVideos]
          .sort((a, b) => b.viewCount - a.viewCount)
          .slice(0, 5);

        const avgEngagement =
          recentVideos.length > 0
            ? recentVideos.reduce((s, v) => s + v.engagementRate, 0) /
              recentVideos.length
            : 0;

        const uploadFrequency = calculateUploadFrequency(recentVideos);

        const last30 = recentVideos
          .filter((v) => {
            const d = new Date(v.publishedAt);
            const now = new Date();
            return now.getTime() - d.getTime() < 30 * 24 * 60 * 60 * 1000;
          })
          .reduce((s, v) => s + v.viewCount, 0);

        report.youtube = {
          channel,
          recentVideos,
          topVideos,
          avgEngagementRate: Math.round(avgEngagement * 100) / 100,
          last30DayViews: last30,
          uploadFrequency,
          growthTrend: recentVideos
            .slice(0, 6)
            .reverse()
            .map((v) => ({
              label: new Date(v.publishedAt).toLocaleDateString("en-IN", {
                month: "short",
                day: "numeric",
              }),
              views: v.viewCount,
            })),
        };

        report.verdict = generateVerdict(
          avgEngagement,
          recentVideos,
          channel.subscriberCount,
          uploadFrequency
        );
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "YouTube fetch failed";
        if (
          message.includes("not found") ||
          message.includes("private")
        ) {
          return NextResponse.json(
            {
              error: message,
              code: "CHANNEL_NOT_FOUND",
            },
            { status: 404 }
          );
        }
        throw err;
      }
    }

    if (instagramHandle) {
      try {
        report.instagram = await getInstagramProfile(instagramHandle);
      } catch {
        if (!youtubeHandle) {
          return NextResponse.json(
            { error: "Instagram profile not found" },
            { status: 404 }
          );
        }
      }
    }

    reportCache.set(cacheKey, { data: report, timestamp: Date.now() });

    return NextResponse.json(report);
  } catch (err) {
    console.error("Report generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate report. Please try again." },
      { status: 500 }
    );
  }
}

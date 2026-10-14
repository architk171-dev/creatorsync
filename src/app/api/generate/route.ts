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
import type { ReportData } from "@/lib/types";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { trackEvent, logError } from "@/lib/events";

export async function POST(request: NextRequest) {
  let body: any = {};
  try {
    const ip = getClientIp(request);
    const { ok } = rateLimit(`generate:${ip}`, 10, 60_000);
    if (!ok) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a minute and try again." },
        { status: 429 }
      );
    }
    body = await request.json();
    const { youtubeHandle, email } = body;
    const instagramHandles: string[] = body.instagramHandles || [];
    const instagramHandle: string = body.instagramHandle || instagramHandles[0] || "";

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
      } catch (igErr) {
        const igMessage = igErr instanceof Error ? igErr.message : "Instagram profile not found";
        if (!youtubeHandle) {
          return NextResponse.json(
            { error: igMessage },
            { status: 404 }
          );
        }
        console.warn("Instagram fetch failed (YouTube present, continuing):", igMessage);
      }
    }

    await trackEvent({
      event: "report_generated",
      email,
      properties: {
        youtubeHandle,
        instagramHandle,
        hasYoutube: !!report.youtube,
        hasInstagram: !!report.instagram,
        score: report.verdict.overallScore,
      },
    });

    return NextResponse.json(report);
  } catch (err) {
    console.error("Report generation error:", err);
    await logError("/api/generate", err, { youtubeHandle: body?.youtubeHandle, email: body?.email });
    return NextResponse.json(
      { error: "Failed to generate report. Please try again." },
      { status: 500 }
    );
  }
}

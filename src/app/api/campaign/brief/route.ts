import { NextResponse } from "next/server";
import { generateDeliverableBrief } from "@/lib/gemini";
import { CampaignBrief } from "@/lib/types";
import { trackEvent, logError } from "@/lib/events";
import { requirePro } from "@/lib/require-pro";

export async function POST(req: Request) {
  const gate = await requirePro();
  if (gate) return gate;

  let reqBody: any = {};
  try {
    const { brief, creator } = reqBody = (await req.json()) as {
      brief: CampaignBrief;
      creator: {
        name: string;
        handle: string;
        platform: string;
        subscribers: number;
        engagement: number;
        category: string;
        fitReason: string;
        contentStyle: string;
      };
    };

    if (!brief || !creator) {
      return NextResponse.json(
        { error: "Missing brief or creator data" },
        { status: 400 }
      );
    }

    const deliverable = await generateDeliverableBrief(brief, creator);

    await trackEvent({
      event: "deep_report_generated",
      properties: {
        creatorHandle: creator.handle,
        creatorPlatform: creator.platform,
        brandName: brief.brandName,
      },
    });

    return NextResponse.json(deliverable);
  } catch (err) {
    console.error("Deliverable brief error:", err);
    await logError("/api/campaign/brief", err, reqBody);
    await trackEvent({
      event: "deep_report_failed",
      properties: { creatorHandle: reqBody?.creator?.handle },
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to generate brief" },
      { status: 500 }
    );
  }
}

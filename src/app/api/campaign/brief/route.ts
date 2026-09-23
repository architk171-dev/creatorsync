import { NextResponse } from "next/server";
import { generateDeliverableBrief } from "@/lib/gemini";
import { CampaignBrief } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const { brief, creator } = (await req.json()) as {
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
    return NextResponse.json(deliverable);
  } catch (err) {
    console.error("Deliverable brief error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to generate brief" },
      { status: 500 }
    );
  }
}

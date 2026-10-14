import { NextResponse } from "next/server";
import { trackEvent } from "@/lib/events";
import type { EventName } from "@/lib/events";

export async function POST(req: Request) {
  try {
    const { event, properties, email, userId } = await req.json();

    if (!event) {
      return NextResponse.json({ error: "event is required" }, { status: 400 });
    }

    await trackEvent({
      event: event as EventName,
      properties,
      email,
      userId,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to track event" }, { status: 500 });
  }
}

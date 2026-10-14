import { supabaseAdmin } from "./supabase";

export type EventName =
  | "page_view"
  | "report_generated"
  | "report_viewed"
  | "deep_report_requested"
  | "deep_report_generated"
  | "deep_report_failed"
  | "campaign_created"
  | "campaign_analyzed"
  | "creator_compared"
  | "brief_generated"
  | "sign_in"
  | "sign_up"
  | "sign_out"
  | "platform_switched"
  | "pricing_viewed"
  | "cta_clicked"
  | "error";

interface EventPayload {
  event: EventName;
  userId?: string;
  email?: string;
  properties?: Record<string, any>;
  error?: string;
  endpoint?: string;
  requestBody?: any;
  stack?: string;
}

export async function trackEvent(payload: EventPayload) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return;
  try {
    await supabaseAdmin.from("events").insert({
      event_name: payload.event,
      user_id: payload.userId || null,
      email: payload.email || null,
      properties: payload.properties || {},
      error_message: payload.error || null,
      endpoint: payload.endpoint || null,
      request_body: payload.requestBody || null,
      stack_trace: payload.stack || null,
    });
  } catch (e) {
    console.error("Event tracking failed:", e);
  }
}

export async function logError(
  endpoint: string,
  error: unknown,
  requestBody?: any,
  userId?: string
) {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  await trackEvent({
    event: "error",
    userId,
    endpoint,
    error: message,
    stack,
    requestBody,
  });
}

import { Webhooks } from "@dodopayments/nextjs";
import { getSupabaseAdmin } from "@/lib/supabase";
import { linkDodoCustomer, setUserPlanByCustomerId } from "@/lib/plan";

// Claims an idempotency key before acting; returns false if already processed.
async function claim(webhookId: string, eventType: string): Promise<boolean> {
  const { error } = await getSupabaseAdmin()
    .from("webhook_log")
    .insert({ webhook_id: webhookId, event_type: eventType });
  // Unique constraint violation = already processed this delivery.
  return !error;
}

export const POST = Webhooks({
  webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY || "",
  onPayload: async (payload) => {
    const webhookId =
      (payload.data as { payment_id?: string; subscription_id?: string }).payment_id ||
      (payload.data as { subscription_id?: string }).subscription_id ||
      `${payload.type}-${payload.timestamp}`;

    const isNew = await claim(webhookId, payload.type);
    if (!isNew) return;

    const data = payload.data as {
      customer?: { customer_id?: string; email?: string };
      subscription_id?: string;
    };
    const customerId = data.customer?.customer_id;
    const email = data.customer?.email;

    if (customerId && email) {
      await linkDodoCustomer(email, customerId);
    }

    switch (payload.type) {
      case "subscription.active":
        if (customerId) {
          await setUserPlanByCustomerId(customerId, "pro", data.subscription_id);
        }
        break;
      case "subscription.cancelled":
      case "subscription.failed":
      case "subscription.expired":
        if (customerId) {
          await setUserPlanByCustomerId(customerId, "free");
        }
        break;
      default:
        break;
    }
  },
});

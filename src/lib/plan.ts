import { getSupabaseAdmin } from "./supabase";

export type Plan = "free" | "pro";

export async function getUserPlanByEmail(email: string): Promise<Plan> {
  const { data } = await getSupabaseAdmin()
    .from("users")
    .select("plan")
    .eq("email", email)
    .single();
  return data?.plan === "pro" ? "pro" : "free";
}

export async function setUserPlanByCustomerId(
  dodoCustomerId: string,
  plan: Plan,
  dodoSubscriptionId?: string
) {
  const admin = getSupabaseAdmin();
  const update: Record<string, unknown> = {
    plan,
    plan_updated_at: new Date().toISOString(),
  };
  if (dodoSubscriptionId) update.dodo_subscription_id = dodoSubscriptionId;

  await admin.from("users").update(update).eq("dodo_customer_id", dodoCustomerId);
}

export async function linkDodoCustomer(email: string, dodoCustomerId: string) {
  await getSupabaseAdmin()
    .from("users")
    .update({ dodo_customer_id: dodoCustomerId })
    .eq("email", email);
}

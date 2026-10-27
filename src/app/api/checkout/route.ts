import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import DodoPayments from "dodopayments";
import { authOptions } from "@/lib/auth";
import { dodoEnvironment, DODO_PRO_PRODUCT_ID } from "@/lib/dodo-env";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  if (!DODO_PRO_PRODUCT_ID) {
    return NextResponse.json({ error: "Billing is not configured yet" }, { status: 503 });
  }

  const { data: user } = await getSupabaseAdmin()
    .from("users")
    .select("dodo_customer_id, email, name")
    .eq("email", session.user.email)
    .single();

  const client = new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY,
    environment: dodoEnvironment,
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://nocapverify.in";

  const checkoutSession = await client.checkoutSessions.create({
    product_cart: [{ product_id: DODO_PRO_PRODUCT_ID, quantity: 1 }],
    customer: user?.dodo_customer_id
      ? { customer_id: user.dodo_customer_id }
      : { email: session.user.email, name: user?.name || session.user.name || "" },
    return_url: `${appUrl}/pricing?upgraded=1`,
  });

  return NextResponse.json({ checkoutUrl: checkoutSession.checkout_url });
}

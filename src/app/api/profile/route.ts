import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  const { data: user } = await supabase
    .from("users")
    .select("id, name, email, avatar_url, provider, created_at")
    .eq("email", session.user.email)
    .single();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { data: campaigns } = await supabase
    .from("events")
    .select("*")
    .eq("user_id", user.id)
    .eq("event_name", "campaign_analyzed")
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: reports } = await supabase
    .from("events")
    .select("*")
    .eq("user_id", user.id)
    .eq("event_name", "report_generated")
    .order("created_at", { ascending: false })
    .limit(20);

  const { count: totalEvents } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar_url: user.avatar_url,
      provider: user.provider,
      created_at: user.created_at,
    },
    campaigns: campaigns || [],
    reports: reports || [],
    totalEvents: totalEvents || 0,
  });
}

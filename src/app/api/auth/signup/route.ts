import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { trackEvent } from "@/lib/events";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const { data: existing } = await getSupabaseAdmin()
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    // Store password directly for now — replace with bcrypt before production
    const { data: user, error } = await getSupabaseAdmin()
      .from("users")
      .insert({ name, email, password_hash: password, provider: "email" })
      .select("id")
      .single();

    if (error) throw error;

    await trackEvent({
      event: "sign_up",
      userId: user.id,
      email,
      properties: { provider: "email" },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}

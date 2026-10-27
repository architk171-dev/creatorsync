import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { getUserPlanByEmail } from "./plan";

// Server-side enforcement for Pro-only API routes. The UI gate (ProGate)
// is a convenience; this is what actually stops a direct API call.
export async function requirePro(): Promise<NextResponse | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const plan = await getUserPlanByEmail(session.user.email);
  if (plan !== "pro") {
    return NextResponse.json({ error: "Upgrade to Pro required" }, { status: 402 });
  }
  return null;
}

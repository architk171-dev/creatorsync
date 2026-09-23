import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();

    // TODO: Wire up Razorpay webhook verification
    // const crypto = require("crypto");
    // const signature = request.headers.get("x-razorpay-signature");
    // const expectedSig = crypto
    //   .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    //   .update(body)
    //   .digest("hex");
    // if (signature !== expectedSig) {
    //   return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    // }

    const payload = JSON.parse(body);
    const event = payload.event;

    if (event === "payment.captured") {
      const reportId = payload.payload.payment.entity.notes?.report_id;
      if (reportId) {
        // TODO: Update report status in DB, generate PDF, send email
        console.log(`Payment captured for report: ${reportId}`);
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

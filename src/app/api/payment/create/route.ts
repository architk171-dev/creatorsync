import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { reportId, amount } = await request.json();

    // TODO: Wire up Razorpay when ready
    // const Razorpay = require("razorpay");
    // const instance = new Razorpay({
    //   key_id: process.env.RAZORPAY_KEY_ID,
    //   key_secret: process.env.RAZORPAY_KEY_SECRET,
    // });
    // const order = await instance.orders.create({
    //   amount: amount * 100, // paise
    //   currency: "INR",
    //   receipt: reportId,
    // });

    const order = {
      id: `order_placeholder_${reportId}`,
      amount: amount * 100,
      currency: "INR",
      receipt: reportId,
    };

    return NextResponse.json(order);
  } catch (err) {
    console.error("Payment creation error:", err);
    return NextResponse.json(
      { error: "Failed to create payment order" },
      { status: 500 }
    );
  }
}

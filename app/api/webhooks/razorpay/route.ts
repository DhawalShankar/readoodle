import { NextResponse } from "next/server";
import crypto from "crypto";
import { getRentalsCollection, getBooksCollection } from "@/lib/mongodb";

export async function POST(request: Request) {
  const body = await request.text(); // raw text zaroori hai signature verify ke liye
  const signature = request.headers.get("x-razorpay-signature") ?? "";

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest("hex");

  if (expectedSignature !== signature) {
    return NextResponse.json({ detail: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(body);

  if (event.event === "payment.captured") {
    const orderId = event.payload.payment.entity.order_id;
    const rentals = await getRentalsCollection();
    const rental = await rentals.findOne({ razorpayOrderId: orderId });

    if (rental && rental.status === "created") {
      await rentals.updateOne({ razorpayOrderId: orderId }, { $set: { status: "paid", paidAt: new Date() } });
      const books = await getBooksCollection();
      await books.updateOne({ id: rental.bookId }, { $set: { available: false } });
    }
  }

  return NextResponse.json({ received: true });
}
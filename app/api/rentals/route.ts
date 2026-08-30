import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { randomUUID } from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getBooksCollection, getRentalsCollection, getUsersCollection } from "@/lib/mongodb";
import { FIXED_RENTAL_PRICE_PER_WEEK, FIXED_SECURITY_DEPOSIT, DEFAULT_MAX_ACTIVE_RENTALS } from "@/lib/constants";
import { ObjectId } from "mongodb";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ detail: "Login zaroori hai" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const { bookId, weeks } = await request.json();

  const books = await getBooksCollection();
  const book = await books.findOne({ id: bookId });
  if (!book || !book.available) {
    return NextResponse.json({ detail: "Book available nahi hai" }, { status: 400 });
  }

  // --- yehi wo naya check hai: kitni books already hold ki hui hain ---
  const users = await getUsersCollection();
  const userDoc = await users.findOne({ _id: new ObjectId(userId) });
  const maxActiveRentals = userDoc?.maxActiveRentals ?? DEFAULT_MAX_ACTIVE_RENTALS;

  const rentals = await getRentalsCollection();
  const activeCount = await rentals.countDocuments({
    renterId: userId,
    status: "paid",
    returnedAt: { $exists: false }, // jab tak return na ho, active maani jayegi
  });

  if (activeCount >= maxActiveRentals) {
    return NextResponse.json(
      { detail: `Tum abhi ${activeCount} book(s) hold kar rahe ho — pehle return karo, phir naya rent karo.` },
      { status: 400 },
    );
  }
  // --- check yahan tak ---

  const amountInPaise = (FIXED_RENTAL_PRICE_PER_WEEK * weeks + FIXED_SECURITY_DEPOSIT) * 100;

  const order = await razorpay.orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt: randomUUID(),
  });

  await rentals.insertOne({
    id: order.receipt,
    bookId,
    renterId: userId,
    weeks,
    amount: amountInPaise / 100,
    razorpayOrderId: order.id,
    status: "created",
    createdAt: new Date(),
  });

  return NextResponse.json({ orderId: order.id, amount: amountInPaise, key: process.env.RAZORPAY_KEY_ID });
}
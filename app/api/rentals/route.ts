import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getBooksCollection, getRentalsCollection, getUsersCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ detail: "Please log in first." }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const userEmail = session.user.email ?? "";
  const userName = session.user.name ?? "User";

  const ip = getClientIp(request);
  const { allowed } = rateLimit(`rental:${userId || ip}`, { limit: 10, windowMs: 15 * 60 * 1000 }); // 10 requests / 15 min per user
  if (!allowed) {
    return NextResponse.json(
      { detail: "Too many rental requests. Please slow down and try again shortly." },
      { status: 429 }
    );
  }

  const { bookId, weeks = 1 } = await request.json();

  if (!bookId) {
    return NextResponse.json({ detail: "Book ID is required." }, { status: 400 });
  }

  const users = await getUsersCollection();
  let userDoc = null;
  try {
    userDoc = await users.findOne({ _id: new ObjectId(userId) });
  } catch {
    userDoc = await users.findOne({ email: userEmail });
  }

  // Server-side security deposit gate
  if (!userDoc?.securityDepositPaid) {
    return NextResponse.json(
      { detail: "Please pay your ₹500 security deposit on your profile page before renting books." },
      { status: 403 }
    );
  }

  const books = await getBooksCollection();
  const book = await books.findOne({ id: bookId });
  if (!book || !book.available) {
    return NextResponse.json({ detail: "This book is currently unavailable for rent." }, { status: 400 });
  }

  // Block listers from renting their own books
  const isOwnBook = book.lister?.id === userId || (book.lister?.email && book.lister.email === userEmail);
  if (isOwnBook) {
    return NextResponse.json(
      { detail: "You can't rent your own listed book." },
      { status: 403 }
    );
  }

  const rentals = await getRentalsCollection();
  const rentalId = randomUUID();
  const amount = (book.rentalPricePerWeek || 50) * weeks;

  // Calculate due date: 7 days from now
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7);
  const dueDateISO = dueDate.toISOString();

  const rentalRecord = {
    id: rentalId,
    bookId,
    bookTitle: book.title,
    renterId: userId,
    renterName: userName,
    renterEmail: userEmail,
    weeks,
    amount,
    dueDateISO,
    pickupLocation: `${book.lister?.pickupPoint?.label || "Pickup Point"}, ${book.lister?.pickupPoint?.addressLine || ""}`,
    pickupTimeSlot: book.lister?.pickupPoint?.pickupTimeSlot || "Contact lister for timing",
    listerName: book.lister?.name || "Unknown",
    listerEmail: book.lister?.email || "",
    listerSource: book.lister?.source || "lister",
    status: "pending_approval",
    createdAt: new Date(),
  };

  await rentals.insertOne(rentalRecord);

  return NextResponse.json({
    id: rentalId,
    status: "pending_approval",
    bookId,
    message: "Rental request submitted! We will verify payment and send pickup details within 24 hours.",
  });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const rentals = await getRentalsCollection();
  const userRentals = await rentals
    .find({ $or: [{ renterId: userId }, { renterEmail: session.user.email }] })
    .sort({ createdAt: -1 })
    .toArray();

  return NextResponse.json(userRentals);
}
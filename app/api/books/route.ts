import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getBooksCollection, getUsersCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import type { Book, NewListingPayload } from "@/types";
import { FIXED_RENTAL_PRICE_PER_WEEK, FIXED_SECURITY_DEPOSIT } from "@/lib/constants";
import { isAdminEmail } from "@/lib/admin-utils";

/** GET /api/books/ — powers BrowsePage's fetchBooks(). Same query params
 *  api.ts already sends: q, genre, availability, pickup_city, max_price, sort. */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const genre = searchParams.get("genre");
  const availability = searchParams.get("availability");
  const pickupCity = searchParams.get("pickup_city");
  const maxPrice = searchParams.get("max_price");
  const sort = searchParams.get("sort");

  const filter: Record<string, unknown> = {};
  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: "i" } },
      { author: { $regex: q, $options: "i" } },
    ];
  }
  if (genre) filter.genre = genre;
  if (availability) filter.available = availability === "available";
  if (pickupCity) filter["lister.pickupPoint.city"] = pickupCity;
  if (maxPrice) filter.rentalPricePerWeek = { $lte: Number(maxPrice) };

  const sortSpec: Record<string, 1 | -1> =
    sort === "price-asc" ? { rentalPricePerWeek: 1 } : sort === "price-desc" ? { rentalPricePerWeek: -1 } : {};

  const collection = await getBooksCollection();
  const books = await collection
    .find(filter, { projection: { _id: 0 } })
    .sort(sortSpec)
    .toArray();

  return NextResponse.json(books);
}

/** POST /api/books/ — powers ListingForm's createListing(). */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ detail: "Login zaroori hai" }, { status: 401 });
  }

  const payload = (await request.json()) as NewListingPayload;

  let upiId = payload.upiId?.trim();
  let phoneNumber = payload.phoneNumber?.trim();

  const isOwner = isAdminEmail(session.user.email);
  if (isOwner) {
    if (!upiId) upiId = "cosmoindiaprakashan@upi";
    if (!phoneNumber) phoneNumber = "9876543210";
  } else {
    if (!upiId || !phoneNumber) {
      return NextResponse.json(
        { detail: "UPI ID and Phone Number are mandatory for listing a book." },
        { status: 400 }
      );
    }

    if (!upiId.includes("@")) {
      return NextResponse.json(
        { detail: "Please provide a valid UPI ID (e.g. username@bank)." },
        { status: 400 }
      );
    }

    const cleanPhone = phoneNumber.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { detail: "Please provide a valid 10-digit phone number." },
        { status: 400 }
      );
    }
  }

  const legacyBookPrice = Number(payload.bookPrice ?? 0);

  if (legacyBookPrice > 0) {
    const maxRental = legacyBookPrice * 0.5;
    if ((payload.rentalPricePerWeek ?? FIXED_RENTAL_PRICE_PER_WEEK) > maxRental) {
      return NextResponse.json(
        { detail: `Rental price can't exceed 50% of the book price (max ₹${maxRental.toFixed(2)}/week).` },
        { status: 400 },
      );
    }
    if ((payload.securityDeposit ?? 0) > legacyBookPrice) {
      return NextResponse.json(
        { detail: `Security deposit can't exceed the book price (max ₹${legacyBookPrice.toFixed(2)}).` },
        { status: 400 },
      );
    }
  }

  const userId = (session.user as any).id;

  const book: Book = {
    id: randomUUID(),
    title: payload.title,
    author: payload.author,
    genre: payload.genre,
    coverColor: payload.coverColor,
    description: payload.description,
    condition: payload.condition,
    bookPrice: legacyBookPrice,
    rentalPricePerWeek: FIXED_RENTAL_PRICE_PER_WEEK,
    securityDeposit: FIXED_SECURITY_DEPOSIT,
    available: true,
    lister: {
      id: userId,
      name: session.user.name ?? "You",
      source: "lister",
      upiId,
      phoneNumber,
      pickupPoint: {
        id: randomUUID(),
        label: payload.pickupLabel,
        addressLine: payload.pickupAddressLine,
        city: payload.pickupCity,
      },
    },
    bookmark: {
      id: "season-1-animals",
      setName: "Season 1: Animals",
      designName: "Sleepy fox",
      imageUrl: "",
    },
  };

  const collection = await getBooksCollection();
  await collection.insertOne(book);

  // Update user profile with payout details for future reuse & admin reports
  try {
    const usersCollection = await getUsersCollection();
    let filter: any;
    try {
      filter = { _id: new ObjectId(userId) };
    } catch {
      filter = { _id: userId };
    }
    await usersCollection.updateOne(filter, {
      $set: { upiId, phoneNumber },
    });
  } catch (e) {
    console.error("Failed to update user payout profile:", e);
  }

  return NextResponse.json(book, { status: 201 });
}
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getBooksCollection } from "@/lib/mongodb";
import type { Book, NewListingPayload } from "@/types";
import { FIXED_RENTAL_PRICE_PER_WEEK, FIXED_SECURITY_DEPOSIT } from "@/lib/constants";

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

/** POST /api/books/ — powers ListingForm's createListing(). Mirrors the
 *  same PRD §7 pricing caps that were enforced in the old FastAPI backend:
 *  rental ≤ 50% of book price, deposit ≤ 100% of book price. This check
 *  matters here specifically because it's server-side — the frontend's
 *  own check is just a convenience, not something to rely on alone.
 *
 *  Also now requires login — the listing's lister.id is taken from the
 *  session, not the client, so a book always belongs to whoever is
 *  actually signed in (this is what makes "only I can delete/see my
 *  listing" enforceable later). */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ detail: "Login zaroori hai" }, { status: 401 });
  }

  const payload = (await request.json()) as NewListingPayload;

  const legacyBookPrice = Number(payload.bookPrice ?? 0);

  // Readoodle uses a fixed price model: ₹50/week rental, ₹500 security deposit.
  // Older validations tied to the book's purchase value are no longer relevant.
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
      id: (session.user as any).id, // real logged-in user id, no more "local-owner"
      name: session.user.name ?? "You",
      source: "lister",
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

  return NextResponse.json(book, { status: 201 });
}
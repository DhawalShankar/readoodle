import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getRentalsCollection } from "@/lib/mongodb";

/**
 * GET /api/rentals/active
 * Returns whether the logged-in user currently has an active (non-returned, non-rejected) rental.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const userEmail = session.user.email?.toLowerCase();

  const rentals = await getRentalsCollection();
  const activeRental = await rentals.findOne({
    $or: [{ renterId: userId }, { renterEmail: userEmail }],
    status: { $nin: ["returned", "rejected"] },
  });

  if (activeRental) {
    return NextResponse.json({
      hasActiveRental: true,
      activeRental: {
        id: activeRental.id || activeRental._id.toString(),
        bookTitle: activeRental.bookTitle || "a book",
        status: activeRental.status,
      },
    });
  }

  return NextResponse.json({ hasActiveRental: false, activeRental: null });
}

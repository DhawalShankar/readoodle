import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getBooksCollection, getRentalsCollection, getUsersCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ detail: "Login required" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const usersCollection = await getUsersCollection();
    const booksCollection = await getBooksCollection();
    const rentalsCollection = await getRentalsCollection();

    let userDoc = null;
    try {
      userDoc = await usersCollection.findOne({ _id: new ObjectId(userId) });
    } catch {
      userDoc = await usersCollection.findOne({ _id: userId as any });
    }
    if (!userDoc) {
      userDoc = await usersCollection.findOne({ email: session.user.email?.toLowerCase() });
    }

    // Get all books listed by this specific user
    const myBooks = await booksCollection.find({ "lister.id": userId }).toArray();
    const myBookIds = myBooks.map((b) => b.id);

    // Get all approved rentals for this lister's books
    const approvedRentals = myBookIds.length > 0
      ? await rentalsCollection.find({ bookId: { $in: myBookIds }, status: "approved" }).sort({ createdAt: -1 }).toArray()
      : [];

    let grossEarnings = 0;
    let platformCommission = 0;
    let netEarnings = 0;

    const rentalsSummary = approvedRentals.map((rental) => {
      const amount = rental.amount || 50;
      const commission = Math.round(amount * 0.02 * 100) / 100;
      const net = amount - commission;
      grossEarnings += amount;
      platformCommission += commission;
      netEarnings += net;

      return {
        id: rental.id,
        bookTitle: rental.bookTitle,
        amount,
        commission,
        netAmount: net,
        createdAt: rental.createdAt ? new Date(rental.createdAt).toISOString() : new Date().toISOString(),
      };
    });

    return NextResponse.json({
      totalListings: myBooks.length,
      totalRentals: approvedRentals.length,
      grossEarnings,
      platformCommission,
      netEarnings,
      payoutReleased: Boolean(userDoc?.payoutReleased),
      lastPayoutDate: userDoc?.lastPayoutDate ? new Date(userDoc.lastPayoutDate).toISOString() : null,
      upiId: userDoc?.upiId || "",
      phoneNumber: userDoc?.phoneNumber || "",
      rentals: rentalsSummary,
    });
  } catch (error: any) {
    return NextResponse.json({ detail: error.message || "Failed to fetch lister stats" }, { status: 500 });
  }
}

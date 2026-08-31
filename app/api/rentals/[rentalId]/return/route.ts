import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getBooksCollection, getRentalsCollection } from "@/lib/mongodb";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ rentalId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
    }

    const { rentalId } = await params;
    const userId = (session.user as any).id;
    const userEmail = session.user.email?.toLowerCase();

    const rentalsCollection = await getRentalsCollection();
    const booksCollection = await getBooksCollection();

    const rental = await rentalsCollection.findOne({
      id: rentalId,
      $or: [{ renterId: userId }, { renterEmail: userEmail }],
    });

    if (!rental) {
      return NextResponse.json({ detail: "Rental not found or access denied." }, { status: 404 });
    }

    const returnedOnISO = new Date().toISOString();
    await rentalsCollection.updateOne(
      { id: rentalId },
      { $set: { status: "returned", returnedOnISO } }
    );

    if (rental.bookId) {
      await booksCollection.updateOne({ id: rental.bookId }, { $set: { available: true } });
    }

    const updatedRental = await rentalsCollection.findOne({ id: rentalId });
    return NextResponse.json({
      ...updatedRental,
      status: "returned",
      returnedOnISO,
    });
  } catch (error: any) {
    return NextResponse.json({ detail: error.message || "Failed to mark rental as returned" }, { status: 500 });
  }
}

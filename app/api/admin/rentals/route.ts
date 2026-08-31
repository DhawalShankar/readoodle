import { NextResponse } from "next/server";
import { getRentalsCollection } from "@/lib/mongodb";
import { requireAdminSession } from "@/lib/admin";

export async function GET() {
  try {
    const { errorResponse } = await requireAdminSession();
    if (errorResponse) return errorResponse;
    const rentalsCollection = await getRentalsCollection();
    const rentals = await rentalsCollection.find({}).sort({ createdAt: -1 }).toArray();

    const formattedRentals = rentals.map((r) => ({
      id: r.id || r._id.toString(),
      bookId: r.bookId,
      bookTitle: r.bookTitle || "Book",
      renterId: r.renterId,
      renterName: r.renterName || "Reader",
      renterEmail: r.renterEmail || "",
      weeks: r.weeks || 1,
      amount: r.amount || 50,
      pickupLocation: r.pickupLocation || "Pickup Point",
      pickupTimeSlot: r.pickupTimeSlot || "Contact lister for timing",
      listerName: r.listerName || "Unknown",
      listerEmail: r.listerEmail || "",
      listerSource: r.listerSource || "lister",
      status: r.status || "pending_approval",
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
    }));

    return NextResponse.json(formattedRentals);
  } catch (error: any) {
    return NextResponse.json({ detail: error.message || "Failed to fetch rental requests" }, { status: 500 });
  }
}
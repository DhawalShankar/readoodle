import { NextResponse } from "next/server";
import { getRentalsCollection, getBooksCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { requireAdminSession } from "@/lib/admin";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ rentalId: string }> }
) {
  try {
    const { errorResponse } = await requireAdminSession();
    if (errorResponse) return errorResponse;
    const { rentalId } = await params;
    const body = await request.json();
    const { status } = body;

    if (!["pending_approval", "approved", "rejected"].includes(status)) {
      return NextResponse.json({ detail: "Invalid status value" }, { status: 400 });
    }

    const rentalsCollection = await getRentalsCollection();
    let filter;
    try {
      filter = { $or: [{ id: rentalId }, { _id: new ObjectId(rentalId) }] };
    } catch {
      filter = { id: rentalId };
    }

    const existingRental = await rentalsCollection.findOne(filter);
    if (!existingRental) {
      return NextResponse.json({ detail: "Rental request not found" }, { status: 404 });
    }

    await rentalsCollection.updateOne(filter, {
      $set: {
        status,
        updatedAt: new Date(),
      },
    });

    // If approved, mark the book as rented (unavailable); if rejected, make it available again
    if (existingRental.bookId) {
      const booksCollection = await getBooksCollection();
      if (status === "approved") {
        await booksCollection.updateOne(
          { id: existingRental.bookId },
          { $set: { available: false } }
        );
      } else if (status === "rejected") {
        await booksCollection.updateOne(
          { id: existingRental.bookId },
          { $set: { available: true } }
        );
      }
    }

    const updated = await rentalsCollection.findOne(filter);

    return NextResponse.json({
      id: updated?.id || rentalId,
      bookId: updated?.bookId,
      bookTitle: updated?.bookTitle,
      renterId: updated?.renterId,
      renterName: updated?.renterName,
      renterEmail: updated?.renterEmail,
      weeks: updated?.weeks,
      amount: updated?.amount,
      pickupLocation: updated?.pickupLocation,
      pickupTimeSlot: updated?.pickupTimeSlot || "Contact lister for timing",
      listerName: updated?.listerName || "Unknown",
      listerEmail: updated?.listerEmail || "",
      listerSource: updated?.listerSource || "lister",
      status: updated?.status,
      createdAt: updated?.createdAt ? new Date(updated.createdAt).toISOString() : new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ detail: error.message || "Failed to update rental status" }, { status: 500 });
  }
}
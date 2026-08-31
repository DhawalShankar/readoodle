import { NextResponse } from "next/server";
import { getBooksCollection, getRentalsCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { requireAdminSession } from "@/lib/admin";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const { errorResponse } = await requireAdminSession();
    if (errorResponse) return errorResponse;
    const { bookId } = await params;
    const body = await request.json();
    const { available } = body;

    if (typeof available !== "boolean") {
      return NextResponse.json({ detail: "available must be a boolean" }, { status: 400 });
    }

    const booksCollection = await getBooksCollection();
    let filter;
    try {
      filter = { $or: [{ id: bookId }, { _id: new ObjectId(bookId) }] };
    } catch {
      filter = { id: bookId };
    }

    await booksCollection.updateOne(filter, {
      $set: { available },
    });

    if (available === true) {
      try {
        const rentalsCollection = await getRentalsCollection();
        await rentalsCollection.updateMany(
          {
            bookId,
            status: { $in: ["approved", "active", "pending_approval"] },
          },
          {
            $set: {
              status: "returned",
              returnedOnISO: new Date().toISOString(),
            },
          }
        );
      } catch (e) {
        console.error("Failed to update rentals status on admin book mark available:", e);
      }
    }

    const updatedBook = await booksCollection.findOne(filter);

    return NextResponse.json(updatedBook);
  } catch (error: any) {
    return NextResponse.json({ detail: error.message || "Failed to update book availability" }, { status: 500 });
  }
}

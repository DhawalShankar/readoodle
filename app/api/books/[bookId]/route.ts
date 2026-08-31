import { NextResponse } from "next/server";
import { getBooksCollection, getRentalsCollection } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ bookId: string }> }
) {
  const { bookId } = await params;

  const collection = await getBooksCollection();

  const book = await collection.findOne(
    { id: bookId },
    { projection: { _id: 0 } }
  );

  if (!book) {
    return NextResponse.json(
      { detail: "Book not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(book);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ bookId: string }> }) {
  const { bookId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ detail: "Login zaroori hai" }, { status: 401 });
  }

  const collection = await getBooksCollection();
  const result = await collection.deleteOne({
    id: bookId,
    "lister.id": (session.user as any).id, // This line ensures only the lister can delete their own listing
  });

  if (result.deletedCount === 0) {
    return NextResponse.json({ detail: "This is not your listing or it doesn't exist" }, { status: 403 });
  }
  return NextResponse.json({ deleted: true });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ bookId: string }> }) {
  const { bookId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ detail: "Login zaroori hai" }, { status: 401 });
  }

  const body = await request.json();
  const userId = (session.user as any).id;
  const collection = await getBooksCollection();

  const updateFields: Record<string, any> = {};
  if (typeof body.available === "boolean") updateFields.available = body.available;
  if (typeof body.availability === "string") updateFields.available = body.availability === "available";
  if (body.title) updateFields.title = body.title;
  if (body.author) updateFields.author = body.author;
  if (body.description) updateFields.description = body.description;
  if (body.genre) updateFields.genre = body.genre;
  if (body.condition) updateFields.condition = body.condition;
  if (body.upiId) updateFields["lister.upiId"] = body.upiId;
  if (body.phoneNumber) updateFields["lister.phoneNumber"] = body.phoneNumber;

  const result = await collection.findOneAndUpdate(
    { id: bookId, "lister.id": userId },
    { $set: updateFields },
    { returnDocument: "after", projection: { _id: 0 } }
  );

  if (!result) {
    return NextResponse.json({ detail: "This is not your listing or it doesn't exist" }, { status: 403 });
  }

  // If marked as available, update any active rental for this book to returned
  if (updateFields.available === true) {
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
      console.error("Failed to update rentals status on book mark available:", e);
    }
  }

  return NextResponse.json(result);
}
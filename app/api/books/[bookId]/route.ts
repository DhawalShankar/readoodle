import { NextResponse } from "next/server";
import { getBooksCollection } from "@/lib/mongodb";
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
    "lister.id": (session.user as any).id, // yehi line "koi aur delete na kar paye" ko enforce karti hai
  });

  if (result.deletedCount === 0) {
    return NextResponse.json({ detail: "Ye tumhari listing nahi hai ya exist nahi karti" }, { status: 403 });
  }
  return NextResponse.json({ deleted: true });
}
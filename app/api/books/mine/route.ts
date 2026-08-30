import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getBooksCollection } from "@/lib/mongodb";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ detail: "Login zaroori hai" }, { status: 401 });
  }
  const collection = await getBooksCollection();
  const books = await collection
    .find({ "lister.id": (session.user as any).id }, { projection: { _id: 0 } })
    .toArray();
  return NextResponse.json(books);
}
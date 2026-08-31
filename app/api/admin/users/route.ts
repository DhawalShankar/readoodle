import { NextResponse } from "next/server";
import { getUsersCollection } from "@/lib/mongodb";
import { requireAdminSession } from "@/lib/admin";

export async function GET() {
  try {
    const { errorResponse } = await requireAdminSession();
    if (errorResponse) return errorResponse;
    const usersCollection = await getUsersCollection();
    const users = await usersCollection.find({}).sort({ createdAt: -1 }).toArray();

    const formattedUsers = users.map((u) => ({
      id: u._id.toString(),
      name: u.name || "Unnamed User",
      email: u.email || "",
      securityDepositPaid: Boolean(u.securityDepositPaid),
      createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : undefined,
    }));

    return NextResponse.json(formattedUsers);
  } catch (error: any) {
    return NextResponse.json({ detail: error.message || "Failed to fetch users" }, { status: 500 });
  }
}

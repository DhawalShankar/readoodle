import { NextResponse } from "next/server";
import { getUsersCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { requireAdminSession } from "@/lib/admin";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { errorResponse } = await requireAdminSession();
    if (errorResponse) return errorResponse;
    const { userId } = await params;
    const body = await request.json();
    const { securityDepositPaid } = body;

    if (typeof securityDepositPaid !== "boolean") {
      return NextResponse.json({ detail: "securityDepositPaid must be a boolean" }, { status: 400 });
    }

    const usersCollection = await getUsersCollection();
    let filter: any;
    try {
      filter = { _id: new ObjectId(userId) };
    } catch {
      filter = { _id: userId };
    }

    await usersCollection.updateOne(filter, {
      $set: {
        securityDepositPaid,
        securityDepositPaidAt: securityDepositPaid ? new Date() : null,
      },
    });

    const updatedUser = await usersCollection.findOne(filter);

    return NextResponse.json({
      id: updatedUser?._id.toString() || userId,
      name: updatedUser?.name || "",
      email: updatedUser?.email || "",
      securityDepositPaid: Boolean(updatedUser?.securityDepositPaid),
    });
  } catch (error: any) {
    return NextResponse.json({ detail: error.message || "Failed to update user" }, { status: 500 });
  }
}

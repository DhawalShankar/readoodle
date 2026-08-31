import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // adjust to wherever your authOptions actually live
import { getUsersCollection } from "@/lib/mongodb";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }

  const users = await getUsersCollection();
  const user = await users.findOne({ email: session.user.email.toLowerCase() });

  return NextResponse.json({
    securityDepositPaid: Boolean(user?.securityDepositPaid),
    user: user ? { name: user.name, email: user.email } : undefined,
  });
}
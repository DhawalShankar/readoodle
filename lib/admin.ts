import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { isAdminEmail, ADMIN_EMAIL } from "@/lib/admin-utils";

// Re-export for backward compatibility
export { isAdminEmail, ADMIN_EMAIL };

export async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdminEmail(session.user.email)) {
    return {
      session: null,
      errorResponse: NextResponse.json(
        { detail: "Forbidden: Admin access required" },
        { status: 403 }
      ),
    };
  }
  return { session, errorResponse: null };
}

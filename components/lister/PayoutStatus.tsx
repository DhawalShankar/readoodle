"use client";

import { useSession } from "next-auth/react";
import { FONT_DISPLAY, FONT_MONO, INK, SAGE } from "@/lib/theme";
import { isAdminEmail } from "@/lib/admin-utils";
import DashedCard from "@/components/ui/DashedCard";

export default function PayoutStatus() {
  const { data: session } = useSession();
  const isOwner = isAdminEmail(session?.user?.email);

  if (isOwner) {
    return (
      <DashedCard className="space-y-4 bg-[#F5F9F6]">
        <div className="flex items-center justify-between">
          <h3 style={{ fontFamily: FONT_DISPLAY, color: SAGE }} className="text-xl font-bold">
            Readoodle Official Inventory
          </h3>
          <span style={{ fontFamily: FONT_MONO }} className="text-xs font-semibold uppercase text-[#20304D]/60">
            Owner Account
          </span>
        </div>

        <div className="space-y-2 text-xs text-[#20304D]/80">
          <p>
            • <strong>Fixed Rental Rate:</strong> ₹50 per 7 days.
          </p>
          <p>
            • <strong>Revenue Policy:</strong> 100% of rental revenue directly belongs to Readoodle.
          </p>
          <p>
            • <strong>Payout Transfers:</strong> N/A (Payout holds and T+2 transfers apply only to third-party listers).
          </p>
        </div>
      </DashedCard>
    );
  }

  return (
    <DashedCard className="space-y-4 bg-[#F5F9F6]">
      <div className="flex items-center justify-between">
        <h3 style={{ fontFamily: FONT_DISPLAY, color: SAGE }} className="text-xl font-bold">
          Payout Terms & Details
        </h3>
        <span style={{ fontFamily: FONT_MONO }} className="text-xs font-semibold uppercase text-[#20304D]/60">
          T+2 Days
        </span>
      </div>

      <div className="space-y-2 text-xs text-[#20304D]/80">
        <p>
          • <strong>Fixed Rental Rate:</strong> ₹50 per 7 days.
        </p>
        <p>
          • <strong>Readoodle Commission:</strong> Flat 2% (₹1). You receive <strong>₹49 per rental</strong>.
        </p>
        <p>
          • <strong>Payout Transfer:</strong> Directly sent to your registered UPI ID & Phone Number within 48 hours of rental confirmation.
        </p>
      </div>
    </DashedCard>
  );
}

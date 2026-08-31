"use client";

import type { Rental } from "@/types";
import { CORAL, FONT_MONO, INK, SAGE } from "@/lib/theme";
import { calculateLateFine, daysUntil, formatDueDate, formatRupees } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

interface EnhancedRentalProps {
  rental: Rental & {
    lateFine?: number;
    totalPayableOnReturn?: number;
    pickupLocation?: string;
  };
  onReturn?: (rentalId: string) => void;
  onExtend?: (rentalId: string) => void;
}

export default function RentalCard({ rental, onReturn, onExtend }: EnhancedRentalProps) {
  const remaining = daysUntil(rental.dueDateISO);
  const isReturned = rental.status === "returned";
  const isPending = (rental.status as any) === "pending_approval";
  const overdue = !isReturned && remaining < 0;
  const overdueDays = overdue ? Math.abs(remaining) : 0;
  const lateFine = overdue ? calculateLateFine(rental.dueDateISO) : (rental.lateFine || 0);

  const rentalFee = rental.rentalFeeTotal || 50;
  const totalPayableOnReturn = rental.totalPayableOnReturn || (rentalFee + lateFine);

  return (
    <div className="flex flex-col gap-4 border border-[#20304D]/15 bg-[#FBF7EC] p-5 rounded-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="h-16 w-12 shrink-0 rounded-sm shadow-sm flex items-center justify-center text-white text-xs font-bold p-1 text-center" style={{ backgroundColor: rental.book.coverColor || "#5B7B9A" }}>
            {rental.book.title?.slice(0, 10)}...
          </div>
          <div>
            <p className="text-base font-semibold" style={{ color: INK }}>
              {rental.book.title}
            </p>
            <p className="text-xs text-[#20304D]/60">by {rental.book.author}</p>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge color={isReturned ? SAGE : overdue ? CORAL : isPending ? INK : SAGE}>
                {isReturned ? "✓ Returned" : overdue ? `⚠️ Overdue (${overdueDays}d late)` : isPending ? "⌛ Pending Approval" : "✓ Active"}
              </Badge>

              <span style={{ fontFamily: FONT_MONO }} className="text-xs font-semibold text-[#20304D]/80">
                📅 Due: {formatDueDate(rental.dueDateISO)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-2 sm:items-end">
          {!isReturned && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onExtend?.(rental.id)}>
                Extend (+1 Wk)
              </Button>
              <Button variant="filled" onClick={() => onReturn?.(rental.id)}>
                Mark returned
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Due Date & Charges Summary Box */}
      <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#F4F1EA] p-3 rounded text-xs">
        <div>
          <p className="text-[#20304D]/60 uppercase tracking-wider font-semibold" style={{ fontFamily: FONT_MONO }}>
            Rental Fee
          </p>
          <p className="font-bold text-sm mt-0.5" style={{ color: INK }}>
            {formatRupees(rentalFee)} ({rental.weeks || 1} week{rental.weeks === 1 ? "" : "s"})
          </p>
        </div>

        <div>
          <p className="text-[#20304D]/60 uppercase tracking-wider font-semibold" style={{ fontFamily: FONT_MONO }}>
            Late Fee (₹10/day)
          </p>
          <p className="font-bold text-sm mt-0.5" style={{ color: overdue ? CORAL : SAGE }}>
            {overdue ? `${formatRupees(lateFine)} (${overdueDays} day${overdueDays === 1 ? "" : "s"} late)` : "₹0.00 (On Time)"}
          </p>
        </div>

        <div>
          <p className="text-[#20304D]/60 uppercase tracking-wider font-semibold" style={{ fontFamily: FONT_MONO }}>
            Total Payable On Return
          </p>
          <p className="font-bold text-sm mt-0.5" style={{ color: overdue ? CORAL : INK }}>
            {formatRupees(totalPayableOnReturn)}
          </p>
        </div>
      </div>
    </div>
  );
}

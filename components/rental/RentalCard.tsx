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
}

export default function RentalCard({ rental }: EnhancedRentalProps) {
  const remaining = daysUntil(rental.dueDateISO);
  const isReturned = rental.status === "returned";
  const isPending = (rental.status as any) === "pending_approval";
  const overdue = !isReturned && remaining < 0;
  const overdueDays = overdue ? Math.abs(remaining) : 0;
  const lateFine = overdue ? calculateLateFine(rental.dueDateISO) : (rental.lateFine || 0);

  const rentalFee = rental.rentalFeeTotal || 50;
  const totalPayableOnReturn = rental.totalPayableOnReturn || (rentalFee + lateFine);
  const dropOffPoint = rental.pickupLocation || rental.book.lister?.pickupPoint?.label || "Readoodle Pickup Point";

  return (
    <div className="flex flex-col gap-4 border border-[#20304D]/15 bg-[#FBF7EC] p-5 rounded-sm shadow-sm">
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

              {isReturned ? (
                <span style={{ fontFamily: FONT_MONO }} className="text-xs text-[#20304D]/70 font-medium">
                  ✓ Returned on {rental.returnedOnISO ? formatDueDate(rental.returnedOnISO) : "Drop-off Point"}
                </span>
              ) : (
                <span style={{ fontFamily: FONT_MONO }} className="text-xs font-semibold text-[#20304D]/80">
                  📅 Due Date: {formatDueDate(rental.dueDateISO)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Overdue Late Fee Notice Banner */}
      {overdue && (
        <div className="p-3 bg-[#FFF5F2] border-l-4 rounded text-xs font-medium" style={{ borderColor: CORAL, color: INK }}>
          ⚠️ <strong>You are {overdueDays} day{overdueDays === 1 ? "" : "s"} late.</strong> You have to pay <strong>{formatRupees(lateFine)} late fee</strong> on return (accumulated at ₹10/day). Total payable on drop-off is <strong>{formatRupees(totalPayableOnReturn)}</strong>.
        </div>
      )}

      {/* Return Drop-Off Location */}
      <div className="text-xs text-[#20304D]/80 bg-[#F4F1EA] px-3 py-2 rounded flex items-center justify-between">
        <p>
          <strong>📍 Drop-off / Return Point:</strong> {dropOffPoint}
        </p>
        <span style={{ fontFamily: FONT_MONO }} className="text-[#20304D]/60 hidden sm:inline">
          7-Day Rental Period
        </span>
      </div>

      {/* Charges & Due Summary Box */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#F4F1EA] p-3 rounded text-xs">
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
            {isReturned ? "Total Paid" : "Total Due On Return"}
          </p>
          <p className="font-bold text-sm mt-0.5" style={{ color: overdue ? CORAL : INK }}>
            {formatRupees(totalPayableOnReturn)}
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import type { Rental } from "@/types";
import { CORAL, FONT_MONO, INK, SAGE } from "@/lib/theme";
import { calculateLateFine, daysUntil, formatDueDate, formatRupees } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

export default function RentalCard({
  rental,
  onReturn,
  onExtend,
}: {
  rental: Rental;
  onReturn?: (rentalId: string) => void;
  onExtend?: (rentalId: string) => void;
}) {
  const remaining = daysUntil(rental.dueDateISO);
  const overdue = rental.status !== "returned" && remaining < 0;
  const lateFine = overdue ? calculateLateFine(rental.dueDateISO) : 0;

  return (
    <div className="flex flex-col gap-4 border border-[#20304D]/15 bg-[#FBF7EC] p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div className="h-16 w-12 shrink-0 rounded-sm" style={{ backgroundColor: rental.book.coverColor }} />
        <div>
          <p className="text-sm font-semibold" style={{ color: INK }}>
            {rental.book.title}
          </p>
          <p className="text-xs text-[#20304D]/60">{rental.book.author}</p>
          <div className="mt-1 flex items-center gap-2">
            <Badge color={rental.status === "returned" ? SAGE : overdue ? CORAL : INK}>
              {rental.status === "returned" ? "Returned" : overdue ? "Overdue" : "Active"}
            </Badge>
            <span style={{ fontFamily: FONT_MONO }} className="text-xs text-[#20304D]/60">
              Due {formatDueDate(rental.dueDateISO)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-start gap-2 sm:items-end">
        {overdue && (
          <p style={{ fontFamily: FONT_MONO, color: CORAL }} className="text-sm font-medium">
            Late fine so far: {formatRupees(lateFine)}
          </p>
        )}
        {rental.status !== "returned" && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onExtend?.(rental.id)}>
              Extend
            </Button>
            <Button variant="filled" onClick={() => onReturn?.(rental.id)}>
              Mark returned
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

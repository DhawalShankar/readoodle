"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createRental } from "@/lib/api";
import { formatRupees } from "@/lib/utils";
import { CORAL, SAGE, FONT_MONO } from "@/lib/theme";
import Button from "@/components/ui/Button";
import DashedCard from "@/components/ui/DashedCard";
import type { Book } from "@/types";

const WEEK_OPTIONS = [1, 2, 3, 4];

export default function RentForm({ book }: { book: Book }) {
  const router = useRouter();
  const [weeks, setWeeks] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rentalTotal = book.rentalPricePerWeek * weeks;
  const total = rentalTotal + book.securityDeposit;

  async function handleCheckout() {
    setSubmitting(true);
    setError(null);
    try {
      const rental = await createRental({ bookId: book.id, weeks });
      router.push(`/rentals/${rental.id}/confirmed`);
    } catch {
      setError("Couldn't complete the rental — please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-8">
      <p style={{ fontFamily: FONT_MONO }} className="text-xs uppercase tracking-widest text-[#20304D]/55">
        Rental duration
      </p>
      <div className="mt-2 flex gap-2">
        {WEEK_OPTIONS.map((w) => (
          <button
            key={w}
            onClick={() => setWeeks(w)}
            className={`rounded-sm border px-4 py-2 text-sm font-medium transition ${
              weeks === w ? "text-white" : "text-[#20304D] border-[#20304D]/20"
            }`}
            style={weeks === w ? { backgroundColor: CORAL, borderColor: CORAL } : {}}
          >
            {w} {w === 1 ? "week" : "weeks"}
          </button>
        ))}
      </div>

      <DashedCard className="mt-6">
        <div className="flex justify-between text-sm text-[#20304D]/70">
          <span>Rental ({weeks} {weeks === 1 ? "week" : "weeks"} × {formatRupees(book.rentalPricePerWeek)})</span>
          <span>{formatRupees(rentalTotal)}</span>
        </div>
        <div className="mt-1 flex justify-between text-sm text-[#20304D]/70">
          <span>Security deposit (refundable)</span>
          <span>{formatRupees(book.securityDeposit)}</span>
        </div>
        <div className="mt-3 flex justify-between border-t border-dashed border-[#20304D]/20 pt-3 text-base font-semibold">
          <span>Total due at checkout</span>
          <span>{formatRupees(total)}</span>
        </div>
      </DashedCard>

      <div className="mt-3 flex items-center gap-2 text-xs text-[#20304D]/55">
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{ backgroundColor: SAGE }}
        />
        Pickup at {book.lister.pickupPoint.label}, {book.lister.pickupPoint.addressLine}
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-8">
        <Button onClick={handleCheckout} variant="filled" disabled={submitting}>
          {submitting ? "Processing..." : `Confirm rental — ${formatRupees(total)}`}
        </Button>
      </div>
    </div>
  );
}
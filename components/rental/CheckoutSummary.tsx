import type { Book } from "@/types";
import { FONT_MONO, INK } from "@/lib/theme";
import { formatRupees } from "@/lib/utils";
import DashedCard from "@/components/ui/DashedCard";

export default function CheckoutSummary({ book, weeks }: { book: Book; weeks: number }) {
  const rentalFee = book.rentalPricePerWeek * weeks;
  const total = rentalFee + book.securityDeposit;

  return (
    <DashedCard>
      <p style={{ fontFamily: FONT_MONO, color: INK }} className="text-xs uppercase tracking-[0.2em] text-[#20304D]/60">
        Checkout summary
      </p>

      <div className="mt-4 space-y-3 text-sm" style={{ fontFamily: FONT_MONO }}>
        <Row label={`Rental (${weeks} wk${weeks > 1 ? "s" : ""} × ${formatRupees(book.rentalPricePerWeek)})`} value={formatRupees(rentalFee)} />
        <Row label="Security deposit" value={formatRupees(book.securityDeposit)} note="Refunded on-time return" />
        <div className="border-t border-dashed border-[#20304D]/30 pt-3">
          <Row label="Due today" value={formatRupees(total)} bold />
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-[#20304D]/60">
        Pickup at {book.lister.pickupPoint.label}. Return there by the due date to avoid the ₹10/day late fine.
      </p>
    </DashedCard>
  );
}

function Row({ label, value, note, bold }: { label: string; value: string; note?: string; bold?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-[#20304D]/75">
        {label}
        {note && <span className="ml-2 text-[11px] text-[#20304D]/45">({note})</span>}
      </span>
      <span className={bold ? "font-semibold" : ""}>{value}</span>
    </div>
  );
}

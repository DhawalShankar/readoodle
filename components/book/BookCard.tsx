import Link from "next/link";
import type { Book } from "@/types";
import { CORAL, FONT_DISPLAY, FONT_MONO, INK, SAGE, tiltFor } from "@/lib/theme";
import { formatRupees } from "@/lib/utils";
import Badge from "@/components/ui/Badge";

export default function BookCard({ book, index = 0 }: { book: Book; index?: number }) {
  const isReadoodle = book.lister.source === "readoodle";

  return (
    <Link
      href={`/browse/${book.id}`}
      className="group block border border-[#20304D]/15 bg-[#FBF7EC] p-4 transition-transform hover:-translate-y-1"
    >
      <div
        className="relative flex h-48 items-end rounded-sm p-4 shadow-md transition-transform group-hover:rotate-0"
        style={{ backgroundColor: book.coverColor, transform: `rotate(${tiltFor(index)}deg)` }}
      >
        <p style={{ fontFamily: FONT_DISPLAY }} className="text-xl font-semibold leading-tight text-[#F5EFE0]">
          {book.title}
        </p>
        {!book.available && (
          <span
            className="absolute right-2 top-2 rounded-sm bg-[#20304D] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-[#F5EFE0]"
            style={{ fontFamily: FONT_MONO }}
          >
            Rented out
          </span>
        )}
      </div>

      <div className="mt-4">
        <p className="text-sm font-semibold" style={{ color: INK }}>
          {book.title}
        </p>
        <p className="text-xs text-[#20304D]/60">{book.author}</p>

        <div className="mt-3 flex items-center justify-between">
          <span style={{ fontFamily: FONT_MONO }} className="text-sm font-medium">
            {formatRupees(book.rentalPricePerWeek)} / wk
          </span>
          <Badge color={isReadoodle ? CORAL : SAGE}>{isReadoodle ? "Readoodle" : "Neighbour"}</Badge>
        </div>

        <p className="mt-2 text-[11px] text-[#20304D]/55">{book.lister.pickupPoint.label}</p>
      </div>
    </Link>
  );
}

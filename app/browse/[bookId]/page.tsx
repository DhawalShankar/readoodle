import { notFound } from "next/navigation";
import { getBooksCollection } from "@/lib/mongodb";
import type { Book } from "@/types";
import { CORAL, FONT_DISPLAY, FONT_MONO, INK, PAPER, SAGE } from "@/lib/theme";
import { formatRupees } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import DashedCard from "@/components/ui/DashedCard";

// Next.js 15: `params` is a Promise on Server Components — must be awaited.
export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;

  let book: Book | null = null;
  try {
    const collection = await getBooksCollection();
    book = (await collection.findOne({ id: bookId }, { projection: { _id: 0 } })) as Book | null;
  } catch (err) {
    console.error("Error fetching book details from MongoDB:", err);
  }

  if (!book) notFound();

  const isReadoodle = book.lister.source === "readoodle";

  return (
    <div style={{ backgroundColor: PAPER }} className="min-h-screen">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-12 md:grid-cols-[320px_1fr]">
        {/* cover */}
        <div>
          <div
            className="flex h-96 items-end rounded-sm p-6 shadow-xl"
            style={{ backgroundColor: book.coverColor }}
          >
            <p style={{ fontFamily: FONT_DISPLAY }} className="text-3xl font-semibold leading-tight text-[#F5EFE0]">
              {book.title}
            </p>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <Badge color={isReadoodle ? CORAL : SAGE}>{isReadoodle ? "Readoodle inventory" : `Listed by ${book.lister.name}`}</Badge>
            <Badge color={book.available ? SAGE : INK}>{book.available ? "Available now" : "Currently rented out"}</Badge>
          </div>
        </div>

        {/* details */}
        <div>
          <h1 style={{ fontFamily: FONT_DISPLAY }} className="text-5xl font-bold">
            {book.title}
          </h1>
          <p className="mt-1 text-lg text-[#20304D]/70">by {book.author}</p>

          <p className="mt-6 max-w-xl leading-relaxed text-[#20304D]/85">{book.description}</p>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <DashedCard>
              <p style={{ fontFamily: FONT_MONO }} className="text-xs uppercase tracking-widest text-[#20304D]/55">
                Rental price
              </p>
              <p className="mt-1 text-2xl font-semibold">{formatRupees(book.rentalPricePerWeek)} / week</p>
              <p className="mt-1 text-xs text-[#20304D]/55">
                Plus a {formatRupees(book.securityDeposit)} refundable security deposit
              </p>
            </DashedCard>

            <DashedCard>
              <p style={{ fontFamily: FONT_MONO }} className="text-xs uppercase tracking-widest text-[#20304D]/55">
                Pickup point
              </p>
              <p className="mt-1 font-medium">{book.lister.pickupPoint.label}</p>
              <p className="mt-1 text-xs text-[#20304D]/55">{book.lister.pickupPoint.addressLine}</p>
            </DashedCard>
          </div>

          <div className="mt-6 flex items-start gap-3 border-l-2 pl-4" style={{ borderColor: isReadoodle ? CORAL : SAGE }}>
            <div>
              <p className="text-sm font-semibold">
                {isReadoodle ? "Comes with a physical doodle bookmark" : "Comes with a digital doodle bookmark"}
              </p>
              <p className="mt-1 text-sm text-[#20304D]/70">
                {isReadoodle
                  ? `Handed to you at pickup — this one's from the "${book.bookmark.setName}" set.`
                  : "You'll get a print-ready PDF by email once your rental's confirmed."}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <Button href={`/rent/${book.id}`} variant="filled" className={!book.available ? "pointer-events-none opacity-40" : ""}>
              {book.available ? "Rent now" : "Currently unavailable"}
            </Button>
          </div>

          {!isReadoodle && (
            <p className="mt-4 max-w-xl text-xs leading-relaxed text-[#20304D]/50">
              This book is listed by a fellow reader, not Readoodle itself. Condition and any dispute about this
              rental are between you and {book.lister.name} — Readoodle handles discovery, payment, and payouts.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
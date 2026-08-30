import { fetchBook } from "@/lib/api";
import { PAPER, FONT_DISPLAY } from "@/lib/theme";
import RentForm from "@/components/rent/RentForm";

export default async function RentPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;
  const book = await fetchBook(bookId).catch(() => null);

  if (!book) {
    return (
      <div style={{ backgroundColor: PAPER }} className="flex min-h-screen items-center justify-center">
        <p className="text-[#20304D]/70">Couldn&apos;t load this book — go back and try again.</p>
      </div>
    );
  }

  if (!book.available) {
    return (
      <div style={{ backgroundColor: PAPER }} className="flex min-h-screen items-center justify-center">
        <p className="text-[#20304D]/70">This book is currently rented out — check back later.</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: PAPER }} className="min-h-screen">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 style={{ fontFamily: FONT_DISPLAY }} className="text-4xl font-bold">
          Rent &ldquo;{book.title}&rdquo;
        </h1>
        <p className="mt-1 text-[#20304D]/70">by {book.author}</p>

        <RentForm book={book} />
      </div>
    </div>
  );
}
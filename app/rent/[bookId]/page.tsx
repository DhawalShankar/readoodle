"use client";

import { use, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import type { Book } from "@/types";
import { FONT_DISPLAY, FONT_MONO, INK, PAPER } from "@/lib/theme";
import { fetchBook } from "@/lib/api";
import RentForm from "@/components/rent/RentForm";
import Button from "@/components/ui/Button";

export default function RentPage({ params }: { params: Promise<{ bookId: string }> | { bookId: string } }) {
  // Handle both Promise params (Next.js 15+) and plain object params
  const resolvedParams = typeof (params as any).then === "function" ? use(params as Promise<{ bookId: string }>) : (params as { bookId: string });
  const bookId = resolvedParams.bookId;

  const { data: session } = useSession();
  const [book, setBook] = useState<Book | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookId) return;
    fetchBook(bookId)
      .then(setBook)
      .catch(() => setError("Couldn't load this book details — please try again."));
  }, [bookId]);

  if (error) {
    return (
      <div style={{ backgroundColor: PAPER }} className="flex min-h-screen items-center justify-center px-6 text-center">
        <p className="text-[#20304D]/70">{error}</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div style={{ backgroundColor: PAPER }} className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-[#20304D]/50" style={{ fontFamily: FONT_MONO }}>
          Loading book details...
        </p>
      </div>
    );
  }

  const userId = (session?.user as any)?.id;
  const isOwnListing =
    book.lister?.id === userId || (book.lister?.email && book.lister.email === session?.user?.email);

  if (isOwnListing) {
    return (
      <div style={{ backgroundColor: PAPER }} className="min-h-screen">
        <div className="mx-auto max-w-3xl px-6 py-12 text-center">
          <h1 style={{ fontFamily: FONT_DISPLAY }} className="text-4xl font-bold">
            That's your own book
          </h1>
          <p className="mt-3 text-[#20304D]/70">
            You listed "{book.title}" yourself, so you can't rent it. Manage this listing from your Lister Dashboard instead.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button href="/browse" variant="outline">
              Browse Other Books
            </Button>
            <Button href="/lister" variant="filled">
              Go to Lister Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: PAPER }} className="min-h-screen">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 style={{ fontFamily: FONT_DISPLAY }} className="text-5xl font-bold">
          Rent "{book.title}"
        </h1>
        <p className="mt-2 text-[#20304D]/70">
          by {book.author} — Pickup from {book.lister?.pickupPoint?.label || "Pickup Point"}
        </p>

        <RentForm book={book} />
      </div>
    </div>
  );
}
"use client";

import { use, useEffect, useState } from "react";
import type { Book } from "@/types";
import { FONT_DISPLAY, FONT_MONO, PAPER } from "@/lib/theme";
import { fetchBook } from "@/lib/api";
import RentForm from "@/components/rent/RentForm";

export default function RentPage({ params }: { params: Promise<{ bookId: string }> | { bookId: string } }) {
  // Handle both Promise params (Next.js 15+) and plain object params
  const resolvedParams = typeof (params as any).then === "function" ? use(params as Promise<{ bookId: string }>) : (params as { bookId: string });
  const bookId = resolvedParams.bookId;

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

  return (
    <div style={{ backgroundColor: PAPER }} className="min-h-screen">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 style={{ fontFamily: FONT_DISPLAY }} className="text-5xl font-bold">
          Rent “{book.title}”
        </h1>
        <p className="mt-2 text-[#20304D]/70">
          by {book.author} — Pickup from {book.lister?.pickupPoint?.label || "Pickup Point"}
        </p>

        <RentForm book={book} />
      </div>
    </div>
  );
}

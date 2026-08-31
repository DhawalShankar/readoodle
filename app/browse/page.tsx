"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import type { Book, BookFilterState } from "@/types";
import { FONT_DISPLAY, FONT_MONO, PAPER } from "@/lib/theme";
import { fetchBooks } from "@/lib/api";
import BookCard from "@/components/book/BookCard";
import BookFilters from "@/components/book/BookFilters";

const DEFAULT_FILTERS: BookFilterState = {
  query: "",
  genre: "all",
  availability: "all",
  pickupCity: "all",
  maxPricePerWeek: 200,
  sort: "relevance",
};

export default function BrowsePage() {
  const router = useRouter();
  const { status } = useSession();
  const [filters, setFilters] = useState<BookFilterState>(DEFAULT_FILTERS);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchBooks(filters)
      .then((data) => !cancelled && setBooks(data))
      .catch(() => !cancelled && setError("Couldn't load the catalog right now — try again in a moment."))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, filters.query, filters.genre, filters.availability, filters.pickupCity, filters.maxPricePerWeek, filters.sort]);

  const resultsLabel = useMemo(() => {
    if (loading) return "Fetching books…";
    if (error) return error;
    return `${books.length} book${books.length === 1 ? "" : "s"} up for rent`;
  }, [loading, error, books.length]);

  if (status === "loading") {
    return (
      <div style={{ backgroundColor: PAPER }} className="flex min-h-screen items-center justify-center p-6 text-center">
        <p style={{ fontFamily: FONT_MONO }} className="text-sm text-[#20304D]/60">
          Checking login status…
        </p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div style={{ backgroundColor: PAPER }} className="min-h-screen">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <h1 style={{ fontFamily: FONT_DISPLAY }} className="text-5xl font-bold">
          Browse the shelf
        </h1>
        <p className="mt-2 text-[#20304D]/70">{resultsLabel}</p>

        <div className="mt-8 grid gap-8 md:grid-cols-[260px_1fr]">
          <BookFilters filters={filters} onChange={setFilters} />

          <div>
            {!loading && !error && books.length === 0 && (
              <div className="border-2 border-dashed border-[#20304D]/30 p-10 text-center text-sm text-[#20304D]/60">
                No books match those filters yet. Try widening your search — or be the first to list one nearby.
              </div>
            )}

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {books.map((book, i) => (
                <BookCard key={book.id} book={book} index={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

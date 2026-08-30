"use client";

import { useEffect, useMemo, useState } from "react";
import type { Book, BookFilterState } from "@/types";
import { FONT_DISPLAY, PAPER } from "@/lib/theme";
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
  const [filters, setFilters] = useState<BookFilterState>(DEFAULT_FILTERS);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
  }, [filters.query, filters.genre, filters.availability, filters.pickupCity, filters.maxPricePerWeek, filters.sort]);

  const resultsLabel = useMemo(() => {
    if (loading) return "Fetching books…";
    if (error) return error;
    return `${books.length} book${books.length === 1 ? "" : "s"} up for rent`;
  }, [loading, error, books.length]);

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

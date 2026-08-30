"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Book } from "@/types";
import { FONT_DISPLAY, FONT_MONO, INK, PAPER, SAGE } from "@/lib/theme";
import { formatRupees } from "@/lib/utils";
import { fetchMyListings } from "@/lib/api";
import ListingForm from "@/components/lister/ListingForm";
import Badge from "@/components/ui/Badge";

export default function ListerPage() {
  const [listings, setListings] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchMyListings()
      .then((data) => !cancelled && setListings(data))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div style={{ backgroundColor: PAPER }} className="min-h-screen">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 style={{ fontFamily: FONT_DISPLAY }} className="text-5xl font-bold">
          List a book
        </h1>
        <p className="mt-2 max-w-xl text-[#20304D]/70">
          Set your price, set your pickup point, keep 98% of every rental. Your book goes live on the Kanpur shelf
          as soon as you save it below.
        </p>

        <div className="mt-10">
          <ListingForm />
        </div>

        <div className="mt-16">
          <p style={{ fontFamily: FONT_MONO }} className="text-xs uppercase tracking-[0.2em] text-[#20304D]/60">
            Your listings
          </p>

          {loading && (
            <p style={{ fontFamily: FONT_MONO }} className="mt-4 text-sm text-[#20304D]/50">
              Loading…
            </p>
          )}

          {!loading && listings.length === 0 && (
            <div className="mt-4 border-2 border-dashed border-[#20304D]/30 p-8 text-center text-sm text-[#20304D]/60">
              Nothing listed yet — the form above is where that starts.
            </div>
          )}

          <div className="mt-4 space-y-3">
            {listings.map((book) => (
              <Link
                key={book.id}
                href={`/browse/${book.id}`}
                className="flex items-center justify-between gap-4 border border-[#20304D]/15 bg-[#FBF7EC] p-4 hover:-translate-y-0.5 transition-transform"
              >
                <div>
                  <p className="text-sm font-semibold" style={{ color: INK }}>{book.title}</p>
                  <p className="text-xs text-[#20304D]/60">{book.author}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span style={{ fontFamily: FONT_MONO }} className="text-sm">
                    {formatRupees(book.rentalPricePerWeek)}/wk
                  </span>
                  <Badge color={book.available ? SAGE : INK}>{book.available ? "Live" : "Rented out"}</Badge>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
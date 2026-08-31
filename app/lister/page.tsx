"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Book } from "@/types";
import { FONT_DISPLAY, FONT_MONO, INK, PAPER, SAGE } from "@/lib/theme";
import { fetchMyListings, deleteListing } from "@/lib/api";
import ListingForm from "@/components/lister/ListingForm";
import Badge from "@/components/ui/Badge";

export default function ListerPage() {
  const [listings, setListings] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchMyListings()
      .then((data) => !cancelled && setListings(data))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleDelete(e: React.MouseEvent, bookId: string) {
    e.preventDefault(); // Link navigate na kare
    e.stopPropagation();

    if (!confirm("Delete this listing? This action cannot be undone.")) return;

    setDeletingId(bookId);
    try {
      await deleteListing(bookId);
      setListings((prev) => prev.filter((b) => b.id !== bookId));
    } catch {
      alert("Failed to delete — please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div style={{ backgroundColor: PAPER }} className="min-h-screen">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 style={{ fontFamily: FONT_DISPLAY }} className="text-5xl font-bold">
          List a book
        </h1>
        <p className="mt-2 max-w-xl text-[#20304D]/70">
          Every rental is ₹50 for 7 days, keep 98% of it. Set your pickup point and your book goes live on the
          Kanpur shelf as soon as you save it below.
        </p>

        {/* How Payouts Work Section */}
        <div className="mt-10 p-6 border-2 border-dashed" style={{ borderColor: SAGE, backgroundColor: "#F5F9F6" }}>
          <h2 style={{ fontFamily: FONT_DISPLAY, color: SAGE }} className="text-2xl font-bold mb-4">
            How Payouts Work
          </h2>
          <div className="space-y-3 text-sm text-[#20304D]/80">
            <div>
              <p className="font-semibold">💰 Fixed Price: ₹50 per book, per 7 days</p>
              <p className="text-xs text-[#20304D]/70 mt-1">No negotiation. Every renter pays ₹50. You keep 98%.</p>
            </div>
            <div>
              <p className="font-semibold">📊 Commission Breakdown</p>
              <p className="text-xs text-[#20304D]/70 mt-1">
                • Renter pays: ₹50<br />
                • Readoodle commission (2%): ₹1<br />
                • You receive: ₹49 per rental
              </p>
            </div>
            <div>
              <p className="font-semibold">⏰ T+2 Payout Timing</p>
              <p className="text-xs text-[#20304D]/70 mt-1">
                Once a rental is approved and book is picked up, the admin will manually verify and send you payment within 2 days via UPI/bank transfer. You'll see pending & paid status in the admin "Lister Payouts" section.
              </p>
            </div>
            <div>
              <p className="font-semibold">✓ How to Track Your Earnings</p>
              <p className="text-xs text-[#20304D]/70 mt-1">
                Visit <Link href="/account/rentals" className="text-blue-600 underline">your rentals page</Link> to see your active listings and rental history. Admin will notify you via email when payments are processed.
              </p>
            </div>
            <div>
              <p className="font-semibold">❓ Questions?</p>
              <p className="text-xs text-[#20304D]/70 mt-1">
                Contact the admin at your lister email. We process payouts every 2 days for all approved rentals.
              </p>
            </div>
          </div>
        </div>

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
                  <Badge color={book.available ? SAGE : INK}>{book.available ? "Live" : "Rented out"}</Badge>
                  <button
                    onClick={(e) => handleDelete(e, book.id)}
                    disabled={deletingId === book.id}
                    className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
                  >
                    {deletingId === book.id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
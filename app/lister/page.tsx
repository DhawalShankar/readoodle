"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import type { Book, ListerStats } from "@/types";
import { FONT_DISPLAY, FONT_MONO, INK, PAPER, SAGE, CORAL } from "@/lib/theme";
import { fetchMyListings, deleteListing, fetchListerStats, setBookAvailability } from "@/lib/api";
import { isAdminEmail } from "@/lib/admin-utils";
import ListingForm from "@/components/lister/ListingForm";
import Badge from "@/components/ui/Badge";
import DashedCard from "@/components/ui/DashedCard";

export default function ListerPage() {
  const { data: session } = useSession();
  const [listings, setListings] = useState<Book[]>([]);
  const [stats, setStats] = useState<ListerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const isOwner = Boolean(stats?.isAdmin || isAdminEmail(session?.user?.email));

  const loadData = () => {
    setLoading(true);
    Promise.all([fetchMyListings(), fetchListerStats()])
      .then(([booksData, statsData]) => {
        setListings(booksData);
        setStats(statsData);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  async function handleToggleAvailability(e: React.MouseEvent, book: Book) {
    e.preventDefault();
    e.stopPropagation();

    const newAvailability = book.available ? "rented" : "available";
    setTogglingId(book.id);
    try {
      await setBookAvailability(book.id, newAvailability);
      setListings((prev) =>
        prev.map((b) => (b.id === book.id ? { ...b, available: !book.available } : b))
      );
    } catch {
      alert("Failed to update status — please try again.");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(e: React.MouseEvent, bookId: string) {
    e.preventDefault();
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
          My Lister Dashboard
        </h1>
        <p className="mt-2 max-w-xl text-[#20304D]/70">
          {isOwner
            ? "Manage your official inventory books, toggle availability, and track total rental revenue."
            : "Manage your own listed books, toggle availability, and track your personal rental earnings (₹49/rental)."}
        </p>

        {/* Lister Earnings & Payout Summary Card */}
        {stats && (
          <div className="mt-8">
            <DashedCard className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#20304D]/10 pb-3">
                <div>
                  <p style={{ fontFamily: FONT_MONO, color: INK }} className="text-xs uppercase tracking-[0.2em] text-[#20304D]/60">
                    {isOwner ? "Readoodle Official Inventory & Revenue" : "My Personal Earnings & Payout Status"}
                  </p>
                  <h2 className="text-xl font-bold mt-1" style={{ color: INK }}>
                    {isOwner ? `Total Revenue: ₹${stats.grossEarnings.toFixed(2)}` : `Total Earnings: ₹${stats.netEarnings.toFixed(2)}`}
                  </h2>
                </div>
                <div>
                  {isOwner ? (
                    <span className="rounded-full px-3 py-1 text-xs font-bold text-white" style={{ backgroundColor: SAGE }}>
                      ✓ OWN INVENTORY
                    </span>
                  ) : stats.payoutReleased ? (
                    <span className="rounded-full px-3 py-1 text-xs font-bold text-white" style={{ backgroundColor: SAGE }}>
                      ✓ PAID
                    </span>
                  ) : (
                    <span className="rounded-full px-3 py-1 text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      ⌛ PENDING T+2 PAYOUT
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="bg-[#F4F1EA] p-3 rounded">
                  <p style={{ fontFamily: FONT_MONO }} className="font-bold text-base">{stats.totalListings}</p>
                  <p className="text-[#20304D]/60">My Listed Books</p>
                </div>
                <div className="bg-[#F4F1EA] p-3 rounded">
                  <p style={{ fontFamily: FONT_MONO }} className="font-bold text-base">{stats.totalRentals}</p>
                  <p className="text-[#20304D]/60">Approved Rentals</p>
                </div>
                <div className="bg-[#F4F1EA] p-3 rounded">
                  <p style={{ fontFamily: FONT_MONO, color: SAGE }} className="font-bold text-base">
                    ₹{isOwner ? stats.grossEarnings.toFixed(2) : stats.netEarnings.toFixed(2)}
                  </p>
                  <p className="text-[#20304D]/60">{isOwner ? "Direct Revenue (100%)" : "Net Earnings (98%)"}</p>
                </div>
              </div>

              <div className="p-3 bg-[#F4F1EA] rounded text-xs space-y-1">
                {isOwner ? (
                  <p className="text-[#20304D]/80">
                    <strong>👑 Platform Owner Account:</strong> Payout holds do not apply to your listings (dhawalmannu@gmail.com).
                  </p>
                ) : (
                  <>
                    <p><strong>💳 Registered UPI ID:</strong> {stats.upiId || "Not specified"}</p>
                    <p><strong>📱 Registered Phone:</strong> {stats.phoneNumber || "Not specified"}</p>
                    {stats.lastPayoutDate && (
                      <p className="text-[#20304D]/70">✓ Last payout released on {new Date(stats.lastPayoutDate).toLocaleDateString()}</p>
                    )}
                  </>
                )}
              </div>
            </DashedCard>
          </div>
        )}

        {/* How Payouts Work Section */}
        <div className="mt-8 p-6 border-2 border-dashed" style={{ borderColor: SAGE, backgroundColor: "#F5F9F6" }}>
          <h2 style={{ fontFamily: FONT_DISPLAY, color: SAGE }} className="text-2xl font-bold mb-4">
            {isOwner ? "Official Inventory Policy" : "How Payouts Work"}
          </h2>
          <div className="space-y-3 text-sm text-[#20304D]/80">
            <div>
              <p className="font-semibold">💰 Fixed Price: ₹50 per book, per 7 days</p>
              <p className="text-xs text-[#20304D]/70 mt-1">
                {isOwner
                  ? "Every renter pays ₹50 per 7 days."
                  : "No negotiation. Every renter pays ₹50. You keep 98% (₹49 net)."}
              </p>
            </div>
            <div>
              <p className="font-semibold">
                {isOwner ? "⚡ Direct Revenue (No Payout Holds)" : "⏰ T+2 Payout Timing"}
              </p>
              <p className="text-xs text-[#20304D]/70 mt-1">
                {isOwner
                  ? "As the platform owner (dhawalmannu@gmail.com), 100% of rental revenue directly belongs to Readoodle with no payout processing required."
                  : "Admin verifies rental approvals and transfers your earnings directly to your UPI ID within 48 hours."}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <ListingForm />
        </div>

        {/* My Personal Catalog & Availability Controls */}
        <div className="mt-16">
          <div className="flex items-center justify-between">
            <p style={{ fontFamily: FONT_MONO }} className="text-xs uppercase tracking-[0.2em] text-[#20304D]/60">
              My Books Catalog ({listings.length})
            </p>
            <span className="text-xs text-[#20304D]/60">Only showing books listed by you</span>
          </div>

          {loading && (
            <p style={{ fontFamily: FONT_MONO }} className="mt-4 text-sm text-[#20304D]/50">
              Loading your catalog…
            </p>
          )}

          {!loading && listings.length === 0 && (
            <div className="mt-4 border-2 border-dashed border-[#20304D]/30 p-8 text-center text-sm text-[#20304D]/60">
              You haven't listed any books yet — use the form above to add your first book.
            </div>
          )}

          <div className="mt-4 space-y-3">
            {listings.map((book) => (
              <div
                key={book.id}
                className="flex items-center justify-between gap-4 border border-[#20304D]/15 bg-[#FBF7EC] p-4"
              >
                <div>
                  <Link href={`/browse/${book.id}`} className="text-sm font-semibold hover:underline" style={{ color: INK }}>
                    {book.title}
                  </Link>
                  <p className="text-xs text-[#20304D]/60">{book.author} · {book.genre}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge color={book.available ? SAGE : INK}>{book.available ? "Available" : "Rented out"}</Badge>

                  <button
                    onClick={(e) => handleToggleAvailability(e, book)}
                    disabled={togglingId === book.id}
                    className="rounded border px-2.5 py-1 text-xs font-semibold transition-opacity disabled:opacity-50"
                    style={{
                      borderColor: INK,
                      backgroundColor: book.available ? "transparent" : INK,
                      color: book.available ? INK : PAPER,
                    }}
                  >
                    {togglingId === book.id
                      ? "Updating..."
                      : book.available
                        ? "Mark Rented"
                        : "Mark Available"}
                  </button>

                  <button
                    onClick={(e) => handleDelete(e, book.id)}
                    disabled={deletingId === book.id}
                    className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
                  >
                    {deletingId === book.id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
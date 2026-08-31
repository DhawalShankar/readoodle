"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { CORAL, FONT_DISPLAY, FONT_MONO, INK, PAPER, SAGE } from "@/lib/theme";
import DashedCard from "@/components/ui/DashedCard";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { isAdminEmail } from "@/lib/admin";
import {
  fetchAdminUsers,
  updateAdminUserDeposit,
  fetchAdminRentals,
  updateAdminRentalStatus,
  fetchBooks,
  updateAdminBookAvailability,
  fetchAdminListers,
} from "@/lib/api";
import type { AdminUser, AdminRentalRequest, Book } from "@/types";

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<"users" | "rentals" | "books" | "listers">("users");

  // Users state
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);

  // Rentals state
  const [rentals, setRentals] = useState<AdminRentalRequest[]>([]);
  const [rentalsLoading, setRentalsLoading] = useState(true);

  // Books state
  const [books, setBooks] = useState<Book[]>([]);
  const [booksLoading, setBooksLoading] = useState(true);

  // Listers state
  const [listers, setListers] = useState<any[]>([]);
  const [listersLoading, setListersLoading] = useState(true);

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Load Users
  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const data = await fetchAdminUsers();
      setUsers(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setUsersLoading(false);
    }
  };

  // Load Rentals
  const loadRentals = async () => {
    setRentalsLoading(true);
    try {
      const data = await fetchAdminRentals();
      setRentals(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setRentalsLoading(false);
    }
  };

  // Load Books
  const loadBooks = async () => {
    setBooksLoading(true);
    try {
      const data = await fetchBooks();
      setBooks(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setBooksLoading(false);
    }
  };

  // Load Listers
  const loadListers = async () => {
    setListersLoading(true);
    try {
      const data = await fetchAdminListers();
      setListers(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setListersLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && isAdminEmail(session?.user?.email)) {
      loadUsers();
      loadRentals();
      loadBooks();
      loadListers();
    }
  }, [status, session]);

  if (status === "loading") {
    return (
      <div style={{ backgroundColor: PAPER }} className="min-h-screen flex items-center justify-center p-6">
        <p style={{ fontFamily: FONT_MONO }} className="text-sm text-[#20304D]/70">
          Checking admin permissions...
        </p>
      </div>
    );
  }

  if (status !== "authenticated" || !isAdminEmail(session?.user?.email)) {
    return (
      <div style={{ backgroundColor: PAPER }} className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <DashedCard>
            <div className="py-6">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 font-bold text-xl">
                🔒
              </div>
              <h1 style={{ fontFamily: FONT_DISPLAY }} className="text-2xl font-bold mb-2" color={INK}>
                Access Denied
              </h1>
              <p className="text-sm text-[#20304D]/70 mb-6">
                The Admin Panel is restricted to authorized administrative personnel only.
              </p>
              <Button href="/" variant="filled">
                Return to Homepage
              </Button>
            </div>
          </DashedCard>
        </div>
      </div>
    );
  }

  const handleToggleDeposit = async (user: AdminUser) => {
    const newStatus = !user.securityDepositPaid;
    setActionLoading(`user-${user.id}`);
    setMessage(null);
    try {
      await updateAdminUserDeposit(user.id, newStatus);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, securityDepositPaid: newStatus } : u))
      );
      setMessage(`Updated ${user.email}: Security deposit marked as ${newStatus ? "PAID" : "UNPAID"}.`);
    } catch (err: any) {
      setMessage(`Error updating user deposit: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateRentalStatus = async (rentalId: string, newStatus: "approved" | "rejected") => {
    setActionLoading(`rental-${rentalId}`);
    setMessage(null);
    try {
      await updateAdminRentalStatus(rentalId, newStatus);
      setRentals((prev) =>
        prev.map((r) => (r.id === rentalId ? { ...r, status: newStatus } : r))
      );
      if (newStatus === "approved") {
        // refresh books list to reflect rented status
        loadBooks();
      }
      setMessage(`Rental request updated to ${newStatus.toUpperCase()}.`);
    } catch (err: any) {
      setMessage(`Error updating rental: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleBookAvailability = async (book: Book) => {
    const newAvailability = !book.available;
    setActionLoading(`book-${book.id}`);
    setMessage(null);
    try {
      await updateAdminBookAvailability(book.id, newAvailability);
      setBooks((prev) =>
        prev.map((b) => (b.id === book.id ? { ...b, available: newAvailability } : b))
      );
      setMessage(`Updated "${book.title}": Status set to ${newAvailability ? "AVAILABLE" : "RENTED"}.`);
    } catch (err: any) {
      setMessage(`Error updating book: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div style={{ backgroundColor: PAPER }} className="min-h-screen">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#20304D]/15 pb-6">
          <div>
            <h1 style={{ fontFamily: FONT_DISPLAY }} className="text-4xl font-bold">
              Readoodle Admin Dashboard
            </h1>
            <p className="mt-1 text-sm text-[#20304D]/70">
              Verify Razorpay payments, approve rentals, and manage book availability.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                loadUsers();
                loadRentals();
                loadBooks();
                loadListers();
              }}
              className="rounded-sm border-2 px-3 py-1.5 text-xs font-semibold"
              style={{ borderColor: INK, color: INK }}
            >
              🔄 Refresh Data
            </button>
          </div>
        </div>

        {message && (
          <div
            className="mt-6 rounded-sm border-l-4 p-4 text-sm font-medium"
            style={{ borderColor: INK, backgroundColor: "#F4F1EA", color: INK }}
          >
            {message}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mt-8 flex gap-2 border-b border-[#20304D]/15 pb-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab("users")}
            className="px-5 py-2.5 text-sm font-semibold capitalize transition-colors whitespace-nowrap"
            style={{
              color: activeTab === "users" ? INK : "#20304D80",
              borderBottom: activeTab === "users" ? `3px solid ${INK}` : "3px solid transparent",
            }}
          >
            Users & Security Deposits ({users.length})
          </button>
          <button
            onClick={() => setActiveTab("rentals")}
            className="px-5 py-2.5 text-sm font-semibold capitalize transition-colors whitespace-nowrap"
            style={{
              color: activeTab === "rentals" ? INK : "#20304D80",
              borderBottom: activeTab === "rentals" ? `3px solid ${INK}` : "3px solid transparent",
            }}
          >
            Rental Requests ({rentals.length})
          </button>
          <button
            onClick={() => setActiveTab("books")}
            className="px-5 py-2.5 text-sm font-semibold capitalize transition-colors whitespace-nowrap"
            style={{
              color: activeTab === "books" ? INK : "#20304D80",
              borderBottom: activeTab === "books" ? `3px solid ${INK}` : "3px solid transparent",
            }}
          >
            Book Inventory ({books.length})
          </button>
          <button
            onClick={() => setActiveTab("listers")}
            className="px-5 py-2.5 text-sm font-semibold capitalize transition-colors whitespace-nowrap"
            style={{
              color: activeTab === "listers" ? INK : "#20304D80",
              borderBottom: activeTab === "listers" ? `3px solid ${INK}` : "3px solid transparent",
            }}
          >
            Lister Payouts ({listers.length})
          </button>
        </div>

        {/* TAB 1: USERS */}
        {activeTab === "users" && (
          <div className="mt-8">
            <DashedCard>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold" style={{ color: INK }}>
                  User Management & Security Deposit Verification
                </h2>
                <p style={{ fontFamily: FONT_MONO }} className="text-xs text-[#20304D]/60">
                  Total Users: {users.length}
                </p>
              </div>

              {usersLoading ? (
                <p className="py-8 text-center text-sm text-[#20304D]/50" style={{ fontFamily: FONT_MONO }}>
                  Loading users...
                </p>
              ) : users.length === 0 ? (
                <p className="py-8 text-center text-sm text-[#20304D]/50">No users found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-[#20304D]/15 text-xs font-semibold uppercase tracking-wider text-[#20304D]/60">
                        <th className="pb-3">Name</th>
                        <th className="pb-3">Email</th>
                        <th className="pb-3">Security Deposit Status</th>
                        <th className="pb-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#20304D]/10">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-black/5">
                          <td className="py-3.5 font-medium">{user.name}</td>
                          <td className="py-3.5 text-[#20304D]/80">{user.email}</td>
                          <td className="py-3.5">
                            {user.securityDepositPaid ? (
                              <Badge color={SAGE}>PAID (₹500)</Badge>
                            ) : (
                              <Badge color={CORAL}>UNPAID</Badge>
                            )}
                          </td>
                          <td className="py-3.5 text-right">
                            <button
                              onClick={() => handleToggleDeposit(user)}
                              disabled={actionLoading === `user-${user.id}`}
                              className="rounded-sm border-2 px-3 py-1 text-xs font-semibold transition-opacity disabled:opacity-50"
                              style={{
                                borderColor: user.securityDepositPaid ? CORAL : SAGE,
                                backgroundColor: user.securityDepositPaid ? CORAL : SAGE,
                                color: "#FFFFFF",
                              }}
                            >
                              {actionLoading === `user-${user.id}`
                                ? "Updating..."
                                : user.securityDepositPaid
                                  ? "Mark Unpaid"
                                  : "Mark Paid (₹500)"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </DashedCard>
          </div>
        )}

        {/* TAB 2: RENTALS */}
        {activeTab === "rentals" && (
          <div className="mt-8">
            <DashedCard>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold" style={{ color: INK }}>
                  Rental Requests & Pickup Approvals
                </h2>
                <p style={{ fontFamily: FONT_MONO }} className="text-xs text-[#20304D]/60">
                  Total Requests: {rentals.length}
                </p>
              </div>

              {rentalsLoading ? (
                <p className="py-8 text-center text-sm text-[#20304D]/50" style={{ fontFamily: FONT_MONO }}>
                  Loading rental requests...
                </p>
              ) : rentals.length === 0 ? (
                <p className="py-8 text-center text-sm text-[#20304D]/50">No rental requests submitted yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-[#20304D]/15 text-xs font-semibold uppercase tracking-wider text-[#20304D]/60">
                        <th className="pb-3">Book</th>
                        <th className="pb-3">Renter Details</th>
                        <th className="pb-3">Pickup Location</th>
                        <th className="pb-3">Amount</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#20304D]/10">
                      {rentals.map((rental) => (
                        <tr key={rental.id} className="hover:bg-black/5">
                          <td className="py-3.5 font-semibold">{rental.bookTitle}</td>
                          <td className="py-3.5 text-xs">
                            <div className="font-medium text-[#20304D]">{rental.renterName}</div>
                            <div className="text-[#20304D]/60">{rental.renterEmail}</div>
                          </td>
                          <td className="py-3.5 text-xs text-[#20304D]/80 max-w-[200px] truncate">
                            {rental.pickupLocation}
                          </td>
                          <td className="py-3.5 font-medium">₹{rental.amount}</td>
                          <td className="py-3.5">
                            {rental.status === "approved" && <Badge color={SAGE}>APPROVED</Badge>}
                            {rental.status === "rejected" && <Badge color={CORAL}>REJECTED</Badge>}
                            {rental.status === "pending_approval" && (
                              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800 border border-amber-300">
                                PENDING VERIFICATION
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 text-right">
                            {rental.status === "pending_approval" ? (
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleUpdateRentalStatus(rental.id, "approved")}
                                  disabled={actionLoading === `rental-${rental.id}`}
                                  className="rounded-sm px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-50"
                                  style={{ backgroundColor: SAGE }}
                                >
                                  Approve & Send Email
                                </button>
                                <button
                                  onClick={() => handleUpdateRentalStatus(rental.id, "rejected")}
                                  disabled={actionLoading === `rental-${rental.id}`}
                                  className="rounded-sm px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-50"
                                  style={{ backgroundColor: CORAL }}
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-[#20304D]/50 uppercase font-mono">{rental.status}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </DashedCard>
          </div>
        )}

        {/* TAB 3: BOOKS */}
        {activeTab === "books" && (
          <div className="mt-8">
            <DashedCard>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold" style={{ color: INK }}>
                  Book Catalog & Availability Status
                </h2>
                <p style={{ fontFamily: FONT_MONO }} className="text-xs text-[#20304D]/60">
                  Total Books: {books.length}
                </p>
              </div>

              {booksLoading ? (
                <p className="py-8 text-center text-sm text-[#20304D]/50" style={{ fontFamily: FONT_MONO }}>
                  Loading books...
                </p>
              ) : books.length === 0 ? (
                <p className="py-8 text-center text-sm text-[#20304D]/50">No books in catalog.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-[#20304D]/15 text-xs font-semibold uppercase tracking-wider text-[#20304D]/60">
                        <th className="pb-3">Book Title</th>
                        <th className="pb-3">Author</th>
                        <th className="pb-3">Lister</th>
                        <th className="pb-3">Availability</th>
                        <th className="pb-3 text-right">Toggle Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#20304D]/10">
                      {books.map((book) => (
                        <tr key={book.id} className="hover:bg-black/5">
                          <td className="py-3.5 font-semibold">{book.title}</td>
                          <td className="py-3.5 text-[#20304D]/80">{book.author}</td>
                          <td className="py-3.5 text-xs text-[#20304D]/70">{book.lister?.name}</td>
                          <td className="py-3.5">
                            {book.available ? <Badge color={SAGE}>AVAILABLE</Badge> : <Badge color={INK}>RENTED</Badge>}
                          </td>
                          <td className="py-3.5 text-right">
                            <button
                              onClick={() => handleToggleBookAvailability(book)}
                              disabled={actionLoading === `book-${book.id}`}
                              className="rounded-sm border-2 px-3 py-1 text-xs font-semibold transition-opacity disabled:opacity-50"
                              style={{
                                borderColor: INK,
                                backgroundColor: book.available ? INK : "transparent",
                                color: book.available ? PAPER : INK,
                              }}
                            >
                              {actionLoading === `book-${book.id}`
                                ? "Updating..."
                                : book.available
                                  ? "Mark Rented"
                                  : "Mark Available"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </DashedCard>
          </div>
        )}

        {/* TAB 4: LISTERS */}
        {activeTab === "listers" && (
          <div className="mt-8">
            <DashedCard>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold" style={{ color: INK }}>
                  Lister Earnings & Payout Management
                </h2>
                <p style={{ fontFamily: FONT_MONO }} className="text-xs text-[#20304D]/60">
                  Total Listers: {listers.length}
                </p>
              </div>

              <p className="text-xs text-[#20304D]/70 mb-6 p-3 bg-[#FBF7EC] border border-[#20304D]/10 rounded">
                <strong>Manual Payout Process:</strong> Below shows all listers with approved rentals. After cutting the 2% commission, transfer the net amount to each lister's bank account manually via UPI/bank transfer. Update status once paid.
              </p>

              {listersLoading ? (
                <p className="py-8 text-center text-sm text-[#20304D]/50" style={{ fontFamily: FONT_MONO }}>
                  Loading listers...
                </p>
              ) : listers.length === 0 ? (
                <p className="py-8 text-center text-sm text-[#20304D]/50">No listers with approved rentals.</p>
              ) : (
                <div className="space-y-6">
                  {listers.map((lister) => (
                    <div key={lister.id} className="border border-[#20304D]/15 rounded p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-base" style={{ color: INK }}>
                            {lister.name}
                          </h3>
                          <p className="text-xs text-[#20304D]/70 mt-1">📧 {lister.email}</p>
                          <p className="text-xs text-[#20304D]/70">📍 {lister.pickupPoint?.label}</p>
                        </div>
                        <div className="text-right">
                          <p style={{ fontFamily: FONT_MONO, color: SAGE }} className="font-bold text-lg">
                            ₹{(lister.netEarnings || 0).toFixed(2)}
                          </p>
                          <p style={{ fontFamily: FONT_MONO }} className="text-xs text-[#20304D]/60 mt-1">
                            Net (after 2% commission)
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mb-4 text-center text-xs">
                        <div className="bg-[#F4F1EA] p-2 rounded">
                          <p style={{ fontFamily: FONT_MONO }} className="font-semibold">{lister.totalRentals}</p>
                          <p className="text-[#20304D]/60">Total Rentals</p>
                        </div>
                        <div className="bg-[#F4F1EA] p-2 rounded">
                          <p style={{ fontFamily: FONT_MONO }} className="font-semibold">
                            ₹{(lister.totalEarnings || 0).toFixed(2)}
                          </p>
                          <p className="text-[#20304D]/60">Gross Earnings</p>
                        </div>
                        <div className="bg-[#FFF0E8] p-2 rounded">
                          <p style={{ fontFamily: FONT_MONO, color: CORAL }} className="font-semibold">
                            ₹{(lister.platformCommission || 0).toFixed(2)}
                          </p>
                          <p className="text-[#20304D]/60">Commission (2%)</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-xs font-semibold mb-2">Recent Rentals:</p>
                        <div className="space-y-1 text-xs">
                          {lister.rentals?.slice(0, 3).map((rental: any) => (
                            <div key={rental.id} className="flex justify-between p-2 bg-[#F4F1EA] rounded">
                              <span>{rental.bookTitle}</span>
                              <span style={{ fontFamily: FONT_MONO }}>₹{rental.netAmount.toFixed(2)}</span>
                            </div>
                          ))}
                          {(lister.rentals?.length || 0) > 3 && (
                            <p className="text-[#20304D]/60">+{lister.rentals.length - 3} more rentals</p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-[#20304D]/10">
                        <button
                          onClick={() => {
                            // Copy lister details for manual payout tracking
                            const details = `${lister.name} - ₹${lister.netEarnings.toFixed(2)} - ${lister.email}`;
                            navigator.clipboard.writeText(details);
                            setMessage(`Copied to clipboard: ${lister.name}`);
                          }}
                          className="flex-1 rounded-sm border-2 px-3 py-2 text-xs font-semibold transition-opacity"
                          style={{
                            borderColor: SAGE,
                            backgroundColor: SAGE,
                            color: "#FFFFFF",
                          }}
                        >
                          📋 Copy Payout Details
                        </button>
                        <button
                          onClick={() => {
                            // Mark as paid manually
                            setListers((prev) =>
                              prev.map((l) =>
                                l.id === lister.id
                                  ? { ...l, payoutReleased: true, lastPayoutDate: new Date().toISOString() }
                                  : l
                              )
                            );
                            setMessage(`Marked ${lister.name}'s payout as RELEASED.`);
                          }}
                          className="flex-1 rounded-sm border-2 px-3 py-2 text-xs font-semibold transition-opacity"
                          style={{
                            borderColor: INK,
                            backgroundColor: lister.payoutReleased ? "#D4D4D4" : INK,
                            color: "#FFFFFF",
                          }}
                          disabled={lister.payoutReleased}
                        >
                          {lister.payoutReleased ? "✓ Paid" : "Mark as Paid"}
                        </button>
                      </div>
                      {lister.lastPayoutDate && (
                        <p className="text-xs text-[#20304D]/60 mt-2">
                          ✓ Paid on {new Date(lister.lastPayoutDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </DashedCard>
          </div>
        )}
      </div>
    </div>
  );
}

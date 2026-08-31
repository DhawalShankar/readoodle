"use client";

import { useEffect, useState } from "react";
import { fetchMyListings, deleteListing } from "@/lib/api";
import { formatRupees } from "@/lib/utils";
import DashedCard from "@/components/ui/DashedCard";
import type { Book } from "@/types";

export default function MyListings() {
  const [books, setBooks] = useState<Book[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMyListings()
      .then(setBooks)
      .catch(() => setError("Failed to load listings"));
  }, []);

  async function handleDelete(bookId: string) {
    if (!confirm("Delete this listing? This action cannot be undone.")) return;
    try {
      await deleteListing(bookId);
      setBooks((prev) => prev?.filter((b) => b.id !== bookId) ?? null);
    } catch {
      alert("Failed to delete — please try again");
    }
  }

  if (error) return <p className="mt-6 text-sm text-red-600">{error}</p>;
  if (!books) return <p className="mt-6 text-sm text-[#20304D]/60">Loading...</p>;
  if (books.length === 0) return <p className="mt-6 text-sm text-[#20304D]/60">You haven't created any listings yet.</p>;

  return (
    <div className="mt-8 space-y-4">
      {books.map((book) => (
        <DashedCard key={book.id}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{book.title}</p>
              <p className="text-sm text-[#20304D]/60">
                {formatRupees(book.rentalPricePerWeek)}/wk · {book.available ? "Available" : "Rented out"}
              </p>
            </div>
            <button onClick={() => handleDelete(book.id)} className="text-sm font-medium text-red-600 hover:underline">
              Delete
            </button>
          </div>
        </DashedCard>
      ))}
    </div>
  );
}
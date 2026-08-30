"use client";

import { useEffect, useState } from "react";
import type { Rental } from "@/types";
import { FONT_DISPLAY, FONT_MONO, INK, PAPER } from "@/lib/theme";
import { extendRental, fetchMyRentals, returnRental } from "@/lib/api";
import RentalCard from "@/components/rental/RentalCard";

export default function MyRentalsPage() {
  const [tab, setTab] = useState<"active" | "history">("active");
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchMyRentals(tab)
      .then((data) => !cancelled && setRentals(data))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [tab]);

  async function handleReturn(rentalId: string) {
    const updated = await returnRental(rentalId);
    setRentals((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  }

  async function handleExtend(rentalId: string) {
    const updated = await extendRental(rentalId, 1);
    setRentals((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  }

  return (
    <div style={{ backgroundColor: PAPER }} className="min-h-screen">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <h1 style={{ fontFamily: FONT_DISPLAY }} className="text-5xl font-bold">
          My rentals
        </h1>

        <div className="mt-6 flex gap-1 border-b border-[#20304D]/15">
          {(["active", "history"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-4 py-2 text-sm font-semibold capitalize"
              style={{
                color: tab === t ? INK : "#20304D80",
                borderBottom: tab === t ? `2px solid ${INK}` : "2px solid transparent",
              }}
            >
              {t === "active" ? "Active" : "History"}
            </button>
          ))}
        </div>

        <div className="mt-8 space-y-4">
          {loading && (
            <p style={{ fontFamily: FONT_MONO }} className="text-sm text-[#20304D]/50">
              Loading…
            </p>
          )}

          {!loading && rentals.length === 0 && (
            <div className="border-2 border-dashed border-[#20304D]/30 p-10 text-center text-sm text-[#20304D]/60">
              {tab === "active" ? "No active rentals — go find something to read." : "No past rentals yet."}
            </div>
          )}

          {rentals.map((rental) => (
            <RentalCard key={rental.id} rental={rental} onReturn={handleReturn} onExtend={handleExtend} />
          ))}
        </div>
      </div>
    </div>
  );
}

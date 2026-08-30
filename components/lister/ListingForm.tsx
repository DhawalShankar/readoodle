"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CORAL, FONT_MONO, INK } from "@/lib/theme";
import { formatRupees } from "@/lib/utils";
import { createListing } from "@/lib/api";
import Button from "@/components/ui/Button";
import DashedCard from "@/components/ui/DashedCard";

const GENRES = ["Fiction", "Non-fiction", "Fantasy", "Romance", "Mystery", "Textbook"];
const CONDITIONS = [
  { value: "new", label: "Like new" },
  { value: "good", label: "Good" },
  { value: "worn", label: "Worn but readable" },
] as const;

const COVER_COLORS = ["#5B7B9A", "#7C9070", "#E1573F", "#E8A33D", "#8A5B9A"];

type FormState = {
  title: string;
  author: string;
  genre: string;
  description: string;
  condition: (typeof CONDITIONS)[number]["value"];
  coverColor: string;
  bookPrice: string; // kept as string while editing, parsed on submit
  rentalPricePerWeek: string;
  securityDeposit: string;
  pickupLabel: string;
  pickupAddressLine: string;
};

const EMPTY: FormState = {
  title: "",
  author: "",
  genre: GENRES[0],
  description: "",
  condition: "good",
  coverColor: COVER_COLORS[0],
  bookPrice: "",
  rentalPricePerWeek: "",
  securityDeposit: "",
  pickupLabel: "",
  pickupAddressLine: "",
};

export default function ListingForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [touchedPricing, setTouchedPricing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bookPrice = Number(form.bookPrice) || 0;
  const maxRental = bookPrice * 0.5;
  const maxDeposit = bookPrice;

  // Auto-fill sensible defaults once a book price is entered, until the
  // person edits rental/deposit themselves.
  const rentalPricePerWeek = touchedPricing ? Number(form.rentalPricePerWeek) || 0 : maxRental;
  const securityDeposit = touchedPricing ? Number(form.securityDeposit) || 0 : maxDeposit;

  const rentalOverCap = bookPrice > 0 && rentalPricePerWeek > maxRental;
  const depositOverCap = bookPrice > 0 && securityDeposit > maxDeposit;

  const canSubmit = useMemo(() => {
    return (
      form.title.trim().length > 0 &&
      form.author.trim().length > 0 &&
      bookPrice > 0 &&
      rentalPricePerWeek > 0 &&
      securityDeposit >= 0 &&
      !rentalOverCap &&
      !depositOverCap &&
      form.pickupLabel.trim().length > 0 &&
      form.pickupAddressLine.trim().length > 0
    );
  }, [form, bookPrice, rentalPricePerWeek, securityDeposit, rentalOverCap, depositOverCap]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const listing = await createListing({
        title: form.title.trim(),
        author: form.author.trim(),
        genre: form.genre,
        description: form.description.trim(),
        condition: form.condition,
        coverColor: form.coverColor,
        bookPrice,
        rentalPricePerWeek,
        securityDeposit,
        pickupLabel: form.pickupLabel.trim(),
        pickupAddressLine: form.pickupAddressLine.trim(),
        pickupCity: "Kanpur",
      });
      router.push(`/browse/${listing.id}?listed=1`);
    } catch {
      setError("Couldn't save that listing — check the details and try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <DashedCard className="space-y-4">
        <p style={{ fontFamily: FONT_MONO, color: INK }} className="text-xs uppercase tracking-[0.2em] text-[#20304D]/60">
          Book details
        </p>

        <Field label="Title">
          <input
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="The book's name"
            className="w-full border border-[#20304D]/25 bg-transparent px-3 py-2 text-sm outline-none focus:border-[#20304D]"
          />
        </Field>

        <Field label="Author">
          <input
            value={form.author}
            onChange={(e) => update("author", e.target.value)}
            placeholder="Author's name"
            className="w-full border border-[#20304D]/25 bg-transparent px-3 py-2 text-sm outline-none focus:border-[#20304D]"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Genre">
            <select
              value={form.genre}
              onChange={(e) => update("genre", e.target.value)}
              className="w-full border border-[#20304D]/25 bg-transparent px-3 py-2 text-sm outline-none focus:border-[#20304D]"
            >
              {GENRES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </Field>

          <Field label="Condition">
            <select
              value={form.condition}
              onChange={(e) => update("condition", e.target.value as FormState["condition"])}
              className="w-full border border-[#20304D]/25 bg-transparent px-3 py-2 text-sm outline-none focus:border-[#20304D]"
            >
              {CONDITIONS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Description">
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="A line or two about the book"
            rows={3}
            className="w-full border border-[#20304D]/25 bg-transparent px-3 py-2 text-sm outline-none focus:border-[#20304D]"
          />
        </Field>

        <Field label="Cover colour">
          <div className="flex gap-2">
            {COVER_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => update("coverColor", c)}
                className="h-8 w-8 rounded-sm border-2"
                style={{ backgroundColor: c, borderColor: form.coverColor === c ? INK : "transparent" }}
                aria-label={`Use cover colour ${c}`}
              />
            ))}
          </div>
        </Field>
      </DashedCard>

      <DashedCard className="space-y-4">
        <p style={{ fontFamily: FONT_MONO, color: INK }} className="text-xs uppercase tracking-[0.2em] text-[#20304D]/60">
          Pricing
        </p>

        <Field label="What's this book worth? (₹)">
          <input
            type="number"
            min={0}
            value={form.bookPrice}
            onChange={(e) => update("bookPrice", e.target.value)}
            placeholder="e.g. 300"
            className="w-full border border-[#20304D]/25 bg-transparent px-3 py-2 text-sm outline-none focus:border-[#20304D]"
          />
          <p className="mt-1 text-xs text-[#20304D]/55">
            This sets your caps: rental can't exceed 50% of this per week, deposit can't exceed 100% of this.
          </p>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={`Rental / week (max ${bookPrice > 0 ? formatRupees(maxRental) : "—"})`}>
            <input
              type="number"
              min={0}
              value={touchedPricing ? form.rentalPricePerWeek : maxRental || ""}
              onChange={(e) => {
                setTouchedPricing(true);
                update("rentalPricePerWeek", e.target.value);
              }}
              className="w-full border bg-transparent px-3 py-2 text-sm outline-none"
              style={{ borderColor: rentalOverCap ? CORAL : "#20304D40" }}
            />
            {rentalOverCap && <p className="mt-1 text-xs" style={{ color: CORAL }}>Over the 50% cap — lower this.</p>}
          </Field>

          <Field label={`Security deposit (max ${bookPrice > 0 ? formatRupees(maxDeposit) : "—"})`}>
            <input
              type="number"
              min={0}
              value={touchedPricing ? form.securityDeposit : maxDeposit || ""}
              onChange={(e) => {
                setTouchedPricing(true);
                update("securityDeposit", e.target.value);
              }}
              className="w-full border bg-transparent px-3 py-2 text-sm outline-none"
              style={{ borderColor: depositOverCap ? CORAL : "#20304D40" }}
            />
            {depositOverCap && <p className="mt-1 text-xs" style={{ color: CORAL }}>Over the book's price — lower this.</p>}
          </Field>
        </div>

        <p className="text-xs text-[#20304D]/50">
          Readoodle takes a flat 2% commission from your rental fee; the rest lands with you T+2 days after pickup is confirmed.
        </p>
      </DashedCard>

      <DashedCard className="space-y-4">
        <p style={{ fontFamily: FONT_MONO, color: INK }} className="text-xs uppercase tracking-[0.2em] text-[#20304D]/60">
          Pickup point · Kanpur
        </p>

        <Field label="Pickup point name">
          <input
            value={form.pickupLabel}
            onChange={(e) => update("pickupLabel", e.target.value)}
            placeholder="e.g. Swaroop Nagar home pickup"
            className="w-full border border-[#20304D]/25 bg-transparent px-3 py-2 text-sm outline-none focus:border-[#20304D]"
          />
        </Field>

        <Field label="Address">
          <input
            value={form.pickupAddressLine}
            onChange={(e) => update("pickupAddressLine", e.target.value)}
            placeholder="Street / landmark — shown to renters after checkout"
            className="w-full border border-[#20304D]/25 bg-transparent px-3 py-2 text-sm outline-none focus:border-[#20304D]"
          />
        </Field>
      </DashedCard>

      {error && <p className="text-sm" style={{ color: CORAL }}>{error}</p>}

      <Button type="submit" variant="filled" disabled={!canSubmit || submitting}>
        {submitting ? "Listing…" : "List this book"}
      </Button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#20304D]/60">{label}</p>
      {children}
    </div>
  );
}
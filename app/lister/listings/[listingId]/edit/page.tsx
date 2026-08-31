"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { CORAL, FONT_DISPLAY, FONT_MONO, INK, PAPER } from "@/lib/theme";
import { fetchBook, updateListing } from "@/lib/api";
import Button from "@/components/ui/Button";
import DashedCard from "@/components/ui/DashedCard";
import type { Book } from "@/types";

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
  pickupLabel: string;
  pickupAddressLine: string;
  pickupCity: string;
  pickupTimeSlot: string;
};

export default function EditListingPage() {
  const router = useRouter();
  const params = useParams();
  const bookId = params?.listingId as string;
  const { data: session, status } = useSession();

  const [book, setBook] = useState<Book | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (!bookId) return;
    fetchBook(bookId)
      .then((data) => {
        setBook(data);
        setForm({
          title: data.title,
          author: data.author,
          genre: data.genre,
          description: data.description,
          condition: data.condition,
          coverColor: data.coverColor,
          pickupLabel: data.lister?.pickupPoint?.label || "",
          pickupAddressLine: data.lister?.pickupPoint?.addressLine || "",
          pickupCity: data.lister?.pickupPoint?.city || "Kanpur",
          pickupTimeSlot: data.lister?.pickupPoint?.pickupTimeSlot || "",
        });
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [bookId]);

  const isOwnListing = useMemo(() => {
    if (!book || !session?.user) return false;
    return (session.user as any).id === book.lister?.id;
  }, [book, session]);

  const canSubmit = useMemo(() => {
    if (!form) return false;
    return (
      form.title.trim().length > 0 &&
      form.author.trim().length > 0 &&
      form.pickupLabel.trim().length > 0 &&
      form.pickupAddressLine.trim().length > 0 &&
      form.pickupCity.trim().length > 0 &&
      form.pickupTimeSlot.trim().length > 0
    );
  }, [form]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!form || !canSubmit) return;

    setSubmitting(true);
    setError(null);
    try {
      await updateListing(bookId, {
        title: form.title.trim(),
        author: form.author.trim(),
        genre: form.genre,
        description: form.description.trim(),
        condition: form.condition,
        coverColor: form.coverColor,
        pickupLabel: form.pickupLabel.trim(),
        pickupAddressLine: form.pickupAddressLine.trim(),
        pickupCity: form.pickupCity.trim(),
        pickupTimeSlot: form.pickupTimeSlot.trim(),
      });
      router.push("/lister");
    } catch (err: any) {
      setError(err?.message || "Couldn't save changes — check the details and try again.");
      setSubmitting(false);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div style={{ backgroundColor: PAPER }} className="flex min-h-screen items-center justify-center p-6">
        <p style={{ fontFamily: FONT_MONO }} className="text-sm text-[#20304D]/60">Loading listing…</p>
      </div>
    );
  }

  if (notFound || !book || !form) {
    return (
      <div style={{ backgroundColor: PAPER }} className="flex min-h-screen items-center justify-center p-6 text-center">
        <p className="text-sm text-[#20304D]/70">This listing doesn't exist.</p>
      </div>
    );
  }

  if (!isOwnListing) {
    return (
      <div style={{ backgroundColor: PAPER }} className="flex min-h-screen items-center justify-center p-6 text-center">
        <p className="text-sm text-[#20304D]/70">You can only edit your own listings.</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: PAPER }} className="min-h-screen">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 style={{ fontFamily: FONT_DISPLAY }} className="text-4xl font-bold">
          Edit Listing
        </h1>
        <p className="mt-2 text-sm text-[#20304D]/70">
          Update details for "{book.title}". Pricing (₹50/week) stays fixed platform-wide.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-8">
          <DashedCard className="space-y-4">
            <p style={{ fontFamily: FONT_MONO, color: INK }} className="text-xs uppercase tracking-[0.2em] text-[#20304D]/60">
              Book details
            </p>

            <Field label="Title">
              <input
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                className="w-full border border-[#20304D]/25 bg-transparent px-3 py-2 text-sm outline-none focus:border-[#20304D]"
              />
            </Field>

            <Field label="Author">
              <input
                value={form.author}
                onChange={(e) => update("author", e.target.value)}
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
              Pickup point
            </p>

            <Field label="Pickup point name">
              <input
                value={form.pickupLabel}
                onChange={(e) => update("pickupLabel", e.target.value)}
                className="w-full border border-[#20304D]/25 bg-transparent px-3 py-2 text-sm outline-none focus:border-[#20304D]"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Address">
                <input
                  value={form.pickupAddressLine}
                  onChange={(e) => update("pickupAddressLine", e.target.value)}
                  className="w-full border border-[#20304D]/25 bg-transparent px-3 py-2 text-sm outline-none focus:border-[#20304D]"
                />
              </Field>

              <Field label="City">
                <input
                  value={form.pickupCity}
                  onChange={(e) => update("pickupCity", e.target.value)}
                  placeholder="e.g. Kanpur"
                  className="w-full border border-[#20304D]/25 bg-transparent px-3 py-2 text-sm outline-none focus:border-[#20304D]"
                />
              </Field>
            </div>

            <Field label="Pickup time slot">
              <input
                value={form.pickupTimeSlot}
                onChange={(e) => update("pickupTimeSlot", e.target.value)}
                placeholder="e.g. Mon–Sat, 6 PM – 9 PM"
                className="w-full border border-[#20304D]/25 bg-transparent px-3 py-2 text-sm outline-none focus:border-[#20304D]"
              />
            </Field>
          </DashedCard>

          {error && <p className="text-sm" style={{ color: CORAL }}>{error}</p>}

          <div className="flex gap-3">
            <Button type="submit" variant="filled" disabled={!canSubmit || submitting}>
              {submitting ? "Saving…" : "Save changes"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/lister")}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
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
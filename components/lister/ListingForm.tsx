"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { CORAL, FONT_MONO, INK } from "@/lib/theme";
import { createListing, fetchProfile } from "@/lib/api";
import { isAdminEmail } from "@/lib/admin-utils";
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
  pickupLabel: string;
  pickupAddressLine: string;
  upiId: string;
  phoneNumber: string;
};

const EMPTY: FormState = {
  title: "",
  author: "",
  genre: GENRES[0],
  description: "",
  condition: "good",
  coverColor: COVER_COLORS[0],
  pickupLabel: "",
  pickupAddressLine: "",
  upiId: "",
  phoneNumber: "",
};

export default function ListingForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const isOwner = isAdminEmail(session?.user?.email);

  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile()
      .then((data) => {
        if (data?.user) {
          const userAny = data.user as any;
          setForm((prev) => ({
            ...prev,
            upiId: prev.upiId || userAny.upiId || (isOwner ? "cosmoindiaprakashan@upi" : ""),
            phoneNumber: prev.phoneNumber || userAny.phoneNumber || (isOwner ? "9876543210" : ""),
          }));
        }
      })
      .catch(() => {
        if (isOwner) {
          setForm((prev) => ({
            ...prev,
            upiId: prev.upiId || "cosmoindiaprakashan@upi",
            phoneNumber: prev.phoneNumber || "9876543210",
          }));
        }
      });
  }, [isOwner]);

  const canSubmit = useMemo(() => {
    return (
      form.title.trim().length > 0 &&
      form.author.trim().length > 0 &&
      form.pickupLabel.trim().length > 0 &&
      form.pickupAddressLine.trim().length > 0 &&
      (isOwner || (form.upiId.trim().length > 0 && form.phoneNumber.trim().length > 0))
    );
  }, [form, isOwner]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    let trimmedUpi = form.upiId.trim();
    let trimmedPhone = form.phoneNumber.trim();

    if (isOwner) {
      if (!trimmedUpi) trimmedUpi = "cosmoindiaprakashan@upi";
      if (!trimmedPhone) trimmedPhone = "9876543210";
    }

    if (!isOwner && !trimmedUpi.includes("@")) {
      setError("Please enter a valid UPI ID (e.g. username@bank).");
      return;
    }

    const cleanPhone = trimmedPhone.replace(/\D/g, "");
    if (!isOwner && cleanPhone.length < 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

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
        pickupLabel: form.pickupLabel.trim(),
        pickupAddressLine: form.pickupAddressLine.trim(),
        pickupCity: "Kanpur",
        upiId: trimmedUpi,
        phoneNumber: trimmedPhone,
        bookPrice: 0,
        rentalPricePerWeek: 50,
        securityDeposit: 0,
      });
      router.push(`/browse/${listing.id}?listed=1`);
    } catch (err: any) {
      setError(err?.message || "Couldn't save that listing — check the details and try again.");
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
          {isOwner ? "Owner Contact Details" : "Mandatory Lister Payout Details"}
        </p>
        <p className="text-sm text-[#20304D]/70">
          {isOwner
            ? "Contact details associated with Readoodle official inventory. Payout transfers do not apply to your owner account."
            : "Please specify your UPI ID and Phone Number. Readoodle admin will use these details to transfer your rental earnings (₹49/rental) directly to your account."}
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={isOwner ? "UPI ID (Owner Account)" : "UPI ID (Mandatory)"}>
            <input
              value={form.upiId}
              onChange={(e) => update("upiId", e.target.value)}
              placeholder="e.g. username@upi or mobile@okaxis"
              className="w-full border border-[#20304D]/25 bg-transparent px-3 py-2 text-sm outline-none focus:border-[#20304D]"
              required={!isOwner}
            />
          </Field>

          <Field label={isOwner ? "Phone Number (Owner Contact)" : "Phone Number (Mandatory)"}>
            <input
              type="tel"
              value={form.phoneNumber}
              onChange={(e) => update("phoneNumber", e.target.value)}
              placeholder="e.g. 9876543210"
              className="w-full border border-[#20304D]/25 bg-transparent px-3 py-2 text-sm outline-none focus:border-[#20304D]"
              required={!isOwner}
            />
          </Field>
        </div>
      </DashedCard>

      <DashedCard className="space-y-2">
        <p style={{ fontFamily: FONT_MONO, color: INK }} className="text-xs uppercase tracking-[0.2em] text-[#20304D]/60">
          Pricing
        </p>
        <p className="text-sm text-[#20304D]/70">
          {isOwner
            ? "Every rental is ₹50 for 7 days, plus ₹10/day if returned late. As the platform owner (cosmoindiaprakashan@gmail.com), 100% of rental revenue directly belongs to Readoodle."
            : "Every rental is ₹50 for 7 days, plus ₹10/day if it comes back late. Readoodle takes a flat 2% commission; the rest lands with you T+2 days after pickup is confirmed."}
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
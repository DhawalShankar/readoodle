"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CORAL, FONT_MONO, INK, SAGE } from "@/lib/theme";
import { formatRupees } from "@/lib/utils";
import DashedCard from "@/components/ui/DashedCard";
import Button from "@/components/ui/Button";
import { createRental, fetchProfile } from "@/lib/api";
import type { Book } from "@/types";

const RENTAL_BUTTON_ID = "pl_TW3XeO6aR51Egs"; // ₹50
const PAYMENT_SCRIPT_URL = "https://checkout.razorpay.com/v1/payment-button.js";

export default function RentForm({ book }: { book: Book }) {
  const router = useRouter();
  const [depositPaid, setDepositPaid] = useState<boolean | null>(null); // null = checking
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetchProfile()
      .then((profile) => {
        if (!cancelled) {
          setDepositPaid(profile.securityDepositPaid);
          if (!profile.securityDepositPaid) {
            router.push("/profile?gated=1");
          }
        }
      })
      .catch(() => {
        if (!cancelled) setDepositPaid(false);
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    const formEl = formRef.current;
    if (!formEl || depositPaid !== true) return;

    formEl.innerHTML = "";
    const script = document.createElement("script");
    script.src = PAYMENT_SCRIPT_URL;
    script.async = true;
    script.setAttribute("data-payment_button_id", RENTAL_BUTTON_ID);
    formEl.appendChild(script);

    return () => {
      formEl.innerHTML = "";
    };
  }, [depositPaid]);

  async function handleSubmitRequest() {
    setSubmitting(true);
    setError(null);
    try {
      await createRental({ bookId: book.id, weeks: 1 });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Failed to submit rental request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (depositPaid === null) {
    return (
      <div className="py-8 text-center">
        <p style={{ fontFamily: FONT_MONO }} className="text-sm text-[#20304D]/60">
          Checking your security deposit status...
        </p>
      </div>
    );
  }

  if (depositPaid === false) {
    return (
      <div className="mt-6 border-2 border-dashed p-6 text-center" style={{ borderColor: CORAL }}>
        <p className="font-semibold text-lg" style={{ color: INK }}>
          Security Deposit Required
        </p>
        <p className="mt-2 text-sm text-[#20304D]/70">
          You must pay your one-time ₹500 security deposit on your profile before renting books.
        </p>
        <div className="mt-6">
          <Button href="/profile?gated=1" variant="filled">
            Go to Profile to Pay Deposit →
          </Button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <DashedCard className="mt-6 text-center py-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: "#E6F4EA", color: SAGE }}>
          ✓
        </div>
        <h3 className="mt-4 text-2xl font-bold" style={{ color: INK }}>
          Rental Request Submitted!
        </h3>
        <p className="mt-3 text-sm text-[#20304D]/80 leading-relaxed max-w-md mx-auto">
          We will verify your payment from our Razorpay dashboard. If approved, you will receive an email within 24 hours with your pickup location details (<strong>{book.lister?.pickupPoint?.label || "Pickup Location"}</strong>). Otherwise, your rental payment will be refunded.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button href="/browse" variant="outline">
            Browse More Books
          </Button>
          <Button href="/account/rentals" variant="filled">
            View My Rentals
          </Button>
        </div>
      </DashedCard>
    );
  }

  return (
    <div className="mt-6">
      <DashedCard>
        <p style={{ fontFamily: FONT_MONO }} className="text-xs uppercase tracking-widest text-[#20304D]/60">
          Rental Summary
        </p>

        <div className="mt-4 flex justify-between text-sm text-[#20304D]/80">
          <span>Book</span>
          <span className="font-semibold">{book.title}</span>
        </div>

        <div className="mt-2 flex justify-between text-sm text-[#20304D]/80">
          <span>Duration</span>
          <span>1 week</span>
        </div>

        <div className="mt-2 flex justify-between text-sm text-[#20304D]/80">
          <span>Rental Fee</span>
          <span>{formatRupees(book.rentalPricePerWeek || 50)}</span>
        </div>

        <div className="mt-4 border-t border-dashed border-[#20304D]/20 pt-4 flex justify-between text-base font-bold" style={{ color: INK }}>
          <span>Total Amount</span>
          <span>{formatRupees(book.rentalPricePerWeek || 50)}</span>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-[#20304D]/60">
          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: SAGE }} />
          Pickup Point: {book.lister?.pickupPoint?.label}, {book.lister?.pickupPoint?.addressLine}
        </div>
      </DashedCard>

      <div className="mt-8">
        <p className="text-sm font-semibold mb-3" style={{ color: INK }}>
          Step 1: Pay ₹50 Rental Fee via Razorpay
        </p>
        <div className="flex justify-center sm:justify-start">
          <form ref={formRef} />
        </div>
      </div>

      <div className="mt-8 border-t border-[#20304D]/15 pt-6">
        <p className="text-sm font-semibold mb-2" style={{ color: INK }}>
          Step 2: Submit Rental Request
        </p>
        <p className="text-xs text-[#20304D]/70 mb-4">
          Once you have completed the payment above, click below to submit your rental request for admin approval.
        </p>

        {error && <p className="mb-4 text-xs font-semibold text-red-600">{error}</p>}

        <button
          onClick={handleSubmitRequest}
          disabled={submitting}
          className="w-full rounded-sm border-2 py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
          style={{ backgroundColor: INK, borderColor: INK }}
        >
          {submitting ? "Submitting Request..." : "Submit Rental Request →"}
        </button>
      </div>
    </div>
  );
}
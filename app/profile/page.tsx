"use client";

import { Suspense } from "react";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { CORAL, FONT_DISPLAY, FONT_MONO, INK, PAPER, SAGE } from "@/lib/theme";
import { fetchProfile } from "@/lib/api";
import DashedCard from "@/components/ui/DashedCard";

const SECURITY_DEPOSIT_BUTTON_ID = "pl_TW3WYy8Z1Wkuod"; // ₹500
const PAYMENT_SCRIPT_URL = "https://checkout.razorpay.com/v1/payment-button.js";

function ProfileContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const isGated = searchParams.get("gated") === "1";

  const [depositPaid, setDepositPaid] = useState<boolean | null>(null); // null = loading
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetchProfile()
      .then((profile) => {
        if (!cancelled) setDepositPaid(profile.securityDepositPaid);
      })
      .catch(() => {
        if (!cancelled) setDepositPaid(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const formEl = formRef.current;
    if (!formEl || depositPaid !== false) return;

    formEl.innerHTML = "";
    const script = document.createElement("script");
    script.src = PAYMENT_SCRIPT_URL;
    script.async = true;
    script.setAttribute("data-payment_button_id", SECURITY_DEPOSIT_BUTTON_ID);
    if (session?.user?.email) {
      script.setAttribute("data-prefill.email", session.user.email);
    }
    formEl.appendChild(script);

    return () => {
      formEl.innerHTML = "";
    };
  }, [depositPaid, session?.user?.email]);

  return (
    <div style={{ backgroundColor: PAPER }} className="min-h-screen">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 style={{ fontFamily: FONT_DISPLAY }} className="text-5xl font-bold">
          {session?.user?.name ? `${session.user.name.split(" ")[0]}'s Profile` : "Your Profile"}
        </h1>
        <p className="mt-2 text-sm text-[#20304D]/70">{session?.user?.email}</p>

        {isGated && depositPaid === false && (
          <div
            className="mt-6 border-2 border-dashed p-4 text-sm font-medium"
            style={{ borderColor: CORAL, backgroundColor: "#FFF5F2", color: INK }}
          >
            ⚠️ Please pay your ₹500 security deposit first before renting any book. Once paid, admin will verify your payment.
          </div>
        )}

        <DashedCard className="mt-8">
          <div className="flex items-center justify-between">
            <p style={{ fontFamily: FONT_MONO }} className="text-xs uppercase tracking-[0.2em] text-[#20304D]/60">
              Security Deposit Status
            </p>
            {depositPaid === true && (
              <span
                className="rounded-full px-3 py-0.5 text-xs font-bold text-white"
                style={{ backgroundColor: SAGE }}
              >
                VERIFIED
              </span>
            )}
          </div>

          {depositPaid === null && (
            <p className="mt-4 text-sm text-[#20304D]/50">Checking your deposit status...</p>
          )}

          {depositPaid === true && (
            <div className="mt-4">
              <div className="flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: SAGE }} />
                <p className="text-base font-semibold" style={{ color: INK }}>
                  ₹500 Security Deposit Paid & Verified
                </p>
              </div>
              <p className="mt-2 text-sm text-[#20304D]/70">
                You're all set to browse listings and rent any book on Readoodle!
              </p>
            </div>
          )}

          {depositPaid === false && (
            <div className="mt-4">
              <p className="text-sm text-[#20304D]/70">
                Pay a one-time ₹500 refundable security deposit to unlock book rentals on Readoodle.
              </p>
              <div className="mt-3 rounded-md bg-[#F4F1EA] p-3 text-xs text-[#20304D]/80">
                <strong>Important:</strong> Please pay using your account email (
                <span className="underline">{session?.user?.email || "your email"}</span>). Admin will verify your payment from the Razorpay dashboard and update your profile status.
              </div>

              <div className="mt-6">
                <p className="text-2xl font-bold" style={{ color: INK }}>
                  ₹500 <span className="text-xs font-normal text-[#20304D]/60">(Refundable Deposit)</span>
                </p>
                <div className="mt-4 flex justify-center sm:justify-start">
                  <form ref={formRef} />
                </div>
              </div>
            </div>
          )}
        </DashedCard>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={null}>
      <ProfileContent />
    </Suspense>
  );
}
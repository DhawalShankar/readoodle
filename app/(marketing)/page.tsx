/**
 * Readoodle — Home
 *
 * Design concept: the old library due-date card tucked in the pocket at the
 * back of a library book. That card — a dashed-border index card, stamped
 * in monospace ink — is the signature motif, reused as the bookmark shape,
 * the pricing strip, and the CTA buttons.
 *
 * Fonts: loaded once, globally, in app/layout.tsx — Caveat, Work Sans, IBM
 * Plex Mono. This page just references the CSS variables layout.tsx sets up.
 *
 * PRD alignment (this pass):
 * - Pricing is fixed platform-wide: ₹50 rental per book for 7 days. No
 *   per-book owner-set pricing anymore.
 * - Late fine: ₹10/day, uncapped.
 * - One-time ₹500 security deposit, paid once from your profile, required
 *   before your first rental — not a per-book deposit.
 * - Flat 2% platform commission + T+2 lister payout.
 * - No verification step at signup — copy says "no approval wait."
 * - Hero badge names the launch city: Kanpur.
 */

'use client';

import { useEffect, useState } from 'react';

const INK = "#20304D";
const PAPER = "#F5EFE0";
const MARIGOLD = "#E8A33D";
const CORAL = "#E1573F";
const SAGE = "#7C9070";

interface Rental {
  id: string;
  bookTitle: string;
  dueDateISO: string;
  status: string;
  lister?: {
    name: string;
    email: string;
  };
}

export default function Home() {
  const [recentRentals, setRecentRentals] = useState<Rental[]>([]);
  const [cities, setCities] = useState<string[]>(['Kanpur']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch cities from pickup locations
    fetch('/api/cities')
      .then((res) => res.json())
      .then((data) => {
        if (data.cities && Array.isArray(data.cities)) {
          setCities(data.cities);
        }
      })
      .catch(() => {
        // Fallback to Kanpur if error
        setCities(['Kanpur']);
      });

    // Fetch recent rentals to display in hero (only approved ones)
    fetch('/api/rentals')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          // Only show approved rentals, not pending_approval
          const approvedRentals = data.filter((rental: any) => rental.status === 'approved');
          setRecentRentals(approvedRentals.slice(0, 3));
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const hasRentals = recentRentals.length > 0;
  const colors = ['#5B7B9A', SAGE, CORAL];

  return (
    <div style={{ backgroundColor: PAPER, color: INK }}>
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.05] mix-blend-multiply"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #20304D 1px, transparent 0)",
          backgroundSize: "22px 22px",
        }}
      />

      {/* ---------- HERO ---------- */}
      <section className="relative z-10 mx-auto grid max-w-6xl gap-12 px-6 pb-20 pt-16 md:grid-cols-2 md:items-center md:pt-24">
        <div>
          <span
            className="inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest"
            style={{ backgroundColor: `${SAGE}22`, color: SAGE }}
          >
            Now picking up in {cities.join(', ')}
          </span>

          <h1
            style={{ fontFamily: "var(--font-caveat)" }}
            className="mt-5 text-6xl font-bold leading-[0.95] sm:text-7xl"
          >
            Rent the book.
            <br />
            Keep the doodle.
          </h1>

          <p className="mt-6 max-w-md text-lg leading-relaxed text-[#20304D]/80">
            Readoodle is a community book rental shelf in Kanpur. Rent any book for <strong>₹50 for 7 days</strong>, or list your own books and earn <strong>₹49 per rental</strong> directly to your UPI.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <StampButton href="/browse" filled>Browse Books to Rent</StampButton>
            <StampButton href="/lister" inverted={false} filled={false}>List Your Books (Earn ₹49)</StampButton>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#20304D]/60">
            <span style={{ fontFamily: "var(--font-plex-mono)" }}>📖 ₹50 / 7 days rental</span>
            <Dot />
            <span style={{ fontFamily: "var(--font-plex-mono)" }}>💵 ₹49 net lister payout (T+2)</span>
            <Dot />
            <span style={{ fontFamily: "var(--font-plex-mono)" }}>🔒 ₹500 one-time deposit</span>
          </div>
        </div>

        <div className="relative mx-auto h-[380px] w-[300px]">
          {hasRentals ? (
            <>
              {recentRentals.map((rental, i) => (
                <BookCard key={rental.id} rotate={i === 0 ? -2 : i === 1 ? 4 : -6} top={i * 30} color={colors[i]} title={rental.bookTitle} />
              ))}
              <DueCard dueDate={recentRentals[0].dueDateISO} />
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <p style={{ fontFamily: "var(--font-caveat)", color: CORAL }} className="text-4xl leading-none">
                  Go get yourself
                </p>
                <p style={{ fontFamily: "var(--font-caveat)", color: CORAL }} className="text-4xl leading-none">
                  some books rented!
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ---------- HOW IT WORKS FOR BORROWERS ---------- */}
      <section id="how-borrowers" className="relative z-10 border-y border-[#20304D]/15 bg-[#EFE7D2]">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
            <div>
              <span style={{ fontFamily: "var(--font-plex-mono)", color: CORAL }} className="text-xs uppercase tracking-[0.2em]">
                For Readers & Borrowers
              </span>
              <h2 style={{ fontFamily: "var(--font-caveat)" }} className="mt-2 text-5xl font-bold">
                How Renting Works (3 Easy Steps)
              </h2>
            </div>
            <a href="/browse" className="mt-4 md:mt-0 text-sm font-semibold underline decoration-dashed underline-offset-4">
              Explore Available Books →
            </a>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <Step n="01" title="1. One-Time Deposit (₹500)">
              Pay a single refundable ₹500 security deposit on your profile page. This deposit unlocks unlimited future book rentals on Readoodle and protects book owners.
            </Step>
            <Step n="02" title="2. Rent Any Book for ₹50">
              Browse any book in Kanpur and submit your rental request for ₹50 per 7 days. Once verified, you get the Lister&rsquo;s address line for easy in-person pickup.
            </Step>
            <Step n="03" title="3. Read, Return & Keep Doodle">
              Enjoy reading for 7 days. Return the book to the lister&rsquo;s pickup point on time (late fee: ₹10/day). The bookmark that comes with the book is yours to keep!
            </Step>
          </div>
        </div>
      </section>

      {/* ---------- HOW IT WORKS FOR LISTERS ---------- */}
      <section id="how-listers" className="relative z-10 border-b border-[#20304D]/15" style={{ backgroundColor: INK }}>
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
            <div>
              <span style={{ fontFamily: "var(--font-plex-mono)", color: MARIGOLD }} className="text-xs uppercase tracking-[0.2em]">
                For Book Owners & Listers
              </span>
              <h2 style={{ fontFamily: "var(--font-caveat)" }} className="mt-2 text-5xl font-bold text-[#F5EFE0]">
                How Listing & Earning Works
              </h2>
            </div>
            <StampButton href="/lister" filled inverted>
              List a Book Now
            </StampButton>
          </div>

          <div className="grid gap-8 md:grid-cols-3 text-[#F5EFE0]/90">
            <div className="border border-[#F5EFE0]/15 bg-white/5 p-6 rounded-sm">
              <span style={{ fontFamily: "var(--font-plex-mono)", color: MARIGOLD }} className="text-sm font-bold">STEP 01</span>
              <h3 className="mt-2 text-xl font-semibold text-white">List Your Book & Payout Info</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#F5EFE0]/80">
                Enter your book title, author, pickup address, and your mandatory <strong>UPI ID</strong> and <strong>Phone Number</strong> so earnings can reach you.
              </p>
            </div>

            <div className="border border-[#F5EFE0]/15 bg-white/5 p-6 rounded-sm">
              <span style={{ fontFamily: "var(--font-plex-mono)", color: MARIGOLD }} className="text-sm font-bold">STEP 02</span>
              <h3 className="mt-2 text-xl font-semibold text-white">Hand Over at Pickup Point</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#F5EFE0]/80">
                When a borrower&rsquo;s rental is approved, keep the book ready at your home, shop, or cafe pickup point for in-person collection.
              </p>
            </div>

            <div className="border border-[#F5EFE0]/15 bg-white/5 p-6 rounded-sm">
              <span style={{ fontFamily: "var(--font-plex-mono)", color: MARIGOLD }} className="text-sm font-bold">STEP 03</span>
              <h3 className="mt-2 text-xl font-semibold text-white">Receive ₹49 Net Payout (T+2)</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#F5EFE0]/80">
                Every rental yields ₹50. Readoodle takes a flat 2% commission (₹1). Your <strong>₹49 net earnings</strong> are transferred directly to your UPI ID within 48 hours!
              </p>
            </div>
          </div>

          <div className="mt-12 p-6 border border-dashed border-[#F5EFE0]/30 bg-white/5 rounded-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#F5EFE0]/60 mb-2">Book Protection Guarantee</p>
            <p className="text-sm text-[#F5EFE0]/90">
              🛡️ Your books are 100% protected against damage or loss by the borrower&rsquo;s ₹500 security deposit held by Readoodle.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- THE DOODLE THING ---------- */}
      <section id="doodles" className="relative z-10 mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-2xl">
          <h2 style={{ fontFamily: "var(--font-caveat)" }} className="text-4xl font-semibold">
            About that doodle
          </h2>
          <p className="mt-4 text-[#20304D]/80">
            Every single rental gets one — but which kind depends on where
            the book comes from.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <DoodleCard
            eyebrow="Rented from Readoodle"
            title="A real, physical bookmark"
            body="Handed to you at pickup. One design from the current themed set — think tiny inked animals, or a scatter of stars. Collect the whole season if you're that kind of reader."
            accent={CORAL}
          />
          <DoodleCard
            eyebrow="Rented from another reader"
            title="A digital doodle, yours to print"
            body="Same art, sent straight to your inbox as a print-ready file. No physical copy comes with a neighbour's book — so we make sure a doodle still does."
            accent={SAGE}
          />
        </div>
      </section>

      {/* ---------- PRICING & TRANSPARENCY STRIP ---------- */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-20">
        <div
          className="mx-auto max-w-4xl border-2 border-dashed p-8 text-center"
          style={{ borderColor: INK, backgroundColor: "#FBF7EC" }}
        >
          <p style={{ fontFamily: "var(--font-plex-mono)" }} className="text-xs uppercase tracking-[0.2em] text-[#20304D]/60">
            Transparent Pricing & Payout Policy
          </p>
          <div style={{ fontFamily: "var(--font-plex-mono)" }} className="mt-6 grid gap-6 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <PriceLine label="Rental Rate" value="₹50 per 7 days" />
            <PriceLine label="Security Deposit" value="₹500 (one-time, refundable)" />
            <PriceLine label="Lister Payout" value="₹49 per rental (T+2)" />
            <PriceLine label="Platform Commission" value="Flat 2% (₹1)" />
          </div>
          <p style={{ fontFamily: "var(--font-plex-mono)" }} className="mt-6 text-xs text-[#20304D]/60">
            No hidden charges, no pricing negotiations. Every book rents for ₹50, and every lister earns ₹49 directly to their registered UPI ID within 2 days of rental approval.
          </p>
        </div>
      </section>
    </div>
  );
}

/* ---------- small building blocks ---------- */

function Dot() {
  return <span className="h-1 w-1 rounded-full bg-[#20304D]/30" />;
}

function StampButton({
  href, children, filled = false, inverted = false,
}: { href: string; children: React.ReactNode; filled?: boolean; inverted?: boolean }) {
  const base = "inline-flex items-center gap-2 rounded-sm border-2 px-5 py-2.5 text-[15px] font-semibold transition-transform hover:-translate-y-0.5";
  if (inverted) {
    return (
      <a href={href} className={base} style={{ borderColor: "#F5EFE0", backgroundColor: filled ? "#F5EFE0" : "transparent", color: filled ? INK : "#F5EFE0" }}>
        {children}
      </a>
    );
  }
  return (
    <a href={href} className={base} style={{ borderColor: INK, backgroundColor: filled ? INK : "transparent", color: filled ? PAPER : INK }}>
      {children}
    </a>
  );
}

function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div>
      <span style={{ fontFamily: "var(--font-plex-mono)", color: MARIGOLD }} className="text-sm font-medium">{n}</span>
      <h3 className="mt-2 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[#20304D]/75">{children}</p>
    </div>
  );
}

function DoodleCard({ eyebrow, title, body, accent }: { eyebrow: string; title: string; body: string; accent: string }) {
  return (
    <div className="border border-[#20304D]/15 bg-[#FBF7EC] p-7">
      <span style={{ fontFamily: "var(--font-plex-mono)", color: accent }} className="text-xs font-medium uppercase tracking-widest">{eyebrow}</span>
      <h3 style={{ fontFamily: "var(--font-caveat)" }} className="mt-3 text-3xl font-semibold">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-[#20304D]/75">{body}</p>
    </div>
  );
}

function PriceLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[#20304D]/55">{label}</p>
      <p className="mt-1 text-base font-medium">{value}</p>
    </div>
  );
}

function BookCard({ rotate, top, color, title }: { rotate: number; top: number; color: string; title: string }) {
  return (
    <div
      className="absolute left-1/2 flex h-64 w-44 -translate-x-1/2 flex-col justify-end rounded-sm p-4 shadow-xl"
      style={{ top, transform: `translateX(-50%) rotate(${rotate}deg)`, backgroundColor: color }}
    >
      <p style={{ fontFamily: "var(--font-caveat)" }} className="text-2xl font-semibold leading-tight text-[#F5EFE0]">
        {title}
      </p>
    </div>
  );
}

function DueCard({ dueDate }: { dueDate: string }) {
  const daysRemaining = formatDaysUntilDue(dueDate);

  return (
    <div
      className="absolute -right-6 top-[-28px] w-40 rotate-[10deg] border-2 border-dashed bg-[#FBF7EC] px-4 py-3 shadow-md"
      style={{ borderColor: INK }}
    >
      <p style={{ fontFamily: "var(--font-caveat)", color: CORAL }} className="text-2xl leading-none">
        hi, reader!
      </p>
      <p style={{ fontFamily: "var(--font-plex-mono)" }} className="mt-2 text-[11px] uppercase tracking-widest text-[#20304D]/60">
        due back
      </p>
      <p style={{ fontFamily: "var(--font-plex-mono)" }} className="text-sm">
        {daysRemaining} days from today
      </p>
    </div>
  );
}

function formatDaysUntilDue(dueDateISO: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(dueDateISO);
  dueDate.setHours(0, 0, 0, 0);

  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
}
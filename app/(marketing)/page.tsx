/**
 * Readoodle — Home
 *
 * Design concept: the old library due-date card tucked in the pocket at the
 * back of a library book. That card — a dashed-border index card, stamped
 * in monospace ink — is the signature motif, reused as the bookmark shape,
 * the pricing strip, and the CTA buttons.
 *
 * Fonts: loaded once, globally, in app/layout.tsx — Caveat (handwritten,
 * doodled feel), Work Sans (body copy), IBM Plex Mono (stamps, prices,
 * due dates). This page just references the CSS variables layout.tsx
 * sets up; it does not load fonts itself.
 *
 * PRD alignment (this pass, matching the latest PRD):
 * - Pricing is per-book, owner-set: rental ≤ 50% of book price, deposit
 *   ≤ 100% of book price. No flat ₹50/week anywhere anymore.
 * - Late fine corrected to ₹10/day, explicitly uncapped.
 * - Flat 2% platform commission + T+2 lister payout surfaced in the
 *   lister pitch and pricing strip.
 * - No verification step of any kind at signup (PRD dropped even
 *   DigiLocker for MVP) — copy now says "no approval wait" instead of
 *   claiming any ID/ DigiLocker check, since that's not what's shipping.
 * - Hero badge names the launch city: Kanpur.
 *
 * Drop this in as app/(marketing)/page.tsx. Requires Tailwind CSS
 * configured in the project — styling uses utility classes with a few
 * arbitrary hex values, no theme changes needed to drop it in.
 */

const INK = "#20304D";
const PAPER = "#F5EFE0";
const MARIGOLD = "#E8A33D";
const CORAL = "#E1573F";
const SAGE = "#7C9070";

export default function Home() {
  return (
    <div style={{ backgroundColor: PAPER, color: INK }}>
      {/* subtle paper grain */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.05] mix-blend-multiply"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #20304D 1px, transparent 0)",
          backgroundSize: "22px 22px",
        }}
      />

      {/* ---------- NAV ---------- */}
      <header className="relative z-10 border-b border-[#20304D]/15">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <a href="#" className="flex items-center gap-2">
            <BookmarkMark className="h-7 w-7" color={CORAL} />
            <span
              style={{ fontFamily: "var(--font-caveat)" }}
              className="text-3xl font-semibold tracking-tight"
            >
              Readoodle
            </span>
          </a>

          <nav className="hidden items-center gap-8 text-[15px] font-medium md:flex">
            <a href="/browse" className="hover:opacity-70">Browse books</a>
            <a href="#how" className="hover:opacity-70">How it works</a>
            <a href="#doodles" className="hover:opacity-70">The doodle thing</a>
            <a href="#lister" className="hover:opacity-70">Become a lister</a>
          </nav>

          <div className="flex items-center gap-3">
           <a href="/login" className="hidden text-[15px] font-medium hover:opacity-70 sm:inline">
              Log in
            </a>
          <StampButton href="/signup">Join Readoodle</StampButton>
          </div>
        </div>
      </header>

      {/* ---------- HERO ---------- */}
      <section className="relative z-10 mx-auto grid max-w-6xl gap-12 px-6 pb-20 pt-16 md:grid-cols-2 md:items-center md:pt-24">
        <div>
          <span
            className="inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest"
            style={{ backgroundColor: `${SAGE}22`, color: SAGE }}
          >
            Now picking up in Kanpur
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
            Readoodle is a book-rental marketplace — from our shelves or your
            neighbour&rsquo;s, priced fairly by whoever owns the book. Every
            rental comes with a little hand-doodled bookmark, because a book
            you&rsquo;re returning deserves a reason to smile.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <StampButton href="/browse" filled>Browse books</StampButton>
            <a
              href="#lister"
              className="text-[15px] font-semibold underline decoration-dashed decoration-2 underline-offset-4 hover:opacity-70"
            >
              List your own books →
            </a>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#20304D]/60">
            <span style={{ fontFamily: "var(--font-plex-mono)" }}>Rental ≤ 50% of book price</span>
            <Dot />
            <span style={{ fontFamily: "var(--font-plex-mono)" }}>₹100 deposit</span>
            <Dot />
            <span style={{ fontFamily: "var(--font-plex-mono)" }}>No approval wait</span>
          </div>
        </div>

        {/* Book stack + bookmark peeking out, signature visual */}
        <div className="relative mx-auto h-[380px] w-[300px]">
          <BookCard rotate={-6} top={70} color="#5B7B9A" title="The Bell Jar" />
          <BookCard rotate={4} top={30} color={SAGE} title="Norwegian Wood" />
          <BookCard rotate={-2} top={0} color={CORAL} title="Circe" />

          {/* the due-date bookmark, tilted, sticking out of the top book */}
          <div
            className="absolute -right-6 top-[-28px] w-40 rotate-[10deg] border-2 border-dashed bg-[#FBF7EC] px-4 py-3 shadow-md"
            style={{ borderColor: INK }}
          >
            <p
              style={{ fontFamily: "var(--font-caveat)", color: CORAL }}
              className="text-2xl leading-none"
            >
              hi, reader!
            </p>
            <p
              style={{ fontFamily: "var(--font-plex-mono)" }}
              className="mt-2 text-[11px] uppercase tracking-widest text-[#20304D]/60"
            >
              due back
            </p>
            <p style={{ fontFamily: "var(--font-plex-mono)" }} className="text-sm">
              14 days from today
            </p>
          </div>
        </div>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section id="how" className="relative z-10 border-y border-[#20304D]/15 bg-[#EFE7D2]">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 style={{ fontFamily: "var(--font-caveat)" }} className="text-4xl font-semibold">
            How a rental actually works
          </h2>

          <div className="mt-12 grid gap-10 md:grid-cols-3">
            <Step n="01" title="Find a book nearby">
              Search the catalog or browse by pickup point — ours, or a
              fellow reader&rsquo;s a few streets over.
            </Step>
            <Step n="02" title="Rent it, priced fairly">
              Every owner sets their own price — rental can never exceed
              half the book&rsquo;s value. Pay that plus a one-time ₹100
              membership deposit and you&rsquo;re renting — no waiting,
              no approval.
            </Step>
            <Step n="03" title="Return it, keep the doodle">
              Drop it back at the same pickup point. The bookmark that came
              with it? That one&rsquo;s yours to keep.
            </Step>
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

      {/* ---------- BECOME A LISTER ---------- */}
      <section id="lister" className="relative z-10 border-y border-[#20304D]/15" style={{ backgroundColor: INK }}>
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-20 md:grid-cols-2">
          <div>
            <h2
              style={{ fontFamily: "var(--font-caveat)" }}
              className="text-4xl font-semibold text-[#F5EFE0]"
            >
              Got books gathering dust?
            </h2>
            <p className="mt-4 max-w-md text-[#F5EFE0]/75">
              List them on Readoodle and keep 98% of every rental — we take
              a flat 2% cut, nothing more. Flip the &ldquo;list your
              books&rdquo; toggle in your profile, set your pickup point and
              price, and start earning right away — no waiting, no approval.
            </p>
            <div className="mt-8">
              <StampButton href="/lister" filled inverted>
                Start listing
              </StampButton>
            </div>
          </div>

          <ul className="space-y-4 text-[#F5EFE0]/90">
            {[
              "Set your own pickup point — your home, shop, or a cafe you trust.",
              "Set your own price — rental capped at 50% of your book's value, deposit at 100%.",
              "Get paid automatically — we collect the payment, take our flat 2% cut, and release the rest to you within 2 days of pickup.",
              "Damage or loss is covered by the renter's deposit, not your pocket.",
            ].map((item) => (
              <li key={item} className="flex gap-3 border-b border-[#F5EFE0]/15 pb-4">
                <span style={{ color: MARIGOLD }} className="mt-1 text-lg leading-none">✓</span>
                <span className="text-sm leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- PRICING STRIP (the "due date card" motif again) ---------- */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-20">
        <div
          className="mx-auto max-w-3xl border-2 border-dashed p-8 text-center"
          style={{ borderColor: INK, backgroundColor: "#FBF7EC" }}
        >
          <p
            style={{ fontFamily: "var(--font-plex-mono)" }}
            className="text-xs uppercase tracking-[0.2em] text-[#20304D]/60"
          >
            the fine print, kept short
          </p>
          <div
            style={{ fontFamily: "var(--font-plex-mono)" }}
            className="mt-6 grid gap-6 text-sm sm:grid-cols-2 lg:grid-cols-4"
          >
            <PriceLine label="Rental" value="Set by owner, ≤ 50% of book price" />
            <PriceLine label="Security deposit" value="Set by owner, ≤ book price" />
            <PriceLine label="Membership deposit" value="₹100, one-time" />
            <PriceLine label="Late return" value="₹10 / day, no cap" />
          </div>
          <p
            style={{ fontFamily: "var(--font-plex-mono)" }}
            className="mt-6 text-xs text-[#20304D]/50"
          >
            Readoodle takes a flat 2% commission on every rental. That&rsquo;s the whole business model.
          </p>
        </div>
      </section>

      {/* ---------- FOOTER ---------- */}
      <footer className="relative z-10 border-t border-[#20304D]/15">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 sm:flex-row">
          <div className="flex items-center gap-2">
            <BookmarkMark className="h-5 w-5" color={CORAL} />
            <span style={{ fontFamily: "var(--font-caveat)" }} className="text-xl font-semibold">
              Readoodle
            </span>
          </div>
          <p className="text-xs text-[#20304D]/60">
            © {new Date().getFullYear()} Readoodle. Books borrowed, doodles kept.
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ---------- small building blocks ---------- */

function Dot() {
  return <span className="h-1 w-1 rounded-full bg-[#20304D]/30" />;
}

function StampButton({
  href,
  children,
  filled = false,
  inverted = false,
}: {
  href: string;
  children: React.ReactNode;
  filled?: boolean;
  inverted?: boolean;
}) {
  const base =
    "inline-flex items-center gap-2 rounded-sm border-2 px-5 py-2.5 text-[15px] font-semibold transition-transform hover:-translate-y-0.5";
  if (inverted) {
    return (
      <a
        href={href}
        className={`${base}`}
        style={{ borderColor: "#F5EFE0", backgroundColor: filled ? "#F5EFE0" : "transparent", color: filled ? INK : "#F5EFE0" }}
      >
        {children}
      </a>
    );
  }
  return (
    <a
      href={href}
      className={base}
      style={{
        borderColor: INK,
        backgroundColor: filled ? INK : "transparent",
        color: filled ? PAPER : INK,
      }}
    >
      {children}
    </a>
  );
}

function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div>
      <span
        style={{ fontFamily: "var(--font-plex-mono)", color: MARIGOLD }}
        className="text-sm font-medium"
      >
        {n}
      </span>
      <h3 className="mt-2 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[#20304D]/75">{children}</p>
    </div>
  );
}

function DoodleCard({
  eyebrow,
  title,
  body,
  accent,
}: {
  eyebrow: string;
  title: string;
  body: string;
  accent: string;
}) {
  return (
    <div className="border border-[#20304D]/15 bg-[#FBF7EC] p-7">
      <span
        style={{ fontFamily: "var(--font-plex-mono)", color: accent }}
        className="text-xs font-medium uppercase tracking-widest"
      >
        {eyebrow}
      </span>
      <h3 style={{ fontFamily: "var(--font-caveat)" }} className="mt-3 text-3xl font-semibold">
        {title}
      </h3>
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

function BookCard({
  rotate,
  top,
  color,
  title,
}: {
  rotate: number;
  top: number;
  color: string;
  title: string;
}) {
  return (
    <div
      className="absolute left-1/2 flex h-64 w-44 -translate-x-1/2 flex-col justify-end rounded-sm p-4 shadow-xl"
      style={{ top, transform: `translateX(-50%) rotate(${rotate}deg)`, backgroundColor: color }}
    >
      <p
        style={{ fontFamily: "var(--font-caveat)" }}
        className="text-2xl font-semibold leading-tight text-[#F5EFE0]"
      >
        {title}
      </p>
    </div>
  );
}

function BookmarkMark({ className, color }: { className?: string; color: string }) {
  return (
    <svg viewBox="0 0 24 32" fill="none" className={className}>
      <path
        d="M2 2h20v27l-10-7-10 7V2z"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
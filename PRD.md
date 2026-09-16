# Product Requirements Document (PRD) — Readoodle v2.0

**A lean, revenue-focused book rental marketplace — now with author-direct ebook sales.**

---

## 1. Executive Summary

**Readoodle** is a marketplace for renting physical books instead of buying them, built on a single Next.js codebase. Users pay ₹50 for 7 days per book. Every rental includes a hand-doodled bookmark. Listers earn 98% of every rental.

**v2.0 adds a second, complementary revenue line: direct ebook sales from self-published and regional-language authors**, reusing Readoodle's existing users, listers, pickup-point network, and Razorpay/UPI payout rails. No new app, no new brand, no new trust to build from zero — same "books" audience, same city, same infra.

### Why This Fits Readoodle (Not a Separate Product)
- Readoodle already has book-loving users in Kanpur who will convert easily to "buy the ebook" as an upsell alongside "rent the physical copy."
- Listers are already individuals who own and care about books — a natural bridge to self-published local authors wanting a distribution channel.
- Pickup points already function as informal community book hubs — perfect physical touchpoints for a "local author spotlight" shelf, digital or physical.
- Payments, payouts, and admin tooling are already built. Ebooks add a content type, not new infrastructure.

### What This Is Not
This is **not** a data-scraping or PDF-vault play. Every ebook on Readoodle falls into one of two clean categories:
1. **Public domain / open-license** text (verified, small curated set — used for catalog depth and demos).
2. **Author-licensed** — a real self-published or small-press author explicitly signs a one-page agreement and earns a royalty on every sale.

No ebook is added without a resolved rights status. This is a structural rule, enforced in the schema (see §5), not just a policy.

---

## 2. Business Model at a Glance (Updated)

| Line | Metric | Value |
|---|---|---|
| **Physical Rental** | Rental Price | ₹50 / 7 days |
| | Lister Payout | 98% (flat 2% commission) |
| | Late Fine | ₹10/day uncapped |
| **Ebook Sales (New)** | Price | Author-set, typically ₹20–₹99 (regional ebook pricing norm) |
| | Author Royalty (Track B) | 70% |
| | Platform Commission | 15% |
| | Referring Pickup Point Bonus | 15% (see §3.3) |
| | Public Domain Ebook Price | ₹10–₹20 flat (curation/formatting fee only, no royalty) |
| | PD Split | 60% Platform / 40% Pickup Point |

The ebook line doesn't replace the rental economics — it rides alongside it, using the same checkout, same accounts, same payout batch.

---

## 3. Ebook Module — What's New

### 3.1 Two Content Tracks

**Track A — Public Domain / Open License**
- Sourced from Wikisource, NDLI-verified-clean items, or explicit CC-licensed text.
- No royalty owed. Used to seed the catalog fast and cheap (target: 100–200 titles at launch).
- **Do not attempt to scrape or scan indiscriminately** — verified PD Indic text is a small, curated pool, not a large one. Treat this as demo/proof content, not the growth engine.

**Track B — Author-Licensed (the real growth line)**
- Self-published/regional authors sign a simple one-page agreement: rights granted, 70% royalty, revocable any time.
- Author provides their own manuscript file (usually already have a Word/PDF — no scanning needed for most of this volume).
- This is where real catalog growth comes from. Target: 10–20 pilot authors in the first phase.

### 3.2 Why Authors Say Yes (reuse Readoodle's existing playbook from §6.3 of v1 — direct outreach works)
- 70% royalty (beats Kindle's typical regional-language net take).
- No exclusivity required to start.
- Simple onboarding, fast payout cadence (same T+2 rails already built for listers).
- Local distribution: their book appears at pickup points readers already trust, not just buried in an app store.

### 3.3 Pickup Points Become Ebook Nodes Too
- Existing Readoodle pickup points (home/shop/café listers already using the app) can opt in as **"Featured Shelf" nodes**: a QR code at the physical pickup point links to that node's curated ebook picks (local author spotlight).
- A pickup point that drives an ebook sale via its QR/referral link earns a **15% referral bonus** on Track B sales (bookstore-style — see original Kavach revenue logic), reusing the payout rails already built for lister payouts.
- This is optional and additive — a rental-only pickup point loses nothing by not participating.

### 3.4 Delivery & Access Control (No DRM Theater, Just Standard Practice)
- Ebook purchases are tied to the buyer's existing Readoodle account (already authenticated via NextAuth.js).
- Delivery via a short-lived signed download URL (Vercel/S3 signed link, expiring after use or N hours) — not a permanent public file.
- Optional lightweight watermark (buyer email/ID stamped into the PDF footer) to discourage casual redistribution — cheap to implement, no need for heavier DRM at MVP scale.
- Nothing here requires hiding files from the internet or avoiding standard hosting — the content is licensed, so normal signed-URL delivery is sufficient and legally uncomplicated.

---

## 4. Core Features (MVP Additions to Existing Stack)

### 4.1 Author Onboarding (New)
- Simple form: name, contact, UPI ID (reuse existing lister payout field), manuscript upload, one-page licensing agreement (e-signed via a basic checkbox + typed name confirmation — no need for a heavy e-sign vendor at this scale).
- Admin reviews and marks `rights_verification.status = verified` before the title can go live — manual gate at this volume, same pattern as the existing manual rental approval.

### 4.2 Ebook Catalog (New, alongside existing Book Browse)
- New content type on existing `books` collection (or a parallel `ebooks` collection) — same catalog page, filterable by "Rent Physical" vs "Buy Ebook."
- Track A titles marked `rights_type: public_domain`, Track B marked `rights_type: author_licensed`.

### 4.3 Checkout (Extends Existing Razorpay Flow)
- Same Razorpay integration already live for deposits/rentals — ebook purchase is just a new product type in the same payment flow.
- On success: generate signed delivery URL, apply watermark, log to `customer_licenses`.

### 4.4 Author Dashboard (Extends Existing Lister Dashboard)
- Reuse the Lister Dashboard UI pattern: "My Titles," "Earnings So Far," "Payout Status (T+2)."
- Authors see the same trusted, transparent payout experience listers already get.

### 4.5 Admin Panel (Extends Existing Admin)
- New tab: **Rights Verification Queue** — pending author agreements, PD source citations, approve/reject.
- New tab: **Ebook Payouts** — batch release alongside existing lister payout batching.

---

## 5. Database Schema Additions

```js
// Extends existing MongoDB collections — same DB, same patterns as v1

rights_verification: {
  book_id, rights_type: enum('public_domain','author_licensed'),
  author_death_year, license_type, source_citation,  // Track A
  verified_status: enum('pending','verified','rejected'),
  verified_by, verified_date
}

licensing_agreements: {
  book_id, author_id, upi_id, royalty_pct: 70,
  rights_granted, revocable: true, start_date, status
}

ebook_listings: {
  ebook_id, rights_verification_id, price, file_url,
  featured_pickup_point_id: nullable,  // for referral bonus tracking
  active: boolean
}

customer_licenses: {
  customer_id, ebook_id, purchase_date, signed_url_token, watermark_id
}

ebook_sales: {
  ebook_id, sale_date, price, platform_share, author_share, pickup_point_referral_share
}
```

**Hard rule enforced at the query/insert layer:** an `ebook_listings` row cannot be created unless a matching `rights_verification.verified_status = 'verified'` row exists. This should be a database constraint or a guarded API check, not just a process — the same discipline as Readoodle's existing "no guest checkout" rule.

---

## 6. Roadmap (Fits Inside Existing Phase Structure)

### Phase 1: Ebook Module MVP (Weeks 1–4, runs alongside existing Phase 1 hardening)
- [ ] Build `rights_verification`, `licensing_agreements`, `ebook_listings` schema
- [ ] Seed 100–200 Track A (public domain) titles from Wikisource
- [ ] Build author onboarding form + one-page agreement flow
- [ ] Recruit 5–10 pilot Track B authors via direct outreach (same playbook as v1 §6.3: WhatsApp groups, book fairs, ask existing listers who they know)
- [ ] Extend checkout for ebook purchase; signed-URL delivery + watermark
- [ ] Extend Lister Dashboard pattern for authors

**Milestone:** at least 5 real author-licensed ebooks live and purchasable, not just PD filler.

### Phase 2: Pickup Points as Ebook Nodes (Weeks 5–8)
- [ ] "Featured Shelf" QR code flow at opted-in pickup points
- [ ] Referral bonus tracking + payout extension
- [ ] Scale Track B to 20–50 authors using Phase 1 pilots as proof/testimonials

### Phase 3: Scale (Month 3+)
- [ ] Approach 1–3 small regional publishers with real revenue data from Track B as proof
- [ ] Evaluate demand for an AI-training sandbox access tier on the opted-in corpus (separate consent required — not bundled with retail rights)

---

## 7. Success Metrics (Ebook Module)

| Metric | Target (Month 1) | Target (Month 3) |
|---|---|---|
| PD titles live | 100–200 | 300–500 |
| Author-licensed titles live | 5–10 | 30–50 |
| Ebook sales/month | 20–50 | 200–500 |
| Author retention (repeat listing) | — | 60%+ |
| Pickup points opted into "Featured Shelf" | 2–3 | 8–10 |
| Zero unresolved-rights titles in system | ✅ enforced structurally | ✅ |

---

## 8. What NOT to Build (Scope Lock, Extends v1 §8.3)

- **No content scraping or bulk PD aggregation** — the pool is small; don't waste engineering time chasing volume that isn't there.
- **No bundling retail-sale consent with AI-training consent** — always separate opt-ins if the sandbox tier is ever built.
- **No heavy DRM** — signed URLs + light watermarking is sufficient; anything more is engineering effort the MVP doesn't need.
- **No exclusivity requirements for authors at pilot stage** — let them keep selling elsewhere too; exclusivity kills early sign-up.
- **No separate app or brand** — this lives inside Readoodle's existing Next.js codebase, database, and payout rails. If it ever outgrows that, that's a Month 6+ problem, not a Week 1 problem.

---

## 9. Legal & Trust Principles (Non-Negotiable)

1. No ebook enters the catalog without a resolved, recorded rights status (PD citation or signed author agreement).
2. Authors can revoke access any time; enforced within 48 hours.
3. Pickup points/listers are never asked to misrepresent the origin of any content.
4. All delivery mechanisms (signed URLs, watermarking) exist to enforce legitimate purchases, not to conceal anything — there is nothing in the catalog that needs hiding.
5. Rights-verification records are auditable on request — this is a credibility asset for pitching authors, pickup points, and (later) publishers.

---

**Document Status:** Draft — Ebook Module Addition
**Base Document:** Readoodle PRD v1 (MVP Complete)
**Owner:** Readoodle Team
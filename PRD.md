# Product Requirements Document (PRD)

## Product Name
**Readoodle** — A Book Rental Website

---

## 1. Overview

Readoodle is an online **marketplace** for renting physical books instead of buying them. Books can come from two sources:
1. **Readoodle's own inventory**, fulfilled through Readoodle-operated pickup points.
2. **Third-party listers** (any individual or small business) who list their own books for rent, fulfilled through their own pickup point.

Every rental includes a doodle bookmark — but the *type* of bookmark depends on the source (see §3.4), making Readoodle's own listings extra appealing without restricting who can list.

### Vision
Make reading affordable and fun by removing the cost/commitment barrier of buying books, while building a recognizable, playful brand around the "doodle bookmark" perk.

### Problem Statement
- Buying books is expensive, and many readers only read a book once.
- Existing rental options (libraries, secondhand marketplaces) are slow, inconvenient, or lack a delightful, memorable experience.
- Readers who love physical books want a low-friction way to read more without owning more.

### Goals
- Launch an MVP website where users can browse, rent, return, and re-rent books.
- Every rental includes a doodle bookmark shipped with the book.
- Build brand recall through the doodle bookmark collectible angle (users may want to "collect the set").

### Non-Goals (for MVP)
- No ebook/audiobook rentals (physical books only, initially).
- No shipping/courier fulfillment at launch — pickup-only, in person, at Readoodle or lister pickup points.
- No international reach at launch (single city/region, TBD).

---

## 2. Target Users

| Persona | Description | Needs |
|---|---|---|
| Casual Reader | Reads occasionally, doesn't want to own books | Cheap, easy rentals |
| Book Lover / Collector | Reads a lot, budget-conscious | Frequent rentals, loyalty perks, bookmark collecting |
| Student | Needs textbooks/novels temporarily | Short-term, affordable rentals |
| Gifter | Wants to gift a "reading experience" | Gift subscriptions/rental credits |

---

## 3. Core Features (MVP)

### 3.1 Browse & Discover
- Book catalog with search, filters (genre, author, price, availability, **pickup point/location**), and sorting.
- Book detail page: cover, description, author, condition, rental price, availability status, **lister (Readoodle or third-party) and their pickup point**.

### 3.2 Marketplace: Multiple Pickup Points & Listers
- **Anyone can become a lister** — there's no separate lister signup. Every user registers once as a Readoodle member; a **toggle in their profile ("List your books")** turns on lister mode and unlocks the "Add a book" flow.
- Each lister operates from their own **pickup point** (their registered address). Readoodle itself also operates its own pickup point(s) in the same way, listing from its own inventory under the same system.
- Renters browse by book or by nearby pickup point.
- Listers **set their own rental price and security deposit per book** within platform limits (see §7 Pricing Model) — no fixed platform-wide rate.
- Readoodle takes a **flat 2% commission** on every rental transaction, regardless of whether the book came from Readoodle's own inventory or a lister.
- Signup requirements (name, address, phone) are identical for everyone — there's no separate approval workflow for listers (see §7 Membership).
- Admin panel needs a **listings management view**: see all active listings (Readoodle's and listers'), track disputes, and flag problem accounts.
- **Liability:** Readoodle is **not responsible for third-party listings** — the condition of a lister's book, and any dispute arising from renting it, is between the renter and that lister. Readoodle facilitates discovery, payment, and payouts, but doesn't guarantee third-party listings the way it stands behind its own inventory.

### 3.3 Rent a Book
- "Rent Now" flow: select rental duration (in weeks), see price, checkout.
- Pickup location confirmed at checkout (Readoodle point or third-party lister's point).
- Order confirmation showing rental due date and pickup details.

### 3.4 Account & Rental Management
- Sign up / login (email, optionally Google OAuth).
- "My Rentals" dashboard: active rentals, due dates, return/renew/extend options.
- Rental history.

### 3.5 Doodle Bookmark Perk (Two-Tier)
This is Readoodle's signature differentiator, and it's designed to make renting **directly from Readoodle** more attractive than renting via a third-party lister — without needing to restrict who can list:

| Rental Source | Bookmark Given |
|---|---|
| **Rented from Readoodle's own inventory** | A **physical doodle bookmark**, handed over at pickup — one design from a themed set (e.g., "Season 1: Animals"). |
| **Rented from a third-party lister** | A **digital doodle** (PDF/image) sent to the renter, which they can print at home themselves. |

- Physical bookmark designs are made in Canva (no drawing required — using doodle-style asset packs) and printed in bulk ahead of time.
- Digital doodles are the same designs, delivered as downloadable/printable files instead of physical items (near-zero fulfillment cost for third-party-sourced rentals).
- Optional: "My Bookmark Collection" page showing which designs (physical or digital) a user has collected, to encourage repeat rentals — and to nudge users toward Readoodle's own listings for the "real" physical version.

### 3.6 Returns
- Drop-off at the same pickup point the book was collected from (Readoodle point or lister's point).
- Automated reminders before due date (email/SMS).
- Late fine logic (₹10/day, see §7 Pricing Model).

### 3.7 Payments & Payouts
- Rental fee at checkout, calculated from the price the lister (or Readoodle) set for that book.
- One-time ₹100-style security deposit at membership signup, plus the per-book deposit rule (see §7).
- Support for common payment gateways (Razorpay/Stripe depending on region).
- **All rental payments (rental fee + per-book deposit) are collected by Readoodle first**, into a central Readoodle-controlled account — the renter never pays a lister directly.
- Readoodle takes its **flat 2% commission** off the top, then **releases the remaining payout to the lister on a T+2 days basis** (i.e., two days after the rental transaction/pickup is confirmed).
- Readoodle's own inventory rentals don't need a payout step — the full amount (minus nothing, since there's no commission on itself) stays with Readoodle.
- Payout status (pending / released) should be visible to listers in their dashboard, and trackable in the admin panel.

### 3.8 Admin Panel (internal)
- Add/edit/remove books and inventory (Readoodle's own).
- View all listings across the platform — Readoodle's and listers' — and flag/remove problem listings.
- Track which physical copy is rented to whom, from which pickup point, and its due date.
- Manage doodle bookmark sets — both physical stock and digital file library.
- View orders, returns, overdue rentals, and outstanding fines.
- **Track lister payouts**: amount owed, T+2 release date, payout status (pending/released), and a log of completed payouts.
- Handle damage/loss cases (forfeit deposit + charge recovery — see §7).

---

## 4. Doodle Bookmark Workflow (Operational, not code)
1. Design bookmark sets in Canva (using doodle-style assets/elements — no drawing needed).
2. Export designs, get printed in bulk (local printer or print-on-demand).
3. Pack one bookmark into every outgoing rental order.
4. Track which design number ships with which order (for the "collection" feature, optional).

---

## 5. Success Metrics
- Number of active rentals per month.
- Repeat rental rate (retention).
- Average rentals per user.
- Bookmark "collection completion" rate (engagement metric, if gamification is added).
- Return-on-time rate.
- Lister payout turnaround (should reliably land within the T+2 window).

---

## 6. Tech Considerations (high-level, not prescriptive)
- **Frontend:** Simple, clean web app (catalog, cart/checkout, account dashboard).
- **Backend:** Book inventory, rental/order management, user accounts, payout scheduling (T+2 job).
- **Database:** Books, Users, Orders/Rentals, Bookmark Designs, Inventory copies, Payouts.
- **Payments:** Third-party gateway integration, with Readoodle as the collecting party and a scheduled payout/transfer step to listers.
- **Logistics:** Shipping/return label integration or manual local pickup process, depending on business model.

---

## 7. Pricing Model

Every book listed on Readoodle (whether from Readoodle's own inventory or a lister's shelf) has a **book price** — the value the owner assigns to that copy. Rental price and security deposit for that book are then set by the owner, within platform limits:

| Item | Rule |
|---|---|
| Book price | Set by the owner (Readoodle or lister) — the assigned value of that copy. |
| Rental price | Set by the owner, **capped at 50% of the book price** per week. |
| Security deposit (per rental) | Set by the owner, **capped at 100% of the book price** (i.e., cannot exceed it). |
| Membership deposit | **₹100**, one-time, paid once at signup — separate from the per-rental security deposit above. |
| Late fine | **₹10 / day** past due date. **No cap** — the fine keeps accruing, by design, so renters have a real incentive to respect deadlines rather than treat lateness as a fixed, absorbable cost. |
| Platform commission | **Flat 2%** on every rental transaction, taken automatically at checkout — applies uniformly whether the book is Readoodle's own or a lister's. |
| Lister payout timing | **T+2 days** after the rental is confirmed — Readoodle collects the full payment first, deducts its 2% commission, and releases the rest to the lister. |

- Owners (Readoodle or a lister) set a book's price when listing it; the rental price and security deposit fields are validated against that price at listing time (rental ≤ 50%, deposit ≤ 100%).
- This keeps pricing flexible per book — a well-loved paperback and a pricier hardcover don't have to rent for the same amount — while the caps prevent an owner from setting an unreasonably high rental price or deposit relative to what the book is actually worth.
- Cart/checkout and "My Rentals" pages should show: rental cost so far, due date, deposit held, and live late-fine accrual if overdue.
- Admin panel should auto-calculate and display outstanding fines per active rental, and flag any listing that violates the pricing caps.

### Damage / Loss Policy
- If a rented book is **damaged or lost**:
  - The rental's security deposit is forfeited.
  - **Full recovery of the book's price** is additionally charged to the user (the deposit does not offset this — it's forfeited *plus* the full book price is recovered).
- For third-party (lister) rentals, this dispute is between the renter and the lister — Readoodle is not responsible for the outcome (see §3.2 Liability), though the platform still facilitates the deposit forfeiture and charge mechanics.
- Admin panel needs a "mark as damaged/lost" action on a rental that: forfeits the deposit, generates a recovery charge for the book's listed price, and flags the user account.

### Membership
- Security deposit is tied to **membership**, not individual rentals — paid once at signup.
- To activate membership, user must provide at signup:
  - Full name
  - Address
  - Phone number
- **No physical/in-person address verification step.** Membership is active as soon as signup details are provided and the ₹100 deposit is paid — the user can rent (or list) immediately after that, with no waiting period or manual approval.
- The same signup process applies uniformly to listers — there's no separate lister approval process (see §3.2).
- **No subscription model.** Readoodle is pay-per-rental only; the per-week pricing already keeps it cheap, so there's no membership tier planned.

## 8. Launch Plan
- **Launch city: Kanpur, Uttar Pradesh.**
- Readoodle's own inventory + pickup point(s) go live first in Kanpur; lister onboarding (via the profile toggle) opens from day one rather than being gated behind a waitlist.

## 9. Open Questions
- **Cold-start / chicken-and-egg problem remains unresolved:** with no separate lister approval gate, the plan is to let both renters and listers join Kanpur from day one — but there's no seeding strategy yet for making sure there are enough listings before there are renters (or vice versa). Worth deciding: does Readoodle stock its own inventory heavily at launch to have something to rent regardless of lister turnout?
- How many Readoodle-owned copies/titles at launch in Kanpur?
- Does the 2% commission apply to the rental price only, or also to any late fines collected?
- With no in-person ID check, is there any lightweight fraud/no-show mitigation needed at pickup (e.g., showing an order confirmation on a phone), or is that out of scope entirely for MVP?
- T+2 payout: does the clock start at pickup confirmation, at rental checkout, or at return — needs to be pinned down for the payout scheduling job.

---

## 10. Future Ideas (Post-MVP)
- Referral program (rent more, unlock rare bookmark designs).
- Loyalty program tied to bookmark collection.
- Community reviews/ratings on books and listers.
- Wishlist / notify-when-available for popular books.
- A seeding strategy for new cities beyond Kanpur, once the cold-start approach here is proven out.
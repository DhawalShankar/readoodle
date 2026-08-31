# Product Requirements Document (PRD) — Readoodle

**A lean, revenue-focused book rental marketplace built on Next.js.**

---

## 1. Executive Summary

**Readoodle** is a marketplace for renting books instead of buying them. Users pay **₹50 for 7 days** per book — period. Every rental includes a hand-doodled bookmark. Listers earn **98% of every rental** (we take a flat 2% commission). Readoodle is designed to scale profitably on a single Next.js codebase, operating from one or more pickup points in one or more cities.

### Vision
Make reading affordable, remove the commitment barrier of buying, and build a memorable brand around collectable doodle bookmarks — all while generating predictable recurring revenue with minimal operational overhead.

### Launch City
**Kanpur, Uttar Pradesh.** Pickup-only, in-person fulfillment, no shipping at MVP.

---

## 2. Business Model at a Glance

| Metric | Value |
|--------|-------|
| **Rental Price** | ₹50 per book, per 7 days (fixed platform-wide) |
| **Security Deposit** | ₹500 one-time per user (paid once on profile, unlocks all rentals) |
| **Late Fine** | ₹10/day, uncapped (strong incentive to return on time) |
| **Platform Commission** | Flat 2% on every rental transaction |
| **Lister Payout** | 98% of rental price, released T+2 days after pickup confirmed |
| **Bookmark Cost** | ₹2-5 per bookmark (bulk printed), included in rental |
| **Target Margin** | ~₹8-15 per rental after bookmark and operations cost |

### Revenue Per Rental (Example)
```
Renter pays: ₹50
↓
Readoodle takes: ₹1 (2% commission)
Readoodle pays lister: ₹49 (T+2)
Readoodle keeps: ₹1 - ₹4 (bookmark cost) = -₹3 to ₹1
```

**Profitability comes from:**
- **Volume**: 100 rentals/month in one city = ₹200 commission/month. 5 cities × 500 rentals/month = ₹5,000/month.
- **Late fees**: Uncapped ₹10/day late fines accumulate to ₹50-100+ per overdue rental. 10% overdue rate → significant secondary revenue.
- **Readoodle's own inventory**: We can list our own books from our own pickup point and keep **100% of rental** (no payout), minus bookmark cost.
- **Membership upgrades** (future): Optional "unlimited rentals" plan, referral bonuses, etc.

---

## 3. Core Features (MVP — Live & Working)

### 3.1 Authentication & Membership
- Email/password signup (NextAuth.js)
- One-time ₹500 security deposit payment (Razorpay)
- Membership unlocks renting and listing immediately — no approval gate
- Profile stores name, email, address, phone (for pickup coordination)

### 3.2 Browse & Rent
- **Book catalog**: search, filter by availability, sorted by recent
- **Book detail**: title, author, condition, lister (Readoodle or user), pickup location, price (always ₹50/7 days)
- **One-click checkout**: select rental duration, confirm pickup point, pay ₹50 + any prior late fees
- **Rental confirmation**: due date displayed with doodle bookmark card (design: dashed-border index card, rotated at angle, hand-drawn text)
- **Only approved rentals show on homepage** (not pending admin approval)

### 3.3 My Account
- **Active Rentals**: list of books being rented, due date, days remaining, option to extend/renew
- **Rental History**: past rentals for re-renting
- **Security Deposit Status**: shows ₹500 paid, used as unlock for all future rentals
- **Bookmarks Collected** (future): visual gallery of doodle designs collected

### 3.4 Lister Dashboard
- **Add Books**: upload book details (title, author, ISBN, condition)
- **My Listings**: active books, number of times rented, earnings so far
- **Earnings & Payouts**: see how much is owed (T+2 pending) and when it will be released
- **Pickup Point**: users specify one pickup location (their address) — all their books are picked up there

### 3.5 Admin Panel
- **User Management**: view all users, security deposit status, flags
- **Book Inventory**: all books (Readoodle's + listers'), track active rentals, mark as damaged
- **Rental Approvals**: new rental requests → approve/reject (confirmation triggers T+2 payout countdown)
- **Payouts**: see which listers are owed money, batch release payouts
- **Analytics**: monthly rentals, commission earned, late fees collected, top books/listers

### 3.6 Doodle Bookmarks
- **Physical bookmarks** (Readoodle's inventory): printed in bulk, handed at pickup
- **Digital bookmarks** (Lister's books): PDF sent via email after return, renter prints at home
- Same designs in both formats, seasonal sets (e.g., "August Animals", "September Stars")
- Branding: dashed-border index card, hand-drawn style, fits the library due-date card motif

---

## 4. Current Tech Stack (Production-Ready)

- **Frontend**: Next.js 16 (App Router, "use client" components), React, Tailwind CSS
- **Backend**: Next.js API Routes (server-side rendering + API endpoints in same codebase)
- **Database**: MongoDB (single collection pattern, simple schemas)
- **Auth**: NextAuth.js with JWT sessions
- **Payments**: Razorpay (payment collection + webhook handling)
- **Hosting**: Vercel (serverless, auto-scaling, no DevOps needed)

**No separate services needed**: one Node.js/Next.js app, one MongoDB database, one Razorpay account.

---

## 5. Key Design Decisions (Why We're Profitable)

### 5.1 Fixed Pricing = Simplicity
- **No per-lister pricing negotiations.** Everyone's book rents for ₹50/7 days. Removes complex pricing logic, dashboard clutter, and customer confusion.
- **Listers know exactly what they earn** (₹49 per rental, T+2) — predictable revenue attracts more listers.

### 5.2 Pickup-Only = Zero Shipping Costs
- **No couriers, no fulfillment center, no packaging logistics.** Renters and listers coordinate pickup in person.
- **Profit is immediate**: ₹50 in, ₹1 commission + ₹3 bookmark = ₹4 net per rental. Scales linearly with volume.

### 5.3 One-Time Security Deposit = Conversion Funnel
- **₹500 one-time, not per rental** → low friction for repeat renters
- **₹500 paid once unlocks unlimited rentals** → incentive to keep using the platform
- **Security deposit is refundable** → reduces trust barrier for first-timers

### 5.4 Uncapped Late Fines = Behavioral Economics
- **₹10/day compounds:** missing a 7-day deadline by 3 days = +₹30 fine (60% price increase)
- **Renters are motivated to return on time** instead of treating it as optional
- **Secondary revenue stream** when people are late (5% of people late → 5% extra revenue per month)

### 5.5 Flat 2% Commission = Lister Attraction
- **2% is standard-to-generous** compared to other marketplaces (Airbnb takes 3%, eBay 12%, DoorDash 25%)
- **Listers see that Readoodle isn't skimming** — they keep 98% motivates quality inventory

### 5.6 T+2 Payouts = Cash Flow Control
- **Funds land in Readoodle's account first** → 2-day float allows for dispute resolution and chargeback handling
- **Automatic payouts on day 3** → listers can't complain about payment speed
- **Better than T+0** (immediate) because we have time to verify pickup, handle disputes, and process refunds if needed

---

## 6. Operational Best Practices (Keep It Simple)

### 6.1 Product
- **No feature creep.** Stick to: browse, rent, approve, payout. Don't add wishlists, ratings, messaging, or community features until you have 10k active users.
- **One city, one app.** Multi-city scaling is a different problem — focus on proving the model in Kanpur first.
- **No guest checkout.** Users must have a membership (paid deposit) to rent. Reduces fraud and no-shows.
- **Fixed prices everywhere.** Variable pricing per lister = support nightmare and decision paralysis for renters. Keep it at ₹50/7 days.

### 6.2 Operations
- **Pickup points are real addresses.** Readoodle's own pickup point(s) + lister addresses (no virtual/vague pickup).
- **Admin approval for rentals.** Initially, every new rental requires admin OK to catch fraud/no-shows. Auto-approve later once you have confidence in the user base (or use a simple rule: first-time renters = manual, repeat customers = auto).
- **Manual payout processing.** Use a spreadsheet or simple admin panel tool to batch release payouts on day 3. Automate only when you have 100+ listers.
- **No fancy damage/loss automation.** When a renter damages a book, admin marks it in the dashboard, forfeits the deposit, and sends the lister a message. Simple.

### 6.3 Marketing & Growth
- **First 100 users = direct invite.** Don't spend on ads yet. Invite friends, book clubs, students, libraries. Build the habit first.
- **First 50 listers = direct outreach.** Find local book lovers, give them a pitch: "List your extra books, earn ₹49 per rental, we handle everything." Seed 200-300 books.
- **Bookmark gamification = free virality.** "Collect all 12 designs this season" drives repeat rentals and sharing (users brag about their collection on Instagram).
- **Word-of-mouth flywheel:** renters → collect bookmarks → share on social → more renters → attracts listers → more inventory → more rentals.

### 6.4 Data Privacy & Trust
- **GDPR-style privacy** (even though you're in India): store minimal data (name, email, address, phone). Delete after 1 year if account inactive.
- **PCI compliance:** never store credit card data. Razorpay handles that. Just store payment IDs and status.
- **Transparent T+2 payouts:** show listers exactly when their money is coming. Trust > growth.

---

## 7. Revenue Playbook (How to Scale)

### 7.1 Core Revenue (Per Rental)
```
₹50 rental fee
  - ₹49 to lister (T+2)
  - ₹1 commission (Readoodle keeps)
  - ₹3 bookmark cost
Net: -₹2 per rental (break-even with operational costs)
```

**To be profitable at scale, you need:**
1. **Late fees** (₹10/day uncapped) — 5-10% late rate = ₹25-50k extra per 10k rentals
2. **Readoodle's own inventory** — keep 100% of ₹50 per rental, minus bookmark cost = ₹47 profit per rental
3. **High volume** — 1,000 rentals/month = ₹1,000 pure commission, plus late fees

### 7.2 Future Revenue Streams (Not MVP, But Roadmap)
- **Damage insurance add-on:** ₹5 optional per rental, covers accidental damage (reduces chargeback/dispute overhead)
- **Priority access pass:** ₹30/month unlimited "fast lane" for rare/new releases (first access before general listing)
- **Lister pro tier:** ₹50/month for advanced listers (analytics dashboard, auto-pricing suggestions, priority payouts)
- **Affiliate links:** link to Goodreads / Amazon for users who want to buy after renting (tiny but scalable)
- **Advertising:** once you have 50k+ monthly active users, subtle "sponsor a book" (ads from publishers / bookstores) — like a shelf placement fee

### 7.3 Expansion Strategy
**Month 1-3: Kanpur only**
- 50-100 active users
- 200-300 books listed
- 300-500 rentals/month
- Revenue: ₹300-500 in commission + late fees, -₹600-1200 in bookmark costs = net -₹300-700/month (break-even with server costs)

**Month 4-6: Double down in Kanpur**
- 200+ active users
- 500+ books
- 1000+ rentals/month
- Revenue: ₹1000 in commission + ₹5000 in late fees = ₹6000, -₹3000 bookmark costs = ₹3000/month profit

**Month 7-12: Seed second city (Delhi/Bangalore/Hyderabad)**
- Same playbook: invite 50 renters + 50 listers, repeat
- Each city follows the same simple Next.js codebase (just change `NEXT_PUBLIC_CITY="Delhi"`)

**Month 12+: 5-10 cities**
- 5000+ total active users
- 50k+ monthly rentals
- ₹50k+ monthly revenue from commissions + late fees
- Break even on platform costs, start investing in marketing/team

### 7.4 Unit Economics Target
- **Customer Acquisition Cost (CAC):** ₹0 (word-of-mouth only, for now)
- **Lifetime Value (LTV):** 50 rentals × ₹1 commission = ₹50 per renter + ₹100 security deposit (float on it for 1 year) = ₹150 LTV
- **LTV:CAC ratio:** ∞ (free growth) — works as long as word-of-mouth holds

---

## 8. Risk Mitigation & Known Issues

### 8.1 Current Issues (MVP)
1. **No email verification** — users can sign up with fake emails. Fix: add email confirmation before deposit payment.
2. **No phone verification** — lister pickup points may be fake. Fix: call or SMS verification of phone number.
3. **No rate limiting** — API can be brute-forced. Fix: add Redis rate limiting on login/rental endpoints.
4. **Manual admin approval** — all rentals need manual OK. Scalability: auto-approve after 10 successful rentals by a user.
5. **No automated late fees** — relies on admin marking overdue. Fix: cron job nightly to calculate accrued late fees.
6. **No cancellation policy** — renters can't cancel. Fix: allow 24hr cancellation for full refund (before pickup).

### 8.2 Future Protections (Post-MVP)
- **ID verification** (Aadhar/PAN) for listers to reduce fraud
- **Address verification** (Google Maps + pincode validation) to confirm pickup points
- **Insurance option** (₹5-10 per rental) for accidental damage
- **Reputation system** (1-5 star ratings on listers and renters) to flag problem users
- **SMS reminders** (1 day before due date) to reduce late returns

### 8.3 What NOT to Build (Scope Lock)
- **Shipping/couriers** — complexity, cost, logistics burden. Pickup only.
- **Mobile app** — web works fine. Native apps = 2x dev effort for 20% extra users (initially).
- **Video/photo verification** — too manual, slows approvals. Trust the deposit.
- **Subscription plans** — pay-per-rental is simpler and more flexible than recurring billing.
- **Peer-to-peer messaging** — just use email. Adds complexity, support overhead, moderation.

---

## 9. Roadmap (Next.js Only, Keep It Light)

### Phase 0: MVP (Complete ✅)
- ✅ User signup + membership deposit
- ✅ Book listing (renters can list)
- ✅ Browse & rent (fixed ₹50/7 days)
- ✅ Admin approval (manual rental OK)
- ✅ Payouts (manual T+2 release)
- ✅ Razorpay integration
- ✅ Doodle bookmark motif on homepage

### Phase 1: Operational Hardening (Weeks 1-4)
- [ ] Email verification at signup (confirm email before deposit charged)
- [ ] Phone number validation (SMS or call)
- [ ] API rate limiting (prevent brute force)
- [ ] Automated late fee calculation (cron job nightly)
- [ ] Admin dashboard for rentals → auto-approve after Nth successful rental
- [ ] CSRF tokens on all forms

**Why:** Stop fraud, reduce manual admin work, protect against attacks.

### Phase 2: Trust & Retention (Weeks 5-8)
- [ ] Automated SMS reminders (1 day before due, 1 day after due)
- [ ] Late fine email notifications (auto-email on day overdue)
- [ ] 24hr rental cancellation window (full refund if renter cancels before pickup)
- [ ] Damage/loss dispute flow (admin marks damaged, sends notification to both parties)
- [ ] Lister reputation score (5-star system, shown on their listings)

**Why:** Reduce no-shows, improve return rate, reduce disputes.

### Phase 3: Growth & Engagement (Weeks 9-12)
- [ ] Bookmark collection gallery (show which designs user has collected)
- [ ] "Complete the set" gamification (push notifications: 2/12 designs collected this season)
- [ ] Simple book search (Ctrl+F style, no Elasticsearch needed yet)
- [ ] Wishlist (save books for later)
- [ ] Rental renewal (extend due date for another 7 days at checkout)

**Why:** Increase repeat rentals, improve engagement, drive repeat visits.

### Phase 4: Revenue Expansion (Weeks 13-16)
- [ ] Damage insurance add-on (optional ₹5/rental, covers accidental damage)
- [ ] Priority access tier (₹30/month, get new/rare books first)
- [ ] Lister pro dashboard (showing their earnings, top books, customer ratings)
- [ ] Second city support (Kanpur → Delhi multi-city in same codebase)
- [ ] Bulk payout automation (auto-release listers' T+2 payouts without manual OK)

**Why:** Diversify revenue, improve lister loyalty, scale to new cities.

### Phase 5: Scalability (Weeks 17-20)
- [ ] Pagination for all listing endpoints (prevent huge response payloads)
- [ ] Redis caching (cache book catalog, reduce DB load)
- [ ] CDN for bookmark images (faster delivery, less server load)
- [ ] Analytics dashboard (revenue trends, top cities, top books, user cohorts)
- [ ] Public API for partners (allow 3rd parties to embed Readoodle widget on their sites)

**Why:** Handle 10k+ monthly active users without DB melting down.

---

## 10. Success Metrics & KPIs

Track these weekly:

| Metric | Target (Month 1-3) | Target (Month 4-6) |
|--------|--------------------|--------------------|
| Active Users | 50-100 | 200-400 |
| Books Listed | 200-300 | 500-1000 |
| Monthly Rentals | 300-500 | 1000-1500 |
| Return-on-time % | 80%+ | 90%+ |
| Lister retention | 50% (repeat list) | 70%+ |
| Avg rental per user | 1.2 | 2.5 |
| Commission/month | ₹300-500 | ₹1000-1500 |
| Late fee/month | ₹200-300 | ₹2000-3000 |
| Net margin | -20% (loss) | +5% (breakeven) |

---

## 11. Frequently Asked Questions

**Q: Why fixed ₹50/7 days pricing?**
A: Simplicity. No negotiation, no pricing wars, renters know what to expect, listers know what they earn. One number is easier to market ("₹50 rentals") than variable pricing.

**Q: How do we prevent no-shows?**
A: Security deposit. ₹500 upfront creates real consequences. Combined with email reminders (phase 2), late fees, and lister ratings, no-shows should be <5%.

**Q: What if a lister lists the same book 10x (10 copies)?**
A: They list each copy separately as a different inventory item. We track availability per copy, not per title. Allows for "Atomic Habits - Copy 1", "Atomic Habits - Copy 2", etc.

**Q: Can renters leave a rented book at a different pickup point than they rented from?**
A: No (MVP). Return to the same point you rented from. This keeps logistics simple and avoids inventory redistribution problems.

**Q: Do we verify address before accepting a lister?**
A: Phase 2: yes (via Google Maps + pincode). Phase 1 (MVP): just email confirmation.

**Q: How do we handle returns?**
A: Renter drops the book off at the pickup point (Readoodle's or lister's) before the due date. No receipt required — just leave it at the desk/doorstep (for Readoodle points) or with the lister. Admin marks as returned once notified.

**Q: What about late returns?**
A: ₹10/day fine accrues automatically. After 30 days late, admin can mark as "lost" and charge the full book value + forfeit deposit. Renter gets flagged for future restrictions.

**Q: Can we ship books?**
A: Not in MVP. Shipping = ₹50-100 cost per book, makes the margin negative. Pickup-only keeps us profitable.

**Q: How many cities can we launch?**
A: As many as we want — each city is just a flag in the database. One Kanpur codebase works for Delhi, Mumbai, Bangalore, etc. Just change pickup points and run the same app.

---

## 12. Summary

Readoodle is designed to be **simple, profitable, and scalable**:
- **Fixed pricing** (₹50/7 days) removes complexity
- **Pickup-only** eliminates logistics costs
- **Flat 2% commission** attracts listers
- **Uncapped late fees** drive behavioral compliance
- **One Next.js codebase** = minimal tech overhead

The unit economics work: ₹1 commission per rental + late fee revenue + Readoodle's own inventory = profitability at 500+ rentals/month in a single city. Multi-city replication is identical — no new engineering needed, just seed users and inventory.

**Launch goal: Profitable by Month 6 in Kanpur. Scale to 5 cities by Month 12.**

---

**Document Status:** Final (MVP Launch 2026)  
**Last Updated:** August 31, 2026  
**Owner:** Readoodle Team
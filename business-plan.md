# Readoodle Official Business Plan & Operational Guidelines

Welcome to **Readoodle** — Kanpur's premier community book rental shelf. This document outlines the operational workflows, rules, mandatory instructions, and critical warnings for all three roles in the Readoodle ecosystem: **Borrowers**, **Listers**, and the **Admin**.

---

## 1. Guidelines for a Borrower (Renter)

### 📌 Core Operational Guidelines
- **Catalog Browsing**: Browse books available across Kanpur filtered by genre, author, or title.
- **Flat Rental Rate**: Every book rents for a fixed price of **₹50 per 7 days**. No price negotiations or per-book variations.
- **In-Person Pickup & Return**: Collect and return the book directly at the Lister's designated pickup point.
- **Keep the Bookmark**: Every rental includes a signature Readoodle bookmark that is yours to keep forever!

### 📝 Mandatory Step-by-Step Instructions
1. **Pay Security Deposit**: Before renting any book, navigate to your profile and pay the one-time **₹500 refundable security deposit**. Ensure your payment email matches your Readoodle registered email.
2. **Submit Rental Request**: Select a book and submit your rental request for a standard 7-day rental period.
3. **Wait for Approval**: Wait for Admin payment verification. Once approved, you will receive the Lister's pickup location name and address.
4. **Collect Book**: Visit the Lister's pickup point to receive the book.
5. **Return on Time & Track Rentals**: Return the book to the exact same pickup point on or before the 7-day due date. Track your active books, due dates, drop-off pickup points, and accrued late fees (₹10/day for overdue books) on your **My Rentals** dashboard (`/account/rentals`).
6. **Book Return Completion**: Return the book to the Lister at the designated drop-off point. There is no manual extension system — books kept past 7 days automatically incur ₹10/day late fees. Once the Lister receives the book and marks it "Available" on their Lister Dashboard, your rental is completed and moves to your Rental History tab.

### ⚠️ Critical Warnings & Penalties for Borrowers
> [!WARNING]
> **Locked Rentals Without Deposit**: Rental requests are strictly blocked until your ₹500 security deposit is verified as **PAID**.

> [!WARNING]
> **Overdue Late Fines**: A late fee of **₹10 per day** applies automatically for books returned past the 7-day due date. Total payable on drop-off equals the base rental fee plus accumulated late charges.

> [!CAUTION]
> **Damage & Loss Penalty**: If a book is returned damaged (torn pages, writing/water stains) or lost, your ₹500 security deposit will be forfeited to compensate the book owner.

> [!CAUTION]
> **Account Suspension**: Repeated late returns, unreturned books, or refusal to pay late fines will lead to permanent account termination.

---

## 2. Guidelines for a Lister (Book Owner)

### 📌 Core Operational Guidelines
- **List Your Inventory**: List your unused books on Readoodle in under 2 minutes.
- **Fixed Revenue Model**:
  - Renter pays: **₹50 per 7 days**
  - Readoodle commission (flat 2%): **₹1**
  - **Third-Party Lister Net Earnings: ₹49 per rental** (Released T+2 days via UPI)
  - **Readoodle Official Inventory (`cosmoindiaprakashan@gmail.com`)**: Retains 100% of rental revenue directly with no payout holds or transfers required.
- **Catalog Self-Management**: Manage ONLY your own listed books from your personal **Lister Dashboard** (`/lister`).
- **Availability & Return Confirmation**: Mark your books as "Available" or "Rented out" directly from your dashboard. Clicking "Mark Available" confirms a book has been returned by a borrower.

### 📝 Mandatory Step-by-Step Instructions
1. **Provide Mandatory Payout Info**: When listing a book, you MUST enter a valid **UPI ID** (e.g. `username@upi`) and a **10-digit Phone Number**.
2. **Set Accurate Pickup Address**: Provide a real, clear pickup point (home, shop, or trusted local spot) with street details.
3. **Prepare Book for Pickup**: When a borrower's rental request is approved, keep the book ready for in-person collection.
4. **Track Earnings & Payouts**: Monitor your personal earnings and payout status (`Pending` vs `✓ Paid`) on your Lister Dashboard.

### ⚠️ Critical Warnings & Instructions for Listers
> [!IMPORTANT]
> **Mandatory UPI & Phone Number**: Listings will be rejected if UPI ID or Phone Number is missing. Invalid UPI details will cause earnings transfer failures.

> [!WARNING]
> **No Off-Platform Cash Requests**: All rental fees are collected through Readoodle. Never ask borrowers for extra cash or per-book price increases.

> [!WARNING]
> **Fake Pickup Location Warning**: Providing fake addresses or uncontactable phone numbers will result in immediate listing deletion and lister account suspension.

> [!CAUTION]
> **T+2 Payout Processing**: Earnings are transferred via UPI within 48 hours (T+2) of rental approval. Do not release books until the rental request shows as **APPROVED** on the platform.

---

## 3. Guidelines for Admin (Platform Operator)

### 📌 Core Operational Guidelines
- **Platform Management**: Oversee global operations via the restricted **Admin Dashboard** (`/admin`).
- **Deposit Verification**: Verify ₹500 security deposit payments against Razorpay transaction logs.
- **Rental Approvals**: Verify borrower payments and approve rental requests to trigger pickup details.
- **Payout Transfers**: Manually release lister earnings (₹49/rental) to listers' UPI IDs on a T+2 schedule.

### 📝 Mandatory Step-by-Step Instructions
1. **Security Deposit Verification**:
   - Open **Users & Security Deposits** tab.
   - Match incoming user emails against Razorpay deposit receipts.
   - Click **"Mark Paid (₹500)"** to unlock rental privileges for the user.
2. **Rental Approvals**:
   - Open **Rental Requests** tab.
   - Review pending rental requests.
   - Click **"Approve & Send Email"** (automatically sets book to `RENTED` / unavailable and sends pickup details to borrower).
3. **Lister Payout Transfers**:
   - Open **Lister Payouts** tab.
   - Review listers with approved rentals.
   - Click **"📋 Copy Payout Details"** to copy the formatted string:
     `[Name] - Net: ₹[Amount] - UPI: [UPI ID] - Phone: [Phone Number] - Email: [Email]`
   - Open UPI app (Google Pay / PhonePe / Paytm) and transfer net earnings (₹49/rental) to the lister's UPI ID.
   - Click **"Mark as Paid"** to permanently store `payoutReleased: true` and `lastPayoutDate` in MongoDB.

### ⚠️ Critical Warnings & Instructions for Admin
> [!IMPORTANT]
> **UPI String Verification**: Always double-check the copied UPI ID and net earnings amount before confirming money transfers.

> [!WARNING]
> **Restricted Access**: The Admin Dashboard is strictly gated by `requireAdminSession()` and restricted to authorized administrative personnel only.

> [!CAUTION]
> **Deposit Forfeiture Integrity**: Only forfeit a renter's deposit after verifying genuine damage or loss reported by a lister.

---

## Summary Responsibility & Warning Matrix

| Role | Key Mandate | Primary Earnings / Fee | Critical Warning |
| :--- | :--- | :--- | :--- |
| **Borrower** | Pay deposit, return books undamaged & on time | Pays ₹50/7 days rental + ₹500 one-time deposit | Deposit forfeited for damaged/lost books; ₹10/day late fine |
| **Lister** | Provide valid UPI/Phone, manage own catalog | Earns ₹49 net per rental (98%) | Incorrect UPI ID delays payout; fake locations lead to bans |
| **Admin** | Approve rentals, verify deposits, release payouts | Retains 2% commission (₹1/rental) | Verify UPI details before transferring payouts |

---

## 4. Admin Growth Playbook: Continuous Enhancements to Thrive

To turn Readoodle from a side project into a thriving, long-term business, the Admin must execute on 3 key pillars: **Operational Speed**, **Product Enhancements**, and **Growth Hacks**.

### ⚡ Operational Speed & Reliability
1. **Sub-2-Hour Verification**: Verify user ₹500 security deposits within 2 hours. Instant gratification converts casual signups into active renters.
2. **Same-Day Rental Approvals**: Approve incoming rental requests twice daily (morning & evening) so borrowers get pickup details promptly.
3. **Flawless T+2 Payout Execution**: Listers build trust when paid on time. Always complete UPI transfers within 48 hours and mark them `✓ Paid`.

### 🛠️ Continuous Technical Enhancements
1. **Automated Batch Payouts (Razorpay Payouts API)**:
   - *Phase 1*: Manual UPI transfers via `/admin`.
   - *Phase 2 (at 500+ rentals/month)*: Integrate Razorpay Route / Payouts API for 1-click automated batch transfers directly to lister bank accounts/UPI.
2. **WhatsApp / SMS Instant Alerts (Interakt / Twilio)**:
   - Send instant WhatsApp notifications for:
     - Rental Approval & Lister Address
     - 5-Day Due Reminder ("2 days left to return your book!")
     - Payout Confirmation to Lister
3. **Partner Drop Node Network (Cafes & Kiosks)**:
   - Partner with local cafes (e.g. Swaroop Nagar cafes or campus canteens) as official Readoodle Drop Nodes.
   - Listers drop books off at the cafe; renters pick up at their convenience.
4. **Distance & Radius Search**:
   - Add location filtering (e.g., "Books within 3 km of Swaroop Nagar / Kalyanpur").
5. **Lister & Book Reputation System**:
   - 5-star ratings & mini reviews for books and listers to build community trust.

### 🚀 Growth Hacks & Community Building
1. **Campus Ambassador Network**:
   - Recruit 2–3 passionate student ambassadors at IIT Kanpur, CSJM, and HBTI.
   - Offer them ₹10 per new active renter onboarded.
2. **Collectible Season Bookmark Drops**:
   - Launch quarterly themed bookmark sets (e.g. "Season 1: Inked Animals", "Season 2: Anime & Manga").
   - Encourage readers to post their bookmark collections on Instagram tagging `@Readoodle`.
3. **Local Brand Sponsorships**:
   - Monetize physical bookmarks by printing discount coupons for local bakeries, cafes, and stationery stores on the back of bookmarks.


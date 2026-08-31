# 📚 Readoodle

**Readoodle** is a book-rental marketplace platform built with Next.js, MongoDB, and Razorpay. Users can rent books from Readoodle's inventory or from their neighbors, with every rental coming with a hand-doodled bookmark.

## 🎯 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB URI (set in `.env.local`)
- Razorpay API keys (set in `.env.local`)
- NextAuth.js configuration

### Installation

```bash
git clone <repo-url>
cd readoodle
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate-with-openssl-rand-hex-32>
RAZORPAY_KEY_ID=<your-razorpay-key>
RAZORPAY_KEY_SECRET=<your-razorpay-secret>
```

### Development

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

---

## 📋 Project Structure

```
readoodle/
├── app/                          # Next.js App Router
│   ├── (marketing)/              # Public marketing pages
│   ├── api/                      # API routes (auth, books, rentals, webhooks)
│   ├── admin/                    # Admin dashboard
│   ├── account/                  # User account pages
│   ├── browse/                   # Book browsing
│   ├── lister/                   # Lister dashboard
│   ├── rent/                     # Rental checkout
│   ├── profile/                  # User profile with security deposit
│   ├── login/signup/             # Auth pages
│   └── layout.tsx                # Root layout with fonts
├── components/                   # Reusable UI components
│   ├── book/                     # BookCard, BookDetail, BookFilters
│   ├── rental/                   # RentalCard, DueDateCard, CheckoutSummary
│   ├── lister/                   # ListingForm, MyListings, PayoutStatus
│   ├── layout/                   # Navbar, Footer
│   └── ui/                       # Button, Badge, DashedCard
├── lib/                          # Utility functions & configuration
│   ├── mongodb.ts                # Database connection & collections
│   ├── auth.ts                   # NextAuth configuration
│   ├── admin.ts                  # Admin utilities & session checks
│   ├── admin-utils.ts            # Client-safe admin utilities
│   ├── api.ts                    # Frontend API client
│   ├── payments.ts               # Razorpay integration
│   ├── theme.ts                  # Brand colors & theme
│   └── utils.ts                  # General utilities
├── types/                        # TypeScript type definitions
├── public/                       # Static assets
├── PRD.md                        # Product Requirements Document
└── README.md                     # This file
```

---

## ✨ Features

### For Renters
- 🔍 **Browse Books** - Search and filter books by title, author, category
- 💳 **Instant Checkout** - Razorpay payment integration
- 📅 **7-Day Rentals** - Fixed ₹50 per book, 7 days
- 🎨 **Digital Bookmarks** - Print-ready PDF doodles emailed after return
- 🔐 **Security Deposit** - ₹500 one-time refundable deposit unlocks all rentals
- 📱 **Rental History** - Track active rentals and past rental history
- 📍 **Pickup Locations** - View pickup points for each lister

### For Listers
- 📚 **List Books** - Add books from your personal library
- 💰 **Earn Money** - Keep 98% of rental fees (flat 2% platform commission)
- 📊 **Dashboard** - Track listings, active rentals, and payouts
- ⚡ **No Approval** - List immediately without waiting for approval
- 💬 **Renter Communication** - View rental requests and contact renters
- 🎯 **Fixed Pricing** - ₹50/7 days per book, no haggling

### For Admin
- 👥 **User Management** - Verify security deposits, track user activity
- 📦 **Inventory Management** - Oversee Readoodle-owned books
- 💵 **Payment Verification** - Confirm deposits and process payouts
- 📊 **Rental Analytics** - Monitor platform activity and metrics
- ⚠️ **Damage Cases** - Handle dispute resolution

---

## 🏗️ Architecture

### Frontend
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Styling**: Tailwind CSS
- **State Management**: React hooks (useEffect, useState)
- **Authentication**: NextAuth.js with JWT sessions

### Backend
- **Runtime**: Node.js
- **Database**: MongoDB (collections: users, books, rentals)
- **Payment Gateway**: Razorpay
- **API Design**: REST endpoints in `app/api/`

### Key Integrations
- **NextAuth.js**: Email/password authentication
- **Razorpay**: Payment processing for rentals and deposits
- **MongoDB**: Document-based data storage
- **Next.js API Routes**: Backend logic without separate server

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth callback

### Books
- `GET /api/books` - List all books (with filters)
- `POST /api/books` - Create new book (lister only)
- `GET /api/books/[bookId]` - Get book details
- `PATCH /api/books/[bookId]` - Update book (lister only)
- `DELETE /api/books/[bookId]` - Delete book (lister only)
- `GET /api/books/mine` - Get user's listed books

### Rentals
- `GET /api/rentals` - List user's rentals
- `POST /api/rentals` - Create new rental (initiate checkout)
- `GET /api/admin/rentals` - Admin view all rentals
- `PATCH /api/admin/rentals/[rentalId]` - Approve rental (admin)

### User Profile
- `GET /api/profile` - Get user profile
- `PATCH /api/admin/users/[userId]` - Update user (admin, security deposit)

### Payments
- `POST /api/webhooks/razorpay` - Razorpay webhook for payment confirmation

---

## 🐛 Known Loopholes & Issues

### Security & Validation
1. **No Email Verification** - Users can sign up with any email; should verify ownership
2. **No Phone Verification** - Lister pickup location isn't verified; could be false
3. **ObjectId Type Inconsistency** - Some queries accept string IDs as fallback; should enforce strict ObjectId validation
4. **No Rate Limiting** - API endpoints lack rate limiting; vulnerable to brute force/DoS
5. **No CSRF Protection** - Form submissions don't have CSRF tokens

### Business Logic
6. **No Approval Gate for Listers** - Anyone can immediately list books; no quality control
7. **No Address Verification** - Pickup points aren't validated; listers could give fake locations
8. **Damage Dispute Resolution** - No automated system for handling damage claims; manual process only
9. **Late Fee Calculation** - No automated late fee charging; relies on manual admin intervention
10. **No Refund Policy** - Unclear what happens if renter disputes a charge or needs refund

### Platform Operations
11. **No Automated Reminders** - Users aren't reminded of upcoming due dates (email/SMS)
12. **No Cancellation Window** - Rentals can't be cancelled once payment is confirmed
13. **No Insurance Option** - Renters have no way to insure books against damage
14. **Manual Admin Verification** - Security deposit verification is manual; no automation
15. **No Inventory Forecasting** - Readoodle's own inventory stock isn't predicted/managed

### Data & Performance
16. **No Pagination** - API returns all results; scalability issue with large datasets
17. **No Caching** - Book listings loaded fresh every time; no Redis caching
18. **No Search Indexing** - Book search is basic string matching; no full-text search
19. **No Image Upload** - Books have no cover images; content is text-only
20. **Stale Book Data** - Condition/availability of books isn't tracked over time

### User Experience
21. **No Guest Checkout** - Users must create account before browsing/renting
22. **No Wishlist** - Users can't save books for later
23. **No Ratings/Reviews** - No way to rate books or listers
24. **Placeholder Admin Pages** - Bookmarks, damage cases, inventory pages are UI-only stubs
25. **No Mobile App** - Web-only; no iOS/Android native apps

---

## 🛣️ Future Roadmap

### Phase 1: MVP Hardening (Weeks 1-4)
- [ ] **Email Verification** - Confirm user email before signup completion
- [ ] **Phone Verification** - SMS verification for lister locations
- [ ] **Rate Limiting** - Add rate limiting to all API endpoints
- [ ] **CSRF Tokens** - Secure form submissions
- [ ] **Pagination & Filtering** - Implement cursor-based pagination for books/rentals

### Phase 2: Operations & Trust (Weeks 5-8)
- [ ] **Lister Approval Workflow** - Manual review before first listing goes live
- [ ] **Address Verification** - Google Maps API for pickup location validation
- [ ] **Automated Reminders** - Email reminders 2 days before due date + 1 day overdue
- [ ] **Late Fee Automation** - Auto-charge ₹10/day late fees after due date
- [ ] **Dispute System** - In-app ticket system for damage/missing book claims

### Phase 3: Platform Growth (Weeks 9-12)
- [ ] **Search & Discovery** - Elasticsearch integration for full-text search
- [ ] **User Ratings** - 5-star ratings for books and listers
- [ ] **Wishlist Feature** - Save books for later renting
- [ ] **Image Uploads** - Book cover images with Cloudinary CDN
- [ ] **Caching Layer** - Redis cache for frequently accessed books

### Phase 4: Monetization & Scale (Weeks 13-16)
- [ ] **Pricing Tiers** - Optional insurance, priority delivery, subscription plans
- [ ] **Referral Program** - Invite friends, earn discount credits
- [ ] **Analytics Dashboard** - Detailed revenue, rental, and user metrics
- [ ] **Mobile App** - Native iOS/Android apps with push notifications
- [ ] **Multi-City Expansion** - Support for cities beyond Kanpur

### Phase 5: Advanced Features (Weeks 17-20)
- [ ] **AI Recommendations** - Book recommendations based on rental history
- [ ] **Subscription Plans** - Unlimited rentals for ₹X/month
- [ ] **Book Pickup Kiosks** - Automated pickup lockers in high-traffic areas
- [ ] **Seller Analytics** - Lister dashboard with revenue trends and insights
- [ ] **Third-Party Integrations** - Goodreads sync, library system integration

---

## 📊 Database Schema

### Users
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  passwordHash: String,
  securityDepositPaid: Boolean,
  securityDepositPaidAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Books
```javascript
{
  _id: ObjectId,
  title: String,
  author: String,
  isbn: String,
  condition: String, // "excellent", "good", "fair"
  available: Boolean,
  lister: {
    id: ObjectId,
    name: String,
    email: String,
    pickupPoint: { label: String, address: String }
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Rentals
```javascript
{
  _id: ObjectId,
  bookId: ObjectId,
  bookTitle: String,
  renterId: ObjectId,
  renterEmail: String,
  lister: { id, name, email },
  status: String, // "pending", "approved", "active", "returned"
  dueDateISO: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🚀 Deployment

### Vercel (Recommended)
```bash
vercel deploy
```

### Self-Hosted
```bash
npm run build
npm start
```

### Environment Setup
- MongoDB Atlas for database
- Razorpay account for payments
- SMTP service for emails (future)
- S3/Cloudinary for image CDN (future)

---

## 📝 Development Notes

### Key Files to Know
- `app/(marketing)/page.tsx` - Homepage with dynamic rental showcase
- `app/api/auth/signup/route.ts` - User registration logic
- `lib/mongodb.ts` - Database connection & collection helpers
- `lib/payments.ts` - Razorpay payment logic
- `components/layout/Navbar.tsx` - Navigation with admin gating
- `app/admin/page.tsx` - Admin dashboard for user & rental management

### Common Commands
```bash
npm run dev       # Development server
npm run build     # Production build
npm run lint      # ESLint check
```

### Testing
- Manual testing via browser (no automated test suite yet)
- API testing with Postman/Insomnia
- Admin panel testing via `/admin` (requires admin email)

---

## 🤝 Contributing

This is a solo MVP project. For production, consider:
- Adding a test suite (Jest + React Testing Library)
- Setting up CI/CD (GitHub Actions)
- Code review process before merging
- Staging environment for testing

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🎨 Brand

**Readoodle** uses a cohesive design system:
- **Colors**: Ink (#20304D), Paper (#F5EFE0), Coral (#E1573F), Sage (#7C9070), Marigold (#E8A33D)
- **Fonts**: Caveat (display), Work Sans (body), IBM Plex Mono (technical)
- **Motif**: Library due-date card with dashed borders
- **Tone**: Friendly, playful, inviting

---

## 📞 Contact

For questions about the Readoodle MVP, refer to [PRD.md](./PRD.md) for the full product specification.

---

**Last Updated**: August 2026 | **Status**: MVP Active

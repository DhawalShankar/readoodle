export type BookmarkKind = "physical" | "digital";
export type ListingSource = "readoodle" | "lister";
export type RentalStatus = "active" | "overdue" | "returned";
export type PayoutStatus = "pending" | "released";

export interface PickupPoint {
  id: string;
  label: string; // e.g. "Readoodle — Swaroop Nagar" or a lister's registered address
  addressLine: string;
  city: string;
  pickupTimeSlot: string; // e.g. "Mon–Sat, 6 PM – 9 PM"
}

export interface Lister {
  id: string;
  name: string;
  email: string;
  source: ListingSource; // "readoodle" for Readoodle's own inventory
  pickupPoint: PickupPoint;
  upiId?: string;
  phoneNumber?: string;
}

export interface BookmarkDesign {
  id: string;
  setName: string; // e.g. "Season 1: Animals"
  designName: string;
  imageUrl: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  coverImageUrl?: string;
  coverColor: string; // fallback flat-color cover when no image is set
  description: string;
  condition: "new" | "good" | "worn";
  bookPrice: number; // owner-assigned value of the copy, drives the caps below
  rentalPricePerWeek: number; // capped at 50% of bookPrice
  securityDeposit: number; // capped at 100% of bookPrice
  available: boolean;
  lister: Lister;
  bookmark: BookmarkDesign;
}

export interface Rental {
  id: string;
  book: Book;
  rentedOnISO: string;
  dueDateISO: string;
  returnedOnISO?: string;
  status: RentalStatus;
  weeks: number;
  rentalFeeTotal: number;
  depositHeld: number;
  bookmarkKind: BookmarkKind;
}

export interface Payout {
  id: string;
  rentalId: string;
  amount: number; // rental fee minus 2% commission
  status: PayoutStatus;
  scheduledReleaseISO: string; // T+2 from confirmation
}

export interface BookFilterState {
  query: string;
  genre: string | "all";
  availability: "all" | "available" | "unavailable";
  pickupCity: string | "all";
  maxPricePerWeek: number | null;
  sort: "relevance" | "price-asc" | "price-desc" | "newest";
}

/* ---------------------------------------------------------------------
 * Append this to the bottom of types.ts — the request shape for
 * creating a new listing (components/lister/ListingForm.tsx).
 * ------------------------------------------------------------------- */

export interface NewListingPayload {
  title: string;
  author: string;
  genre: string;
  description: string;
  condition: "new" | "good" | "worn";
  coverColor: string;
  bookPrice: number;
  rentalPricePerWeek: number; // must be ≤ 50% of bookPrice
  securityDeposit: number; // must be ≤ bookPrice
  pickupLabel: string;
  pickupAddressLine: string;
  pickupCity: string;
  pickupTimeSlot: string;
  upiId: string;
  phoneNumber: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  securityDepositPaid: boolean;
  createdAt?: string;
}

export interface AdminRentalRequest {
  id: string;
  bookId: string;
  bookTitle: string;
  renterId: string;
  renterName: string;
  renterEmail: string;
  weeks: number;
  amount: number;
  pickupLocation: string;
  pickupTimeSlot: string;
  listerName: string;
  listerEmail: string;
  listerSource: "readoodle" | "lister";
  status: "pending_approval" | "approved" | "rejected";
  createdAt: string;
}

export interface AdminListerRental {
  id: string;
  bookTitle: string;
  amount: number;
  commission: number;
  netAmount: number;
  createdAt: string;
}

export interface AdminLister {
  id: string;
  name: string;
  email: string;
  upiId: string;
  phoneNumber: string;
  pickupPoint: PickupPoint;
  totalRentals: number;
  totalEarnings: number;
  platformCommission: number;
  netEarnings: number;
  payoutReleased: boolean;
  lastPayoutDate: string | null;
  rentals: AdminListerRental[];
}

export interface ListerStats {
  totalListings: number;
  totalRentals: number;
  grossEarnings: number;
  platformCommission: number;
  netEarnings: number;
  payoutReleased: boolean;
  lastPayoutDate: string | null;
  upiId: string;
  phoneNumber: string;
  isAdmin?: boolean;
  rentals: Array<{
    id: string;
    bookTitle: string;
    amount: number;
    commission: number;
    netAmount: number;
    createdAt: string;
  }>;
}
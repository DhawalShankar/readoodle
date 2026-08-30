export type BookmarkKind = "physical" | "digital";
export type ListingSource = "readoodle" | "lister";
export type RentalStatus = "active" | "overdue" | "returned";
export type PayoutStatus = "pending" | "released";

export interface PickupPoint {
  id: string;
  label: string; // e.g. "Readoodle — Swaroop Nagar" or a lister's registered address
  addressLine: string;
  city: string;
}

export interface Lister {
  id: string;
  name: string;
  source: ListingSource; // "readoodle" for Readoodle's own inventory
  pickupPoint: PickupPoint;
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
}
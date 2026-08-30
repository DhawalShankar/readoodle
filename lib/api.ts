import type { Book, BookFilterState, Rental } from "@/types";
import type { NewListingPayload } from "@/types"; // add this type to types.ts, see types-additions.ts

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  (typeof window === "undefined"
    ? `http://localhost:${process.env.PORT ?? 3000}/api` // server-side: absolute URL zaroori hai
    : "/api"); // client-side: relative theek hai, CORS-free

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    throw new Error(`Readoodle API error ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

/** GET /books/ — catalog search. Filters map to query params handled by apps/books views.py. */
export function fetchBooks(filters: Partial<BookFilterState> = {}) {
  const params = new URLSearchParams();
  if (filters.query) params.set("q", filters.query);
  if (filters.genre && filters.genre !== "all") params.set("genre", filters.genre);
  if (filters.availability && filters.availability !== "all") params.set("availability", filters.availability);
  if (filters.pickupCity && filters.pickupCity !== "all") params.set("pickup_city", filters.pickupCity);
  if (filters.maxPricePerWeek) params.set("max_price", String(filters.maxPricePerWeek));
  if (filters.sort) params.set("sort", filters.sort);
  return request<Book[]>(`/books/?${params.toString()}`);
}

/** GET /books/:id/ */
export function fetchBook(bookId: string) {
  return request<Book>(`/books/${bookId}/`);
}

/** POST /rentals/ — kicks off the checkout flow described in PRD §3.3. */
export function createRental(payload: { bookId: string; weeks: number }) {
  return request<Rental>(`/rentals/`, { method: "POST", body: JSON.stringify(payload) });
}

/** GET /rentals/mine/ — "My Rentals" dashboard, active + history depending on `status`. */
export function fetchMyRentals(status: "active" | "history" = "active") {
  return request<Rental[]>(`/rentals/mine/?status=${status}`);
}

/** POST /rentals/:id/return/ or /extend/ */
export function returnRental(rentalId: string) {
  return request<Rental>(`/rentals/${rentalId}/return/`, { method: "POST" });
}

export function extendRental(rentalId: string, additionalWeeks: number) {
  return request<Rental>(`/rentals/${rentalId}/extend/`, {
    method: "POST",
    body: JSON.stringify({ additional_weeks: additionalWeeks }),
  });
}

/* ---------------------------------------------------------------------
 * Append these to the bottom of lib/api.ts — needed by the new
 * lister listing flow (components/lister/ListingForm.tsx, app/lister).
 * ------------------------------------------------------------------- */


/** POST /books/ — a lister (or Readoodle) adding a new book. Backend must
 *  enforce the pricing caps server-side too (rental ≤ 50% of bookPrice,
 *  deposit ≤ 100%) — never trust the client-side check alone. */
export function createListing(payload: NewListingPayload) {
  return request<Book>(`/books/`, { method: "POST", body: JSON.stringify(payload) });
}

/** GET /books/mine/ — listings belonging to the logged-in user (their
 *  "list your books" toggle must be on for this to return anything). */
export function fetchMyListings() {
  return request<Book[]>(`/books/mine/`);
}

export function deleteListing(bookId: string) {
  return request<{ deleted: boolean }>(`/books/${bookId}/`, { method: "DELETE" });
}
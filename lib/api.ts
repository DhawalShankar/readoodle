import type { Book, BookFilterState, Rental, AdminUser, AdminRentalRequest, AdminLister } from "@/types";
import type { NewListingPayload } from "@/types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  (typeof window === "undefined"
    ? `http://localhost:${process.env.PORT ?? 3000}/api`
    : "/api");

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    throw new Error(`Readoodle API error ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

/** GET /books/ — catalog search. */
export function fetchBooks(filters: Partial<BookFilterState> = {}) {
  const params = new URLSearchParams();
  if (filters.query) params.set("q", filters.query);
  if (filters.genre && filters.genre !== "all") params.set("genre", filters.genre);
  if (filters.availability && filters.availability !== "all") params.set("availability", filters.availability);
  if (filters.pickupCity && filters.pickupCity !== "all") params.set("pickup_city", filters.pickupCity);
  if (filters.maxPricePerWeek) params.set("max_price", String(filters.maxPricePerWeek));
  if (filters.sort) params.set("sort", filters.sort);
  const query = params.toString();
  return request<Book[]>(`/books/${query ? `?${query}` : ""}`);
}

/** GET /books/:id/ */
export function fetchBook(bookId: string) {
  return request<Book>(`/books/${bookId}`);
}

/** POST /rentals/ — submits a rental request. */
export function createRental(payload: { bookId: string; weeks: number }) {
  return request<{ id: string; status: string; bookId: string; message?: string }>(`/rentals/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** GET /rentals/mine/ — "My Rentals" dashboard. */
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

export function createListing(payload: NewListingPayload) {
  return request<Book>(`/books/`, { method: "POST", body: JSON.stringify(payload) });
}

export function fetchMyListings() {
  return request<Book[]>(`/books/mine/`);
}

export function deleteListing(bookId: string) {
  return request<{ deleted: boolean }>(`/books/${bookId}/`, { method: "DELETE" });
}

export function confirmPickup(rentalId: string) {
  return request<Rental>(`/rentals/${rentalId}/confirm-pickup/`, { method: "POST" });
}

export function contactPickup(rentalId: string, message?: string) {
  return request<{ sent: boolean }>(`/rentals/${rentalId}/contact-pickup/`, {
    method: "POST",
    body: JSON.stringify(message ? { message } : {}),
  });
}

export function updateListing(bookId: string, payload: Partial<NewListingPayload>) {
  return request<Book>(`/books/${bookId}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function setBookAvailability(bookId: string, availability: "available" | "rented") {
  return updateListing(bookId, { availability } as Partial<NewListingPayload>);
}

/** GET /profile/ — deposit + basic account status. */
export function fetchProfile() {
  return request<{ securityDepositPaid: boolean; user?: { name: string; email: string } }>(`/profile/`);
}

/* ADMIN PANEL API FUNCTIONS */
export function fetchAdminUsers() {
  return request<AdminUser[]>(`/admin/users`);
}

export function updateAdminUserDeposit(userId: string, securityDepositPaid: boolean) {
  return request<AdminUser>(`/admin/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify({ securityDepositPaid }),
  });
}

export function fetchAdminRentals() {
  return request<AdminRentalRequest[]>(`/admin/rentals`);
}

export function updateAdminRentalStatus(rentalId: string, status: "pending_approval" | "approved" | "rejected") {
  return request<AdminRentalRequest>(`/admin/rentals/${rentalId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function updateAdminBookAvailability(bookId: string, available: boolean) {
  return request<Book>(`/admin/books/${bookId}`, {
    method: "PATCH",
    body: JSON.stringify({ available }),
  });
}

export function fetchAdminListers() {
  return request<AdminLister[]>(`/admin/listers`);
}

export function updateAdminListerPayout(listerId: string, payoutReleased: boolean) {
  return request<{ success: boolean; listerId: string; payoutReleased: boolean; lastPayoutDate: string | null }>(`/admin/listers`, {
    method: "PATCH",
    body: JSON.stringify({ listerId, payoutReleased }),
  });
}

export function fetchListerStats() {
  return request<import("@/types").ListerStats>(`/lister/stats`);
}

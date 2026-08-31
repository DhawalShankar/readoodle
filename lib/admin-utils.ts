/**
 * Client-safe admin utilities.
 * These functions have no server-side dependencies and can be safely imported on the client.
 */

export const ADMIN_EMAIL = "cosmoindiaprakashan@gmail.com";

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

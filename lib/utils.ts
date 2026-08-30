export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/** Formats a number of paise-free rupees as "₹50". Keep amounts as plain integers/floats in rupees throughout the app. */
export function formatRupees(amount: number) {
  return `₹${amount % 1 === 0 ? amount : amount.toFixed(2)}`;
}

/** Formats a due date as "14 Sep 2026" — used on DueDateCard and rental dashboards. */
export function formatDueDate(date: string | Date) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/** Days remaining until (positive) or past (negative) a due date. */
export function daysUntil(date: string | Date) {
  const d = typeof date === "string" ? new Date(date) : date;
  const diffMs = d.setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/** Late fine accrual: ₹10/day, uncapped, per PRD §7. Returns 0 if not yet overdue. */
export function calculateLateFine(dueDate: string | Date, ratePerDay = 10) {
  const overdue = -daysUntil(dueDate);
  return overdue > 0 ? overdue * ratePerDay : 0;
}

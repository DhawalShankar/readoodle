/**
 * Readoodle design tokens.
 *
 * Signature motif: the old library due-date card tucked in the back-cover
 * pocket of a library book — a dashed-border index card, stamped in
 * monospace ink. Reused throughout as the bookmark shape, pricing strips,
 * and card borders. Keep these values as the single source of truth so
 * every page stays visually consistent with the home page.
 */

export const INK = "#20304D";
export const PAPER = "#F5EFE0";
export const PAPER_CARD = "#FBF7EC";
export const MARIGOLD = "#E8A33D";
export const CORAL = "#E1573F";
export const SAGE = "#7C9070";

export const FONT_DISPLAY = "var(--font-caveat)"; // handwritten, doodled feel
export const FONT_BODY = "var(--font-work-sans)"; // clean body copy
export const FONT_MONO = "var(--font-plex-mono)"; // stamps, prices, due dates

/** Rotation values used for the "tucked bookmark" tilt effect. Pick one per card so a grid doesn't look uniform. */
export const CARD_TILTS = [-3, 2, -1.5, 3, -2.5, 1.5];

export function tiltFor(seed: number) {
  return CARD_TILTS[Math.abs(seed) % CARD_TILTS.length];
}

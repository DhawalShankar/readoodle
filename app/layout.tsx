import type { Metadata } from "next";
import { Caveat, Work_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import SessionWrapper from "@/components/SessionWrapper";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";


/**
 * These three fonts are Readoodle's whole type system — Caveat for
 * anything that should feel hand-doodled, Work Sans for body copy,
 * IBM Plex Mono for prices/stamps/due dates. They're loaded exactly
 * once, here, and exposed as CSS variables on <html> so every page
 * (home, browse, lister, coming-soon, book detail, etc.) can just
 * reference var(--font-caveat) / var(--font-work-sans) / var(--font-plex-mono)
 * — which is exactly what lib/theme.ts's FONT_DISPLAY/FONT_BODY/FONT_MONO
 * constants already do. Don't load fonts again inside individual pages —
 * that's what caused the previous mismatch (home.tsx had its own fonts,
 * every other page fell back to the browser default).
 */

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-caveat",
});



const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-work-sans",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  title: "Readoodle",
  description: "Rent the book. Keep the doodle.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${caveat.variable} ${workSans.variable} ${plexMono.variable} h-full antialiased`}
    >
      
      <body
        className="min-h-full flex flex-col"
        style={{ fontFamily: "var(--font-work-sans)" }}
      >
        <SessionWrapper>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </SessionWrapper>
      </body>
    </html>
  );
}
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { CORAL, FONT_DISPLAY, INK } from "@/lib/theme";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";

const LINKS = [
  { href: "/browse", label: "Browse books" },
  { href: "/#how", label: "How it works" },
  { href: "/#doodles", label: "The doodle thing" },
  { href: "/lister", label: "Become a lister" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  return (
    <header className="relative z-10 border-b border-[#20304D]/15">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2">
          <BookmarkMark className="h-7 w-7" color={CORAL} />
          <span style={{ fontFamily: FONT_DISPLAY }} className="text-3xl font-semibold tracking-tight">
            Readoodle
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-[15px] font-medium md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn("hover:opacity-70", pathname === link.href && "underline decoration-dashed underline-offset-4")}
              style={{ color: INK }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {status === "authenticated" ? (
            <>
              <Link href="/lister" className="hidden text-[15px] font-medium hover:opacity-70 sm:inline" style={{ color: INK }}>
                Hi, {session.user?.name?.split(" ")[0] ?? "there"}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-sm border-2 px-4 py-2 text-sm font-semibold"
                style={{ borderColor: INK, color: INK }}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden text-[15px] font-medium hover:opacity-70 sm:inline" style={{ color: INK }}>
                Log in
              </Link>
              <Button href="/signup" variant="filled">
                Join Readoodle
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function BookmarkMark({ className, color }: { className?: string; color: string }) {
  return (
    <svg viewBox="0 0 24 32" fill="none" className={className}>
      <path d="M2 2h20v27l-10-7-10 7V2z" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  );
}
import { CORAL, FONT_DISPLAY } from "@/lib/theme";

const ISSUE_EMAIL = "cosmoindiaprakashan@gmail.com";
const ISSUE_SUBJECT = "Readoodle Issue Report";
const ISSUE_BODY = `Describe the issue:

Steps to reproduce:


Device / Browser:
`;

const MAILTO_HREF =
  `mailto:${ISSUE_EMAIL}` +
  `?subject=${encodeURIComponent(ISSUE_SUBJECT)}` +
  `&body=${encodeURIComponent(ISSUE_BODY)}`;

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-[#20304D]/15">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 sm:flex-row">
        <div className="flex items-center gap-2">
          <BookmarkMark className="h-5 w-5" color={CORAL} />

          <span
            style={{ fontFamily: FONT_DISPLAY }}
            className="text-xl font-semibold"
          >
            Readoodle
          </span>
        </div>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-6">
          <a
            href={MAILTO_HREF}
            className="text-xs font-medium text-[#20304D]/70 underline underline-offset-2 transition-colors hover:text-[#20304D]"
          >
            Report an issue
          </a>

          <p className="text-xs text-[#20304D]/60">
            {"\u00A9 " +
              new Date().getFullYear() +
              " Readoodle. Books borrowed, doodles kept."}
          </p>
        </div>
      </div>
    </footer>
  );
}

function BookmarkMark({
  className,
  color,
}: {
  className?: string;
  color: string;
}) {
  return (
    <svg viewBox="0 0 24 32" fill="none" className={className}>
      <path
        d="M2 2h20v27l-10-7-10 7V2z"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
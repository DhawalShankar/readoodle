import Link from "next/link";
import { INK, PAPER } from "@/lib/theme";
import { cn } from "@/lib/utils";

type Variant = "filled" | "outline" | "inverted";

type Props = {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  variant?: Variant;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
};

export default function Button({
  href,
  onClick,
  children,
  variant = "outline",
  type = "button",
  disabled,
  className = "",
}: Props) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-sm border-2 px-5 py-2.5 text-[15px] font-semibold transition-transform hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0";

  const style: React.CSSProperties =
    variant === "filled"
      ? { borderColor: INK, backgroundColor: INK, color: PAPER }
      : variant === "inverted"
      ? { borderColor: PAPER, backgroundColor: PAPER, color: INK }
      : { borderColor: INK, backgroundColor: "transparent", color: INK };

  if (href && !disabled) {
    return (
      <Link href={href} className={cn(base, className)} style={style}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cn(base, className)} style={style}>
      {children}
    </button>
  );
}

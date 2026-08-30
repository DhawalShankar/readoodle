import { FONT_MONO } from "@/lib/theme";
import { cn } from "@/lib/utils";

export default function Badge({
  children,
  color,
  className = "",
}: {
  children: React.ReactNode;
  color: string;
  className?: string;
}) {
  return (
    <span
      className={cn("inline-block rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-widest", className)}
      style={{ backgroundColor: `${color}22`, color, fontFamily: FONT_MONO }}
    >
      {children}
    </span>
  );
}

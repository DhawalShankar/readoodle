import { INK, PAPER_CARD } from "@/lib/theme";
import { cn } from "@/lib/utils";

export default function DashedCard({
  children,
  className = "",
  tilt = 0,
}: {
  children: React.ReactNode;
  className?: string;
  tilt?: number;
}) {
  return (
    <div
      className={cn("border-2 border-dashed p-6", className)}
      style={{ borderColor: INK, backgroundColor: PAPER_CARD, transform: tilt ? `rotate(${tilt}deg)` : undefined }}
    >
      {children}
    </div>
  );
}

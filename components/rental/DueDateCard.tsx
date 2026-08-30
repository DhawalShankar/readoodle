import { CORAL, FONT_DISPLAY, FONT_MONO, INK } from "@/lib/theme";
import { formatDueDate } from "@/lib/utils";

export default function DueDateCard({
  dueDate,
  message = "hi, reader!",
  tilt = 10,
  className = "",
}: {
  dueDate: string | Date;
  message?: string;
  tilt?: number;
  className?: string;
}) {
  return (
    <div
      className={`w-40 border-2 border-dashed bg-[#FBF7EC] px-4 py-3 shadow-md ${className}`}
      style={{ borderColor: INK, transform: `rotate(${tilt}deg)` }}
    >
      <p style={{ fontFamily: FONT_DISPLAY, color: CORAL }} className="text-2xl leading-none">
        {message}
      </p>
      <p style={{ fontFamily: FONT_MONO }} className="mt-2 text-[11px] uppercase tracking-widest text-[#20304D]/60">
        due back
      </p>
      <p style={{ fontFamily: FONT_MONO }} className="text-sm">
        {formatDueDate(dueDate)}
      </p>
    </div>
  );
}

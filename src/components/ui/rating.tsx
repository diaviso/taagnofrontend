import { Star } from "lucide-react";
import { rating as fmtRating } from "@/lib/format";
import { cn } from "@/lib/utils";

/** « ★ 4,8 (12) » ou « Nouveau » sans avis. */
export function RatingPill({ value, count, className }: { value: number | null; count?: number; className?: string }) {
  if (value === null || !count) {
    return <span className={cn("rounded-full bg-brand-soft px-2 py-0.5 text-[11.5px] font-bold text-brand", className)}>Nouveau</span>;
  }
  return (
    <span className={cn("inline-flex items-center gap-1 text-[13px] font-bold text-ink", className)}>
      <Star className="h-3.5 w-3.5 fill-gold text-gold" />
      {fmtRating(value)}
      <span className="font-medium text-muted">({count})</span>
    </span>
  );
}

export function Stars({ value, size = 16, className }: { value: number; size?: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-label={`${value} sur 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className={i <= Math.round(value) ? "fill-gold text-gold" : "fill-line text-line"}
        />
      ))}
    </span>
  );
}

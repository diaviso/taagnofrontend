import { Star } from "lucide-react";

// Affiche la note moyenne (à partir de la somme + nombre d'avis dénormalisés),
// ou « Nouveau » si l'utilisateur n'a pas encore reçu d'avis.
export function RatingDisplay({
  sum,
  count,
  size = 14,
  showCount = true,
  className = "",
}: {
  sum?: number | null;
  count?: number | null;
  size?: number;
  showCount?: boolean;
  className?: string;
}) {
  const c = count ?? 0;
  if (c === 0) {
    return (
      <span className={`inline-flex items-center gap-1 text-xs text-muted-foreground ${className}`}>
        <Star style={{ width: size, height: size }} className="fill-muted-foreground/20 text-muted-foreground/30" />
        Nouveau
      </span>
    );
  }
  const avg = (sum ?? 0) / c;
  return (
    <span className={`inline-flex items-center gap-1 text-xs ${className}`}>
      <Star style={{ width: size, height: size }} className="fill-amber-400 text-amber-400" />
      <span className="font-semibold">{avg.toFixed(1)}</span>
      {showCount && <span className="text-muted-foreground">({c})</span>}
    </span>
  );
}

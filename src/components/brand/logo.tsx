import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/** Volant du logo Taagno (même dessin que les applications). */
export function WheelMark({
  size = 40,
  light = false,
  animated = false,
  className,
}: {
  size?: number;
  /** Version blanche, posée sur le dégradé de la marque. */
  light?: boolean;
  /** Dessine le volant trait par trait à l'apparition. */
  animated?: boolean;
  className?: string;
}) {
  const stroke = light ? "var(--brand)" : "#fff";
  const draw = (len: number, delay: number) =>
    animated
      ? ({
          strokeDasharray: len,
          ["--len" as string]: len,
          animation: `wheel-draw 0.9s ${delay}s cubic-bezier(.65,0,.35,1) both`,
        } as CSSProperties)
      : undefined;
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center",
        light ? "bg-white" : "bg-brand-gradient shadow-glow",
        className,
      )}
      style={{ width: size, height: size, borderRadius: size * 0.3 }}
      aria-hidden
    >
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <circle cx="50" cy="50" r="30" fill="none" stroke={stroke} strokeWidth="8.5" strokeLinecap="round"
          transform="rotate(-90 50 50)" style={draw(189, 0)} />
        <g stroke={stroke} strokeWidth="7" strokeLinecap="round">
          <line x1="50" y1="50" x2="20.6" y2="55.4" style={draw(31, 0.45)} />
          <line x1="50" y1="50" x2="79.4" y2="55.4" style={draw(31, 0.55)} />
          <line x1="50" y1="50" x2="50" y2="80" style={draw(31, 0.65)} />
        </g>
        <circle cx="50" cy="50" r="8.5" fill={stroke} />
      </svg>
    </span>
  );
}

/** Logo complet : volant + « taag·no » (le « no » en ambre) + suffixe éventuel (« Pro »). */
export function Logo({
  size = 38,
  light = false,
  suffix,
  animated,
  className,
}: {
  size?: number;
  light?: boolean;
  suffix?: string;
  animated?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center", className)} style={{ gap: size * 0.26 }}>
      <WheelMark size={size} light={light} animated={animated} />
      <span
        className="font-black leading-none tracking-[-0.045em]"
        style={{ fontSize: size * 0.62, color: light ? "#fff" : "var(--brand-word)" }}
      >
        taag<span style={{ color: light ? "#ffd27a" : "var(--brand-no)" }}>no</span>
      </span>
      {suffix && (
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wider",
            light ? "bg-white/20 text-white" : "bg-brand-soft text-brand",
          )}
        >
          {suffix}
        </span>
      )}
    </span>
  );
}

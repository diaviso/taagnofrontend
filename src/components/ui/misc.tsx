"use client";

import { motion } from "framer-motion";
import { Check, Minus, Plus } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** État vide : icône dans un halo, titre, texte et action. */
export function EmptyState({
  icon,
  title,
  text,
  action,
  className,
}: {
  icon: ReactNode;
  title: string;
  text?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn("flex flex-col items-center px-6 py-14 text-center", className)}
    >
      <div className="relative mb-5">
        <span className="absolute inset-0 animate-pulse-ring rounded-full bg-brand/15" />
        <span className="relative flex h-18 w-18 items-center justify-center rounded-full bg-brand-soft text-brand [&_svg]:h-8 [&_svg]:w-8">
          {icon}
        </span>
      </div>
      <h3 className="text-[18px] font-extrabold tracking-tight text-ink">{title}</h3>
      {text && <p className="mt-1.5 max-w-sm text-[14.5px] leading-relaxed text-muted">{text}</p>}
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-[14px]", className)} />;
}

/** Carte blanche standard. */
export function Card({ className, children, as: Tag = "div" }: { className?: string; children: ReactNode; as?: "div" | "section" | "article" }) {
  return <Tag className={cn("rounded-[22px] border border-line/70 bg-white shadow-card", className)}>{children}</Tag>;
}

/** Sélecteur à pastille glissante (onglets courts). */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
  layoutId,
  size = "md",
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: ReactNode; count?: number }[];
  className?: string;
  layoutId: string;
  size?: "sm" | "md";
}) {
  return (
    <div className={cn("inline-flex rounded-[14px] bg-surface-alt p-1", className)} role="tablist">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "relative flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-[11px] font-bold transition-colors",
              size === "sm" ? "h-8 px-3 text-[13px]" : "h-10 px-4 text-[14px]",
              active ? "text-ink" : "text-muted hover:text-ink",
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-[11px] bg-white shadow-card"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative flex items-center gap-1.5">
              {o.label}
              {o.count !== undefined && o.count > 0 && (
                <span className={cn("rounded-full px-1.5 text-[11px] leading-[18px]", active ? "bg-brand text-white" : "bg-line text-ink-soft")}>
                  {o.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Compteur – / + (places, jours). */
export function Counter({
  value,
  onChange,
  min = 1,
  max = 8,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  label?: string;
}) {
  const btn =
    "flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-ink transition hover:border-brand/50 hover:text-brand active:scale-90 disabled:opacity-35";
  return (
    <div className="inline-flex items-center gap-3" aria-label={label}>
      <button type="button" className={btn} disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))} aria-label="Moins">
        <Minus className="h-4 w-4" />
      </button>
      <motion.span
        key={value}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-8 text-center text-[20px] font-extrabold tabular-nums text-ink"
      >
        {value}
      </motion.span>
      <button type="button" className={btn} disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))} aria-label="Plus">
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

/** Pastilles à cocher (options d'un trajet ou d'une location). */
export function ChipToggle({
  selected,
  onClick,
  children,
  icon,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[13.5px] font-semibold transition-all active:scale-95",
        selected
          ? "border-brand bg-brand-soft text-brand shadow-[inset_0_0_0_1px_var(--brand)]"
          : "border-line bg-white text-ink-soft hover:border-brand/40",
      )}
    >
      {selected ? <Check className="h-4 w-4" /> : icon}
      {children}
    </button>
  );
}

/** Titre de section avec action à droite. */
export function SectionTitle({ title, subtitle, action, className }: { title: ReactNode; subtitle?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("mb-4 flex items-end justify-between gap-4", className)}>
      <div>
        <h2 className="text-[20px] font-extrabold tracking-tight text-ink sm:text-[22px]">{title}</h2>
        {subtitle && <p className="mt-0.5 text-[14px] text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/** Ligne « libellé — valeur » d'un récapitulatif. */
export function InfoRow({ icon, label, value, className }: { icon?: ReactNode; label: ReactNode; value: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-start gap-3 py-2.5", className)}>
      {icon && <span className="mt-0.5 text-muted [&_svg]:h-[18px] [&_svg]:w-[18px]">{icon}</span>}
      <span className="flex-1 text-[14px] text-muted">{label}</span>
      <span className="text-right text-[14px] font-bold text-ink">{value}</span>
    </div>
  );
}

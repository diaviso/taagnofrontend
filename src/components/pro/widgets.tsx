"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { fcfa, fcfaCompact, monthShort } from "@/lib/format";
import type { MonthEarnings } from "@/lib/pro";
import { cn } from "@/lib/utils";

/** En-tête d'une page de l'espace Pro. */
export function ProPageHeader({ title, subtitle, actions, back }: { title: ReactNode; subtitle?: ReactNode; actions?: ReactNode; back?: ReactNode }) {
  return (
    <div className="mb-6">
      {back}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-[26px] font-extrabold leading-tight tracking-tight text-ink sm:text-[30px]">{title}</h1>
          {subtitle && <p className="mt-1 text-[14.5px] text-muted">{subtitle}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}

/** Indicateur chiffré du tableau de bord. */
export function Kpi({ icon, label, value, hint, tone = "brand", index = 0, highlight }: { icon: ReactNode; label: string; value: ReactNode; hint?: string; tone?: "brand" | "carpool" | "rental" | "danger"; index?: number; highlight?: boolean }) {
  const colors = {
    brand: "bg-brand-soft text-brand",
    carpool: "bg-carpool/10 text-carpool",
    rental: "bg-rental/10 text-rental",
    danger: "bg-danger/10 text-danger",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className={cn("rounded-[22px] border bg-white p-5 shadow-card", highlight ? "border-danger/30 ring-4 ring-danger/5" : "border-line/70")}
    >
      <span className={cn("flex h-10 w-10 items-center justify-center rounded-[12px] [&_svg]:h-5 [&_svg]:w-5", colors[tone])}>{icon}</span>
      <p className="mt-4 text-[26px] font-extrabold leading-none tracking-tight text-ink">{value}</p>
      <p className="mt-1.5 text-[13.5px] font-semibold text-muted">{label}</p>
      {hint && <p className="mt-0.5 text-[12px] text-faint">{hint}</p>}
    </motion.div>
  );
}

/** Graphique en barres des gains estimés (covoiturage + location). */
export function EarningsChart({ months }: { months: MonthEarnings[] }) {
  const max = Math.max(1, ...months.map((m) => m.carpool + m.rental));
  const total = months.reduce((s, m) => s + m.carpool + m.rental, 0);
  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[17px] font-extrabold text-ink">Gains estimés</p>
          <p className="text-[13px] text-muted">Les 6 derniers mois · {fcfa(total)}</p>
        </div>
        <div className="flex gap-3 text-[12px] font-semibold text-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-carpool" /> Covoiturage
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rental" /> Location
          </span>
        </div>
      </div>
      <div className="mt-6 flex h-44 items-end gap-3">
        {months.map((m, i) => {
          const sum = m.carpool + m.rental;
          const h = (sum / max) * 100;
          const current = i === months.length - 1;
          return (
            <div key={m.month.toISOString()} className="group flex h-full flex-1 flex-col items-center justify-end gap-2">
              <span className="text-[11.5px] font-bold text-ink-soft opacity-0 transition group-hover:opacity-100">{sum ? fcfaCompact(sum) : ""}</span>
              <motion.div
                className="flex w-full max-w-[44px] flex-col-reverse overflow-hidden rounded-[10px] bg-surface-alt"
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(h, 3)}%` }}
                transition={{ duration: 0.7, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              >
                {sum > 0 && (
                  <>
                    <div className="bg-carpool" style={{ height: `${(m.carpool / sum) * 100}%` }} />
                    <div className="bg-rental" style={{ height: `${(m.rental / sum) * 100}%` }} />
                  </>
                )}
              </motion.div>
              <span className={cn("text-[12px] font-bold", current ? "text-brand" : "text-muted")}>{monthShort(m.month)}</span>
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-[12px] text-faint">Estimation à partir des places et des locations confirmées. Les paiements se font directement entre vous.</p>
    </div>
  );
}

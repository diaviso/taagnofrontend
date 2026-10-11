"use client";

import { motion } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import type { DayPoint } from "@/lib/admin";
import { cn } from "@/lib/utils";

type Key = "users" | "trips" | "reservations" | "bookings";

const SERIES: { key: Key; label: string; color: string }[] = [
  { key: "users", label: "Inscriptions", color: "var(--success)" },
  { key: "trips", label: "Trajets", color: "var(--carpool)" },
  { key: "reservations", label: "Réservations", color: "var(--gold)" },
  { key: "bookings", label: "Locations", color: "var(--rental)" },
];

const W = 600;
const H = 200;
const PAD_TOP = 10;
const PAD_BOTTOM = 6;

const dayFormat = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", timeZone: "UTC" });
const dayLabel = (iso: string) => dayFormat.format(new Date(`${iso}T00:00:00Z`));

/** Plus petit palier « rond » au-dessus de la valeur (4, 5, 10, 20, 25, 50, 100…). */
function niceMax(value: number) {
  if (value <= 4) return 4;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  for (const step of [1, 2, 2.5, 5, 10]) if (step * magnitude >= value) return step * magnitude;
  return value;
}

/** Courbe lissée sans dépassement : les points de contrôle restent à la hauteur des extrémités. */
function curve(points: [number, number][]) {
  if (!points.length) return "";
  let d = `M${points[0][0].toFixed(2)} ${points[0][1].toFixed(2)}`;
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1];
    const [x1, y1] = points[i];
    const mid = (x0 + x1) / 2;
    d += ` C${mid.toFixed(2)} ${y0.toFixed(2)} ${mid.toFixed(2)} ${y1.toFixed(2)} ${x1.toFixed(2)} ${y1.toFixed(2)}`;
  }
  return d;
}

/**
 * Courbes des 30 derniers jours (inscriptions, trajets, réservations, locations).
 * Les traits sont dessinés en SVG étiré, les textes et les repères en HTML pour rester nets.
 */
export function TrendChart({ series }: { series: DayPoint[] }) {
  const [visible, setVisible] = useState<Record<Key, boolean>>({ users: true, trips: true, reservations: true, bookings: true });
  const [hover, setHover] = useState<number | null>(null);
  const area = useRef<HTMLDivElement>(null);
  const n = series.length;

  const totals = useMemo(
    () => Object.fromEntries(SERIES.map((s) => [s.key, series.reduce((sum, p) => sum + p[s.key], 0)])) as Record<Key, number>,
    [series],
  );
  const shown = SERIES.filter((s) => visible[s.key]);
  const max = niceMax(Math.max(1, ...shown.flatMap((s) => series.map((p) => p[s.key]))));

  const x = (i: number) => (n <= 1 ? W / 2 : (i / (n - 1)) * W);
  const y = (v: number) => H - PAD_BOTTOM - (v / max) * (H - PAD_TOP - PAD_BOTTOM);
  const yPercent = (v: number) => (y(v) / H) * 100;

  const toggle = (key: Key) => {
    const on = SERIES.filter((s) => visible[s.key]);
    if (visible[key] && on.length === 1) return; // au moins une courbe reste affichée
    setVisible((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const track = (clientX: number) => {
    const box = area.current?.getBoundingClientRect();
    if (!box || box.width === 0 || n === 0) return;
    const ratio = Math.min(1, Math.max(0, (clientX - box.left) / box.width));
    setHover(Math.round(ratio * (n - 1)));
  };

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((r) => Math.round(r * (n - 1)));
  const point = hover !== null ? series[hover] : null;
  const hoverLeft = hover !== null && n > 1 ? (hover / (n - 1)) * 100 : 0;
  const align = hover === null ? "center" : hover < n * 0.2 ? "left" : hover > n * 0.8 ? "right" : "center";

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {SERIES.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => toggle(s.key)}
            aria-pressed={visible[s.key]}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] font-bold transition active:scale-95",
              visible[s.key] ? "border-line bg-white text-ink" : "border-transparent bg-surface-alt text-faint",
            )}
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: visible[s.key] ? s.color : "var(--line)" }} />
            {s.label}
            <span className={cn("tabular-nums", visible[s.key] ? "text-muted" : "text-faint")}>{totals[s.key]}</span>
          </button>
        ))}
      </div>

      <div className="mt-5 flex gap-2">
        {/* Repères de l'axe vertical */}
        <div className="relative w-7 shrink-0 text-right text-[11px] font-semibold tabular-nums text-faint" style={{ height: 200 }} aria-hidden>
          {[max, max / 2, 0].map((v) => (
            <span key={v} className="absolute right-0 -translate-y-1/2" style={{ top: `${yPercent(v)}%` }}>
              {Number.isInteger(v) ? v : v.toFixed(1).replace(".", ",")}
            </span>
          ))}
        </div>

        <div className="min-w-0 flex-1">
          <div
            ref={area}
            className="relative h-[200px] touch-pan-y select-none"
            onPointerMove={(e) => track(e.clientX)}
            onPointerDown={(e) => track(e.clientX)}
            onPointerLeave={() => setHover(null)}
            role="img"
            aria-label={`Courbes d’activité sur ${n} jours : ${SERIES.map((s) => `${totals[s.key]} ${s.label.toLowerCase()}`).join(", ")}`}
          >
            <motion.div className="absolute inset-0" initial={{ clipPath: "inset(0 100% 0 0)" }} animate={{ clipPath: "inset(0 0% 0 0)" }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}>
              <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-full w-full overflow-visible" aria-hidden>
                {[0, 0.5, 1].map((r) => (
                  <line key={r} x1={0} x2={W} y1={y(max * r)} y2={y(max * r)} stroke="var(--line)" strokeWidth={1} strokeDasharray={r === 0 ? undefined : "4 5"} vectorEffect="non-scaling-stroke" />
                ))}
                {shown.map((s) => (
                  <path
                    key={s.key}
                    d={curve(series.map((p, i) => [x(i), y(p[s.key])]))}
                    fill="none"
                    stroke={s.color}
                    strokeWidth={2.4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
              </svg>
            </motion.div>

            {point && hover !== null && (
              <>
                <span className="pointer-events-none absolute inset-y-0 w-px bg-ink/15" style={{ left: `${hoverLeft}%` }} />
                {shown.map((s) => (
                  <span
                    key={s.key}
                    className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
                    style={{ left: `${hoverLeft}%`, top: `${yPercent(point[s.key])}%`, background: s.color }}
                  />
                ))}
                <div
                  className={cn(
                    "pointer-events-none absolute top-0 z-10 w-max min-w-[130px] rounded-[14px] border border-line bg-white px-3 py-2 shadow-lift",
                    align === "center" ? "-translate-x-1/2" : align === "right" ? "-translate-x-full" : "",
                  )}
                  style={{ left: `${hoverLeft}%` }}
                >
                  <p className="text-[12px] font-extrabold text-ink">{dayLabel(point.date)}</p>
                  <ul className="mt-1 space-y-0.5">
                    {SERIES.map((s) => (
                      <li key={s.key} className={cn("flex items-center gap-2 text-[12px]", !visible[s.key] && "hidden")}>
                        <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                        <span className="flex-1 text-muted">{s.label}</span>
                        <span className="font-extrabold tabular-nums text-ink">{point[s.key]}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>

          <div className="mt-2 flex justify-between text-[11.5px] font-semibold text-faint" aria-hidden>
            {ticks.map((i, k) => (
              <span key={k} className={cn(k % 2 === 1 && "hidden sm:inline")}>
                {series[i] ? dayLabel(series[i].date) : ""}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

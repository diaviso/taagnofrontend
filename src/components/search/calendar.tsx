"use client";

import { addDays, addMonths, isAfter, isBefore, isSameDay, isSameMonth, startOfMonth, startOfWeek } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { monthYear, startOfDay } from "@/lib/format";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];

type CalendarProps =
  | { mode: "single"; value: Date | null; onChange: (d: Date) => void; min?: Date; isDisabled?: (d: Date) => boolean }
  | {
      mode: "range";
      start: Date | null;
      end: Date | null;
      onChange: (start: Date | null, end: Date | null) => void;
      min?: Date;
      /** Jours indisponibles (déjà loués). */
      isDisabled?: (d: Date) => boolean;
    };

/** Calendrier mensuel en français : un jour (trajet) ou une période (location). */
export function Calendar(props: CalendarProps) {
  const today = startOfDay(new Date());
  const min = props.min ? startOfDay(props.min) : today;
  const initial = props.mode === "single" ? props.value : props.start;
  const [month, setMonth] = useState(startOfMonth(initial ?? today));
  const [dir, setDir] = useState(0);
  const [hover, setHover] = useState<Date | null>(null);

  const first = startOfWeek(month, { weekStartsOn: 1 });
  const days = Array.from({ length: 42 }, (_, i) => addDays(first, i));
  const canPrev = isAfter(month, startOfMonth(min));

  const shift = (n: number) => {
    setDir(n);
    setMonth((m) => addMonths(m, n));
  };

  const select = (d: Date) => {
    if (props.mode === "single") {
      props.onChange(d);
      return;
    }
    const { start, end } = props;
    if (!start || end || isBefore(d, start) || isSameDay(d, start)) {
      props.onChange(d, null);
    } else {
      props.onChange(start, d);
    }
  };

  const inRange = (d: Date) => {
    if (props.mode !== "range" || !props.start) return false;
    const end = props.end ?? hover;
    if (!end || !isAfter(end, props.start)) return false;
    return isAfter(d, props.start) && isBefore(d, end);
  };

  return (
    <div className="w-[300px] select-none">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => shift(-1)}
          disabled={!canPrev}
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink transition hover:bg-surface-alt disabled:opacity-25"
          aria-label="Mois précédent"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-[15px] font-extrabold text-ink">{monthYear(month)}</span>
        <button
          type="button"
          onClick={() => shift(1)}
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink transition hover:bg-surface-alt"
          aria-label="Mois suivant"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      <div className="grid grid-cols-7 text-center text-[11.5px] font-bold uppercase text-faint">
        {WEEKDAYS.map((w, i) => (
          <span key={i} className="py-1.5">
            {w}
          </span>
        ))}
      </div>
      <div className="relative overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false} custom={dir}>
          <motion.div
            key={month.toISOString()}
            custom={dir}
            initial={{ x: dir * 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -dir * 40, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-7 gap-y-1"
            onMouseLeave={() => setHover(null)}
          >
            {days.map((d) => {
              const disabled = isBefore(d, min) || !!props.isDisabled?.(d);
              const outside = !isSameMonth(d, month);
              const selected =
                props.mode === "single"
                  ? !!props.value && isSameDay(d, props.value)
                  : (!!props.start && isSameDay(d, props.start)) || (!!props.end && isSameDay(d, props.end));
              const between = inRange(d);
              const isToday = isSameDay(d, today);
              return (
                <div
                  key={d.toISOString()}
                  className={cn("flex justify-center", between && "bg-brand-soft", outside && "opacity-0 pointer-events-none")}
                >
                  <button
                    type="button"
                    disabled={disabled || outside}
                    onClick={() => select(d)}
                    onMouseEnter={() => setHover(d)}
                    className={cn(
                      "relative flex h-10 w-10 items-center justify-center rounded-full text-[14px] font-semibold transition",
                      disabled ? "text-faint/60 line-through decoration-faint/40" : "text-ink hover:bg-brand-soft",
                      between && "text-brand",
                      selected && "bg-brand-gradient font-extrabold text-white shadow-glow hover:bg-none",
                    )}
                  >
                    {d.getDate()}
                    {isToday && !selected && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-brand" />}
                  </button>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

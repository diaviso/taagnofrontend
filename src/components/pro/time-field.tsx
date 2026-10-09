"use client";

import * as Popover from "@radix-ui/react-popover";
import { Clock } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const TIMES = Array.from({ length: 24 * 4 }, (_, i) => `${String(Math.floor(i / 4)).padStart(2, "0")}:${String((i % 4) * 15).padStart(2, "0")}`);

/** Heure de départ (par quarts d'heure). */
export function TimeField({ value, onChange, label }: { value: string; onChange: (v: string) => void; label?: string }) {
  const [open, setOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      const el = listRef.current?.querySelector<HTMLElement>(`[data-time="${value}"]`);
      el?.scrollIntoView({ block: "center" });
    }, 20);
    return () => clearTimeout(t);
  }, [open, value]);

  return (
    <div>
      {label && <span className="mb-1.5 block text-[13.5px] font-bold text-ink">{label}</span>}
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button
            type="button"
            className="flex h-12 w-full items-center gap-3 rounded-[14px] border border-line bg-white px-3.5 text-left text-[15px] font-semibold text-ink transition hover:border-brand/40"
          >
            <Clock className="h-[18px] w-[18px] text-muted" />
            {value || <span className="font-medium text-faint">Choisir l’heure</span>}
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content align="start" sideOffset={8} className="z-[90] w-[220px] rounded-[18px] border border-line bg-white p-1.5 shadow-lift data-[state=open]:animate-[pop_.16s_ease-out]">
            <div ref={listRef} className="grid max-h-[280px] grid-cols-2 gap-1 overflow-y-auto">
              {TIMES.map((t) => (
                <button
                  key={t}
                  type="button"
                  data-time={t}
                  onClick={() => {
                    onChange(t);
                    setOpen(false);
                  }}
                  className={cn(
                    "rounded-[10px] py-2 text-[14px] font-bold tabular-nums transition",
                    t === value ? "bg-brand-gradient text-white" : "text-ink hover:bg-brand-soft hover:text-brand",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}

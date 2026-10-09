"use client";

import * as Popover from "@radix-ui/react-popover";
import { addDays } from "date-fns";
import { CalendarDays, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Modal } from "@/components/ui/modal";
import { day as fmtDay, range as fmtRange, rentalDays, startOfDay } from "@/lib/format";
import { useMediaQuery } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { Calendar } from "./calendar";

const triggerBase = "flex w-full items-center gap-3 text-left text-[15px] font-semibold outline-none transition";

/**
 * Calendrier dans une bulle (ordinateur) ou dans une feuille qui monte du bas (téléphone) :
 * il reste toujours entièrement visible.
 */
function Picker({
  open,
  onOpenChange,
  trigger,
  title,
  children,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  trigger: ReactNode;
  title: string;
  children: ReactNode;
}) {
  const desktop = useMediaQuery("(min-width: 640px)", true);
  if (!desktop) {
    return (
      <>
        <div onClick={() => onOpenChange(true)}>{trigger}</div>
        <Modal open={open} onOpenChange={onOpenChange} title={title} size="sm">
          <div className="flex flex-col items-center pb-2">{children}</div>
        </Modal>
      </>
    );
  }
  return (
    <Popover.Root open={open} onOpenChange={onOpenChange}>
      <Popover.Trigger asChild>{trigger}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={8}
          collisionPadding={12}
          className="z-[90] rounded-[22px] border border-line bg-white p-4 shadow-lift data-[state=open]:animate-[pop_.16s_ease-out]"
        >
          {children}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

const chip = "rounded-full border border-line px-3 py-1.5 text-[13px] font-bold text-ink-soft transition hover:border-brand/50 hover:text-brand";

/** Choix d'un jour (trajet). `null` = toutes dates. */
export function DateField({
  value,
  onChange,
  placeholder = "Toutes dates",
  bare,
  allowClear = true,
  label,
  className,
}: {
  value: Date | null;
  onChange: (d: Date | null) => void;
  placeholder?: string;
  bare?: boolean;
  allowClear?: boolean;
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const today = startOfDay(new Date());
  const pick = (d: Date | null) => {
    onChange(d);
    setOpen(false);
  };
  return (
    <div className={className}>
      {label && <span className={cn("mb-1.5 block text-[13.5px] font-bold text-ink", bare && "sr-only")}>{label}</span>}
      <Picker
        open={open}
        onOpenChange={setOpen}
        title={label ?? "Date"}
        trigger={
          <button
            type="button"
            className={cn(
              triggerBase,
              bare ? "h-14 px-3.5" : "h-12 rounded-[14px] border border-line bg-white px-3.5 hover:border-brand/40 focus:border-brand/60 focus:ring-4 focus:ring-brand/10",
            )}
          >
            <CalendarDays className="h-[18px] w-[18px] shrink-0 text-muted" />
            <span className={cn("flex-1 truncate", value ? "text-ink" : "font-medium text-faint")}>{value ? fmtDay(value) : placeholder}</span>
          </button>
        }
      >
        <div className="mb-3 flex w-[300px] flex-wrap gap-2">
          <button type="button" onClick={() => pick(today)} className={chip}>
            Aujourd’hui
          </button>
          <button type="button" onClick={() => pick(addDays(today, 1))} className={chip}>
            Demain
          </button>
          {allowClear && (
            <button type="button" onClick={() => pick(null)} className={chip}>
              Toutes dates
            </button>
          )}
        </div>
        <Calendar mode="single" value={value} onChange={pick} />
      </Picker>
    </div>
  );
}

/** Choix d'une période de location (fin exclusive : rendu du véhicule). */
export function DateRangeField({
  start,
  end,
  onChange,
  placeholder = "Choisir les dates",
  bare,
  label,
  className,
  minDays = 1,
  isDisabled,
}: {
  start: Date | null;
  end: Date | null;
  onChange: (start: Date | null, end: Date | null) => void;
  placeholder?: string;
  bare?: boolean;
  label?: string;
  className?: string;
  minDays?: number;
  /** Jours indisponibles (déjà loués). */
  isDisabled?: (d: Date) => boolean;
}) {
  const [open, setOpen] = useState(false);
  const days = start && end ? rentalDays(start, end) : 0;
  return (
    <div className={className}>
      {label && <span className={cn("mb-1.5 block text-[13.5px] font-bold text-ink", bare && "sr-only")}>{label}</span>}
      <div className="relative">
        <Picker
          open={open}
          onOpenChange={setOpen}
          title="Dates de location"
          trigger={
            <button
              type="button"
              className={cn(triggerBase, bare ? "h-14 px-3.5" : "h-12 rounded-[14px] border border-line bg-white px-3.5 hover:border-brand/40")}
            >
              <CalendarDays className="h-[18px] w-[18px] shrink-0 text-muted" />
              <span className={cn("flex-1 truncate pr-6", start ? "text-ink" : "font-medium text-faint")}>
                {start && end ? `${fmtRange(start, end)} · ${days} j` : start ? `À partir du ${fmtDay(start).toLowerCase()}` : placeholder}
              </span>
            </button>
          }
        >
          <p className="mb-3 w-[300px] text-[13px] font-semibold text-muted">
            {!start || end ? "Choisissez le jour de prise du véhicule." : "Choisissez maintenant le jour de retour."}
          </p>
          <Calendar
            mode="range"
            start={start}
            end={end}
            isDisabled={isDisabled}
            onChange={(s, e) => {
              if (s && e && rentalDays(s, e) < minDays) {
                onChange(s, addDays(s, minDays));
                setOpen(false);
                return;
              }
              onChange(s, e);
              if (s && e) setTimeout(() => setOpen(false), 180);
            }}
          />
          {minDays > 1 && <p className="mt-2 w-[300px] text-[12.5px] text-muted">Durée minimale : {minDays} jours.</p>}
        </Picker>
        {start && (
          <button
            type="button"
            onClick={() => onChange(null, null)}
            className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-faint hover:bg-surface-alt hover:text-ink"
            aria-label="Effacer les dates"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

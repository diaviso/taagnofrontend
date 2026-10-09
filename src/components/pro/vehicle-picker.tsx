"use client";

import { Car, Check } from "lucide-react";
import { cdn } from "@/lib/images";
import { coverUrl, vehicleTitle, type Vehicle } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Choix d'un véhicule (cartes cliquables). */
export function VehiclePicker({ vehicles, value, onChange, disabled }: { vehicles: Vehicle[]; value: string; onChange: (id: string) => void; disabled?: boolean }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {vehicles.map((v) => {
        const selected = v.id === value;
        const photo = cdn(coverUrl(v), 240);
        return (
          <button
            key={v.id}
            type="button"
            disabled={disabled && !selected}
            onClick={() => onChange(v.id)}
            className={cn(
              "relative flex items-center gap-3 rounded-[18px] border-2 bg-white p-2.5 text-left transition disabled:opacity-40",
              selected ? "border-brand shadow-glow" : "border-line hover:border-brand/40",
            )}
          >
            <span className="h-14 w-20 shrink-0 overflow-hidden rounded-[12px] bg-surface-alt">
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full items-center justify-center text-brand">
                  <Car className="h-6 w-6 opacity-60" />
                </span>
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[15px] font-extrabold text-ink">{vehicleTitle(v)}</span>
              <span className="block text-[12.5px] text-muted">
                {[v.color, v.numberOfSeats ? `${v.numberOfSeats} places` : null, v.licensePlate].filter(Boolean).join(" · ")}
              </span>
            </span>
            {selected && (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-white">
                <Check className="h-4 w-4" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

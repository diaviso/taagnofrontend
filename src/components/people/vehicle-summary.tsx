import { Car, Palette, Armchair, CalendarDays } from "lucide-react";
import { cdn } from "@/lib/images";
import { coverUrl, vehicleTitle, type Vehicle } from "@/lib/types";

/** Résumé du véhicule (photo, modèle, couleur, places). */
export function VehicleSummary({ vehicle }: { vehicle?: Vehicle | null }) {
  if (!vehicle) return null;
  const photo = cdn(coverUrl(vehicle), 400);
  return (
    <div className="flex items-center gap-4">
      <div className="h-20 w-28 shrink-0 overflow-hidden rounded-[16px] bg-surface-alt">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt={vehicleTitle(vehicle)} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-brand">
            <Car className="h-8 w-8 opacity-60" />
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate text-[16px] font-extrabold text-ink">{vehicleTitle(vehicle)}</p>
        <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[13px] font-medium text-muted">
          {vehicle.year && (
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" /> {vehicle.year}
            </span>
          )}
          {vehicle.color && (
            <span className="inline-flex items-center gap-1.5">
              <Palette className="h-3.5 w-3.5" /> {vehicle.color}
            </span>
          )}
          {vehicle.numberOfSeats && (
            <span className="inline-flex items-center gap-1.5">
              <Armchair className="h-3.5 w-3.5" /> {vehicle.numberOfSeats} places
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

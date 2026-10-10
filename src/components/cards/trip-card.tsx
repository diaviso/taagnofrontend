"use client";

import { motion } from "framer-motion";
import { Armchair, Zap } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { RatingPill } from "@/components/ui/rating";
import { tripKey } from "@/lib/favorites";
import { day, fcfa, plural, time } from "@/lib/format";
import { isInstant, shortName, userRating, vehicleTitle, type CarpoolTrip } from "@/lib/types";
import { cn } from "@/lib/utils";
import { FavoriteButton } from "./favorite-button";
import { OptionIcon } from "./option-icon";

/** Carte d'un trajet : horaires, villes, prix, conducteur. */
export function TripCard({ trip, index = 0, showDay = true }: { trip: CarpoolTrip; index?: number; showDay?: boolean }) {
  const instant = isInstant(trip);
  const few = trip.availableSeats > 0 && trip.availableSeats <= 2;
  const extras = (trip.options ?? []).filter((o) => o !== "INSTANT_BOOKING").slice(0, 4);
  return (
    <motion.div
      className="min-w-0"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index, 8) * 0.045 }}
    >
      <Link
        href={`/covoiturage/${trip.id}`}
        className="group block rounded-[22px] border border-line/70 bg-white p-4 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-lift sm:p-5"
      >
        <div className="flex items-start gap-4">
          <div className="min-w-0 flex-1">
            {showDay && <p className="mb-2 text-[12.5px] font-bold uppercase tracking-wide text-brand">{day(trip.departureTime)}</p>}
            <div className="flex gap-3">
              <div className="flex w-12 shrink-0 flex-col justify-between py-0.5 text-[15px] font-extrabold tabular-nums text-ink">
                <span>{time(trip.departureTime)}</span>
              </div>
              <div className="flex flex-col items-center pt-[7px]">
                <span className="h-2.5 w-2.5 rounded-full border-[2.5px] border-brand bg-white" />
                <span className="relative my-1 w-[2px] flex-1 rounded bg-gradient-to-b from-brand to-brand-g3/50">
                  <span className="absolute left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand opacity-0 shadow-glow group-hover:animate-[travel_1.4s_ease-in-out_infinite]" />
                </span>
                <span className="h-2.5 w-2.5 rounded-full bg-brand" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-4">
                <div className="min-w-0">
                  <p className="truncate text-[16px] font-extrabold text-ink">{trip.departureCity}</p>
                  {trip.meetingPoint && <p className="truncate text-[12.5px] text-muted">{trip.meetingPoint}</p>}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[16px] font-extrabold text-ink">{trip.arrivalCity}</p>
                  {trip.dropoffPoint && <p className="truncate text-[12.5px] text-muted">{trip.dropoffPoint}</p>}
                </div>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <FavoriteButton favKey={tripKey(trip.id)} />
            <div className="text-right">
              <p className="text-[19px] font-extrabold leading-none tracking-tight text-ink">{fcfa(trip.pricePerSeat)}</p>
              <p className="mt-1 text-[12px] font-medium text-muted">par place</p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-dashed border-line pt-3.5">
          <Avatar user={trip.driver} size={34} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-bold text-ink">{shortName(trip.driver)}</p>
            <div className="flex items-center gap-2 text-[12.5px] text-muted">
              <RatingPill value={userRating(trip.driver)} count={trip.driver?.ratingCount} className="text-[12.5px]" />
              {trip.vehicle && <span className="truncate">· {vehicleTitle(trip.vehicle)}</span>}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {extras.map((o) => (
              <span key={o} className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-alt text-ink-soft" title={o}>
                <OptionIcon option={o} className="h-3.5 w-3.5" />
              </span>
            ))}
            {instant && (
              <Badge tone="warning" icon={<Zap />}>
                Instantané
              </Badge>
            )}
            <Badge tone={few ? "danger" : "brand"} icon={<Armchair />} className={cn(trip.availableSeats === 0 && "opacity-60")}>
              {trip.availableSeats === 0 ? "Complet" : plural(trip.availableSeats, "place")}
            </Badge>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function TripCardSkeleton() {
  return (
    <div className="rounded-[22px] border border-line/70 bg-white p-5 shadow-card">
      <div className="flex gap-4">
        <div className="flex-1 space-y-3">
          <div className="skeleton h-3 w-20 rounded-full" />
          <div className="skeleton h-5 w-40 rounded-full" />
          <div className="skeleton h-5 w-32 rounded-full" />
        </div>
        <div className="skeleton h-6 w-24 rounded-full" />
      </div>
      <div className="mt-5 flex items-center gap-3 border-t border-dashed border-line pt-4">
        <div className="skeleton h-9 w-9 rounded-full" />
        <div className="skeleton h-4 w-32 rounded-full" />
      </div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { Armchair, Car, MapPin, UserRound } from "lucide-react";
import Link from "next/link";
import { RatingPill } from "@/components/ui/rating";
import { offerKey } from "@/lib/favorites";
import { fcfa } from "@/lib/format";
import { cdn } from "@/lib/images";
import { coverUrl, offerWithDriver, userRating, vehicleTitle, type RentalOffer } from "@/lib/types";
import { FavoriteButton } from "./favorite-button";
import { OptionIcon } from "./option-icon";

/** Carte d'une offre de location : photo, véhicule, ville, prix par jour. */
export function OfferCard({ offer, index = 0, days }: { offer: RentalOffer; index?: number; days?: number }) {
  const v = offer.vehicle;
  const photo = cdn(coverUrl(v), 720);
  const extras = (offer.options ?? []).filter((o) => o !== "WITH_DRIVER").slice(0, 3);
  return (
    <motion.div
      className="min-w-0"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index, 8) * 0.045 }}
    >
      <Link
        href={`/location/${offer.id}`}
        className="group block overflow-hidden rounded-[22px] border border-line/70 bg-white shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-surface-alt">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo}
              alt={vehicleTitle(v)}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-brand-soft text-brand">
              <Car className="h-14 w-14 opacity-60" />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/45 to-transparent" />
          <div className="absolute right-3 top-3">
            <FavoriteButton favKey={offerKey(offer.id)} onDark />
          </div>
          {offerWithDriver(offer) && (
            <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/92 px-2.5 py-1 text-[12px] font-bold text-ink shadow-soft backdrop-blur">
              <UserRound className="h-3.5 w-3.5 text-brand" /> Avec chauffeur possible
            </span>
          )}
          {v?.city && (
            <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 text-[13px] font-bold text-white">
              <MapPin className="h-3.5 w-3.5" /> {v.city}
            </span>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-[16px] font-extrabold text-ink">{vehicleTitle(v)}</h3>
              <p className="text-[13px] text-muted">
                {v?.year ? `${v.year} · ` : ""}
                {v?.numberOfSeats ? `${v.numberOfSeats} places` : ""}
              </p>
            </div>
            <RatingPill value={userRating(v?.owner)} count={v?.owner?.ratingCount} />
          </div>
          <div className="mt-3 flex items-end justify-between gap-2">
            <div className="flex gap-1.5">
              {v?.numberOfSeats ? (
                <span className="flex h-7 items-center gap-1 rounded-full bg-surface-alt px-2 text-[12px] font-bold text-ink-soft">
                  <Armchair className="h-3.5 w-3.5" /> {v.numberOfSeats}
                </span>
              ) : null}
              {extras.map((o) => (
                <span key={o} className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-alt text-ink-soft">
                  <OptionIcon option={o} className="h-3.5 w-3.5" />
                </span>
              ))}
            </div>
            <div className="text-right">
              <p className="text-[18px] font-extrabold leading-none tracking-tight text-ink">{fcfa(offer.pricePerDay)}</p>
              <p className="mt-1 text-[12px] text-muted">{days && days > 1 ? `${fcfa(offer.pricePerDay * days)} pour ${days} j` : "par jour"}</p>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function OfferCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[22px] border border-line/70 bg-white shadow-card">
      <div className="skeleton aspect-[4/3] rounded-none" />
      <div className="space-y-3 p-4">
        <div className="skeleton h-5 w-40 rounded-full" />
        <div className="skeleton h-4 w-24 rounded-full" />
      </div>
    </div>
  );
}

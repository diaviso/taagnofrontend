"use client";

import { useQueries } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { OfferCard, OfferCardSkeleton } from "@/components/cards/offer-card";
import { TripCard, TripCardSkeleton } from "@/components/cards/trip-card";
import { LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";
import { api } from "@/lib/api";
import { useFavorites } from "@/lib/favorites";
import type { CarpoolTrip, RentalOffer } from "@/lib/types";

/** Favoris enregistrés dans ce navigateur (trajets et voitures). */
export default function FavoritesPage() {
  const { list } = useFavorites();
  const tripIds = list.filter((k) => k.startsWith("trip:")).map((k) => k.slice(5));
  const offerIds = list.filter((k) => k.startsWith("offer:")).map((k) => k.slice(6));

  const trips = useQueries({
    queries: tripIds.map((id) => ({ queryKey: ["trip", id], queryFn: () => api.get<CarpoolTrip>(`/carpool/trips/${id}`), retry: false })),
  });
  const offers = useQueries({
    queries: offerIds.map((id) => ({ queryKey: ["offer", id], queryFn: () => api.get<RentalOffer>(`/rental/offers/${id}`), retry: false })),
  });

  const loadedTrips = trips.map((q) => q.data).filter((t): t is CarpoolTrip => !!t);
  const loadedOffers = offers.map((q) => q.data).filter((o): o is RentalOffer => !!o);
  const loading = [...trips, ...offers].some((q) => q.isPending);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-10 pt-6 sm:px-6 sm:pt-8">
      <h1 className="text-[26px] font-extrabold tracking-tight text-ink sm:text-[30px]">Favoris</h1>
      <p className="mt-1 text-[14px] text-muted">Touchez le cœur d’un trajet ou d’une voiture pour le retrouver ici.</p>

      {!list.length ? (
        <div className="mt-8 rounded-[24px] border border-dashed border-line bg-white">
          <EmptyState
            icon={<Heart />}
            title="Pas encore de favoris"
            text="Gardez de côté les trajets et les voitures qui vous plaisent, pour comparer ou réserver plus tard."
            action={<LinkButton href="/covoiturage">Explorer les trajets</LinkButton>}
          />
        </div>
      ) : (
        <div className="mt-8 space-y-10">
          {tripIds.length > 0 && (
            <section>
              <h2 className="mb-3 text-[13px] font-extrabold uppercase tracking-wider text-brand">Trajets</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {loading && !loadedTrips.length
                  ? tripIds.map((id) => <TripCardSkeleton key={id} />)
                  : loadedTrips.map((t, i) => <TripCard key={t.id} trip={t} index={i} />)}
              </div>
            </section>
          )}
          {offerIds.length > 0 && (
            <section>
              <h2 className="mb-3 text-[13px] font-extrabold uppercase tracking-wider text-brand">Voitures</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {loading && !loadedOffers.length
                  ? offerIds.map((id) => <OfferCardSkeleton key={id} />)
                  : loadedOffers.map((o, i) => <OfferCard key={o.id} offer={o} index={i} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useQueries } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { OfferCard, OfferCardSkeleton } from "@/components/cards/offer-card";
import { TripCard, TripCardSkeleton } from "@/components/cards/trip-card";
import { LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";
import { api, ApiError } from "@/lib/api";
import { offerKey, tripKey, useFavorites } from "@/lib/favorites";
import { isBookable, isPastTrip, type CarpoolTrip, type RentalOffer } from "@/lib/types";

/** Trajet favori qui n'est plus réservable : pourquoi. */
function tripUnavailable(t: CarpoolTrip) {
  if (t.status === "CANCELLED") return "Trajet annulé";
  if (isPastTrip(t) || t.status === "COMPLETED") return "Trajet passé";
  if (!isBookable(t)) return "Complet";
  return null;
}

function offerUnavailable(o: RentalOffer) {
  if (!o.isActive || o.vehicle?.isActive === false || (o.vehicle?.status && o.vehicle.status !== "APPROVED")) return "En pause";
  return null;
}

function Unavailable({ label, children }: { label: string | null; children: ReactNode }) {
  if (!label) return <>{children}</>;
  return (
    <div className="relative">
      <div className="opacity-55 grayscale-[40%]">{children}</div>
      <span className="pointer-events-none absolute left-4 top-4 rounded-full bg-ink/85 px-3 py-1 text-[12px] font-bold text-white shadow-soft">
        Plus disponible · {label}
      </span>
    </div>
  );
}

/** Favoris enregistrés dans ce navigateur (trajets et voitures). */
export default function FavoritesPage() {
  const { list, remove } = useFavorites();
  const tripIds = list.filter((k) => k.startsWith("trip:")).map((k) => k.slice(5));
  const offerIds = list.filter((k) => k.startsWith("offer:")).map((k) => k.slice(6));

  const trips = useQueries({
    queries: tripIds.map((id) => ({ queryKey: ["trip", id], queryFn: () => api.get<CarpoolTrip>(`/carpool/trips/${id}`), retry: false })),
  });
  const offers = useQueries({
    queries: offerIds.map((id) => ({ queryKey: ["offer", id], queryFn: () => api.get<RentalOffer>(`/rental/offers/${id}`), retry: false })),
  });

  // Un favori supprimé entre-temps (404) quitte la liste.
  const gone = [
    ...trips.flatMap((q, i) => (q.error instanceof ApiError && q.error.status === 404 ? [tripKey(tripIds[i])] : [])),
    ...offers.flatMap((q, i) => (q.error instanceof ApiError && q.error.status === 404 ? [offerKey(offerIds[i])] : [])),
  ];
  const goneKey = gone.join(",");
  useEffect(() => {
    if (goneKey) goneKey.split(",").forEach(remove);
    // `remove` change à chaque rendu ; seules les clés comptent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goneKey]);

  const loadedTrips = trips.map((q) => q.data).filter((t): t is CarpoolTrip => !!t);
  const loadedOffers = offers.map((q) => q.data).filter((o): o is RentalOffer => !!o);
  const tripsLoading = trips.some((q) => q.isPending);
  const offersLoading = offers.some((q) => q.isPending);
  // Les trajets encore réservables d'abord.
  loadedTrips.sort((a, b) => Number(!!tripUnavailable(a)) - Number(!!tripUnavailable(b)));

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
          {(tripsLoading || loadedTrips.length > 0) && (
            <section>
              <h2 className="mb-3 text-[13px] font-extrabold uppercase tracking-wider text-brand">Trajets</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {tripsLoading && !loadedTrips.length
                  ? tripIds.map((id) => <TripCardSkeleton key={id} />)
                  : loadedTrips.map((t, i) => (
                      <Unavailable key={t.id} label={tripUnavailable(t)}>
                        <TripCard trip={t} index={i} />
                      </Unavailable>
                    ))}
              </div>
            </section>
          )}
          {(offersLoading || loadedOffers.length > 0) && (
            <section>
              <h2 className="mb-3 text-[13px] font-extrabold uppercase tracking-wider text-brand">Voitures</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {offersLoading && !loadedOffers.length
                  ? offerIds.map((id) => <OfferCardSkeleton key={id} />)
                  : loadedOffers.map((o, i) => (
                      <Unavailable key={o.id} label={offerUnavailable(o)}>
                        <OfferCard offer={o} index={i} />
                      </Unavailable>
                    ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

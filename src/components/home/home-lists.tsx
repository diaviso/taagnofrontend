"use client";

import { ArrowRight, Route } from "lucide-react";
import Link from "next/link";
import { OfferCard, OfferCardSkeleton } from "@/components/cards/offer-card";
import { TripCard, TripCardSkeleton } from "@/components/cards/trip-card";
import { LinkButton } from "@/components/ui/button";
import { EmptyState, SectionTitle } from "@/components/ui/misc";
import { useOfferSearch, useTripSearch } from "@/lib/queries";

/** Prochains départs publiés (preuve que la plateforme vit). */
export function UpcomingTrips() {
  const { data, isPending } = useTripSearch({});
  const trips = (data ?? []).slice(0, 6);
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6">
      <SectionTitle
        title="Prochains départs"
        subtitle="Des places disponibles dans les jours qui viennent"
        action={<SeeAll href="/covoiturage" />}
      />
      {isPending ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <TripCardSkeleton key={i} />
          ))}
        </div>
      ) : trips.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {trips.map((t, i) => (
            <TripCard key={t.id} trip={t} index={i} />
          ))}
        </div>
      ) : (
        <div className="rounded-[24px] border border-dashed border-line bg-white">
          <EmptyState
            icon={<Route />}
            title="Aucun départ pour le moment"
            text="Créez une alerte depuis la recherche : vous serez prévenu dès qu’un trajet est publié."
            action={<LinkButton href="/covoiturage">Rechercher un trajet</LinkButton>}
          />
        </div>
      )}
    </section>
  );
}

/** Quelques voitures à louer. */
export function FeaturedOffers() {
  const { data, isPending } = useOfferSearch({});
  const offers = (data ?? []).slice(0, 6);
  if (!isPending && !offers.length) return null;
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6">
      <SectionTitle title="Voitures à louer" subtitle="Avec ou sans chauffeur, chez des particuliers" action={<SeeAll href="/location" />} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isPending
          ? [0, 1, 2].map((i) => <OfferCardSkeleton key={i} />)
          : offers.map((o, i) => <OfferCard key={o.id} offer={o} index={i} />)}
      </div>
    </section>
  );
}

function SeeAll({ href }: { href: string }) {
  return (
    <Link href={href} className="group inline-flex shrink-0 items-center gap-1 text-[14px] font-bold text-brand">
      Tout voir <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

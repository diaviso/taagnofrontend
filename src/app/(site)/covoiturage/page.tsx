import type { Metadata } from "next";
import { Suspense } from "react";
import { TripSearchPage } from "@/components/search/trip-search-page";
import { PageSpinner } from "@/components/ui/spinner";

export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
  const p = await searchParams;
  const from = typeof p.from === "string" ? p.from : "";
  const to = typeof p.to === "string" ? p.to : "";
  const title = from && to ? `Covoiturage ${from} → ${to}` : "Covoiturage au Sénégal";
  return {
    title,
    description: from && to
      ? `Trajets en covoiturage de ${from} à ${to} : horaires, prix par place et avis des conducteurs. Réservez votre place sur Taagno.`
      : "Trouvez un trajet en covoiturage partout au Sénégal : Dakar, Touba, Thiès, Saint-Louis, Mbour, Kaolack…",
  };
}

export default function CovoituragePage() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <TripSearchPage />
    </Suspense>
  );
}

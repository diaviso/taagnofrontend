import type { Metadata } from "next";
import { Suspense } from "react";
import { RentalSearchPage } from "@/components/search/rental-search-page";
import { PageSpinner } from "@/components/ui/spinner";

export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
  const p = await searchParams;
  const city = typeof p.city === "string" ? p.city : "";
  return {
    title: city ? `Location de voiture à ${city}` : "Location de voiture entre particuliers",
    description: `Louez une voiture${city ? ` à ${city}` : " au Sénégal"}, avec ou sans chauffeur, directement auprès de propriétaires vérifiés. Prix par jour, caution et avis.`,
  };
}

export default function LocationPage() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <RentalSearchPage />
    </Suspense>
  );
}

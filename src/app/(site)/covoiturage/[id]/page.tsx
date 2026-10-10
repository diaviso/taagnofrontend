import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TripDetail } from "@/components/booking/trip-detail";
import { fcfa } from "@/lib/format";
import { isUuid, serverFetch } from "@/lib/server-api";
import type { CarpoolTrip } from "@/lib/types";

type Props = { params: Promise<{ id: string }> };

const fetchTrip = (id: string) => serverFetch<CarpoolTrip>(`/carpool/trips/${encodeURIComponent(id)}`, 30);
const getTrip = async (id: string) => (await fetchTrip(id)).data;

function whenLabel(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Dakar" }).format(new Date(iso));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const trip = await getTrip(id);
  if (!trip) return { title: "Trajet introuvable" };
  const title = `${trip.departureCity} → ${trip.arrivalCity} · ${fcfa(trip.pricePerSeat)}`;
  const description = `Covoiturage ${trip.departureCity} → ${trip.arrivalCity}, ${whenLabel(trip.departureTime)}. ${trip.availableSeats} place(s) à ${fcfa(trip.pricePerSeat)}. Réservez sur Taagno.`;
  return { title, description, openGraph: { title, description } };
}

export default async function TripPage({ params }: Props) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const { data: trip, notFound: missing } = await fetchTrip(id);
  if (missing) notFound();
  return <TripDetail id={id} initial={trip} />;
}

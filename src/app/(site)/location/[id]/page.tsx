import type { Metadata } from "next";
import { OfferDetail } from "@/components/booking/offer-detail";
import { fcfa } from "@/lib/format";
import { serverGet } from "@/lib/server-api";
import { coverUrl, vehicleTitleYear, type RentalOffer } from "@/lib/types";

type Props = { params: Promise<{ id: string }> };

const getOffer = (id: string) => serverGet<RentalOffer>(`/rental/offers/${encodeURIComponent(id)}`, 60);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const offer = await getOffer(id);
  if (!offer) return { title: "Annonce introuvable" };
  const v = offer.vehicle;
  const title = `${vehicleTitleYear(v)} à louer${v?.city ? ` à ${v.city}` : ""}`;
  const description = `${fcfa(offer.pricePerDay)} par jour${offer.depositAmount ? `, caution ${fcfa(offer.depositAmount)}` : ""}. Location entre particuliers sur Taagno.`;
  const image = coverUrl(v);
  return { title, description, openGraph: { title, description, images: image ? [image] : undefined } };
}

export default async function OfferPage({ params }: Props) {
  const { id } = await params;
  const offer = await getOffer(id);
  return <OfferDetail id={id} initial={offer} />;
}

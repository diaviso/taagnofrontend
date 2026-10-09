"use client";

import type { ReactNode } from "react";
import { ArrowLeft, Eye, KeyRound, MapPin, Pencil, ShieldCheck, UserRound } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { RentalRequestCard } from "@/components/pro/request-cards";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { Switch } from "@/components/ui/field";
import { Gallery } from "@/components/ui/gallery";
import { Card, EmptyState } from "@/components/ui/misc";
import { PageSpinner } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import { fcfa, plural } from "@/lib/format";
import { groupRentalRequests } from "@/lib/pro";
import { useAction, useMyOffers } from "@/lib/queries";
import { orderedPhotos, rentalOptionLabel, vehicleTitle, vehicleTitleYear } from "@/lib/types";

export default function ManageOfferPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isPending } = useMyOffers();
  const { run, busy } = useAction();
  const offer = data?.find((o) => o.id === id);

  if (isPending) return <PageSpinner />;
  if (!offer) return <EmptyState icon={<KeyRound />} title="Annonce introuvable" action={<LinkButton href="/pro/locations">Mes locations</LinkButton>} />;

  const groups = groupRentalRequests([offer]);
  const v = offer.vehicle;

  return (
    <div>
      <Link href="/pro/locations" className="mb-3 inline-flex items-center gap-1.5 text-[14px] font-bold text-ink-soft hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Mes locations
      </Link>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <Gallery photos={orderedPhotos(v).map((p) => p.url)} alt={vehicleTitle(v)} />
          <div>
            <h1 className="text-[26px] font-extrabold tracking-tight text-ink sm:text-[30px]">{vehicleTitleYear(v)}</h1>
            <div className="mt-2 flex flex-wrap gap-2">
              {v?.city && (
                <Badge tone="muted" icon={<MapPin />}>
                  {v.city}
                </Badge>
              )}
              {(offer.options ?? []).map((o) => (
                <Badge key={o} tone="brand">
                  {rentalOptionLabel(o)}
                </Badge>
              ))}
            </div>
          </div>

          <section>
            <h2 className="mb-3 text-[13px] font-extrabold uppercase tracking-wider text-brand">Demandes en attente · {groups.pending.length}</h2>
            {groups.pending.length ? (
              <div className="grid gap-4 xl:grid-cols-2">
                {groups.pending.map((r, i) => (
                  <RentalRequestCard key={r.booking.id} request={r} showOffer={false} index={i} />
                ))}
              </div>
            ) : (
              <Card className="p-6 text-center text-[14px] text-muted">Aucune demande en attente. Vous serez prévenu dès qu’un client demande vos dates.</Card>
            )}
          </section>
          {groups.confirmed.length > 0 && (
            <section>
              <h2 className="mb-3 text-[13px] font-extrabold uppercase tracking-wider text-muted">Locations confirmées · {groups.confirmed.length}</h2>
              <div className="grid gap-4 xl:grid-cols-2">
                {groups.confirmed.map((r, i) => (
                  <RentalRequestCard key={r.booking.id} request={r} showOffer={false} index={i} />
                ))}
              </div>
            </section>
          )}
          {groups.history.length > 0 && (
            <section>
              <h2 className="mb-3 text-[13px] font-extrabold uppercase tracking-wider text-muted">Historique</h2>
              <div className="grid gap-4 xl:grid-cols-2">
                {groups.history.slice(0, 20).map((r, i) => (
                  <RentalRequestCard key={r.booking.id} request={r} showOffer={false} index={i} />
                ))}
              </div>
            </section>
          )}
        </div>

        <div>
          <div className="sticky top-[96px] space-y-4">
            <Card className="p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[15px] font-extrabold text-ink">{offer.isActive ? "Annonce en ligne" : "Annonce en pause"}</p>
                  <p className="text-[12.5px] text-muted">{offer.isActive ? "Visible par les voyageurs" : "Invisible dans les recherches"}</p>
                </div>
                <Switch
                  checked={offer.isActive}
                  disabled={busy === "active"}
                  label="Annonce en ligne"
                  onChange={(next) =>
                    run("active", () => api.patch(`/rental/offers/${offer.id}`, { isActive: next }), {
                      success: next ? "Annonce remise en ligne." : "Annonce mise en pause.",
                      invalidate: [["offers"], ["offer", offer.id]],
                    })
                  }
                />
              </div>
            </Card>
            <Card className="space-y-3 p-5">
              <Row icon={<KeyRound />} label="Prix par jour" value={fcfa(offer.pricePerDay)} />
              <Row icon={<ShieldCheck />} label="Caution" value={offer.depositAmount ? fcfa(offer.depositAmount) : "Aucune"} />
              <Row icon={<KeyRound />} label="Durée minimale" value={plural(offer.minDays, "jour")} />
              {offer.driverPricePerDay ? <Row icon={<UserRound />} label="Chauffeur" value={`+ ${fcfa(offer.driverPricePerDay)} / jour`} /> : null}
              {offer.pickupLocation && <Row icon={<MapPin />} label="Remise des clés" value={offer.pickupLocation} />}
              <div className="flex flex-wrap gap-2 pt-2">
                <LinkButton href={`/pro/locations/${offer.id}/modifier`} variant="outline" size="sm" icon={<Pencil className="h-4 w-4" />}>
                  Modifier
                </LinkButton>
                <LinkButton href={`/location/${offer.id}`} variant="ghost" size="sm" icon={<Eye className="h-4 w-4" />}>
                  Voir l’annonce
                </LinkButton>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-muted [&_svg]:h-[18px] [&_svg]:w-[18px]">{icon}</span>
      <span className="flex-1 text-[14px] text-muted">{label}</span>
      <span className="text-right text-[14px] font-bold text-ink">{value}</span>
    </div>
  );
}

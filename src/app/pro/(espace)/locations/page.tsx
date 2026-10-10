"use client";

import { motion } from "framer-motion";
import { Car, ChevronRight, KeyRound, Plus } from "lucide-react";
import Link from "next/link";
import { ProPageHeader } from "@/components/pro/widgets";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { EmptyState, Skeleton } from "@/components/ui/misc";
import { fcfa, plural } from "@/lib/format";
import { cdn } from "@/lib/images";
import { offerVisibility } from "@/lib/pro";
import { useMyOffers } from "@/lib/queries";
import { coverUrl, pendingCount, vehicleTitleYear } from "@/lib/types";

export default function OffersPage() {
  const { data, isPending } = useMyOffers();
  return (
    <div>
      <ProPageHeader
        title="Mes locations"
        subtitle="Vos véhicules à louer et leurs demandes."
        actions={
          <LinkButton href="/pro/locations/nouvelle" icon={<Plus className="h-4.5 w-4.5" />}>
            Louer un véhicule
          </LinkButton>
        }
      />
      {isPending ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-40 rounded-[22px]" />
          ))}
        </div>
      ) : !data?.length ? (
        <div className="rounded-[24px] border border-dashed border-line bg-white">
          <EmptyState
            icon={<KeyRound />}
            title="Aucune annonce de location"
            text="Votre voiture ne roule pas tous les jours ? Louez-la, avec ou sans chauffeur, et fixez vos conditions."
            action={<LinkButton href="/pro/locations/nouvelle">Louer un véhicule</LinkButton>}
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {data.map((o, i) => {
            const photo = cdn(coverUrl(o.vehicle), 400);
            const pending = pendingCount(o.bookings);
            const confirmed = (o.bookings ?? []).filter((b) => b.status === "CONFIRMED").length;
            return (
              <motion.div key={o.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link href={`/pro/locations/${o.id}`} className="group flex gap-4 rounded-[22px] border border-line/70 bg-white p-3.5 shadow-card transition hover:shadow-lift">
                  <div className="h-28 w-32 shrink-0 overflow-hidden rounded-[16px] bg-surface-alt">
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photo} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-brand">
                        <Car className="h-9 w-9 opacity-50" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 py-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-[16px] font-extrabold text-ink">{vehicleTitleYear(o.vehicle)}</p>
                      <ChevronRight className="h-5 w-5 shrink-0 text-faint" />
                    </div>
                    <p className="mt-0.5 text-[15px] font-extrabold text-brand">
                      {fcfa(o.pricePerDay)} <span className="text-[12.5px] font-semibold text-muted">/ jour</span>
                    </p>
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {(() => {
                        const vis = offerVisibility(o);
                        return (
                          <Badge tone={vis.visible ? "success" : o.isActive ? "warning" : "muted"} dot>
                            {vis.reason}
                          </Badge>
                        );
                      })()}
                      {pending > 0 && <Badge tone="danger">{plural(pending, "demande")}</Badge>}
                      {confirmed > 0 && <Badge tone="info">{plural(confirmed, "location")} confirmée{confirmed > 1 ? "s" : ""}</Badge>}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { Car, CarFront, ChevronRight, FileWarning, Plus } from "lucide-react";
import Link from "next/link";
import { ProPageHeader } from "@/components/pro/widgets";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { EmptyState, Skeleton } from "@/components/ui/misc";
import { cdn } from "@/lib/images";
import { usageLabel } from "@/lib/pro";
import { useMyVehicles } from "@/lib/queries";
import { VEHICLE_STATUS, coverUrl, vehicleTitleYear } from "@/lib/types";

export default function VehiclesPage() {
  const { data, isPending } = useMyVehicles();
  return (
    <div>
      <ProPageHeader
        title="Mes véhicules"
        subtitle="Chaque véhicule est vérifié par Taagno avant publication."
        actions={
          <LinkButton href="/pro/vehicules/nouveau" icon={<Plus className="h-4.5 w-4.5" />}>
            Ajouter un véhicule
          </LinkButton>
        }
      />
      {isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-64 rounded-[22px]" />
          ))}
        </div>
      ) : !data?.length ? (
        <div className="rounded-[24px] border border-dashed border-line bg-white">
          <EmptyState
            icon={<CarFront />}
            title="Ajoutez votre premier véhicule"
            text="Quelques informations, des photos et vos documents : notre équipe le vérifie, puis vous pouvez publier."
            action={<LinkButton href="/pro/vehicules/nouveau">Ajouter un véhicule</LinkButton>}
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((v, i) => {
            const photo = cdn(coverUrl(v), 600);
            const missing = 3 - new Set((v.documents ?? []).map((d) => d.type)).size;
            return (
              <motion.div key={v.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link href={`/pro/vehicules/${v.id}`} className="group block overflow-hidden rounded-[22px] border border-line/70 bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-lift">
                  <div className="relative aspect-[16/10] bg-surface-alt">
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photo} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-brand">
                        <Car className="h-12 w-12 opacity-50" />
                      </div>
                    )}
                    <span className="absolute left-3 top-3 rounded-full bg-white/95 px-1 py-0.5 shadow-soft">
                      <StatusBadge status={v.status} map={VEHICLE_STATUS} />
                    </span>
                    {v.isActive === false && (
                      <span className="absolute right-3 top-3 rounded-full bg-ink/80 px-2.5 py-1 text-[11.5px] font-bold text-white">Désactivé</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 p-4">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[16px] font-extrabold text-ink">{vehicleTitleYear(v)}</p>
                      <p className="truncate text-[13px] text-muted">{[v.licensePlate, usageLabel(v)].filter(Boolean).join(" · ")}</p>
                      {missing > 0 && v.status !== "APPROVED" && (
                        <Badge tone="warning" icon={<FileWarning />} className="mt-2">
                          {missing} document{missing > 1 ? "s" : ""} à envoyer
                        </Badge>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-faint transition group-hover:translate-x-0.5" />
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

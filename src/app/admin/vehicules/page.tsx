"use client";

import { motion } from "framer-motion";
import { Car, CarFront, ChevronRight, FileCheck2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ProPageHeader } from "@/components/pro/widgets";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { EmptyState, Segmented, Skeleton } from "@/components/ui/misc";
import { useAdminStats, useAdminVehicles } from "@/lib/admin";
import { relative } from "@/lib/format";
import { cdn } from "@/lib/images";
import { usageLabel } from "@/lib/pro";
import { VEHICLE_STATUS, coverUrl, fullName, vehicleTitleYear, type VehicleStatus } from "@/lib/types";

type Filter = VehicleStatus | "ALL";

export default function AdminVehiclesPage() {
  const [filter, setFilter] = useState<Filter>("PENDING");
  const stats = useAdminStats();
  const { data, isPending } = useAdminVehicles(filter === "ALL" ? undefined : filter);

  return (
    <div>
      <ProPageHeader title="Véhicules" subtitle="Vérifiez les documents puis approuvez ou refusez chaque véhicule." />
      <Segmented
        layoutId="admin-vehicles"
        className="w-full overflow-x-auto scrollbar-none sm:w-auto"
        value={filter}
        onChange={setFilter}
        options={[
          { value: "PENDING", label: "À vérifier", count: stats.data?.vehicles.pending },
          { value: "APPROVED", label: "Approuvés" },
          { value: "REJECTED", label: "Refusés" },
          { value: "ALL", label: "Tous" },
        ]}
      />
      <div className="mt-6">
        {isPending ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-24 rounded-[20px]" />
            ))}
          </div>
        ) : !data?.length ? (
          <div className="rounded-[24px] border border-dashed border-line bg-white">
            <EmptyState icon={<CarFront />} title={filter === "PENDING" ? "Tout est vérifié 🎉" : "Aucun véhicule"} text={filter === "PENDING" ? "Aucun véhicule n’attend de vérification." : undefined} />
          </div>
        ) : (
          <ul className="space-y-3">
            {data.map((v, i) => {
              const photo = cdn(coverUrl(v), 240);
              const docs = new Set((v.documents ?? []).map((d) => d.type)).size;
              return (
                <motion.li key={v.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 10) * 0.03 }}>
                  <Link href={`/admin/vehicules/${v.id}`} className="group flex items-center gap-4 rounded-[20px] border border-line/70 bg-white p-3 shadow-card transition hover:shadow-lift">
                    <div className="h-16 w-24 shrink-0 overflow-hidden rounded-[12px] bg-surface-alt">
                      {photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={photo} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-brand">
                          <Car className="h-6 w-6 opacity-50" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15.5px] font-extrabold text-ink">{vehicleTitleYear(v)}</p>
                      <p className="truncate text-[12.5px] text-muted">
                        {fullName(v.owner)} · {v.licensePlate} · {usageLabel(v)}
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        <Badge tone={docs === 3 ? "success" : "warning"} icon={<FileCheck2 />}>
                          {docs}/3 documents
                        </Badge>
                        <Badge tone="muted">{(v.photos ?? []).length} photo{(v.photos ?? []).length > 1 ? "s" : ""}</Badge>
                        {v.createdAt && <Badge tone="muted">{relative(v.createdAt)}</Badge>}
                      </div>
                    </div>
                    <StatusBadge status={v.status} map={VEHICLE_STATUS} />
                    <ChevronRight className="hidden h-5 w-5 text-faint sm:block" />
                  </Link>
                </motion.li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

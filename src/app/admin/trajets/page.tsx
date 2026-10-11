"use client";

import { ChevronRight, Flag, Route, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AdminCard, CardList, EmptyList, ListSkeleton, LoadError, Meta, Pager, SearchField, Toolbar, useSearchState } from "@/components/admin/admin-ui";
import { ExportButton } from "@/components/admin/export-button";
import { ProPageHeader } from "@/components/pro/widgets";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Segmented } from "@/components/ui/misc";
import { PAGE_SIZE, useAdminTrips } from "@/lib/admin";
import { dayTime, fcfa, plural } from "@/lib/format";
import { TRIP_STATUS, contactLabel, fullName, vehicleTitle, type TripStatus } from "@/lib/types";

type Period = "ALL" | "upcoming" | "past";
type StatusFilter = TripStatus | "ALL";

const PERIODS: { value: Period; label: string }[] = [
  { value: "ALL", label: "Tous" },
  { value: "upcoming", label: "À venir" },
  { value: "past", label: "Passés" },
];

const STATUSES: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "Tous statuts" },
  { value: "OPEN", label: "Ouverts" },
  { value: "FULL", label: "Complets" },
  { value: "COMPLETED", label: "Terminés" },
  { value: "CANCELLED", label: "Annulés" },
];

export default function AdminTripsPage() {
  const search = useSearchState();
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [period, setPeriod] = useState<Period>("upcoming");
  const [page, setPage] = useState(1);
  const { data, isPending, isFetching, isError, refetch } = useAdminTrips({
    status: status === "ALL" ? undefined : status,
    period: period === "ALL" ? undefined : period,
    q: search.debounced || undefined,
    page,
  });

  return (
    <div>
      <ProPageHeader
        title="Trajets"
        subtitle={data ? `${data.total} trajet${data.total > 1 ? "s" : ""}${search.debounced || status !== "ALL" ? " correspondants" : ""}` : "Tous les trajets publiés par les conducteurs."}
        actions={<ExportButton kind="trips" />}
      />
      <Toolbar>
        <SearchField
          value={search.q}
          onChange={(v) => {
            search.setQ(v);
            setPage(1);
          }}
          placeholder="Ville, conducteur ou numéro"
        />
        <Segmented
          layoutId="admin-trips-period"
          className="w-full sm:w-auto"
          value={period}
          onChange={(v) => {
            setPeriod(v);
            setPage(1);
          }}
          options={PERIODS}
        />
      </Toolbar>
      <Segmented
        layoutId="admin-trips-status"
        size="sm"
        className="mt-3 w-full overflow-x-auto scrollbar-none sm:w-auto"
        value={status}
        onChange={(v) => {
          setStatus(v);
          setPage(1);
        }}
        options={STATUSES}
      />

      <div className="mt-6">
        {isPending ? (
          <ListSkeleton />
        ) : isError ? (
          <LoadError onRetry={() => refetch()} />
        ) : !data.items.length ? (
          <EmptyList icon={<Route />} title="Aucun trajet" text="Aucun trajet ne correspond à ces filtres." />
        ) : (
          <>
            <CardList refreshing={isFetching}>
              {data.items.map((t, i) => {
                const active = t.reservations ?? [];
                const seats = active.reduce((sum, r) => sum + r.seatsReserved, 0);
                const pending = active.filter((r) => r.status === "PENDING").length;
                return (
                  <AdminCard key={t.id} index={i} className="p-0 sm:p-0">
                    <Link href={`/admin/trajets/${t.id}`} className="group block p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-[16px] font-extrabold text-ink">
                            {t.departureCity} → {t.arrivalCity}
                          </p>
                          <p className="mt-0.5 text-[13.5px] font-semibold text-brand">{dayTime(t.departureTime)}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <StatusBadge status={t.status} map={TRIP_STATUS} />
                          <ChevronRight className="hidden h-5 w-5 text-faint transition group-hover:translate-x-0.5 sm:block" />
                        </div>
                      </div>
                      <Meta className="mt-2">
                        {fullName(t.driver)}
                        {t.driver?.phone ? ` · ${contactLabel(t.driver)}` : ""}
                        {t.vehicle ? ` · ${vehicleTitle(t.vehicle)}${t.vehicle.licensePlate ? ` (${t.vehicle.licensePlate})` : ""}` : ""}
                      </Meta>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <Badge tone="muted">{fcfa(t.pricePerSeat)} / place</Badge>
                        <Badge tone="muted" icon={<Users />}>
                          {plural(seats, "place")} réservée{seats > 1 ? "s" : ""} · {plural(t.availableSeats, "libre")}
                        </Badge>
                        {pending > 0 && <Badge tone="warning">{plural(pending, "demande")} en attente</Badge>}
                        {(t._count?.reservations ?? 0) > 0 && <Badge tone="muted">{plural(t._count?.reservations ?? 0, "réservation")} au total</Badge>}
                        {t.driver?.isActive === false && (
                          <Badge tone="danger" icon={<Flag />}>
                            Conducteur suspendu
                          </Badge>
                        )}
                      </div>
                    </Link>
                  </AdminCard>
                );
              })}
            </CardList>
            <Pager page={data.page} pageSize={data.pageSize || PAGE_SIZE} total={data.total} onPage={setPage} />
          </>
        )}
      </div>
    </div>
  );
}

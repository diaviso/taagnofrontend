"use client";

import { Ban, Ticket } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AdminCard, CardList, EmptyList, ListSkeleton, LoadError, Meta, Pager, PersonTag, SearchField, Toolbar, useSearchState } from "@/components/admin/admin-ui";
import { ExportButton } from "@/components/admin/export-button";
import { ReasonModal } from "@/components/pro/reason-modal";
import { ProPageHeader } from "@/components/pro/widgets";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/misc";
import { ADMIN_INVALIDATE, PAGE_SIZE, adminActions, useAdminReservations, type AdminReservation } from "@/lib/admin";
import { dayTime, fcfa, plural, relative } from "@/lib/format";
import { useAction } from "@/lib/queries";
import { BOOKING_STATUS, fullName, isActiveBooking, type BookingStatus } from "@/lib/types";

type Filter = BookingStatus | "ALL";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "ALL", label: "Toutes" },
  { value: "PENDING", label: "En attente" },
  { value: "CONFIRMED", label: "Confirmées" },
  { value: "COMPLETED", label: "Terminées" },
  { value: "CANCELLED", label: "Annulées" },
  { value: "REJECTED", label: "Refusées" },
];

const CANCELLED_BY = { PASSENGER: "le passager", DRIVER: "le conducteur", SYSTEM: "le système (demande sans réponse)", ADMIN: "l’équipe Taagno" } as const;

export default function AdminReservationsPage() {
  const search = useSearchState();
  const [status, setStatus] = useState<Filter>("ALL");
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState<AdminReservation | null>(null);
  const { run, busy } = useAction();
  const { data, isPending, isFetching, isError, refetch } = useAdminReservations({ status: status === "ALL" ? undefined : status, q: search.debounced || undefined, page });

  return (
    <div>
      <ProPageHeader
        title="Réservations de covoiturage"
        subtitle={data ? `${data.total} réservation${data.total > 1 ? "s" : ""}${search.debounced || status !== "ALL" ? " correspondantes" : ""}` : "Les places réservées par les voyageurs."}
        actions={<ExportButton kind="reservations" />}
      />
      <Toolbar>
        <SearchField
          value={search.q}
          onChange={(v) => {
            search.setQ(v);
            setPage(1);
          }}
          placeholder="Passager, conducteur, numéro ou ville"
        />
      </Toolbar>
      <Segmented
        layoutId="admin-reservations-status"
        size="sm"
        className="mt-3 w-full overflow-x-auto scrollbar-none sm:w-auto"
        value={status}
        onChange={(v) => {
          setStatus(v);
          setPage(1);
        }}
        options={FILTERS}
      />

      <div className="mt-6">
        {isPending ? (
          <ListSkeleton />
        ) : isError ? (
          <LoadError onRetry={() => refetch()} />
        ) : !data.items.length ? (
          <EmptyList icon={<Ticket />} title="Aucune réservation" text="Aucune réservation ne correspond à ces filtres." />
        ) : (
          <>
            <CardList refreshing={isFetching}>
              {data.items.map((r, i) => (
                <AdminCard key={r.id} index={i}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link href={`/admin/trajets/${r.trip.id}`} className="block truncate text-[16px] font-extrabold text-ink hover:text-brand">
                        {r.trip.departureCity} → {r.trip.arrivalCity}
                      </Link>
                      <p className="mt-0.5 text-[13.5px] font-semibold text-brand">{dayTime(r.trip.departureTime)}</p>
                    </div>
                    <StatusBadge status={r.status} map={BOOKING_STATUS} />
                  </div>
                  <div className="mt-3 grid gap-1.5 text-[13.5px] sm:grid-cols-2">
                    <PersonTag user={r.passenger} label="Passager" />
                    <PersonTag user={r.trip.driver} label="Conducteur" />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <Badge tone="muted">{plural(r.seatsReserved, "place")}</Badge>
                    <Badge tone="muted">{fcfa(r.seatsReserved * r.trip.pricePerSeat)}</Badge>
                    <Badge tone="muted">demandée {relative(r.createdAt)}</Badge>
                  </div>
                  {r.status === "CANCELLED" && r.cancelledBy && (
                    <Meta className="mt-2">
                      Annulée par {CANCELLED_BY[r.cancelledBy]}
                      {r.cancelReason ? ` · « ${r.cancelReason} »` : ""}
                    </Meta>
                  )}
                  {isActiveBooking(r.status) && (
                    <div className="mt-3 flex justify-end border-t border-dashed border-line pt-3">
                      <Button variant="danger" size="sm" icon={<Ban className="h-4 w-4" />} onClick={() => setTarget(r)}>
                        Annuler
                      </Button>
                    </div>
                  )}
                </AdminCard>
              ))}
            </CardList>
            <Pager page={data.page} pageSize={data.pageSize || PAGE_SIZE} total={data.total} onPage={setPage} />
          </>
        )}
      </div>

      <ReasonModal
        open={!!target}
        onOpenChange={(v) => !v && setTarget(null)}
        title="Annuler cette réservation ?"
        message={
          target && (
            <>
              La place de <strong>{fullName(target.passenger)}</strong> sur {target.trip.departureCity} → {target.trip.arrivalCity} sera annulée
              {target.status === "CONFIRMED" ? " et les places seront rendues au trajet" : ""}. Le passager et le conducteur seront prévenus.
            </>
          )
        }
        confirmLabel="Annuler la réservation"
        loading={busy === "cancel"}
        onConfirm={async (reason) => {
          if (!target) return;
          const ok = await run("cancel", () => adminActions.cancelReservation(target.id, reason), { success: "Réservation annulée.", invalidate: ADMIN_INVALIDATE });
          if (ok !== undefined) setTarget(null);
        }}
      />
    </div>
  );
}

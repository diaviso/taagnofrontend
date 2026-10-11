"use client";

import { Ban, Car, Eye, EyeOff, KeyRound, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { AdminCard, CardList, EmptyList, ListSkeleton, LoadError, Meta, Pager, PersonTag, SearchField, Toolbar, useSearchState } from "@/components/admin/admin-ui";
import { ExportButton } from "@/components/admin/export-button";
import { ReasonModal } from "@/components/pro/reason-modal";
import { ProPageHeader } from "@/components/pro/widgets";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { Segmented } from "@/components/ui/misc";
import { ADMIN_INVALIDATE, PAGE_SIZE, adminActions, useAdminBookings, useAdminOffers, type AdminBooking, type AdminOffer } from "@/lib/admin";
import { date, fcfa, parseDay, plural, range, relative, rentalDays } from "@/lib/format";
import { cdn } from "@/lib/images";
import { useAction } from "@/lib/queries";
import { BOOKING_STATUS, coverUrl, isActiveBooking, vehicleTitleYear, type BookingStatus } from "@/lib/types";

type Tab = "annonces" | "demandes";

export function RentalsAdmin() {
  const router = useRouter();
  const params = useSearchParams();
  const tab: Tab = params.get("onglet") === "demandes" ? "demandes" : "annonces";
  return (
    <div>
      <ProPageHeader
        title="Locations"
        subtitle="Les annonces des propriétaires et les demandes des locataires."
        actions={<ExportButton kind={tab === "annonces" ? "offers" : "bookings"} />}
      />
      <Segmented
        layoutId="admin-rentals-tab"
        className="w-full sm:w-auto"
        value={tab}
        onChange={(v) => router.replace(v === "demandes" ? "/admin/locations?onglet=demandes" : "/admin/locations", { scroll: false })}
        options={[
          { value: "annonces", label: "Annonces" },
          { value: "demandes", label: "Demandes de location" },
        ]}
      />
      <div className="mt-5">{tab === "annonces" ? <OffersTab /> : <BookingsTab />}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Annonces
// ---------------------------------------------------------------------------

type OfferFilter = "ALL" | "active" | "hidden" | "deleted";

const OFFER_FILTERS: { value: OfferFilter; label: string }[] = [
  { value: "ALL", label: "Toutes" },
  { value: "active", label: "Visibles" },
  { value: "hidden", label: "Masquées" },
  { value: "deleted", label: "Supprimées" },
];

function OffersTab() {
  const search = useSearchState();
  const [state, setState] = useState<OfferFilter>("ALL");
  const [page, setPage] = useState(1);
  const [hiding, setHiding] = useState<AdminOffer | null>(null);
  const { run, busy } = useAction();
  const { data, isPending, isFetching, isError, refetch } = useAdminOffers({ state: state === "ALL" ? undefined : state, q: search.debounced || undefined, page });

  return (
    <>
      <Toolbar>
        <SearchField
          value={search.q}
          onChange={(v) => {
            search.setQ(v);
            setPage(1);
          }}
          placeholder="Véhicule, ville, propriétaire ou numéro"
        />
        <Segmented
          layoutId="admin-offers-state"
          size="sm"
          className="w-full overflow-x-auto scrollbar-none sm:w-auto"
          value={state}
          onChange={(v) => {
            setState(v);
            setPage(1);
          }}
          options={OFFER_FILTERS}
        />
      </Toolbar>

      <div className="mt-6">
        {isPending ? (
          <ListSkeleton />
        ) : isError ? (
          <LoadError onRetry={() => refetch()} />
        ) : !data.items.length ? (
          <EmptyList icon={<Car />} title="Aucune annonce" text="Aucune annonce ne correspond à ces filtres." />
        ) : (
          <>
            <CardList refreshing={isFetching}>
              {data.items.map((o, i) => {
                const photo = cdn(coverUrl(o.vehicle), 240);
                const deleted = !!o.deletedAt;
                const withDriver = (o.options ?? []).includes("WITH_DRIVER");
                return (
                  <AdminCard key={o.id} index={i}>
                    <div className="flex gap-4">
                      <div className="hidden h-20 w-28 shrink-0 overflow-hidden rounded-[14px] bg-surface-alt sm:block">
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
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <Link href={`/admin/vehicules/${o.vehicle.id}`} className="block truncate text-[16px] font-extrabold text-ink hover:text-brand">
                              {vehicleTitleYear(o.vehicle)}
                            </Link>
                            <Meta>
                              {[o.vehicle.licensePlate, o.vehicle.city].filter(Boolean).join(" · ")}
                              {` · ${fcfa(o.pricePerDay)} / jour`}
                            </Meta>
                          </div>
                          {deleted ? <Badge tone="danger">Supprimée</Badge> : o.isActive ? <Badge tone="success" dot>En ligne</Badge> : <Badge tone="warning" dot>Masquée</Badge>}
                        </div>
                        <div className="mt-2">
                          <PersonTag user={o.vehicle.owner} label="Propriétaire" />
                        </div>
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          <Badge tone="muted">{plural(o._count?.bookings ?? 0, "demande")}</Badge>
                          {withDriver && (
                            <Badge tone="warning" icon={<UserRound />}>
                              Chauffeur disponible
                            </Badge>
                          )}
                          {o.vehicle.status && o.vehicle.status !== "APPROVED" && <Badge tone="warning">Véhicule {o.vehicle.status === "PENDING" ? "en vérification" : "refusé"}</Badge>}
                          {o.vehicle.isActive === false && <Badge tone="danger">Véhicule désactivé</Badge>}
                          {deleted && <Badge tone="muted">supprimée le {date(o.deletedAt)}</Badge>}
                          {!deleted && <Badge tone="muted">publiée {relative(o.createdAt)}</Badge>}
                        </div>
                      </div>
                    </div>
                    {!deleted && (
                      <div className="mt-3 flex justify-end gap-2 border-t border-dashed border-line pt-3">
                        <LinkButton href={`/location/${o.id}`} variant="ghost" size="sm" target="_blank" rel="noopener noreferrer">
                          Voir l’annonce
                        </LinkButton>
                        {o.isActive ? (
                          <Button variant="danger" size="sm" icon={<EyeOff className="h-4 w-4" />} onClick={() => setHiding(o)}>
                            Masquer
                          </Button>
                        ) : (
                          <Button
                            variant="soft"
                            size="sm"
                            icon={<Eye className="h-4 w-4" />}
                            loading={busy === `show-${o.id}`}
                            onClick={() => run(`show-${o.id}`, () => adminActions.setOfferActive(o.id, true), { success: "Annonce remise en ligne.", invalidate: ADMIN_INVALIDATE })}
                          >
                            Remettre en ligne
                          </Button>
                        )}
                      </div>
                    )}
                  </AdminCard>
                );
              })}
            </CardList>
            <Pager page={data.page} pageSize={data.pageSize || PAGE_SIZE} total={data.total} onPage={setPage} />
          </>
        )}
      </div>

      <ReasonModal
        open={!!hiding}
        onOpenChange={(v) => !v && setHiding(null)}
        title="Masquer cette annonce ?"
        message={hiding && <>L’annonce « {vehicleTitleYear(hiding.vehicle)} » ne sera plus visible des voyageurs. Le propriétaire en sera prévenu. Vous pourrez la remettre en ligne à tout moment.</>}
        confirmLabel="Masquer l’annonce"
        placeholder="Ex. : photos non conformes, prix incohérent"
        loading={busy === "hide"}
        onConfirm={async (reason) => {
          if (!hiding) return;
          const ok = await run("hide", () => adminActions.setOfferActive(hiding.id, false, reason), { success: "Annonce masquée.", invalidate: ADMIN_INVALIDATE });
          if (ok !== undefined) setHiding(null);
        }}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Demandes de location
// ---------------------------------------------------------------------------

type BookingFilter = BookingStatus | "ALL";

const BOOKING_FILTERS: { value: BookingFilter; label: string }[] = [
  { value: "ALL", label: "Toutes" },
  { value: "PENDING", label: "En attente" },
  { value: "CONFIRMED", label: "Confirmées" },
  { value: "COMPLETED", label: "Terminées" },
  { value: "CANCELLED", label: "Annulées" },
  { value: "REJECTED", label: "Refusées" },
];

const CANCELLED_BY = { RENTER: "le locataire", OWNER: "le propriétaire", SYSTEM: "le système (demande sans réponse)", ADMIN: "l’équipe Taagno" } as const;

function BookingsTab() {
  const search = useSearchState();
  const [status, setStatus] = useState<BookingFilter>("ALL");
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState<AdminBooking | null>(null);
  const { run, busy } = useAction();
  const { data, isPending, isFetching, isError, refetch } = useAdminBookings({ status: status === "ALL" ? undefined : status, q: search.debounced || undefined, page });

  return (
    <>
      <Toolbar>
        <SearchField
          value={search.q}
          onChange={(v) => {
            search.setQ(v);
            setPage(1);
          }}
          placeholder="Locataire, propriétaire, numéro ou véhicule"
        />
        <Segmented
          layoutId="admin-bookings-status"
          size="sm"
          className="w-full overflow-x-auto scrollbar-none sm:w-auto"
          value={status}
          onChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
          options={BOOKING_FILTERS}
        />
      </Toolbar>

      <div className="mt-6">
        {isPending ? (
          <ListSkeleton />
        ) : isError ? (
          <LoadError onRetry={() => refetch()} />
        ) : !data.items.length ? (
          <EmptyList icon={<KeyRound />} title="Aucune demande" text="Aucune demande de location ne correspond à ces filtres." />
        ) : (
          <>
            <CardList refreshing={isFetching}>
              {data.items.map((b, i) => {
                const start = parseDay(b.startDate);
                const end = parseDay(b.endDate);
                const v = b.rentalOffer.vehicle;
                return (
                  <AdminCard key={b.id} index={i}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link href={`/admin/vehicules/${v.id}`} className="block truncate text-[16px] font-extrabold text-ink hover:text-brand">
                          {vehicleTitleYear(v)}
                          {v.licensePlate && <span className="ml-2 text-[13px] font-semibold text-muted">{v.licensePlate}</span>}
                        </Link>
                        <p className="mt-0.5 text-[13.5px] font-semibold text-brand">
                          {range(start, end)} · {plural(rentalDays(start, end), "jour")}
                        </p>
                      </div>
                      <StatusBadge status={b.status} map={BOOKING_STATUS} />
                    </div>
                    <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
                      <PersonTag user={b.renter} label="Locataire" />
                      <PersonTag user={v.owner} label="Propriétaire" />
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      <Badge tone="muted">{fcfa(b.totalPrice)}</Badge>
                      {b.withDriver && (
                        <Badge tone="warning" icon={<UserRound />}>
                          Avec chauffeur
                        </Badge>
                      )}
                      <Badge tone="muted">demandée {relative(b.createdAt)}</Badge>
                    </div>
                    {b.status === "CANCELLED" && b.cancelledBy && (
                      <Meta className="mt-2">
                        Annulée par {CANCELLED_BY[b.cancelledBy]}
                        {b.cancelReason ? ` · « ${b.cancelReason} »` : ""}
                      </Meta>
                    )}
                    {isActiveBooking(b.status) && (
                      <div className="mt-3 flex justify-end border-t border-dashed border-line pt-3">
                        <Button variant="danger" size="sm" icon={<Ban className="h-4 w-4" />} onClick={() => setTarget(b)}>
                          Annuler
                        </Button>
                      </div>
                    )}
                  </AdminCard>
                );
              })}
            </CardList>
            <Pager page={data.page} pageSize={data.pageSize || PAGE_SIZE} total={data.total} onPage={setPage} />
          </>
        )}
      </div>

      <ReasonModal
        open={!!target}
        onOpenChange={(v) => !v && setTarget(null)}
        title="Annuler cette location ?"
        message={target && <>La location de « {vehicleTitleYear(target.rentalOffer.vehicle)} » sera annulée. Le locataire et le propriétaire seront prévenus.</>}
        confirmLabel="Annuler la location"
        loading={busy === "cancel"}
        onConfirm={async (reason) => {
          if (!target) return;
          const ok = await run("cancel", () => adminActions.cancelBooking(target.id, reason), { success: "Location annulée.", invalidate: ADMIN_INVALIDATE });
          if (ok !== undefined) setTarget(null);
        }}
      />
    </>
  );
}

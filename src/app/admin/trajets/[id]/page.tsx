"use client";

import { ArrowLeft, Ban, CalendarClock, CarFront, Flag, HandCoins, MapPin, Route, Users } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Meta } from "@/components/admin/admin-ui";
import { ContactButtons } from "@/components/booking/contact-buttons";
import { ProPageHeader } from "@/components/pro/widgets";
import { ReasonModal } from "@/components/pro/reason-modal";
import { Avatar } from "@/components/ui/avatar";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, EmptyState, InfoRow } from "@/components/ui/misc";
import { PageSpinner } from "@/components/ui/spinner";
import { ADMIN_INVALIDATE, adminActions, useAdminTrip } from "@/lib/admin";
import { dayTime, fcfa, longDate, plural, time } from "@/lib/format";
import { useAction } from "@/lib/queries";
import { BOOKING_STATUS, TRIP_STATUS, contactLabel, fullName, tripOptionLabel, vehicleTitleYear } from "@/lib/types";

const CANCELLED_BY = { PASSENGER: "le passager", DRIVER: "le conducteur", SYSTEM: "le système (demande sans réponse)", ADMIN: "l’équipe Taagno" } as const;

export default function AdminTripPage() {
  const { id } = useParams<{ id: string }>();
  const { data: t, isPending } = useAdminTrip(id);
  const { run, busy } = useAction();
  const [cancelOpen, setCancelOpen] = useState(false);

  if (isPending) return <PageSpinner />;
  if (!t) return <EmptyState icon={<Route />} title="Trajet introuvable" />;

  const canCancel = t.status === "OPEN" || t.status === "FULL";
  const live = t.reservations.filter((r) => r.status === "PENDING" || r.status === "CONFIRMED");
  const seats = t.reservations.filter((r) => r.status === "CONFIRMED" || r.status === "COMPLETED").reduce((sum, r) => sum + r.seatsReserved, 0);
  const title = `${t.departureCity} → ${t.arrivalCity}`;

  return (
    <div>
      <ProPageHeader
        back={
          <Link href="/admin/trajets" className="mb-3 inline-flex items-center gap-1.5 text-[14px] font-bold text-ink-soft hover:text-ink">
            <ArrowLeft className="h-4 w-4" /> Trajets
          </Link>
        }
        title={title}
        subtitle={`${longDate(t.departureTime)} à ${time(t.departureTime)}`}
        actions={<StatusBadge status={t.status} map={TRIP_STATUS} />}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Card className="p-5 sm:p-6">
            <InfoRow icon={<CalendarClock />} label="Départ" value={dayTime(t.departureTime)} />
            <InfoRow icon={<MapPin />} label="Rendez-vous" value={t.meetingPoint || "À convenir"} />
            <InfoRow icon={<Flag />} label="Dépose" value={t.dropoffPoint || "À convenir"} />
            <InfoRow icon={<HandCoins />} label="Prix par place" value={fcfa(t.pricePerSeat)} />
            <InfoRow icon={<Users />} label="Places" value={`${seats} vendue${seats > 1 ? "s" : ""} · ${t.availableSeats} libre${t.availableSeats > 1 ? "s" : ""}`} />
            {(t.options ?? []).length > 0 && (
              <div className="flex flex-wrap gap-1.5 border-t border-line pt-3">
                {(t.options ?? []).map((o) => (
                  <Badge key={o} tone="muted">
                    {tripOptionLabel(o)}
                  </Badge>
                ))}
              </div>
            )}
            {t.description && <p className="mt-3 whitespace-pre-line rounded-[14px] bg-surface-alt px-4 py-3 text-[14px] leading-relaxed text-ink-soft">{t.description}</p>}
          </Card>

          <Card className="p-5 sm:p-6">
            <h2 className="mb-1 flex items-center gap-2 text-[16px] font-extrabold text-ink [&_svg]:h-[18px] [&_svg]:w-[18px] [&_svg]:text-brand">
              <Users /> Passagers
              <span className="rounded-full bg-surface-alt px-2 text-[12px] leading-5 text-ink-soft">{t.reservations.length}</span>
            </h2>
            {!t.reservations.length ? (
              <p className="px-1 py-3 text-[13.5px] text-muted">Aucune réservation pour ce trajet.</p>
            ) : (
              <ul className="divide-y divide-line">
                {t.reservations.map((r) => (
                  <li key={r.id} className="py-3.5">
                    <div className="flex items-start gap-3">
                      <Avatar user={r.passenger} size={40} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <Link href={`/admin/utilisateurs/${r.passengerId}`} className="truncate text-[14.5px] font-bold text-ink hover:text-brand">
                            {fullName(r.passenger)}
                          </Link>
                          <StatusBadge status={r.status} map={BOOKING_STATUS} />
                        </div>
                        <Meta>
                          {r.passenger?.phone ? `${contactLabel(r.passenger)} · ` : ""}
                          {plural(r.seatsReserved, "place")} · {fcfa(r.seatsReserved * t.pricePerSeat)}
                        </Meta>
                        {r.status === "CANCELLED" && r.cancelledBy && (
                          <Meta className="mt-0.5">
                            Annulée par {CANCELLED_BY[r.cancelledBy]}
                            {r.cancelReason ? ` · « ${r.cancelReason} »` : ""}
                          </Meta>
                        )}
                        {r.passenger?.phone && (r.status === "CONFIRMED" || r.status === "PENDING") && (
                          <ContactButtons className="mt-2" compact phone={r.passenger.phone} name={fullName(r.passenger)} />
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <p className="mb-3 text-[12px] font-extrabold uppercase tracking-[0.1em] text-muted">Conducteur</p>
            <Link href={`/admin/utilisateurs/${t.driver?.id ?? ""}`} className="group flex items-center gap-3 rounded-[14px] transition">
              <Avatar user={t.driver} size={48} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15.5px] font-extrabold text-ink group-hover:text-brand">{fullName(t.driver)}</span>
                <span className="block truncate text-[13px] text-muted">{contactLabel(t.driver)}</span>
              </span>
            </Link>
            {t.driver?.isActive === false && (
              <Badge tone="danger" className="mt-3">
                Compte suspendu
              </Badge>
            )}
            {t.driver?.phone && <ContactButtons className="mt-3" compact phone={t.driver.phone} name={fullName(t.driver)} />}
          </Card>

          <Card className="p-5">
            <p className="mb-3 text-[12px] font-extrabold uppercase tracking-[0.1em] text-muted">Véhicule</p>
            {t.vehicle ? (
              <Link href={`/admin/vehicules/${t.vehicle.id}`} className="group flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-brand-soft text-brand">
                  <CarFront className="h-6 w-6" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-extrabold text-ink group-hover:text-brand">{vehicleTitleYear(t.vehicle)}</span>
                  <span className="block text-[13px] text-muted">
                    {[t.vehicle.licensePlate, t.vehicle.color, t.vehicle.numberOfSeats ? `${t.vehicle.numberOfSeats} places` : null].filter(Boolean).join(" · ")}
                  </span>
                </span>
              </Link>
            ) : (
              <p className="text-[13.5px] text-muted">Véhicule indisponible.</p>
            )}
          </Card>

          <Card className="p-5">
            <InfoRow label="Signalements" value={t.reportsCount ? <Badge tone="danger">{t.reportsCount}</Badge> : "Aucun"} className="py-1" />
            {t.reportsCount > 0 && (
              <Link href="/admin/signalements" className="mt-1 inline-block text-[13px] font-bold text-brand hover:underline">
                Voir les signalements
              </Link>
            )}
          </Card>

          {canCancel ? (
            <Card className="space-y-2 p-5">
              <Button block variant="danger" icon={<Ban className="h-4 w-4" />} onClick={() => setCancelOpen(true)}>
                Annuler le trajet
              </Button>
              <p className="text-[12.5px] leading-snug text-muted">Les passagers et le conducteur sont prévenus par notification.</p>
            </Card>
          ) : (
            <p className="rounded-[16px] bg-surface-alt px-4 py-3 text-[13px] text-muted">
              {t.status === "CANCELLED" ? "Ce trajet est déjà annulé." : "Ce trajet est terminé : il ne peut plus être annulé."}
            </p>
          )}
        </div>
      </div>

      <ReasonModal
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Annuler ce trajet ?"
        message={
          <>
            Le trajet <strong>{title}</strong> sera annulé
            {live.length ? ` avec ses ${plural(live.length, "réservation")} en cours` : ""}. Les passagers concernés et le conducteur seront prévenus par notification.
          </>
        }
        confirmLabel="Annuler le trajet"
        placeholder="Ex. : véhicule indisponible, suspicion de fraude"
        loading={busy === "cancel"}
        onConfirm={async (reason) => {
          const ok = await run("cancel", () => adminActions.cancelTrip(t.id, reason), { success: "Trajet annulé, les personnes concernées sont prévenues.", invalidate: ADMIN_INVALIDATE });
          if (ok !== undefined) setCancelOpen(false);
        }}
      />
    </div>
  );
}

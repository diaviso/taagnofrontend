"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CarFront, KeyRound, Power, Route, ShieldCheck, Ticket, Trash2, UserX } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, EmptyState, InfoRow } from "@/components/ui/misc";
import { ConfirmModal } from "@/components/ui/modal";
import { PageSpinner } from "@/components/ui/spinner";
import { ADMIN_INVALIDATE, useAdminUser, type UserDependencies } from "@/lib/admin";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { date, dayTime, fcfa, parseDay, range } from "@/lib/format";
import { useAction } from "@/lib/queries";
import { BOOKING_STATUS, TRIP_STATUS, VEHICLE_STATUS, contactLabel, fullName, realEmail, vehicleTitle } from "@/lib/types";
import { ContactButtons } from "@/components/booking/contact-buttons";

export default function AdminUserPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user: me } = useAuth();
  const { data: u, isPending } = useAdminUser(id);
  const { run, busy } = useAction();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const deps = useQuery({ queryKey: ["admin", "deps", id], queryFn: () => api.get<UserDependencies>(`/admin/users/${id}/dependencies`), enabled: deleteOpen });

  if (isPending) return <PageSpinner />;
  if (!u) return <EmptyState icon={<UserX />} title="Utilisateur introuvable" />;
  const isSelf = me?.id === u.id;
  const admin = u.role === "ADMIN";

  return (
    <div>
      <Link href="/admin/utilisateurs" className="mb-3 inline-flex items-center gap-1.5 text-[14px] font-bold text-ink-soft hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Utilisateurs
      </Link>
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <div className="space-y-4">
          <Card className="flex flex-col items-center p-6 text-center">
            <Avatar user={u} size={88} />
            <h1 className="mt-3 text-[22px] font-extrabold tracking-tight text-ink">{fullName(u)}</h1>
            <p className="text-[13.5px] font-semibold text-ink-soft">{contactLabel(u)}</p>
            {realEmail(u) && u.phone && <p className="text-[12.5px] text-muted">{realEmail(u)}</p>}
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {admin && (
                <Badge tone="brand" icon={<ShieldCheck />}>
                  Administrateur
                </Badge>
              )}
              <Badge tone={u.isActive === false ? "danger" : "success"} dot>
                {u.isActive === false ? "Désactivé" : "Actif"}
              </Badge>
              {u.phoneVerified && <Badge tone="info">Numéro vérifié</Badge>}
            </div>
            {u.bio && <p className="mt-3 rounded-[14px] bg-surface-alt px-4 py-2.5 text-[13.5px] text-ink-soft">« {u.bio} »</p>}
            {u.phone && <ContactButtons className="mt-4 w-full" compact phone={u.phone} name={fullName(u)} />}
          </Card>
          <Card className="p-5">
            <InfoRow label="Inscrit le" value={date(u.createdAt)} />
            <InfoRow label="Note" value={u.ratingCount ? `${((u.ratingSum ?? 0) / u.ratingCount).toFixed(1).replace(".", ",")} / 5 (${u.ratingCount} avis)` : "Pas encore d’avis"} />
            <InfoRow label="Véhicules" value={String(u._count?.vehicles ?? 0)} />
            <InfoRow label="Trajets publiés" value={String(u._count?.carpoolTripsAsDriver ?? 0)} />
            <InfoRow label="Places réservées" value={String(u._count?.carpoolReservations ?? 0)} />
            <InfoRow label="Locations" value={String(u._count?.rentalBookings ?? 0)} />
          </Card>
          {!isSelf && (
            <Card className="space-y-2 p-5">
              <Button
                block
                variant="outline"
                icon={<Power className="h-4 w-4" />}
                loading={busy === "active"}
                onClick={() => run("active", () => api.patch(`/admin/users/${u.id}/toggle-active`), { success: u.isActive === false ? "Compte réactivé." : "Compte désactivé.", invalidate: ADMIN_INVALIDATE })}
              >
                {u.isActive === false ? "Réactiver le compte" : "Désactiver le compte"}
              </Button>
              <Button block variant="ghost" icon={<ShieldCheck className="h-4 w-4" />} onClick={() => setRoleOpen(true)}>
                {admin ? "Retirer les droits d’administration" : "Nommer administrateur"}
              </Button>
              {!admin && (
                <Button block variant="danger" icon={<Trash2 className="h-4 w-4" />} onClick={() => setDeleteOpen(true)}>
                  Supprimer le compte
                </Button>
              )}
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Section title="Véhicules" icon={<CarFront />} empty={!u.vehicles?.length}>
            {u.vehicles?.map((v) => (
              <Link key={v.id} href={`/admin/vehicules/${v.id}`} className="flex items-center justify-between gap-3 rounded-[14px] p-3 transition hover:bg-surface-alt">
                <span className="min-w-0">
                  <span className="block truncate text-[14.5px] font-bold text-ink">{vehicleTitle(v)}</span>
                  <span className="text-[12.5px] text-muted">
                    {v.licensePlate}
                    {v.rentalOffer ? " · en location" : ""}
                  </span>
                </span>
                <StatusBadge status={v.status} map={VEHICLE_STATUS} />
              </Link>
            ))}
          </Section>
          <Section title="Trajets publiés" icon={<Route />} empty={!u.carpoolTripsAsDriver?.length}>
            {u.carpoolTripsAsDriver?.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-3 rounded-[14px] p-3">
                <span className="min-w-0">
                  <span className="block truncate text-[14.5px] font-bold text-ink">
                    {t.departureCity} → {t.arrivalCity}
                  </span>
                  <span className="text-[12.5px] text-muted">
                    {dayTime(t.departureTime)} · {fcfa(t.pricePerSeat)} · {t._count?.reservations ?? 0} réservation(s)
                  </span>
                </span>
                <StatusBadge status={t.status} map={TRIP_STATUS} />
              </div>
            ))}
          </Section>
          <Section title="Réservations de places" icon={<Ticket />} empty={!u.carpoolReservations?.length}>
            {u.carpoolReservations?.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 rounded-[14px] p-3">
                <span className="min-w-0">
                  <span className="block truncate text-[14.5px] font-bold text-ink">
                    {r.trip?.departureCity} → {r.trip?.arrivalCity}
                  </span>
                  <span className="text-[12.5px] text-muted">
                    {r.trip ? dayTime(r.trip.departureTime) : ""} · {r.seatsReserved} place(s) · avec {fullName(r.trip?.driver)}
                  </span>
                </span>
                <StatusBadge status={r.status} map={BOOKING_STATUS} />
              </div>
            ))}
          </Section>
          <Section title="Locations" icon={<KeyRound />} empty={!u.rentalBookings?.length}>
            {u.rentalBookings?.map((b) => (
              <div key={b.id} className="flex items-center justify-between gap-3 rounded-[14px] p-3">
                <span className="min-w-0">
                  <span className="block truncate text-[14.5px] font-bold text-ink">{vehicleTitle(b.rentalOffer?.vehicle)}</span>
                  <span className="text-[12.5px] text-muted">
                    {range(parseDay(b.startDate), parseDay(b.endDate))} · {fcfa(b.totalPrice)}
                  </span>
                </span>
                <StatusBadge status={b.status} map={BOOKING_STATUS} />
              </div>
            ))}
          </Section>
        </div>
      </div>

      <ConfirmModal
        open={roleOpen}
        onOpenChange={setRoleOpen}
        title={admin ? "Retirer les droits d’administration ?" : "Nommer administrateur ?"}
        message={admin ? `${fullName(u)} n’aura plus accès à l’administration.` : `${fullName(u)} pourra approuver les véhicules et gérer les comptes.`}
        confirmLabel="Confirmer"
        loading={busy === "role"}
        onConfirm={async () => {
          await run("role", () => api.patch(`/admin/users/${u.id}/role`, { role: admin ? "USER" : "ADMIN" }), { success: "Rôle mis à jour.", invalidate: ADMIN_INVALIDATE });
          setRoleOpen(false);
        }}
      />
      <ConfirmModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Supprimer ce compte ?"
        danger
        confirmLabel="Supprimer définitivement"
        loading={busy === "delete"}
        message={
          deps.data ? (
            <span>
              Seront aussi supprimés : {deps.data.vehicles} véhicule(s), {deps.data.vehiclePhotos} photo(s), {deps.data.vehicleDocuments} document(s), {deps.data.rentalOffers} offre(s), {deps.data.carpoolTrips} trajet(s), {deps.data.carpoolReservations} réservation(s) et {deps.data.rentalBookings} location(s). Action irréversible.
            </span>
          ) : (
            "Calcul des données liées…"
          )
        }
        onConfirm={async () => {
          const ok = await run("delete", () => api.delete(`/admin/users/${u.id}`), { success: "Compte supprimé.", invalidate: ADMIN_INVALIDATE });
          setDeleteOpen(false);
          if (ok !== undefined) router.push("/admin/utilisateurs");
        }}
      />
    </div>
  );
}

function Section({ title, icon, empty, children }: { title: string; icon: ReactNode; empty?: boolean; children: ReactNode }) {
  return (
    <Card className="p-5">
      <h2 className="mb-2 flex items-center gap-2 text-[16px] font-extrabold text-ink [&_svg]:h-[18px] [&_svg]:w-[18px] [&_svg]:text-brand">
        {icon} {title}
      </h2>
      {empty ? <p className="px-3 py-2 text-[13.5px] text-muted">Rien pour le moment.</p> : <div className="divide-y divide-line">{children}</div>}
    </Card>
  );
}

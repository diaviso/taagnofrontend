"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CarFront,
  Flag,
  History,
  KeyRound,
  LockOpen,
  LogOut,
  MessageSquareHeart,
  Phone,
  Power,
  Route,
  Send,
  ShieldCheck,
  Smartphone,
  Ticket,
  Trash2,
  UserX,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { NotifyUserModal } from "@/components/admin/notify-user-modal";
import { ContactButtons } from "@/components/booking/contact-buttons";
import { ReasonModal } from "@/components/pro/reason-modal";
import { Avatar } from "@/components/ui/avatar";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, EmptyState, InfoRow } from "@/components/ui/misc";
import { ConfirmModal } from "@/components/ui/modal";
import { Stars } from "@/components/ui/rating";
import { PageSpinner } from "@/components/ui/spinner";
import { ADMIN_INVALIDATE, REPORT_STATUS, adminActions, useAdminUser, type AdminReview, type UserDependencies } from "@/lib/admin";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { date, dayTime, fcfa, isFuture, parseDay, range, relative } from "@/lib/format";
import { prettyPhone } from "@/lib/phone";
import { useAction } from "@/lib/queries";
import { BOOKING_STATUS, TRIP_STATUS, VEHICLE_STATUS, contactLabel, fullName, realEmail, reportReasonLabel, shortName, vehicleTitle } from "@/lib/types";

export default function AdminUserPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user: me } = useAuth();
  const { data: u, isPending } = useAdminUser(id);
  const { run, busy } = useAction();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [reactivateOpen, setReactivateOpen] = useState(false);
  const [revokeOpen, setRevokeOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<AdminReview | null>(null);
  const deps = useQuery({ queryKey: ["admin", "deps", id], queryFn: () => api.get<UserDependencies>(`/admin/users/${id}/dependencies`), enabled: deleteOpen });

  if (isPending) return <PageSpinner />;
  if (!u) return <EmptyState icon={<UserX />} title="Utilisateur introuvable" />;
  const isSelf = me?.id === u.id;
  const admin = u.role === "ADMIN";
  const suspended = u.isActive === false;
  const locked = !!u.pinLockedUntil && isFuture(u.pinLockedUntil);
  const name = fullName(u);

  return (
    <div>
      <Link href="/admin/utilisateurs" className="mb-3 inline-flex items-center gap-1.5 text-[14px] font-bold text-ink-soft hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Utilisateurs
      </Link>
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <div className="space-y-4">
          <Card className="flex flex-col items-center p-6 text-center">
            <Avatar user={u} size={88} />
            <h1 className="mt-3 text-[22px] font-extrabold tracking-tight text-ink">{name}</h1>
            <p className="text-[13.5px] font-semibold text-ink-soft">{contactLabel(u)}</p>
            {realEmail(u) && u.phone && <p className="text-[12.5px] text-muted">{realEmail(u)}</p>}
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {admin && (
                <Badge tone="brand" icon={<ShieldCheck />}>
                  Administrateur
                </Badge>
              )}
              <Badge tone={suspended ? "danger" : "success"} dot>
                {suspended ? "Suspendu" : "Actif"}
              </Badge>
              {u.phoneVerified && <Badge tone="info">Numéro vérifié</Badge>}
              {locked && (
                <Badge tone="warning" icon={<LockOpen />}>
                  PIN bloqué
                </Badge>
              )}
            </div>
            {u.bio && <p className="mt-3 rounded-[14px] bg-surface-alt px-4 py-2.5 text-[13.5px] text-ink-soft">« {u.bio} »</p>}
            {u.phone && <ContactButtons className="mt-4 w-full" compact phone={u.phone} name={name} />}
          </Card>

          {suspended && (
            <div className="rounded-[18px] border border-danger/25 bg-danger/6 px-4 py-3 text-[13.5px] leading-snug text-ink-soft">
              <strong className="text-danger">Compte suspendu.</strong> Cette personne ne peut plus se connecter, et ses trajets et annonces sont retirés de la recherche.
            </div>
          )}
          {locked && u.pinLockedUntil && (
            <div className="rounded-[18px] border border-warning/30 bg-warning/8 px-4 py-3 text-[13.5px] leading-snug text-ink-soft">
              <strong className="text-[#b46b05]">Code PIN bloqué</strong> après trop d’essais, jusqu’à {dayTime(u.pinLockedUntil).toLowerCase()}. Vous pouvez le débloquer ci-dessous.
            </div>
          )}

          <Card className="p-5">
            <InfoRow label="Inscrit le" value={date(u.createdAt)} />
            <InfoRow label="Note" value={u.ratingCount ? `${((u.ratingSum ?? 0) / u.ratingCount).toFixed(1).replace(".", ",")} / 5 (${u.ratingCount} avis)` : "Pas encore d’avis"} />
            <InfoRow label="Véhicules" value={String(u._count?.vehicles ?? 0)} />
            <InfoRow label="Trajets publiés" value={String(u._count?.carpoolTripsAsDriver ?? 0)} />
            <InfoRow label="Places réservées" value={String(u._count?.carpoolReservations ?? 0)} />
            <InfoRow label="Locations" value={String(u._count?.rentalBookings ?? 0)} />
            {u.pendingPhone && <InfoRow icon={<Phone />} label="Numéro en attente" value={<span className="text-[#b46b05]">{prettyPhone(u.pendingPhone, true)}</span>} className="border-t border-line" />}
            {u.sessionsRevokedAt && <InfoRow label="Sessions fermées le" value={dayTime(u.sessionsRevokedAt)} />}
          </Card>

          {!isSelf && (
            <Card className="space-y-2 p-5">
              <Button block variant="soft" icon={<Send className="h-4 w-4" />} onClick={() => setNotifyOpen(true)}>
                Envoyer un message
              </Button>
              {locked && (
                <Button
                  block
                  variant="outline"
                  icon={<LockOpen className="h-4 w-4" />}
                  loading={busy === "unlock"}
                  onClick={() => run("unlock", () => adminActions.unlockUser(u.id), { success: "Code PIN débloqué.", invalidate: ADMIN_INVALIDATE })}
                >
                  Débloquer le PIN
                </Button>
              )}
              <Button block variant="outline" icon={<LogOut className="h-4 w-4" />} onClick={() => setRevokeOpen(true)}>
                Déconnecter de tous les appareils
              </Button>
              {suspended ? (
                <Button block variant="outline" icon={<Power className="h-4 w-4" />} onClick={() => setReactivateOpen(true)}>
                  Réactiver le compte
                </Button>
              ) : (
                !admin && (
                  <Button block variant="danger" icon={<Power className="h-4 w-4" />} onClick={() => setSuspendOpen(true)}>
                    Suspendre le compte
                  </Button>
                )
              )}
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
          <Section title="Signalements le concernant" icon={<Flag />} count={u.reportsAgainst?.length} badge={u.reportsAgainstOpen ? `${u.reportsAgainstOpen} ouvert${u.reportsAgainstOpen > 1 ? "s" : ""}` : undefined} empty={!u.reportsAgainst?.length}>
            {u.reportsAgainst?.map((r) => {
              const state = REPORT_STATUS[r.status];
              return (
                <div key={r.id} className="p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[14.5px] font-bold text-ink">{r.reasonLabel ?? reportReasonLabel(r.reason)}</p>
                      <p className="text-[12.5px] text-muted">
                        par {shortName(r.reporter)} · {relative(r.createdAt)}
                      </p>
                    </div>
                    <Badge tone={state.tone} dot>
                      {state.label}
                    </Badge>
                  </div>
                  {r.details && <p className="mt-2 whitespace-pre-line break-words rounded-[12px] bg-surface-alt px-3 py-2 text-[13.5px] text-ink-soft">« {r.details} »</p>}
                </div>
              );
            })}
            {!!u.reportsAgainst?.length && (
              <div className="p-3">
                <Link href="/admin/signalements" className="text-[13px] font-bold text-brand hover:underline">
                  Traiter les signalements
                </Link>
              </div>
            )}
          </Section>

          <Section title="Appareils" icon={<Smartphone />} count={u.pushDevices?.length} empty={!u.pushDevices?.length} emptyText="Aucun appareil enregistré pour les notifications.">
            {u.pushDevices?.map((d) => (
              <div key={d.id} className="flex items-center justify-between gap-3 p-3">
                <span className="min-w-0">
                  <span className="block text-[14.5px] font-bold text-ink">{d.platform === "IOS" ? "iPhone" : d.platform === "ANDROID" ? "Android" : d.platform}</span>
                  <span className="text-[12.5px] text-muted">
                    {d.audience === "PRO" ? "Taagno Pro" : "Taagno"}
                    {d.appVersion ? ` · version ${d.appVersion}` : ""}
                    {d.lastSeenAt ? ` · vu ${relative(d.lastSeenAt)}` : ""}
                  </span>
                </span>
              </div>
            ))}
          </Section>

          <Section title="Avis reçus" icon={<MessageSquareHeart />} count={u.reviewsReceived?.length} empty={!u.reviewsReceived?.length}>
            {u.reviewsReceived?.map((r) => (
              <div key={r.id} className="flex items-start gap-3 p-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Stars value={r.rating} size={14} />
                    <span className="text-[13.5px] font-bold text-ink">{shortName(r.author)}</span>
                    <span className="text-[12px] text-faint">{relative(r.createdAt ?? "")}</span>
                  </div>
                  {r.comment && <p className="mt-1 break-words text-[14px] leading-relaxed text-ink-soft">{r.comment}</p>}
                </div>
                <Button variant="danger" size="icon-sm" aria-label="Supprimer cet avis" onClick={() => setReviewTarget({ ...r, createdAt: r.createdAt ?? "", target: u })}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </Section>

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
              <Link key={t.id} href={`/admin/trajets/${t.id}`} className="flex items-center justify-between gap-3 rounded-[14px] p-3 transition hover:bg-surface-alt">
                <span className="min-w-0">
                  <span className="block truncate text-[14.5px] font-bold text-ink">
                    {t.departureCity} → {t.arrivalCity}
                  </span>
                  <span className="text-[12.5px] text-muted">
                    {dayTime(t.departureTime)} · {fcfa(t.pricePerSeat)} · {t._count?.reservations ?? 0} réservation(s)
                  </span>
                </span>
                <StatusBadge status={t.status} map={TRIP_STATUS} />
              </Link>
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
                    {b.withDriver ? " · avec chauffeur" : ""}
                  </span>
                </span>
                <StatusBadge status={b.status} map={BOOKING_STATUS} />
              </div>
            ))}
          </Section>

          <Section title="Historique de l’équipe" icon={<History />} count={u.adminHistory?.length} empty={!u.adminHistory?.length} emptyText="Aucune action de l’équipe sur ce compte.">
            {u.adminHistory?.map((a) => (
              <div key={a.id} className="p-3">
                <p className="break-words text-[14px] font-bold text-ink">{a.summary}</p>
                <p className="text-[12.5px] text-muted">
                  {[a.admin?.firstName, a.admin?.lastName].filter(Boolean).join(" ") || "Équipe Taagno"} · {dayTime(a.createdAt)}
                  {typeof a.details?.reason === "string" && a.details.reason ? ` · motif : « ${a.details.reason} »` : ""}
                </p>
              </div>
            ))}
          </Section>
        </div>
      </div>

      <NotifyUserModal open={notifyOpen} onOpenChange={setNotifyOpen} userId={u.id} name={name} />

      <ReasonModal
        open={suspendOpen}
        onOpenChange={setSuspendOpen}
        title="Suspendre ce compte ?"
        message={
          <>
            <strong>{name}</strong> sera déconnecté de tous ses appareils et ne pourra plus se connecter. Ses trajets et ses annonces disparaîtront de la recherche. Vous pourrez le réactiver à tout moment.
          </>
        }
        confirmLabel="Suspendre le compte"
        hint="Gardé dans le journal, jamais montré à la personne."
        placeholder="Ex. : plusieurs signalements d’arnaque"
        loading={busy === "active"}
        onConfirm={async (reason) => {
          const ok = await run("active", () => adminActions.toggleUserActive(u.id, reason), { success: "Compte suspendu.", invalidate: ADMIN_INVALIDATE });
          if (ok !== undefined) setSuspendOpen(false);
        }}
      />
      <ConfirmModal
        open={reactivateOpen}
        onOpenChange={setReactivateOpen}
        title="Réactiver ce compte ?"
        message={`${name} pourra de nouveau se connecter, et ses trajets et annonces réapparaîtront dans la recherche.`}
        confirmLabel="Réactiver le compte"
        loading={busy === "active"}
        onConfirm={async () => {
          const ok = await run("active", () => adminActions.toggleUserActive(u.id), { success: "Compte réactivé.", invalidate: ADMIN_INVALIDATE });
          if (ok !== undefined) setReactivateOpen(false);
        }}
      />
      <ConfirmModal
        open={revokeOpen}
        onOpenChange={setRevokeOpen}
        title="Déconnecter de tous les appareils ?"
        message={`${name} devra se reconnecter partout avec son numéro et son code PIN. Ses appareils ne recevront plus de notifications jusqu’à sa prochaine connexion.`}
        confirmLabel="Déconnecter"
        danger
        loading={busy === "revoke"}
        onConfirm={async () => {
          const ok = await run("revoke", () => adminActions.revokeSessions(u.id), { success: "Déconnecté de tous les appareils.", invalidate: ADMIN_INVALIDATE });
          if (ok !== undefined) setRevokeOpen(false);
        }}
      />
      <ConfirmModal
        open={!!reviewTarget}
        onOpenChange={(v) => !v && setReviewTarget(null)}
        title="Supprimer cet avis ?"
        danger
        confirmLabel="Supprimer l’avis"
        loading={busy === "review"}
        message={reviewTarget && <>L’avis {reviewTarget.rating}/5 de {fullName(reviewTarget.author)} sera supprimé et retiré de la note moyenne de {name}. Cette action est irréversible.</>}
        onConfirm={async () => {
          if (!reviewTarget) return;
          const ok = await run("review", () => adminActions.deleteReview(reviewTarget.id), { success: "Avis supprimé, la note moyenne est mise à jour.", invalidate: ADMIN_INVALIDATE });
          if (ok !== undefined) setReviewTarget(null);
        }}
      />
      <ConfirmModal
        open={roleOpen}
        onOpenChange={setRoleOpen}
        title={admin ? "Retirer les droits d’administration ?" : "Nommer administrateur ?"}
        message={admin ? `${name} n’aura plus accès à l’administration.` : `${name} pourra approuver les véhicules et gérer les comptes.`}
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

function Section({
  title,
  icon,
  empty,
  emptyText = "Rien pour le moment.",
  count,
  badge,
  children,
}: {
  title: string;
  icon: ReactNode;
  empty?: boolean;
  emptyText?: string;
  count?: number;
  badge?: string;
  children: ReactNode;
}) {
  return (
    <Card className="p-5">
      <h2 className="mb-2 flex items-center gap-2 text-[16px] font-extrabold text-ink [&_svg]:h-[18px] [&_svg]:w-[18px] [&_svg]:text-brand">
        {icon} {title}
        {count ? <span className="rounded-full bg-surface-alt px-2 text-[12px] leading-5 text-ink-soft">{count}</span> : null}
        {badge && <Badge tone="danger">{badge}</Badge>}
      </h2>
      {empty ? <p className="px-3 py-2 text-[13.5px] text-muted">{emptyText}</p> : <div className="divide-y divide-line">{children}</div>}
    </Card>
  );
}

"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { ArrowLeft, Eye, KeyRound, MapPin, Pencil, ShieldCheck, Trash2, UserRound } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { RentalRequestCard } from "@/components/pro/request-cards";
import { Badge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { Switch } from "@/components/ui/field";
import { Gallery } from "@/components/ui/gallery";
import { Card, EmptyState } from "@/components/ui/misc";
import { ConfirmModal } from "@/components/ui/modal";
import { PageSpinner } from "@/components/ui/spinner";
import { api, errorMessage } from "@/lib/api";
import { fcfa, plural } from "@/lib/format";
import { groupRentalRequests, offerVisibility } from "@/lib/pro";
import { useAction, useMyOffers } from "@/lib/queries";
import { orderedPhotos, rentalOptionLabel, vehicleTitle, vehicleTitleYear } from "@/lib/types";

export default function ManageOfferPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data, isPending } = useMyOffers();
  const { run, busy } = useAction();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const offer = data?.find((o) => o.id === id);

  if (isPending || deleted) return <PageSpinner />;
  if (!offer) return <EmptyState icon={<KeyRound />} title="Annonce introuvable" action={<LinkButton href="/pro/locations">Mes locations</LinkButton>} />;

  const groups = groupRentalRequests([offer]);
  const v = offer.vehicle;
  const visibility = offerVisibility(offer);

  const removeOffer = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await api.delete(`/rental/offers/${offer.id}`);
    } catch (e) {
      // 409 : une location confirmée n'est pas terminée. On garde la fenêtre ouverte avec le message du serveur.
      setDeleteError(errorMessage(e));
      setDeleting(false);
      return;
    }
    setDeleted(true);
    setDeleteOpen(false);
    toast.success("Annonce supprimée");
    router.push("/pro/locations");
    for (const queryKey of [["offers"], ["offer", offer.id], ["bookings"], ["vehicles"], ["unread"], ["notifications"]]) {
      queryClient.invalidateQueries({ queryKey });
    }
  };

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
                  <p className="text-[15px] font-extrabold text-ink">{offer.isActive ? "Annonce activée" : "Annonce en pause"}</p>
                  <p className="text-[12.5px] text-muted">
                    {visibility.visible
                      ? "Visible par les voyageurs"
                      : offer.isActive
                        ? `Invisible pour l’instant : ${visibility.reason.toLowerCase()}`
                        : "Invisible dans les recherches"}
                  </p>
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

      {/* Zone dangereuse */}
      <Card className="mt-10 border-danger/25 p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-[15px] font-extrabold text-danger">
          <Trash2 className="h-4.5 w-4.5" /> Zone dangereuse
        </h2>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-[14px] leading-relaxed text-ink-soft">
            Supprimer l’annonce la retire définitivement de Taagno. Si vous voulez seulement l’arrêter un moment, mettez-la plutôt en pause.
          </p>
          <Button
            variant="danger"
            icon={<Trash2 className="h-4 w-4" />}
            onClick={() => {
              setDeleteError(null);
              setDeleteOpen(true);
            }}
          >
            Supprimer l’annonce
          </Button>
        </div>
      </Card>

      <ConfirmModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Supprimer cette annonce ?"
        message={
          <>
            <p>
              Les demandes en attente seront annulées et leurs auteurs seront prévenus. Les locations déjà terminées restent dans leur historique.
            </p>
            <p className="mt-3">
              Pas sûr(e) ? Vous pouvez aussi simplement <strong className="text-ink">masquer l’annonce</strong> avec l’interrupteur « Annonce en ligne » : elle ne sera plus visible, et vous pourrez la remettre en ligne quand vous voulez.
            </p>
          </>
        }
        confirmLabel="Supprimer l’annonce"
        danger
        loading={deleting}
        onConfirm={removeOffer}
      >
        {deleteError && (
          <p className="mt-4 rounded-[14px] bg-danger/10 px-4 py-3 text-[13.5px] font-semibold text-danger" role="alert">
            {deleteError}
          </p>
        )}
      </ConfirmModal>
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

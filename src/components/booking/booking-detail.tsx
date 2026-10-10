"use client";

import { motion } from "framer-motion";
import { ArrowLeft, CalendarRange, Check, Flag, HandCoins, KeyRound, MapPin, Route, ShieldCheck, Star, UserRound, X } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import { PersonCard } from "@/components/people/person-card";
import { VehicleSummary } from "@/components/people/vehicle-summary";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, EmptyState, InfoRow } from "@/components/ui/misc";
import { ConfirmModal } from "@/components/ui/modal";
import { PageSpinner } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import { daysUntil, fcfa, longDate, parseDay, plural, range, rentalDays, time } from "@/lib/format";
import { useAction, useGivenReviews, useMyBookings, useMyReservations } from "@/lib/queries";
import { BOOKING_STATUS, isActiveBooking, isPastTrip, rentalCancellation, tripCancellation, type BookingStatus, type CancellationNotice } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ContactButtons } from "./contact-buttons";
import { ReviewModal } from "./review-modal";

/** Étapes d'une réservation (ou, si elle est annulée, qui l'a annulée et pourquoi). */
function Progress({ status, notice }: { status: BookingStatus; notice?: CancellationNotice | null }) {
  if (status === "REJECTED" || status === "CANCELLED") {
    return (
      <div className="flex items-start gap-3 rounded-[16px] bg-surface-alt px-4 py-3 text-[14px] font-semibold text-ink-soft">
        <X className="mt-px h-5 w-5 shrink-0 text-danger" />
        <div className="min-w-0">
          <p>{status === "REJECTED" ? "Demande refusée. Pas d’inquiétude : d’autres offres vous attendent." : (notice?.title ?? "Réservation annulée.")}</p>
          {notice?.reason && <p className="mt-1 break-words font-medium text-muted">Motif : « {notice.reason} »</p>}
        </div>
      </div>
    );
  }
  const steps = ["Demande envoyée", "Confirmée", "Terminée"];
  const current = status === "PENDING" ? 0 : status === "CONFIRMED" ? 1 : 2;
  return (
    <div className="flex items-center">
      {steps.map((label, i) => (
        <div key={label} className="flex flex-1 items-center last:flex-none">
          <div className="flex flex-col items-center gap-1.5">
            <motion.span
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.12 }}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-extrabold",
                i <= current ? "bg-brand-gradient text-white shadow-glow" : "bg-surface-alt text-faint",
              )}
            >
              {i < current || (i === current && current === 2) ? <Check className="h-4.5 w-4.5" /> : i + 1}
            </motion.span>
            <span className={cn("whitespace-nowrap text-[11.5px] font-bold", i <= current ? "text-ink" : "text-faint")}>{label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className="mx-2 mb-5 h-[3px] flex-1 overflow-hidden rounded-full bg-surface-alt">
              <motion.div
                className="h-full bg-brand"
                initial={{ width: 0 }}
                animate={{ width: i < current ? "100%" : "0%" }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.15 }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function Shell({ back, title, status, children }: { back: string; title: ReactNode; status: BookingStatus; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl px-4 pb-12 pt-5 sm:px-6">
      <Link href={back} className="inline-flex items-center gap-1.5 rounded-full px-2 py-1.5 text-[14px] font-bold text-ink-soft transition hover:bg-white hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Mes réservations
      </Link>
      <div className="mt-3 flex items-start justify-between gap-3">
        <h1 className="text-[24px] font-extrabold leading-tight tracking-tight text-ink sm:text-[28px]">{title}</h1>
        <StatusBadge status={status} map={BOOKING_STATUS} />
      </div>
      <div className="mt-5 space-y-4">{children}</div>
    </div>
  );
}

function NotFound({ back }: { back: string }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-14">
      <EmptyState icon={<Route />} title="Réservation introuvable" text="Elle a peut-être été supprimée." action={<LinkButton href={back}>Mes réservations</LinkButton>} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Place de covoiturage
// ---------------------------------------------------------------------------

export function TripBookingDetail({ id }: { id: string }) {
  const params = useSearchParams();
  const { data, isPending } = useMyReservations();
  const given = useGivenReviews();
  const { run, busy } = useAction();
  const [cancelOpen, setCancelOpen] = useState(false);
  const r = data?.find((x) => x.id === id);
  const canReview = r?.status === "COMPLETED" && !!given.data && !given.data.carpoolReservationIds.includes(r.id);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [autoOpened, setAutoOpened] = useState(false);
  if (canReview && params.get("avis") === "1" && !autoOpened) {
    setAutoOpened(true);
    setReviewOpen(true);
  }

  if (isPending) return <PageSpinner />;
  if (!r || !r.trip) return <NotFound back="/reservations" />;
  const t = r.trip;
  const total = t.pricePerSeat * r.seatsReserved;
  const upcoming = !isPastTrip(t);
  const notice = tripCancellation(r);

  return (
    <Shell back="/reservations" title={`${t.departureCity} → ${t.arrivalCity}`} status={r.status}>
      <Card className="p-5 sm:p-6">
        <Progress status={r.status} notice={notice} />
        {r.status === "PENDING" && <p className="mt-4 text-[13.5px] text-muted">Le conducteur n’a pas encore répondu. Vous recevrez une notification dès qu’il accepte.</p>}
      </Card>

      {canReview && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 rounded-[22px] bg-gold/12 p-5">
          <Star className="h-8 w-8 shrink-0 fill-gold text-gold" />
          <div className="flex-1">
            <p className="text-[15px] font-extrabold text-ink">Comment s’est passé le trajet ?</p>
            <p className="text-[13.5px] text-ink-soft">Votre avis aide toute la communauté.</p>
          </div>
          <Button onClick={() => setReviewOpen(true)} size="sm">
            Noter
          </Button>
        </motion.div>
      )}

      <Card className="p-5 sm:p-6">
        <InfoRow icon={<CalendarRange />} label="Départ" value={`${longDate(t.departureTime)} à ${time(t.departureTime)}`} />
        <InfoRow icon={<MapPin />} label="Rendez-vous" value={t.meetingPoint || "À convenir"} />
        <InfoRow icon={<Flag />} label="Dépose" value={t.dropoffPoint || "À convenir"} />
        <InfoRow icon={<Route />} label="Places" value={plural(r.seatsReserved, "place")} />
        <InfoRow icon={<HandCoins />} label="À régler au conducteur" value={fcfa(total)} className="border-t border-line pt-3" />
        <LinkButton href={`/covoiturage/${t.id}`} variant="ghost" size="sm" className="mt-2">
          Voir la fiche du trajet
        </LinkButton>
      </Card>

      <Card className="p-5 sm:p-6">
        <PersonCard user={t.driver} role="Conducteur" />
        {r.status === "CONFIRMED" && t.driver?.phone ? (
          <ContactButtons
            className="mt-5"
            phone={t.driver.phone}
            name={t.driver.firstName ?? "le conducteur"}
            message={`Bonjour, j’ai réservé sur Taagno le trajet ${t.departureCity} → ${t.arrivalCity} du ${longDate(t.departureTime).toLowerCase()} à ${time(t.departureTime)}.`}
          />
        ) : r.status === "PENDING" ? (
          <p className="mt-4 flex items-center gap-2 rounded-[14px] bg-surface-alt px-4 py-3 text-[13px] text-muted">
            <ShieldCheck className="h-4 w-4 text-brand" /> Le numéro du conducteur s’affichera ici dès qu’il aura confirmé.
          </p>
        ) : null}
        {t.vehicle && (
          <div className="mt-5 border-t border-line pt-5">
            <VehicleSummary vehicle={t.vehicle} />
          </div>
        )}
      </Card>

      {isActiveBooking(r.status) && upcoming && (
        <Button variant="danger" block size="lg" onClick={() => setCancelOpen(true)}>
          Annuler ma réservation
        </Button>
      )}

      <ConfirmModal
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Annuler la réservation ?"
        message="Le conducteur sera prévenu et votre place sera libérée pour un autre voyageur."
        confirmLabel="Oui, annuler"
        danger
        loading={busy === "cancel"}
        onConfirm={async () => {
          const ok = await run("cancel", () => api.patch(`/carpool/reservations/${r.id}/cancel`), {
            success: "Réservation annulée.",
            invalidate: [["reservations"], ["trip", t.id]],
          });
          if (ok !== undefined) setCancelOpen(false);
        }}
      />
      <ReviewModal open={reviewOpen} onOpenChange={setReviewOpen} person={t.driver} role="Votre conducteur" carpoolReservationId={r.id} />
    </Shell>
  );
}

// ---------------------------------------------------------------------------
// Location
// ---------------------------------------------------------------------------

export function RentalBookingDetail({ id }: { id: string }) {
  const params = useSearchParams();
  const { data, isPending } = useMyBookings();
  const given = useGivenReviews();
  const { run, busy } = useAction();
  const [cancelOpen, setCancelOpen] = useState(false);
  const b = data?.find((x) => x.id === id);
  const canReview = b?.status === "COMPLETED" && !!given.data && !given.data.rentalBookingIds.includes(b.id);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [autoOpened, setAutoOpened] = useState(false);
  if (canReview && params.get("avis") === "1" && !autoOpened) {
    setAutoOpened(true);
    setReviewOpen(true);
  }

  if (isPending) return <PageSpinner />;
  if (!b) return <NotFound back="/reservations?onglet=locations" />;
  const offer = b.rentalOffer;
  const v = offer?.vehicle;
  const owner = v?.owner;
  const start = parseDay(b.startDate);
  const end = parseDay(b.endDate);
  const days = rentalDays(start, end);
  const notice = rentalCancellation(b);
  const driverPrice = b.withDriver ? b.driverPricePerDay : null;

  return (
    <Shell back="/reservations?onglet=locations" title={v ? `Location · ${v.brand} ${v.model}` : "Location"} status={b.status}>
      <Card className="p-5 sm:p-6">
        <Progress status={b.status} notice={notice} />
        {b.status === "PENDING" && <p className="mt-4 text-[13.5px] text-muted">Le propriétaire n’a pas encore répondu. Vous serez prévenu dès qu’il accepte.</p>}
      </Card>

      {canReview && (
        <div className="flex items-center gap-4 rounded-[22px] bg-gold/12 p-5">
          <Star className="h-8 w-8 shrink-0 fill-gold text-gold" />
          <div className="flex-1">
            <p className="text-[15px] font-extrabold text-ink">Comment s’est passée la location ?</p>
            <p className="text-[13.5px] text-ink-soft">Notez le propriétaire en un instant.</p>
          </div>
          <Button onClick={() => setReviewOpen(true)} size="sm">
            Noter
          </Button>
        </div>
      )}

      <Card className="p-5 sm:p-6">
        <VehicleSummary vehicle={v} />
        <div className="mt-4 border-t border-line pt-2">
          <InfoRow icon={<CalendarRange />} label="Période" value={`${range(start, end)} (${plural(days, "jour")})`} />
          {offer?.pickupLocation && <InfoRow icon={<MapPin />} label="Remise des clés" value={offer.pickupLocation} />}
          {b.withDriver && (
            <InfoRow
              icon={<UserRound />}
              label="Chauffeur"
              value={
                <>
                  <Badge tone="warning" icon={<UserRound />}>
                    Avec chauffeur
                  </Badge>
                  <span className="mt-1 block text-[12.5px] font-medium text-muted">
                    {driverPrice ? `+ ${fcfa(driverPrice)} / jour, compris dans le prix` : "Tarif à convenir avec le propriétaire"}
                  </span>
                </>
              }
            />
          )}
          <InfoRow icon={<KeyRound />} label="Caution demandée" value={offer?.depositAmount ? fcfa(offer.depositAmount) : "Aucune"} />
          <InfoRow icon={<HandCoins />} label={driverPrice ? "Prix (chauffeur compris)" : "Prix de la location"} value={fcfa(b.totalPrice)} className="border-t border-line pt-3" />
        </div>
        {offer && (
          <LinkButton href={`/location/${offer.id}`} variant="ghost" size="sm" className="mt-2">
            Voir l’annonce
          </LinkButton>
        )}
      </Card>

      <Card className="p-5 sm:p-6">
        <PersonCard user={owner} role="Propriétaire" />
        {b.status === "CONFIRMED" && owner?.phone ? (
          <ContactButtons
            className="mt-5"
            phone={owner.phone}
            name={owner.firstName ?? "le propriétaire"}
            message={`Bonjour, ma location de ${v ? `${v.brand} ${v.model}` : "votre véhicule"} (${range(start, end).toLowerCase()}) est confirmée sur Taagno.`}
          />
        ) : b.status === "PENDING" ? (
          <p className="mt-4 flex items-center gap-2 rounded-[14px] bg-surface-alt px-4 py-3 text-[13px] text-muted">
            <ShieldCheck className="h-4 w-4 text-brand" /> Le numéro du propriétaire s’affichera ici dès qu’il aura confirmé.
          </p>
        ) : null}
      </Card>

      {isActiveBooking(b.status) && daysUntil(start) >= 0 && (
        <Button variant="danger" block size="lg" onClick={() => setCancelOpen(true)}>
          Annuler la location
        </Button>
      )}

      <ConfirmModal
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Annuler la location ?"
        message="Le propriétaire sera prévenu et les dates seront libérées."
        confirmLabel="Oui, annuler"
        danger
        loading={busy === "cancel"}
        onConfirm={async () => {
          const ok = await run("cancel", () => api.patch(`/rental/bookings/${b.id}/cancel`), {
            success: "Location annulée.",
            invalidate: [["bookings"], ["offer", offer?.id ?? ""]],
          });
          if (ok !== undefined) setCancelOpen(false);
        }}
      />
      <ReviewModal open={reviewOpen} onOpenChange={setReviewOpen} person={owner} role="Propriétaire" rentalBookingId={b.id} />
    </Shell>
  );
}


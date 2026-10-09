"use client";

import { motion } from "framer-motion";
import { CalendarRange, Check, Flag, Star, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ContactButtons } from "@/components/booking/contact-buttons";
import { ReviewModal } from "@/components/booking/review-modal";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/modal";
import { RatingPill } from "@/components/ui/rating";
import { api } from "@/lib/api";
import { day, fcfa, parseDay, plural, range, rentalDays, startOfDay, time } from "@/lib/format";
import { type RentalRequest, type TripRequest } from "@/lib/pro";
import { useAction, useGivenReviews } from "@/lib/queries";
import { BOOKING_STATUS, shortName, userRating, vehicleTitle } from "@/lib/types";

const INVALIDATE = [["trips"], ["offers"], ["unread"], ["notifications"]];

/** Demande de place sur un trajet. */
export function TripRequestCard({ request, showTrip = true, index = 0 }: { request: TripRequest; showTrip?: boolean; index?: number }) {
  const { trip, reservation: r } = request;
  const p = r.passenger;
  const { run, busy } = useAction();
  const given = useGivenReviews();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const canReview = r.status === "COMPLETED" && !!given.data && !given.data.carpoolReservationIds.includes(r.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 8) * 0.04 }}
      className="rounded-[22px] border border-line/70 bg-white p-4 shadow-card sm:p-5"
    >
      {showTrip && (
        <Link href={`/pro/trajets/${trip.id}`} className="mb-3 flex items-center justify-between gap-2 border-b border-dashed border-line pb-3 hover:text-brand">
          <span className="truncate text-[14px] font-extrabold text-ink">
            {trip.departureCity} → {trip.arrivalCity}
          </span>
          <span className="shrink-0 text-[12.5px] font-bold text-brand">
            {day(trip.departureTime)} · {time(trip.departureTime)}
          </span>
        </Link>
      )}
      <div className="flex items-center gap-3">
        <Link href={p?.id ? `/membres/${p.id}` : "#"} className="shrink-0">
          <Avatar user={p} size={46} />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15.5px] font-extrabold text-ink">{shortName(p)}</p>
          <div className="flex flex-wrap items-center gap-x-2 text-[13px] text-muted">
            <RatingPill value={userRating(p)} count={p?.ratingCount} />
            <span>
              · {plural(r.seatsReserved, "place")} · {fcfa(trip.pricePerSeat * r.seatsReserved)}
            </span>
          </div>
        </div>
        <StatusBadge status={r.status} map={BOOKING_STATUS} />
      </div>

      {r.status === "PENDING" && (
        <div className="mt-4 flex gap-2">
          <Button variant="outline" className="flex-1" icon={<X className="h-4 w-4" />} disabled={!!busy} onClick={() => setRejectOpen(true)}>
            Refuser
          </Button>
          <Button
            variant="solid"
            className="flex-[1.4]"
            icon={<Check className="h-4 w-4" />}
            loading={busy === "accept"}
            onClick={() => run("accept", () => api.patch(`/carpool/reservations/${r.id}/accept`), { success: `${shortName(p)} est confirmé·e. Son numéro est maintenant visible.`, invalidate: INVALIDATE })}
          >
            Accepter
          </Button>
        </div>
      )}
      {r.status === "CONFIRMED" && p?.phone && (
        <ContactButtons
          className="mt-4"
          compact
          phone={p.phone}
          name={shortName(p)}
          message={`Bonjour ${p.firstName ?? ""}, c’est votre conducteur Taagno pour le trajet ${trip.departureCity} → ${trip.arrivalCity} (${day(trip.departureTime).toLowerCase()} à ${time(trip.departureTime)}).`}
        />
      )}
      {canReview && (
        <Button variant="soft" size="sm" className="mt-4" icon={<Star className="h-4 w-4" />} onClick={() => setReviewOpen(true)}>
          Noter ce passager
        </Button>
      )}

      <ConfirmModal
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        title="Refuser la demande ?"
        message={`${shortName(p)} sera prévenu·e et pourra chercher un autre trajet.`}
        confirmLabel="Refuser"
        danger
        loading={busy === "reject"}
        onConfirm={async () => {
          await run("reject", () => api.patch(`/carpool/reservations/${r.id}/reject`), { success: "Demande refusée.", invalidate: INVALIDATE });
          setRejectOpen(false);
        }}
      />
      <ReviewModal open={reviewOpen} onOpenChange={setReviewOpen} person={p} role="Votre passager" carpoolReservationId={r.id} />
    </motion.div>
  );
}

/** Demande de location. */
export function RentalRequestCard({ request, showOffer = true, index = 0 }: { request: RentalRequest; showOffer?: boolean; index?: number }) {
  const { offer, booking: b } = request;
  const renter = b.renter;
  const { run, busy } = useAction();
  const given = useGivenReviews();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const start = parseDay(b.startDate);
  const end = parseDay(b.endDate);
  const started = start <= startOfDay(new Date());
  const canReview = b.status === "COMPLETED" && !!given.data && !given.data.rentalBookingIds.includes(b.id);
  const v = offer.vehicle;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 8) * 0.04 }}
      className="rounded-[22px] border border-line/70 bg-white p-4 shadow-card sm:p-5"
    >
      {showOffer && (
        <Link href={`/pro/locations/${offer.id}`} className="mb-3 flex items-center justify-between gap-2 border-b border-dashed border-line pb-3 hover:text-brand">
          <span className="truncate text-[14px] font-extrabold text-ink">{vehicleTitle(v)}</span>
          <span className="shrink-0 text-[12.5px] font-bold text-brand">{fcfa(offer.pricePerDay)} / jour</span>
        </Link>
      )}
      <div className="flex items-center gap-3">
        <Link href={renter?.id ? `/membres/${renter.id}` : "#"} className="shrink-0">
          <Avatar user={renter} size={46} />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15.5px] font-extrabold text-ink">{shortName(renter)}</p>
          <div className="flex flex-wrap items-center gap-x-2 text-[13px] text-muted">
            <RatingPill value={userRating(renter)} count={renter?.ratingCount} />
          </div>
        </div>
        <StatusBadge status={b.status} map={BOOKING_STATUS} />
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-[14px] bg-surface-alt px-4 py-2.5 text-[13.5px]">
        <span className="flex items-center gap-1.5 font-bold text-ink">
          <CalendarRange className="h-4 w-4 text-brand" /> {range(start, end)} · {plural(rentalDays(start, end), "jour")}
        </span>
        <span className="font-extrabold text-ink">{fcfa(b.totalPrice)}</span>
      </div>

      {b.status === "PENDING" && (
        <div className="mt-4 flex gap-2">
          <Button variant="outline" className="flex-1" icon={<X className="h-4 w-4" />} disabled={!!busy} onClick={() => setRejectOpen(true)}>
            Refuser
          </Button>
          <Button
            variant="solid"
            className="flex-[1.4]"
            icon={<Check className="h-4 w-4" />}
            loading={busy === "accept"}
            onClick={() => run("accept", () => api.patch(`/rental/bookings/${b.id}/accept`), { success: "Location confirmée. Le numéro du locataire est maintenant visible.", invalidate: INVALIDATE })}
          >
            Accepter
          </Button>
        </div>
      )}
      {b.status === "CONFIRMED" && (
        <div className="mt-4 space-y-3">
          {renter?.phone && (
            <ContactButtons compact phone={renter.phone} name={shortName(renter)} message={`Bonjour ${renter.firstName ?? ""}, c’est le propriétaire du véhicule ${vehicleTitle(v)} réservé sur Taagno (${range(start, end).toLowerCase()}).`} />
          )}
          {started && (
            <Button variant="soft" size="sm" icon={<Flag className="h-4 w-4" />} onClick={() => setCompleteOpen(true)}>
              Véhicule rendu : terminer la location
            </Button>
          )}
        </div>
      )}
      {canReview && (
        <Button variant="soft" size="sm" className="mt-4" icon={<Star className="h-4 w-4" />} onClick={() => setReviewOpen(true)}>
          Noter ce locataire
        </Button>
      )}

      <ConfirmModal
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        title="Refuser la demande ?"
        message={`${shortName(renter)} sera prévenu·e et les dates redeviendront disponibles.`}
        confirmLabel="Refuser"
        danger
        loading={busy === "reject"}
        onConfirm={async () => {
          await run("reject", () => api.patch(`/rental/bookings/${b.id}/reject`), { success: "Demande refusée.", invalidate: INVALIDATE });
          setRejectOpen(false);
        }}
      />
      <ConfirmModal
        open={completeOpen}
        onOpenChange={setCompleteOpen}
        title="Terminer la location ?"
        message="Confirmez que le véhicule vous a été rendu. Vous pourrez ensuite noter le locataire."
        confirmLabel="Oui, terminer"
        loading={busy === "complete"}
        onConfirm={async () => {
          await run("complete", () => api.patch(`/rental/bookings/${b.id}/complete`), { success: "Location terminée.", invalidate: INVALIDATE });
          setCompleteOpen(false);
        }}
      />
      <ReviewModal open={reviewOpen} onOpenChange={setReviewOpen} person={renter} role="Votre locataire" rentalBookingId={b.id} />
    </motion.div>
  );
}

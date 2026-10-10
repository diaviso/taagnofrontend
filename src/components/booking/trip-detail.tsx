"use client";

import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Armchair, CalendarDays, Clock, Flag, HandCoins, Info, MapPin, MessageSquareQuote, Route, Ticket, Zap } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { FavoriteButton } from "@/components/cards/favorite-button";
import { OptionIcon } from "@/components/cards/option-icon";
import { PersonCard } from "@/components/people/person-card";
import { VehicleSummary } from "@/components/people/vehicle-summary";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, Counter, EmptyState } from "@/components/ui/misc";
import { Modal } from "@/components/ui/modal";
import { ShareButton } from "@/components/ui/share-button";
import { PageSpinner } from "@/components/ui/spinner";
import { api, errorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { tripKey } from "@/lib/favorites";
import { countdown, fcfa, longDate, plural, time } from "@/lib/format";
import { useTrip } from "@/lib/queries";
import {
  BOOKING_STATUS,
  TRIP_STATUS,
  isActiveBooking,
  isBookable,
  isInstant,
  isPastTrip,
  tripOptionLabel,
  type CarpoolTrip,
} from "@/lib/types";
import { SuccessCheck } from "./success-check";

export function TripDetail({ id, initial }: { id: string; initial: CarpoolTrip | null }) {
  const { data: trip, isPending, error } = useTrip(id, initial);
  if (isPending && !trip) return <PageSpinner />;
  if (!trip) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <EmptyState
          icon={<Route />}
          title="Trajet introuvable"
          text={error ? errorMessage(error) : "Ce trajet n’existe plus ou a été retiré par le conducteur."}
          action={<LinkButton href="/covoiturage">Voir les autres trajets</LinkButton>}
        />
      </div>
    );
  }
  return <TripView trip={trip} />;
}

function TripView({ trip }: { trip: CarpoolTrip }) {
  const { user, requireAuth } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  // Nombre de places repris de la recherche (?places=…), dans la limite des places libres.
  const [seats, setSeats] = useState(() => Math.max(1, Math.min(Number(params.get("places")) || 1, trip.availableSeats || 1, 6)));
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isDriver = !!user && user.id === trip.driverId;
  const mine = user ? (trip.reservations ?? []).find((r) => r.passengerId === user.id && isActiveBooking(r.status)) : undefined;
  const bookable = isBookable(trip);
  const instant = isInstant(trip);
  const maxSeats = Math.max(1, Math.min(trip.availableSeats, 6));
  const total = trip.pricePerSeat * seats;
  const title = `${trip.departureCity} → ${trip.arrivalCity}`;

  const book = () => requireAuth(() => setConfirmOpen(true), "Connectez-vous pour réserver votre place. C’est rapide : votre numéro et un code.");

  const bookingPanel = (
    <BookingPanel
      trip={trip}
      seats={seats}
      setSeats={setSeats}
      maxSeats={maxSeats}
      total={total}
      isDriver={isDriver}
      mine={mine ? { id: mine.id, status: mine.status, seats: mine.seatsReserved } : undefined}
      bookable={bookable}
      instant={instant}
      onBook={() => {
        setMobileOpen(false);
        book();
      }}
    />
  );

  return (
    <div className="mx-auto max-w-6xl px-4 pb-2 pt-5 sm:px-6 lg:pb-12">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => (window.history.length > 1 ? router.back() : router.push("/covoiturage"))}
          className="inline-flex items-center gap-1.5 rounded-full px-2 py-1.5 text-[14px] font-bold text-ink-soft transition hover:bg-white hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" /> Retour
        </button>
        <div className="flex items-center gap-2">
          <ShareButton title={title} text={`Covoiturage ${title}, ${longDate(trip.departureTime).toLowerCase()} à ${time(trip.departureTime)} — ${fcfa(trip.pricePerSeat)} la place sur Taagno`} />
          <FavoriteButton favKey={tripKey(trip.id)} />
        </div>
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          {/* Itinéraire */}
          <Card className="overflow-hidden">
            <div className="bg-aurora px-6 pb-6 pt-5 text-white">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[12.5px] font-bold">
                  <CalendarDays className="h-3.5 w-3.5" /> {longDate(trip.departureTime)}
                </span>
                {!isPastTrip(trip) && trip.status === "OPEN" && (
                  <span suppressHydrationWarning className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[12.5px] font-bold">
                    <Clock className="h-3.5 w-3.5" /> Départ {countdown(trip.departureTime)}
                  </span>
                )}
                {instant && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ffd27a] px-3 py-1 text-[12.5px] font-bold text-[#6b3a00]">
                    <Zap className="h-3.5 w-3.5" /> Réservation instantanée
                  </span>
                )}
              </div>
              <h1 className="mt-3 text-[28px] font-extrabold leading-tight tracking-tight sm:text-[34px]">{title}</h1>
            </div>
            <div className="p-6">
              <div className="flex gap-4">
                <div className="flex w-14 shrink-0 flex-col justify-between text-[17px] font-extrabold tabular-nums text-ink">
                  <span>{time(trip.departureTime)}</span>
                </div>
                <div className="flex flex-col items-center pt-2">
                  <span className="h-3.5 w-3.5 rounded-full border-[3px] border-brand bg-white" />
                  <motion.span
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="my-1.5 w-[3px] flex-1 origin-top rounded bg-gradient-to-b from-brand to-brand-g3/60"
                  />
                  <span className="h-3.5 w-3.5 rounded-full bg-brand" />
                </div>
                <div className="flex flex-1 flex-col gap-7">
                  <div>
                    <p className="text-[18px] font-extrabold text-ink">{trip.departureCity}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-[14px] text-muted">
                      <MapPin className="h-4 w-4 shrink-0" /> {trip.meetingPoint || "Point de rendez-vous à convenir avec le conducteur"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[18px] font-extrabold text-ink">{trip.arrivalCity}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-[14px] text-muted">
                      <Flag className="h-4 w-4 shrink-0" /> {trip.dropoffPoint || "Dépose à convenir avec le conducteur"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Conducteur et véhicule */}
          <Card className="p-6">
            <PersonCard user={trip.driver} role="Votre conducteur" />
            {trip.description && (
              <div className="mt-5 flex gap-3 rounded-[16px] border border-line px-4 py-3.5">
                <MessageSquareQuote className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                <p className="whitespace-pre-line text-[14.5px] leading-relaxed text-ink-soft">{trip.description}</p>
              </div>
            )}
            {trip.vehicle && (
              <div className="mt-5 border-t border-line pt-5">
                <VehicleSummary vehicle={trip.vehicle} />
              </div>
            )}
          </Card>

          {/* Options */}
          {(trip.options ?? []).length > 0 && (
            <Card className="p-6">
              <h2 className="text-[17px] font-extrabold text-ink">À bord</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {(trip.options ?? []).map((o) => (
                  <div key={o} className="flex items-center gap-3 rounded-[14px] bg-surface-alt px-4 py-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-brand shadow-card">
                      <OptionIcon option={o} className="h-4 w-4" />
                    </span>
                    <span className="text-[14.5px] font-semibold text-ink">{tripOptionLabel(o)}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <div className="flex gap-3 rounded-[18px] bg-brand-soft/60 px-5 py-4 text-[14px] text-ink-soft">
            <HandCoins className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
            <p>
              <strong className="text-ink">Paiement au conducteur, le jour du départ</strong> (espèces, Wave ou Orange Money). Taagno ne prend aucune commission.
            </p>
          </div>
        </div>

        {/* Réservation (ordinateur) */}
        <div className="hidden lg:block">
          <div className="sticky top-[88px]">{bookingPanel}</div>
        </div>
      </div>

      {/* Barre de réservation (téléphone) */}
      <div className="sticky bottom-[calc(64px+env(safe-area-inset-bottom))] z-40 -mx-4 mt-6 border-t border-line bg-white/95 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 md:bottom-0 lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-4">
          <div className="flex-1">
            <p className="text-[19px] font-extrabold leading-none text-ink">{fcfa(trip.pricePerSeat)}</p>
            <p className="mt-1 text-[12.5px] text-muted">par place · {plural(trip.availableSeats, "place")} libre{trip.availableSeats > 1 ? "s" : ""}</p>
          </div>
          {mine ? (
            <LinkButton href={`/reservations/trajet/${mine.id}`} variant="soft">
              Ma réservation
            </LinkButton>
          ) : isDriver ? (
            <LinkButton href={`/pro/trajets/${trip.id}`} variant="soft">
              Gérer
            </LinkButton>
          ) : (
            <Button size="lg" disabled={!bookable} onClick={() => setMobileOpen(true)}>
              {bookable ? "Réserver" : trip.status === "FULL" || trip.availableSeats === 0 ? "Complet" : "Indisponible"}
            </Button>
          )}
        </div>
      </div>

      <Modal open={mobileOpen} onOpenChange={setMobileOpen} title="Réserver">
        {bookingPanel}
      </Modal>

      <ConfirmTripBooking trip={trip} seats={seats} open={confirmOpen} onOpenChange={setConfirmOpen} />
    </div>
  );
}

function BookingPanel({
  trip,
  seats,
  setSeats,
  maxSeats,
  total,
  isDriver,
  mine,
  bookable,
  instant,
  onBook,
}: {
  trip: CarpoolTrip;
  seats: number;
  setSeats: (n: number) => void;
  maxSeats: number;
  total: number;
  isDriver: boolean;
  mine?: { id: string; status: keyof typeof BOOKING_STATUS; seats: number };
  bookable: boolean;
  instant: boolean;
  onBook: () => void;
}) {
  return (
    <Card className="p-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[28px] font-extrabold leading-none tracking-tight text-ink">{fcfa(trip.pricePerSeat)}</p>
          <p className="mt-1.5 text-[13.5px] text-muted">par place</p>
        </div>
        <StatusBadge status={trip.status} map={TRIP_STATUS} />
      </div>

      {isDriver ? (
        <div className="mt-6 space-y-3">
          <p className="rounded-[14px] bg-surface-alt px-4 py-3 text-[14px] text-ink-soft">C’est votre trajet. Gérez les demandes et vos passagers depuis votre espace Pro.</p>
          <LinkButton href={`/pro/trajets/${trip.id}`} block size="lg" variant="solid">
            Gérer mon trajet
          </LinkButton>
        </div>
      ) : mine ? (
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between rounded-[14px] bg-surface-alt px-4 py-3">
            <span className="text-[14px] font-semibold text-ink">Votre réservation · {plural(mine.seats, "place")}</span>
            <StatusBadge status={mine.status} map={BOOKING_STATUS} />
          </div>
          <LinkButton href={`/reservations/trajet/${mine.id}`} block size="lg" icon={<Ticket className="h-[18px] w-[18px]" />}>
            Voir ma réservation
          </LinkButton>
        </div>
      ) : bookable ? (
        <div className="mt-6">
          <div className="flex items-center justify-between rounded-[16px] border border-line px-4 py-3">
            <div>
              <p className="text-[14.5px] font-bold text-ink">Places</p>
              <p className="text-[12.5px] text-muted">{plural(trip.availableSeats, "place")} libre{trip.availableSeats > 1 ? "s" : ""}</p>
            </div>
            <Counter value={seats} onChange={setSeats} min={1} max={maxSeats} />
          </div>
          <div className="mt-2 flex justify-center gap-1.5 py-2" aria-hidden>
            {Array.from({ length: Math.min(trip.availableSeats, 8) }).map((_, i) => (
              <motion.span key={i} animate={{ scale: i < seats ? 1 : 0.85 }} className={i < seats ? "text-brand" : "text-line"}>
                <Armchair className="h-6 w-6" fill={i < seats ? "currentColor" : "none"} />
              </motion.span>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-dashed border-line pt-4">
            <span className="text-[14.5px] font-semibold text-ink-soft">Total à régler au conducteur</span>
            <motion.span key={total} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-[20px] font-extrabold text-ink">
              {fcfa(total)}
            </motion.span>
          </div>
          <Button block size="xl" className="mt-5" onClick={onBook} icon={instant ? <Zap className="h-5 w-5" /> : undefined}>
            {instant ? `Réserver ${plural(seats, "place")}` : `Demander ${plural(seats, "place")}`}
          </Button>
          <p className="mt-3 flex items-start gap-2 text-[12.5px] leading-snug text-muted">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {instant
              ? "Votre place est confirmée tout de suite. Le numéro du conducteur s’affiche aussitôt."
              : "Le conducteur accepte votre demande, souvent en quelques minutes. Vous êtes prévenu ici et par notification."}
          </p>
        </div>
      ) : (
        <div className="mt-6 rounded-[14px] bg-surface-alt px-4 py-4 text-center text-[14px] font-semibold text-ink-soft">
          {isPastTrip(trip) ? "Ce trajet est déjà parti." : trip.status === "CANCELLED" ? "Ce trajet a été annulé." : "Ce trajet est complet."}
          <LinkButton href={`/covoiturage?from=${encodeURIComponent(trip.departureCity)}&to=${encodeURIComponent(trip.arrivalCity)}`} variant="soft" block className="mt-3">
            Voir d’autres trajets
          </LinkButton>
        </div>
      )}
      {!isDriver && !mine && bookable && (
        <div className="mt-4 flex items-center gap-2">
          <Badge tone="muted">Aucun frais de réservation</Badge>
        </div>
      )}
    </Card>
  );
}

function ConfirmTripBooking({ trip, seats, open, onOpenChange }: { trip: CarpoolTrip; seats: number; open: boolean; onOpenChange: (v: boolean) => void }) {
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const instant = isInstant(trip);

  const confirm = async () => {
    setBusy(true);
    try {
      await api.post(`/carpool/trips/${trip.id}/reservations`, { seatsReserved: seats });
      setDone(true);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["trip", trip.id] }),
        queryClient.invalidateQueries({ queryKey: ["reservations"] }),
      ]);
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const close = (v: boolean) => {
    onOpenChange(v);
    if (!v) setTimeout(() => setDone(false), 300);
  };

  return (
    <Modal open={open} onOpenChange={close} title={done ? "C’est envoyé !" : "Confirmer la réservation"} hideHeader={done} size="sm">
      {done ? (
        <div className="py-4 text-center">
          <SuccessCheck tone={instant ? "brand" : "warning"} />
          <h3 className="mt-5 text-[22px] font-extrabold tracking-tight text-ink">{instant ? "Place réservée !" : "Demande envoyée !"}</h3>
          <p className="mx-auto mt-2 max-w-xs text-[14.5px] leading-relaxed text-muted">
            {instant
              ? "Votre place est confirmée. Retrouvez le numéro du conducteur dans votre réservation."
              : "Le conducteur va répondre rapidement. Vous serez prévenu dès qu’il accepte."}
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <LinkButton href="/reservations" size="lg" block>
              Voir mes réservations
            </LinkButton>
            <Button variant="ghost" onClick={() => close(false)}>
              Fermer
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <div className="rounded-[18px] bg-surface-alt p-4">
            <p className="text-[17px] font-extrabold text-ink">
              {trip.departureCity} → {trip.arrivalCity}
            </p>
            <p className="mt-1 text-[14px] text-muted">
              {longDate(trip.departureTime)} à {time(trip.departureTime)}
            </p>
            {trip.meetingPoint && (
              <p className="mt-2 flex items-center gap-1.5 text-[13.5px] font-semibold text-ink-soft">
                <MapPin className="h-4 w-4 text-brand" /> {trip.meetingPoint}
              </p>
            )}
          </div>
          <div className="mt-4 space-y-2 text-[14.5px]">
            <div className="flex justify-between">
              <span className="text-muted">Places</span>
              <span className="font-bold text-ink">{seats}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Prix par place</span>
              <span className="font-bold text-ink">{fcfa(trip.pricePerSeat)}</span>
            </div>
            <div className="flex justify-between border-t border-line pt-2 text-[16px]">
              <span className="font-bold text-ink">À régler au conducteur</span>
              <span className="font-extrabold text-ink">{fcfa(trip.pricePerSeat * seats)}</span>
            </div>
          </div>
          <Button block size="xl" className="mt-6" loading={busy} onClick={confirm}>
            {instant ? "Confirmer ma place" : "Envoyer ma demande"}
          </Button>
          <p className="mt-3 text-center text-[12.5px] text-muted">Vous pourrez annuler gratuitement depuis vos réservations.</p>
        </div>
      )}
    </Modal>
  );
}

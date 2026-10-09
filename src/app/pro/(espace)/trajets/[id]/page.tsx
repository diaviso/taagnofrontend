"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Ban, CalendarDays, Eye, Flag, MapPin, Pencil, PartyPopper, Users, Zap } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { TripRequestCard } from "@/components/pro/request-cards";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, EmptyState } from "@/components/ui/misc";
import { ConfirmModal } from "@/components/ui/modal";
import { ShareButton } from "@/components/ui/share-button";
import { PageSpinner } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import { fcfa, longDate, plural, time } from "@/lib/format";
import { isEditable, isLive, needsClosing, seatsOffered } from "@/lib/pro";
import { useAction, useMyTrips } from "@/lib/queries";
import { TRIP_STATUS, confirmedSeats, isInstant, tripOptionLabel } from "@/lib/types";


function ManageTrip() {
  const { id } = useParams<{ id: string }>();
  const params = useSearchParams();
  const { data, isPending } = useMyTrips();
  const { run, busy } = useAction();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const trip = data?.find((t) => t.id === id);

  if (isPending) return <PageSpinner />;
  if (!trip) return <EmptyState icon={<Users />} title="Trajet introuvable" action={<LinkButton href="/pro/trajets">Mes trajets</LinkButton>} />;

  const reservations = trip.reservations ?? [];
  const pending = reservations.filter((r) => r.status === "PENDING");
  const confirmed = reservations.filter((r) => r.status === "CONFIRMED" || r.status === "COMPLETED");
  const others = reservations.filter((r) => r.status === "REJECTED" || r.status === "CANCELLED");
  const booked = confirmedSeats(trip);
  const offered = seatsOffered(trip);
  const justPublished = params.get("publie") === "1";
  const title = `${trip.departureCity} → ${trip.arrivalCity}`;

  return (
    <div>
      <Link href="/pro/trajets" className="mb-3 inline-flex items-center gap-1.5 text-[14px] font-bold text-ink-soft hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Mes trajets
      </Link>

      {justPublished && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-5 flex items-center gap-4 rounded-[20px] bg-success/10 p-4">
          <PartyPopper className="h-7 w-7 shrink-0 text-success" />
          <div className="flex-1">
            <p className="text-[15px] font-extrabold text-ink">Votre trajet est en ligne !</p>
            <p className="text-[13.5px] text-ink-soft">Partagez-le sur WhatsApp pour le remplir plus vite.</p>
          </div>
          <ShareButton title={title} text={`Je propose ${title}, ${longDate(trip.departureTime).toLowerCase()} à ${time(trip.departureTime)} — ${fcfa(trip.pricePerSeat)} la place. Réservez sur Taagno :`} />
        </motion.div>
      )}

      <Card className="overflow-hidden">
        <div className="bg-aurora px-6 py-5 text-white">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[12.5px] font-bold">
              <CalendarDays className="h-3.5 w-3.5" /> {longDate(trip.departureTime)} à {time(trip.departureTime)}
            </span>
            {isInstant(trip) && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[12.5px] font-bold">
                <Zap className="h-3.5 w-3.5" /> Instantané
              </span>
            )}
          </div>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
            <h1 className="text-[26px] font-extrabold tracking-tight sm:text-[30px]">{title}</h1>
            <span className="rounded-full bg-white px-3 py-1">
              <StatusBadge status={trip.status} map={TRIP_STATUS} />
            </span>
          </div>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-3 sm:p-6">
          <div>
            <p className="text-[12.5px] font-semibold text-muted">Places réservées</p>
            <p className="text-[22px] font-extrabold text-ink">
              {booked} <span className="text-[15px] text-muted">/ {offered}</span>
            </p>
          </div>
          <div>
            <p className="text-[12.5px] font-semibold text-muted">Prix par place</p>
            <p className="text-[22px] font-extrabold text-ink">{fcfa(trip.pricePerSeat)}</p>
          </div>
          <div>
            <p className="text-[12.5px] font-semibold text-muted">Gains estimés</p>
            <p className="text-[22px] font-extrabold text-ink">{fcfa(booked * trip.pricePerSeat)}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 border-t border-line px-5 py-4 sm:px-6">
          {trip.meetingPoint && (
            <Badge tone="muted" icon={<MapPin />}>
              {trip.meetingPoint}
            </Badge>
          )}
          {trip.dropoffPoint && (
            <Badge tone="muted" icon={<Flag />}>
              {trip.dropoffPoint}
            </Badge>
          )}
          {(trip.options ?? []).filter((o) => o !== "INSTANT_BOOKING").map((o) => (
            <Badge key={o} tone="brand">
              {tripOptionLabel(o)}
            </Badge>
          ))}
        </div>
      </Card>

      <div className="mt-4 flex flex-wrap gap-2">
        {isEditable(trip) && (
          <LinkButton href={`/pro/trajets/${trip.id}/modifier`} variant="outline" icon={<Pencil className="h-4 w-4" />}>
            Modifier
          </LinkButton>
        )}
        <LinkButton href={`/covoiturage/${trip.id}`} variant="outline" icon={<Eye className="h-4 w-4" />}>
          Voir comme un voyageur
        </LinkButton>
        {needsClosing(trip) && (
          <Button variant="solid" icon={<Flag className="h-4 w-4" />} onClick={() => setCompleteOpen(true)}>
            Marquer comme terminé
          </Button>
        )}
        {isLive(trip) && !needsClosing(trip) && (
          <Button variant="danger" icon={<Ban className="h-4 w-4" />} onClick={() => setCancelOpen(true)}>
            Annuler le trajet
          </Button>
        )}
      </div>

      <div className="mt-8 space-y-8">
        {pending.length > 0 && (
          <section>
            <h2 className="mb-3 text-[13px] font-extrabold uppercase tracking-wider text-brand">Demandes en attente · {pending.length}</h2>
            <div className="grid gap-4 lg:grid-cols-2">
              {pending.map((r, i) => (
                <TripRequestCard key={r.id} request={{ trip, reservation: r }} showTrip={false} index={i} />
              ))}
            </div>
          </section>
        )}
        <section>
          <h2 className="mb-3 text-[13px] font-extrabold uppercase tracking-wider text-muted">Passagers · {plural(booked, "place")}</h2>
          {confirmed.length ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {confirmed.map((r, i) => (
                <TripRequestCard key={r.id} request={{ trip, reservation: r }} showTrip={false} index={i} />
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center text-[14px] text-muted">Pas encore de passager confirmé. Partagez votre trajet pour le remplir.</Card>
          )}
        </section>
        {others.length > 0 && (
          <section>
            <h2 className="mb-3 text-[13px] font-extrabold uppercase tracking-wider text-muted">Refusées ou annulées</h2>
            <div className="grid gap-4 opacity-80 lg:grid-cols-2">
              {others.map((r, i) => (
                <TripRequestCard key={r.id} request={{ trip, reservation: r }} showTrip={false} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>

      <ConfirmModal
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Annuler ce trajet ?"
        message={confirmed.length ? `${plural(confirmed.length, "passager")} confirmé${confirmed.length > 1 ? "s" : ""} ser${confirmed.length > 1 ? "ont" : "a"} prévenu${confirmed.length > 1 ? "s" : ""}. Pensez à les appeler.` : "Le trajet ne sera plus visible par les voyageurs."}
        confirmLabel="Annuler le trajet"
        danger
        loading={busy === "cancel"}
        onConfirm={async () => {
          await run("cancel", () => api.patch(`/carpool/trips/${trip.id}/cancel`), { success: "Trajet annulé.", invalidate: [["trips"], ["trip", trip.id]] });
          setCancelOpen(false);
        }}
      />
      <ConfirmModal
        open={completeOpen}
        onOpenChange={setCompleteOpen}
        title="Trajet terminé ?"
        message="Vos passagers pourront vous noter, et vous pourrez les noter aussi."
        confirmLabel="Oui, terminé"
        loading={busy === "complete"}
        onConfirm={async () => {
          await run("complete", () => api.patch(`/carpool/trips/${trip.id}/complete`), { success: "Trajet terminé. Merci !", invalidate: [["trips"], ["trip", trip.id]] });
          setCompleteOpen(false);
        }}
      />
    </div>
  );
}

export default function ManageTripPage() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <ManageTrip />
    </Suspense>
  );
}

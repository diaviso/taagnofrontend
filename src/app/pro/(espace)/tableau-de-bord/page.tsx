"use client";

import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight, CalendarClock, CarFront, CheckCircle2, ClipboardCheck, Inbox, KeyRound, Route, Users } from "lucide-react";
import Link from "next/link";
import { RentalRequestCard, TripRequestCard } from "@/components/pro/request-cards";
import { EarningsChart, Kpi } from "@/components/pro/widgets";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { Card, Skeleton } from "@/components/ui/misc";
import { useAuth } from "@/lib/auth";
import { countdown, day, fcfa, parseDay, plural, range, time } from "@/lib/format";
import { canCarpool, canRent, currentRentals, groupRentalRequests, groupTripRequests, isUpcoming, monthlyEarnings, needsClosing } from "@/lib/pro";
import { useMyOffers, useMyTrips, useMyVehicles } from "@/lib/queries";
import { confirmedSeats, vehicleTitle, type Vehicle } from "@/lib/types";
import { cn } from "@/lib/utils";

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Bonjour" : h < 18 ? "Bon après-midi" : "Bonsoir";
}

export default function DashboardPage() {
  const { user } = useAuth();
  const vehicles = useMyVehicles();
  const trips = useMyTrips();
  const offers = useMyOffers();

  if (vehicles.isPending || trips.isPending || offers.isPending) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-36 rounded-[22px]" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-[22px]" />
      </div>
    );
  }

  const v = vehicles.data ?? [];
  const t = trips.data ?? [];
  const o = offers.data ?? [];
  const upcoming = t.filter(isUpcoming).sort((a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime());
  const toClose = t.filter(needsClosing);
  const tripReq = groupTripRequests(t.filter((x) => x.status !== "CANCELLED"));
  const rentReq = groupRentalRequests(o);
  const pending = tripReq.pending.length + rentReq.pending.length;
  const rentals = currentRentals(o);
  const months = monthlyEarnings(t, o);
  const thisMonth = months[months.length - 1];
  const rejected = v.filter((x) => x.status === "REJECTED");
  const ready = v.some((x) => x.status === "APPROVED");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-[26px] font-extrabold tracking-tight text-ink sm:text-[30px]">
            {greeting()} {user?.firstName ?? ""} 👋
          </motion.h1>
          <p className="text-[14.5px] text-muted">{pending ? `Vous avez ${plural(pending, "demande")} à traiter.` : "Voici votre activité en un coup d’œil."}</p>
        </div>
      </div>

      {!ready && <Welcome vehicles={v} />}

      {rejected.map((x) => (
        <Link key={x.id} href={`/pro/vehicules/${x.id}`} className="flex items-center gap-4 rounded-[20px] border border-danger/25 bg-danger/5 p-4 transition hover:bg-danger/10">
          <AlertTriangle className="h-6 w-6 shrink-0 text-danger" />
          <div className="flex-1">
            <p className="text-[14.5px] font-extrabold text-ink">Véhicule refusé : {vehicleTitle(x)}</p>
            <p className="text-[13px] text-ink-soft">{x.adminComment || "Corrigez les informations ou les documents puis renvoyez-le en vérification."}</p>
          </div>
          <ArrowRight className="h-5 w-5 text-danger" />
        </Link>
      ))}

      {toClose.length > 0 && (
        <Link href={`/pro/trajets/${toClose[0].id}`} className="flex items-center gap-4 rounded-[20px] border border-warning/30 bg-warning/8 p-4 transition hover:bg-warning/12">
          <ClipboardCheck className="h-6 w-6 shrink-0 text-[#b46b05]" />
          <div className="flex-1">
            <p className="text-[14.5px] font-extrabold text-ink">{plural(toClose.length, "trajet")} à clôturer</p>
            <p className="text-[13px] text-ink-soft">Marquez vos trajets passés comme terminés : vos passagers pourront vous noter.</p>
          </div>
          <ArrowRight className="h-5 w-5 text-[#b46b05]" />
        </Link>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi index={0} icon={<Inbox />} tone={pending ? "danger" : "brand"} highlight={pending > 0} label="Demandes en attente" value={pending} />
        <Kpi index={1} icon={<Route />} tone="carpool" label="Prochains départs" value={upcoming.length} />
        <Kpi index={2} icon={<Users />} tone="carpool" label="Places réservées" value={upcoming.reduce((s, x) => s + confirmedSeats(x), 0)} hint="sur vos trajets à venir" />
        <Kpi index={3} icon={<KeyRound />} tone="rental" label="Gains estimés ce mois" value={fcfa(thisMonth.carpool + thisMonth.rental)} />
      </div>

      {pending > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[18px] font-extrabold text-ink">À traiter</h2>
            <Link href="/pro/demandes" className="text-[13.5px] font-bold text-brand hover:underline">
              Toutes les demandes →
            </Link>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {tripReq.pending.slice(0, 4).map((r, i) => (
              <TripRequestCard key={r.reservation.id} request={r} index={i} />
            ))}
            {rentReq.pending.slice(0, 4).map((r, i) => (
              <RentalRequestCard key={r.booking.id} request={r} index={i} />
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Card className="p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[17px] font-extrabold text-ink">Prochains départs</h2>
            <Link href="/pro/trajets" className="text-[13px] font-bold text-brand hover:underline">
              Mes trajets →
            </Link>
          </div>
          {upcoming.length ? (
            <ul className="space-y-2">
              {upcoming.slice(0, 5).map((x) => (
                <li key={x.id}>
                  <Link href={`/pro/trajets/${x.id}`} className="flex items-center gap-4 rounded-[16px] p-3 transition hover:bg-surface-alt">
                    <div className="w-16 shrink-0 text-center">
                      <p className="text-[12px] font-bold uppercase text-brand">{day(x.departureTime)}</p>
                      <p className="text-[16px] font-extrabold text-ink">{time(x.departureTime)}</p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-extrabold text-ink">
                        {x.departureCity} → {x.arrivalCity}
                      </p>
                      <p className="text-[12.5px] text-muted">
                        {confirmedSeats(x)} réservée{confirmedSeats(x) > 1 ? "s" : ""} · {plural(x.availableSeats, "place")} libre{x.availableSeats > 1 ? "s" : ""} · {countdown(x.departureTime)}
                      </p>
                    </div>
                    {(x.reservations ?? []).some((r) => r.status === "PENDING") && <Badge tone="danger">Demande</Badge>}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-[16px] bg-surface-alt p-6 text-center">
              <CalendarClock className="mx-auto h-8 w-8 text-faint" />
              <p className="mt-2 text-[14.5px] font-bold text-ink">Aucun départ prévu</p>
              <p className="text-[13px] text-muted">Publiez un trajet pour remplir vos places libres.</p>
              {v.some(canCarpool) && (
                <LinkButton href="/pro/trajets/nouveau" size="sm" className="mt-4">
                  Proposer un trajet
                </LinkButton>
              )}
            </div>
          )}
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[17px] font-extrabold text-ink">Locations en cours</h2>
            <Link href="/pro/locations" className="text-[13px] font-bold text-brand hover:underline">
              Mes locations →
            </Link>
          </div>
          {rentals.length ? (
            <ul className="space-y-2">
              {rentals.slice(0, 5).map(({ offer, booking }) => (
                <li key={booking.id}>
                  <Link href={`/pro/locations/${offer.id}`} className="flex items-center gap-3 rounded-[16px] p-3 transition hover:bg-surface-alt">
                    <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-rental/10 text-rental">
                      <KeyRound className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14.5px] font-extrabold text-ink">{vehicleTitle(offer.vehicle)}</p>
                      <p className="text-[12.5px] text-muted">{range(parseDay(booking.startDate), parseDay(booking.endDate))}</p>
                    </div>
                    <span className="text-[13.5px] font-extrabold text-ink">{fcfa(booking.totalPrice)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-[16px] bg-surface-alt p-6 text-center">
              <KeyRound className="mx-auto h-8 w-8 text-faint" />
              <p className="mt-2 text-[14.5px] font-bold text-ink">Aucune location en cours</p>
              <p className="text-[13px] text-muted">{o.length ? "Les locations confirmées apparaîtront ici." : "Mettez un véhicule en location quand vous ne l’utilisez pas."}</p>
              {!o.length && v.some(canRent) && (
                <LinkButton href="/pro/locations/nouvelle" size="sm" className="mt-4">
                  Louer un véhicule
                </LinkButton>
              )}
            </div>
          )}
        </Card>
      </div>

      <Card className="p-5 sm:p-6">
        <EarningsChart months={months} />
      </Card>
    </div>
  );
}

/** Premiers pas : véhicule → vérification → publication. */
function Welcome({ vehicles }: { vehicles: Vehicle[] }) {
  const hasVehicle = vehicles.length > 0;
  const hasDocs = vehicles.some((v) => (v.documents ?? []).length > 0);
  const steps = [
    { done: hasVehicle, title: "Ajoutez votre véhicule", text: "Marque, modèle, places et quelques photos.", href: hasVehicle ? `/pro/vehicules/${vehicles[0].id}` : "/pro/vehicules/nouveau", cta: "Ajouter" },
    { done: hasDocs, title: "Envoyez vos documents", text: "Carte grise, assurance et visite technique.", href: hasVehicle ? `/pro/vehicules/${vehicles[0].id}` : "/pro/vehicules/nouveau", cta: "Envoyer" },
    { done: false, title: "Validation par Taagno", text: "Nous vérifions et vous prévenons. Vous pourrez alors publier.", href: null, cta: null },
  ];
  const current = steps.findIndex((s) => !s.done);
  return (
    <div className="relative overflow-hidden rounded-[28px] bg-aurora p-6 text-white sm:p-8">
      <div className="dot-grid absolute inset-0 opacity-50" />
      <div className="relative">
        <p className="text-[13px] font-bold uppercase tracking-wider text-white/80">Bienvenue sur Taagno Pro</p>
        <h2 className="mt-1 text-[24px] font-extrabold tracking-tight">Encore quelques étapes avant votre première publication</h2>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.title} className={cn("rounded-[20px] p-4", i === current ? "bg-white text-ink shadow-lift" : "bg-white/12")}>
              <div className="flex items-center gap-2">
                {s.done ? (
                  <CheckCircle2 className="h-6 w-6 text-[#b7f5c6]" />
                ) : (
                  <span className={cn("flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-extrabold", i === current ? "bg-brand text-white" : "bg-white/25")}>{i + 1}</span>
                )}
                <p className={cn("text-[15px] font-extrabold", s.done && "line-through opacity-70")}>{s.title}</p>
              </div>
              <p className={cn("mt-1.5 text-[13px]", i === current ? "text-muted" : "text-white/80")}>{s.text}</p>
              {i === current && s.href && (
                <LinkButton href={s.href} size="sm" className="mt-3" iconRight={<ArrowRight className="h-4 w-4" />}>
                  {s.cta}
                </LinkButton>
              )}
            </div>
          ))}
        </div>
        {hasVehicle && current === 2 && <CarFront className="absolute -bottom-2 -right-2 h-24 w-24 text-white/10" />}
      </div>
    </div>
  );
}

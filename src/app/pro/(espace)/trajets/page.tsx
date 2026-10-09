"use client";

import { motion } from "framer-motion";
import { ChevronRight, Plus, Route, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ProPageHeader } from "@/components/pro/widgets";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { EmptyState, Segmented, Skeleton } from "@/components/ui/misc";
import { day, fcfa, time } from "@/lib/format";
import { isUpcoming, needsClosing, seatsOffered } from "@/lib/pro";
import { useMyTrips } from "@/lib/queries";
import { TRIP_STATUS, confirmedSeats, isInstant, pendingCount, type CarpoolTrip } from "@/lib/types";

type Tab = "upcoming" | "close" | "past";

export default function TripsPage() {
  const { data, isPending } = useMyTrips();
  const all = data ?? [];
  const upcoming = all.filter(isUpcoming).sort((a, b) => +new Date(a.departureTime) - +new Date(b.departureTime));
  const toClose = all.filter(needsClosing);
  const past = all.filter((t) => !isUpcoming(t) && !needsClosing(t)).sort((a, b) => +new Date(b.departureTime) - +new Date(a.departureTime));
  const [tab, setTab] = useState<Tab | null>(null);
  const current: Tab = tab ?? (upcoming.length || !toClose.length ? "upcoming" : "close");
  const list = current === "upcoming" ? upcoming : current === "close" ? toClose : past;

  return (
    <div>
      <ProPageHeader
        title="Mes trajets"
        subtitle="Vos départs, vos passagers et vos demandes."
        actions={
          <LinkButton href="/pro/trajets/nouveau" icon={<Plus className="h-4.5 w-4.5" />}>
            Proposer un trajet
          </LinkButton>
        }
      />
      <Segmented
        layoutId="pro-trips"
        className="w-full sm:w-auto"
        value={current}
        onChange={setTab}
        options={[
          { value: "upcoming", label: "À venir", count: upcoming.length },
          { value: "close", label: "À clôturer", count: toClose.length },
          { value: "past", label: "Passés" },
        ]}
      />
      <div className="mt-6">
        {isPending ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-28 rounded-[22px]" />
            ))}
          </div>
        ) : !list.length ? (
          <div className="rounded-[24px] border border-dashed border-line bg-white">
            <EmptyState
              icon={<Route />}
              title={current === "upcoming" ? "Aucun trajet à venir" : current === "close" ? "Rien à clôturer" : "Pas encore d’historique"}
              text={current === "upcoming" ? "Proposez votre prochain trajet : il sera visible immédiatement par les voyageurs." : undefined}
              action={current === "upcoming" ? <LinkButton href="/pro/trajets/nouveau">Proposer un trajet</LinkButton> : undefined}
            />
          </div>
        ) : (
          <div className="space-y-3">
            {list.map((t, i) => (
              <TripRow key={t.id} trip={t} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TripRow({ trip, index }: { trip: CarpoolTrip; index: number }) {
  const offered = seatsOffered(trip);
  const booked = confirmedSeats(trip);
  const pct = offered ? (booked / offered) * 100 : 0;
  const pending = pendingCount(trip.reservations);
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index, 8) * 0.04 }}>
      <Link href={`/pro/trajets/${trip.id}`} className="group flex items-center gap-4 rounded-[22px] border border-line/70 bg-white p-4 shadow-card transition hover:shadow-lift sm:p-5">
        <div className="w-[72px] shrink-0 rounded-[16px] bg-brand-soft py-2.5 text-center">
          <p className="text-[11.5px] font-bold uppercase text-brand">{day(trip.departureTime)}</p>
          <p className="text-[18px] font-extrabold text-ink">{time(trip.departureTime)}</p>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-[16px] font-extrabold text-ink">
              {trip.departureCity} → {trip.arrivalCity}
            </p>
            {isInstant(trip) && <Zap className="h-4 w-4 text-warning" />}
          </div>
          <div className="mt-2 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-alt sm:max-w-[220px]">
              <motion.div className="h-full rounded-full bg-brand-gradient" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, delay: 0.1 }} />
            </div>
            <span className="text-[12.5px] font-semibold text-muted">
              {booked}/{offered} places · {fcfa(trip.pricePerSeat)}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          {pending > 0 ? <Badge tone="danger">{pending} demande{pending > 1 ? "s" : ""}</Badge> : <StatusBadge status={trip.status} map={TRIP_STATUS} />}
        </div>
        <ChevronRight className="hidden h-5 w-5 text-faint transition group-hover:translate-x-0.5 sm:block" />
      </Link>
    </motion.div>
  );
}

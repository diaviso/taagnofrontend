"use client";

import { Inbox, KeyRound, Route } from "lucide-react";
import { useState, type ReactNode } from "react";
import { RentalRequestCard, TripRequestCard } from "@/components/pro/request-cards";
import { ProPageHeader } from "@/components/pro/widgets";
import { EmptyState, Segmented, Skeleton } from "@/components/ui/misc";
import { groupRentalRequests, groupTripRequests } from "@/lib/pro";
import { useMyOffers, useMyTrips } from "@/lib/queries";

export default function RequestsPage() {
  const trips = useMyTrips();
  const offers = useMyOffers();
  const tripReq = groupTripRequests((trips.data ?? []).filter((t) => t.status !== "CANCELLED"));
  const rentReq = groupRentalRequests(offers.data ?? []);
  const [tab, setTab] = useState<"carpool" | "rental">(() => "carpool");
  const [chosen, setChosen] = useState(false);
  // Sans choix explicite, on ouvre l'onglet qui a des demandes en attente.
  const effective = !chosen && !tripReq.pending.length && rentReq.pending.length ? "rental" : tab;

  const loading = effective === "carpool" ? trips.isPending : offers.isPending;
  const groups = effective === "carpool" ? tripReq : rentReq;
  const empty = !groups.pending.length && !groups.confirmed.length && !groups.history.length;

  return (
    <div>
      <ProPageHeader title="Demandes" subtitle="Acceptez ou refusez les demandes, puis contactez vos passagers et locataires." />
      <Segmented
        layoutId="pro-requests"
        className="w-full sm:w-auto"
        value={effective}
        onChange={(v) => {
          setChosen(true);
          setTab(v);
        }}
        options={[
          { value: "carpool", label: "Covoiturage", count: tripReq.pending.length },
          { value: "rental", label: "Location", count: rentReq.pending.length },
        ]}
      />
      <div className="mt-6">
        {loading ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-44 rounded-[22px]" />
            ))}
          </div>
        ) : empty ? (
          <div className="rounded-[24px] border border-dashed border-line bg-white">
            <EmptyState
              icon={effective === "carpool" ? <Route /> : <KeyRound />}
              title="Aucune demande pour le moment"
              text={effective === "carpool" ? "Les demandes de places sur vos trajets arriveront ici. Vous serez prévenu par notification." : "Les demandes de location de vos véhicules arriveront ici."}
            />
          </div>
        ) : (
          <div className="space-y-8">
            <Group title="En attente de votre réponse" count={groups.pending.length} accent>
              {effective === "carpool"
                ? tripReq.pending.map((r, i) => <TripRequestCard key={r.reservation.id} request={r} index={i} />)
                : rentReq.pending.map((r, i) => <RentalRequestCard key={r.booking.id} request={r} index={i} />)}
            </Group>
            <Group title="Confirmées" count={groups.confirmed.length}>
              {effective === "carpool"
                ? tripReq.confirmed.map((r, i) => <TripRequestCard key={r.reservation.id} request={r} index={i} />)
                : rentReq.confirmed.map((r, i) => <RentalRequestCard key={r.booking.id} request={r} index={i} />)}
            </Group>
            <Group title="Historique" count={groups.history.length}>
              {effective === "carpool"
                ? tripReq.history.slice(0, 20).map((r, i) => <TripRequestCard key={r.reservation.id} request={r} index={i} />)
                : rentReq.history.slice(0, 20).map((r, i) => <RentalRequestCard key={r.booking.id} request={r} index={i} />)}
            </Group>
          </div>
        )}
      </div>
    </div>
  );
}

function Group({ title, count, accent, children }: { title: string; count: number; accent?: boolean; children: ReactNode }) {
  if (!count) return null;
  return (
    <section>
      <h2 className={`mb-3 flex items-center gap-2 text-[13px] font-extrabold uppercase tracking-wider ${accent ? "text-brand" : "text-muted"}`}>
        {accent && <Inbox className="h-4 w-4" />} {title} <span className="rounded-full bg-surface-alt px-2 text-[11.5px] text-ink-soft">{count}</span>
      </h2>
      <div className="grid gap-4 lg:grid-cols-2">{children}</div>
    </section>
  );
}

"use client";

import { ArrowRight, CarFront, Hourglass, KeyRound, Route, Ticket, Users } from "lucide-react";
import Link from "next/link";
import { Kpi, ProPageHeader } from "@/components/pro/widgets";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/badge";
import { Card, Skeleton } from "@/components/ui/misc";
import { useAdminStats } from "@/lib/admin";
import { relative } from "@/lib/format";
import { VEHICLE_STATUS, contactLabel, fullName, vehicleTitle } from "@/lib/types";

export default function AdminHome() {
  const { data, isPending } = useAdminStats();
  if (isPending || !data) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-36 rounded-[22px]" />
        ))}
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <ProPageHeader title="Vue d’ensemble" subtitle="L’activité de Taagno en un coup d’œil." />

      {data.vehicles.pending > 0 && (
        <Link href="/admin/vehicules" className="flex items-center gap-4 rounded-[20px] border border-warning/30 bg-warning/8 p-4 transition hover:bg-warning/12">
          <Hourglass className="h-6 w-6 text-[#b46b05]" />
          <p className="flex-1 text-[15px] font-extrabold text-ink">
            {data.vehicles.pending} véhicule{data.vehicles.pending > 1 ? "s" : ""} attend{data.vehicles.pending > 1 ? "ent" : ""} votre vérification
          </p>
          <ArrowRight className="h-5 w-5 text-[#b46b05]" />
        </Link>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi index={0} icon={<Users />} label="Utilisateurs" value={data.users.total} />
        <Kpi index={1} icon={<CarFront />} label="Véhicules" value={data.vehicles.total} hint={`${data.vehicles.approved} approuvés · ${data.vehicles.rejected} refusés`} />
        <Kpi index={2} icon={<Route />} tone="carpool" label="Trajets" value={data.carpool.totalTrips} hint={`${data.carpool.openTrips} ouverts · ${data.carpool.completedTrips} terminés`} />
        <Kpi index={3} icon={<KeyRound />} tone="rental" label="Offres de location" value={data.rental.totalOffers} hint={`${data.rental.activeOffers} actives`} />
        <Kpi index={4} icon={<Ticket />} tone="carpool" label="Réservations de places" value={data.carpool.totalReservations} />
        <Kpi index={5} icon={<Ticket />} tone="rental" label="Demandes de location" value={data.rental.totalBookings} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5 sm:p-6">
          <h2 className="mb-4 text-[17px] font-extrabold text-ink">Derniers véhicules</h2>
          <ul className="space-y-1">
            {data.recentVehicles.map((v) => (
              <li key={v.id}>
                <Link href={`/admin/vehicules/${v.id}`} className="flex items-center gap-3 rounded-[14px] p-2.5 transition hover:bg-surface-alt">
                  <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-brand-soft text-brand">
                    <CarFront className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14.5px] font-bold text-ink">{vehicleTitle(v)}</p>
                    <p className="text-[12.5px] text-muted">
                      {fullName(v.owner)} · {v.createdAt ? relative(v.createdAt) : ""}
                    </p>
                  </div>
                  <StatusBadge status={v.status} map={VEHICLE_STATUS} />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-5 sm:p-6">
          <h2 className="mb-4 text-[17px] font-extrabold text-ink">Derniers inscrits</h2>
          <ul className="space-y-1">
            {data.recentUsers.map((u) => (
              <li key={u.id}>
                <Link href={`/admin/utilisateurs/${u.id}`} className="flex items-center gap-3 rounded-[14px] p-2.5 transition hover:bg-surface-alt">
                  <Avatar user={u} size={40} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14.5px] font-bold text-ink">{fullName(u)}</p>
                    <p className="truncate text-[12.5px] text-muted">{contactLabel(u)}</p>
                  </div>
                  <span className="text-[12px] text-faint">{u.createdAt ? relative(u.createdAt) : ""}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

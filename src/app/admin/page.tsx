"use client";

import {
  ArrowRight,
  BadgeCheck,
  CarFront,
  Flag,
  Hourglass,
  KeyRound,
  MapPin,
  Route,
  ShieldCheck,
  Smartphone,
  Star,
  Ticket,
  UserPlus,
  Users,
  UserX,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { ExportMenu } from "@/components/admin/export-button";
import { TrendChart } from "@/components/admin/trend-chart";
import { Kpi, ProPageHeader } from "@/components/pro/widgets";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { Avatar } from "@/components/ui/avatar";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Card, Skeleton } from "@/components/ui/misc";
import { useAdminOverview, useAdminReports, useAdminStats, useAdminVehicles } from "@/lib/admin";
import { number, plural, rating as fmtRating, relative } from "@/lib/format";
import { VEHICLE_STATUS, contactLabel, fullName, reportReasonLabel, vehicleTitle } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function AdminHome() {
  const stats = useAdminStats();
  const overview = useAdminOverview();
  const pendingVehicles = useAdminVehicles("PENDING");
  const openReports = useAdminReports({ status: "OPEN", take: 3 });
  const data = stats.data;
  const o = overview.data;

  return (
    <div className="space-y-6">
      <ProPageHeader title="Tableau de bord" subtitle="L’activité de Taagno en un coup d’œil." actions={<ExportMenu />} />

      <ToDo
        loading={!data || pendingVehicles.isPending || openReports.isPending}
        vehicles={data?.vehicles.pending ?? 0}
        reports={openReports.data?.total ?? o?.reports.open ?? 0}
        vehicleItems={(pendingVehicles.data ?? []).slice(0, 3).map((v) => ({ id: v.id, title: vehicleTitle(v), sub: `${fullName(v.owner)} · ${v.licensePlate ?? "sans plaque"}` }))}
        reportItems={(openReports.data?.items ?? []).map((r) => ({ id: r.id, title: r.reasonLabel ?? reportReasonLabel(r.reason), sub: `${r.targetLabel ?? ""} · ${relative(r.createdAt)}` }))}
      />

      {!o || !data ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-[22px]" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Kpi index={0} icon={<UserPlus />} label="Inscrits sur 7 jours" value={o.users.new7d} hint={`${number(data.users.total)} comptes au total`} />
            <Kpi index={1} icon={<Users />} label="Inscrits sur 30 jours" value={o.users.new30d} hint={`${number(o.users.phoneVerified)} numéros vérifiés`} />
            <Kpi index={2} icon={<ShieldCheck />} label="Comptes Pro" value={o.users.pros} hint="Avec au moins un véhicule" />
            <Kpi index={3} icon={<UserX />} tone={o.users.suspended > 0 ? "danger" : "brand"} label="Comptes suspendus" value={o.users.suspended} hint={o.users.suspended ? undefined : "Aucun pour le moment"} />
            <Kpi index={4} icon={<Route />} tone="carpool" label="Trajets à venir" value={o.carpool.upcomingTrips} hint={`${number(data.carpool.totalTrips)} au total`} />
            <Kpi index={5} icon={<Ticket />} tone="carpool" label="Places vendues" value={o.carpool.seatsSold} hint={`${number(data.carpool.totalReservations)} réservations`} />
            <Money index={6} tone="carpool" icon={<Wallet />} label="Volume covoiturage" value={o.carpool.volume} hint="Places confirmées ou terminées" />
            <Money index={7} tone="rental" icon={<KeyRound />} label="Volume location" value={o.rental.volume} hint={`${number(data.rental.totalBookings)} demandes`} />
            <Kpi
              index={8}
              icon={<Star />}
              label="Note moyenne"
              value={o.reviews.average !== null ? `${fmtRating(o.reviews.average)} / 5` : "—"}
              hint={`${plural(o.reviews.total, "avis", "avis")}`}
            />
            <Kpi index={9} icon={<Flag />} tone={o.reports.open > 0 ? "danger" : "brand"} highlight={o.reports.open > 0} label="Signalements ouverts" value={o.reports.open} hint={o.reports.open ? "À traiter" : "Rien en attente"} />
            <Kpi
              index={10}
              icon={<Smartphone />}
              label="Appareils avec notifications"
              value={(o.devices.IOS ?? 0) + (o.devices.ANDROID ?? 0)}
              hint={`iPhone ${o.devices.IOS ?? 0} · Android ${o.devices.ANDROID ?? 0}`}
            />
            <Kpi index={11} icon={<CarFront />} label="Véhicules" value={data.vehicles.total} hint={`${data.vehicles.approved} approuvés · ${data.vehicles.rejected} refusés`} />
          </div>

          <Card className="p-5 sm:p-6">
            <div className="mb-1 flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 className="text-[17px] font-extrabold text-ink">Activité des 30 derniers jours</h2>
                <p className="text-[13px] text-muted">Nouveautés créées chaque jour. Touchez le graphique pour le détail d’une journée.</p>
              </div>
            </div>
            <div className="mt-4">
              <TrendChart series={o.series} />
            </div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
            <Card className="p-5 sm:p-6">
              <h2 className="mb-1 text-[17px] font-extrabold text-ink">Trajets populaires</h2>
              <p className="mb-4 text-[13px] text-muted">Itinéraires les plus publiés ces 90 derniers jours.</p>
              <PopularRoutes routes={o.topRoutes} />
            </Card>
            <Card className="p-5 sm:p-6">
              <h2 className="mb-4 text-[17px] font-extrabold text-ink">Statuts en cours</h2>
              <StatusSummary
                carpool={o.carpool.reservationsByStatus}
                rental={o.rental.bookingsByStatus}
              />
            </Card>
          </div>
        </>
      )}

      {data && (
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
      )}
    </div>
  );
}

/** Indicateur en FCFA : le montant défile, la devise reste discrète. */
function Money({ value, ...rest }: { value: number; index: number; icon: ReactNode; label: string; hint?: string; tone?: "brand" | "carpool" | "rental" | "danger" }) {
  return (
    <div className="col-span-2 lg:col-span-1">
      <Kpi
        {...rest}
        value={
          <>
            <AnimatedNumber value={value} format={number} />
            <span className="ml-1.5 text-[14px] font-bold text-muted">FCFA</span>
          </>
        }
      />
    </div>
  );
}

interface ToDoItem {
  id: string;
  title: string;
  sub: string;
}

/** Ce qui attend l'équipe : véhicules à vérifier et signalements ouverts. */
function ToDo({ loading, vehicles, reports, vehicleItems, reportItems }: { loading: boolean; vehicles: number; reports: number; vehicleItems: ToDoItem[]; reportItems: ToDoItem[] }) {
  if (loading) return <Skeleton className="h-28 rounded-[22px]" />;
  if (vehicles === 0 && reports === 0) {
    return (
      <div className="flex items-center gap-4 rounded-[20px] border border-success/25 bg-success/8 p-4">
        <BadgeCheck className="h-6 w-6 text-success" />
        <p className="text-[15px] font-extrabold text-ink">Tout est à jour : aucun véhicule ni signalement n’attend.</p>
      </div>
    );
  }
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <ToDoCard
        tone="warning"
        icon={<Hourglass />}
        count={vehicles}
        title={vehicles > 1 ? "véhicules à vérifier" : "véhicule à vérifier"}
        empty="Aucun véhicule en attente."
        href="/admin/vehicules"
        items={vehicleItems.map((i) => ({ ...i, href: `/admin/vehicules/${i.id}` }))}
      />
      <ToDoCard
        tone="danger"
        icon={<Flag />}
        count={reports}
        title={reports > 1 ? "signalements ouverts" : "signalement ouvert"}
        empty="Aucun signalement ouvert."
        href="/admin/signalements"
        items={reportItems.map((i) => ({ ...i, href: "/admin/signalements" }))}
      />
    </div>
  );
}

function ToDoCard({
  tone,
  icon,
  count,
  title,
  empty,
  href,
  items,
}: {
  tone: "warning" | "danger";
  icon: ReactNode;
  count: number;
  title: string;
  empty: string;
  href: string;
  items: (ToDoItem & { href: string })[];
}) {
  const active = count > 0;
  return (
    <div className={cn("rounded-[22px] border p-4 sm:p-5", active ? (tone === "warning" ? "border-warning/30 bg-warning/8" : "border-danger/25 bg-danger/6") : "border-line/70 bg-white shadow-card")}>
      <div className="flex items-center gap-3">
        <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] [&_svg]:h-5 [&_svg]:w-5", active ? (tone === "warning" ? "bg-warning/20 text-[#b46b05]" : "bg-danger/12 text-danger") : "bg-surface-alt text-muted")}>{icon}</span>
        <p className="flex-1 text-[15px] font-extrabold text-ink">
          {active ? (
            <>
              <span className="tabular-nums">{count}</span> {title}
            </>
          ) : (
            empty
          )}
        </p>
        {active && (
          <Link href={href} className="inline-flex items-center gap-1 text-[13px] font-bold text-brand hover:underline">
            Tout voir <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      {active && items.length > 0 && (
        <ul className="mt-3 divide-y divide-line/70 rounded-[16px] bg-white/80">
          {items.map((i) => (
            <li key={i.id}>
              <Link href={i.href} className="flex items-center gap-3 px-3.5 py-2.5 transition hover:bg-white">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-bold text-ink">{i.title}</p>
                  <p className="truncate text-[12.5px] text-muted">{i.sub}</p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-faint" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PopularRoutes({ routes }: { routes: { from: string; to: string; trips: number }[] }) {
  if (!routes.length) return <p className="py-6 text-center text-[14px] text-muted">Pas encore de trajets publiés.</p>;
  const max = Math.max(...routes.map((r) => r.trips));
  return (
    <ol className="space-y-3">
      {routes.map((r, i) => (
        <li key={`${r.from}-${r.to}`} className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[13px] font-extrabold text-brand">{i + 1}</span>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-3">
              <p className="flex min-w-0 items-center gap-1.5 truncate text-[14.5px] font-bold text-ink">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-carpool" />
                <span className="truncate">
                  {r.from} → {r.to}
                </span>
              </p>
              <span className="shrink-0 text-[13px] font-bold tabular-nums text-ink-soft">{plural(r.trips, "trajet")}</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-alt">
              <div className="h-full rounded-full bg-carpool" style={{ width: `${Math.max(6, (r.trips / max) * 100)}%` }} />
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

const STATUS_ORDER = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "REJECTED"] as const;
const STATUS_LABEL: Record<(typeof STATUS_ORDER)[number], { label: string; tone: "warning" | "success" | "info" | "muted" | "danger" }> = {
  PENDING: { label: "En attente", tone: "warning" },
  CONFIRMED: { label: "Confirmées", tone: "success" },
  COMPLETED: { label: "Terminées", tone: "info" },
  CANCELLED: { label: "Annulées", tone: "muted" },
  REJECTED: { label: "Refusées", tone: "danger" },
};

function StatusSummary({ carpool, rental }: { carpool: Partial<Record<string, number>>; rental: Partial<Record<string, number>> }) {
  const blocks = [
    { title: "Réservations de covoiturage", href: "/admin/reservations", icon: <Ticket className="h-4 w-4" />, counts: carpool },
    { title: "Demandes de location", href: "/admin/locations?onglet=demandes", icon: <KeyRound className="h-4 w-4" />, counts: rental },
  ];
  return (
    <div className="space-y-5">
      {blocks.map((b) => (
        <div key={b.title}>
          <Link href={b.href} className="mb-2 inline-flex items-center gap-2 text-[13.5px] font-extrabold text-ink-soft transition hover:text-brand">
            {b.icon} {b.title}
          </Link>
          <div className="flex flex-wrap gap-2">
            {STATUS_ORDER.map((s) => (
              <Badge key={s} tone={STATUS_LABEL[s].tone} className={cn(!b.counts[s] && "opacity-45")}>
                <span className="tabular-nums">{b.counts[s] ?? 0}</span> {STATUS_LABEL[s].label.toLowerCase()}
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

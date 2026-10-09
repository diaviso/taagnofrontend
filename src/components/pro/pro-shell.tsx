"use client";

import * as Dropdown from "@radix-ui/react-dropdown-menu";
import { motion } from "framer-motion";
import { CarFront, Inbox, KeyRound, LayoutDashboard, Plus, Route, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/logo";
import { UserMenu } from "@/components/layout/user-menu";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { groupRentalRequests, groupTripRequests } from "@/lib/pro";
import { useMyOffers, useMyTrips } from "@/lib/queries";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/pro/tableau-de-bord", label: "Tableau de bord", short: "Accueil", icon: LayoutDashboard },
  { href: "/pro/demandes", label: "Demandes", short: "Demandes", icon: Inbox, badge: true },
  { href: "/pro/trajets", label: "Mes trajets", short: "Trajets", icon: Route },
  { href: "/pro/locations", label: "Mes locations", short: "Locations", icon: KeyRound },
  { href: "/pro/vehicules", label: "Mes véhicules", short: "Véhicules", icon: CarFront },
];

/** Nombre de demandes en attente (pastille « Demandes »). */
export function usePendingRequests() {
  const trips = useMyTrips();
  const offers = useMyOffers();
  const t = groupTripRequests((trips.data ?? []).filter((x) => x.status !== "CANCELLED")).pending.length;
  const r = groupRentalRequests(offers.data ?? []).pending.length;
  return { trips: t, rentals: r, total: t + r };
}

/** Bouton « Publier » : trajet, location ou véhicule. */
export function PublishMenu({ compact }: { compact?: boolean }) {
  const items = [
    { href: "/pro/trajets/nouveau", label: "Proposer un trajet", hint: "Partagez vos frais de route", icon: Route },
    { href: "/pro/locations/nouvelle", label: "Louer un véhicule", hint: "Publiez une offre de location", icon: KeyRound },
    { href: "/pro/vehicules/nouveau", label: "Ajouter un véhicule", hint: "Photos et documents", icon: CarFront },
  ];
  return (
    <Dropdown.Root modal={false}>
      <Dropdown.Trigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center justify-center gap-2 bg-brand-gradient font-bold text-white shadow-glow transition hover:brightness-110 active:scale-95",
            compact ? "h-14 w-14 rounded-full" : "h-10 rounded-full px-4 text-[14px]",
          )}
          aria-label="Publier"
        >
          <Plus className={compact ? "h-6 w-6" : "h-4.5 w-4.5"} strokeWidth={2.6} />
          {!compact && "Publier"}
        </button>
      </Dropdown.Trigger>
      <Dropdown.Portal>
        <Dropdown.Content
          align="end"
          side={compact ? "top" : "bottom"}
          sideOffset={10}
          className="z-[70] w-[290px] rounded-[20px] border border-line bg-white p-1.5 shadow-lift data-[state=open]:animate-[pop_.16s_ease-out]"
        >
          {items.map(({ href, label, hint, icon: Icon }) => (
            <Dropdown.Item key={href} asChild>
              <Link href={href} className="flex items-center gap-3 rounded-[14px] px-3 py-3 outline-none transition data-[highlighted]:bg-brand-soft">
                <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-brand-soft text-brand">
                  <Icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-[14.5px] font-bold text-ink">{label}</span>
                  <span className="block text-[12.5px] text-muted">{hint}</span>
                </span>
              </Link>
            </Dropdown.Item>
          ))}
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
  );
}

/** Cadre de l'espace Pro : menu latéral (ordinateur), onglets en bas (téléphone). */
export function ProShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const pending = usePendingRequests();

  return (
    <div className="min-h-dvh bg-canvas">
      {/* Menu latéral */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] flex-col border-r border-line/70 bg-white lg:flex">
        <Link href="/pro/tableau-de-bord" className="flex h-[72px] items-center px-6">
          <Logo size={34} suffix="Pro" />
        </Link>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-3 rounded-[14px] px-4 py-3 text-[14.5px] font-bold transition",
                  active ? "text-brand" : "text-ink-soft hover:bg-surface-alt hover:text-ink",
                )}
              >
                {active && <motion.span layoutId="pro-nav" className="absolute inset-0 rounded-[14px] bg-brand-soft" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
                <Icon className="relative h-5 w-5" />
                <span className="relative flex-1">{item.label}</span>
                {item.badge && pending.total > 0 && (
                  <span className="relative rounded-full bg-danger px-2 text-[11.5px] leading-5 text-white">{pending.total}</span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="m-3 rounded-[18px] bg-aurora p-4 text-white">
          <p className="text-[14px] font-extrabold">Besoin d’un trajet ?</p>
          <p className="mt-1 text-[12.5px] text-white/85">Le site voyageur reste à un clic, avec le même compte.</p>
          <Link href="/" className="mt-3 inline-flex rounded-full bg-white px-3 py-1.5 text-[12.5px] font-bold text-brand-dark">
            Site voyageur
          </Link>
        </div>
        <Link
          href="/pro/profil"
          className={cn(
            "mx-3 mb-4 flex items-center gap-3 rounded-[14px] px-4 py-3 text-[14.5px] font-bold transition",
            pathname.startsWith("/pro/profil") ? "bg-brand-soft text-brand" : "text-ink-soft hover:bg-surface-alt",
          )}
        >
          <UserRound className="h-5 w-5" /> Mon profil
        </Link>
      </aside>

      <div className="lg:pl-[264px]">
        {/* En-tête */}
        <header className="sticky top-0 z-30 border-b border-line/70 bg-white/85 backdrop-blur-xl">
          <div className="mx-auto flex h-[64px] max-w-6xl items-center gap-3 px-4 sm:px-6 lg:h-[72px]">
            <Link href="/pro/tableau-de-bord" className="lg:hidden">
              <Logo size={30} suffix="Pro" />
            </Link>
            <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
              <div className="hidden sm:block">
                <PublishMenu />
              </div>
              <NotificationBell audience="PRO" />
              <UserMenu space="pro" />
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:pb-12 lg:pt-8">{children}</main>
      </div>

      {/* Onglets (téléphone) */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line/80 bg-white/92 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="relative flex flex-col items-center gap-0.5 pb-2 pt-2.5">
                {active && <motion.span layoutId="pro-tab" className="absolute top-0 h-[3px] w-10 rounded-b-full bg-brand" />}
                <span className="relative">
                  <Icon className={cn("h-[22px] w-[22px]", active ? "text-brand" : "text-faint")} strokeWidth={active ? 2.4 : 2} />
                  {item.badge && pending.total > 0 && (
                    <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-extrabold text-white ring-2 ring-white">
                      {pending.total}
                    </span>
                  )}
                </span>
                <span className={cn("text-[11px] font-bold", active ? "text-brand" : "text-muted")}>{item.short}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      <div className="fixed bottom-[calc(76px+env(safe-area-inset-bottom))] right-4 z-40 sm:hidden">
        <PublishMenu compact />
      </div>
    </div>
  );
}

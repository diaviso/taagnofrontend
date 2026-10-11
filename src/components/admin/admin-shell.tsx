"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import {
  CarFront,
  Flag,
  KeyRound,
  LayoutDashboard,
  Megaphone,
  Menu,
  MessageSquareHeart,
  Route,
  ScrollText,
  Settings,
  ShieldAlert,
  Ticket,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Logo } from "@/components/brand/logo";
import { UserMenu } from "@/components/layout/user-menu";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";
import { PageSpinner } from "@/components/ui/spinner";
import { useAdminBadges } from "@/lib/admin";
import { useAuth } from "@/lib/auth";
import { isAdmin } from "@/lib/types";
import { cn } from "@/lib/utils";

type Badge = "vehicles" | "reports";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  badge?: Badge;
}

const NAV: { title?: string; items: NavItem[] }[] = [
  { items: [{ href: "/admin", label: "Tableau de bord", icon: LayoutDashboard, exact: true }] },
  {
    title: "Communauté",
    items: [
      { href: "/admin/utilisateurs", label: "Utilisateurs", icon: Users },
      { href: "/admin/vehicules", label: "Véhicules", icon: CarFront, badge: "vehicles" },
    ],
  },
  {
    title: "Activité",
    items: [
      { href: "/admin/trajets", label: "Trajets", icon: Route },
      { href: "/admin/reservations", label: "Réservations", icon: Ticket },
      { href: "/admin/locations", label: "Locations", icon: KeyRound },
    ],
  },
  {
    title: "Modération",
    items: [
      { href: "/admin/avis", label: "Avis", icon: MessageSquareHeart },
      { href: "/admin/signalements", label: "Signalements", icon: Flag, badge: "reports" },
    ],
  },
  {
    title: "Équipe",
    items: [
      { href: "/admin/messages", label: "Messages", icon: Megaphone },
      { href: "/admin/reglages", label: "Réglages", icon: Settings },
      { href: "/admin/journal", label: "Journal", icon: ScrollText },
    ],
  },
];

const FLAT = NAV.flatMap((g) => g.items);

/** Menu de l'administration (colonne de bureau et tiroir mobile). */
function NavList({ pathname, layoutId, onNavigate }: { pathname: string; layoutId: string; onNavigate?: () => void }) {
  const badges = useAdminBadges();
  const isActive = (item: NavItem) => (item.exact ? pathname === item.href : pathname.startsWith(item.href));
  return (
    <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-3">
      {NAV.map((group, gi) => (
        <div key={group.title ?? gi}>
          {group.title && <p className="mb-1.5 px-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-white/40">{group.title}</p>}
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const active = isActive(item);
              const Icon = item.icon;
              const n = item.badge ? badges[item.badge] : 0;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex items-center gap-3 rounded-[14px] px-4 py-2.5 text-[14.5px] font-bold transition",
                    active ? "text-white" : "text-white/65 hover:bg-white/8 hover:text-white",
                  )}
                >
                  {active && <motion.span layoutId={layoutId} className="absolute inset-0 rounded-[14px] bg-white/12" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
                  <Icon className="relative h-5 w-5" />
                  <span className="relative flex-1">{item.label}</span>
                  {n > 0 && (
                    <span className={cn("relative rounded-full px-2 text-[11.5px] leading-5", item.badge === "reports" ? "bg-danger text-white" : "bg-warning text-brand-dark")}>{n}</span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

/** Cadre de l'administration, réservé aux comptes administrateurs. */
export function AdminShell({ children }: { children: ReactNode }) {
  const { status, user, requireAuth } = useAuth();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const badges = useAdminBadges();

  if (status === "loading") return <PageSpinner />;
  if (!user || !isAdmin(user)) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-canvas px-4">
        <div className="w-full max-w-md rounded-[28px] border border-line/70 bg-white shadow-card">
          <EmptyState
            icon={<ShieldAlert />}
            title={user ? "Accès réservé à l’équipe Taagno" : "Administration Taagno"}
            text={user ? "Ce compte n’a pas les droits d’administration." : "Connectez-vous avec un compte administrateur."}
            action={
              user ? (
                <Link href="/" className="text-[14px] font-bold text-brand">
                  Retour au site
                </Link>
              ) : (
                <Button onClick={() => requireAuth()}>Se connecter</Button>
              )
            }
          />
        </div>
      </div>
    );
  }

  const current = FLAT.find((item) => (item.exact ? pathname === item.href : pathname.startsWith(item.href)));
  const toDo = badges.vehicles + badges.reports;

  return (
    <div className="min-h-dvh bg-canvas">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col bg-brand-dark text-white lg:flex">
        <Link href="/admin" className="flex h-[72px] shrink-0 items-center px-6">
          <Logo size={32} light suffix="Admin" />
        </Link>
        <NavList pathname={pathname} layoutId="admin-nav" />
        <Link href="/" className="m-3 shrink-0 rounded-[14px] px-4 py-3 text-[13px] font-semibold text-white/65 hover:bg-white/8 hover:text-white">
          ← Retour au site
        </Link>
      </aside>

      {/* Tiroir du menu (téléphone et tablette) */}
      <Dialog.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
        <AnimatePresence>
          {drawerOpen && (
            <Dialog.Portal forceMount>
              <Dialog.Overlay asChild forceMount>
                <motion.div
                  className="fixed inset-0 z-[60] bg-ink/45 backdrop-blur-[3px]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
              </Dialog.Overlay>
              <Dialog.Content asChild forceMount aria-describedby={undefined}>
                <motion.aside
                  className="fixed inset-y-0 left-0 z-[61] flex w-[288px] max-w-[86vw] flex-col bg-brand-dark text-white shadow-lift"
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "spring", damping: 32, stiffness: 340 }}
                >
                  <Dialog.Title className="sr-only">Menu de l’administration</Dialog.Title>
                  <div className="flex h-[64px] shrink-0 items-center justify-between pl-6 pr-3">
                    <Logo size={30} light suffix="Admin" />
                    <Dialog.Close className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white" aria-label="Fermer le menu">
                      <X className="h-5 w-5" />
                    </Dialog.Close>
                  </div>
                  <NavList pathname={pathname} layoutId="admin-nav-drawer" onNavigate={() => setDrawerOpen(false)} />
                  <Link href="/" onClick={() => setDrawerOpen(false)} className="m-3 shrink-0 rounded-[14px] px-4 py-3 text-[13px] font-semibold text-white/65 hover:bg-white/8 hover:text-white">
                    ← Retour au site
                  </Link>
                </motion.aside>
              </Dialog.Content>
            </Dialog.Portal>
          )}
        </AnimatePresence>
      </Dialog.Root>

      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-30 border-b border-line/70 bg-white/85 backdrop-blur-xl">
          <div className="mx-auto flex h-[64px] max-w-6xl items-center gap-3 px-4 sm:px-6">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Ouvrir le menu"
              className="relative -ml-2 inline-flex h-11 w-11 items-center justify-center rounded-[12px] text-ink transition hover:bg-surface-alt lg:hidden"
            >
              <Menu className="h-6 w-6" />
              {toDo > 0 && <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-danger ring-2 ring-white" />}
            </button>
            <Link href="/admin" className="lg:hidden">
              <Logo size={28} suffix="Admin" />
            </Link>
            {current && !current.exact && <span className="hidden text-[15px] font-extrabold text-ink sm:block lg:hidden">{current.label}</span>}
            <div className="ml-auto">
              <UserMenu space="admin" />
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 lg:pt-8">{children}</main>
      </div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { CarFront, Home, KeyRound, Route, Ticket, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/logo";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { UserMenu } from "./user-menu";

const NAV = [
  { href: "/covoiturage", label: "Covoiturage", icon: Route },
  { href: "/location", label: "Location", icon: KeyRound },
];

/** En-tête du site voyageur, transparent au-dessus du héros de l'accueil. */
export function SiteHeader() {
  const pathname = usePathname();
  const overHero = pathname === "/";
  const { status, requireAuth } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const light = overHero && !scrolled;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        light ? "bg-transparent" : "border-b border-line/70 bg-white/85 backdrop-blur-xl",
        overHero && "-mb-[68px]",
      )}
    >
      <div className="mx-auto flex h-[68px] max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="shrink-0" aria-label="Taagno, accueil">
          <Logo size={34} light={light} />
        </Link>

        <nav className="ml-6 hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative rounded-full px-4 py-2 text-[14.5px] font-bold transition",
                  light ? "text-white/85 hover:bg-white/10 hover:text-white" : active ? "text-brand" : "text-ink-soft hover:bg-surface-alt hover:text-ink",
                )}
              >
                {item.label}
                {active && !light && (
                  <motion.span layoutId="site-nav" className="absolute inset-x-4 -bottom-[13px] h-[3px] rounded-full bg-brand" />
                )}
              </Link>
            );
          })}
          {status === "authenticated" && (
            <Link
              href="/reservations"
              className={cn(
                "relative rounded-full px-4 py-2 text-[14.5px] font-bold transition",
                light
                  ? "text-white/85 hover:bg-white/10 hover:text-white"
                  : pathname.startsWith("/reservations")
                    ? "text-brand"
                    : "text-ink-soft hover:bg-surface-alt hover:text-ink",
              )}
            >
              Mes réservations
              {pathname.startsWith("/reservations") && !light && (
                <motion.span layoutId="site-nav" className="absolute inset-x-4 -bottom-[13px] h-[3px] rounded-full bg-brand" />
              )}
            </Link>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <Link
            href="/pro"
            className={cn(
              "hidden items-center gap-2 rounded-full px-4 py-2 text-[14px] font-bold transition lg:inline-flex",
              light ? "bg-white/12 text-white hover:bg-white/20" : "bg-[#fdf0dc] text-[#b45309] hover:bg-[#fbe3bd]",
            )}
          >
            <CarFront className="h-4 w-4" /> Proposer un trajet ou une voiture
          </Link>
          {status === "authenticated" ? (
            <>
              <NotificationBell audience="VOYAGEUR" className={light ? "text-white hover:bg-white/10 hover:text-white" : undefined} />
              <UserMenu space="site" />
            </>
          ) : status === "anonymous" ? (
            <Button variant={light ? "white" : "primary"} size="sm" className="h-10 rounded-full px-5" onClick={() => requireAuth()}>
              Se connecter
            </Button>
          ) : (
            <span className="h-10 w-24" />
          )}
        </div>
      </div>
    </header>
  );
}

const TABS = [
  { href: "/", label: "Accueil", icon: Home, match: (p: string) => p === "/" },
  { href: "/covoiturage", label: "Trajets", icon: Route, match: (p: string) => p.startsWith("/covoiturage") },
  { href: "/location", label: "Location", icon: KeyRound, match: (p: string) => p.startsWith("/location") },
  { href: "/reservations", label: "Réservations", icon: Ticket, match: (p: string) => p.startsWith("/reservations") },
  { href: "/compte", label: "Compte", icon: UserRound, match: (p: string) => ["/compte", "/favoris", "/alertes", "/notifications"].some((x) => p.startsWith(x)) },
];

/** Barre d'onglets en bas de l'écran sur téléphone (comme l'application). */
export function SiteTabBar() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-line/80 bg-white/92 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5">
        {TABS.map((tab) => {
          const active = tab.match(pathname);
          const Icon = tab.icon;
          return (
            <Link key={tab.href} href={tab.href} className="relative flex flex-col items-center gap-0.5 pb-2 pt-2.5">
              {active && <motion.span layoutId="tabbar" className="absolute top-0 h-[3px] w-10 rounded-b-full bg-brand" />}
              <Icon className={cn("h-[22px] w-[22px] transition", active ? "text-brand" : "text-faint")} strokeWidth={active ? 2.4 : 2} />
              <span className={cn("text-[11px] font-bold", active ? "text-brand" : "text-muted")}>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

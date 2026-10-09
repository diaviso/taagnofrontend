"use client";

import { motion } from "framer-motion";
import { CarFront, LayoutDashboard, ShieldAlert, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/logo";
import { UserMenu } from "@/components/layout/user-menu";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";
import { PageSpinner } from "@/components/ui/spinner";
import { useAdminStats } from "@/lib/admin";
import { useAuth } from "@/lib/auth";
import { isAdmin } from "@/lib/types";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Vue d’ensemble", icon: LayoutDashboard, exact: true },
  { href: "/admin/vehicules", label: "Véhicules", icon: CarFront, badge: true },
  { href: "/admin/utilisateurs", label: "Utilisateurs", icon: Users },
];

/** Cadre de l'administration, réservé aux comptes administrateurs. */
export function AdminShell({ children }: { children: ReactNode }) {
  const { status, user, requireAuth } = useAuth();
  const pathname = usePathname();
  const stats = useAdminStats();
  const pending = stats.data?.vehicles.pending ?? 0;

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

  const isActive = (href: string, exact?: boolean) => (exact ? pathname === href : pathname.startsWith(href));

  return (
    <div className="min-h-dvh bg-canvas">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col bg-brand-dark text-white lg:flex">
        <Link href="/admin" className="flex h-[72px] items-center px-6">
          <Logo size={32} light suffix="Admin" />
        </Link>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV.map(({ href, label, icon: Icon, exact, badge }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                className={cn("relative flex items-center gap-3 rounded-[14px] px-4 py-3 text-[14.5px] font-bold transition", active ? "text-white" : "text-white/65 hover:bg-white/8 hover:text-white")}
              >
                {active && <motion.span layoutId="admin-nav" className="absolute inset-0 rounded-[14px] bg-white/12" />}
                <Icon className="relative h-5 w-5" />
                <span className="relative flex-1">{label}</span>
                {badge && pending > 0 && <span className="relative rounded-full bg-warning px-2 text-[11.5px] leading-5 text-brand-dark">{pending}</span>}
              </Link>
            );
          })}
        </nav>
        <Link href="/" className="m-3 rounded-[14px] px-4 py-3 text-[13px] font-semibold text-white/65 hover:bg-white/8 hover:text-white">
          ← Retour au site
        </Link>
      </aside>
      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-30 border-b border-line/70 bg-white/85 backdrop-blur-xl">
          <div className="mx-auto flex h-[64px] max-w-6xl items-center gap-3 px-4 sm:px-6">
            <Link href="/admin" className="lg:hidden">
              <Logo size={28} suffix="Admin" />
            </Link>
            <nav className="ml-2 flex gap-1 lg:hidden">
              {NAV.map(({ href, icon: Icon, exact, label }) => (
                <Link key={href} href={href} aria-label={label} className={cn("flex h-10 w-10 items-center justify-center rounded-[12px]", isActive(href, exact) ? "bg-brand-soft text-brand" : "text-muted")}>
                  <Icon className="h-5 w-5" />
                </Link>
              ))}
            </nav>
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

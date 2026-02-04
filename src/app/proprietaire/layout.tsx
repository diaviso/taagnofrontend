"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/providers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Car,
  LayoutDashboard,
  Navigation,
  Key,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X,
  Sparkles,
  Bell,
  HelpCircle,
  TrendingUp,
} from "lucide-react";

interface ProprietaireLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  {
    href: "/proprietaire",
    label: "Tableau de bord",
    icon: LayoutDashboard,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    activeColor: "bg-amber-500",
  },
  {
    href: "/proprietaire/vehicules",
    label: "Mes véhicules",
    icon: Car,
    color: "text-amber-600",
    bgColor: "bg-amber-500/10",
    activeColor: "bg-amber-500",
  },
  {
    href: "/proprietaire/trajets",
    label: "Mes trajets",
    icon: Navigation,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    activeColor: "bg-green-500",
  },
  {
    href: "/proprietaire/locations",
    label: "Mes locations",
    icon: Key,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    activeColor: "bg-purple-500",
  },
];

const bottomMenuItems = [
  {
    href: "/aide",
    label: "Aide & Support",
    icon: HelpCircle,
  },
  {
    href: "/parametres",
    label: "Paramètres",
    icon: Settings,
  },
];

export default function ProprietaireLayout({ children }: ProprietaireLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading: authLoading, isProprietaire, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    } else if (!authLoading && isAuthenticated && !isProprietaire) {
      router.push("/");
    }
  }, [authLoading, isAuthenticated, isProprietaire, router]);

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  const isActive = (href: string) => {
    if (href === "/proprietaire") {
      return pathname === "/proprietaire";
    }
    return pathname.startsWith(href);
  };

  if (authLoading || !isAuthenticated || !isProprietaire) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-500/5 via-background to-orange-500/5">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 animate-pulse mx-auto mb-4 flex items-center justify-center">
              <Car className="h-8 w-8 text-white" />
            </div>
            <div className="absolute -inset-4 bg-amber-500/20 rounded-full blur-2xl animate-pulse" />
          </div>
          <p className="text-muted-foreground mt-4">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-500/5 via-background to-orange-500/5">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b">
        <div className="flex items-center justify-between p-4">
          <Link href="/proprietaire" className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Car className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg">Taagno Pro</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="h-10 w-10"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full bg-background/95 backdrop-blur-xl border-r transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "w-20" : "w-72",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={cn(
            "p-6 border-b transition-all duration-300",
            sidebarCollapsed && "p-4"
          )}>
            <Link href="/proprietaire" className="flex items-center gap-3">
              <div className="relative">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
                  <Car className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-background" />
              </div>
              {!sidebarCollapsed && (
                <div className="animate-fade-in">
                  <span className="font-bold text-xl bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                    Taagno
                  </span>
                  <Badge className="ml-2 px-2 py-0 text-xs bg-amber-500/10 text-amber-600 border-amber-500/20">
                    Pro
                  </Badge>
                </div>
              )}
            </Link>
          </div>

          {/* User Profile */}
          <div className={cn(
            "p-4 border-b transition-all duration-300",
            sidebarCollapsed && "p-3"
          )}>
            <div className={cn(
              "flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/5 transition-all",
              sidebarCollapsed && "p-2 justify-center"
            )}>
              <Avatar className={cn(
                "ring-2 ring-amber-500/30 transition-all",
                sidebarCollapsed ? "h-10 w-10" : "h-12 w-12"
              )}>
                <AvatarImage src={user?.photoUrl} />
                <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-500 text-white font-semibold">
                  {getInitials(user?.firstName, user?.lastName)}
                </AvatarFallback>
              </Avatar>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0 animate-fade-in">
                  <p className="font-semibold truncate">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                  <div
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                      active
                        ? `${item.activeColor} text-white shadow-lg`
                        : `hover:${item.bgColor} text-muted-foreground hover:text-foreground`,
                      sidebarCollapsed && "justify-center px-3"
                    )}
                    style={{
                      boxShadow: active ? `0 10px 30px -10px ${item.activeColor.replace('bg-', '')}40` : 'none'
                    }}
                  >
                    {/* Active indicator */}
                    {active && (
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
                    )}
                    <item.icon className={cn(
                      "h-5 w-5 transition-transform duration-200",
                      !active && item.color,
                      active && "text-white",
                      "group-hover:scale-110"
                    )} />
                    {!sidebarCollapsed && (
                      <span className={cn(
                        "font-medium animate-fade-in",
                        active && "text-white"
                      )}>
                        {item.label}
                      </span>
                    )}
                    {active && !sidebarCollapsed && (
                      <Sparkles className="h-4 w-4 ml-auto animate-pulse" />
                    )}
                  </div>
                </Link>
              );
            })}

            {/* Divider */}
            <div className="my-4 border-t border-border/50" />

            {/* Bottom menu items */}
            {bottomMenuItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-muted/50",
                    sidebarCollapsed && "justify-center px-3"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {!sidebarCollapsed && (
                    <span className="animate-fade-in">{item.label}</span>
                  )}
                </div>
              </Link>
            ))}
          </nav>

          {/* Stats Card (only when expanded) */}
          {!sidebarCollapsed && (
            <div className="p-4 animate-fade-in">
              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium">Performances</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Votre activité ce mois
                </p>
                <div className="mt-2 h-2 rounded-full bg-amber-500/20 overflow-hidden">
                  <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 animate-pulse" />
                </div>
              </div>
            </div>
          )}

          {/* Logout & Collapse */}
          <div className={cn(
            "p-4 border-t space-y-2",
            sidebarCollapsed && "p-3"
          )}>
            <Button
              variant="ghost"
              onClick={() => { logout(); router.push('/'); }}
              className={cn(
                "w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50",
                sidebarCollapsed && "justify-center px-3"
              )}
            >
              <LogOut className="h-5 w-5" />
              {!sidebarCollapsed && <span>Déconnexion</span>}
            </Button>

            {/* Collapse button (desktop only) */}
            <Button
              variant="ghost"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={cn(
                "hidden lg:flex w-full justify-start gap-3",
                sidebarCollapsed && "justify-center px-3"
              )}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <>
                  <ChevronLeft className="h-5 w-5" />
                  <span>Réduire</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          "min-h-screen transition-all duration-300 ease-in-out pt-16 lg:pt-0",
          sidebarCollapsed ? "lg:pl-20" : "lg:pl-72"
        )}
      >
        {/* Top Bar (desktop) */}
        <div className="hidden lg:flex sticky top-0 z-30 h-16 items-center justify-between px-6 bg-background/80 backdrop-blur-xl border-b">
          <div>
            <h1 className="text-lg font-semibold">Espace Propriétaire</h1>
            <p className="text-sm text-muted-foreground">Gérez vos véhicules et services</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
                3
              </span>
            </Button>
            <Link href="/">
              <Button variant="outline" className="gap-2">
                <ChevronLeft className="h-4 w-4" />
                Retour au site
              </Button>
            </Link>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}

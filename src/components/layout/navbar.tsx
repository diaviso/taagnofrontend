"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/providers";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Car,
  Users,
  Home,
  Shield,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  CarFront,
  Sparkles,
  Search,
  MapPin,
  Key,
  ShoppingBag,
  Navigation,
  ArrowLeftRight,
  Settings,
  BookOpen,
  CalendarCheck,
} from "lucide-react";
import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { UserMode } from "@/types";
import { toast } from "sonner";

export function Navbar() {
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, isVoyageur, isProprietaire, userMode, setUserMode, logout, needsOnboarding } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isAuthenticated && needsOnboarding && pathname !== "/onboarding") {
      router.push("/onboarding");
    }
  }, [isAuthenticated, needsOnboarding, pathname, router]);

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  const handleSwitchMode = async () => {
    const newMode = isVoyageur ? UserMode.PROPRIETAIRE : UserMode.VOYAGEUR;
    try {
      await setUserMode(newMode);
      toast.success(`Mode ${newMode === UserMode.VOYAGEUR ? "Voyageur" : "Propriétaire"} activé`);
      if (newMode === UserMode.PROPRIETAIRE) {
        router.push("/proprietaire");
      } else {
        router.push("/");
      }
    } catch (error) {
      toast.error("Erreur lors du changement de mode");
    }
  };

  const voyageurNavItems = [
    { href: "/", label: "Accueil", icon: Home },
    { href: "/carpool", label: "Trouver un trajet", icon: MapPin },
    { href: "/rental", label: "Louer un véhicule", icon: ShoppingBag },
  ];

  const proprietaireNavItems = [
    { href: "/proprietaire", label: "Tableau de bord", icon: LayoutDashboard },
    { href: "/proprietaire/trajets", label: "Mes trajets", icon: Navigation },
    { href: "/proprietaire/locations", label: "Mes locations", icon: Key },
    { href: "/proprietaire/vehicules", label: "Mes véhicules", icon: Car },
  ];

  const publicNavItems = [
    { href: "/", label: "Accueil", icon: Home },
    { href: "/carpool", label: "Covoiturage", icon: Users },
    { href: "/rental", label: "Location", icon: Car },
  ];

  const navItems = !isAuthenticated
    ? publicNavItems
    : isProprietaire
    ? proprietaireNavItems
    : voyageurNavItems;

  const modeLabel = isProprietaire ? "Propriétaire" : "Voyageur";
  const modeColor = isProprietaire ? "amber" : "primary";

  return (
    <nav className={`sticky top-0 z-50 w-full transition-all duration-300 ${
      scrolled
        ? "bg-background/80 backdrop-blur-xl shadow-soft border-b"
        : "bg-transparent"
    }`}>
      <div className="container flex h-18 items-center justify-between py-3">
        <div className="flex items-center gap-8">
          <Link href={isProprietaire ? "/proprietaire" : "/"} className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg group-hover:blur-xl transition-all opacity-0 group-hover:opacity-100" />
              <div className={`relative flex h-10 w-10 items-center justify-center rounded-xl shadow-glow ${
                isProprietaire
                  ? "bg-gradient-to-br from-amber-500 to-orange-500"
                  : "bg-gradient-to-br from-primary to-primary/80"
              }`}>
                <Car className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className={`text-xl font-bold bg-clip-text text-transparent ${
                isProprietaire
                  ? "bg-gradient-to-r from-amber-500 to-orange-500"
                  : "bg-gradient-to-r from-primary to-primary/70"
              }`}>
                Taagno
              </span>
              {isAuthenticated && userMode && (
                <span className={`text-[10px] font-medium -mt-1 ${
                  isProprietaire ? "text-amber-600" : "text-primary"
                }`}>
                  {modeLabel}
                </span>
              )}
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    className={`gap-2 relative transition-all duration-200 ${
                      isActive
                        ? isProprietaire
                          ? "text-amber-600 bg-amber-500/10"
                          : "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                    {isActive && (
                      <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 rounded-full ${
                        isProprietaire ? "bg-amber-500" : "bg-primary"
                      }`} />
                    )}
                  </Button>
                </Link>
              );
            })}
            {isAdmin && (
              <Link href="/admin">
                <Button
                  variant="ghost"
                  className={`gap-2 relative ${
                    pathname.startsWith("/admin")
                      ? "text-red-600 bg-red-500/10"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Shield className="h-4 w-4" />
                  Admin
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className={`relative h-11 gap-3 pl-3 pr-4 rounded-full border transition-all ${
                  isProprietaire
                    ? "border-amber-500/30 hover:border-amber-500/50 hover:bg-amber-500/5"
                    : "border-border/50 hover:border-primary/30 hover:bg-primary/5"
                }`}>
                  <Avatar className={`h-8 w-8 ring-2 ${
                    isProprietaire ? "ring-amber-500/20" : "ring-primary/20"
                  }`}>
                    <AvatarImage src={user?.photoUrl} alt={user?.firstName} />
                    <AvatarFallback className={`text-sm font-semibold ${
                      isProprietaire
                        ? "bg-gradient-to-br from-amber-500/20 to-orange-500/10 text-amber-600"
                        : "bg-gradient-to-br from-primary/20 to-primary/10 text-primary"
                    }`}>
                      {getInitials(user?.firstName, user?.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block font-medium text-sm">
                    {user?.firstName}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-72 p-2" align="end" forceMount>
                <div className={`flex items-center gap-3 p-3 rounded-lg mb-2 ${
                  isProprietaire ? "bg-amber-500/10" : "bg-muted/50"
                }`}>
                  <Avatar className={`h-12 w-12 ring-2 ${
                    isProprietaire ? "ring-amber-500/20" : "ring-primary/20"
                  }`}>
                    <AvatarImage src={user?.photoUrl} />
                    <AvatarFallback className={`font-semibold ${
                      isProprietaire
                        ? "bg-gradient-to-br from-amber-500/20 to-orange-500/10 text-amber-600"
                        : "bg-gradient-to-br from-primary/20 to-primary/10 text-primary"
                    }`}>
                      {getInitials(user?.firstName, user?.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email}
                    </p>
                    <Badge variant="outline" className={`mt-1 text-[10px] ${
                      isProprietaire
                        ? "border-amber-500/30 text-amber-600 bg-amber-500/10"
                        : "border-primary/30 text-primary bg-primary/10"
                    }`}>
                      Mode {modeLabel}
                    </Badge>
                  </div>
                </div>

                <DropdownMenuItem
                  onClick={handleSwitchMode}
                  className={`gap-3 py-3 px-3 cursor-pointer rounded-lg mb-2 ${
                    isProprietaire
                      ? "bg-primary/5 hover:bg-primary/10 text-primary"
                      : "bg-amber-500/5 hover:bg-amber-500/10 text-amber-600"
                  }`}
                >
                  <ArrowLeftRight className="h-4 w-4" />
                  <div>
                    <p className="font-medium">Passer en mode {isProprietaire ? "Voyageur" : "Propriétaire"}</p>
                    <p className="text-xs opacity-70">
                      {isProprietaire
                        ? "Rechercher des trajets et louer des véhicules"
                        : "Proposer des trajets et mettre en location"}
                    </p>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-2" />

                {isVoyageur ? (
                  <>
                    <DropdownMenuItem asChild className="gap-3 py-2.5 px-3 cursor-pointer rounded-lg">
                      <Link href="/mes-reservations">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        Mes réservations
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="gap-3 py-2.5 px-3 cursor-pointer rounded-lg">
                      <Link href="/mes-locations">
                        <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                        Mes locations
                      </Link>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild className="gap-3 py-2.5 px-3 cursor-pointer rounded-lg">
                      <Link href="/proprietaire">
                        <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                        Tableau de bord
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="gap-3 py-2.5 px-3 cursor-pointer rounded-lg">
                      <Link href="/proprietaire/vehicules">
                        <CarFront className="h-4 w-4 text-muted-foreground" />
                        Mes véhicules
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuSeparator className="my-2" />

                <DropdownMenuItem
                  onClick={logout}
                  className="gap-3 py-2.5 px-3 cursor-pointer rounded-lg text-red-600 hover:text-red-600 hover:bg-red-50 focus:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button className="gap-2 shadow-glow hover:shadow-glow transition-all h-11 px-6">
                <Sparkles className="h-4 w-4" />
                Se connecter
              </Button>
            </Link>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-11 w-11"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ${
        mobileMenuOpen ? "max-h-[500px] border-t" : "max-h-0"
      }`}>
        <div className="container py-4 space-y-1 bg-background/95 backdrop-blur-xl">
          {isAuthenticated && userMode && (
            <div className={`p-3 rounded-lg mb-3 ${
              isProprietaire ? "bg-amber-500/10" : "bg-primary/10"
            }`}>
              <p className={`text-sm font-medium ${
                isProprietaire ? "text-amber-600" : "text-primary"
              }`}>
                Mode {modeLabel}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSwitchMode}
                className="mt-2 w-full justify-start gap-2 h-9"
              >
                <ArrowLeftRight className="h-4 w-4" />
                Passer en mode {isProprietaire ? "Voyageur" : "Propriétaire"}
              </Button>
            </div>
          )}

          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button
                  variant="ghost"
                  className={`w-full justify-start gap-3 h-12 ${
                    isActive
                      ? isProprietaire
                        ? "bg-amber-500/10 text-amber-600"
                        : "bg-primary/10 text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
          {isAdmin && (
            <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
              <Button
                variant="ghost"
                className={`w-full justify-start gap-3 h-12 ${
                  pathname.startsWith("/admin")
                    ? "bg-red-500/10 text-red-600"
                    : "text-muted-foreground"
                }`}
              >
                <Shield className="h-5 w-5" />
                Administration
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

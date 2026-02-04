"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { TipCard } from "@/components/ui/tip-card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { carpoolService } from "@/lib/services";
import { CarpoolTrip, SearchTripDto } from "@/types";
import {
  Users,
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
  Plus,
  Search,
  Sparkles,
  Filter,
  Star,
  HelpCircle,
  Zap
} from "lucide-react";
import { useAuth } from "@/providers";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function CarpoolPage() {
  const { isAuthenticated, user } = useAuth();
  const [searchParams, setSearchParams] = useState<SearchTripDto>({});

  const { data: allTrips, isLoading, refetch } = useQuery({
    queryKey: ["carpool", "trips", searchParams],
    queryFn: () => carpoolService.searchTrips(searchParams),
  });

  // Filter out user's own trips
  const trips = allTrips?.filter((trip: CarpoolTrip) => trip.driverId !== user?.id);

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "EEE d MMM", { locale: fr });
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "HH:mm");
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen page-transition">
        {/* Hero Section with Search */}
        <section className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background py-16 overflow-hidden">
          <div className="absolute inset-0 pattern-dots opacity-30" />
          <div className="absolute top-10 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

          <div className="container relative px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center mb-10 animate-fade-in">
              <Badge className="mb-4 px-4 py-1.5 bg-primary/10 text-primary border-primary/20 animate-bounce-subtle">
                <Sparkles className="w-4 h-4 mr-2" />
                Covoiturage
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Trouvez votre <span className="text-gradient">trajet idéal</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Voyagez à travers le Sénégal en partageant les frais
              </p>
            </div>

            {/* Search Form */}
            <Card className="max-w-4xl mx-auto shadow-elevated border-0 overflow-hidden animate-slide-up">
              <CardContent className="p-6">
                <form onSubmit={handleSearch}>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="space-y-2">
                      <Label htmlFor="from" className="text-sm font-medium flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        Départ
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Entrez votre ville de départ</p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <Input
                        id="from"
                        placeholder="Ex: Dakar"
                        value={searchParams.from || ""}
                        onChange={(e) => setSearchParams({ ...searchParams, from: e.target.value })}
                        className="h-12 bg-muted/50 border-0 transition-all duration-200 focus:scale-[1.02] focus:shadow-md"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="to" className="text-sm font-medium flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-secondary" />
                        Arrivée
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Entrez votre destination</p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <Input
                        id="to"
                        placeholder="Ex: Thiès"
                        value={searchParams.to || ""}
                        onChange={(e) => setSearchParams({ ...searchParams, to: e.target.value })}
                        className="h-12 bg-muted/50 border-0 transition-all duration-200 focus:scale-[1.02] focus:shadow-md"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date" className="text-sm font-medium flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        Date
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        value={searchParams.date || ""}
                        onChange={(e) => setSearchParams({ ...searchParams, date: e.target.value })}
                        className="h-12 bg-muted/50 border-0 transition-all duration-200 focus:scale-[1.02] focus:shadow-md"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button type="submit" className="w-full h-12 gap-2 shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-transform">
                        <Search className="h-4 w-4" />
                        Rechercher
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Results Section */}
        <section className="py-12">
          <div className="container px-4 sm:px-6 lg:px-8">
            {/* User Tips */}
            {!isAuthenticated && (
              <div className="mb-8 animate-fade-in">
                <TipCard
                  variant="info"
                  title="Connectez-vous pour réserver"
                  dismissible
                >
                  <p>
                    Créez un compte gratuit pour réserver vos trajets et proposer les vôtres.
                    C&apos;est simple et rapide !
                  </p>
                </TipCard>
              </div>
            )}

            {isAuthenticated && trips?.length === 0 && (
              <div className="mb-8 animate-fade-in">
                <TipCard
                  variant="default"
                  title="Proposez votre trajet"
                  icon={<Zap className="h-5 w-5 text-primary" />}
                  dismissible
                >
                  <p>
                    Vous avez un véhicule ? Proposez votre trajet et partagez les frais avec d&apos;autres voyageurs.
                    Cliquez sur &quot;Proposer un trajet&quot; pour commencer.
                  </p>
                </TipCard>
              </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div className="animate-fade-in">
                <h2 className="text-2xl font-bold">
                  {trips?.length || 0} trajet{(trips?.length || 0) > 1 ? "s" : ""} disponible{(trips?.length || 0) > 1 ? "s" : ""}
                </h2>
                <p className="text-muted-foreground">
                  Résultats pour votre recherche
                </p>
              </div>
              <div className="flex gap-3 animate-fade-in">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 hover:scale-105 transition-transform">
                      <Filter className="h-4 w-4" />
                      Filtres
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Filtrer les résultats par prix, heure, etc.</p>
                  </TooltipContent>
                </Tooltip>
                {isAuthenticated && (
                  <Link href="/carpool/create">
                    <Button className="gap-2 shadow-glow hover:scale-105 active:scale-95 transition-transform">
                      <Plus className="h-4 w-4" />
                      Proposer un trajet
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Trips List */}
            <div className="space-y-4">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className={`border-0 shadow-soft card-enter stagger-${i + 1}`}>
                    <CardContent className="p-6">
                      <div className="flex gap-6">
                        <Skeleton className="h-20 w-32 rounded-xl skeleton-animated" />
                        <div className="flex-1 space-y-3">
                          <Skeleton className="h-6 w-48 skeleton-animated" />
                          <Skeleton className="h-4 w-32 skeleton-animated" />
                          <Skeleton className="h-4 w-24 skeleton-animated" />
                        </div>
                        <Skeleton className="h-12 w-32 skeleton-animated" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : trips && trips.length > 0 ? (
                trips.map((trip: CarpoolTrip, index: number) => (
                  <Link href={`/carpool/${trip.id}`} key={trip.id}>
                    <Card 
                      className={`group border-0 shadow-soft hover-lift cursor-pointer overflow-hidden card-enter`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                          {/* Left colored bar */}
                          <div className="hidden md:block w-2 bg-gradient-to-b from-primary to-secondary" />

                        <div className="flex-1 p-6">
                          <div className="flex flex-col md:flex-row md:items-center gap-6">
                            {/* Route info */}
                            <div className="flex-1">
                              <div className="flex items-start gap-4">
                                <div className="flex flex-col items-center py-1">
                                  <div className="w-3 h-3 rounded-full bg-primary ring-4 ring-primary/20" />
                                  <div className="w-0.5 h-12 bg-gradient-to-b from-primary to-secondary" />
                                  <div className="w-3 h-3 rounded-full bg-secondary ring-4 ring-secondary/20" />
                                </div>
                                <div className="flex-1 space-y-3">
                                  <div>
                                    <p className="font-semibold text-lg">{trip.departureCity}</p>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                      <Clock className="h-3.5 w-3.5" />
                                      {formatTime(trip.departureTime)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="font-semibold text-lg">{trip.arrivalCity}</p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Date */}
                            <div className="flex md:flex-col items-center gap-2 md:gap-0 md:text-center px-4 md:border-l md:border-r border-border/50">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <p className="font-medium capitalize">
                                {formatDate(trip.departureTime)}
                              </p>
                            </div>

                            {/* Driver */}
                            <div className="flex items-center gap-3">
                              <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                                <AvatarImage src={trip.driver?.photoUrl} />
                                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                                  {getInitials(trip.driver?.firstName, trip.driver?.lastName)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {trip.driver?.firstName}
                                </p>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                  <span>4.8</span>
                                </div>
                              </div>
                            </div>

                            {/* Price & Seats */}
                            <div className="flex items-center gap-6 md:gap-8">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                  <span className="font-semibold text-primary">{trip.availableSeats}</span>
                                  <span className="text-muted-foreground"> place{trip.availableSeats > 1 ? "s" : ""}</span>
                                </span>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-primary">
                                  {trip.pricePerSeat.toLocaleString()}
                                </p>
                                <p className="text-xs text-muted-foreground">FCFA/place</p>
                              </div>
                              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <Card className="border-0 shadow-soft">
                <CardContent className="p-16 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Aucun trajet trouvé</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Il n&apos;y a pas de trajets correspondant à votre recherche pour le moment.
                    Soyez le premier à proposer ce trajet !
                  </p>
                  {isAuthenticated && (
                    <Link href="/carpool/create">
                      <Button className="gap-2 shadow-glow">
                        <Plus className="h-4 w-4" />
                        Proposer un trajet
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>
      </div>
    </TooltipProvider>
  );
}

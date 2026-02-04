"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/providers";
import { vehiclesService, carpoolService, rentalService } from "@/lib/services";
import {
  Car,
  Plus,
  Navigation,
  Key,
  ChevronRight,
  Users,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Clock,
  TrendingUp,
  Eye,
  Wallet,
  Star,
  Sparkles,
  ArrowUpRight,
  Zap,
} from "lucide-react";
import { VehicleStatus, CarpoolTripStatus } from "@/types";

export default function ProprietaireDashboardPage() {
  const { user } = useAuth();

  const { data: vehicles, isLoading: vehiclesLoading } = useQuery({
    queryKey: ["vehicles", "mine"],
    queryFn: vehiclesService.getMyVehicles,
  });

  const { data: myTrips, isLoading: tripsLoading } = useQuery({
    queryKey: ["carpool", "trips", "mine"],
    queryFn: carpoolService.getMyTrips,
  });

  const { data: myOffers, isLoading: offersLoading } = useQuery({
    queryKey: ["rental", "offers", "mine"],
    queryFn: rentalService.getMyOffers,
  });

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Stats
  const totalVehicles = vehicles?.length || 0;
  const approvedVehicles = vehicles?.filter((v: any) => v.status === VehicleStatus.APPROVED).length || 0;
  const pendingVehicles = vehicles?.filter((v: any) => v.status === VehicleStatus.PENDING).length || 0;
  const activeTrips = myTrips?.filter((t: any) => t.status === CarpoolTripStatus.OPEN).length || 0;
  const activeOffers = myOffers?.filter((o: any) => o.isActive).length || 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 p-8 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-16 w-16 ring-4 ring-white/30">
              <AvatarImage src={user?.photoUrl} />
              <AvatarFallback className="text-lg bg-white/20 text-white">
                {getInitials(user?.firstName, user?.lastName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">
                Bonjour, {user?.firstName} !
              </h1>
              <p className="text-white/80">Bienvenue dans votre espace propriétaire</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full backdrop-blur">
              <Star className="h-4 w-4" />
              <span className="text-sm font-medium">4.9 Note moyenne</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full backdrop-blur">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-medium">Profil vérifié</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/proprietaire/vehicules/nouveau" className="group">
          <Card className="h-full border-2 border-dashed border-amber-500/30 hover:border-amber-500 hover:bg-amber-500/5 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10 hover:-translate-y-1">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25 group-hover:scale-110 transition-transform">
                <Car className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-lg">Ajouter un véhicule</p>
                <p className="text-sm text-muted-foreground">Enregistrez un nouveau véhicule</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500 transition-colors">
                <Plus className="h-5 w-5 text-amber-500 group-hover:text-white transition-colors" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/proprietaire/trajets/nouveau" className="group">
          <Card className="h-full border-2 border-dashed border-green-500/30 hover:border-green-500 hover:bg-green-500/5 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10 hover:-translate-y-1">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/25 group-hover:scale-110 transition-transform">
                <Navigation className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-lg">Proposer un trajet</p>
                <p className="text-sm text-muted-foreground">Créez un nouveau covoiturage</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center group-hover:bg-green-500 transition-colors">
                <Plus className="h-5 w-5 text-green-500 group-hover:text-white transition-colors" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/proprietaire/locations/nouvelle" className="group">
          <Card className="h-full border-2 border-dashed border-purple-500/30 hover:border-purple-500 hover:bg-purple-500/5 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:scale-110 transition-transform">
                <Key className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-lg">Mettre en location</p>
                <p className="text-sm text-muted-foreground">Proposez votre véhicule</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500 transition-colors">
                <Plus className="h-5 w-5 text-purple-500 group-hover:text-white transition-colors" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Car className="h-6 w-6 text-amber-500" />
              </div>
              <Badge variant="secondary" className="bg-amber-500/10 text-amber-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +2
              </Badge>
            </div>
            <p className="text-3xl font-bold">{totalVehicles}</p>
            <p className="text-sm text-muted-foreground">Véhicules</p>
            {pendingVehicles > 0 && (
              <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {pendingVehicles} en attente
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Navigation className="h-6 w-6 text-green-500" />
              </div>
              <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                Actif
              </Badge>
            </div>
            <p className="text-3xl font-bold">{activeTrips}</p>
            <p className="text-sm text-muted-foreground">Trajets ouverts</p>
            <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Disponibles
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Key className="h-6 w-6 text-purple-500" />
              </div>
              <Badge variant="secondary" className="bg-purple-500/10 text-purple-600">
                <Eye className="h-3 w-3 mr-1" />
                En ligne
              </Badge>
            </div>
            <p className="text-3xl font-bold">{activeOffers}</p>
            <p className="text-sm text-muted-foreground">Locations actives</p>
            <p className="text-xs text-purple-600 mt-2 flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Visibles
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-blue-500" />
              </div>
              <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">
                Prêt
              </Badge>
            </div>
            <p className="text-3xl font-bold">{approvedVehicles}</p>
            <p className="text-sm text-muted-foreground">Approuvés</p>
            <Progress value={(approvedVehicles / (totalVehicles || 1)) * 100} className="mt-2 h-1" />
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Mes Véhicules */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-3 bg-gradient-to-r from-amber-500/5 to-orange-500/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Car className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <CardTitle>Mes véhicules</CardTitle>
                  <CardDescription>Vos véhicules enregistrés</CardDescription>
                </div>
              </div>
              <Link href="/proprietaire/vehicules">
                <Button variant="ghost" size="sm" className="gap-1 text-amber-600 hover:text-amber-700 hover:bg-amber-500/10">
                  Voir tout
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {vehiclesLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
              </div>
            ) : vehicles && vehicles.length > 0 ? (
              <div className="space-y-3">
                {vehicles.slice(0, 3).map((vehicle: any, index: number) => (
                  <Link key={vehicle.id} href={`/proprietaire/vehicules/${vehicle.id}`}>
                    <div
                      className="flex items-center gap-4 p-4 rounded-xl border hover:border-amber-500/50 hover:bg-amber-500/5 transition-all cursor-pointer group"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center overflow-hidden">
                        {vehicle.photos?.[0] ? (
                          <img src={vehicle.photos[0].url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <Car className="h-8 w-8 text-amber-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold group-hover:text-amber-600 transition-colors truncate">
                          {vehicle.brand} {vehicle.model}
                        </p>
                        <p className="text-sm text-muted-foreground">{vehicle.licensePlate}</p>
                      </div>
                      <Badge variant={
                        vehicle.status === VehicleStatus.APPROVED ? "default" :
                        vehicle.status === VehicleStatus.PENDING ? "secondary" : "destructive"
                      } className="shrink-0">
                        {vehicle.status === VehicleStatus.APPROVED ? "Approuvé" :
                         vehicle.status === VehicleStatus.PENDING ? "En attente" : "Refusé"}
                      </Badge>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="h-16 w-16 mx-auto rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4">
                  <Car className="h-8 w-8 text-amber-500/50" />
                </div>
                <p className="text-muted-foreground mb-4">Aucun véhicule enregistré</p>
                <Link href="/proprietaire/vehicules/nouveau">
                  <Button size="sm" className="bg-amber-500 hover:bg-amber-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un véhicule
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mes Trajets */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-3 bg-gradient-to-r from-green-500/5 to-emerald-500/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Navigation className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <CardTitle>Mes trajets</CardTitle>
                  <CardDescription>Vos trajets de covoiturage</CardDescription>
                </div>
              </div>
              <Link href="/proprietaire/trajets">
                <Button variant="ghost" size="sm" className="gap-1 text-green-600 hover:text-green-700 hover:bg-green-500/10">
                  Voir tout
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {tripsLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
              </div>
            ) : myTrips && myTrips.length > 0 ? (
              <div className="space-y-3">
                {myTrips.slice(0, 3).map((trip: any, index: number) => (
                  <Link key={trip.id} href={`/proprietaire/trajets/${trip.id}`}>
                    <div
                      className="flex items-center gap-4 p-4 rounded-xl border hover:border-green-500/50 hover:bg-green-500/5 transition-all cursor-pointer group"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                        <Navigation className="h-8 w-8 text-green-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold group-hover:text-green-600 transition-colors flex items-center gap-2">
                          {trip.departureCity}
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          {trip.arrivalCity}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {formatDate(trip.departureTime)}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-green-600">{trip.pricePerSeat?.toLocaleString()} FCFA</p>
                        <p className="text-xs text-muted-foreground">{trip.availableSeats} places</p>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="h-16 w-16 mx-auto rounded-2xl bg-green-500/10 flex items-center justify-center mb-4">
                  <Navigation className="h-8 w-8 text-green-500/50" />
                </div>
                <p className="text-muted-foreground mb-4">Aucun trajet créé</p>
                <Link href="/proprietaire/trajets/nouveau">
                  <Button size="sm" className="bg-green-500 hover:bg-green-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Proposer un trajet
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mes Offres de Location - Full Width */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3 bg-gradient-to-r from-purple-500/5 to-violet-500/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Key className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <CardTitle>Mes offres de location</CardTitle>
                <CardDescription>Vos véhicules en location</CardDescription>
              </div>
            </div>
            <Link href="/proprietaire/locations">
              <Button variant="ghost" size="sm" className="gap-1 text-purple-600 hover:text-purple-700 hover:bg-purple-500/10">
                Voir tout
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {offersLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
            </div>
          ) : myOffers && myOffers.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myOffers.slice(0, 6).map((offer: any, index: number) => (
                <Link key={offer.id} href={`/proprietaire/locations/${offer.id}`}>
                  <div
                    className="relative p-4 rounded-xl border hover:border-purple-500/50 hover:bg-purple-500/5 transition-all cursor-pointer group overflow-hidden"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
                    <div className="relative flex items-start gap-4">
                      <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-purple-100 to-violet-100 flex items-center justify-center overflow-hidden shrink-0">
                        {offer.vehicle?.photos?.[0] ? (
                          <img src={offer.vehicle.photos[0].url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <Key className="h-10 w-10 text-purple-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold group-hover:text-purple-600 transition-colors truncate">
                          {offer.vehicle?.brand} {offer.vehicle?.model}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={offer.isActive ? "default" : "secondary"} className="text-xs">
                            {offer.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-lg font-bold text-purple-600 mt-2">
                          {offer.pricePerDay?.toLocaleString()} FCFA
                          <span className="text-xs font-normal text-muted-foreground">/jour</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="h-16 w-16 mx-auto rounded-2xl bg-purple-500/10 flex items-center justify-center mb-4">
                <Key className="h-8 w-8 text-purple-500/50" />
              </div>
              <p className="text-muted-foreground mb-4">Aucune offre de location</p>
              <Link href="/proprietaire/locations/nouvelle">
                <Button size="sm" className="bg-purple-500 hover:bg-purple-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Mettre en location
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

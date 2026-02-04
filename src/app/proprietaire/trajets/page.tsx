"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { carpoolService } from "@/lib/services";
import { CarpoolTrip, CarpoolTripStatus } from "@/types";
import {
  Navigation,
  Plus,
  Search,
  Users,
  Calendar,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Clock,
  XCircle,
  Ban,
  ArrowUpRight,
  Filter,
  Sparkles,
  TrendingUp,
  Eye,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function ProprietaireTrajetsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: trips, isLoading } = useQuery({
    queryKey: ["carpool", "trips", "mine"],
    queryFn: carpoolService.getMyTrips,
  });

  const getStatusConfig = (status: CarpoolTripStatus) => {
    switch (status) {
      case CarpoolTripStatus.OPEN:
        return {
          label: "Ouvert",
          icon: CheckCircle2,
          color: "text-green-600",
          bgColor: "bg-green-500/10",
          borderColor: "border-green-500",
        };
      case CarpoolTripStatus.FULL:
        return {
          label: "Complet",
          icon: Users,
          color: "text-blue-600",
          bgColor: "bg-blue-500/10",
          borderColor: "border-blue-500",
        };
      case CarpoolTripStatus.CANCELLED:
        return {
          label: "Annulé",
          icon: XCircle,
          color: "text-red-600",
          bgColor: "bg-red-500/10",
          borderColor: "border-red-500",
        };
      case CarpoolTripStatus.COMPLETED:
        return {
          label: "Terminé",
          icon: CheckCircle2,
          color: "text-gray-600",
          bgColor: "bg-gray-500/10",
          borderColor: "border-gray-500",
        };
    }
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "EEE d MMM à HH:mm", { locale: fr });
  };

  const formatDateFull = (dateString: string) => {
    return format(new Date(dateString), "EEEE d MMMM yyyy", { locale: fr });
  };

  const filteredTrips = trips?.filter((t: CarpoolTrip) => {
    const matchesSearch =
      t.departureCity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.arrivalCity.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openTrips = trips?.filter((t: CarpoolTrip) => t.status === CarpoolTripStatus.OPEN) || [];
  const completedTrips = trips?.filter((t: CarpoolTrip) => t.status === CarpoolTripStatus.COMPLETED) || [];
  const cancelledTrips = trips?.filter((t: CarpoolTrip) => t.status === CarpoolTripStatus.CANCELLED) || [];

  // Calculate total earnings (simplified)
  const totalEarnings = completedTrips.reduce((acc: number, t: CarpoolTrip) => {
    const reservedSeats = (t.vehicle?.numberOfSeats || 5) - 1 - t.availableSeats;
    return acc + (reservedSeats * t.pricePerSeat);
  }, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Navigation className="h-5 w-5 text-green-500" />
            </div>
            Mes trajets
          </h1>
          <p className="text-muted-foreground mt-1">Gérez vos trajets de covoiturage</p>
        </div>
        <Link href="/proprietaire/trajets/nouveau">
          <Button className="gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-500/25">
            <Plus className="h-4 w-4" />
            Nouveau trajet
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
          <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
          <CardContent className="p-4 relative">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{openTrips.length}</p>
                <p className="text-sm text-muted-foreground">Trajets ouverts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
          <CardContent className="p-4 relative">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Eye className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{trips?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Total trajets</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-l-4 border-l-gray-500">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gray-500/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
          <CardContent className="p-4 relative">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gray-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-gray-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedTrips.length}</p>
                <p className="text-sm text-muted-foreground">Terminés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-l-4 border-l-amber-500">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
          <CardContent className="p-4 relative">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">{totalEarnings.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">FCFA gagnés</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-soft">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par ville..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 bg-muted/50 border-0"
              />
            </div>
            <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full md:w-auto">
              <TabsList className="grid grid-cols-4 w-full md:w-auto">
                <TabsTrigger value="all" className="text-xs md:text-sm">Tous</TabsTrigger>
                <TabsTrigger value={CarpoolTripStatus.OPEN} className="text-xs md:text-sm">Ouverts</TabsTrigger>
                <TabsTrigger value={CarpoolTripStatus.COMPLETED} className="text-xs md:text-sm">Terminés</TabsTrigger>
                <TabsTrigger value={CarpoolTripStatus.CANCELLED} className="text-xs md:text-sm">Annulés</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Trips List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : filteredTrips && filteredTrips.length > 0 ? (
        <div className="space-y-4">
          {filteredTrips.map((trip: CarpoolTrip, index: number) => {
            const statusConfig = getStatusConfig(trip.status);
            const StatusIcon = statusConfig.icon;
            const reservedSeats = (trip.vehicle?.numberOfSeats || 5) - 1 - trip.availableSeats;

            return (
              <Link key={trip.id} href={`/carpool/${trip.id}`}>
                <Card
                  className={`group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 ${statusConfig.borderColor} hover:-translate-y-1`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      {/* Left colored section */}
                      <div className={`hidden md:flex w-2 ${statusConfig.bgColor.replace('/10', '')}`} />

                      <div className="flex-1 p-5">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                          {/* Route info */}
                          <div className="flex items-start gap-4 flex-1">
                            <div className="flex flex-col items-center py-1">
                              <div className="w-3 h-3 rounded-full bg-green-500 ring-4 ring-green-500/20" />
                              <div className="w-0.5 h-10 bg-gradient-to-b from-green-500 to-red-500" />
                              <div className="w-3 h-3 rounded-full bg-red-500 ring-4 ring-red-500/20" />
                            </div>
                            <div className="flex-1 space-y-2">
                              <div>
                                <p className="font-semibold text-lg group-hover:text-green-600 transition-colors">
                                  {trip.departureCity}
                                </p>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  {format(new Date(trip.departureTime), "HH:mm")}
                                </p>
                              </div>
                              <div>
                                <p className="font-semibold text-lg">{trip.arrivalCity}</p>
                              </div>
                            </div>
                          </div>

                          {/* Date */}
                          <div className="flex md:flex-col items-center gap-2 md:gap-0 md:text-center px-4 md:border-l md:border-r border-border/50">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium capitalize">
                                {format(new Date(trip.departureTime), "EEE d MMM", { locale: fr })}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(trip.departureTime), "yyyy")}
                              </p>
                            </div>
                          </div>

                          {/* Passengers */}
                          <div className="flex items-center gap-3 px-4 md:border-r border-border/50">
                            <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                              <Users className="h-6 w-6 text-green-500" />
                            </div>
                            <div>
                              <p className="font-medium">
                                <span className="text-green-600">{reservedSeats}</span>
                                <span className="text-muted-foreground"> / {(trip.vehicle?.numberOfSeats || 5) - 1}</span>
                              </p>
                              <p className="text-xs text-muted-foreground">Passagers</p>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-600">{trip.pricePerSeat.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">FCFA/place</p>
                          </div>

                          {/* Status & Arrow */}
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className={`gap-1 ${statusConfig.bgColor} ${statusConfig.color} border-0`}>
                              <StatusIcon className="h-3 w-3" />
                              {statusConfig.label}
                            </Badge>
                            <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-green-500 transition-colors" />
                          </div>
                        </div>

                        {/* Vehicle info */}
                        {trip.vehicle && (
                          <div className="mt-4 pt-4 border-t flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="h-6 w-6 rounded bg-muted flex items-center justify-center">
                              <Navigation className="h-3 w-3" />
                            </div>
                            {trip.vehicle.brand} {trip.vehicle.model} • {trip.vehicle.color}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <Card className="border-0 shadow-soft">
          <CardContent className="p-16 text-center">
            <div className="h-20 w-20 mx-auto rounded-2xl bg-green-500/10 flex items-center justify-center mb-6">
              <Navigation className="h-10 w-10 text-green-500/50" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {searchQuery || statusFilter !== "all" ? "Aucun résultat" : "Aucun trajet"}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {searchQuery || statusFilter !== "all"
                ? "Aucun trajet ne correspond à vos critères de recherche."
                : "Proposez votre premier trajet de covoiturage."}
            </p>
            {!searchQuery && statusFilter === "all" && (
              <Link href="/proprietaire/trajets/nouveau">
                <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-500/25">
                  <Plus className="h-4 w-4 mr-2" />
                  Proposer un trajet
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

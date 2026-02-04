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
import { vehiclesService } from "@/lib/services";
import { Vehicle, VehicleStatus } from "@/types";
import {
  Car,
  Plus,
  Search,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  ArrowUpRight,
  Filter,
  Grid3X3,
  List,
  Sparkles,
  Calendar,
  Navigation,
  Key,
} from "lucide-react";

export default function ProprietaireVehiculesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: vehicles, isLoading } = useQuery({
    queryKey: ["vehicles", "mine"],
    queryFn: vehiclesService.getMyVehicles,
  });

  const getStatusConfig = (status: VehicleStatus) => {
    switch (status) {
      case VehicleStatus.APPROVED:
        return {
          label: "Approuvé",
          variant: "default" as const,
          icon: CheckCircle2,
          color: "text-green-600",
          bgColor: "bg-green-500/10",
          borderColor: "border-green-500/30"
        };
      case VehicleStatus.PENDING:
        return {
          label: "En attente",
          variant: "secondary" as const,
          icon: Clock,
          color: "text-amber-600",
          bgColor: "bg-amber-500/10",
          borderColor: "border-amber-500/30"
        };
      case VehicleStatus.REJECTED:
        return {
          label: "Refusé",
          variant: "destructive" as const,
          icon: XCircle,
          color: "text-red-600",
          bgColor: "bg-red-500/10",
          borderColor: "border-red-500/30"
        };
    }
  };

  const filteredVehicles = vehicles?.filter((v: Vehicle) => {
    const matchesSearch =
      v.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.licensePlate.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const approvedVehicles = vehicles?.filter((v: Vehicle) => v.status === VehicleStatus.APPROVED) || [];
  const pendingVehicles = vehicles?.filter((v: Vehicle) => v.status === VehicleStatus.PENDING) || [];
  const rejectedVehicles = vehicles?.filter((v: Vehicle) => v.status === VehicleStatus.REJECTED) || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Car className="h-5 w-5 text-amber-500" />
            </div>
            Mes véhicules
          </h1>
          <p className="text-muted-foreground mt-1">Gérez vos véhicules enregistrés</p>
        </div>
        <Link href="/proprietaire/vehicules/nouveau">
          <Button className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/25">
            <Plus className="h-4 w-4" />
            Ajouter un véhicule
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
          <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
          <CardContent className="p-4 relative">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{approvedVehicles.length}</p>
                <p className="text-sm text-muted-foreground">Approuvés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-l-4 border-l-amber-500">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
          <CardContent className="p-4 relative">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">{pendingVehicles.length}</p>
                <p className="text-sm text-muted-foreground">En attente</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-l-4 border-l-red-500">
          <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
          <CardContent className="p-4 relative">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{rejectedVehicles.length}</p>
                <p className="text-sm text-muted-foreground">Refusés</p>
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
                placeholder="Rechercher un véhicule..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 bg-muted/50 border-0"
              />
            </div>
            <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full md:w-auto">
              <TabsList className="grid grid-cols-4 w-full md:w-auto">
                <TabsTrigger value="all" className="text-xs md:text-sm">Tous</TabsTrigger>
                <TabsTrigger value={VehicleStatus.APPROVED} className="text-xs md:text-sm">Approuvés</TabsTrigger>
                <TabsTrigger value={VehicleStatus.PENDING} className="text-xs md:text-sm">En attente</TabsTrigger>
                <TabsTrigger value={VehicleStatus.REJECTED} className="text-xs md:text-sm">Refusés</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex gap-1 border rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                className="h-9 w-9"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                className="h-9 w-9"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicles Grid/List */}
      {isLoading ? (
        <div className={viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className={viewMode === "grid" ? "h-80 rounded-2xl" : "h-28 rounded-xl"} />
          ))}
        </div>
      ) : filteredVehicles && filteredVehicles.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map((vehicle: Vehicle, index: number) => {
              const statusConfig = getStatusConfig(vehicle.status);
              const StatusIcon = statusConfig.icon;

              return (
                <Link key={vehicle.id} href={`/proprietaire/vehicules/${vehicle.id}`}>
                  <Card
                    className={`group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-0 shadow-soft ${statusConfig.borderColor} border-l-4`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Image */}
                    <div className="relative h-48 bg-gradient-to-br from-amber-100 to-orange-100 overflow-hidden">
                      {vehicle.photos && vehicle.photos.length > 0 ? (
                        <img
                          src={vehicle.photos[0].url}
                          alt={`${vehicle.brand} ${vehicle.model}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Car className="h-20 w-20 text-amber-300" />
                        </div>
                      )}
                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                      {/* Status Badge */}
                      <div className="absolute top-3 right-3">
                        <Badge variant={statusConfig.variant} className="gap-1 shadow-lg">
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig.label}
                        </Badge>
                      </div>

                      {/* Year Badge */}
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-white/90 text-foreground shadow-sm">
                          {vehicle.year}
                        </Badge>
                      </div>

                      {/* Photo count */}
                      {vehicle.photos && vehicle.photos.length > 1 && (
                        <div className="absolute bottom-3 right-3 px-2 py-1 rounded-full bg-black/50 text-white text-xs backdrop-blur">
                          +{vehicle.photos.length - 1} photos
                        </div>
                      )}
                    </div>

                    <CardContent className="p-5">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-xl font-bold group-hover:text-amber-600 transition-colors">
                            {vehicle.brand} {vehicle.model}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {vehicle.color} • {vehicle.licensePlate}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Users className="h-4 w-4" />
                            {vehicle.numberOfSeats} places
                          </div>
                          {vehicle.isForCarpooling && (
                            <Badge variant="outline" className="text-xs gap-1 bg-green-500/5 border-green-500/30 text-green-600">
                              <Navigation className="h-3 w-3" />
                              Covoiturage
                            </Badge>
                          )}
                          {vehicle.isForRental && (
                            <Badge variant="outline" className="text-xs gap-1 bg-purple-500/5 border-purple-500/30 text-purple-600">
                              <Key className="h-3 w-3" />
                              Location
                            </Badge>
                          )}
                        </div>

                        {vehicle.status === VehicleStatus.REJECTED && vehicle.adminComment && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{vehicle.adminComment}</span>
                          </div>
                        )}

                        {/* Action hint */}
                        <div className="pt-3 border-t flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Voir les détails</span>
                          <ArrowUpRight className="h-4 w-4 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredVehicles.map((vehicle: Vehicle, index: number) => {
              const statusConfig = getStatusConfig(vehicle.status);
              const StatusIcon = statusConfig.icon;

              return (
                <Link key={vehicle.id} href={`/proprietaire/vehicules/${vehicle.id}`}>
                  <Card
                    className={`group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 ${statusConfig.borderColor}`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CardContent className="p-0">
                      <div className="flex items-stretch">
                        <div className="w-40 h-32 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center overflow-hidden">
                          {vehicle.photos && vehicle.photos.length > 0 ? (
                            <img
                              src={vehicle.photos[0].url}
                              alt={`${vehicle.brand} ${vehicle.model}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <Car className="h-12 w-12 text-amber-400" />
                          )}
                        </div>
                        <div className="flex-1 p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold group-hover:text-amber-600 transition-colors">
                                {vehicle.brand} {vehicle.model}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {vehicle.color} • {vehicle.licensePlate} • {vehicle.year}
                              </p>
                            </div>
                            <Badge variant={statusConfig.variant} className="gap-1">
                              <StatusIcon className="h-3 w-3" />
                              {statusConfig.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Users className="h-4 w-4" />
                              {vehicle.numberOfSeats} places
                            </div>
                            {vehicle.isForCarpooling && (
                              <Badge variant="outline" className="text-xs">Covoiturage</Badge>
                            )}
                            {vehicle.isForRental && (
                              <Badge variant="outline" className="text-xs">Location</Badge>
                            )}
                          </div>
                          {vehicle.status === VehicleStatus.REJECTED && vehicle.adminComment && (
                            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700 flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                              {vehicle.adminComment}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center px-4">
                          <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-amber-500 transition-colors" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )
      ) : (
        <Card className="border-0 shadow-soft">
          <CardContent className="p-16 text-center">
            <div className="h-20 w-20 mx-auto rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6">
              <Car className="h-10 w-10 text-amber-500/50" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {searchQuery || statusFilter !== "all" ? "Aucun résultat" : "Aucun véhicule"}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {searchQuery || statusFilter !== "all"
                ? "Aucun véhicule ne correspond à vos critères de recherche."
                : "Ajoutez votre premier véhicule pour commencer à proposer des trajets ou le mettre en location."}
            </p>
            {!searchQuery && statusFilter === "all" && (
              <Link href="/proprietaire/vehicules/nouveau">
                <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/25">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un véhicule
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

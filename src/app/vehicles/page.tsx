"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { vehiclesService } from "@/lib/services";
import { Vehicle, VehicleStatus } from "@/types";
import { Car, Plus, ArrowRight, Users, Calendar } from "lucide-react";
import { useAuth } from "@/providers";

export default function VehiclesPage() {
  const { isAuthenticated } = useAuth();

  const { data: vehicles, isLoading } = useQuery({
    queryKey: ["vehicles", "mine"],
    queryFn: vehiclesService.getMyVehicles,
    enabled: isAuthenticated,
  });

  const getStatusBadge = (status: VehicleStatus) => {
    switch (status) {
      case VehicleStatus.PENDING:
        return <Badge variant="warning">En attente</Badge>;
      case VehicleStatus.APPROVED:
        return <Badge variant="success">Approuvé</Badge>;
      case VehicleStatus.REJECTED:
        return <Badge variant="destructive">Refusé</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Connexion requise</h1>
        <Link href="/login">
          <Button>Se connecter</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Mes véhicules</h1>
          <p className="text-muted-foreground">
            Gérez vos véhicules pour le covoiturage et la location
          </p>
        </div>
        <Link href="/vehicles/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Ajouter un véhicule
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-32 w-full rounded-lg" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))
        ) : vehicles && vehicles.length > 0 ? (
          vehicles.map((vehicle: Vehicle) => (
            <Card key={vehicle.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="p-0">
                <div className="relative h-32 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  {vehicle.photos && vehicle.photos.length > 0 ? (
                    <img
                      src={vehicle.photos[0].url}
                      alt={`${vehicle.brand} ${vehicle.model}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Car className="h-12 w-12 text-blue-400" />
                  )}
                  <div className="absolute top-3 right-3">
                    {getStatusBadge(vehicle.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="text-lg mb-2">
                  {vehicle.brand} {vehicle.model}
                </CardTitle>
                <p className="text-sm text-muted-foreground mb-3">
                  {vehicle.color} • {vehicle.licensePlate}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{vehicle.numberOfSeats} places</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{vehicle.year}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  {vehicle.isForCarpooling && (
                    <Badge variant="outline" className="text-xs">Covoiturage</Badge>
                  )}
                  {vehicle.isForRental && (
                    <Badge variant="outline" className="text-xs">Location</Badge>
                  )}
                </div>
                {vehicle.status === VehicleStatus.REJECTED && vehicle.adminComment && (
                  <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                    {vehicle.adminComment}
                  </div>
                )}
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Link href={`/vehicles/${vehicle.id}`} className="w-full">
                  <Button variant="outline" className="w-full gap-1">
                    Gérer
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-12 text-center">
                <Car className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun véhicule</h3>
                <p className="text-muted-foreground mb-4">
                  Ajoutez votre premier véhicule pour commencer
                </p>
                <Link href="/vehicles/create">
                  <Button>Ajouter un véhicule</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

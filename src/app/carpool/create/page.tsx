"use client";

import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { vehiclesService, carpoolService } from "@/lib/services";
import { useAuth } from "@/providers";
import { toast } from "sonner";
import { ArrowLeft, Car } from "lucide-react";
import Link from "next/link";
import { Vehicle, VehicleStatus } from "@/types";

const createTripSchema = z.object({
  vehicleId: z.string().min(1, "Sélectionnez un véhicule"),
  departureCity: z.string().min(1, "Ville de départ requise"),
  arrivalCity: z.string().min(1, "Ville d'arrivée requise"),
  departureTime: z.string().min(1, "Date et heure requises"),
  pricePerSeat: z.coerce.number().min(100, "Prix minimum 100 FCFA"),
  availableSeats: z.coerce.number().min(1, "Minimum 1 place"),
});

type CreateTripForm = {
  vehicleId: string;
  departureCity: string;
  arrivalCity: string;
  departureTime: string;
  pricePerSeat: number;
  availableSeats: number;
};

export default function CreateTripPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const { data: vehicles, isLoading: vehiclesLoading } = useQuery({
    queryKey: ["vehicles", "mine"],
    queryFn: vehiclesService.getMyVehicles,
    enabled: isAuthenticated,
  });

  const approvedCarpoolVehicles = vehicles?.filter(
    (v: Vehicle) => v.status === VehicleStatus.APPROVED && v.isForCarpooling
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateTripForm>({
    resolver: zodResolver(createTripSchema) as any,
  });

  const selectedVehicleId = watch("vehicleId");
  const selectedVehicle = approvedCarpoolVehicles?.find((v: Vehicle) => v.id === selectedVehicleId);

  const createMutation = useMutation({
    mutationFn: carpoolService.createTrip,
    onSuccess: (data) => {
      toast.success("Trajet créé avec succès !");
      router.push(`/carpool/${data.id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la création");
    },
  });

  const onSubmit = (data: CreateTripForm) => {
    createMutation.mutate({
      ...data,
      departureTime: new Date(data.departureTime).toISOString(),
    });
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
    <div className="container py-8 max-w-2xl">
      <Link href="/carpool" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" />
        Retour aux trajets
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Proposer un trajet</CardTitle>
          <CardDescription>
            Partagez votre trajet avec d&apos;autres voyageurs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="vehicleId">Véhicule</Label>
              {vehiclesLoading ? (
                <p className="text-sm text-muted-foreground">Chargement...</p>
              ) : approvedCarpoolVehicles && approvedCarpoolVehicles.length > 0 ? (
                <Select onValueChange={(value) => setValue("vehicleId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un véhicule" />
                  </SelectTrigger>
                  <SelectContent>
                    {approvedCarpoolVehicles.map((vehicle: Vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4" />
                          {vehicle.brand} {vehicle.model} - {vehicle.licensePlate}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">
                    Vous n&apos;avez pas de véhicule approuvé pour le covoiturage.
                  </p>
                  <Link href="/vehicles/create">
                    <Button variant="outline" size="sm">
                      Ajouter un véhicule
                    </Button>
                  </Link>
                </div>
              )}
              {errors.vehicleId && (
                <p className="text-sm text-destructive">{errors.vehicleId.message}</p>
              )}
            </div>

            {selectedVehicle && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium">Places disponibles dans le véhicule</p>
                <p className="text-sm text-muted-foreground">
                  {selectedVehicle.numberOfSeats - 1} places passagers (hors conducteur)
                </p>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="departureCity">Ville de départ</Label>
                <Input
                  id="departureCity"
                  placeholder="Ex: Dakar"
                  {...register("departureCity")}
                />
                {errors.departureCity && (
                  <p className="text-sm text-destructive">{errors.departureCity.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="arrivalCity">Ville d&apos;arrivée</Label>
                <Input
                  id="arrivalCity"
                  placeholder="Ex: Thiès"
                  {...register("arrivalCity")}
                />
                {errors.arrivalCity && (
                  <p className="text-sm text-destructive">{errors.arrivalCity.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="departureTime">Date et heure de départ</Label>
              <Input
                id="departureTime"
                type="datetime-local"
                {...register("departureTime")}
              />
              {errors.departureTime && (
                <p className="text-sm text-destructive">{errors.departureTime.message}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pricePerSeat">Prix par place (FCFA)</Label>
                <Input
                  id="pricePerSeat"
                  type="number"
                  min={100}
                  step={100}
                  placeholder="2500"
                  {...register("pricePerSeat")}
                />
                {errors.pricePerSeat && (
                  <p className="text-sm text-destructive">{errors.pricePerSeat.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="availableSeats">Places disponibles</Label>
                <Input
                  id="availableSeats"
                  type="number"
                  min={1}
                  max={selectedVehicle ? selectedVehicle.numberOfSeats - 1 : 10}
                  placeholder="3"
                  {...register("availableSeats")}
                />
                {errors.availableSeats && (
                  <p className="text-sm text-destructive">{errors.availableSeats.message}</p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={createMutation.isPending || !approvedCarpoolVehicles?.length}
            >
              {createMutation.isPending ? "Création..." : "Créer le trajet"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

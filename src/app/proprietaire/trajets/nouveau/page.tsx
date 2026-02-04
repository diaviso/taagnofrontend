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
import { ArrowLeft, Car, Navigation, Info, MapPin, Calendar, Users, Coins } from "lucide-react";
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

type CreateTripForm = z.infer<typeof createTripSchema>;

export default function NouveauTrajetPage() {
  const router = useRouter();
  const { isAuthenticated, isProprietaire } = useAuth();

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

  if (!isAuthenticated || !isProprietaire) {
    router.push("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500/5 via-background to-emerald-500/5">
      <div className="container py-8 max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/proprietaire/trajets">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Proposer un trajet</h1>
            <p className="text-muted-foreground">Créez un nouveau covoiturage</p>
          </div>
        </div>

        <Card className="border-green-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5 text-green-500" />
              Détails du trajet
            </CardTitle>
            <CardDescription>
              Partagez votre trajet avec d'autres voyageurs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-muted-foreground" />
                  Véhicule
                </Label>
                {vehiclesLoading ? (
                  <p className="text-sm text-muted-foreground">Chargement...</p>
                ) : approvedCarpoolVehicles && approvedCarpoolVehicles.length > 0 ? (
                  <Select onValueChange={(value) => setValue("vehicleId", value)}>
                    <SelectTrigger className="border-green-500/20 focus:border-green-500">
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
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <p className="text-sm text-amber-700 dark:text-amber-300 mb-2">
                      Vous n'avez pas de véhicule approuvé pour le covoiturage.
                    </p>
                    <Link href="/proprietaire/vehicules/nouveau">
                      <Button variant="outline" size="sm" className="border-amber-500/30">
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
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">
                    Places disponibles: {selectedVehicle.numberOfSeats - 1} (hors conducteur)
                  </p>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-green-500" />
                    Ville de départ
                  </Label>
                  <Input
                    placeholder="Ex: Dakar"
                    {...register("departureCity")}
                    className="border-green-500/20 focus:border-green-500"
                  />
                  {errors.departureCity && (
                    <p className="text-sm text-destructive">{errors.departureCity.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-red-500" />
                    Ville d'arrivée
                  </Label>
                  <Input
                    placeholder="Ex: Thiès"
                    {...register("arrivalCity")}
                    className="border-green-500/20 focus:border-green-500"
                  />
                  {errors.arrivalCity && (
                    <p className="text-sm text-destructive">{errors.arrivalCity.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Date et heure de départ
                </Label>
                <Input
                  type="datetime-local"
                  {...register("departureTime")}
                  className="border-green-500/20 focus:border-green-500"
                />
                {errors.departureTime && (
                  <p className="text-sm text-destructive">{errors.departureTime.message}</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-muted-foreground" />
                    Prix par place (FCFA)
                  </Label>
                  <Input
                    type="number"
                    min={100}
                    step={100}
                    placeholder="2500"
                    {...register("pricePerSeat")}
                    className="border-green-500/20 focus:border-green-500"
                  />
                  {errors.pricePerSeat && (
                    <p className="text-sm text-destructive">{errors.pricePerSeat.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    Places disponibles
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={selectedVehicle ? selectedVehicle.numberOfSeats - 1 : 8}
                    placeholder="3"
                    {...register("availableSeats")}
                    className="border-green-500/20 focus:border-green-500"
                  />
                  {errors.availableSeats && (
                    <p className="text-sm text-destructive">{errors.availableSeats.message}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <Link href="/proprietaire/trajets" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    Annuler
                  </Button>
                </Link>
                <Button
                  type="submit"
                  className="flex-1 bg-green-500 hover:bg-green-600"
                  disabled={createMutation.isPending || !approvedCarpoolVehicles?.length}
                >
                  {createMutation.isPending ? "Création..." : "Créer le trajet"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

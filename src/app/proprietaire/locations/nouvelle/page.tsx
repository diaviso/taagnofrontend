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
import { vehiclesService, rentalService } from "@/lib/services";
import { useAuth } from "@/providers";
import { toast } from "sonner";
import { ArrowLeft, Car, Key, Info, Coins, Calendar } from "lucide-react";
import Link from "next/link";
import { Vehicle, VehicleStatus } from "@/types";

const createOfferSchema = z.object({
  vehicleId: z.string().min(1, "Sélectionnez un véhicule"),
  pricePerDay: z.coerce.number().min(1000, "Prix minimum 1000 FCFA"),
  depositAmount: z.coerce.number().min(0, "Caution invalide"),
  minDays: z.coerce.number().min(1, "Minimum 1 jour"),
});

type CreateOfferForm = z.infer<typeof createOfferSchema>;

export default function NouvelleLocationPage() {
  const router = useRouter();
  const { isAuthenticated, isProprietaire } = useAuth();

  const { data: vehicles, isLoading: vehiclesLoading } = useQuery({
    queryKey: ["vehicles", "mine"],
    queryFn: vehiclesService.getMyVehicles,
    enabled: isAuthenticated,
  });

  const approvedRentalVehicles = vehicles?.filter(
    (v: Vehicle) => v.status === VehicleStatus.APPROVED && v.isForRental
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateOfferForm>({
    resolver: zodResolver(createOfferSchema) as any,
    defaultValues: {
      minDays: 1,
      depositAmount: 50000,
    },
  });

  const selectedVehicleId = watch("vehicleId");
  const selectedVehicle = approvedRentalVehicles?.find((v: Vehicle) => v.id === selectedVehicleId);

  const createMutation = useMutation({
    mutationFn: rentalService.createOffer,
    onSuccess: (data) => {
      toast.success("Offre de location créée avec succès !");
      router.push(`/rental/${data.id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la création");
    },
  });

  const onSubmit = (data: CreateOfferForm) => {
    createMutation.mutate(data);
  };

  if (!isAuthenticated || !isProprietaire) {
    router.push("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500/5 via-background to-violet-500/5">
      <div className="container py-8 max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/proprietaire/locations">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Mettre en location</h1>
            <p className="text-muted-foreground">Créez une offre de location</p>
          </div>
        </div>

        <Card className="border-purple-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-purple-500" />
              Détails de l'offre
            </CardTitle>
            <CardDescription>
              Proposez votre véhicule à la location
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-muted-foreground" />
                  Véhicule à louer
                </Label>
                {vehiclesLoading ? (
                  <p className="text-sm text-muted-foreground">Chargement...</p>
                ) : approvedRentalVehicles && approvedRentalVehicles.length > 0 ? (
                  <Select onValueChange={(value) => setValue("vehicleId", value)}>
                    <SelectTrigger className="border-purple-500/20 focus:border-purple-500">
                      <SelectValue placeholder="Sélectionnez un véhicule" />
                    </SelectTrigger>
                    <SelectContent>
                      {approvedRentalVehicles.map((vehicle: Vehicle) => (
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
                      Vous n'avez pas de véhicule approuvé pour la location.
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
                <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center gap-4">
                  <div className="h-16 w-16 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    {selectedVehicle.photos?.[0] ? (
                      <img src={selectedVehicle.photos[0].url} alt="" className="h-full w-full object-cover rounded-lg" />
                    ) : (
                      <Car className="h-8 w-8 text-purple-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{selectedVehicle.brand} {selectedVehicle.model}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedVehicle.year} • {selectedVehicle.numberOfSeats} places • {selectedVehicle.color}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-muted-foreground" />
                  Prix par jour (FCFA)
                </Label>
                <Input
                  type="number"
                  min={1000}
                  step={500}
                  placeholder="25000"
                  {...register("pricePerDay")}
                  className="border-purple-500/20 focus:border-purple-500"
                />
                {errors.pricePerDay && (
                  <p className="text-sm text-destructive">{errors.pricePerDay.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-muted-foreground" />
                  Caution (FCFA)
                </Label>
                <Input
                  type="number"
                  min={0}
                  step={5000}
                  placeholder="50000"
                  {...register("depositAmount")}
                  className="border-purple-500/20 focus:border-purple-500"
                />
                <p className="text-xs text-muted-foreground">
                  Montant à verser par le locataire comme garantie
                </p>
                {errors.depositAmount && (
                  <p className="text-sm text-destructive">{errors.depositAmount.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Durée minimum (jours)
                </Label>
                <Input
                  type="number"
                  min={1}
                  max={30}
                  placeholder="1"
                  {...register("minDays")}
                  className="border-purple-500/20 focus:border-purple-500"
                />
                {errors.minDays && (
                  <p className="text-sm text-destructive">{errors.minDays.message}</p>
                )}
              </div>

              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 flex items-start gap-3">
                <Info className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-purple-800 dark:text-purple-200">Conseils</p>
                  <ul className="text-sm text-purple-700 dark:text-purple-300 list-disc list-inside space-y-1 mt-1">
                    <li>Fixez un prix compétitif par rapport au marché</li>
                    <li>La caution protège contre les dommages éventuels</li>
                    <li>Vous pouvez désactiver l'offre à tout moment</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-4">
                <Link href="/proprietaire/locations" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    Annuler
                  </Button>
                </Link>
                <Button
                  type="submit"
                  className="flex-1 bg-purple-500 hover:bg-purple-600"
                  disabled={createMutation.isPending || !approvedRentalVehicles?.length}
                >
                  {createMutation.isPending ? "Création..." : "Créer l'offre"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

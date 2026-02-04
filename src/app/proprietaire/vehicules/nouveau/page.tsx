"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { vehiclesService } from "@/lib/services";
import { useAuth } from "@/providers";
import { toast } from "sonner";
import { ArrowLeft, Car, Navigation, Key, CheckCircle2, Info } from "lucide-react";
import Link from "next/link";

const createVehicleSchema = z.object({
  brand: z.string().min(1, "Marque requise"),
  model: z.string().min(1, "Modèle requis"),
  year: z.coerce.number().min(1900, "Année invalide").max(new Date().getFullYear() + 1, "Année invalide"),
  color: z.string().min(1, "Couleur requise"),
  licensePlate: z.string().min(1, "Immatriculation requise"),
  numberOfSeats: z.coerce.number().min(2, "Minimum 2 places").max(9, "Maximum 9 places"),
  isForRental: z.boolean().default(false),
  isForCarpooling: z.boolean().default(true),
});

type CreateVehicleForm = z.infer<typeof createVehicleSchema>;

export default function NouveauVehiculePage() {
  const router = useRouter();
  const { isAuthenticated, isProprietaire } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateVehicleForm>({
    resolver: zodResolver(createVehicleSchema) as any,
    defaultValues: {
      isForRental: false,
      isForCarpooling: true,
    },
  });

  const isForRental = watch("isForRental");
  const isForCarpooling = watch("isForCarpooling");

  const createMutation = useMutation({
    mutationFn: vehiclesService.createVehicle,
    onSuccess: (data) => {
      toast.success("Véhicule ajouté avec succès ! En attente de validation.");
      router.push(`/proprietaire/vehicules/${data.id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la création");
    },
  });

  const onSubmit = (data: CreateVehicleForm) => {
    if (!data.isForRental && !data.isForCarpooling) {
      toast.error("Sélectionnez au moins une utilisation");
      return;
    }
    createMutation.mutate(data);
  };

  if (!isAuthenticated || !isProprietaire) {
    router.push("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-500/5 via-background to-orange-500/5">
      <div className="container py-8 max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/proprietaire/vehicules">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Ajouter un véhicule</h1>
            <p className="text-muted-foreground">Enregistrez un nouveau véhicule</p>
          </div>
        </div>

        <Card className="border-amber-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5 text-amber-500" />
              Informations du véhicule
            </CardTitle>
            <CardDescription>
              Votre véhicule sera soumis à validation avant de pouvoir être utilisé
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="brand">Marque *</Label>
                  <Input
                    id="brand"
                    placeholder="Ex: Peugeot, Toyota, Mercedes..."
                    {...register("brand")}
                    className="border-amber-500/20 focus:border-amber-500"
                  />
                  {errors.brand && <p className="text-sm text-destructive">{errors.brand.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Modèle *</Label>
                  <Input
                    id="model"
                    placeholder="Ex: 308, Corolla, Classe C..."
                    {...register("model")}
                    className="border-amber-500/20 focus:border-amber-500"
                  />
                  {errors.model && <p className="text-sm text-destructive">{errors.model.message}</p>}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="year">Année *</Label>
                  <Input
                    id="year"
                    type="number"
                    placeholder="2020"
                    {...register("year")}
                    className="border-amber-500/20 focus:border-amber-500"
                  />
                  {errors.year && <p className="text-sm text-destructive">{errors.year.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Couleur *</Label>
                  <Input
                    id="color"
                    placeholder="Ex: Gris, Noir, Blanc..."
                    {...register("color")}
                    className="border-amber-500/20 focus:border-amber-500"
                  />
                  {errors.color && <p className="text-sm text-destructive">{errors.color.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numberOfSeats">Nombre de places *</Label>
                  <Input
                    id="numberOfSeats"
                    type="number"
                    min={2}
                    max={9}
                    placeholder="5"
                    {...register("numberOfSeats")}
                    className="border-amber-500/20 focus:border-amber-500"
                  />
                  {errors.numberOfSeats && <p className="text-sm text-destructive">{errors.numberOfSeats.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="licensePlate">Immatriculation *</Label>
                <Input
                  id="licensePlate"
                  placeholder="Ex: DK-1234-AB"
                  {...register("licensePlate")}
                  className="border-amber-500/20 focus:border-amber-500"
                />
                {errors.licensePlate && <p className="text-sm text-destructive">{errors.licensePlate.message}</p>}
              </div>

              <div className="space-y-4">
                <Label>Utilisation du véhicule *</Label>
                <p className="text-sm text-muted-foreground">
                  Sélectionnez comment vous souhaitez utiliser ce véhicule
                </p>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      isForCarpooling
                        ? "border-green-500 bg-green-500/5"
                        : "border-muted hover:border-green-500/50"
                    }`}
                    onClick={() => setValue("isForCarpooling", !isForCarpooling)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        isForCarpooling ? "bg-green-500 text-white" : "bg-muted"
                      }`}>
                        <Navigation className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">Covoiturage</p>
                          {isForCarpooling && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Proposer des trajets et partager les frais
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      isForRental
                        ? "border-purple-500 bg-purple-500/5"
                        : "border-muted hover:border-purple-500/50"
                    }`}
                    onClick={() => setValue("isForRental", !isForRental)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        isForRental ? "bg-purple-500 text-white" : "bg-muted"
                      }`}>
                        <Key className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">Location</p>
                          {isForRental && <CheckCircle2 className="h-4 w-4 text-purple-500" />}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Mettre en location et générer des revenus
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex items-start gap-3">
                <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-200">Validation requise</p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Après l'ajout, vous devrez fournir les documents du véhicule (assurance, carte grise, visite technique).
                    Un administrateur validera ensuite votre véhicule.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Link href="/proprietaire/vehicules" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    Annuler
                  </Button>
                </Link>
                <Button
                  type="submit"
                  className="flex-1 bg-amber-500 hover:bg-amber-600"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "Création..." : "Ajouter le véhicule"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

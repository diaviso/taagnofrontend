"use client";

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
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const createVehicleSchema = z.object({
  brand: z.string().min(1, "Marque requise"),
  model: z.string().min(1, "Modèle requis"),
  year: z.coerce.number().min(1900).max(new Date().getFullYear() + 1),
  color: z.string().min(1, "Couleur requise"),
  licensePlate: z.string().min(1, "Immatriculation requise"),
  numberOfSeats: z.coerce.number().min(2).max(9),
  isForRental: z.boolean().default(false),
  isForCarpooling: z.boolean().default(false),
});

type CreateVehicleForm = z.infer<typeof createVehicleSchema>;

export default function CreateVehiclePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
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
      toast.success("Véhicule ajouté ! En attente de validation.");
      router.push(`/vehicles/${data.id}`);
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

  if (!isAuthenticated) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Connexion requise</h1>
        <Link href="/login"><Button>Se connecter</Button></Link>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-2xl">
      <Link href="/vehicles" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" />
        Retour à mes véhicules
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Ajouter un véhicule</CardTitle>
          <CardDescription>
            Votre véhicule sera soumis à validation avant utilisation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="brand">Marque</Label>
                <Input id="brand" placeholder="Peugeot" {...register("brand")} />
                {errors.brand && <p className="text-sm text-destructive">{errors.brand.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Modèle</Label>
                <Input id="model" placeholder="308" {...register("model")} />
                {errors.model && <p className="text-sm text-destructive">{errors.model.message}</p>}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="year">Année</Label>
                <Input id="year" type="number" placeholder="2020" {...register("year")} />
                {errors.year && <p className="text-sm text-destructive">{errors.year.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Couleur</Label>
                <Input id="color" placeholder="Gris" {...register("color")} />
                {errors.color && <p className="text-sm text-destructive">{errors.color.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="numberOfSeats">Places</Label>
                <Input id="numberOfSeats" type="number" min={2} max={9} placeholder="5" {...register("numberOfSeats")} />
                {errors.numberOfSeats && <p className="text-sm text-destructive">{errors.numberOfSeats.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="licensePlate">Immatriculation</Label>
              <Input id="licensePlate" placeholder="AB-123-CD" {...register("licensePlate")} />
              {errors.licensePlate && <p className="text-sm text-destructive">{errors.licensePlate.message}</p>}
            </div>

            <div className="space-y-4">
              <Label>Utilisation</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" {...register("isForCarpooling")} className="rounded" />
                  <span>Covoiturage</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" {...register("isForRental")} className="rounded" />
                  <span>Location</span>
                </label>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Création..." : "Ajouter le véhicule"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

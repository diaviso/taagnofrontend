"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/providers";
import { UserMode } from "@/types";
import {
  Car,
  Users,
  MapPin,
  Key,
  Search,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Navigation,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, setUserMode, needsOnboarding } = useAuth();
  const [selectedMode, setSelectedMode] = useState<UserMode | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    } else if (!isLoading && isAuthenticated && !needsOnboarding) {
      router.push("/");
    }
  }, [isLoading, isAuthenticated, needsOnboarding, router]);

  const handleSelectMode = async () => {
    if (!selectedMode) {
      toast.error("Veuillez sélectionner un mode");
      return;
    }

    setIsSubmitting(true);
    try {
      await setUserMode(selectedMode);
      toast.success("Bienvenue sur Taagno !");
      
      if (selectedMode === UserMode.VOYAGEUR) {
        router.push("/");
      } else {
        router.push("/proprietaire");
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !isAuthenticated || !needsOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="relative z-10 w-full max-w-4xl">
        <div className="text-center mb-10">
          <Badge className="mb-4 px-4 py-2 bg-primary/10 text-primary border-primary/20">
            <Sparkles className="w-4 h-4 mr-2" />
            Bienvenue {user?.firstName} !
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Comment souhaitez-vous utiliser <span className="text-gradient">Taagno</span> ?
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choisissez votre mode d'utilisation principal. Vous pourrez changer à tout moment.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Mode Voyageur */}
          <Card
            className={`cursor-pointer transition-all duration-300 hover:shadow-xl border-2 ${
              selectedMode === UserMode.VOYAGEUR
                ? "border-primary shadow-glow bg-primary/5"
                : "border-transparent hover:border-primary/30"
            }`}
            onClick={() => setSelectedMode(UserMode.VOYAGEUR)}
          >
            <CardHeader className="text-center pb-2">
              <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                selectedMode === UserMode.VOYAGEUR
                  ? "bg-primary text-white"
                  : "bg-primary/10 text-primary"
              }`}>
                <Search className="h-10 w-10" />
              </div>
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                Je cherche
                {selectedMode === UserMode.VOYAGEUR && (
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                )}
              </CardTitle>
              <CardDescription className="text-base">
                Passager / Locataire
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-muted-foreground">
                Je veux trouver un trajet de covoiturage ou louer un véhicule
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Trouver un covoiturage</p>
                    <p className="text-xs text-muted-foreground">Recherchez des trajets vers votre destination</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <ShoppingBag className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Louer un véhicule</p>
                    <p className="text-xs text-muted-foreground">Trouvez le véhicule idéal pour vos besoins</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Users className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Gérer mes réservations</p>
                    <p className="text-xs text-muted-foreground">Suivez vos trajets et locations</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mode Propriétaire */}
          <Card
            className={`cursor-pointer transition-all duration-300 hover:shadow-xl border-2 ${
              selectedMode === UserMode.PROPRIETAIRE
                ? "border-amber-500 shadow-glow-yellow bg-amber-500/5"
                : "border-transparent hover:border-amber-500/30"
            }`}
            onClick={() => setSelectedMode(UserMode.PROPRIETAIRE)}
          >
            <CardHeader className="text-center pb-2">
              <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                selectedMode === UserMode.PROPRIETAIRE
                  ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white"
                  : "bg-amber-500/10 text-amber-600"
              }`}>
                <Car className="h-10 w-10" />
              </div>
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                Je propose
                {selectedMode === UserMode.PROPRIETAIRE && (
                  <CheckCircle2 className="h-6 w-6 text-amber-500" />
                )}
              </CardTitle>
              <CardDescription className="text-base">
                Conducteur / Propriétaire
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-muted-foreground">
                J'ai un véhicule et je veux proposer des trajets ou le mettre en location
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Navigation className="h-5 w-5 text-amber-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Proposer des trajets</p>
                    <p className="text-xs text-muted-foreground">Partagez vos trajets et vos frais</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Key className="h-5 w-5 text-amber-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Mettre en location</p>
                    <p className="text-xs text-muted-foreground">Rentabilisez votre véhicule</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Car className="h-5 w-5 text-amber-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Gérer mes véhicules</p>
                    <p className="text-xs text-muted-foreground">Ajoutez et gérez votre flotte</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center space-y-4">
          <Button
            size="lg"
            className={`h-14 px-10 text-lg gap-2 transition-all ${
              selectedMode === UserMode.PROPRIETAIRE
                ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-glow-yellow"
                : "shadow-glow"
            }`}
            disabled={!selectedMode || isSubmitting}
            onClick={handleSelectMode}
          >
            {isSubmitting ? (
              "Chargement..."
            ) : (
              <>
                Continuer
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </Button>
          <p className="text-sm text-muted-foreground">
            Vous pourrez changer de mode à tout moment depuis le menu
          </p>
        </div>
      </div>
    </div>
  );
}

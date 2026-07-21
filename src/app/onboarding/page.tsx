"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/providers";
import { UserMode } from "@/types";
import { usersService } from "@/lib/services";
import {
  Car,
  Users,
  MapPin,
  Key,
  Search,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Navigation,
  ShoppingBag,
  User,
  Phone,
  Shield,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

type Step = "phone" | "profile" | "mode";
type PhoneSubStep = "enter" | "otp";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, setUserMode, needsOnboarding, refetch } = useAuth();
  const [step, setStep] = useState<Step | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [selectedMode, setSelectedMode] = useState<UserMode | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Étape téléphone (pour les comptes email/Google sans numéro vérifié)
  const [phoneSubStep, setPhoneSubStep] = useState<PhoneSubStep>("enter");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    } else if (!isLoading && isAuthenticated && !needsOnboarding) {
      router.push("/");
    }
  }, [isLoading, isAuthenticated, needsOnboarding, router]);

  // Détermine l'étape de départ selon ce qui manque au compte :
  // numéro vérifié → nom → mode. On ne demande que ce qui est absent.
  useEffect(() => {
    if (!user || step !== null) return;
    if (!user.phoneVerified) setStep("phone");
    else if (!user.firstName) setStep("profile");
    else setStep("mode");
  }, [user, step]);

  const startCountdown = () => {
    setCountdown(60);
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  // Après l'étape téléphone (validée ou passée) : nom si absent, sinon mode.
  const goAfterPhone = () => {
    setStep(user?.firstName ? "mode" : "profile");
  };

  const handleSendPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setIsSubmitting(true);
    try {
      await usersService.sendPhoneOtp(phone);
      toast.success("Code SMS envoyé !");
      setPhoneSubStep("otp");
      startCountdown();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Impossible d'envoyer le SMS");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    setIsSubmitting(true);
    try {
      await usersService.verifyPhone(otp);
      await refetch();
      toast.success("Numéro vérifié !");
      goAfterPhone();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Code invalide ou expiré");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendPhoneOtp = async () => {
    if (countdown > 0) return;
    setIsSubmitting(true);
    try {
      await usersService.sendPhoneOtp(phone);
      toast.success("Nouveau code envoyé !");
      startCountdown();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Impossible de renvoyer le SMS");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;

    setIsSubmitting(true);
    try {
      await usersService.updateProfile({ firstName: firstName.trim(), lastName: lastName.trim() });
      await refetch();
      setStep("mode");
    } catch {
      toast.error("Impossible de sauvegarder le profil");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectMode = async () => {
    if (!selectedMode) {
      toast.error("Veuillez sélectionner un mode");
      return;
    }

    setIsSubmitting(true);
    try {
      await setUserMode(selectedMode);
      toast.success("Bienvenue sur Taagno !");
      router.push(selectedMode === UserMode.VOYAGEUR ? "/" : "/proprietaire");
    } catch {
      toast.error("Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !isAuthenticated || !needsOnboarding || step === null) {
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

        {/* Step 0 — Phone (email/Google users without a verified number) */}
        {step === "phone" && (
          <>
            <div className="text-center mb-10">
              <Badge className="mb-4 px-4 py-2 bg-primary/10 text-primary border-primary/20">
                <Sparkles className="w-4 h-4 mr-2" />
                Bienvenue sur Taagno !
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Vérifiez votre <span className="text-gradient">numéro</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Votre numéro permet aux conducteurs et voyageurs de vous joindre
              </p>
            </div>

            <div className="max-w-md mx-auto">
              <Card className="border-0 shadow-elevated">
                <CardContent className="p-8">
                  <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Phone className="h-8 w-8 text-primary" />
                    </div>
                  </div>

                  {phoneSubStep === "enter" ? (
                    <form onSubmit={handleSendPhoneOtp} className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Numéro de téléphone</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="+221 77 123 45 67"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="pl-10 h-12"
                            required
                            autoFocus
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Format: +221XXXXXXXXX ou 7XXXXXXXX
                        </p>
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-12 gap-2"
                        disabled={isSubmitting || !phone}
                      >
                        {isSubmitting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ArrowRight className="h-4 w-4" />
                        )}
                        {isSubmitting ? "Envoi en cours..." : "Recevoir le code SMS"}
                      </Button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyPhone} className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="otp">Code de vérification</Label>
                        <Input
                          id="otp"
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          placeholder="123456"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          className="h-14 text-center text-2xl font-bold tracking-[0.5em]"
                          required
                          maxLength={6}
                          autoFocus
                        />
                        <p className="text-xs text-muted-foreground text-center">
                          Code à 6 chiffres envoyé au {phone}
                        </p>
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-12 gap-2"
                        disabled={isSubmitting || otp.length !== 6}
                      >
                        {isSubmitting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Shield className="h-4 w-4" />
                        )}
                        {isSubmitting ? "Vérification..." : "Valider le code"}
                      </Button>

                      <div className="text-center space-y-2">
                        <button
                          type="button"
                          onClick={handleResendPhoneOtp}
                          disabled={countdown > 0 || isSubmitting}
                          className="text-sm text-primary hover:underline disabled:text-muted-foreground disabled:no-underline disabled:cursor-not-allowed"
                        >
                          {countdown > 0 ? `Renvoyer le code (${countdown}s)` : "Renvoyer le code"}
                        </button>
                        <br />
                        <button
                          type="button"
                          onClick={() => {
                            setPhoneSubStep("enter");
                            setOtp("");
                          }}
                          className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                        >
                          <ArrowLeft className="h-3 w-3" /> Changer de numéro
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="mt-6 pt-4 border-t border-border/50 text-center">
                    <button
                      type="button"
                      onClick={goAfterPhone}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Passer pour l'instant
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Step 1 — Profile (users without a name) */}
        {step === "profile" && (
          <>
            <div className="text-center mb-10">
              <Badge className="mb-4 px-4 py-2 bg-primary/10 text-primary border-primary/20">
                <Sparkles className="w-4 h-4 mr-2" />
                Bienvenue sur Taagno !
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Dites-nous <span className="text-gradient">qui vous êtes</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Quelques informations pour personnaliser votre expérience
              </p>
            </div>

            <div className="max-w-md mx-auto">
              <Card className="border-0 shadow-elevated">
                <CardContent className="p-8">
                  <form onSubmit={handleSaveProfile} className="space-y-5">
                    <div className="flex justify-center mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <User className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom</Label>
                      <Input
                        id="firstName"
                        placeholder="Ibrahima"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="h-12"
                        required
                        autoFocus
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom</Label>
                      <Input
                        id="lastName"
                        placeholder="Diave"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="h-12"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full h-12 gap-2"
                      disabled={isSubmitting || !firstName.trim() || !lastName.trim()}
                    >
                      {isSubmitting ? "Enregistrement..." : (
                        <><ArrowRight className="h-4 w-4" /> Continuer</>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Step 2 — Mode selection */}
        {step === "mode" && (
          <>
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
                    selectedMode === UserMode.VOYAGEUR ? "bg-primary text-white" : "bg-primary/10 text-primary"
                  }`}>
                    <Search className="h-10 w-10" />
                  </div>
                  <CardTitle className="text-2xl flex items-center justify-center gap-2">
                    Je cherche
                    {selectedMode === UserMode.VOYAGEUR && <CheckCircle2 className="h-6 w-6 text-primary" />}
                  </CardTitle>
                  <CardDescription className="text-base">Passager / Locataire</CardDescription>
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
                    {selectedMode === UserMode.PROPRIETAIRE && <CheckCircle2 className="h-6 w-6 text-amber-500" />}
                  </CardTitle>
                  <CardDescription className="text-base">Conducteur / Propriétaire</CardDescription>
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
                {isSubmitting ? "Chargement..." : (<>Continuer <ArrowRight className="h-5 w-5" /></>)}
              </Button>
              <p className="text-sm text-muted-foreground">
                Vous pourrez changer de mode à tout moment depuis le menu
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

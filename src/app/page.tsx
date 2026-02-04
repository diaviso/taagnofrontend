"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HowItWorksSection, AnimatedStats, CarDrivingScene } from "@/components/animations";
import { useAuth } from "@/providers";
import {
  Car,
  Users,
  MapPin,
  Calendar,
  Shield,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Star,
  Zap,
  Clock,
  CreditCard,
  Search,
  ShoppingBag,
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isProprietaire, needsOnboarding } = useAuth();

  useEffect(() => {
    if (isAuthenticated && needsOnboarding) {
      router.push("/onboarding");
    } else if (isAuthenticated && isProprietaire) {
      router.push("/proprietaire");
    }
  }, [isAuthenticated, isProprietaire, needsOnboarding, router]);

  return (
    <div className="flex flex-col overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center gradient-hero overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        </div>

        {/* Pattern overlay */}
        <div className="absolute inset-0 pattern-dots opacity-30" />

        <div className="container relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-6 px-4 py-2 text-sm font-medium bg-primary/10 text-primary border-primary/20 animate-fade-in">
              <Sparkles className="w-4 h-4 mr-2" />
              La plateforme N°1 au Sénégal
            </Badge>

            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl animate-slide-up">
              Voyagez ensemble,{" "}
              <span className="text-gradient">économisez plus</span>
            </h1>

            <p className="mt-8 text-xl text-muted-foreground md:text-2xl max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "0.1s" }}>
              Taagno connecte conducteurs et passagers à travers tout le Sénégal.
              Covoiturage et location de véhicules entre particuliers en toute confiance.
            </p>

            <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:justify-center animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <Link href="/carpool">
                <Button size="lg" className="w-full sm:w-auto gap-3 h-14 px-8 text-lg shadow-glow hover:shadow-glow transition-all duration-300 hover:scale-105">
                  <Search className="h-5 w-5" />
                  Trouver un trajet
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/rental">
                <Button size="lg" variant="outline" className="w-full sm:w-auto gap-3 h-14 px-8 text-lg border-2 hover:bg-secondary/20 transition-all duration-300 hover:scale-105">
                  <ShoppingBag className="h-5 w-5" />
                  Louer un véhicule
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <div className="text-center">
                <div className="text-3xl font-bold text-gradient">5000+</div>
                <div className="text-sm text-muted-foreground mt-1">Utilisateurs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gradient-gold">14</div>
                <div className="text-sm text-muted-foreground mt-1">Régions</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gradient">98%</div>
                <div className="text-sm text-muted-foreground mt-1">Satisfaits</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-primary/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-primary rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Animated How It Works Section */}
      <HowItWorksSection />

      {/* Animated Stats */}
      <AnimatedStats />

      {/* Services Section */}
      <section className="py-24">
        <div className="container">
          <div className="text-center mb-16">
            <Badge className="mb-4 px-3 py-1 bg-primary/10 text-primary border-primary/20">
              Nos Services
            </Badge>
            <h2 className="text-4xl font-bold mb-4">Deux services, une plateforme</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Que vous cherchiez à partager un trajet ou louer un véhicule,
              Taagno est là pour vous
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Covoiturage Card */}
            <Card className="group overflow-hidden border-0 shadow-elevated hover-lift">
              <div className="relative h-64 bg-gradient-to-br from-primary via-primary/90 to-emerald-600 p-8 text-white overflow-hidden">
                <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute right-8 top-8 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse" />

                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-sm mb-4">
                    <Zap className="w-4 h-4" />
                    Économique
                  </div>
                  <Users className="h-12 w-12 mb-4" />
                  <h3 className="text-3xl font-bold mb-2">Covoiturage</h3>
                  <p className="text-white/80 text-lg">
                    Partagez vos trajets à travers le Sénégal et divisez les frais.
                  </p>
                </div>
              </div>
              <CardContent className="p-8">
                <ul className="space-y-4 mb-8">
                  {[
                    { icon: CheckCircle2, text: "Trajets vérifiés et sécurisés" },
                    { icon: CreditCard, text: "Prix transparents en FCFA" },
                    { icon: Clock, text: "Réservation instantanée" },
                    { icon: Star, text: "Conducteurs évalués" }
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <item.icon className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-muted-foreground">{item.text}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/carpool">
                  <Button className="w-full h-12 text-lg gap-2 group-hover:shadow-glow transition-all">
                    Rechercher un trajet
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Location Card */}
            <Card className="group overflow-hidden border-0 shadow-elevated hover-lift">
              <div className="relative h-64 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 p-8 text-white overflow-hidden">
                <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute right-8 top-8 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse" />

                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-sm mb-4">
                    <Shield className="w-4 h-4" />
                    Fiable
                  </div>
                  <Car className="h-12 w-12 mb-4" />
                  <h3 className="text-3xl font-bold mb-2">Location de véhicules</h3>
                  <p className="text-white/80 text-lg">
                    Louez directement auprès de particuliers à des prix compétitifs.
                  </p>
                </div>
              </div>
              <CardContent className="p-8">
                <ul className="space-y-4 mb-8">
                  {[
                    { icon: CheckCircle2, text: "Véhicules vérifiés" },
                    { icon: Shield, text: "Assurance incluse" },
                    { icon: Clock, text: "Annulation flexible" },
                    { icon: MapPin, text: "Disponible partout au Sénégal" }
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10">
                        <item.icon className="h-4 w-4 text-amber-600" />
                      </div>
                      <span className="text-muted-foreground">{item.text}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/rental">
                  <Button variant="secondary" className="w-full h-12 text-lg gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 transition-all">
                    Voir les offres
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Popular Routes Section */}
      <section className="py-24 bg-muted/30 relative overflow-hidden">
        <div className="absolute inset-0 pattern-dots opacity-30" />
        <div className="container relative">
          <div className="text-center mb-16">
            <Badge className="mb-4 px-3 py-1 bg-primary/10 text-primary border-primary/20">
              Trajets Populaires
            </Badge>
            <h2 className="text-4xl font-bold mb-4">Les routes les plus demandées</h2>
            <p className="text-xl text-muted-foreground">
              Découvrez les trajets les plus réservés par notre communauté
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { from: "Dakar", to: "Thiès", price: "2 500", time: "1h" },
              { from: "Dakar", to: "Saint-Louis", price: "5 000", time: "3h" },
              { from: "Dakar", to: "Mbour", price: "3 000", time: "1h30" },
              { from: "Dakar", to: "Touba", price: "4 000", time: "2h30" },
              { from: "Thiès", to: "Kaolack", price: "3 500", time: "2h" },
              { from: "Dakar", to: "Ziguinchor", price: "10 000", time: "6h" },
              { from: "Saint-Louis", to: "Matam", price: "6 000", time: "4h" },
              { from: "Dakar", to: "Tambacounda", price: "8 000", time: "5h" },
            ].map((route, index) => (
              <Link href="/carpool" key={index}>
                <Card className="group hover-lift border-0 shadow-soft cursor-pointer overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                        <div className="w-0.5 h-8 bg-gradient-to-b from-primary to-secondary" />
                        <div className="w-2.5 h-2.5 rounded-full bg-secondary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{route.from}</p>
                        <p className="text-sm text-muted-foreground">{route.time}</p>
                        <p className="font-semibold">{route.to}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t">
                      <span className="text-sm text-muted-foreground">À partir de</span>
                      <span className="font-bold text-primary">{route.price} FCFA</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-95" />
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
        </div>

        <div className="container relative text-center text-white">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            Rejoignez la communauté
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Prêt à voyager autrement ?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Rejoignez des milliers de Sénégalais qui font confiance à Taagno
            pour leurs déplacements quotidiens.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" variant="secondary" className="h-14 px-8 text-lg gap-2 bg-white text-primary hover:bg-white/90 shadow-elevated">
                Créer un compte gratuitement
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/carpool">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg gap-2 border-white/30 text-white hover:bg-white/10">
                Explorer les trajets
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

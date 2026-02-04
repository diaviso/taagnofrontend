"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { rentalService } from "@/lib/services";
import { RentalOffer } from "@/types";
import {
  Car,
  Calendar,
  Plus,
  ArrowRight,
  Users,
  Sparkles,
  Shield,
  Star,
  MapPin
} from "lucide-react";
import { useAuth } from "@/providers";

export default function RentalPage() {
  const { isAuthenticated, user } = useAuth();

  const { data: allOffers, isLoading } = useQuery({
    queryKey: ["rental", "offers"],
    queryFn: () => rentalService.searchOffers(),
  });

  // Filter out user's own rental offers
  const offers = allOffers?.filter((offer: RentalOffer) => offer.vehicle?.ownerId !== user?.id);

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-background py-16 overflow-hidden">
        <div className="absolute inset-0 pattern-dots opacity-30" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />

        <div className="container relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 px-4 py-1.5 bg-amber-500/10 text-amber-600 border-amber-500/20">
              <Sparkles className="w-4 h-4 mr-2" />
              Location de véhicules
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Louez un véhicule <span className="text-gradient-gold">en toute confiance</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Des véhicules vérifiés, des propriétaires de confiance, partout au Sénégal
            </p>
            {isAuthenticated && (
              <Link href="/rental/create">
                <Button className="gap-2 h-12 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-glow-yellow">
                  <Plus className="h-5 w-5" />
                  Proposer mon véhicule
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="py-8 border-b">
        <div className="container">
          <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-500" />
              <span>Véhicules vérifiés</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              <span>Propriétaires évalués</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-amber-500" />
              <span>Disponible partout au Sénégal</span>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold">
                {offers?.length || 0} véhicule{(offers?.length || 0) > 1 ? "s" : ""} disponible{(offers?.length || 0) > 1 ? "s" : ""}
              </h2>
              <p className="text-muted-foreground">
                Trouvez le véhicule parfait pour vos besoins
              </p>
            </div>
          </div>

          {/* Offers Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="border-0 shadow-soft overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-4 space-y-3">
                    <Skeleton className="h-6 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-8 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : offers && offers.length > 0 ? (
              offers.map((offer: RentalOffer) => (
                <Link href={`/rental/${offer.id}`} key={offer.id}>
                  <Card className="group border-0 shadow-soft hover-lift cursor-pointer overflow-hidden h-full">
                    {/* Image */}
                    <div className="relative h-48 bg-gradient-to-br from-amber-100 to-orange-100 overflow-hidden">
                      {offer.vehicle?.photos && offer.vehicle.photos.length > 0 ? (
                        <img
                          src={offer.vehicle.photos[0].url}
                          alt={`${offer.vehicle.brand} ${offer.vehicle.model}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Car className="h-20 w-20 text-amber-300" />
                        </div>
                      )}
                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex gap-2">
                        <Badge className="bg-white/90 text-foreground shadow-sm">
                          {offer.vehicle?.year}
                        </Badge>
                      </div>
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-amber-500 text-white shadow-sm">
                          {offer.pricePerDay.toLocaleString()} FCFA/jour
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-5">
                      {/* Vehicle name */}
                      <h3 className="text-xl font-bold mb-2 group-hover:text-amber-600 transition-colors">
                        {offer.vehicle?.brand} {offer.vehicle?.model}
                      </h3>

                      {/* Owner */}
                      <div className="flex items-center gap-3 mb-4">
                        <Avatar className="h-8 w-8 ring-2 ring-amber-500/20">
                          <AvatarImage src={offer.vehicle?.owner?.photoUrl} />
                          <AvatarFallback className="bg-gradient-to-br from-amber-500/20 to-orange-500/10 text-amber-600 text-xs font-semibold">
                            {getInitials(offer.vehicle?.owner?.firstName, offer.vehicle?.owner?.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {offer.vehicle?.owner?.firstName} {offer.vehicle?.owner?.lastName}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            <span>4.9</span>
                          </div>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-1.5">
                          <Users className="h-4 w-4" />
                          <span>{offer.vehicle?.numberOfSeats} places</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" />
                          <span>Min. {offer.minDays} jour{offer.minDays > 1 ? "s" : ""}</span>
                        </div>
                      </div>

                      {/* CTA */}
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div>
                          <p className="text-xs text-muted-foreground">Caution</p>
                          <p className="font-semibold">{offer.depositAmount.toLocaleString()} FCFA</p>
                        </div>
                        <Button size="sm" className="gap-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                          Voir
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="col-span-full">
                <Card className="border-0 shadow-soft">
                  <CardContent className="p-16 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-500/10 flex items-center justify-center">
                      <Car className="h-10 w-10 text-amber-500" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Aucun véhicule disponible</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Il n&apos;y a pas de véhicules disponibles pour le moment.
                      Soyez le premier à proposer votre véhicule !
                    </p>
                    {isAuthenticated && (
                      <Link href="/rental/create">
                        <Button className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                          <Plus className="h-4 w-4" />
                          Proposer mon véhicule
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

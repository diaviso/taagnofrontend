"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { rentalService } from "@/lib/services";
import { RentalOffer } from "@/types";
import { toast } from "sonner";
import {
  Key,
  Plus,
  Search,
  Car,
  Calendar,
  CheckCircle2,
  Eye,
  EyeOff,
  ArrowUpRight,
  TrendingUp,
  Wallet,
  Users,
  Clock,
  Shield,
  Sparkles,
  ToggleLeft,
  Settings,
} from "lucide-react";

export default function ProprietaireLocationsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: offers, isLoading } = useQuery({
    queryKey: ["rental", "offers", "mine"],
    queryFn: rentalService.getMyOffers,
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ offerId, isActive }: { offerId: string; isActive: boolean }) => {
      // Note: This would need a backend endpoint to toggle active status
      // For now, we'll just show a toast
      return { offerId, isActive };
    },
    onSuccess: (data) => {
      toast.success(data.isActive ? "Offre activée" : "Offre désactivée");
      queryClient.invalidateQueries({ queryKey: ["rental", "offers", "mine"] });
    },
  });

  const filteredOffers = offers?.filter((o: RentalOffer) => {
    const matchesSearch =
      o.vehicle?.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.vehicle?.model?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && o.isActive) ||
      (statusFilter === "inactive" && !o.isActive);
    return matchesSearch && matchesStatus;
  });

  const activeOffers = offers?.filter((o: RentalOffer) => o.isActive) || [];
  const inactiveOffers = offers?.filter((o: RentalOffer) => !o.isActive) || [];

  // Calculate potential earnings
  const totalDailyRate = activeOffers.reduce((acc: number, o: RentalOffer) => acc + (o.pricePerDay || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Key className="h-5 w-5 text-purple-500" />
            </div>
            Mes locations
          </h1>
          <p className="text-muted-foreground mt-1">Gérez vos offres de location</p>
        </div>
        <Link href="/proprietaire/locations/nouvelle">
          <Button className="gap-2 bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 shadow-lg shadow-purple-500/25">
            <Plus className="h-4 w-4" />
            Nouvelle offre
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500">
          <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
          <CardContent className="p-4 relative">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Eye className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">{activeOffers.length}</p>
                <p className="text-sm text-muted-foreground">Offres actives</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-l-4 border-l-gray-500">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gray-500/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
          <CardContent className="p-4 relative">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gray-500/10 flex items-center justify-center">
                <EyeOff className="h-5 w-5 text-gray-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{inactiveOffers.length}</p>
                <p className="text-sm text-muted-foreground">Inactives</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
          <CardContent className="p-4 relative">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Car className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{offers?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Total offres</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-l-4 border-l-amber-500">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
          <CardContent className="p-4 relative">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">{totalDailyRate.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">FCFA/jour potentiel</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-soft">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un véhicule..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 bg-muted/50 border-0"
              />
            </div>
            <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full md:w-auto">
              <TabsList className="grid grid-cols-3 w-full md:w-auto">
                <TabsTrigger value="all" className="text-xs md:text-sm">Tous</TabsTrigger>
                <TabsTrigger value="active" className="text-xs md:text-sm">Actifs</TabsTrigger>
                <TabsTrigger value="inactive" className="text-xs md:text-sm">Inactifs</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Offers Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-80 rounded-2xl" />
          ))}
        </div>
      ) : filteredOffers && filteredOffers.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOffers.map((offer: RentalOffer, index: number) => (
            <Link key={offer.id} href={`/rental/${offer.id}`}>
              <Card
                className={`group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-0 shadow-soft border-l-4 ${
                  offer.isActive ? "border-l-purple-500" : "border-l-gray-300"
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Image */}
                <div className="relative h-48 bg-gradient-to-br from-purple-100 to-violet-100 overflow-hidden">
                  {offer.vehicle?.photos && offer.vehicle.photos.length > 0 ? (
                    <img
                      src={offer.vehicle.photos[0].url}
                      alt={`${offer.vehicle?.brand} ${offer.vehicle?.model}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Car className="h-20 w-20 text-purple-300" />
                    </div>
                  )}
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <Badge
                      variant={offer.isActive ? "default" : "secondary"}
                      className={`gap-1 shadow-lg ${offer.isActive ? "bg-purple-500" : ""}`}
                    >
                      {offer.isActive ? (
                        <>
                          <Eye className="h-3 w-3" />
                          Active
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3 w-3" />
                          Inactive
                        </>
                      )}
                    </Badge>
                  </div>

                  {/* Year Badge */}
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-white/90 text-foreground shadow-sm">
                      {offer.vehicle?.year}
                    </Badge>
                  </div>

                  {/* Price overlay on hover */}
                  <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-black/60 backdrop-blur rounded-lg p-3">
                      <p className="text-white text-2xl font-bold">
                        {offer.pricePerDay?.toLocaleString()} FCFA
                        <span className="text-sm font-normal opacity-80">/jour</span>
                      </p>
                    </div>
                  </div>
                </div>

                <CardContent className="p-5">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold group-hover:text-purple-600 transition-colors">
                        {offer.vehicle?.brand} {offer.vehicle?.model}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {offer.vehicle?.color} • {offer.vehicle?.licensePlate}
                      </p>
                    </div>

                    {/* Pricing info */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-purple-500/5">
                      <div>
                        <p className="text-2xl font-bold text-purple-600">
                          {offer.pricePerDay?.toLocaleString()}
                          <span className="text-sm font-normal text-muted-foreground ml-1">FCFA/jour</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Caution</p>
                        <p className="font-semibold">{offer.depositAmount?.toLocaleString()} FCFA</p>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-4 w-4" />
                        {offer.vehicle?.numberOfSeats} places
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        Min. {offer.minDays} jour(s)
                      </div>
                    </div>

                    {/* Action hint */}
                    <div className="pt-3 border-t flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Voir les détails</span>
                      <ArrowUpRight className="h-4 w-4 text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="border-0 shadow-soft">
          <CardContent className="p-16 text-center">
            <div className="h-20 w-20 mx-auto rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6">
              <Key className="h-10 w-10 text-purple-500/50" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {searchQuery || statusFilter !== "all" ? "Aucun résultat" : "Aucune offre de location"}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {searchQuery || statusFilter !== "all"
                ? "Aucune offre ne correspond à vos critères de recherche."
                : "Mettez votre véhicule en location et générez des revenus."}
            </p>
            {!searchQuery && statusFilter === "all" && (
              <Link href="/proprietaire/locations/nouvelle">
                <Button className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 shadow-lg shadow-purple-500/25">
                  <Plus className="h-4 w-4 mr-2" />
                  Créer une offre
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tips Section */}
      {offers && offers.length > 0 && (
        <Card className="border-0 shadow-soft overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-purple-500 to-violet-500" />
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                <Sparkles className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Conseils pour maximiser vos revenus</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Ajoutez des photos de qualité de votre véhicule
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Fixez un prix compétitif par rapport au marché
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Répondez rapidement aux demandes de réservation
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Maintenez vos documents à jour
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

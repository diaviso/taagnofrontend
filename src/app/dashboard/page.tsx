"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/providers";
import { vehiclesService, carpoolService, rentalService } from "@/lib/services";
import {
  Car,
  Users,
  Calendar,
  ArrowRight,
  Plus,
  MapPin,
  Clock,
  Navigation,
  UserCheck,
  Key,
  ShoppingBag,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Timer,
  Coins,
  Info,
} from "lucide-react";
import { CarpoolReservationStatus, RentalBookingStatus, VehicleStatus, CarpoolTripStatus } from "@/types";

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const [activeSection, setActiveSection] = useState<"driver" | "passenger">("driver");

  const { data: vehicles, isLoading: vehiclesLoading } = useQuery({
    queryKey: ["vehicles", "mine"],
    queryFn: vehiclesService.getMyVehicles,
    enabled: isAuthenticated,
  });

  const { data: myTrips, isLoading: myTripsLoading } = useQuery({
    queryKey: ["carpool", "trips", "mine"],
    queryFn: carpoolService.getMyTrips,
    enabled: isAuthenticated,
  });

  const { data: myReservations, isLoading: reservationsLoading } = useQuery({
    queryKey: ["carpool", "reservations", "mine"],
    queryFn: carpoolService.getMyReservations,
    enabled: isAuthenticated,
  });

  const { data: myBookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ["rental", "bookings", "mine"],
    queryFn: rentalService.getMyBookings,
    enabled: isAuthenticated,
  });

  const { data: myOffers, isLoading: offersLoading } = useQuery({
    queryKey: ["rental", "offers", "mine"],
    queryFn: rentalService.getMyOffers,
    enabled: isAuthenticated,
  });

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  const getReservationStatusBadge = (status: CarpoolReservationStatus) => {
    const config: Record<CarpoolReservationStatus, { variant: "default" | "secondary" | "destructive" | "outline"; label: string; icon: React.ReactNode }> = {
      [CarpoolReservationStatus.PENDING]: { variant: "secondary", label: "En attente", icon: <Timer className="h-3 w-3" /> },
      [CarpoolReservationStatus.CONFIRMED]: { variant: "default", label: "Confirmée", icon: <CheckCircle2 className="h-3 w-3" /> },
      [CarpoolReservationStatus.REJECTED]: { variant: "destructive", label: "Refusée", icon: <XCircle className="h-3 w-3" /> },
      [CarpoolReservationStatus.CANCELLED]: { variant: "outline", label: "Annulée", icon: <XCircle className="h-3 w-3" /> },
      [CarpoolReservationStatus.COMPLETED]: { variant: "default", label: "Terminée", icon: <CheckCircle2 className="h-3 w-3" /> },
    };
    const { variant, label, icon } = config[status];
    return <Badge variant={variant} className="gap-1">{icon}{label}</Badge>;
  };

  const getBookingStatusBadge = (status: RentalBookingStatus) => {
    const config: Record<RentalBookingStatus, { variant: "default" | "secondary" | "destructive" | "outline"; label: string; icon: React.ReactNode }> = {
      [RentalBookingStatus.PENDING]: { variant: "secondary", label: "En attente", icon: <Timer className="h-3 w-3" /> },
      [RentalBookingStatus.CONFIRMED]: { variant: "default", label: "Confirmée", icon: <CheckCircle2 className="h-3 w-3" /> },
      [RentalBookingStatus.REJECTED]: { variant: "destructive", label: "Refusée", icon: <XCircle className="h-3 w-3" /> },
      [RentalBookingStatus.CANCELLED]: { variant: "outline", label: "Annulée", icon: <XCircle className="h-3 w-3" /> },
      [RentalBookingStatus.COMPLETED]: { variant: "default", label: "Terminée", icon: <CheckCircle2 className="h-3 w-3" /> },
    };
    const { variant, label, icon } = config[status];
    return <Badge variant={variant} className="gap-1">{icon}{label}</Badge>;
  };

  const getVehicleStatusBadge = (status: VehicleStatus) => {
    const config: Record<VehicleStatus, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      [VehicleStatus.PENDING]: { variant: "secondary", label: "En attente de validation" },
      [VehicleStatus.APPROVED]: { variant: "default", label: "Approuvé" },
      [VehicleStatus.REJECTED]: { variant: "destructive", label: "Refusé" },
    };
    const { variant, label } = config[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getTripStatusBadge = (status: CarpoolTripStatus) => {
    const config: Record<CarpoolTripStatus, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      [CarpoolTripStatus.OPEN]: { variant: "default", label: "Ouvert" },
      [CarpoolTripStatus.FULL]: { variant: "secondary", label: "Complet" },
      [CarpoolTripStatus.CANCELLED]: { variant: "destructive", label: "Annulé" },
      [CarpoolTripStatus.COMPLETED]: { variant: "outline", label: "Terminé" },
    };
    const { variant, label } = config[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Stats calculations
  const pendingVehicles = vehicles?.filter((v: any) => v.status === VehicleStatus.PENDING).length || 0;
  const approvedVehicles = vehicles?.filter((v: any) => v.status === VehicleStatus.APPROVED).length || 0;
  const openTrips = myTrips?.filter((t: any) => t.status === CarpoolTripStatus.OPEN).length || 0;
  const pendingReservations = myReservations?.filter((r: any) => r.status === CarpoolReservationStatus.PENDING).length || 0;
  const confirmedReservations = myReservations?.filter((r: any) => r.status === CarpoolReservationStatus.CONFIRMED).length || 0;
  const activeOffers = myOffers?.filter((o: any) => o.isActive).length || 0;
  const pendingBookings = myBookings?.filter((b: any) => b.status === RentalBookingStatus.PENDING).length || 0;
  const confirmedBookings = myBookings?.filter((b: any) => b.status === RentalBookingStatus.CONFIRMED).length || 0;

  if (!isAuthenticated) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Connexion requise</h1>
        <Link href="/login"><Button>Se connecter</Button></Link>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user?.photoUrl} />
          <AvatarFallback className="text-lg">
            {getInitials(user?.firstName, user?.lastName)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">
            Bonjour, {user?.firstName} !
          </h1>
          <p className="text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="mb-8">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Actions rapides
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link href="/vehicles/create">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <Car className="h-6 w-6 text-primary" />
                <span>Ajouter un véhicule</span>
              </Button>
            </Link>
            <Link href="/carpool/create">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <Navigation className="h-6 w-6 text-primary" />
                <span>Proposer un trajet</span>
              </Button>
            </Link>
            <Link href="/rental">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <Key className="h-6 w-6 text-primary" />
                <span>Louer un véhicule</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeSection} onValueChange={(v) => setActiveSection(v as "driver" | "passenger")} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 h-auto p-1">
          <TabsTrigger value="driver" className="py-3 gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Navigation className="h-5 w-5" />
            <div className="text-left">
              <div className="font-semibold">Je propose</div>
              <div className="text-xs opacity-80">Conducteur / Propriétaire</div>
            </div>
          </TabsTrigger>
          <TabsTrigger value="passenger" className="py-3 gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <UserCheck className="h-5 w-5" />
            <div className="text-left">
              <div className="font-semibold">Je réserve</div>
              <div className="text-xs opacity-80">Passager / Locataire</div>
            </div>
          </TabsTrigger>
        </TabsList>

        {/* Driver/Owner Tab */}
        <TabsContent value="driver" className="space-y-6">
          {/* Driver Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Mes véhicules</p>
                    <p className="text-2xl font-bold">{vehicles?.length || 0}</p>
                    {pendingVehicles > 0 && (
                      <p className="text-xs text-amber-600">{pendingVehicles} en attente</p>
                    )}
                  </div>
                  <Car className="h-8 w-8 text-blue-500 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Trajets créés</p>
                    <p className="text-2xl font-bold">{myTrips?.length || 0}</p>
                    {openTrips > 0 && (
                      <p className="text-xs text-green-600">{openTrips} ouvert(s)</p>
                    )}
                  </div>
                  <Navigation className="h-8 w-8 text-green-500 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Offres de location</p>
                    <p className="text-2xl font-bold">{myOffers?.length || 0}</p>
                    {activeOffers > 0 && (
                      <p className="text-xs text-purple-600">{activeOffers} active(s)</p>
                    )}
                  </div>
                  <Key className="h-8 w-8 text-purple-500 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Véhicules approuvés</p>
                    <p className="text-2xl font-bold">{approvedVehicles}</p>
                    <p className="text-xs text-muted-foreground">prêts à l'emploi</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-amber-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* My Vehicles Section */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5 text-primary" />
                    Mes véhicules
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Les véhicules que vous avez enregistrés sur la plateforme
                  </CardDescription>
                </div>
                <Link href="/vehicles/create">
                  <Button size="sm" className="gap-1">
                    <Plus className="h-4 w-4" />
                    Ajouter
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {vehiclesLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
                </div>
              ) : vehicles && vehicles.length > 0 ? (
                <div className="space-y-3">
                  {vehicles.slice(0, 4).map((vehicle: any) => (
                    <Link key={vehicle.id} href={`/vehicles/${vehicle.id}`}>
                      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center">
                            {vehicle.photos?.[0] ? (
                              <img src={vehicle.photos[0].url} alt="" className="h-full w-full object-cover rounded-lg" />
                            ) : (
                              <Car className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold">{vehicle.brand} {vehicle.model}</p>
                            <p className="text-sm text-muted-foreground">{vehicle.licensePlate} • {vehicle.year}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getVehicleStatusBadge(vehicle.status)}
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                    </Link>
                  ))}
                  {vehicles.length > 4 && (
                    <Link href="/vehicles" className="block">
                      <Button variant="ghost" className="w-full">
                        Voir tous mes véhicules ({vehicles.length})
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 bg-muted/30 rounded-lg">
                  <Car className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="font-medium mb-1">Aucun véhicule enregistré</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Ajoutez votre premier véhicule pour proposer des trajets ou le mettre en location
                  </p>
                  <Link href="/vehicles/create">
                    <Button>Ajouter un véhicule</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* My Carpool Trips (as driver) */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Navigation className="h-5 w-5 text-primary" />
                    Mes trajets de covoiturage
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Les trajets que vous proposez en tant que conducteur
                  </CardDescription>
                </div>
                <Link href="/carpool/create">
                  <Button size="sm" className="gap-1">
                    <Plus className="h-4 w-4" />
                    Créer
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {myTripsLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
                </div>
              ) : myTrips && myTrips.length > 0 ? (
                <div className="space-y-3">
                  {myTrips.slice(0, 4).map((trip: any) => (
                    <Link key={trip.id} href={`/carpool/${trip.id}`}>
                      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin className="h-4 w-4 text-green-500" />
                            <span className="font-semibold">{trip.departureCity}</span>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            <MapPin className="h-4 w-4 text-red-500" />
                            <span className="font-semibold">{trip.arrivalCity}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDateTime(trip.departureTime)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {trip.availableSeats} place(s) dispo
                            </span>
                            <span className="flex items-center gap-1">
                              <Coins className="h-3 w-3" />
                              {trip.pricePerSeat} FCFA/place
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getTripStatusBadge(trip.status)}
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                    </Link>
                  ))}
                  {myTrips.length > 4 && (
                    <Button variant="ghost" className="w-full">
                      Voir tous mes trajets ({myTrips.length})
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 bg-muted/30 rounded-lg">
                  <Navigation className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="font-medium mb-1">Aucun trajet créé</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Proposez un trajet pour partager vos frais avec d'autres passagers
                  </p>
                  <Link href="/carpool/create">
                    <Button>Proposer un trajet</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* My Rental Offers (as owner) */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-primary" />
                    Mes offres de location
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Les véhicules que vous mettez en location
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {offersLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
                </div>
              ) : myOffers && myOffers.length > 0 ? (
                <div className="space-y-3">
                  {myOffers.slice(0, 4).map((offer: any) => (
                    <Link key={offer.id} href={`/rental/${offer.id}`}>
                      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center">
                            {offer.vehicle?.photos?.[0] ? (
                              <img src={offer.vehicle.photos[0].url} alt="" className="h-full w-full object-cover rounded-lg" />
                            ) : (
                              <Car className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold">{offer.vehicle?.brand} {offer.vehicle?.model}</p>
                            <p className="text-sm text-muted-foreground">
                              {offer.pricePerDay?.toLocaleString()} FCFA/jour • {offer.location}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={offer.isActive ? "default" : "outline"}>
                            {offer.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                    </Link>
                  ))}
                  {myOffers.length > 4 && (
                    <Button variant="ghost" className="w-full">
                      Voir toutes mes offres ({myOffers.length})
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 bg-muted/30 rounded-lg">
                  <Key className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="font-medium mb-1">Aucune offre de location</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Mettez votre véhicule en location pour générer des revenus
                  </p>
                  <Link href="/vehicles">
                    <Button>Gérer mes véhicules</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Passenger/Renter Tab */}
        <TabsContent value="passenger" className="space-y-6">
          {/* Passenger Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Réservations covoiturage</p>
                    <p className="text-2xl font-bold">{myReservations?.length || 0}</p>
                    {pendingReservations > 0 && (
                      <p className="text-xs text-amber-600">{pendingReservations} en attente</p>
                    )}
                  </div>
                  <MapPin className="h-8 w-8 text-blue-500 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Trajets confirmés</p>
                    <p className="text-2xl font-bold">{confirmedReservations}</p>
                    <p className="text-xs text-green-600">prêts à partir</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-500 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Locations de véhicules</p>
                    <p className="text-2xl font-bold">{myBookings?.length || 0}</p>
                    {pendingBookings > 0 && (
                      <p className="text-xs text-amber-600">{pendingBookings} en attente</p>
                    )}
                  </div>
                  <ShoppingBag className="h-8 w-8 text-purple-500 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Locations confirmées</p>
                    <p className="text-2xl font-bold">{confirmedBookings}</p>
                    <p className="text-xs text-muted-foreground">véhicules réservés</p>
                  </div>
                  <Key className="h-8 w-8 text-amber-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-800 dark:text-blue-200">Vous êtes en mode passager/locataire</p>
              <p className="text-sm text-blue-600 dark:text-blue-300">
                Cette section affiche les trajets et véhicules que vous avez réservés auprès d'autres utilisateurs.
              </p>
            </div>
          </div>

          {/* My Carpool Reservations (as passenger) */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Mes réservations de covoiturage
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Les trajets que vous avez réservés en tant que passager
                  </CardDescription>
                </div>
                <Link href="/carpool">
                  <Button size="sm" variant="outline" className="gap-1">
                    Rechercher un trajet
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {reservationsLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
                </div>
              ) : myReservations && myReservations.length > 0 ? (
                <div className="space-y-3">
                  {myReservations.slice(0, 4).map((reservation: any) => (
                    <Link key={reservation.id} href={`/carpool/${reservation.trip?.id}`}>
                      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin className="h-4 w-4 text-green-500" />
                            <span className="font-semibold">{reservation.trip?.departureCity}</span>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            <MapPin className="h-4 w-4 text-red-500" />
                            <span className="font-semibold">{reservation.trip?.arrivalCity}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {reservation.trip?.departureTime && formatDateTime(reservation.trip.departureTime)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {reservation.seatsReserved} place(s)
                            </span>
                            <span className="flex items-center gap-1">
                              <Coins className="h-3 w-3" />
                              {reservation.totalPrice?.toLocaleString()} FCFA
                            </span>
                          </div>
                          {reservation.trip?.driver && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Conducteur: {reservation.trip.driver.firstName} {reservation.trip.driver.lastName}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          {getReservationStatusBadge(reservation.status)}
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                    </Link>
                  ))}
                  {myReservations.length > 4 && (
                    <Button variant="ghost" className="w-full">
                      Voir toutes mes réservations ({myReservations.length})
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 bg-muted/30 rounded-lg">
                  <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="font-medium mb-1">Aucune réservation de covoiturage</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Recherchez un trajet pour voyager avec d'autres passagers
                  </p>
                  <Link href="/carpool">
                    <Button>Rechercher un trajet</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* My Rental Bookings (as renter) */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                    Mes locations de véhicules
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Les véhicules que vous avez loués auprès d'autres propriétaires
                  </CardDescription>
                </div>
                <Link href="/rental">
                  <Button size="sm" variant="outline" className="gap-1">
                    Louer un véhicule
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {bookingsLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
                </div>
              ) : myBookings && myBookings.length > 0 ? (
                <div className="space-y-3">
                  {myBookings.slice(0, 4).map((booking: any) => (
                    <Link key={booking.id} href={`/rental/${booking.rentalOffer?.id}`}>
                      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center">
                            {booking.rentalOffer?.vehicle?.photos?.[0] ? (
                              <img src={booking.rentalOffer.vehicle.photos[0].url} alt="" className="h-full w-full object-cover rounded-lg" />
                            ) : (
                              <Car className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold">
                              {booking.rentalOffer?.vehicle?.brand} {booking.rentalOffer?.vehicle?.model}
                            </p>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Coins className="h-3 w-3" />
                                {(booking.totalPrice ?? 0).toLocaleString()} FCFA
                              </span>
                            </div>
                            {booking.rentalOffer?.vehicle?.owner && (
                              <p className="text-xs text-muted-foreground">
                                Propriétaire: {booking.rentalOffer.vehicle.owner.firstName} {booking.rentalOffer.vehicle.owner.lastName}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getBookingStatusBadge(booking.status)}
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                    </Link>
                  ))}
                  {myBookings.length > 4 && (
                    <Button variant="ghost" className="w-full">
                      Voir toutes mes locations ({myBookings.length})
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 bg-muted/30 rounded-lg">
                  <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="font-medium mb-1">Aucune location de véhicule</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Louez un véhicule pour vos déplacements
                  </p>
                  <Link href="/rental">
                    <Button>Louer un véhicule</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

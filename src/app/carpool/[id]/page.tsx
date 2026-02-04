"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { carpoolService } from "@/lib/services";
import { useAuth } from "@/providers";
import { toast } from "sonner";
import { MapPin, Calendar, Users, Car, ArrowLeft, Check, X, Clock, Star, Shield, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CarpoolReservationStatus, UserMode } from "@/types";
import { redirectToLoginWithIntent } from "@/lib/redirect";
import { notifications } from "@/lib/notifications";

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  const [seats, setSeats] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);

  const tripId = params.id as string;

  const { data: trip, isLoading } = useQuery({
    queryKey: ["carpool", "trip", tripId],
    queryFn: () => carpoolService.getTripById(tripId),
    enabled: !!tripId,
  });

  const reserveMutation = useMutation({
    mutationFn: () => carpoolService.createReservation(tripId, { seatsReserved: seats }),
    onSuccess: () => {
      notifications.reservationCreated();
      queryClient.invalidateQueries({ queryKey: ["carpool", "trip", tripId] });
      setDialogOpen(false);
    },
    onError: (error: any) => {
      notifications.genericError(error.response?.data?.message || "Erreur lors de la réservation");
    },
  });

  const acceptMutation = useMutation({
    mutationFn: (reservationId: string) => carpoolService.acceptReservation(reservationId),
    onSuccess: () => {
      notifications.reservationAccepted();
      queryClient.invalidateQueries({ queryKey: ["carpool", "trip", tripId] });
    },
    onError: (error: any) => {
      notifications.genericError(error.response?.data?.message || "Erreur");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (reservationId: string) => carpoolService.rejectReservation(reservationId),
    onSuccess: () => {
      notifications.reservationRejected();
      queryClient.invalidateQueries({ queryKey: ["carpool", "trip", tripId] });
    },
    onError: (error: any) => {
      notifications.genericError(error.response?.data?.message || "Erreur");
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => carpoolService.cancelTrip(tripId),
    onSuccess: () => {
      notifications.tripCancelled();
      router.push("/carpool");
    },
    onError: (error: any) => {
      notifications.genericError(error.response?.data?.message || "Erreur");
    },
  });

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  const isDriver = user?.id === trip?.driverId;
  const hasReservation = trip?.reservations?.some(
    (r) => r.passengerId === user?.id && ["PENDING", "CONFIRMED"].includes(r.status)
  );

  const getStatusBadge = (status: CarpoolReservationStatus) => {
    switch (status) {
      case "PENDING":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">En attente</Badge>;
      case "CONFIRMED":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Confirmée</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">Refusée</Badge>;
      case "CANCELLED":
        return <Badge variant="secondary">Annulée</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
        <div className="container py-8">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 rounded-2xl" />
              <Skeleton className="h-48 rounded-2xl" />
            </div>
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
        <div className="container py-16 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
            <MapPin className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Trajet non trouvé</h1>
          <p className="text-muted-foreground mb-6">Ce trajet n&apos;existe pas ou a été supprimé.</p>
          <Link href="/carpool">
            <Button className="shadow-glow">Retour aux trajets</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background py-8 overflow-hidden">
        <div className="absolute inset-0 pattern-dots opacity-30" />
        <div className="container relative">
          <Link href="/carpool" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 group">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Retour aux trajets
          </Link>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge className={trip.status === "OPEN" ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-muted text-muted-foreground"}>
                  {trip.status === "OPEN" ? "Disponible" : trip.status === "FULL" ? "Complet" : trip.status}
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold">
                {trip.departureCity} <span className="text-primary">→</span> {trip.arrivalCity}
              </h1>
              <p className="text-muted-foreground mt-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {format(new Date(trip.departureTime), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-primary">{trip.pricePerSeat.toLocaleString()}</p>
              <p className="text-muted-foreground">FCFA / place</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Trip Info */}
            <Card className="border-0 shadow-soft overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-primary to-secondary" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Détails du trajet
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Route visualization */}
                <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-xl">
                  <div className="flex flex-col items-center py-1">
                    <div className="w-4 h-4 rounded-full bg-primary ring-4 ring-primary/20" />
                    <div className="w-0.5 h-16 bg-gradient-to-b from-primary to-secondary" />
                    <div className="w-4 h-4 rounded-full bg-secondary ring-4 ring-secondary/20" />
                  </div>
                  <div className="flex-1 space-y-6">
                    <div>
                      <p className="font-semibold text-lg">{trip.departureCity}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        Départ à {format(new Date(trip.departureTime), "HH:mm")}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{trip.arrivalCity}</p>
                      <p className="text-sm text-muted-foreground">Arrivée</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Places disponibles</p>
                      <p className="font-semibold text-lg">{trip.availableSeats} place(s)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-semibold">{format(new Date(trip.departureTime), "dd/MM/yyyy")}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10">
                    <Car className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <p className="font-semibold">
                      {trip.vehicle?.brand} {trip.vehicle?.model}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {trip.vehicle?.color} • {trip.vehicle?.numberOfSeats} places • {trip.vehicle?.year}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Driver Info */}
            <Card className="border-0 shadow-soft overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Conducteur
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl">
                  <Avatar className="h-16 w-16 ring-4 ring-primary/20">
                    <AvatarImage src={trip.driver?.photoUrl} />
                    <AvatarFallback className="text-lg bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                      {getInitials(trip.driver?.firstName, trip.driver?.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-lg font-semibold">
                      {trip.driver?.firstName} {trip.driver?.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">{trip.driver?.email}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-medium">4.8</span>
                      <span className="text-sm text-muted-foreground">(12 avis)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reservations (for driver) */}
            {isDriver && trip.reservations && trip.reservations.length > 0 && (
              <Card className="border-0 shadow-soft overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Réservations ({trip.reservations.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {trip.reservations.map((reservation) => (
                    <div
                      key={reservation.id}
                      className="flex items-center justify-between p-4 bg-muted/30 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="ring-2 ring-primary/20">
                          <AvatarImage src={reservation.passenger?.photoUrl} />
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
                            {getInitials(reservation.passenger?.firstName, reservation.passenger?.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {reservation.passenger?.firstName} {reservation.passenger?.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {reservation.seatsReserved} place(s) • {(reservation.seatsReserved * trip.pricePerSeat).toLocaleString()} FCFA
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(reservation.status)}
                        {reservation.status === "PENDING" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => acceptMutation.mutate(reservation.id)}
                              disabled={acceptMutation.isPending}
                              className="bg-green-500 hover:bg-green-600 text-white"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => rejectMutation.mutate(reservation.id)}
                              disabled={rejectMutation.isPending}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="border-0 shadow-soft overflow-hidden sticky top-24">
              <div className="h-1 bg-gradient-to-r from-primary to-secondary" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Réservation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl mb-6">
                  <p className="text-4xl font-bold text-primary">{trip.pricePerSeat.toLocaleString()}</p>
                  <p className="text-muted-foreground">FCFA / place</p>
                </div>

                {isAuthenticated && !isDriver && trip.status === "OPEN" && !hasReservation && (
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full h-12 shadow-glow">Réserver ce trajet</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Réserver ce trajet</DialogTitle>
                        <DialogDescription>
                          {trip.departureCity} → {trip.arrivalCity}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="seats">Nombre de places</Label>
                          <Input
                            id="seats"
                            type="number"
                            min={1}
                            max={trip.availableSeats}
                            value={seats}
                            onChange={(e) => setSeats(Number(e.target.value))}
                            className="h-12"
                          />
                          <p className="text-sm text-muted-foreground">
                            {trip.availableSeats} place(s) disponible(s)
                          </p>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl">
                          <p className="text-sm text-muted-foreground">Total à payer</p>
                          <p className="text-3xl font-bold text-primary">{(seats * trip.pricePerSeat).toLocaleString()} FCFA</p>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                          Annuler
                        </Button>
                        <Button
                          onClick={() => reserveMutation.mutate()}
                          disabled={reserveMutation.isPending}
                          className="shadow-glow"
                        >
                          {reserveMutation.isPending ? "Réservation..." : "Confirmer"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}

                {hasReservation && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-center gap-2 text-green-700">
                      <Check className="h-5 w-5" />
                      <p className="font-medium">Vous avez réservé ce trajet</p>
                    </div>
                  </div>
                )}

                {isDriver && trip.status !== "CANCELLED" && trip.status !== "COMPLETED" && (
                  <Button
                    variant="destructive"
                    className="w-full h-12"
                    onClick={() => cancelMutation.mutate()}
                    disabled={cancelMutation.isPending}
                  >
                    {cancelMutation.isPending ? "Annulation..." : "Annuler le trajet"}
                  </Button>
                )}

                {!isAuthenticated && (
                  <Button 
                    className="w-full h-12 shadow-glow"
                    onClick={() => redirectToLoginWithIntent(
                      router,
                      `/carpool/${tripId}`,
                      "reserve_carpool",
                      UserMode.VOYAGEUR
                    )}
                  >
                    Se connecter pour réserver
                  </Button>
                )}

                {/* Trust badges */}
                <div className="mt-6 pt-6 border-t space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4 text-primary" />
                    <span>Paiement sécurisé en personne</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Annulation gratuite</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

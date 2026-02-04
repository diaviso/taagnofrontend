"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/providers";
import { carpoolService } from "@/lib/services";
import { CarpoolReservation, CarpoolReservationStatus } from "@/types";
import {
  MapPin,
  ArrowLeft,
  ChevronRight,
  Users,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Coins,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { notifications } from "@/lib/notifications";

export default function MesReservationsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading: authLoading, isVoyageur } = useAuth();

  const { data: reservations, isLoading } = useQuery({
    queryKey: ["carpool", "reservations", "mine"],
    queryFn: carpoolService.getMyReservations,
    enabled: isAuthenticated,
  });

  const cancelMutation = useMutation({
    mutationFn: (reservationId: string) => carpoolService.cancelReservation(reservationId),
    onSuccess: () => {
      notifications.reservationCancelled();
      queryClient.invalidateQueries({ queryKey: ["carpool", "reservations", "mine"] });
    },
    onError: (error: any) => {
      notifications.genericError(error.response?.data?.message || "Erreur lors de l'annulation");
    },
  });

  const handleCancel = (e: React.MouseEvent, reservationId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Êtes-vous sûr de vouloir annuler cette réservation ?")) {
      cancelMutation.mutate(reservationId);
    }
  };

  const getStatusConfig = (status: CarpoolReservationStatus) => {
    switch (status) {
      case CarpoolReservationStatus.PENDING:
        return { label: "En attente", variant: "secondary" as const, icon: Clock, color: "text-amber-600" };
      case CarpoolReservationStatus.CONFIRMED:
        return { label: "Confirmée", variant: "default" as const, icon: CheckCircle2, color: "text-green-600" };
      case CarpoolReservationStatus.REJECTED:
        return { label: "Refusée", variant: "destructive" as const, icon: XCircle, color: "text-red-600" };
      case CarpoolReservationStatus.CANCELLED:
        return { label: "Annulée", variant: "outline" as const, icon: XCircle, color: "text-gray-600" };
      case CarpoolReservationStatus.COMPLETED:
        return { label: "Terminée", variant: "outline" as const, icon: CheckCircle2, color: "text-gray-600" };
    }
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "EEE d MMM à HH:mm", { locale: fr });
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push("/login");
    return null;
  }

  const pendingReservations = reservations?.filter((r: CarpoolReservation) => r.status === CarpoolReservationStatus.PENDING) || [];
  const confirmedReservations = reservations?.filter((r: CarpoolReservation) => r.status === CarpoolReservationStatus.CONFIRMED) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Mes réservations</h1>
            <p className="text-muted-foreground">Vos trajets réservés en tant que passager</p>
          </div>
          <Link href="/carpool">
            <Button className="gap-2">
              <Search className="h-4 w-4" />
              Trouver un trajet
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">En attente</p>
              <p className="text-2xl font-bold text-amber-600">{pendingReservations.length}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Confirmées</p>
              <p className="text-2xl font-bold text-green-600">{confirmedReservations.length}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{reservations?.length || 0}</p>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full" />)}
          </div>
        ) : reservations && reservations.length > 0 ? (
          <div className="space-y-4">
            {reservations.map((reservation: CarpoolReservation) => {
              const statusConfig = getStatusConfig(reservation.status);
              const StatusIcon = statusConfig.icon;
              const trip = reservation.trip;
              
              return (
                <Link key={reservation.id} href={`/carpool/${trip?.id}`}>
                  <Card className="hover:shadow-lg transition-all cursor-pointer group">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                          <MapPin className="h-7 w-7 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 text-lg font-semibold">
                            <MapPin className="h-4 w-4 text-green-500" />
                            {trip?.departureCity}
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            <MapPin className="h-4 w-4 text-red-500" />
                            {trip?.arrivalCity}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {trip?.departureTime && formatDateTime(trip.departureTime)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3.5 w-3.5" />
                              {reservation.seatsReserved} place(s)
                            </span>
                          </div>
                          {trip?.driver && (
                            <div className="flex items-center gap-2 mt-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={trip.driver.photoUrl} />
                                <AvatarFallback className="text-xs">
                                  {getInitials(trip.driver.firstName, trip.driver.lastName)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-muted-foreground">
                                Conducteur: {trip.driver.firstName} {trip.driver.lastName}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-primary">
                            {((trip?.pricePerSeat || 0) * reservation.seatsReserved).toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">FCFA total</p>
                        </div>
                        <Badge variant={statusConfig.variant} className="gap-1">
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig.label}
                        </Badge>
                        {(reservation.status === CarpoolReservationStatus.PENDING || 
                          reservation.status === CarpoolReservationStatus.CONFIRMED) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={(e) => handleCancel(e, reservation.id)}
                            disabled={cancelMutation.isPending}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <MapPin className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Aucune réservation</h3>
              <p className="text-muted-foreground mb-6">
                Recherchez un trajet et réservez votre place.
              </p>
              <Link href="/carpool">
                <Button>
                  <Search className="h-4 w-4 mr-2" />
                  Trouver un trajet
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { carpoolService } from "@/lib/services";
import { CarpoolTrip, CarpoolTripStatus, CarpoolReservation, CarpoolReservationStatus } from "@/types";
import { toast } from "sonner";
import {
  Users,
  Search,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Ban,
  UserCheck,
  UserX,
  Navigation,
  ArrowRight,
  Inbox,
  Filter,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function ProprietaireReservationsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: trips, isLoading } = useQuery({
    queryKey: ["carpool", "trips", "mine"],
    queryFn: carpoolService.getMyTrips,
  });

  const acceptMutation = useMutation({
    mutationFn: (reservationId: string) => carpoolService.acceptReservation(reservationId),
    onSuccess: () => {
      toast.success("Réservation acceptée !");
      queryClient.invalidateQueries({ queryKey: ["carpool", "trips", "mine"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de l'acceptation");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (reservationId: string) => carpoolService.rejectReservation(reservationId),
    onSuccess: () => {
      toast.success("Réservation refusée");
      queryClient.invalidateQueries({ queryKey: ["carpool", "trips", "mine"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors du refus");
    },
  });

  const getReservationStatusConfig = (status: CarpoolReservationStatus) => {
    switch (status) {
      case CarpoolReservationStatus.PENDING:
        return { label: "En attente", color: "text-amber-600", bgColor: "bg-amber-500/10", icon: Clock };
      case CarpoolReservationStatus.CONFIRMED:
        return { label: "Confirmée", color: "text-green-600", bgColor: "bg-green-500/10", icon: CheckCircle2 };
      case CarpoolReservationStatus.REJECTED:
        return { label: "Refusée", color: "text-red-600", bgColor: "bg-red-500/10", icon: XCircle };
      case CarpoolReservationStatus.CANCELLED:
        return { label: "Annulée", color: "text-gray-600", bgColor: "bg-gray-500/10", icon: Ban };
      case CarpoolReservationStatus.COMPLETED:
        return { label: "Terminée", color: "text-blue-600", bgColor: "bg-blue-500/10", icon: CheckCircle2 };
      default:
        return { label: status, color: "text-gray-600", bgColor: "bg-gray-500/10", icon: Clock };
    }
  };

  // Flatten all reservations from all trips
  const allReservations: (CarpoolReservation & { trip: CarpoolTrip })[] = [];
  trips?.forEach((trip: CarpoolTrip) => {
    trip.reservations?.forEach((res: CarpoolReservation) => {
      allReservations.push({ ...res, trip });
    });
  });

  // Sort by creation date (newest first)
  allReservations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const filteredReservations = allReservations.filter((res) => {
    const matchesStatus = statusFilter === "all" || res.status === statusFilter;
    const matchesSearch =
      !searchQuery ||
      res.passenger?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.passenger?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.trip.departureCity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.trip.arrivalCity.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingCount = allReservations.filter((r) => r.status === CarpoolReservationStatus.PENDING).length;
  const confirmedCount = allReservations.filter((r) => r.status === CarpoolReservationStatus.CONFIRMED).length;
  const totalCount = allReservations.length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <Users className="h-5 w-5 text-emerald-500" />
          </div>
          Réservations de trajets
        </h1>
        <p className="text-muted-foreground mt-1">
          Gérez les demandes de réservation sur vos trajets de covoiturage
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">En attente</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{confirmedCount}</p>
                <p className="text-sm text-muted-foreground">Confirmées</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{totalCount}</p>
                <p className="text-sm text-muted-foreground">Total</p>
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
                placeholder="Rechercher par passager ou ville..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 bg-muted/50 border-0"
              />
            </div>
            <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full md:w-auto">
              <TabsList className="grid grid-cols-4 w-full md:w-auto">
                <TabsTrigger value="all" className="text-xs md:text-sm">Tous</TabsTrigger>
                <TabsTrigger value={CarpoolReservationStatus.PENDING} className="text-xs md:text-sm">En attente</TabsTrigger>
                <TabsTrigger value={CarpoolReservationStatus.CONFIRMED} className="text-xs md:text-sm">Confirmées</TabsTrigger>
                <TabsTrigger value={CarpoolReservationStatus.REJECTED} className="text-xs md:text-sm">Refusées</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Reservations List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : filteredReservations.length > 0 ? (
        <div className="space-y-4">
          {filteredReservations.map((reservation) => {
            const statusConfig = getReservationStatusConfig(reservation.status);
            const StatusIcon = statusConfig.icon;
            const isPending = reservation.status === CarpoolReservationStatus.PENDING;

            return (
              <Card
                key={reservation.id}
                className={`overflow-hidden transition-all duration-300 ${
                  isPending ? "border-l-4 border-l-amber-500 shadow-md" : "border-l-4 border-l-transparent"
                }`}
              >
                <CardContent className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Passenger info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-12 w-12 ring-2 ring-emerald-500/20">
                        <AvatarImage src={reservation.passenger?.photoUrl} />
                        <AvatarFallback className="bg-emerald-500/10 text-emerald-600 font-semibold">
                          {reservation.passenger?.firstName?.charAt(0)}
                          {reservation.passenger?.lastName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-semibold truncate">
                          {reservation.passenger?.firstName} {reservation.passenger?.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {reservation.seatsReserved} place{reservation.seatsReserved > 1 ? "s" : ""} réservée{reservation.seatsReserved > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>

                    {/* Trip info */}
                    <div className="flex items-center gap-2 flex-1 min-w-0 px-4 py-2 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2 min-w-0">
                        <MapPin className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="font-medium truncate">{reservation.trip.departureCity}</span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex items-center gap-2 min-w-0">
                        <MapPin className="h-4 w-4 text-red-500 flex-shrink-0" />
                        <span className="font-medium truncate">{reservation.trip.arrivalCity}</span>
                      </div>
                      <div className="hidden md:flex items-center gap-1.5 ml-3 text-sm text-muted-foreground flex-shrink-0">
                        <Calendar className="h-3.5 w-3.5" />
                        {format(new Date(reservation.trip.departureTime), "EEE d MMM à HH:mm", { locale: fr })}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-center px-3">
                      <p className="text-lg font-bold text-emerald-600">
                        {(reservation.seatsReserved * reservation.trip.pricePerSeat).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">FCFA</p>
                    </div>

                    {/* Status + Actions */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <Badge variant="outline" className={`gap-1 ${statusConfig.bgColor} ${statusConfig.color} border-0`}>
                        <StatusIcon className="h-3 w-3" />
                        {statusConfig.label}
                      </Badge>

                      {isPending && (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            className="gap-1.5 bg-green-500 hover:bg-green-600 text-white"
                            onClick={() => acceptMutation.mutate(reservation.id)}
                            disabled={acceptMutation.isPending || rejectMutation.isPending}
                          >
                            <UserCheck className="h-4 w-4" />
                            Accepter
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1.5 border-red-500/30 text-red-600 hover:bg-red-50 hover:text-red-700"
                                disabled={acceptMutation.isPending || rejectMutation.isPending}
                              >
                                <UserX className="h-4 w-4" />
                                Refuser
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Refuser cette réservation ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  La réservation de {reservation.passenger?.firstName} {reservation.passenger?.lastName} pour{" "}
                                  {reservation.seatsReserved} place{reservation.seatsReserved > 1 ? "s" : ""} sera refusée.
                                  Cette action est irréversible.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-500 hover:bg-red-600"
                                  onClick={() => rejectMutation.mutate(reservation.id)}
                                >
                                  Refuser
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mobile date */}
                  <div className="md:hidden mt-3 pt-3 border-t flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {format(new Date(reservation.trip.departureTime), "EEEE d MMMM à HH:mm", { locale: fr })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-0 shadow-soft">
          <CardContent className="p-16 text-center">
            <div className="h-20 w-20 mx-auto rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6">
              <Inbox className="h-10 w-10 text-emerald-500/50" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {searchQuery || statusFilter !== "all" ? "Aucun résultat" : "Aucune réservation"}
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {searchQuery || statusFilter !== "all"
                ? "Aucune réservation ne correspond à vos critères."
                : "Vous n'avez pas encore reçu de demande de réservation sur vos trajets."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

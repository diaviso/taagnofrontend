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
import { rentalService } from "@/lib/services";
import { RentalOffer, RentalBooking, RentalBookingStatus } from "@/types";
import { toast } from "sonner";
import {
  Key,
  Search,
  Car,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Ban,
  UserCheck,
  UserX,
  Inbox,
  Users,
  Wallet,
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function ProprietaireDemandesLocationPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: offers, isLoading } = useQuery({
    queryKey: ["rental", "offers", "mine"],
    queryFn: rentalService.getMyOffers,
  });

  const acceptMutation = useMutation({
    mutationFn: (bookingId: string) => rentalService.acceptBooking(bookingId),
    onSuccess: () => {
      toast.success("Demande de location acceptée !");
      queryClient.invalidateQueries({ queryKey: ["rental", "offers", "mine"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de l'acceptation");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (bookingId: string) => rentalService.rejectBooking(bookingId),
    onSuccess: () => {
      toast.success("Demande de location refusée");
      queryClient.invalidateQueries({ queryKey: ["rental", "offers", "mine"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors du refus");
    },
  });

  const completeMutation = useMutation({
    mutationFn: (bookingId: string) => rentalService.completeBooking(bookingId),
    onSuccess: () => {
      toast.success("Location marquée comme terminée");
      queryClient.invalidateQueries({ queryKey: ["rental", "offers", "mine"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur");
    },
  });

  const getBookingStatusConfig = (status: RentalBookingStatus) => {
    switch (status) {
      case RentalBookingStatus.PENDING:
        return { label: "En attente", color: "text-amber-600", bgColor: "bg-amber-500/10", icon: Clock };
      case RentalBookingStatus.CONFIRMED:
        return { label: "Confirmée", color: "text-green-600", bgColor: "bg-green-500/10", icon: CheckCircle2 };
      case RentalBookingStatus.REJECTED:
        return { label: "Refusée", color: "text-red-600", bgColor: "bg-red-500/10", icon: XCircle };
      case RentalBookingStatus.CANCELLED:
        return { label: "Annulée", color: "text-gray-600", bgColor: "bg-gray-500/10", icon: Ban };
      case RentalBookingStatus.COMPLETED:
        return { label: "Terminée", color: "text-blue-600", bgColor: "bg-blue-500/10", icon: CheckCircle2 };
      default:
        return { label: status, color: "text-gray-600", bgColor: "bg-gray-500/10", icon: Clock };
    }
  };

  // Flatten all bookings from all offers
  const allBookings: (RentalBooking & { offer: RentalOffer })[] = [];
  offers?.forEach((offer: RentalOffer) => {
    offer.bookings?.forEach((booking: RentalBooking) => {
      allBookings.push({ ...booking, offer });
    });
  });

  // Sort by creation date (newest first)
  allBookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const filteredBookings = allBookings.filter((booking) => {
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    const matchesSearch =
      !searchQuery ||
      booking.renter?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.renter?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.offer.vehicle?.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.offer.vehicle?.model?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingCount = allBookings.filter((b) => b.status === RentalBookingStatus.PENDING).length;
  const confirmedCount = allBookings.filter((b) => b.status === RentalBookingStatus.CONFIRMED).length;
  const totalCount = allBookings.length;

  const formatDateRange = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const days = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
    return {
      start: format(s, "d MMM yyyy", { locale: fr }),
      end: format(e, "d MMM yyyy", { locale: fr }),
      days,
    };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
            <Key className="h-5 w-5 text-violet-500" />
          </div>
          Demandes de location
        </h1>
        <p className="text-muted-foreground mt-1">
          Gérez les demandes de location de vos véhicules
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
        <Card className="border-l-4 border-l-violet-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-violet-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-violet-600">{totalCount}</p>
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
                placeholder="Rechercher par locataire ou véhicule..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 bg-muted/50 border-0"
              />
            </div>
            <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full md:w-auto">
              <TabsList className="grid grid-cols-4 w-full md:w-auto">
                <TabsTrigger value="all" className="text-xs md:text-sm">Tous</TabsTrigger>
                <TabsTrigger value={RentalBookingStatus.PENDING} className="text-xs md:text-sm">En attente</TabsTrigger>
                <TabsTrigger value={RentalBookingStatus.CONFIRMED} className="text-xs md:text-sm">Confirmées</TabsTrigger>
                <TabsTrigger value={RentalBookingStatus.REJECTED} className="text-xs md:text-sm">Refusées</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : filteredBookings.length > 0 ? (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const statusConfig = getBookingStatusConfig(booking.status);
            const StatusIcon = statusConfig.icon;
            const isPending = booking.status === RentalBookingStatus.PENDING;
            const isConfirmed = booking.status === RentalBookingStatus.CONFIRMED;
            const dateRange = formatDateRange(booking.startDate, booking.endDate);

            return (
              <Card
                key={booking.id}
                className={`overflow-hidden transition-all duration-300 ${
                  isPending ? "border-l-4 border-l-amber-500 shadow-md" : "border-l-4 border-l-transparent"
                }`}
              >
                <CardContent className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Renter info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-12 w-12 ring-2 ring-violet-500/20">
                        <AvatarImage src={booking.renter?.photoUrl} />
                        <AvatarFallback className="bg-violet-500/10 text-violet-600 font-semibold">
                          {booking.renter?.firstName?.charAt(0)}
                          {booking.renter?.lastName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-semibold truncate">
                          {booking.renter?.firstName} {booking.renter?.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">Locataire</p>
                      </div>
                    </div>

                    {/* Vehicle + dates */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Car className="h-4 w-4 text-violet-500 flex-shrink-0" />
                        <span className="font-medium">
                          {booking.offer.vehicle?.brand} {booking.offer.vehicle?.model}
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">{booking.offer.vehicle?.licensePlate}</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 text-sm">
                        <Calendar className="h-4 w-4 text-violet-500 flex-shrink-0" />
                        <span className="font-medium">{dateRange.start}</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">{dateRange.end}</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {dateRange.days} jour{dateRange.days > 1 ? "s" : ""}
                        </Badge>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-center px-4">
                      <p className="text-xl font-bold text-violet-600">
                        {booking.totalPrice?.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">FCFA total</p>
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
                            onClick={() => acceptMutation.mutate(booking.id)}
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
                                <AlertDialogTitle>Refuser cette demande ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  La demande de location de {booking.renter?.firstName} {booking.renter?.lastName} pour{" "}
                                  {booking.offer.vehicle?.brand} {booking.offer.vehicle?.model} ({dateRange.days} jour{dateRange.days > 1 ? "s" : ""})
                                  sera refusée. Cette action est irréversible.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-500 hover:bg-red-600"
                                  onClick={() => rejectMutation.mutate(booking.id)}
                                >
                                  Refuser
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}

                      {isConfirmed && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 border-blue-500/30 text-blue-600 hover:bg-blue-50"
                          onClick={() => completeMutation.mutate(booking.id)}
                          disabled={completeMutation.isPending}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Terminer
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-0 shadow-soft">
          <CardContent className="p-16 text-center">
            <div className="h-20 w-20 mx-auto rounded-2xl bg-violet-500/10 flex items-center justify-center mb-6">
              <Inbox className="h-10 w-10 text-violet-500/50" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {searchQuery || statusFilter !== "all" ? "Aucun résultat" : "Aucune demande"}
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {searchQuery || statusFilter !== "all"
                ? "Aucune demande ne correspond à vos critères."
                : "Vous n'avez pas encore reçu de demande de location pour vos véhicules."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

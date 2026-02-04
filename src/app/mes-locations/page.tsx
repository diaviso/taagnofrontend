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
import { rentalService } from "@/lib/services";
import { RentalBooking, RentalBookingStatus } from "@/types";
import {
  Car,
  ArrowLeft,
  ChevronRight,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { notifications } from "@/lib/notifications";

export default function MesLocationsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["rental", "bookings", "mine"],
    queryFn: rentalService.getMyBookings,
    enabled: isAuthenticated,
  });

  const cancelMutation = useMutation({
    mutationFn: (bookingId: string) => rentalService.cancelBooking(bookingId),
    onSuccess: () => {
      notifications.bookingCancelled();
      queryClient.invalidateQueries({ queryKey: ["rental", "bookings", "mine"] });
    },
    onError: (error: any) => {
      notifications.genericError(error.response?.data?.message || "Erreur lors de l'annulation");
    },
  });

  const handleCancel = (e: React.MouseEvent, bookingId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Êtes-vous sûr de vouloir annuler cette réservation ?")) {
      cancelMutation.mutate(bookingId);
    }
  };

  const getStatusConfig = (status: RentalBookingStatus) => {
    switch (status) {
      case RentalBookingStatus.PENDING:
        return { label: "En attente", variant: "secondary" as const, icon: Clock };
      case RentalBookingStatus.CONFIRMED:
        return { label: "Confirmée", variant: "default" as const, icon: CheckCircle2 };
      case RentalBookingStatus.REJECTED:
        return { label: "Refusée", variant: "destructive" as const, icon: XCircle };
      case RentalBookingStatus.CANCELLED:
        return { label: "Annulée", variant: "outline" as const, icon: XCircle };
      case RentalBookingStatus.COMPLETED:
        return { label: "Terminée", variant: "outline" as const, icon: CheckCircle2 };
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d MMM yyyy", { locale: fr });
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

  const pendingBookings = bookings?.filter((b: RentalBooking) => b.status === RentalBookingStatus.PENDING) || [];
  const confirmedBookings = bookings?.filter((b: RentalBooking) => b.status === RentalBookingStatus.CONFIRMED) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-500/5 via-background to-orange-500/5">
      <div className="container py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Mes locations</h1>
            <p className="text-muted-foreground">Véhicules que vous avez loués</p>
          </div>
          <Link href="/rental">
            <Button className="gap-2 bg-amber-500 hover:bg-amber-600">
              <Search className="h-4 w-4" />
              Louer un véhicule
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">En attente</p>
              <p className="text-2xl font-bold text-amber-600">{pendingBookings.length}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Confirmées</p>
              <p className="text-2xl font-bold text-green-600">{confirmedBookings.length}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{bookings?.length || 0}</p>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full" />)}
          </div>
        ) : bookings && bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking: RentalBooking) => {
              const statusConfig = getStatusConfig(booking.status);
              const StatusIcon = statusConfig.icon;
              const offer = booking.rentalOffer;
              const vehicle = offer?.vehicle;
              
              return (
                <Link key={booking.id} href={`/rental/${offer?.id}`}>
                  <Card className="hover:shadow-lg transition-all cursor-pointer group">
                    <CardContent className="p-0">
                      <div className="flex items-stretch">
                        <div className="w-32 h-28 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center rounded-l-lg overflow-hidden">
                          {vehicle?.photos && vehicle.photos.length > 0 ? (
                            <img
                              src={vehicle.photos[0].url}
                              alt={`${vehicle?.brand} ${vehicle?.model}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Car className="h-12 w-12 text-amber-400" />
                          )}
                        </div>
                        <div className="flex-1 p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold group-hover:text-amber-600 transition-colors">
                                {vehicle?.brand} {vehicle?.model}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {vehicle?.year} • {vehicle?.licensePlate}
                              </p>
                            </div>
                            <Badge variant={statusConfig.variant} className="gap-1">
                              <StatusIcon className="h-3 w-3" />
                              {statusConfig.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                            </span>
                          </div>
                          {vehicle?.owner && (
                            <div className="flex items-center gap-2 mt-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={vehicle.owner.photoUrl} />
                                <AvatarFallback className="text-xs">
                                  {getInitials(vehicle.owner.firstName, vehicle.owner.lastName)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-muted-foreground">
                                Propriétaire: {vehicle.owner.firstName} {vehicle.owner.lastName}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end justify-center px-4">
                          <p className="text-xl font-bold text-amber-600">
                            {(booking.totalPrice ?? 0).toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">FCFA total</p>
                        </div>
                        {(booking.status === RentalBookingStatus.PENDING || 
                          booking.status === RentalBookingStatus.CONFIRMED) && (
                          <div className="flex items-center px-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={(e) => handleCancel(e, booking.id)}
                              disabled={cancelMutation.isPending}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        <div className="flex items-center px-4">
                          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-amber-500" />
                        </div>
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
              <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Aucune location</h3>
              <p className="text-muted-foreground mb-6">
                Trouvez un véhicule à louer pour vos déplacements.
              </p>
              <Link href="/rental">
                <Button className="bg-amber-500 hover:bg-amber-600">
                  <Search className="h-4 w-4 mr-2" />
                  Louer un véhicule
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

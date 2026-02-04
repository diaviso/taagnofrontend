"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, differenceInDays } from "date-fns";
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
import { rentalService } from "@/lib/services";
import { useAuth } from "@/providers";
import { toast } from "sonner";
import { Car, Calendar, Users, ArrowLeft, Check, X, Star, Shield, Sparkles, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { RentalBookingStatus, UserMode } from "@/types";
import { redirectToLoginWithIntent } from "@/lib/redirect";
import { notifications } from "@/lib/notifications";

const bookingSchema = z.object({
  startDate: z.string().min(1, "Date de début requise"),
  endDate: z.string().min(1, "Date de fin requise"),
});

type BookingForm = z.infer<typeof bookingSchema>;

export default function OfferDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);

  const offerId = params.id as string;

  const { data: offer, isLoading } = useQuery({
    queryKey: ["rental", "offer", offerId],
    queryFn: () => rentalService.getOfferById(offerId),
    enabled: !!offerId,
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
  });

  const startDate = watch("startDate");
  const endDate = watch("endDate");

  useEffect(() => {
    if (startDate && endDate && offer) {
      const days = differenceInDays(new Date(endDate), new Date(startDate));
      if (days > 0) {
        setTotalPrice(days * offer.pricePerDay);
      } else {
        setTotalPrice(0);
      }
    }
  }, [startDate, endDate, offer]);

  const bookMutation = useMutation({
    mutationFn: (data: BookingForm) => rentalService.createBooking(offerId, data),
    onSuccess: () => {
      notifications.bookingCreated();
      queryClient.invalidateQueries({ queryKey: ["rental", "offer", offerId] });
      setDialogOpen(false);
    },
    onError: (error: any) => {
      notifications.genericError(error.response?.data?.message || "Erreur lors de la réservation");
    },
  });

  const acceptMutation = useMutation({
    mutationFn: (bookingId: string) => rentalService.acceptBooking(bookingId),
    onSuccess: () => {
      notifications.bookingAccepted();
      queryClient.invalidateQueries({ queryKey: ["rental", "offer", offerId] });
    },
    onError: (error: any) => {
      notifications.genericError(error.response?.data?.message || "Erreur");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (bookingId: string) => rentalService.rejectBooking(bookingId),
    onSuccess: () => {
      notifications.bookingRejected();
      queryClient.invalidateQueries({ queryKey: ["rental", "offer", offerId] });
    },
    onError: (error: any) => {
      notifications.genericError(error.response?.data?.message || "Erreur");
    },
  });

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  const isOwner = user?.id === offer?.vehicle?.ownerId;

  const getStatusBadge = (status: RentalBookingStatus) => {
    switch (status) {
      case "PENDING":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">En attente</Badge>;
      case "CONFIRMED":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Confirmée</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">Refusée</Badge>;
      case "CANCELLED":
        return <Badge variant="secondary">Annulée</Badge>;
      case "COMPLETED":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Terminée</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const onSubmit = (data: BookingForm) => {
    bookMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-500/5 to-background">
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

  if (!offer) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-500/5 to-background">
        <div className="container py-16 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-500/10 flex items-center justify-center">
            <Car className="h-10 w-10 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Offre non trouvée</h1>
          <p className="text-muted-foreground mb-6">Cette offre n&apos;existe pas ou a été supprimée.</p>
          <Link href="/rental">
            <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-glow-yellow">
              Retour aux offres
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section with Image */}
      <section className="relative bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-background overflow-hidden">
        <div className="absolute inset-0 pattern-dots opacity-30" />

        {/* Vehicle Image */}
        <div className="relative h-64 md:h-80 lg:h-96">
          {offer.vehicle?.photos && offer.vehicle.photos.length > 0 ? (
            <img
              src={offer.vehicle.photos[0].url}
              alt={`${offer.vehicle.brand} ${offer.vehicle.model}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
              <Car className="h-24 w-24 text-amber-300" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />

          {/* Back button */}
          <div className="absolute top-4 left-4">
            <Link href="/rental" className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur rounded-full text-sm font-medium hover:bg-white transition-colors group">
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Retour
            </Link>
          </div>

          {/* Badges */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Badge className="bg-white/90 text-foreground shadow-sm px-3 py-1">
              {offer.vehicle?.year}
            </Badge>
          </div>
        </div>

        {/* Title overlay */}
        <div className="container relative -mt-20 pb-8">
          <div className="bg-background/80 backdrop-blur-xl rounded-2xl p-6 shadow-elevated border-0">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">
                  {offer.vehicle?.brand} {offer.vehicle?.model}
                </h1>
                <p className="text-muted-foreground mt-1 flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    {offer.vehicle?.color}
                  </span>
                  <span>•</span>
                  <span>{offer.vehicle?.licensePlate}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {offer.vehicle?.numberOfSeats} places
                  </span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-gradient-gold">{offer.pricePerDay.toLocaleString()}</p>
                <p className="text-muted-foreground">FCFA / jour</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Photo Gallery */}
            {offer.vehicle?.photos && offer.vehicle.photos.length > 1 && (
              <Card className="border-0 shadow-soft overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5 text-amber-500" />
                    Photos du véhicule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
                    {offer.vehicle.photos.map((photo, index) => (
                      <img
                        key={photo.id}
                        src={photo.url}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-32 object-cover rounded-xl hover:scale-105 transition-transform cursor-pointer"
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Vehicle Details */}
            <Card className="border-0 shadow-soft overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  Caractéristiques
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="flex items-center gap-3 p-4 bg-amber-500/5 rounded-xl">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
                      <Users className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Places</p>
                      <p className="font-semibold text-lg">{offer.vehicle?.numberOfSeats}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-amber-500/5 rounded-xl">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
                      <Calendar className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Durée min.</p>
                      <p className="font-semibold text-lg">{offer.minDays} jour(s)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-amber-500/5 rounded-xl">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
                      <Shield className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Caution</p>
                      <p className="font-semibold text-lg">{offer.depositAmount.toLocaleString()} FCFA</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Owner Info */}
            <Card className="border-0 shadow-soft overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-amber-500" />
                  Propriétaire
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 p-4 bg-amber-500/5 rounded-xl">
                  <Avatar className="h-16 w-16 ring-4 ring-amber-500/20">
                    <AvatarImage src={offer.vehicle?.owner?.photoUrl} />
                    <AvatarFallback className="text-lg bg-gradient-to-br from-amber-500/20 to-orange-500/10 text-amber-600 font-semibold">
                      {getInitials(offer.vehicle?.owner?.firstName, offer.vehicle?.owner?.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-lg font-semibold">
                      {offer.vehicle?.owner?.firstName} {offer.vehicle?.owner?.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">{offer.vehicle?.owner?.email}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-medium">4.9</span>
                      <span className="text-sm text-muted-foreground">(8 avis)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bookings (for owner) */}
            {isOwner && offer.bookings && offer.bookings.length > 0 && (
              <Card className="border-0 shadow-soft overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-amber-500" />
                    Réservations ({offer.bookings.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {offer.bookings.map((booking: any) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-4 bg-amber-500/5 rounded-xl"
                    >
                      <div>
                        <p className="font-medium flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-amber-500" />
                          {format(new Date(booking.startDate), "dd/MM/yyyy")} - {format(new Date(booking.endDate), "dd/MM/yyyy")}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {(booking.totalPrice ?? 0).toLocaleString()} FCFA
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(booking.status)}
                        {booking.status === "PENDING" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => acceptMutation.mutate(booking.id)}
                              disabled={acceptMutation.isPending}
                              className="bg-green-500 hover:bg-green-600 text-white"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => rejectMutation.mutate(booking.id)}
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
              <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  Réservation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center p-6 bg-gradient-to-br from-amber-500/10 to-orange-500/5 rounded-xl mb-6">
                  <p className="text-4xl font-bold text-gradient-gold">{offer.pricePerDay.toLocaleString()}</p>
                  <p className="text-muted-foreground">FCFA / jour</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    + {offer.depositAmount.toLocaleString()} FCFA de caution
                  </p>
                </div>

                {isAuthenticated && !isOwner && offer.isActive && (
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-glow-yellow">
                        Réserver ce véhicule
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Réserver ce véhicule</DialogTitle>
                        <DialogDescription>
                          {offer.vehicle?.brand} {offer.vehicle?.model}
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="space-y-4 py-4">
                          <div className="grid gap-4 grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="startDate">Date de début</Label>
                              <Input
                                id="startDate"
                                type="date"
                                {...register("startDate")}
                                className="h-12"
                              />
                              {errors.startDate && (
                                <p className="text-sm text-destructive">{errors.startDate.message}</p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="endDate">Date de fin</Label>
                              <Input
                                id="endDate"
                                type="date"
                                {...register("endDate")}
                                className="h-12"
                              />
                              {errors.endDate && (
                                <p className="text-sm text-destructive">{errors.endDate.message}</p>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Durée minimale : {offer.minDays} jour(s)
                          </p>
                          {totalPrice > 0 && (
                            <div className="p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/5 rounded-xl">
                              <p className="text-sm text-muted-foreground">Total estimé</p>
                              <p className="text-3xl font-bold text-gradient-gold">{totalPrice.toLocaleString()} FCFA</p>
                            </div>
                          )}
                        </div>
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                            Annuler
                          </Button>
                          <Button
                            type="submit"
                            disabled={bookMutation.isPending}
                            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                          >
                            {bookMutation.isPending ? "Réservation..." : "Confirmer"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}

                {!isAuthenticated && (
                  <Button 
                    className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-glow-yellow"
                    onClick={() => redirectToLoginWithIntent(
                      router,
                      `/rental/${offerId}`,
                      "book_rental",
                      UserMode.VOYAGEUR
                    )}
                  >
                    Se connecter pour réserver
                  </Button>
                )}

                {/* Trust badges */}
                <div className="mt-6 pt-6 border-t space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4 text-amber-500" />
                    <span>Véhicule vérifié</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-amber-500" />
                    <span>Annulation flexible</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 text-amber-500" />
                    <span>Disponible au Sénégal</span>
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

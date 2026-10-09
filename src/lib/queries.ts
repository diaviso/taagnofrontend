"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { api, errorMessage } from "./api";
import { useAuth } from "./auth";
import { apiDay } from "./format";
import type {
  Audience,
  CarpoolReservation,
  CarpoolTrip,
  GivenReviews,
  NotificationsPage,
  PublicProfile,
  RentalBooking,
  RentalOffer,
  TripAlert,
  User,
  UserReviews,
  Vehicle,
} from "./types";

// ---------------------------------------------------------------------------
// Recherche publique
// ---------------------------------------------------------------------------

export interface TripSearch {
  from?: string;
  to?: string;
  date?: Date | null;
  seats?: number;
  options?: string[];
  maxPrice?: number;
}

export function useTripSearch(q: TripSearch) {
  return useQuery({
    queryKey: ["trips", "search", q.from ?? "", q.to ?? "", q.date ? apiDay(q.date) : "", q.seats ?? 0, q.options ?? [], q.maxPrice ?? 0],
    queryFn: async () => {
      const trips = await api.get<CarpoolTrip[]>("/carpool/trips/search", {
        from: q.from?.trim(),
        to: q.to?.trim(),
        date: q.date ? apiDay(q.date) : undefined,
        seats: q.seats && q.seats > 1 ? q.seats : undefined,
        options: q.options,
        maxPrice: q.maxPrice,
      });
      // Le serveur garde les départs passés du jour demandé : on les retire.
      const now = Date.now();
      return trips.filter((t) => new Date(t.departureTime).getTime() > now);
    },
    placeholderData: (prev) => prev,
  });
}

export interface OfferSearch {
  city?: string;
  start?: Date | null;
  end?: Date | null;
  maxPrice?: number;
  minSeats?: number;
  options?: string[];
}

export function useOfferSearch(q: OfferSearch) {
  const withDates = q.start && q.end;
  return useQuery({
    queryKey: ["offers", "search", q.city ?? "", withDates ? apiDay(q.start!) : "", withDates ? apiDay(q.end!) : "", q.maxPrice ?? 0, q.minSeats ?? 0, q.options ?? []],
    queryFn: () =>
      api.get<RentalOffer[]>("/rental/offers/search", {
        city: q.city?.trim(),
        startDate: withDates ? apiDay(q.start!) : undefined,
        endDate: withDates ? apiDay(q.end!) : undefined,
        maxPrice: q.maxPrice,
        minSeats: q.minSeats,
        options: q.options,
      }),
    placeholderData: (prev) => prev,
  });
}

export const useTrip = (id: string, initial?: CarpoolTrip | null) =>
  useQuery({
    queryKey: ["trip", id],
    queryFn: () => api.get<CarpoolTrip>(`/carpool/trips/${id}`),
    initialData: initial ?? undefined,
  });

export const useOffer = (id: string, initial?: RentalOffer | null) =>
  useQuery({
    queryKey: ["offer", id],
    queryFn: () => api.get<RentalOffer>(`/rental/offers/${id}`),
    initialData: initial ?? undefined,
  });

export const usePublicProfile = (id?: string | null) =>
  useQuery({
    queryKey: ["profile", id],
    queryFn: () => api.get<PublicProfile>(`/users/${id}/public`),
    enabled: !!id,
  });

export const useUserReviews = (id?: string | null) =>
  useQuery({
    queryKey: ["reviews", id],
    queryFn: () => api.get<UserReviews>(`/reviews/user/${id}`),
    enabled: !!id,
  });

// ---------------------------------------------------------------------------
// Compte connecté
// ---------------------------------------------------------------------------

function useSignedIn() {
  const { status, user } = useAuth();
  return status === "authenticated" && !!user;
}

export function useMyReservations() {
  const enabled = useSignedIn();
  return useQuery({
    queryKey: ["reservations", "mine"],
    queryFn: () => api.get<CarpoolReservation[]>("/carpool/reservations/mine"),
    enabled,
  });
}

export function useMyBookings() {
  const enabled = useSignedIn();
  return useQuery({
    queryKey: ["bookings", "mine"],
    queryFn: () => api.get<RentalBooking[]>("/rental/bookings/mine"),
    enabled,
  });
}

export function useMyTrips() {
  const enabled = useSignedIn();
  return useQuery({
    queryKey: ["trips", "mine"],
    queryFn: () => api.get<CarpoolTrip[]>("/carpool/trips/mine"),
    enabled,
  });
}

export function useMyOffers() {
  const enabled = useSignedIn();
  return useQuery({
    queryKey: ["offers", "mine"],
    queryFn: () => api.get<RentalOffer[]>("/rental/offers/mine"),
    enabled,
  });
}

export function useMyVehicles() {
  const enabled = useSignedIn();
  return useQuery({
    queryKey: ["vehicles", "mine"],
    queryFn: () => api.get<Vehicle[]>("/vehicles/mine"),
    enabled,
  });
}

export function useVehicle(id: string) {
  const enabled = useSignedIn();
  return useQuery({
    queryKey: ["vehicle", id],
    queryFn: () => api.get<Vehicle>(`/vehicles/${id}`),
    enabled,
  });
}

export function useGivenReviews() {
  const enabled = useSignedIn();
  return useQuery({
    queryKey: ["reviews", "given"],
    queryFn: () => api.get<GivenReviews>("/reviews/given"),
    enabled,
  });
}

export function useTripAlerts() {
  const enabled = useSignedIn();
  return useQuery({
    queryKey: ["alerts"],
    queryFn: () => api.get<TripAlert[]>("/carpool/alerts"),
    enabled,
  });
}

export function useNotifications(audience: Audience) {
  const enabled = useSignedIn();
  return useQuery({
    queryKey: ["notifications", audience],
    queryFn: () => api.get<NotificationsPage>("/notifications", { audience, take: 40 }),
    enabled,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  });
}

export function useUnreadCount(audience: Audience) {
  const enabled = useSignedIn();
  return useQuery({
    queryKey: ["unread", audience],
    queryFn: async () => (await api.get<{ unread: number }>("/notifications/unread-count", { audience })).unread,
    enabled,
    refetchInterval: 45_000,
    refetchIntervalInBackground: false,
  });
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

/**
 * Exécute une action (appel API), affiche le message de succès ou l'erreur, puis
 * rafraîchit les données concernées. Renvoie `true` si l'action a réussi.
 */
export function useAction() {
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState<string | null>(null);

  const run = useCallback(
    async <T,>(
      key: string,
      task: () => Promise<T>,
      opts: { success?: string; invalidate?: unknown[][]; silent?: boolean } = {},
    ): Promise<T | undefined> => {
      setBusy(key);
      try {
        const result = await task();
        if (opts.success) toast.success(opts.success);
        await Promise.all((opts.invalidate ?? []).map((queryKey) => queryClient.invalidateQueries({ queryKey })));
        return result;
      } catch (e) {
        if (!opts.silent) toast.error(errorMessage(e));
        return undefined;
      } finally {
        setBusy(null);
      }
    },
    [queryClient],
  );

  return { run, busy };
}

/** Envoie une image (photo de profil, de véhicule ou de document) ; renvoie son URL. */
export async function uploadImage(file: File) {
  const form = new FormData();
  form.append("file", file);
  const data = await api.post<{ url: string }>("/upload", form);
  return data.url;
}

export type { User };

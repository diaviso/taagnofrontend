"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "./api";
import { useAuth } from "./auth";
import { isAdmin, type CarpoolReservation, type CarpoolTrip, type RentalBooking, type RentalOffer, type User, type Vehicle, type VehicleStatus } from "./types";

export interface AdminStats {
  users: { total: number };
  vehicles: { total: number; pending: number; approved: number; rejected: number };
  carpool: { totalTrips: number; openTrips: number; completedTrips: number; totalReservations: number };
  rental: { totalOffers: number; activeOffers: number; totalBookings: number };
  recentVehicles: (Vehicle & { owner?: User })[];
  recentUsers: User[];
}

export interface Counts {
  vehicles: number;
  carpoolTripsAsDriver: number;
  carpoolReservations: number;
  rentalBookings: number;
}

export interface AdminUser extends User {
  _count?: Counts;
  emailVerified?: boolean;
  vehicles?: (Vehicle & { rentalOffer?: RentalOffer | null })[];
  carpoolTripsAsDriver?: (CarpoolTrip & { _count?: { reservations: number } })[];
  carpoolReservations?: CarpoolReservation[];
  rentalBookings?: RentalBooking[];
}

export interface AdminVehicle extends Vehicle {
  carpoolTrips?: CarpoolTrip[];
}

export interface UserDependencies {
  vehicles: number;
  vehiclePhotos: number;
  vehicleDocuments: number;
  rentalOffers: number;
  carpoolTrips: number;
  vehicleCarpoolTrips: number;
  carpoolReservations: number;
  rentalBookings: number;
  total: number;
}

function useIsAdmin() {
  const { user } = useAuth();
  return isAdmin(user);
}

export function useAdminStats() {
  const enabled = useIsAdmin();
  return useQuery({ queryKey: ["admin", "stats"], queryFn: () => api.get<AdminStats>("/admin/statistics"), enabled });
}

export function useAdminVehicles(status?: VehicleStatus) {
  const enabled = useIsAdmin();
  return useQuery({
    queryKey: ["admin", "vehicles", status ?? "all"],
    queryFn: () => api.get<AdminVehicle[]>("/admin/vehicles", { status }),
    enabled,
  });
}

export function useAdminVehicle(id: string) {
  const enabled = useIsAdmin();
  return useQuery({ queryKey: ["admin", "vehicle", id], queryFn: () => api.get<AdminVehicle>(`/admin/vehicles/${id}`), enabled });
}

export function useAdminUsers(search: string) {
  const enabled = useIsAdmin();
  return useQuery({
    queryKey: ["admin", "users", search],
    queryFn: () => api.get<AdminUser[]>("/admin/users", { search: search || undefined }),
    enabled,
    placeholderData: (prev) => prev,
  });
}

export function useAdminUser(id: string) {
  const enabled = useIsAdmin();
  return useQuery({ queryKey: ["admin", "user", id], queryFn: () => api.get<AdminUser>(`/admin/users/${id}`), enabled });
}

export const ADMIN_INVALIDATE = [["admin"]];

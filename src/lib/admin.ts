"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ApiError, api, tokenStore } from "./api";
import { useAuth } from "./auth";
import {
  isAdmin,
  type BookingStatus,
  type CarpoolReservation,
  type CarpoolTrip,
  type RentalBooking,
  type RentalCancelledBy,
  type RentalOffer,
  type RentalOption,
  type Review,
  type ReportReason,
  type ReportTarget,
  type TripCancelledBy,
  type TripOption,
  type TripStatus,
  type User,
  type Vehicle,
  type VehiclePhoto,
  type VehicleStatus,
} from "./types";

// ---------------------------------------------------------------------------
// Modèles
// ---------------------------------------------------------------------------

export interface AdminStats {
  users: { total: number };
  vehicles: { total: number; pending: number; approved: number; rejected: number };
  carpool: { totalTrips: number; openTrips: number; completedTrips: number; totalReservations: number };
  rental: { totalOffers: number; activeOffers: number; totalBookings: number };
  recentVehicles: (Vehicle & { owner?: User })[];
  recentUsers: User[];
}

/** Page d'une liste paginée de l'administration. */
export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export const PAGE_SIZE = 20;

export interface DayPoint {
  /** `AAAA-MM-JJ` */
  date: string;
  users: number;
  trips: number;
  reservations: number;
  bookings: number;
}

export interface AdminOverview {
  users: { new7d: number; new30d: number; suspended: number; phoneVerified: number; pros: number };
  carpool: {
    upcomingTrips: number;
    reservationsByStatus: Partial<Record<BookingStatus, number>>;
    seatsSold: number;
    volume: number;
  };
  rental: { bookingsByStatus: Partial<Record<BookingStatus, number>>; volume: number; deletedOffers: number };
  reviews: { total: number; average: number | null };
  reports: { open: number };
  devices: { IOS?: number; ANDROID?: number };
  topRoutes: { from: string; to: string; trips: number }[];
  series: DayPoint[];
}

export interface Counts {
  vehicles: number;
  carpoolTripsAsDriver: number;
  carpoolReservations: number;
  rentalBookings: number;
}

export interface AdminPushDevice {
  id: string;
  platform: "IOS" | "ANDROID" | string;
  audience: "VOYAGEUR" | "PRO" | string;
  appId?: string | null;
  appVersion?: string | null;
  lastSeenAt?: string | null;
}

export type ReportStatus = "OPEN" | "RESOLVED" | "DISMISSED";

export const REPORT_STATUS: Record<ReportStatus, { label: string; tone: "warning" | "success" | "muted" }> = {
  OPEN: { label: "Ouvert", tone: "warning" },
  RESOLVED: { label: "Traité", tone: "success" },
  DISMISSED: { label: "Classé", tone: "muted" },
};

export interface AdminReport {
  id: string;
  reporterId: string;
  targetType: ReportTarget;
  targetId: string;
  targetUserId: string | null;
  reason: ReportReason | string;
  /** Motif en français, fourni par le serveur (absent des signalements listés sur une fiche). */
  reasonLabel?: string;
  details: string | null;
  status: ReportStatus;
  resolutionNote: string | null;
  handledAt: string | null;
  createdAt: string;
  reporter?: User | null;
  targetUser?: User | null;
  targetLabel?: string;
  targetExists?: boolean;
  /** Présent seulement dans le détail d'un signalement. */
  otherReportsOnSameUser?: number;
}

export interface AdminAction {
  id: string;
  action: string;
  targetType: string;
  targetId: string | null;
  summary: string;
  details?: Record<string, unknown> | null;
  createdAt: string;
  admin?: { id?: string; firstName?: string | null; lastName?: string | null; email?: string | null } | null;
}

export interface AdminUser extends User {
  _count?: Counts;
  emailVerified?: boolean;
  pinLockedUntil?: string | null;
  sessionsRevokedAt?: string | null;
  pushDevices?: AdminPushDevice[];
  reviewsReceived?: (Review & { author?: User | null })[];
  reportsAgainst?: AdminReport[];
  reportsAgainstOpen?: number;
  adminHistory?: AdminAction[];
  vehicles?: (Vehicle & { rentalOffer?: RentalOffer | null })[];
  carpoolTripsAsDriver?: (CarpoolTrip & { _count?: { reservations: number } })[];
  carpoolReservations?: CarpoolReservation[];
  rentalBookings?: RentalBooking[];
}

export interface AdminVehicle extends Vehicle {
  carpoolTrips?: CarpoolTrip[];
}

/** Véhicule tel que les listes de l'administration le renvoient (champs partiels). */
export interface AdminVehicleRef {
  id: string;
  brand: string;
  model: string;
  year?: number | null;
  color?: string | null;
  city?: string | null;
  licensePlate?: string | null;
  numberOfSeats?: number | null;
  status?: VehicleStatus;
  isActive?: boolean;
  photos?: VehiclePhoto[];
  owner?: User | null;
}

export interface AdminTrip {
  id: string;
  departureCity: string;
  arrivalCity: string;
  departureTime: string;
  pricePerSeat: number;
  availableSeats: number;
  status: TripStatus;
  createdAt?: string;
  driver?: User | null;
  vehicle?: AdminVehicleRef | null;
  _count?: { reservations: number };
  /** Réservations en attente ou confirmées. */
  reservations?: { status: BookingStatus; seatsReserved: number }[];
}

export interface AdminTripDetail extends Omit<AdminTrip, "reservations"> {
  meetingPoint?: string | null;
  dropoffPoint?: string | null;
  description?: string | null;
  options?: TripOption[];
  reservations: CarpoolReservation[];
  reportsCount: number;
}

export interface AdminReservation {
  id: string;
  tripId: string;
  passengerId: string;
  seatsReserved: number;
  status: BookingStatus;
  cancelledBy?: TripCancelledBy | null;
  cancelReason?: string | null;
  createdAt: string;
  passenger?: User | null;
  trip: {
    id: string;
    departureCity: string;
    arrivalCity: string;
    departureTime: string;
    pricePerSeat: number;
    status: TripStatus;
    driver?: User | null;
  };
}

export interface AdminOffer {
  id: string;
  vehicleId: string;
  pricePerDay: number;
  depositAmount: number;
  minDays: number;
  isActive: boolean;
  description?: string | null;
  pickupLocation?: string | null;
  options?: RentalOption[];
  driverPricePerDay?: number | null;
  deletedAt: string | null;
  createdAt: string;
  vehicle: AdminVehicleRef;
  _count?: { bookings: number };
}

export interface AdminBooking {
  id: string;
  rentalOfferId: string;
  renterId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  withDriver?: boolean;
  driverPricePerDay?: number | null;
  status: BookingStatus;
  cancelledBy?: RentalCancelledBy | null;
  cancelReason?: string | null;
  createdAt: string;
  renter?: User | null;
  rentalOffer: { id: string; pricePerDay: number; vehicle: AdminVehicleRef };
}

export interface AdminReview {
  id: string;
  rating: number;
  comment?: string | null;
  carpoolReservationId?: string | null;
  rentalBookingId?: string | null;
  createdAt: string;
  author?: User | null;
  target?: User | null;
}

export interface AdminSettings {
  supportPhone: string;
  supportWhatsapp: string;
  supportEmail: string;
  announcementText: string;
  announcementActive: boolean;
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

// ---------------------------------------------------------------------------
// Requêtes
// ---------------------------------------------------------------------------

function useIsAdmin() {
  const { user } = useAuth();
  return isAdmin(user);
}

type Params = Record<string, string | number | undefined>;

/** Liste paginée : la page précédente reste affichée pendant le chargement de la suivante. */
function useAdminList<T>(name: string, path: string, params: Params) {
  const enabled = useIsAdmin();
  return useQuery({
    queryKey: ["admin", name, params],
    queryFn: () => api.get<Paged<T>>(path, { take: PAGE_SIZE, ...params }),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useAdminStats() {
  const enabled = useIsAdmin();
  return useQuery({ queryKey: ["admin", "stats"], queryFn: () => api.get<AdminStats>("/admin/statistics"), enabled });
}

export function useAdminOverview() {
  const enabled = useIsAdmin();
  return useQuery({ queryKey: ["admin", "overview"], queryFn: () => api.get<AdminOverview>("/admin/overview"), enabled });
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

export const useAdminTrips = (params: { status?: TripStatus; period?: "upcoming" | "past"; q?: string; driverId?: string; page?: number }) =>
  useAdminList<AdminTrip>("trips", "/admin/trips", params);

export function useAdminTrip(id: string) {
  const enabled = useIsAdmin();
  return useQuery({ queryKey: ["admin", "trip", id], queryFn: () => api.get<AdminTripDetail>(`/admin/trips/${id}`), enabled });
}

export const useAdminReservations = (params: { status?: BookingStatus; q?: string; page?: number }) =>
  useAdminList<AdminReservation>("reservations", "/admin/reservations", params);

export const useAdminOffers = (params: { state?: "active" | "hidden" | "deleted"; q?: string; page?: number }) =>
  useAdminList<AdminOffer>("offers", "/admin/rental/offers", params);

export const useAdminBookings = (params: { status?: BookingStatus; q?: string; page?: number }) =>
  useAdminList<AdminBooking>("bookings", "/admin/rental/bookings", params);

export const useAdminReviews = (params: { rating?: number; q?: string; page?: number }) =>
  useAdminList<AdminReview>("reviews", "/admin/reviews", params);

export const useAdminReports = (params: { status?: ReportStatus; page?: number; take?: number }) =>
  useAdminList<AdminReport>("reports", "/admin/reports", params);

/** Détail d'un signalement (avec les autres signalements visant la même personne). */
export function useAdminReport(id: string, enabled: boolean) {
  const isAdminUser = useIsAdmin();
  return useQuery({ queryKey: ["admin", "report", id], queryFn: () => api.get<AdminReport>(`/admin/reports/${id}`), enabled: enabled && isAdminUser });
}

export const useAdminAudit = (params: { targetType?: string; page?: number }) =>
  useAdminList<AdminAction>("audit", "/admin/audit", params);

export function useAdminSettings() {
  const enabled = useIsAdmin();
  return useQuery({ queryKey: ["admin", "settings"], queryFn: () => api.get<AdminSettings>("/admin/settings"), enabled });
}

/** Pastilles du menu : véhicules à vérifier et signalements ouverts. */
export function useAdminBadges() {
  const enabled = useIsAdmin();
  const stats = useAdminStats();
  const reports = useQuery({
    queryKey: ["admin", "reports", { status: "OPEN", take: 1 }],
    queryFn: () => api.get<Paged<AdminReport>>("/admin/reports", { status: "OPEN", take: 1 }),
    enabled,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  });
  return { vehicles: stats.data?.vehicles.pending ?? 0, reports: reports.data?.total ?? 0 };
}

/** Après une action de l'administration, tout ce qu'elle affiche est rechargé. */
export const ADMIN_INVALIDATE = [["admin"]];

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

const withReason = (reason?: string) => (reason?.trim() ? { reason: reason.trim() } : {});

export const adminActions = {
  cancelTrip: (id: string, reason?: string) => api.patch<{ cancelled: boolean; passengersNotified: number }>(`/admin/trips/${id}/cancel`, withReason(reason)),
  cancelReservation: (id: string, reason?: string) => api.patch(`/admin/reservations/${id}/cancel`, withReason(reason)),
  setOfferActive: (id: string, isActive: boolean, reason?: string) => api.patch(`/admin/rental/offers/${id}`, { isActive, ...withReason(reason) }),
  cancelBooking: (id: string, reason?: string) => api.patch(`/admin/rental/bookings/${id}/cancel`, withReason(reason)),
  deleteReview: (id: string) => api.delete(`/admin/reviews/${id}`),
  setReportStatus: (id: string, status: ReportStatus, note?: string) => api.patch(`/admin/reports/${id}`, { status, ...(note?.trim() ? { note: note.trim() } : {}) }),
  /** Suspendre (`false`) ou réactiver (`true`) : état explicite, jamais une bascule. */
  setUserActive: (id: string, isActive: boolean, reason?: string) =>
    api.patch(`/admin/users/${id}/toggle-active`, { isActive, ...withReason(reason) }),
  unlockUser: (id: string) => api.post(`/admin/users/${id}/unlock`),
  revokeSessions: (id: string) => api.post(`/admin/users/${id}/revoke-sessions`),
  notifyUser: (id: string, body: { audience: "VOYAGEUR" | "PRO"; title: string; body: string }) => api.post<{ sent: number }>(`/admin/users/${id}/notify`, body),
  broadcast: (body: { audience: "ALL" | "VOYAGEUR" | "PRO"; title: string; body: string }) => api.post<{ sent: number }>("/admin/notifications/broadcast", body),
  saveSettings: (body: Partial<AdminSettings>) => api.patch<AdminSettings>("/admin/settings", body),
};

// ---------------------------------------------------------------------------
// Exports CSV
// ---------------------------------------------------------------------------

export type ExportKind = "users" | "trips" | "reservations" | "offers" | "bookings" | "vehicles" | "reviews" | "reports";

export const EXPORTS: { kind: ExportKind; label: string }[] = [
  { kind: "users", label: "Utilisateurs" },
  { kind: "vehicles", label: "Véhicules" },
  { kind: "trips", label: "Trajets" },
  { kind: "reservations", label: "Réservations de covoiturage" },
  { kind: "offers", label: "Annonces de location" },
  { kind: "bookings", label: "Demandes de location" },
  { kind: "reviews", label: "Avis" },
  { kind: "reports", label: "Signalements" },
];

/**
 * Télécharge un export CSV : la route exige l'en-tête Authorization, un simple lien ne
 * suffit pas. Le fichier est lu en mémoire puis proposé au téléchargement.
 */
export async function downloadExport(kind: ExportKind) {
  const token = tokenStore.get();
  let response: Response;
  try {
    response = await fetch(`/api/admin/export/${kind}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  } catch {
    throw new ApiError("Impossible de joindre le serveur. Vérifiez votre connexion.");
  }
  if (!response.ok) {
    throw new ApiError(response.status === 401 || response.status === 403 ? "Session expirée ou accès refusé." : "L’export a échoué. Réessayez dans un instant.", response.status);
  }
  const blob = await response.blob();
  const named = /filename="?([^";]+)"?/i.exec(response.headers.get("Content-Disposition") ?? "")?.[1];
  const filename = named ?? `taagno-${kind}-${new Date().toISOString().slice(0, 10)}.csv`;
  const url = URL.createObjectURL(new Blob([blob], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return filename;
}

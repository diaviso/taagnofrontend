/** Modèles de l'API Taagno (mêmes champs que les applications mobiles). */

// ---------------------------------------------------------------------------
// Utilisateur
// ---------------------------------------------------------------------------

export interface User {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  photoUrl?: string | null;
  phone?: string | null;
  phoneVerified?: boolean;
  /** Nouveau numéro en attente de vérification par SMS (le numéro actuel reste actif). */
  pendingPhone?: string | null;
  role?: "USER" | "ADMIN";
  userMode?: "VOYAGEUR" | "PROPRIETAIRE" | null;
  hasPin?: boolean;
  ratingCount?: number;
  ratingSum?: number;
  bio?: string | null;
  isActive?: boolean;
  createdAt?: string;
}

/** E-mail réel ou `null` (les comptes créés par téléphone ont une adresse technique). */
export const realEmail = (u?: User | null) =>
  u?.email && !u.email.endsWith("@taagno.placeholder") ? u.email : null;

/** Coordonnée affichée dans l'administration : numéro, sinon e-mail réel. */
export function contactLabel(u?: User | null) {
  const d = (u?.phone ?? "").replace(/\D/g, "").replace(/^221/, "");
  if (d.length === 9) return `+221 ${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5, 7)} ${d.slice(7)}`;
  return realEmail(u) ?? u?.phone ?? "—";
}

export function fullName(u?: User | null) {
  const name = [u?.firstName, u?.lastName].filter((s) => s && s.trim()).join(" ");
  return name || "Utilisateur Taagno";
}

/** Prénom + initiale du nom (« Awa D. »), pour les pages publiques. */
export function shortName(u?: User | null) {
  const first = u?.firstName?.trim() ?? "";
  const last = u?.lastName?.trim() ?? "";
  if (!first && !last) return "Utilisateur";
  if (!last) return first;
  return `${first} ${last[0].toUpperCase()}.`;
}

export function initials(u?: User | null) {
  const s = `${u?.firstName?.trim()?.[0] ?? ""}${u?.lastName?.trim()?.[0] ?? ""}`.toUpperCase();
  return s || "T";
}

/** Note moyenne sur 5, `null` sans avis. */
export const userRating = (u?: User | null) =>
  u && (u.ratingCount ?? 0) > 0 ? (u.ratingSum ?? 0) / (u.ratingCount ?? 1) : null;

export const isAdmin = (u?: User | null) => u?.role === "ADMIN";

export const hasName = (u: User) => !!u.firstName?.trim() && !!u.lastName?.trim();

/**
 * Profil complet : nom et numéro vérifié, plus le code PIN pour les comptes créés par
 * téléphone (facultatif pour les comptes Google ou e-mail). Sinon on termine l'inscription.
 */
export const isProfileComplete = (u: User) =>
  isAdmin(u) || (hasName(u) && !!u.phoneVerified && (!!u.hasPin || !!realEmail(u)));

// ---------------------------------------------------------------------------
// Statuts (libellés et couleurs)
// ---------------------------------------------------------------------------

export type Tone = "success" | "warning" | "danger" | "info" | "muted" | "brand";

export type VehicleStatus = "PENDING" | "APPROVED" | "REJECTED";
export const VEHICLE_STATUS: Record<VehicleStatus, { label: string; tone: Tone }> = {
  PENDING: { label: "En vérification", tone: "warning" },
  APPROVED: { label: "Approuvé", tone: "success" },
  REJECTED: { label: "Refusé", tone: "danger" },
};

export type DocumentType = "INSURANCE" | "REGISTRATION" | "TECHNICAL_VISIT";
export const DOCUMENT_TYPES: { value: DocumentType; label: string; hint: string }[] = [
  { value: "REGISTRATION", label: "Carte grise", hint: "Recto lisible, au nom du propriétaire" },
  { value: "INSURANCE", label: "Assurance", hint: "Attestation en cours de validité" },
  { value: "TECHNICAL_VISIT", label: "Visite technique", hint: "Dernier contrôle technique" },
];

export type DocumentStatus = "PENDING" | "APPROVED" | "REJECTED";
export const DOCUMENT_STATUS: Record<DocumentStatus, { label: string; tone: Tone }> = {
  PENDING: { label: "En vérification", tone: "warning" },
  APPROVED: { label: "Validé", tone: "success" },
  REJECTED: { label: "Refusé", tone: "danger" },
};

export type TripStatus = "OPEN" | "FULL" | "CANCELLED" | "COMPLETED";
export const TRIP_STATUS: Record<TripStatus, { label: string; tone: Tone }> = {
  OPEN: { label: "Ouvert", tone: "success" },
  FULL: { label: "Complet", tone: "warning" },
  CANCELLED: { label: "Annulé", tone: "danger" },
  COMPLETED: { label: "Terminé", tone: "muted" },
};

/** Statut d'une demande : place de covoiturage ou location (mêmes valeurs côté API). */
export type BookingStatus = "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED" | "COMPLETED";
export const BOOKING_STATUS: Record<BookingStatus, { label: string; tone: Tone }> = {
  PENDING: { label: "En attente", tone: "warning" },
  CONFIRMED: { label: "Confirmée", tone: "success" },
  REJECTED: { label: "Refusée", tone: "danger" },
  CANCELLED: { label: "Annulée", tone: "muted" },
  COMPLETED: { label: "Terminée", tone: "info" },
};

export const isActiveBooking = (s: BookingStatus) => s === "PENDING" || s === "CONFIRMED";

/** Qui a annulé une place de covoiturage (`SYSTEM` : demande expirée sans réponse). */
export type TripCancelledBy = "PASSENGER" | "DRIVER" | "SYSTEM";
/** Qui a annulé une location (`SYSTEM` : demande expirée sans réponse). */
export type RentalCancelledBy = "RENTER" | "OWNER" | "SYSTEM";

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

export type TripOption =
  | "INSTANT_BOOKING"
  | "AIR_CONDITIONING"
  | "LUGGAGE"
  | "NON_SMOKING"
  | "MUSIC"
  | "PETS"
  | "WOMEN_ONLY";

export const TRIP_OPTIONS: { value: TripOption; label: string; hint?: string }[] = [
  { value: "INSTANT_BOOKING", label: "Réservation instantanée", hint: "Les passagers sont confirmés sans attendre" },
  { value: "AIR_CONDITIONING", label: "Climatisation" },
  { value: "LUGGAGE", label: "Bagages acceptés" },
  { value: "NON_SMOKING", label: "Non-fumeur" },
  { value: "MUSIC", label: "Musique" },
  { value: "PETS", label: "Animaux acceptés" },
  { value: "WOMEN_ONLY", label: "Entre femmes" },
];

export type RentalOption =
  | "WITH_DRIVER"
  | "DELIVERY"
  | "UNLIMITED_MILEAGE"
  | "AIR_CONDITIONING"
  | "AUTOMATIC"
  | "INSURANCE_INCLUDED";

export const RENTAL_OPTIONS: { value: RentalOption; label: string; hint?: string }[] = [
  { value: "WITH_DRIVER", label: "Chauffeur disponible", hint: "Le client peut louer avec chauffeur" },
  { value: "DELIVERY", label: "Livraison possible" },
  { value: "UNLIMITED_MILEAGE", label: "Kilométrage illimité" },
  { value: "AIR_CONDITIONING", label: "Climatisation" },
  { value: "AUTOMATIC", label: "Boîte automatique" },
  { value: "INSURANCE_INCLUDED", label: "Assurance tous risques" },
];

export const tripOptionLabel = (o: string) => TRIP_OPTIONS.find((x) => x.value === o)?.label ?? o;
export const rentalOptionLabel = (o: string) => RENTAL_OPTIONS.find((x) => x.value === o)?.label ?? o;

// ---------------------------------------------------------------------------
// Véhicules
// ---------------------------------------------------------------------------

export interface VehiclePhoto {
  id: string;
  url: string;
  isMain?: boolean;
}

export interface VehicleDocument {
  id: string;
  type: DocumentType;
  fileUrl: string;
  status: DocumentStatus;
  createdAt?: string;
}

export interface Vehicle {
  id: string;
  ownerId?: string;
  brand: string;
  model: string;
  year?: number | null;
  color?: string | null;
  licensePlate?: string | null;
  numberOfSeats?: number | null;
  city?: string | null;
  isForRental?: boolean;
  isForCarpooling?: boolean;
  isActive?: boolean;
  status: VehicleStatus;
  adminComment?: string | null;
  photos?: VehiclePhoto[];
  documents?: VehicleDocument[];
  owner?: User | null;
  rentalOffer?: RentalOffer | null;
  createdAt?: string;
}

function capitalize(s: string) {
  const t = s.trim();
  if (t.length <= 3) return t.toUpperCase();
  return t[0].toUpperCase() + t.slice(1).toLowerCase();
}

/** « Toyota Corolla » */
export const vehicleTitle = (v?: Vehicle | null) => (v ? `${capitalize(v.brand)} ${v.model.trim()}`.trim() : "Véhicule");

/** « Toyota Corolla 2019 » */
export const vehicleTitleYear = (v?: Vehicle | null) => (v?.year ? `${vehicleTitle(v)} ${v.year}` : vehicleTitle(v));

/** Photos, la principale en premier. */
export const orderedPhotos = (v?: Vehicle | null) => {
  const photos = v?.photos ?? [];
  return [...photos.filter((p) => p.isMain), ...photos.filter((p) => !p.isMain)];
};

/** Photo principale (ou la première), `null` sans photo. */
export const coverUrl = (v?: Vehicle | null) => orderedPhotos(v)[0]?.url ?? null;

// ---------------------------------------------------------------------------
// Covoiturage
// ---------------------------------------------------------------------------

export interface CarpoolReservation {
  id: string;
  tripId?: string;
  passengerId?: string;
  seatsReserved: number;
  status: BookingStatus;
  cancelledBy?: TripCancelledBy | null;
  cancelReason?: string | null;
  trip?: CarpoolTrip | null;
  passenger?: User | null;
  createdAt?: string;
}

export interface CarpoolTrip {
  id: string;
  vehicleId?: string;
  driverId?: string;
  departureCity: string;
  arrivalCity: string;
  departureTime: string;
  pricePerSeat: number;
  availableSeats: number;
  status: TripStatus;
  vehicle?: Vehicle | null;
  driver?: User | null;
  reservations?: CarpoolReservation[];
  meetingPoint?: string | null;
  dropoffPoint?: string | null;
  description?: string | null;
  options?: TripOption[];
  createdAt?: string;
}

export interface CancellationNotice {
  /** Qui a annulé, en une phrase. */
  title: string;
  /** Motif donné par le conducteur ou le propriétaire, s'il y en a un. */
  reason: string | null;
}

const cleanReason = (s?: string | null) => s?.trim() || null;

/** Côté voyageur : qui a annulé sa place de covoiturage ? `null` si elle n'est pas annulée. */
export function tripCancellation(r: CarpoolReservation): CancellationNotice | null {
  if (r.status !== "CANCELLED") return null;
  const reason = cleanReason(r.cancelReason);
  switch (r.cancelledBy) {
    case "DRIVER":
      return { title: "Le conducteur a annulé votre place", reason };
    case "SYSTEM":
      return { title: "Demande expirée sans réponse", reason: null };
    case "PASSENGER":
      return { title: "Vous avez annulé", reason: null };
    default:
      // Trajet annulé en entier par le conducteur : les réservations n'ont pas d'auteur.
      return r.trip?.status === "CANCELLED" ? { title: "Le conducteur a annulé le trajet", reason: null } : null;
  }
}

export const isInstant = (t: CarpoolTrip) => (t.options ?? []).includes("INSTANT_BOOKING");
export const isPastTrip = (t: CarpoolTrip) => new Date(t.departureTime).getTime() < Date.now();
export const isBookable = (t: CarpoolTrip) => t.status === "OPEN" && t.availableSeats > 0 && !isPastTrip(t);
export const pendingCount = (items?: { status: BookingStatus }[]) =>
  (items ?? []).filter((r) => r.status === "PENDING").length;

/** Places confirmées (passagers à bord). */
export const confirmedSeats = (t: CarpoolTrip) =>
  (t.reservations ?? [])
    .filter((r) => r.status === "CONFIRMED" || r.status === "COMPLETED")
    .reduce((sum, r) => sum + r.seatsReserved, 0);

// ---------------------------------------------------------------------------
// Location
// ---------------------------------------------------------------------------

export interface RentalBooking {
  id: string;
  rentalOfferId?: string;
  renterId?: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: BookingStatus;
  /** Location avec chauffeur (option `WITH_DRIVER` de l'annonce). */
  withDriver?: boolean;
  /** Supplément chauffeur par jour au moment de la demande ; `null` : tarif à convenir. */
  driverPricePerDay?: number | null;
  cancelledBy?: RentalCancelledBy | null;
  cancelReason?: string | null;
  rentalOffer?: RentalOffer | null;
  renter?: User | null;
  createdAt?: string;
}

export interface RentalOffer {
  id: string;
  vehicleId?: string;
  pricePerDay: number;
  depositAmount: number;
  minDays: number;
  isActive: boolean;
  vehicle?: Vehicle | null;
  bookings?: RentalBooking[];
  description?: string | null;
  pickupLocation?: string | null;
  options?: RentalOption[];
  driverPricePerDay?: number | null;
  createdAt?: string;
}

/** Côté voyageur : qui a annulé sa location ? `null` si elle n'est pas annulée. */
export function rentalCancellation(b: RentalBooking): CancellationNotice | null {
  if (b.status !== "CANCELLED") return null;
  switch (b.cancelledBy) {
    case "OWNER":
      return { title: "Le propriétaire a annulé la location", reason: cleanReason(b.cancelReason) };
    case "SYSTEM":
      return { title: "Demande expirée sans réponse", reason: null };
    case "RENTER":
      return { title: "Vous avez annulé", reason: null };
    default:
      return null;
  }
}

export const offerWithDriver = (o: RentalOffer) => (o.options ?? []).includes("WITH_DRIVER");

// ---------------------------------------------------------------------------
// Avis, profil public
// ---------------------------------------------------------------------------

export interface Review {
  id: string;
  rating: number;
  comment?: string | null;
  author?: User | null;
  createdAt?: string;
}

export interface UserReviews {
  reviews: Review[];
  reviewCount: number;
  averageRating: number | null;
}

export interface GivenReviews {
  carpoolReservationIds: string[];
  rentalBookingIds: string[];
}

export interface PublicProfile extends User {
  stats?: {
    tripsCompleted?: number;
    passengersCarried?: number;
    rentalsCompleted?: number;
    vehiclesCount?: number;
  };
}

// ---------------------------------------------------------------------------
// Notifications, alertes
// ---------------------------------------------------------------------------

export type Audience = "VOYAGEUR" | "PRO";

export type NotificationKind =
  | "trip_request"
  | "reservation"
  | "review_reservation"
  | "rental_request"
  | "booking"
  | "review_booking"
  | "vehicle"
  | "review"
  | "trip_alert";

export interface AppNotification {
  id: string;
  kind: NotificationKind | string;
  targetId?: string | null;
  title: string;
  body: string;
  readAt?: string | null;
  createdAt: string;
}

export interface NotificationsPage {
  items: AppNotification[];
  unread: number;
}

export interface TripAlert {
  id: string;
  fromCity: string;
  toCity: string;
  date?: string | null;
  createdAt?: string;
}

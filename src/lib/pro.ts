/** Calculs de l'espace Pro (mêmes règles que l'application Taagno Pro). */

import { parseDay, startOfDay } from "./format";
import { confirmedSeats, isPastTrip, type CarpoolReservation, type CarpoolTrip, type RentalBooking, type RentalOffer, type Vehicle } from "./types";

/** Trajet encore vivant (ouvert ou complet), passé ou non. */
export const isLive = (t: CarpoolTrip) => t.status === "OPEN" || t.status === "FULL";
/** Trajet à venir. */
export const isUpcoming = (t: CarpoolTrip) => isLive(t) && !isPastTrip(t);
/** Départ passé mais trajet pas encore clôturé. */
export const needsClosing = (t: CarpoolTrip) => isLive(t) && isPastTrip(t);
/** Le serveur n'accepte de modifier que les trajets ouverts à venir. */
export const isEditable = (t: CarpoolTrip) => t.status === "OPEN" && !isPastTrip(t);
/** Places proposées au total. */
export const seatsOffered = (t: CarpoolTrip) => confirmedSeats(t) + t.availableSeats;

/** Une annonce est vue des voyageurs si elle est active ET si son véhicule est approuvé et actif. */
export function offerVisibility(o: RentalOffer): { visible: boolean; reason: string } {
  if (!o.isActive) return { visible: false, reason: "En pause" };
  if (o.vehicle && o.vehicle.status !== "APPROVED") return { visible: false, reason: "Véhicule en vérification" };
  if (o.vehicle && o.vehicle.isActive === false) return { visible: false, reason: "Véhicule désactivé" };
  return { visible: true, reason: "En ligne" };
}

export const canCarpool = (v: Vehicle) => v.status === "APPROVED" && !!v.isForCarpooling && v.isActive !== false;
export const canRent = (v: Vehicle) => v.status === "APPROVED" && !!v.isForRental && v.isActive !== false;
export const usageLabel = (v: Vehicle) => [v.isForCarpooling && "Covoiturage", v.isForRental && "Location"].filter(Boolean).join(" · ") || "Aucun usage";

export interface TripRequest {
  trip: CarpoolTrip;
  reservation: CarpoolReservation;
}

export interface RentalRequest {
  offer: RentalOffer;
  booking: RentalBooking;
}

export interface RequestGroups<T> {
  pending: T[];
  confirmed: T[];
  history: T[];
}

/** Demande restée sans réponse alors que le trajet est parti : elle ne peut plus être acceptée. */
export const isStaleTripRequest = (r: TripRequest) => r.reservation.status === "PENDING" && isPastTrip(r.trip);
/** Demande de location restée sans réponse alors que la location a commencé. */
export const isStaleRentalRequest = (r: RentalRequest) =>
  r.booking.status === "PENDING" && parseDay(r.booking.startDate) < startOfDay(new Date());

export function groupTripRequests(trips: CarpoolTrip[]): RequestGroups<TripRequest> {
  const all = trips.flatMap((trip) => (trip.reservations ?? []).map((reservation) => ({ trip, reservation })));
  const t = (r: TripRequest) => new Date(r.trip.departureTime).getTime();
  const pending = (r: TripRequest) => r.reservation.status === "PENDING" && !isStaleTripRequest(r);
  return {
    pending: all.filter(pending).sort((a, b) => t(a) - t(b)),
    confirmed: all.filter((r) => r.reservation.status === "CONFIRMED").sort((a, b) => t(a) - t(b)),
    history: all.filter((r) => !pending(r) && r.reservation.status !== "CONFIRMED").sort((a, b) => t(b) - t(a)),
  };
}

export function groupRentalRequests(offers: RentalOffer[]): RequestGroups<RentalRequest> {
  const all = offers.flatMap((offer) => (offer.bookings ?? []).map((booking) => ({ offer, booking })));
  const t = (r: RentalRequest) => new Date(r.booking.startDate).getTime();
  const pending = (r: RentalRequest) => r.booking.status === "PENDING" && !isStaleRentalRequest(r);
  return {
    pending: all.filter(pending).sort((a, b) => t(a) - t(b)),
    confirmed: all.filter((r) => r.booking.status === "CONFIRMED").sort((a, b) => t(a) - t(b)),
    history: all.filter((r) => !pending(r) && r.booking.status !== "CONFIRMED").sort((a, b) => t(b) - t(a)),
  };
}

export interface MonthEarnings {
  month: Date;
  carpool: number;
  rental: number;
}

/** Gains estimés des `months` derniers mois (prix réglés hors du site : estimations). */
export function monthlyEarnings(trips: CarpoolTrip[], offers: RentalOffer[], months = 6): MonthEarnings[] {
  const now = new Date();
  const starts = Array.from({ length: months }, (_, i) => new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1));
  const result = starts.map((month) => ({ month, carpool: 0, rental: 0 }));
  const indexOf = (d: Date) => starts.findIndex((s) => s.getFullYear() === d.getFullYear() && s.getMonth() === d.getMonth());

  for (const trip of trips) {
    if (trip.status === "CANCELLED") continue;
    const i = indexOf(new Date(trip.departureTime));
    if (i < 0) continue;
    for (const r of trip.reservations ?? []) {
      if (r.status === "CONFIRMED" || r.status === "COMPLETED") result[i].carpool += trip.pricePerSeat * r.seatsReserved;
    }
  }
  for (const offer of offers) {
    for (const b of offer.bookings ?? []) {
      if (b.status !== "CONFIRMED" && b.status !== "COMPLETED") continue;
      const i = indexOf(parseDay(b.startDate));
      if (i >= 0) result[i].rental += b.totalPrice;
    }
  }
  return result;
}

/** Locations confirmées en cours ou à venir. */
export function currentRentals(offers: RentalOffer[]) {
  const today = startOfDay(new Date());
  return groupRentalRequests(offers).confirmed.filter((r) => parseDay(r.booking.endDate) >= today);
}

/** Une location confirmée dont la date de retour est passée peut être clôturée. */
export const rentalEnded = (b: RentalBooking) => parseDay(b.endDate) <= startOfDay(new Date());

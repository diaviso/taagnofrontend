import { BellRing, CalendarCheck, Car, KeyRound, Megaphone, MessageSquareHeart, Star, Ticket, type LucideIcon } from "lucide-react";
import type { Audience } from "./types";

/** Page ouverte par une notification (mêmes règles que les applications). */
export function notificationHref(audience: Audience, kind: string, targetId?: string | null) {
  const id = targetId || null;
  if (audience === "PRO") {
    if (kind === "trip_request" && id) return `/pro/trajets/${id}`;
    if (kind === "rental_request" && id) return `/pro/locations/${id}`;
    if (kind === "vehicle" && id) return `/pro/vehicules/${id}`;
    if (kind === "review") return "/pro/profil";
    return "/pro/notifications";
  }
  if (!id) return kind === "review" ? "/compte" : "/notifications";
  switch (kind) {
    case "reservation":
      return `/reservations/trajet/${id}`;
    case "review_reservation":
      return `/reservations/trajet/${id}?avis=1`;
    case "booking":
      return `/reservations/location/${id}`;
    case "review_booking":
      return `/reservations/location/${id}?avis=1`;
    case "trip_alert":
      return `/covoiturage/${id}`;
    case "review":
      return "/compte";
    default:
      return "/notifications";
  }
}

export const NOTIFICATION_STYLE: Record<string, { icon: LucideIcon; color: string }> = {
  trip_request: { icon: Ticket, color: "var(--carpool)" },
  reservation: { icon: CalendarCheck, color: "var(--carpool)" },
  review_reservation: { icon: Star, color: "var(--gold)" },
  rental_request: { icon: KeyRound, color: "var(--rental)" },
  booking: { icon: KeyRound, color: "var(--rental)" },
  review_booking: { icon: Star, color: "var(--gold)" },
  vehicle: { icon: Car, color: "var(--info)" },
  review: { icon: MessageSquareHeart, color: "var(--gold)" },
  trip_alert: { icon: BellRing, color: "var(--success)" },
  announcement: { icon: Megaphone, color: "var(--brand)" },
};

export const notificationStyle = (kind: string) => NOTIFICATION_STYLE[kind] ?? { icon: BellRing, color: "var(--muted)" };

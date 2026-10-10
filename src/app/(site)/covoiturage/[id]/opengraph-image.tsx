import { ImageResponse } from "next/og";
import { fcfa } from "@/lib/format";
import { serverGet } from "@/lib/server-api";
import type { CarpoolTrip } from "@/lib/types";

export const alt = "Trajet en covoiturage sur Taagno";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const WHEN = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Dakar" });

/** Aperçu d'un trajet partagé : villes, date, prix, places. */
export default async function TripImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trip = await serverGet<CarpoolTrip>(`/carpool/trips/${encodeURIComponent(id)}`, 60);
  const from = trip?.departureCity ?? "Trajet";
  const to = trip?.arrivalCity ?? "Taagno";
  const when = trip ? WHEN.format(new Date(trip.departureTime)).replace(/^./, (c) => c.toUpperCase()) : "";
  const price = trip ? fcfa(trip.pricePerSeat).replace(/ /g, " ") : "";
  const seats = trip ? `${trip.availableSeats} place${trip.availableSeats > 1 ? "s" : ""} libre${trip.availableSeats > 1 ? "s" : ""}` : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          color: "white",
          background: "linear-gradient(135deg, #0e4d2b 0%, #15803d 55%, #4da82a 100%)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", fontSize: 44, fontWeight: 800, letterSpacing: -1 }}>
            taag<span style={{ color: "#ffd27a" }}>no</span>
          </div>
          <div style={{ display: "flex", padding: "10px 22px", borderRadius: 999, background: "rgba(255,255,255,0.16)", fontSize: 26, fontWeight: 700 }}>
            Covoiturage
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", fontSize: 30, opacity: 0.85 }}>{when}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 28, fontSize: 88, fontWeight: 800, letterSpacing: -2 }}>
            <span>{from}</span>
            <svg width="90" height="40" viewBox="0 0 90 40">
              <path d="M2 20h76M62 6l16 14-16 14" stroke="#ffd27a" strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{to}</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {price && (
            <div style={{ display: "flex", padding: "16px 30px", borderRadius: 24, background: "#ffffff", color: "#0e4d2b", fontSize: 44, fontWeight: 800 }}>
              {price} <span style={{ fontSize: 26, fontWeight: 600, marginLeft: 10, alignSelf: "center" }}>la place</span>
            </div>
          )}
          {seats && <div style={{ display: "flex", fontSize: 30, fontWeight: 700, opacity: 0.9 }}>{seats} · Réservez sur Taagno</div>}
        </div>
      </div>
    ),
    size,
  );
}

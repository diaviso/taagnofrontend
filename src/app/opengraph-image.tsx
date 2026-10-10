import { ImageResponse } from "next/og";

export const alt = "Taagno — Covoiturage et location de voitures au Sénégal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Image d'aperçu du site (partages WhatsApp, réseaux sociaux). */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          color: "white",
          background: "linear-gradient(135deg, #0e4d2b 0%, #15803d 55%, #4da82a 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <svg width="96" height="96" viewBox="0 0 100 100">
            <rect width="100" height="100" rx="30" fill="#ffffff" />
            <circle cx="50" cy="50" r="30" fill="none" stroke="#15803d" strokeWidth="8.5" />
            <line x1="50" y1="50" x2="20.6" y2="55.4" stroke="#15803d" strokeWidth="7" strokeLinecap="round" />
            <line x1="50" y1="50" x2="79.4" y2="55.4" stroke="#15803d" strokeWidth="7" strokeLinecap="round" />
            <line x1="50" y1="50" x2="50" y2="80" stroke="#15803d" strokeWidth="7" strokeLinecap="round" />
            <circle cx="50" cy="50" r="8.5" fill="#15803d" />
          </svg>
          <div style={{ display: "flex", fontSize: 64, fontWeight: 800, letterSpacing: -2 }}>
            taag<span style={{ color: "#ffd27a" }}>no</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>Où allez-vous aujourd’hui ?</div>
          <div style={{ display: "flex", fontSize: 34, opacity: 0.88 }}>Covoiturage et location de voitures entre particuliers, partout au Sénégal.</div>
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 26, fontWeight: 700 }}>
          {["Sans frais", "Véhicules vérifiés", "Dakar · Touba · Thiès · Saint-Louis"].map((t) => (
            <div key={t} style={{ display: "flex", padding: "10px 22px", borderRadius: 999, background: "rgba(255,255,255,0.16)" }}>
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}

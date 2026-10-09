import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";
import { Providers } from "./providers";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://taagno.sn";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Taagno — Covoiturage et location de voitures au Sénégal",
    template: "%s · Taagno",
  },
  description:
    "Trouvez un trajet en covoiturage ou louez une voiture entre particuliers partout au Sénégal. Dakar, Touba, Thiès, Saint-Louis, Mbour… Simple, sûr et moins cher.",
  applicationName: "Taagno",
  openGraph: {
    type: "website",
    locale: "fr_SN",
    siteName: "Taagno",
  },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#15803d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className={jakarta.variable}>
      <body className="min-h-dvh font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

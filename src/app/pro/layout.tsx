import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { BrandScope } from "@/components/brand/brand-scope";

export const metadata: Metadata = {
  title: { default: "Taagno Pro — Rentabilisez votre véhicule", template: "%s · Taagno Pro" },
  description:
    "Proposez vos places en covoiturage ou louez votre voiture partout au Sénégal. Publication gratuite, sans commission : vous fixez vos prix.",
};

export const viewport: Viewport = { themeColor: "#b45309" };

/** Espace Pro (ambre) : conducteurs et propriétaires. */
export default function ProLayout({ children }: { children: ReactNode }) {
  return (
    <div data-brand="pro">
      <BrandScope brand="pro" />
      {children}
    </div>
  );
}

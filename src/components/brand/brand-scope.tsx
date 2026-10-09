"use client";

import { useEffect } from "react";

/**
 * Applique la marque de l'espace (voyageur, pro, admin) à toute la page : les fenêtres et
 * menus déroulants, rendus hors du conteneur, prennent ainsi les bonnes couleurs.
 */
export function BrandScope({ brand }: { brand: "voyageur" | "pro" | "admin" }) {
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-brand", brand);
    const theme = document.querySelector('meta[name="theme-color"]');
    const previous = theme?.getAttribute("content");
    theme?.setAttribute("content", brand === "pro" ? "#b45309" : brand === "admin" ? "#4338ca" : "#15803d");
    return () => {
      root.removeAttribute("data-brand");
      if (previous) theme?.setAttribute("content", previous);
    };
  }, [brand]);
  return null;
}

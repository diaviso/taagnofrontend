import type { MetadataRoute } from "next";
import { POPULAR_ROUTES } from "@/lib/cities";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://taagno.sn";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages = ["", "/covoiturage", "/location", "/pro", "/aide", "/conditions", "/confidentialite"].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === "" || path === "/covoiturage" || path === "/location" ? ("daily" as const) : ("monthly" as const),
    priority: path === "" ? 1 : 0.7,
  }));
  const routes = POPULAR_ROUTES.map(([from, to]) => ({
    url: `${SITE_URL}/covoiturage?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.6,
  }));
  return [...pages, ...routes];
}

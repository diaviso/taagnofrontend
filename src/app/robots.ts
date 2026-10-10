import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/compte", "/reservations", "/favoris", "/alertes", "/notifications", "/connexion", "/login", "/pro/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

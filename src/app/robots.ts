import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://taagno.sn";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/compte", "/reservations", "/favoris", "/alertes", "/notifications", "/connexion", "/pro/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

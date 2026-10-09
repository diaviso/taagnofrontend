import type { NextConfig } from "next";

/**
 * API Taagno (NestJS). Le navigateur appelle toujours `/api/...` sur le site même :
 * Next relaie vers le backend, sans configuration CORS quel que soit le domaine.
 * `API_URL` remplace l'API de production (ex. `http://localhost:3008/api` en local).
 */
const API_URL = (process.env.API_URL || "https://web-production-c7eae.up.railway.app/api").replace(/\/$/, "");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "*.up.railway.app" },
    ],
  },
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${API_URL}/:path*` }];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;

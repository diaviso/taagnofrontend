import type { NextConfig } from "next";
import { API_URL } from "./src/lib/site";

/**
 * API Taagno (NestJS). Le navigateur appelle toujours `/api/...` sur le site même :
 * Next relaie vers le backend (`API_URL`, voir src/lib/site.ts), sans configuration CORS
 * quel que soit le domaine.
 */
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

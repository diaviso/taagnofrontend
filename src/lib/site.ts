/**
 * Adresses du site et de l'API, lues dans l'environnement.
 *
 * - API : `API_URL`, sinon `NEXT_PUBLIC_API_URL` (variable déjà configurée sur Vercel pour
 *   l'ancien site), sinon l'API de production.
 * - Site : `NEXT_PUBLIC_SITE_URL`, sinon l'adresse de production fournie par Vercel.
 */
export const API_URL = (
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://web-production-c7eae.up.railway.app/api"
).replace(/\/$/, "");

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "https://taagno.sn")
).replace(/\/$/, "");

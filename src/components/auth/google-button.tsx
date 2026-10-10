"use client";

import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";

/** Adresse de connexion Google du backend (variable Vercel de l'ancien site, sinon le relais /api). */
const GOOGLE_LOGIN_URL = process.env.NEXT_PUBLIC_GOOGLE_LOGIN_URL || "/api/auth/google";

/** Page où revenir après Google (le backend renvoie toujours vers /login). */
export const NEXT_KEY = "taagno.next";

/** « Continuer avec Google » : part chez Google, revient sur /login avec la session. */
export function GoogleButton({ next }: { next?: string }) {
  const [leaving, setLeaving] = useState(false);
  return (
    <a
      href={GOOGLE_LOGIN_URL}
      onClick={() => {
        setLeaving(true);
        try {
          const back = next ?? `${window.location.pathname}${window.location.search}`;
          window.sessionStorage.setItem(NEXT_KEY, back.startsWith("/login") ? "/" : back);
        } catch {
          // stockage indisponible : retour à l'accueil
        }
      }}
      className="group relative flex h-12 w-full items-center justify-center gap-3 overflow-hidden rounded-[14px] border border-line bg-white text-[15px] font-bold text-ink transition hover:border-ink/20 hover:shadow-soft active:scale-[0.98]"
    >
      {leaving ? (
        <Spinner className="h-5 w-5 text-muted" />
      ) : (
        <svg viewBox="0 0 48 48" className="h-5 w-5 transition-transform duration-300 group-hover:rotate-[360deg]" aria-hidden>
          <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z" />
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
          <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" />
        </svg>
      )}
      {leaving ? "Ouverture de Google…" : "Continuer avec Google"}
    </a>
  );
}

"use client";

import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { NEXT_KEY } from "@/components/auth/google-button";
import { WheelMark } from "@/components/brand/logo";
import { errorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { isProfileComplete } from "@/lib/types";

function safeNext(next: string | null) {
  return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/login") ? next : "/";
}

/**
 * Retour de la connexion Google : le backend renvoie ici avec `?token=…`.
 * On ouvre la session, puis on termine l'inscription si besoin (numéro), sinon on
 * revient à la page de départ.
 */
function GoogleReturn() {
  const router = useRouter();
  const params = useSearchParams();
  const { signIn } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    let next = "/";
    try {
      next = safeNext(window.sessionStorage.getItem(NEXT_KEY));
      window.sessionStorage.removeItem(NEXT_KEY);
    } catch {
      // stockage indisponible
    }
    const token = params.get("token");
    if (!token) {
      router.replace(`/connexion?next=${encodeURIComponent(next)}`);
      return;
    }
    signIn(token)
      .then((user) => {
        router.replace(isProfileComplete(user) ? next : `/connexion?next=${encodeURIComponent(next)}`);
      })
      .catch((e) => setError(errorMessage(e)));
  }, [params, router, signIn]);

  return (
    <div data-brand="voyageur" className="flex min-h-dvh flex-col items-center justify-center bg-aurora px-6 text-center text-white">
      <div className="dot-grid absolute inset-0 opacity-50" />
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 20 }} className="relative">
        <motion.div animate={{ rotate: error ? 0 : 360 }} transition={{ duration: 2.4, repeat: error ? 0 : Infinity, ease: "linear" }}>
          <WheelMark size={72} light />
        </motion.div>
      </motion.div>
      <h1 className="relative mt-6 text-[22px] font-extrabold">{error ? "Connexion impossible" : "Connexion avec Google…"}</h1>
      <p className="relative mt-2 max-w-sm text-[15px] text-white/85">{error ?? "Encore un instant, nous ouvrons votre session."}</p>
      {error && (
        <button type="button" onClick={() => router.replace("/connexion")} className="relative mt-6 rounded-[14px] bg-white px-5 py-3 text-[15px] font-bold text-brand-dark">
          Réessayer
        </button>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <GoogleReturn />
    </Suspense>
  );
}

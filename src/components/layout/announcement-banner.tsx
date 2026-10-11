"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Megaphone, X } from "lucide-react";
import { useSyncExternalStore } from "react";
import { usePublicSettings } from "@/lib/queries";
import { cn } from "@/lib/utils";

const KEY = "taagno.announcement.dismissed";
const EVENT = "taagno:announcement";

/** Repli quand le stockage de session est indisponible (navigation privée). */
let dismissedInMemory: string | null = null;

function readDismissed(): string | null {
  try {
    return window.sessionStorage.getItem(KEY) ?? dismissedInMemory;
  } catch {
    return dismissedInMemory;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  return () => window.removeEventListener(EVENT, onChange);
}

/** Barre d'annonce : texte centré, bouton de fermeture facultatif. */
export function AnnouncementBar({ text, onClose, className }: { text: string; onClose?: () => void; className?: string }) {
  return (
    <div className={cn("relative bg-brand-dark text-white", className)} role="status">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-brand-g2/40 via-transparent to-brand-g3/30" aria-hidden />
      <div className="relative mx-auto flex max-w-6xl items-center gap-3 px-4 py-2 sm:px-6">
        <span className="hidden h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15 sm:flex">
          <Megaphone className="h-3.5 w-3.5" />
        </span>
        <p className="min-w-0 flex-1 break-words text-center text-[13px] font-semibold leading-snug sm:text-left">{text}</p>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer l’annonce"
            className="-mr-1.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/75 transition hover:bg-white/15 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Bandeau d'annonce de l'équipe en haut du site. Une fois fermé, il ne revient pas
 * pendant la session tant que le texte reste le même (un nouveau texte réapparaît).
 */
export function AnnouncementBanner() {
  const { data } = usePublicSettings();
  const dismissed = useSyncExternalStore(subscribe, readDismissed, () => null);
  const text = data?.announcement?.text?.trim();
  const show = !!text && dismissed !== text;

  const close = () => {
    if (!text) return;
    dismissedInMemory = text;
    try {
      window.sessionStorage.setItem(KEY, text);
    } catch {
      // Stockage indisponible : le bandeau se referme quand même pour cette page.
    }
    window.dispatchEvent(new Event(EVENT));
  };

  return (
    <AnimatePresence initial={false}>
      {show && text && (
        <motion.div key={text} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
          <AnnouncementBar text={text} onClose={close} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

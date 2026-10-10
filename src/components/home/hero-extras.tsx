"use client";

import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { BadgeCheck, MapPin, Star } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Mot qui change en douceur (« aujourd’hui » → « à Touba » → …). Tous les mots sont
 * empilés de façon invisible dans la même case : elle prend la taille du plus long,
 * si bien que rien ne bouge autour quand le mot change.
 */
export function RotatingWords({
  words,
  interval = 2600,
  className,
  suffix,
}: {
  words: string[];
  interval?: number;
  className?: string;
  /** Texte qui suit le mot et glisse avec lui (ex. « ? »). */
  suffix?: ReactNode;
}) {
  // Compteur (et non index) : chaque passage a sa propre clé, même quand un mot revient.
  const [tick, setTick] = useState(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) return;
    // Onglet en arrière-plan : on ne change pas de mot, les animations y sont gelées.
    const t = setInterval(() => {
      if (!document.hidden) setTick((n) => n + 1);
    }, interval);
    return () => clearInterval(t);
  }, [interval, reduce]);
  const word = words[tick % words.length];
  const cell = "col-start-1 row-start-1 whitespace-nowrap";
  return (
    <span className="relative inline-grid overflow-hidden align-bottom">
      {words.map((w) => (
        <span key={w} aria-hidden className={cn(cell, "invisible")}>
          <span className={className}>{w}</span>
          {suffix}
        </span>
      ))}
      <AnimatePresence initial={false}>
        <motion.span
          key={tick}
          className={cell}
          initial={{ y: "80%", opacity: 0, filter: "blur(6px)" }}
          animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
          exit={{ y: "-80%", opacity: 0, filter: "blur(6px)" }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className={className}>{word}</span>
          {suffix}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** Petites cartes flottantes du héros (grand écran), avec un léger effet de profondeur. */
export function HeroDecor() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, -60]);
  const y2 = useTransform(scrollY, [0, 500], [0, -110]);
  return (
    <div className="pointer-events-none absolute inset-0 hidden xl:block" aria-hidden>
      <motion.div style={{ y: y1 }} className="absolute right-[6%] top-[120px]">
        <motion.div
          initial={{ opacity: 0, x: 30, rotate: 4 }}
          animate={{ opacity: 1, x: 0, rotate: 3 }}
          transition={{ delay: 0.5, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="animate-float rounded-[20px] bg-white/95 p-4 text-ink shadow-lift backdrop-blur"
        >
          <p className="text-[11px] font-bold uppercase tracking-wide text-brand">Demain · 08:00</p>
          <p className="mt-1 text-[16px] font-extrabold">Dakar → Touba</p>
          <div className="mt-2 flex items-center gap-3 text-[12.5px] text-muted">
            <span className="flex items-center gap-1 font-bold text-ink">
              <Star className="h-3.5 w-3.5 fill-gold text-gold" /> 4,9
            </span>
            <span>3 places</span>
            <span className="font-extrabold text-ink">4 000 FCFA</span>
          </div>
        </motion.div>
      </motion.div>
      <motion.div style={{ y: y2 }} className="absolute right-[20%] top-[250px]">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9, type: "spring", stiffness: 220, damping: 16 }}
          className="flex items-center gap-2 rounded-full bg-white/95 px-4 py-2.5 text-[13px] font-bold text-ink shadow-lift [animation-delay:1.2s] animate-float"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success text-white">
            <BadgeCheck className="h-4 w-4" />
          </span>
          Place confirmée !
        </motion.div>
      </motion.div>
      <motion.div style={{ y: y1 }} className="absolute right-[30%] top-[96px]">
        <motion.span
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur [animation-delay:0.6s] animate-float"
        >
          <MapPin className="h-5 w-5" />
        </motion.span>
      </motion.div>
    </div>
  );
}

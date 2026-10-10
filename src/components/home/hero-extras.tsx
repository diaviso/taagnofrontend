"use client";

import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { BadgeCheck, MapPin, Star } from "lucide-react";
import { useEffect, useState } from "react";

/** Mot qui change en douceur (« aujourd’hui » → « à Touba » → …). */
export function RotatingWords({ words, interval = 2600, className }: { words: string[]; interval?: number; className?: string }) {
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % words.length), interval);
    return () => clearInterval(t);
  }, [words.length, interval, reduce]);
  return (
    <span className="relative inline-flex overflow-hidden align-bottom">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={words[index]}
          className={className}
          initial={{ y: "80%", opacity: 0, filter: "blur(6px)" }}
          animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
          exit={{ y: "-80%", opacity: 0, filter: "blur(6px)" }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          {words[index]}
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

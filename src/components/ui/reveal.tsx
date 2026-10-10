"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Apparition douce. `immediate` : animation CSS jouée dès l'affichage (haut de page, visible
 * même avant JavaScript) ; sinon apparition au défilement.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  y = 18,
  immediate,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  y?: number;
  immediate?: boolean;
}) {
  if (immediate) {
    return (
      <div className={cn("animate-rise", className)} style={{ animationDelay: `${delay}s` }}>
        {children}
      </div>
    );
  }
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Trait en pointillés qui se dessine à l'apparition (liens entre étapes). */
export function DrawLine({ className }: { className?: string }) {
  return (
    <motion.div
      aria-hidden
      className={cn("h-[2px] origin-left bg-[repeating-linear-gradient(90deg,var(--brand)_0_10px,transparent_10px_18px)] opacity-40", className)}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
    />
  );
}

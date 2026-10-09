"use client";

import { motion } from "framer-motion";

/** Coche animée de réussite (réservation envoyée, publication…). */
export function SuccessCheck({ size = 88, tone = "brand" }: { size?: number; tone?: "brand" | "warning" }) {
  const color = tone === "warning" ? "var(--warning)" : "var(--brand)";
  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <motion.span
        className="absolute inset-0 rounded-full"
        style={{ background: color, opacity: 0.15 }}
        initial={{ scale: 0.4 }}
        animate={{ scale: [0.4, 1.25, 1] }}
        transition={{ duration: 0.6 }}
      />
      {[...Array(10)].map((_, i) => {
        const angle = (i / 10) * Math.PI * 2;
        return (
          <motion.span
            key={i}
            className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full"
            style={{ background: i % 2 ? "var(--brand-accent)" : color }}
            initial={{ x: -4, y: -4, opacity: 1, scale: 1 }}
            animate={{ x: Math.cos(angle) * size * 0.75 - 4, y: Math.sin(angle) * size * 0.75 - 4, opacity: 0, scale: 0.4 }}
            transition={{ duration: 0.8, delay: 0.25, ease: "easeOut" }}
          />
        );
      })}
      <motion.div
        className="absolute inset-[14%] flex items-center justify-center rounded-full shadow-glow"
        style={{ background: color }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 16, delay: 0.1 }}
      >
        <svg viewBox="0 0 24 24" width={size * 0.4} height={size * 0.4} fill="none">
          <motion.path
            d="M5 12.5l4.5 4.5L19 7.5"
            stroke="#fff"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.4, delay: 0.35 }}
          />
        </svg>
      </motion.div>
    </div>
  );
}

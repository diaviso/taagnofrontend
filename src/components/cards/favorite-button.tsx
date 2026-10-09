"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useFavorites } from "@/lib/favorites";
import { cn } from "@/lib/utils";

/** Cœur « favori » avec rebond et éclat à l'ajout. */
export function FavoriteButton({ favKey, onDark, className }: { favKey: string; onDark?: boolean; className?: string }) {
  const { has, toggle } = useFavorites();
  const active = has(favKey);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const added = toggle(favKey);
        toast.success(added ? "Ajouté à vos favoris" : "Retiré de vos favoris", { duration: 1600 });
      }}
      aria-pressed={active}
      aria-label={active ? "Retirer des favoris" : "Ajouter aux favoris"}
      className={cn(
        "relative flex h-9 w-9 items-center justify-center rounded-full transition active:scale-90",
        onDark ? "bg-white/90 shadow-soft backdrop-blur hover:bg-white" : "bg-surface-alt hover:bg-brand-soft",
        className,
      )}
    >
      <motion.span key={String(active)} initial={{ scale: 0.5 }} animate={{ scale: [0.5, 1.25, 1] }} transition={{ duration: 0.35 }}>
        <Heart className={cn("h-[18px] w-[18px]", active ? "fill-danger text-danger" : "text-ink-soft")} />
      </motion.span>
      <AnimatePresence>
        {active && (
          <motion.span
            key="burst"
            initial={{ scale: 0.4, opacity: 0.6 }}
            animate={{ scale: 1.8, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="pointer-events-none absolute inset-0 rounded-full border-2 border-danger"
          />
        )}
      </AnimatePresence>
    </button>
  );
}

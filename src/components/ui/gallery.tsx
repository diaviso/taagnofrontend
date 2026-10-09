"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { Car, ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { useState } from "react";
import { cdn } from "@/lib/images";
import { cn } from "@/lib/utils";

/** Galerie de photos : grande photo, vignettes, plein écran. */
export function Gallery({ photos, alt }: { photos: string[]; alt: string }) {
  const [index, setIndex] = useState(0);
  const [full, setFull] = useState(false);
  const [dir, setDir] = useState(0);

  if (!photos.length) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-[24px] bg-brand-soft text-brand">
        <Car className="h-20 w-20 opacity-50" />
      </div>
    );
  }

  const go = (n: number) => {
    setDir(n);
    setIndex((i) => (i + n + photos.length) % photos.length);
  };

  return (
    <div>
      <div className="group relative aspect-[16/10] overflow-hidden rounded-[24px] bg-surface-alt">
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.img
            key={index}
            src={cdn(photos[index], 1400) ?? undefined}
            alt={alt}
            custom={dir}
            initial={{ opacity: 0, x: dir * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -dir * 60 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 h-full w-full cursor-zoom-in object-cover"
            onClick={() => setFull(true)}
          />
        </AnimatePresence>
        {photos.length > 1 && (
          <>
            <NavButton side="left" onClick={() => go(-1)} />
            <NavButton side="right" onClick={() => go(1)} />
            <span className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {photos.map((_, i) => (
                <span key={i} className={cn("h-1.5 rounded-full bg-white transition-all", i === index ? "w-5" : "w-1.5 opacity-60")} />
              ))}
            </span>
          </>
        )}
        <button
          type="button"
          onClick={() => setFull(true)}
          className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/45 px-3 py-1.5 text-[12.5px] font-bold text-white backdrop-blur transition hover:bg-black/60"
        >
          <Expand className="h-3.5 w-3.5" /> {photos.length} photo{photos.length > 1 ? "s" : ""}
        </button>
      </div>
      {photos.length > 1 && (
        <div className="scrollbar-none mt-3 flex gap-2 overflow-x-auto">
          {photos.map((p, i) => (
            <button
              key={p + i}
              type="button"
              onClick={() => {
                setDir(i > index ? 1 : -1);
                setIndex(i);
              }}
              className={cn(
                "h-16 w-24 shrink-0 overflow-hidden rounded-[12px] border-2 transition",
                i === index ? "border-brand" : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cdn(p, 240) ?? undefined} alt="" className="h-full w-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}

      <Dialog.Root open={full} onOpenChange={setFull}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[90] bg-black/90" />
          <Dialog.Content className="fixed inset-0 z-[91] flex items-center justify-center p-4 outline-none" aria-describedby={undefined}>
            <Dialog.Title className="sr-only">{alt}</Dialog.Title>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cdn(photos[index], 2000) ?? undefined} alt={alt} className="max-h-full max-w-full rounded-[12px] object-contain" />
            {photos.length > 1 && (
              <>
                <NavButton side="left" onClick={() => go(-1)} dark />
                <NavButton side="right" onClick={() => go(1)} dark />
              </>
            )}
            <Dialog.Close className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25" aria-label="Fermer">
              <X className="h-6 w-6" />
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

function NavButton({ side, onClick, dark }: { side: "left" | "right"; onClick: () => void; dark?: boolean }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={side === "left" ? "Photo précédente" : "Photo suivante"}
      className={cn(
        "absolute top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full shadow-soft transition",
        side === "left" ? "left-3" : "right-3",
        dark ? "bg-white/15 text-white hover:bg-white/25" : "bg-white/90 text-ink opacity-0 hover:bg-white group-hover:opacity-100 max-md:opacity-100",
      )}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}

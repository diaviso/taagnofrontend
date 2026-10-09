"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export interface FaqItem {
  q: string;
  a: string;
}

/** Questions fréquentes en accordéon. */
export function Faq({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-line overflow-hidden rounded-[22px] border border-line/70 bg-white shadow-card">
      {items.map((item, i) => (
        <div key={item.q}>
          <button
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
            className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-surface-alt sm:px-6"
          >
            <span className="flex-1 text-[15.5px] font-bold text-ink">{item.q}</span>
            <ChevronDown className={cn("h-5 w-5 shrink-0 text-muted transition-transform duration-300", open === i && "rotate-180 text-brand")} />
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
                <p className="px-5 pb-5 text-[14.5px] leading-relaxed text-ink-soft sm:px-6">{item.a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

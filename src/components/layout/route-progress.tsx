"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

/**
 * Fine barre de progression en haut de l'écran pendant le passage d'une page à l'autre :
 * elle démarre au clic sur un lien interne et se termine à l'arrivée sur la page.
 */
function Progress() {
  const pathname = usePathname();
  const search = useSearchParams();
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const key = `${pathname}?${search}`;
  const [lastKey, setLastKey] = useState(key);

  // Arrivée sur la nouvelle page : la barre se termine.
  if (key !== lastKey) {
    setLastKey(key);
    if (state === "loading") setState("done");
  }

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest?.("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      setState("loading");
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {
    if (state !== "done") return;
    const t = setTimeout(() => setState("idle"), 450);
    return () => clearTimeout(t);
  }, [state]);

  return (
    <AnimatePresence>
      {state !== "idle" && (
        <motion.div
          key="bar"
          className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px] origin-left bg-brand-gradient shadow-glow"
          initial={{ scaleX: 0, opacity: 1 }}
          animate={state === "loading" ? { scaleX: 0.75, transition: { duration: 2.5, ease: [0.1, 0.6, 0.3, 1] } } : { scaleX: 1, transition: { duration: 0.25 } }}
          exit={{ opacity: 0, transition: { duration: 0.25, delay: 0.1 } }}
        />
      )}
    </AnimatePresence>
  );
}

export function RouteProgress() {
  return (
    <Suspense>
      <Progress />
    </Suspense>
  );
}

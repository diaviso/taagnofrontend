"use client";

import { animate, useInView, useMotionValue, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/** Nombre qui défile jusqu'à sa valeur quand il apparaît à l'écran. */
export function AnimatedNumber({ value, format = (n) => String(n), duration = 1.1 }: { value: number; format?: (n: number) => string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20px" });
  const reduce = useReducedMotion();
  const motionValue = useMotionValue(0);
  const [display, setDisplay] = useState(() => format(0));

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(motionValue, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(format(Math.round(v))),
    });
    return () => controls.stop();
    // `format` est une fonction d'affichage stable en pratique.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, value, reduce, duration, motionValue]);

  return (
    <span ref={ref} className="tabular-nums">
      {reduce ? format(value) : display}
    </span>
  );
}

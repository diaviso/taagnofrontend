"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Saisie d'un code (PIN à 4 chiffres, code SMS à 6 chiffres). Une seule zone de saisie
 * cachée alimente les cases ; le code complet est envoyé automatiquement.
 */
export function CodeInput({
  length,
  onComplete,
  obscure,
  disabled,
  error,
  autoFocus = true,
  oneTimeCode,
}: {
  length: number;
  onComplete: (code: string) => void;
  obscure?: boolean;
  disabled?: boolean;
  /** Change à chaque erreur : vide la saisie et secoue les cases. */
  error?: number;
  autoFocus?: boolean;
  oneTimeCode?: boolean;
}) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  // Nouvelle erreur : la saisie est vidée (ajustement pendant le rendu) puis on redonne le focus.
  const [lastError, setLastError] = useState(error);
  if (error !== lastError) {
    setLastError(error);
    if (error) setValue("");
  }
  useEffect(() => {
    if (error) ref.current?.focus();
  }, [error]);

  useEffect(() => {
    if (autoFocus) setTimeout(() => ref.current?.focus(), 60);
  }, [autoFocus]);

  const change = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, length);
    setValue(digits);
    if (digits.length === length) onComplete(digits);
  };

  return (
    <motion.div
      key={error}
      animate={error ? { x: [0, -10, 10, -7, 7, -3, 0] } : undefined}
      transition={{ duration: 0.45 }}
      className="relative mx-auto w-fit"
      onClick={() => ref.current?.focus()}
    >
      <input
        ref={ref}
        value={value}
        onChange={(e) => change(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        inputMode="numeric"
        autoComplete={oneTimeCode ? "one-time-code" : "off"}
        maxLength={length}
        disabled={disabled}
        aria-label={`Code à ${length} chiffres`}
        className="absolute inset-0 z-10 h-full w-full cursor-text opacity-0"
      />
      <div className="flex gap-2.5 sm:gap-3">
        {Array.from({ length }).map((_, i) => {
          const filled = i < value.length;
          const current = focused && i === Math.min(value.length, length - 1);
          return (
            <div
              key={i}
              className={cn(
                "flex items-center justify-center rounded-[16px] border-2 bg-white text-[26px] font-extrabold text-ink transition-all duration-150",
                length > 4 ? "h-14 w-11 sm:h-15 sm:w-12" : "h-16 w-14 sm:h-17 sm:w-15",
                current ? "border-brand shadow-[0_0_0_4px_color-mix(in_srgb,var(--brand)_14%,transparent)]" : filled ? "border-brand/40" : "border-line",
                error ? "border-danger/60" : "",
              )}
            >
              {filled &&
                (obscure ? (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="h-3.5 w-3.5 rounded-full bg-ink" />
                ) : (
                  <motion.span initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                    {value[i]}
                  </motion.span>
                ))}
              {current && !filled && <span className="h-7 w-[2px] animate-pulse rounded bg-brand" />}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MapPin, X } from "lucide-react";
import { useId, useRef, useState, type ReactNode } from "react";
import { matchCities } from "@/lib/cities";
import { cn } from "@/lib/utils";

/**
 * Champ ville avec suggestions (villes du Sénégal). La saisie reste libre.
 * `bare` : sans bordure, pour la barre de recherche de l'accueil.
 */
export function CityField({
  value,
  onChange,
  placeholder,
  label,
  icon,
  bare,
  autoFocus,
  className,
  invalid,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  label?: string;
  icon?: ReactNode;
  bare?: boolean;
  autoFocus?: boolean;
  className?: string;
  invalid?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestions = matchCities(value, 6).filter((c) => c.toLowerCase() !== value.trim().toLowerCase() || value === "");

  const pick = (city: string) => {
    onChange(city);
    setOpen(false);
  };

  return (
    <div className={cn("relative", className)}>
      {label && (
        <label htmlFor={id} className={cn("mb-1.5 block text-[13.5px] font-bold text-ink", bare && "sr-only")}>
          {label}
        </label>
      )}
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted [&_svg]:h-[18px] [&_svg]:w-[18px]">
          {icon ?? <MapPin />}
        </span>
        <input
          ref={inputRef}
          id={id}
          value={value}
          autoFocus={autoFocus}
          autoComplete="off"
          placeholder={placeholder}
          role="combobox"
          aria-expanded={open}
          aria-controls={`${id}-list`}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
            setActive(0);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={(e) => {
            if (!open || !suggestions.length) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => (a + 1) % suggestions.length);
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => (a - 1 + suggestions.length) % suggestions.length);
            } else if (e.key === "Enter" && value.trim() === "") {
              e.preventDefault();
              pick(suggestions[active]);
            } else if (e.key === "Enter" && suggestions[active] && suggestions[active].toLowerCase().startsWith(value.trim().toLowerCase())) {
              // Entrée choisit la suggestion sans envoyer le formulaire.
              e.preventDefault();
              pick(suggestions[active]);
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
          className={cn(
            "w-full bg-transparent pl-11 pr-9 text-[15px] font-semibold text-ink outline-none placeholder:font-medium placeholder:text-faint",
            bare
              ? "h-14"
              : "h-12 rounded-[14px] border border-line bg-white transition focus:border-brand/60 focus:ring-4 focus:ring-brand/10",
            invalid && !bare && "border-danger/60",
          )}
        />
        {value && (
          <button
            type="button"
            tabIndex={-1}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              onChange("");
              inputRef.current?.focus();
            }}
            className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-faint transition hover:bg-surface-alt hover:text-ink"
            aria-label="Effacer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <AnimatePresence>
        {open && suggestions.length > 0 && (
          <motion.ul
            id={`${id}-list`}
            role="listbox"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.14 }}
            className="absolute left-0 right-0 top-[calc(100%+6px)] z-40 overflow-hidden rounded-[16px] border border-line bg-white p-1.5 shadow-lift"
          >
            {suggestions.map((city, i) => (
              <li key={city} role="option" aria-selected={i === active}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => pick(city)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-[11px] px-3 py-2.5 text-left text-[14.5px] font-semibold text-ink transition-colors",
                    i === active && "bg-brand-soft text-brand",
                  )}
                >
                  <MapPin className="h-4 w-4 shrink-0 opacity-60" />
                  {city}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

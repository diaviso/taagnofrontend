"use client";

import { useEffect, useState } from "react";

/** `true` quand la requête média correspond (ex. `(min-width: 640px)`). */
export function useMediaQuery(query: string, initial = false) {
  const [matches, setMatches] = useState(initial);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);
  return matches;
}

/** Valeur stockée dans le navigateur (favoris, recherches récentes). */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  useEffect(() => {
    const read = () => {
      try {
        const raw = window.localStorage.getItem(key);
        setValue(raw ? (JSON.parse(raw) as T) : initial);
      } catch {
        setValue(initial);
      }
    };
    read();
    const onChange = (e: Event) => {
      if (e instanceof StorageEvent && e.key !== key) return;
      if (e instanceof CustomEvent && e.detail !== key) return;
      read();
    };
    window.addEventListener("storage", onChange);
    window.addEventListener("taagno:storage", onChange);
    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener("taagno:storage", onChange);
    };
    // `initial` est une valeur par défaut figée.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = (next: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const v = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      try {
        window.localStorage.setItem(key, JSON.stringify(v));
      } catch {
        // stockage indisponible
      }
      setTimeout(() => window.dispatchEvent(new CustomEvent("taagno:storage", { detail: key })), 0);
      return v;
    });
  };
  return [value, update] as const;
}

/** Valeur retardée (recherche au fil de la frappe). */
export function useDebounced<T>(value: T, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

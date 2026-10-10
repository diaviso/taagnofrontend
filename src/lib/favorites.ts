"use client";

import { useLocalStorage } from "./hooks";

/** Favoris enregistrés dans le navigateur : clés `trip:<id>` et `offer:<id>` (comme les apps). */
export const tripKey = (id: string) => `trip:${id}`;
export const offerKey = (id: string) => `offer:${id}`;

/** Efface favoris et dernières recherches de cet appareil (suppression du compte, comme dans les apps). */
export function clearLocalData() {
  for (const key of ["taagno.favorites", "taagno.recentSearches"]) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // stockage indisponible
    }
    window.dispatchEvent(new CustomEvent("taagno:storage", { detail: key }));
  }
}

export function useFavorites() {
  const [list, setList] = useLocalStorage<string[]>("taagno.favorites", []);
  const has = (key: string) => list.includes(key);
  /** Ajoute ou retire ; renvoie `true` si l'élément est maintenant en favori. */
  const toggle = (key: string) => {
    const added = !list.includes(key);
    setList((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [key, ...prev]));
    return added;
  };
  const remove = (key: string) => setList((prev) => prev.filter((k) => k !== key));
  return { list, has, toggle, remove };
}

/** Dernières recherches de trajets (« Dakar → Touba »). */
export function useRecentSearches() {
  const [list, setList] = useLocalStorage<[string, string][]>("taagno.recentSearches", []);
  const push = (from: string, to: string) => {
    const f = from.trim();
    const t = to.trim();
    if (!f || !t) return;
    setList((prev) =>
      [[f, t] as [string, string], ...prev.filter(([a, b]) => a.toLowerCase() !== f.toLowerCase() || b.toLowerCase() !== t.toLowerCase())].slice(0, 6),
    );
  };
  const clear = () => setList([]);
  return { list, push, clear };
}

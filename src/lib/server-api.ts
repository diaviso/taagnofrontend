import "server-only";
import { API_URL } from "./site";

/** Lecture publique de l'API depuis le serveur (pages partageables, métadonnées). */
export async function serverFetch<T>(path: string, revalidate = 60): Promise<{ data: T | null; notFound: boolean }> {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      headers: { Accept: "application/json" },
      next: { revalidate },
    });
    if (response.status === 404) return { data: null, notFound: true };
    if (!response.ok) return { data: null, notFound: false };
    return { data: (await response.json()) as T, notFound: false };
  } catch {
    // Serveur injoignable : la page se charge côté navigateur (nouvel essai).
    return { data: null, notFound: false };
  }
}

export async function serverGet<T>(path: string, revalidate = 60): Promise<T | null> {
  return (await serverFetch<T>(path, revalidate)).data;
}

/** Identifiant d'URL plausible (évite d'interroger l'API pour n'importe quoi). */
export const isUuid = (id: string) => /^[0-9a-f-]{36}$/i.test(id);

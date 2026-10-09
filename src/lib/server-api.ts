import "server-only";
import { API_URL } from "./site";

/** Lecture publique de l'API depuis le serveur (pages partageables, métadonnées). */

export async function serverGet<T>(path: string, revalidate = 60): Promise<T | null> {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      headers: { Accept: "application/json" },
      next: { revalidate },
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

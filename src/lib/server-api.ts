import "server-only";

/** Lecture publique de l'API depuis le serveur (pages partageables, métadonnées). */

const API_URL = (process.env.API_URL || "https://web-production-c7eae.up.railway.app/api").replace(/\/$/, "");

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

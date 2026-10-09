/**
 * Client de l'API Taagno côté navigateur. Les requêtes partent vers `/api/...` sur le
 * site même (relayées par Next vers le backend, voir next.config.ts).
 */

const TOKEN_KEY = "taagno.token";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly code?: string,
  ) {
    super(message);
  }

  get isUnauthorized() {
    return this.status === 401;
  }

  get isNetwork() {
    return this.status === undefined;
  }
}

function defaultMessage(status: number) {
  if (status === 401) return "Session expirée. Reconnectez-vous.";
  if (status === 403) return "Action non autorisée.";
  if (status === 404) return "Élément introuvable.";
  if (status === 429) return "Trop de tentatives. Patientez un instant.";
  if (status >= 500) return "Le serveur rencontre un problème. Réessayez dans un instant.";
  return `Une erreur est survenue (${status}).`;
}

export const tokenStore = {
  get(): string | null {
    if (typeof window === "undefined") return null;
    try {
      return window.localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token: string | null) {
    try {
      if (token) window.localStorage.setItem(TOKEN_KEY, token);
      else window.localStorage.removeItem(TOKEN_KEY);
    } catch {
      // Stockage indisponible (navigation privée) : la session dure le temps de l'onglet.
    }
    window.dispatchEvent(new Event("taagno:token"));
  },
};

type Query = Record<string, string | number | boolean | null | undefined | (string | number)[]>;

function buildQuery(query?: Query) {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined || value === "") continue;
    if (Array.isArray(value)) {
      for (const v of value) params.append(key, String(v));
    } else {
      params.append(key, String(value));
    }
  }
  const s = params.toString();
  return s ? `?${s}` : "";
}

async function request<T>(method: string, path: string, body?: unknown, query?: Query): Promise<T> {
  const token = tokenStore.get();
  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;
  if (body !== undefined && !isForm) headers["Content-Type"] = "application/json";

  let response: Response;
  try {
    response = await fetch(`/api${path}${buildQuery(query)}`, {
      method,
      headers,
      body: body === undefined ? undefined : isForm ? (body as FormData) : JSON.stringify(body),
    });
  } catch {
    throw new ApiError("Impossible de joindre le serveur. Vérifiez votre connexion.");
  }

  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    let message: string | undefined;
    let code: string | undefined;
    if (data && typeof data === "object") {
      const m = (data as Record<string, unknown>).message;
      if (Array.isArray(m) && m.length) message = String(m[0]);
      else if (typeof m === "string") message = m;
      const c = (data as Record<string, unknown>).code;
      if (typeof c === "string" && c) code = c;
    }
    // Session expirée ou révoquée : retour à l'état visiteur.
    if (response.status === 401 && token) tokenStore.set(null);
    throw new ApiError(message ?? defaultMessage(response.status), response.status, code);
  }
  return data as T;
}

export const api = {
  get: <T>(path: string, query?: Query) => request<T>("GET", path, undefined, query),
  post: <T>(path: string, body?: unknown, query?: Query) => request<T>("POST", path, body ?? {}, query),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, body ?? {}),
  delete: <T>(path: string) => request<T>("DELETE", path),
};

/** Message lisible d'une erreur quelconque. */
export function errorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return "Une erreur est survenue.";
}

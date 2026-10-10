"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { api, tokenStore } from "./api";
import { isProfileComplete, type User } from "./types";

/** Session : jeton dans le navigateur + profil (`/auth/me`). Un seul compte pour tout le site. */

type AuthStatus = "loading" | "anonymous" | "authenticated";

interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  /** Ouvre une session avec le jeton reçu ; renvoie le profil. */
  signIn: (token: string) => Promise<User>;
  signOut: () => void;
  /** Recharge le profil (après modification). */
  refresh: () => Promise<User | null>;
  /** Ouvre la fenêtre de connexion ; `onDone` est appelé une fois connecté (profil complet). */
  requireAuth: (onDone?: () => void, reason?: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function subscribeToken(onChange: () => void) {
  window.addEventListener("taagno:token", onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener("taagno:token", onChange);
    window.removeEventListener("storage", onChange);
  };
}

const noopSubscribe = () => () => {};

interface AuthDialogState {
  open: boolean;
  reason?: string;
  onDone?: () => void;
}

const AuthDialogContext = createContext<{
  state: AuthDialogState;
  close: (completed: boolean) => void;
} | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  // Jeton lu dans le navigateur (et suivi entre onglets) ; `ready` une fois hydraté.
  const token = useSyncExternalStore(subscribeToken, tokenStore.get, () => null);
  const ready = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const [dialog, setDialog] = useState<AuthDialogState>({ open: false });

  // Session terminée (déconnexion, jeton expiré) : les données du compte quittent le cache.
  const [lastToken, setLastToken] = useState(token);
  if (token !== lastToken) {
    setLastToken(token);
    if (lastToken && !token) queryClient.clear();
  }

  const me = useQuery({
    queryKey: ["me", token],
    queryFn: () => api.get<User>("/auth/me"),
    enabled: !!token,
    staleTime: 60_000,
    retry: false,
  });

  const user = token ? (me.data ?? null) : null;
  const status: AuthStatus = !ready || (token && me.isPending) ? "loading" : user ? "authenticated" : "anonymous";

  const signIn = useCallback(
    async (newToken: string) => {
      tokenStore.set(newToken);
      const profile = await queryClient.fetchQuery({
        queryKey: ["me", newToken],
        queryFn: () => api.get<User>("/auth/me"),
      });
      return profile;
    },
    [queryClient],
  );

  const signOut = useCallback(() => {
    tokenStore.set(null);
    queryClient.clear();
  }, [queryClient]);

  const refresh = useCallback(async () => {
    if (!tokenStore.get()) return null;
    const result = await me.refetch();
    return result.data ?? null;
  }, [me]);

  const requireAuth = useCallback(
    (onDone?: () => void, reason?: string) => {
      if (user && isProfileComplete(user)) {
        onDone?.();
        return;
      }
      setDialog({ open: true, onDone, reason });
    },
    [user],
  );

  const close = useCallback(
    (completed: boolean) => {
      const done = dialog.onDone;
      setDialog({ open: false });
      if (completed) setTimeout(() => done?.(), 50);
    },
    [dialog.onDone],
  );

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, signIn, signOut, refresh, requireAuth }),
    [status, user, signIn, signOut, refresh, requireAuth],
  );

  return (
    <AuthContext.Provider value={value}>
      <AuthDialogContext.Provider value={{ state: dialog, close }}>{children}</AuthDialogContext.Provider>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth hors de AuthProvider");
  return ctx;
}

export function useAuthDialog() {
  const ctx = useContext(AuthDialogContext);
  if (!ctx) throw new Error("useAuthDialog hors de AuthProvider");
  return ctx;
}

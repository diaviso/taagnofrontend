"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { User, Role, UserMode } from "@/types";
import { authService, usersService } from "@/lib/services";
import { getAuthToken, removeAuthToken } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  userMode: UserMode | null;
  isVoyageur: boolean;
  isProprietaire: boolean;
  needsOnboarding: boolean;
  setUserMode: (mode: UserMode) => Promise<void>;
  logout: () => void;
  refetch: () => Promise<{ data?: User | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [isReady, setIsReady] = useState(false);

  const { data: user, isLoading, refetch } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: authService.getMe,
    enabled: isReady && !!getAuthToken(),
    retry: false,
  });

  const updateModeMutation = useMutation({
    mutationFn: usersService.updateUserMode,
    onSuccess: (updatedUser) => {
      // Le backend renvoie l'utilisateur complet (sanitizé) : on met à jour le
      // cache directement plutôt que d'invalider, pour que le nouveau mode soit
      // reflété immédiatement (évite une redirection parasite post-onboarding).
      queryClient.setQueryData(["auth", "me"], updatedUser);
    },
  });

  useEffect(() => {
    setIsReady(true);
  }, []);

  const logout = () => {
    removeAuthToken();
    queryClient.clear();
    window.location.href = "/login";
  };

  const setUserMode = async (mode: UserMode) => {
    await updateModeMutation.mutateAsync(mode);
  };

  const userMode = user?.userMode ?? null;

  const value: AuthContextType = {
    user: user ?? null,
    isLoading: !isReady || isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === Role.ADMIN,
    userMode,
    isVoyageur: userMode === UserMode.VOYAGEUR,
    isProprietaire: userMode === UserMode.PROPRIETAIRE,
    // Le profil doit être complet : nom (prénom + nom) ET mode.
    // Ne pas se baser uniquement sur le mode, sinon un compte avec un mode mais
    // sans nom (ex. inscription téléphone) ne serait jamais invité à le compléter.
    needsOnboarding: !!user && (!user.firstName || !user.lastName || !user.userMode),
    setUserMode,
    logout,
    refetch,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

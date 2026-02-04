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
  refetch: () => void;
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
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
    needsOnboarding: !!user && !user.userMode,
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

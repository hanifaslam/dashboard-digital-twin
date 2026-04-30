"use client";

import { AuthService } from "@/service/auth-service";
import { MeResponse } from "@/types/response/auth-response";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useMemo } from "react";

export const AUTH_QUERY_KEY = ["me"] as const;

interface AuthContextValue {
  user: MeResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  refetch: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuthQuery() {
  return useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async () => {
      const response = await AuthService.me();
      return response;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useAuthValue(): AuthContextValue {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useAuthQuery();

  const logout = useCallback(async () => {
    try {
      await AuthService.logout();
    } finally {
      queryClient.setQueryData(AUTH_QUERY_KEY, null);
      queryClient.removeQueries({ queryKey: AUTH_QUERY_KEY });
    }
  }, [queryClient]);

  const handleRefetch = useCallback(() => {
    refetch();
  }, [refetch]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: isError ? null : (data ?? null),
      isLoading,
      isAuthenticated: !isError && !!data,
      logout,
      refetch: handleRefetch,
    }),
    [data, isLoading, isError, logout, handleRefetch],
  );

  return value;
}

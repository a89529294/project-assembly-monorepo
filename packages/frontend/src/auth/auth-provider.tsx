import * as React from "react";
import { AuthContext } from ".";

import { FullScreenSpinner } from "@/components/full-screen-spinner";
import { sessionTokenKey } from "@/constants";
import { trpc } from "@/trpc";
import { useMutation, useQuery } from "@tanstack/react-query";
import { User } from "../../../backend/src/trpc/router";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Single source of truth for auth state
  const [authState, setAuthState] = React.useState<{
    isAuthenticated: boolean;
    user: User | null;
    sessionToken: string | null;
    isLoading: boolean;
  }>(() => {
    // Initialize from localStorage on mount
    const sessionToken = localStorage.getItem(sessionTokenKey);

    // No session token = not authenticated
    if (!sessionToken) {
      return {
        isAuthenticated: false,
        user: null,
        sessionToken: null,
        isLoading: false,
      };
    }

    // Found session token - will validate on mount
    return {
      isAuthenticated: false, // Start with false until validated
      user: null, // Start with null until user data is fetched
      sessionToken,
      isLoading: true, // Show loading state while validating
    };
  });

  // Session validation query
  const validateSessionQuery = useQuery({
    ...trpc.auth.validateSession.queryOptions(),
    enabled: !!authState.sessionToken,
    retry: false,
    staleTime: Infinity,
  });

  // Handle session validation results
  React.useEffect(() => {
    if (validateSessionQuery.isFetching) return;

    if (validateSessionQuery.data) {
      // Session is valid, update user data
      setAuthState((prev) => ({
        ...prev,
        isAuthenticated: true,
        user: validateSessionQuery.data,
        isLoading: false,
      }));
    } else {
      // Session validation failed - clear everything
      localStorage.removeItem(sessionTokenKey);
      setAuthState({
        isAuthenticated: false,
        user: null,
        sessionToken: null,
        isLoading: false,
      });
    }
  }, [validateSessionQuery.data, validateSessionQuery.isFetching]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: trpc.auth.login.mutationOptions().mutationFn,
    onSuccess: (data) => {
      // Update localStorage - only store session token
      localStorage.setItem(sessionTokenKey, data.sessionToken);

      // Update state
      setAuthState({
        isAuthenticated: true,
        user: data.user,
        sessionToken: data.sessionToken,
        isLoading: false,
      });
    },
  });

  // Login handler
  const login = React.useCallback(
    async (account: string, password: string) => {
      try {
        await loginMutation.mutateAsync({ account, password });
      } catch (e) {
        console.error("Login failed:", e);
        throw e;
      }
    },
    [loginMutation]
  );

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: trpc.auth.logout.mutationOptions().mutationFn,
  });

  // Logout handler
  const logout = React.useCallback(async () => {
    try {
      // Try server logout but continue even if it fails
      await logoutMutation.mutateAsync().catch(() => {});
    } finally {
      // Always clear local state
      localStorage.removeItem(sessionTokenKey);

      // Update state immediately
      setAuthState({
        isAuthenticated: false,
        user: null,
        sessionToken: null,
        isLoading: false,
      });
    }
  }, [logoutMutation]);

  // Simple clearAuth function
  const clearAuth = React.useCallback(() => {
    localStorage.removeItem(sessionTokenKey);
    
    setAuthState({
      isAuthenticated: false,
      user: null,
      sessionToken: null,
      isLoading: false,
    });
  }, []);

  // Show loading spinner during initial auth check
  if (authState.isLoading) {
    return <FullScreenSpinner />;
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: authState.isAuthenticated,
        user: authState.user,
        sessionToken: authState.sessionToken,
        login,
        logout,
        clearAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

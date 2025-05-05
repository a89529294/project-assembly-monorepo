import * as React from "react";
import { AuthContext } from ".";

import { sessionTokenKey, userKey } from "@/constants";
import { trpc } from "@/trpc";
import { useMutation } from "@tanstack/react-query";
import { User } from "../../../backend/src/trpc/router";

type StoredAuth = {
  user: User;
  sessionToken: string;
};

function getStoredAuth() {
  if (
    !localStorage.getItem(userKey) ||
    !localStorage.getItem(sessionTokenKey)
  ) {
    // if (import.meta.env.PROD) {
    localStorage.removeItem(userKey);
    localStorage.removeItem(sessionTokenKey);
    // }
    return null;
  }

  const userFromLocalStorage = JSON.parse(
    localStorage.getItem(userKey)!
  ) as User;

  return {
    user: userFromLocalStorage,
    sessionToken: localStorage.getItem(sessionTokenKey)!,
  };
}

function setStoredAuth(storedAuth: StoredAuth | null) {
  if (storedAuth) {
    localStorage.setItem(userKey, JSON.stringify(storedAuth.user));
    localStorage.setItem(sessionTokenKey, storedAuth.sessionToken);
  } else {
    // if (import.meta.env.PROD) {
    localStorage.removeItem(userKey);
    localStorage.removeItem(sessionTokenKey);
    // }
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = React.useState<StoredAuth | null>(() =>
    getStoredAuth()
  );
  const isAuthenticated = !!auth;
  const { mutateAsync: trcpLogin } = useMutation(
    trpc.auth.login.mutationOptions()
  );

  const { mutateAsync: trpcLogout } = useMutation(
    trpc.auth.logout.mutationOptions()
  );

  const clearAuth = React.useCallback(() => {
    setStoredAuth(null);
    setAuth(null);
  }, []);

  const logout = React.useCallback(
    async (cb: () => void) => {
      try {
        await trpcLogout();
      } finally {
        setStoredAuth(null);
        setAuth(null);
        cb();
      }
    },
    [trpcLogout]
  );

  const login: AuthContext["login"] = React.useCallback(
    async (account, password, onSuccess, onError) => {
      try {
        const data = await trcpLogin({ account: account, password: password });
        setAuth({
          sessionToken: data.sessionToken,
          user: data.user,
        });
        setStoredAuth({
          sessionToken: data.sessionToken,
          user: data.user,
        });
        onSuccess();
      } catch (e) {
        console.error(e);
        if (onError) onError();
      }
    },
    [trcpLogin]
  );

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        sessionToken: auth?.sessionToken ?? null,
        user: auth?.user ?? null,
        login,
        logout,
        clearAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

import React from "react";
import { User } from "../../../backend/src/trpc/router";

export interface AuthContext {
  isAuthenticated: boolean;
  sessionToken: string | null;
  user: User | null;
  logout: (onSuccess: () => void, onError?: () => void) => Promise<void>;
  login: (account: string, password: string) => Promise<void>;
  clearAuth: () => void;
}

export const AuthContext = React.createContext<AuthContext | null>(null);

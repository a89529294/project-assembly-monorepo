import React from "react";
import { User } from "../../../backend/src/trpc/router";

export interface AuthContext {
  isAuthenticated: boolean;
  sessionToken: string | null;
  user: User | null;
  logout: () => Promise<void>;
  login: (account: string, password: string) => Promise<void>;
  clearAuth: () => void;
}

export const AuthContext = React.createContext<AuthContext | null>(null);

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

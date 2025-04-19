import React from "react";
import { TrpcTypes } from "../../../backend/src/trpc/router";

export interface AuthContext {
  isAuthenticated: boolean;
  sessionToken: string | null;
  user: TrpcTypes["User"] | null;
  logout: (onSuccess: () => void, onError?: () => void) => Promise<void>;
  login: (
    account: string,
    password: string,
    onSuccess: () => void,
    onError?: () => void
  ) => Promise<void>;
  me: () => Promise<void>;
}

export const AuthContext = React.createContext<AuthContext | null>(null);

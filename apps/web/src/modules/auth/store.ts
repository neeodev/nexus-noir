"use client";

import { createContext, useContext } from "react";
import type { AuthUser, Badge } from "./api";

export type AuthStatus = "loading" | "authenticated" | "guest";

export type AuthStore = {
  user: AuthUser | null;
  status: AuthStatus;
  fetchUser: () => Promise<void>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) => Promise<Badge[]>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthStore>({
  user: null,
  status: "loading",
  fetchUser: async () => {},
  register: async () => [],
  login: async () => {},
  logout: async () => {},
});

export function useAuthContext(): AuthStore {
  return useContext(AuthContext);
}

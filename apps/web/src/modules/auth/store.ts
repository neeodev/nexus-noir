"use client";

import { create } from "zustand";
import { type AuthUser, authApi } from "./api";

type AuthStatus = "loading" | "authenticated" | "guest";

type AuthState = {
  user: AuthUser | null;
  status: AuthStatus;
  fetchUser: () => Promise<void>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: "loading",

  async fetchUser() {
    const user = await authApi.me();
    set({ user, status: user ? "authenticated" : "guest" });
  },

  async register(payload) {
    const user = await authApi.register(payload);
    set({ user, status: "authenticated" });
  },

  async login(email, password) {
    const user = await authApi.login(email, password);
    set({ user, status: "authenticated" });
  },

  async logout() {
    await authApi.logout();
    set({ user: null, status: "guest" });
  },
}));

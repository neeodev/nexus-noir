/**
 * Client auth Nexus Noir (mode SPA Sanctum).
 *
 * S'appuie sur le client HTTP partagé : cookies de session HTTP-only,
 * aucun token stocké en JS.
 */

import { apiGet, apiSend, ApiError } from "@/lib/http";

export { ApiError };

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  roleLabel: string;
  permissions: string[];
  emailVerifiedAt: string | null;
  createdAt: string | null;
};

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
};

type Wrapped<T> = { data: T };

export const authApi = {
  async register(payload: RegisterPayload): Promise<AuthUser> {
    const res = await apiSend<Wrapped<AuthUser>>("/auth/register", "POST", payload);
    return res.data;
  },

  async login(email: string, password: string): Promise<AuthUser> {
    const res = await apiSend<Wrapped<AuthUser>>("/auth/login", "POST", { email, password });
    return res.data;
  },

  async logout(): Promise<void> {
    await apiSend<unknown>("/auth/logout", "POST");
  },

  async me(): Promise<AuthUser | null> {
    try {
      const res = await apiGet<Wrapped<AuthUser>>("/auth/user");
      return res.data;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        return null;
      }
      throw error;
    }
  },
};

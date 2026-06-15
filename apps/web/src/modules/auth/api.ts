/**
 * Client auth Nexus Noir (mode SPA Sanctum).
 *
 * S'appuie sur le client HTTP partagé : cookies de session HTTP-only,
 * aucun token stocké en JS.
 */

import { apiGet, apiSend, ApiError } from "@/lib/http";

export { ApiError };

export type Badge = {
  id: number;
  slug: string;
  name: string;
  description: string;
  icon: string;
  rarity: string;
  rarityLabel: string;
  rarityColor: string;
  conditionType: string;
  conditionValue: number | null;
  conditionMeta: Record<string, unknown> | null;
  isActive: boolean;
  sortOrder: number;
  awardedAt?: string | null;
};

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
  async register(payload: RegisterPayload): Promise<{ user: AuthUser; newBadges: Badge[] }> {
    const res = await apiSend<{ data: AuthUser; newBadges: Badge[] }>("/auth/register", "POST", payload);
    return { user: res.data, newBadges: res.newBadges };
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

  async updateProfile(payload: { name: string; email: string }): Promise<AuthUser> {
    const res = await apiSend<Wrapped<AuthUser>>("/auth/profile", "PATCH", payload);
    return res.data;
  },

  async updatePassword(payload: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }): Promise<void> {
    await apiSend<unknown>("/auth/password", "PATCH", payload);
  },

  async readings(): Promise<import("@/lib/api").StoryListItem[]> {
    const res = await apiGet<{ data: import("@/lib/api").StoryListItem[] }>("/auth/readings");
    return res.data;
  },

  async myBadges(): Promise<Badge[]> {
    const res = await apiGet<{ data: Badge[] }>("/auth/badges");
    return res.data;
  },

  async redeemCode(code: string): Promise<{ awarded: Badge[]; count: number }> {
    const res = await apiSend<{ awarded: Badge[]; count: number }>(
      "/auth/badges/redeem",
      "POST",
      { code }
    );
    return res;
  },
};
